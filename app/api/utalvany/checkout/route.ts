import { staffServiceClient } from '@/lib/staffAuth';
import { enforceRateLimit, noStoreJson } from '@/lib/serverSecurity';
import { isDeepStrictEqual } from 'node:util';
import { isVoucherAmount } from '@/lib/vouchers/amount';
import { voucherShopPath } from '@/lib/vouchers/storefront';
import { parseVoucherBilling, voucherValidationMessage } from '@/lib/vouchers/billing.mjs';
import voucher from '@/prototypes/karacsonyi-utalvanyok/voucher';
import {
  salesReady,
  publicOrigin,
  stripeClient,
} from '@/lib/vouchers/service';

export async function POST(req: Request) {
  if (!salesReady()) return noStoreJson({}, { status: 404 });
  if (
    req.headers.get('origin') !== publicOrigin ||
    req.headers.get('host') !== new URL(publicOrigin).host
  )
    return noStoreJson({}, { status: 403 });
  const rateLimit = await enforceRateLimit(req, 'voucher-checkout', {
    limit: 12,
    windowMs: 10 * 60_000,
  });
  if (rateLimit) return rateLimit;
  const input = await req.json().catch(() => null);
  const { amount, delivery, attempt } = input ?? {};
  if (
    !isVoucherAmount(amount) ||
    !['pickup', 'email'].includes(delivery) ||
    typeof attempt !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      attempt,
    )
  )
    return noStoreJson({}, { status: 400 });
  const locale = input.locale === 'sk' ? 'sk' : 'hu';
  const voucherPath = voucherShopPath(locale);
  let billing, recipientName;
  try {
    billing = parseVoucherBilling(input.billing);
    recipientName = voucher.recipientName(input.recipientName) || null;
  } catch (error) {
    return noStoreJson(
      {
        error: voucherValidationMessage(error, locale),
      },
      { status: 400 },
    );
  }
  try {
    const db = staffServiceClient(),
      stripe = stripeClient();
    const insert = await db
      .from('voucher_orders')
      .upsert(
        { id: attempt, amount, delivery, billing, recipient_name: recipientName },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    if (insert.error) throw new Error('voucher_create');
    const stored = await db
      .from('voucher_orders')
      .select('amount,delivery,billing,recipient_name,session_id,created_at')
      .eq('id', attempt)
      .single();
    if (!stored.data || stored.error) throw new Error('voucher_read');
    const order = stored.data;
    if (
      order.amount !== amount ||
      order.delivery !== delivery ||
      order.recipient_name !== recipientName ||
      !isDeepStrictEqual(order.billing, billing) ||
      Date.now() - Date.parse(order.created_at) > 23 * 3600000
    )
      return noStoreJson({}, { status: 409 });
    const session = order.session_id
      ? await stripe.checkout.sessions.retrieve(order.session_id)
      : await stripe.checkout.sessions.create(
          {
            mode: 'payment',
            ui_mode: 'hosted_page',
            locale,
            branding_settings: {
              display_name: 'Crown Dental',
              logo: { type: 'url', url: publicOrigin + '/brand/crown-dental.jpg' },
              icon: { type: 'url', url: publicOrigin + '/brand/crown-dental.jpg' },
              button_color: '#174d40',
            },
            billing_address_collection: 'auto',
            phone_number_collection: { enabled: false },
            automatic_tax: { enabled: false },
            allow_promotion_codes: false,
            submit_type: 'auto',
            integration_identifier: 'hosted_web_0001',
            origin_context: 'web',
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: 'huf',
                  unit_amount: amount * 100,
                  product_data: { name: 'Crown Dental ajándékutalvány' },
                },
              },
            ],
            success_url: publicOrigin + voucherPath + '?visszateres=1',
            cancel_url: publicOrigin + voucherPath,
          },
          { idempotencyKey: 'voucher-buy/' + attempt },
        );
    if (!session.livemode || !session.id.startsWith('cs_live_'))
      throw new Error('voucher_session');
    if (!order.session_id) {
      const saved = await db
        .from('voucher_orders')
        .update({ session_id: session.id })
        .eq('id', attempt)
        .is('session_id', null)
        .select('session_id')
        .maybeSingle();
      if (saved.error) throw new Error('voucher_attach');
      if (!saved.data) {
        const current = await db
          .from('voucher_orders')
          .select('session_id')
          .eq('id', attempt)
          .single();
        if (current.error || current.data?.session_id !== session.id)
          throw new Error('voucher_session_conflict');
      }
    }
    if (session.status === 'complete')
      return noStoreJson({
        url: publicOrigin + voucherPath + '?visszateres=1', receipt: session.id,
      });
    if (session.status !== 'open' || !session.url)
      return noStoreJson({}, { status: 409 });
    return noStoreJson({ url: session.url, receipt: session.id });
  } catch {
    return noStoreJson({}, { status: 503 });
  }
}
