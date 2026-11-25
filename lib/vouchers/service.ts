import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as pdf from 'pdf-lib';
import Stripe from 'stripe';
import { isVoucherSeasonOpen, voucherShopPath } from './storefront';
import { staffServiceClient } from '@/lib/staffAuth';
import { sendTransactionalEmail } from '@/lib/addToAudience';
import { voucherDocument } from './document.mjs';
import { voucherEmail, issueInvoice } from './fulfillment.mjs';

export const publicOrigin = 'https://www.crowndental.hu';

export function salesReady() {
  return isVoucherSeasonOpen() && process.env.VOUCHER_SALES_ENABLED === 'true' && processingReady();
}
export function processingReady() {
  return (
    /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY || '') &&
    process.env.STRIPE_VOUCHER_WEBHOOK_SECRET?.startsWith('whsec_') &&
    process.env.RESEND_API_KEY &&
    process.env.SZAMLAZZ_AGENT_KEY &&
    ['TAM', 'AAM'].includes(process.env.VOUCHER_VAT_CODE || '') &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
export const stripeClient = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    maxNetworkRetries: 1,
    timeout: 10000,
  });
type StoredOrder = {
  id: string;
  issued_at: string;
  amount: number;
  code: string;
  expiry: string;
  delivery: string;
  pickup_from: string | null;
  refunded: boolean;
  billing: object;
  recipient_name?: string | null;
  paymentMethod?: string;
};
export async function renderDocument(order: StoredOrder) {
  const template = await readFile(
    path.join(
      process.cwd(),
      'prototypes/karacsonyi-utalvanyok/teli-mese-a5.pdf',
    ),
  );
  return voucherDocument(
    pdf,
    template,
    { ...order, issuedAt: order.issued_at, recipientName: order.recipient_name },
    false,
  );
}
async function runJob(order: StoredOrder, kind: 'resend' | 'invoice') {
  const db = staffServiceClient();
  const claim = randomUUID();
  const result = await db.rpc('voucher_claim', {
    p_order: order.id,
    p_kind: kind,
    p_claim: claim,
  });
  if (result.error) throw new Error('voucher_job_storage');
  if (!result.data) {
    const { data, error } = await db
      .from('voucher_jobs')
      .select('state')
      .eq('order_id', order.id)
      .eq('kind', kind)
      .single();
    if (error || !['review', 'done'].includes(data?.state))
      throw new Error('voucher_job_busy');
    return;
  }
  let providerId: string | null = null,
    state = 'done',
    issue: string | null = null;
  try {
    if (kind === 'invoice')
      providerId = await issueInvoice(
        order,
        process.env.SZAMLAZZ_AGENT_KEY,
        process.env.VOUCHER_VAT_CODE,
      );
    else {
      const email = await voucherEmail(order, renderDocument);
      const sent = await sendTransactionalEmail(
        email,
        'voucher/v1/' + order.id,
      );
      if (!sent.ok || !sent.providerId)
        throw new Error(sent.error || 'provider_unconfirmed');
      providerId = sent.providerId;
    }
  } catch (e) {
    issue = kind === 'invoice' ? 'verify_invoice' : 'verify_email';
    const transient =
      e instanceof Error &&
      /^(provider_unavailable|provider_unconfirmed|provider_429|provider_5\d\d)$/.test(
        e.message,
      );
    state = kind === 'resend' && transient ? 'pending' : 'review';
  }
  const saved = await db
    .from('voucher_jobs')
    .update({
      state,
      provider_id: providerId,
      issue,
      claim: null,
      lease_until: null,
    })
    .eq('order_id', order.id)
    .eq('kind', kind)
    .eq('claim', claim)
    .select('state')
    .maybeSingle();
  if (!saved.error && !saved.data && providerId) {
    // A refund can move an in-flight job to manual review while the provider
    // is responding. Keep its receipt without reopening the job or the voucher.
    const receipt = await db
      .from('voucher_jobs')
      .update({ provider_id: providerId })
      .eq('order_id', order.id)
      .eq('kind', kind)
      .eq('state', 'review')
      .eq('issue', 'refund_review')
      .is('provider_id', null)
      .select('state')
      .maybeSingle();
    if (!receipt.error && receipt.data) return;
  }
  if (saved.error || !saved.data || state === 'pending')
    throw new Error('voucher_job_retry');
}
async function orderForSession(
  db: ReturnType<typeof staffServiceClient>,
  session: Stripe.Checkout.Session,
) {
  const { data, error } = await db
    .from('voucher_orders')
    .select('id,amount,billing')
    .eq('session_id', session.id)
    .maybeSingle();
  if (error) throw new Error('voucher_order_retry');
  // Only the unique session ID stored by our checkout endpoint identifies an order.
  // Our return URL also lets Stripe retry a notification that arrived before that write.
  if (
    !data &&
    (session.success_url === publicOrigin + voucherShopPath('hu') + '?visszateres=1' ||
      session.success_url === publicOrigin + voucherShopPath('sk') + '?visszateres=1' ||
      session.metadata?.source === 'crown-voucher')
  )
    throw new Error('voucher_session_not_attached');
  return data;
}
export async function handlePayment(stripe: Stripe, event: Stripe.Event) {
  const db = staffServiceClient();
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    if (!charge.amount_refunded || typeof charge.payment_intent !== 'string')
      return;
    const known = await db
      .from('voucher_orders')
      .select('id')
      .eq('payment_id', charge.payment_intent)
      .maybeSingle();
    if (known.error) throw new Error('voucher_refund_retry');
    if (!known.data) {
      // Refund notifications can arrive before the paid notification has saved the PaymentIntent.
      const linked = await stripe.checkout.sessions.list({
        payment_intent: charge.payment_intent,
        limit: 1,
      });
      const session = linked.data[0];
      if (!session || !(await orderForSession(db, session))) return;
    }
    const saved = await db.rpc('voucher_refund', {
      p_payment: charge.payment_intent,
    });
    if (saved.error) throw new Error('voucher_refund_retry');
    return;
  }
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  )
    return;
  const order = await orderForSession(db, event.data.object);
  if (!order) return;
  const s = await stripe.checkout.sessions.retrieve(event.data.object.id, {
    expand: ['payment_intent.latest_charge'],
  });
  const payment = s.payment_intent;
  if (s.payment_status !== 'paid') return;
  if (
    !s.livemode ||
    s.mode !== 'payment' ||
    s.currency !== 'huf' ||
    s.id !== event.data.object.id ||
    s.amount_total !== order.amount * 100 ||
    !payment ||
    typeof payment === 'string' ||
    typeof payment.latest_charge !== 'object' ||
    !payment.latest_charge ||
    payment.status !== 'succeeded' ||
    !payment.latest_charge.paid ||
    payment.currency !== 'huf' ||
    payment.latest_charge.currency !== 'huf' ||
    payment.amount_received !== s.amount_total ||
    payment.latest_charge.amount_captured !== s.amount_total ||
    !s.amount_total
  )
    throw new Error('voucher_payment_mismatch');
  if (payment.latest_charge.amount_refunded > 0) {
    if ((await db.rpc('voucher_refund', { p_payment: payment.id })).error)
      throw new Error('voucher_refund_retry');
  }
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from(randomBytes(20), (byte) => alphabet[byte % 32]).join(
    '',
  );
  // Older sessions collected the invoice address at Stripe. New orders save it before redirect.
  const legacy = s.customer_details;
  const billing =
    order.billing ??
    (legacy && {
      name: legacy.name,
      email: legacy.email,
      individual_name: legacy.individual_name,
      business_name: legacy.business_name,
      address: legacy.address,
      tax_ids: legacy.tax_ids,
    });
  if (!billing) throw new Error('voucher_billing_missing');
  const issued = await db.rpc('voucher_issue', {
    p_order: order.id,
    p_session: s.id,
    p_amount: s.amount_total / 100,
    p_payment: payment.id,
    p_code: code,
    p_paid_at: new Date(payment.latest_charge.created * 1000).toISOString(),
    p_billing: billing,
  });
  if (issued.error) throw new Error('voucher_issue_retry');
  if (!issued.data) return;
  const { data, error } = await db
    .from('voucher_orders')
    .select('*')
    .eq('id', order.id)
    .single();
  if (error || !data) throw new Error('voucher_order_retry');
  const jobs = await Promise.allSettled([
    runJob(
      {
        ...data,
        paymentMethod:
          payment.latest_charge.payment_method_details?.type ?? 'other',
      } as StoredOrder,
      'invoice',
    ),
    runJob(data as StoredOrder, 'resend'),
  ]);
  if (jobs.some((job) => job.status === 'rejected'))
    throw new Error('voucher_jobs_retry');
}
