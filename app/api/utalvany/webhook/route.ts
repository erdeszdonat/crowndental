import type Stripe from 'stripe';
import {
  handlePayment,
  processingReady,
  stripeClient,
} from '@/lib/vouchers/service';
export const maxDuration = 60;
export async function POST(req: Request) {
  if (!processingReady()) return new Response(null, { status: 503 });
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get('stripe-signature') || '',
      process.env.STRIPE_VOUCHER_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!event.livemode || event.account)
    return new Response(null, { status: 400 });
  try {
    await handlePayment(stripe, event);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
