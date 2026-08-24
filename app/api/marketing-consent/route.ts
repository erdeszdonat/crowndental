import { createClient } from '@supabase/supabase-js';
import { upsertMarketingSubscriber } from '@/lib/marketingSubscribers';
import { verifyAppointmentConsentToken } from '@/lib/marketingTokens';
import { enforceRateLimit, normalizeLocale, noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(request, 'marketing-consent', { limit: 8, windowMs: 60 * 60_000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const tokenPayload = verifyAppointmentConsentToken(body.consentToken);
    if (!tokenPayload) return noStoreJson({ error: 'A feliratkozási hivatkozás érvénytelen vagy lejárt.' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return noStoreJson({ error: 'A feliratkozás átmenetileg nem érhető el.' }, { status: 503 });

    const { data: appointment, error } = await createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      .from('appointments')
      .select('email,name,nickname,phone,city,locale')
      .eq('id', tokenPayload.appointmentId)
      .maybeSingle();
    if (error || !appointment) return noStoreJson({ error: 'A foglalás nem található.' }, { status: 404 });

    const result = await upsertMarketingSubscriber({
      email: appointment.email, name: appointment.name, nickname: appointment.nickname,
      phone: appointment.phone, clinic: appointment.city, source: 'booking_success_page',
      locale: normalizeLocale(appointment.locale || body.locale), explicitConsent: true,
    });
    if (!result.ok) return noStoreJson({ error: 'Nem sikerült rögzíteni a feliratkozást.' }, { status: 503 });
    return noStoreJson({ success: true });
  } catch (error) {
    console.error('Marketing consent hiba:', error);
    return noStoreJson({ error: 'Nem sikerült rögzíteni a feliratkozást.' }, { status: 500 });
  }
}
