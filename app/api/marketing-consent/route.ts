import { NextResponse } from 'next/server';
import { upsertMarketingSubscriber } from '@/lib/marketingSubscribers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, nickname, phone, clinic, source, locale } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!EMAIL_RE.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Érvényes e-mail cím szükséges a feliratkozáshoz.' }, { status: 400 });
    }

    const result = await upsertMarketingSubscriber({
      email: normalizedEmail,
      name: typeof name === 'string' ? name : '',
      nickname: typeof nickname === 'string' ? nickname : '',
      phone: typeof phone === 'string' ? phone : '',
      clinic: typeof clinic === 'string' ? clinic : '',
      source: source || 'booking_success_page',
      locale: locale || 'hu',
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'Nem sikerült rögzíteni a feliratkozást.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Marketing consent hiba:', error);
    return NextResponse.json({ error: 'Nem sikerült rögzíteni a feliratkozást.' }, { status: 500 });
  }
}
