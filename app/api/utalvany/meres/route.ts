import { createHash } from 'node:crypto';
import { enforceRateLimit, noStoreJson } from '@/lib/serverSecurity';
import { staffServiceClient } from '@/lib/staffAuth';
import { publicOrigin } from '@/lib/vouchers/service';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== publicOrigin || request.headers.get('host') !== new URL(publicOrigin).host)
    return noStoreJson({}, { status: 403 });
  const { receipt } = await request.json().catch(() => null) ?? {};
  if (typeof receipt !== 'string' || !/^cs_live_[A-Za-z0-9]{12,200}$/.test(receipt))
    return noStoreJson({}, { status: 400 });
  const limited = await enforceRateLimit(request, 'voucher-measurement', { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  try {
    // issued_at is set by the verified Stripe webhook only after payment.
    const { data, error } = await staffServiceClient().from('voucher_orders').select('amount')
      .eq('session_id', receipt).not('issued_at', 'is', null).eq('refunded', false).maybeSingle();
    if (error) return noStoreJson({}, { status: 503 });
    if (!data) return noStoreJson({}, { status: 202 });
    const transaction = createHash('sha256').update('voucher-analytics:' + receipt).digest('hex').slice(0, 32);
    return noStoreJson({ value: data.amount, transaction });
  } catch {
    return noStoreJson({}, { status: 503 });
  }
}
