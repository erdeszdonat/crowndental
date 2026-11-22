import {
  authorizeStaff,
  requireStaffOrigin,
  staffServiceClient,
} from '@/lib/staffAuth';
import { noStoreJson } from '@/lib/serverSecurity';
import { renderDocument } from '@/lib/vouchers/service';
import layout from '@/prototypes/karacsonyi-utalvanyok/voucher';

export async function POST(request: Request) {
  const origin = requireStaffOrigin(request);
  if (origin) return origin;
  const access = await authorizeStaff(request, 'assistant');
  if (access.error) return access.error;
  if (!access.context.id) return noStoreJson({}, { status: 403 });
  const input = await request.json().catch(() => null);
  const byCode = input?.action === 'lookup' || input?.action === 'redeem';
  if (access.context.role !== 'admin' && !byCode) return noStoreJson({}, { status: 403 });
  try {
    const db = staffServiceClient();
    if (input?.action === 'list') {
      const page = Number(input.page ?? 0);
      if (!Number.isSafeInteger(page) || page < 0 || page > 1000000)
        return noStoreJson({}, { status: 400 });
      const result = await db
        .from('voucher_orders')
        .select(
          'id,amount,delivery,issued_at,expiry,pickup_from,refunded,collected_at,redeemed_at,voucher_jobs(kind,state,issue,provider_id)',
        )
        .not('payment_id', 'is', null)
        .order('created_at', { ascending: false })
        .order('id')
        .range(page * 30, page * 30 + 29);
      if (result.error) throw new Error();
      return noStoreJson({ orders: result.data });
    }
    if (
      !['print', 'collect', 'lookup', 'redeem', 'delivery'].includes(
        input?.action,
      )
    )
      return noStoreJson({}, { status: 400 });
    const value = byCode
      ? String(input.code || '')
          .toUpperCase()
          .replace(/[\s-]/g, '')
      : String(input.id || '');
    if (
      byCode
        ? !/^[A-HJ-NP-Z2-9]{20}$/.test(value)
        : !/^[a-f\d-]{36}$/i.test(value)
    )
      return noStoreJson({}, { status: 400 });
    const { data: order, error } = await db
      .from('voucher_orders')
      .select('*')
      .eq(byCode ? 'code' : 'id', value)
      .maybeSingle();
    if (error) throw new Error();
    if (!order?.code) return noStoreJson({}, { status: 404 });
    if (input.action === 'delivery') {
      const job = await db
        .from('voucher_jobs')
        .select('provider_id')
        .eq('order_id', order.id)
        .eq('kind', 'resend')
        .single();
      if (job.error || !job.data?.provider_id || !process.env.RESEND_API_KEY)
        return noStoreJson({}, { status: 409 });
      const response = await fetch(
        'https://api.resend.com/emails/' +
          encodeURIComponent(job.data.provider_id),
        {
          headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
          cache: 'no-store',
          redirect: 'error',
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) throw new Error();
      const sent = await response.json();
      if (
        sent.id !== job.data.provider_id ||
        typeof sent.last_event !== 'string'
      )
        throw new Error();
      return noStoreJson({ status: sent.last_event });
    }
    if (input.action === 'lookup')
      return noStoreJson({
        amount: order.amount,
        expiry: order.expiry,
        usable:
          !order.refunded &&
          !order.redeemed_at &&
          layout.day(Date.now()) <= order.expiry,
      });
    if (input.action === 'print') {
      if (
        order.delivery !== 'pickup' ||
        order.refunded ||
        order.redeemed_at ||
        order.collected_at ||
        layout.day(Date.now()) > order.expiry
      )
        return noStoreJson({}, { status: 409 });
      const pdf = await renderDocument(order);
      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Crown-Dental-A5.pdf"',
          'Cache-Control': 'private, no-store',
        },
      });
    }
    const saved = await db.rpc('voucher_staff_action', {
      p_order: order.id,
      p_actor: access.context.id,
      p_action: input.action,
    });
    if (saved.error) throw new Error();
    return noStoreJson(
      { changed: saved.data },
      { status: saved.data ? 200 : 409 },
    );
  } catch {
    return noStoreJson({}, { status: 503 });
  }
}
