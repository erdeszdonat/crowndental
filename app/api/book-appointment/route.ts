import { createClient } from '@supabase/supabase-js';
import { isBudapestBookingAvailable, isBudapestCity } from '@/lib/bookingAvailability';
import { sendTransactionalEmail } from '@/lib/addToAudience';
import { upsertMarketingSubscriber } from '@/lib/marketingSubscribers';
import { getPreferredGreetingName } from '@/lib/names';
import { createAppointmentConsentToken } from '@/lib/marketingTokens';
import {
  claimIdempotency, cleanText, completeIdempotency, enforceRateLimit, getIdempotencyKey, getIdempotencyResponse,
  isValidEmail, isValidPhone, normalizeEmail, normalizeLocale, noStoreJson, releaseIdempotency, type SupportedLocale,
  rejectUntrustedMutation,
} from '@/lib/serverSecurity';

const EMAIL_COPY: Record<SupportedLocale, {
  subject: string; greeting: (name: string) => string; intro: string; details: string;
  clinic: string; treatment: string; phone: string; next: string; signoff: string; team: string;
}> = {
  hu: {
    subject: 'Időpontfoglalási kérését rögzítettük – Crown Dental', greeting: (name) => `Kedves ${name}!`,
    intro: 'Köszönjük, hogy a Crown Dentalt választotta! Foglalási kérését sikeresen rögzítettük.', details: 'Az Ön által megadott adatok',
    clinic: 'Választott rendelő', treatment: 'Kezelés típusa', phone: 'Telefonszám', next: 'Munkatársaink legkésőbb 24 órán belül felveszik Önnel a kapcsolatot a pontos időpont egyeztetéséhez.', signoff: 'Üdvözlettel', team: 'A Crown Dental csapata',
  },
  en: {
    subject: 'We received your appointment request – Crown Dental', greeting: (name) => `Hello ${name}!`,
    intro: 'Thank you for choosing Crown Dental. Your appointment request has been recorded successfully.', details: 'Your details',
    clinic: 'Selected clinic', treatment: 'Requested treatment', phone: 'Phone number', next: 'Our team will contact you within 24 hours to agree the exact appointment time.', signoff: 'Kind regards', team: 'The Crown Dental team',
  },
  sk: {
    subject: 'Vašu žiadosť o termín sme prijali – Crown Dental', greeting: (name) => `Dobrý deň, ${name}!`,
    intro: 'Ďakujeme, že ste si vybrali Crown Dental. Vašu žiadosť o termín sme úspešne zaznamenali.', details: 'Vaše údaje',
    clinic: 'Vybraná klinika', treatment: 'Požadované ošetrenie', phone: 'Telefónne číslo', next: 'Náš tím vás bude kontaktovať najneskôr do 24 hodín, aby sme dohodli presný termín.', signoff: 'S pozdravom', team: 'Tím Crown Dental',
  },
  de: {
    subject: 'Ihre Terminanfrage wurde erhalten – Crown Dental', greeting: (name) => `Guten Tag ${name}!`,
    intro: 'Vielen Dank, dass Sie sich für Crown Dental entschieden haben. Ihre Terminanfrage wurde erfolgreich erfasst.', details: 'Ihre Angaben',
    clinic: 'Gewählte Praxis', treatment: 'Gewünschte Behandlung', phone: 'Telefonnummer', next: 'Unser Team meldet sich spätestens innerhalb von 24 Stunden, um den genauen Termin abzustimmen.', signoff: 'Mit freundlichen Grüßen', team: 'Ihr Crown Dental Team',
  },
};

const BOOKING_CITIES = new Set(['Esztergom', 'Budapest']);

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

type BookingReceipt = {
  id: string;
  name: string;
  nickname?: string | null;
  email: string;
  phone: string;
  city: string;
  treatment: string;
  locale?: string | null;
  request_receipt_email_sent_at?: string | null;
  request_receipt_email_idempotency_key?: string | null;
};

async function sendBookingReceipt(booking: BookingReceipt, providerKey: string) {
  const locale = normalizeLocale(booking.locale);
  const copy = EMAIL_COPY[locale];
  const greeting = copy.greeting(escapeHtml(getPreferredGreetingName(booking.name, booking.nickname || '')));
  return sendTransactionalEmail({
    from: 'Crown Dental <info@crowndental.hu>',
    to: booking.email,
    subject: copy.subject,
    html: `<div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden"><div style="background:#0284c7;padding:35px 30px;text-align:center"><h1 style="color:white">${greeting}</h1></div><div style="padding:35px 30px"><p style="font-size:16px;line-height:1.6">${copy.intro}</p><div style="background:#f0f9ff;padding:20px 25px;border-radius:12px"><h3>${copy.details}</h3><p><strong>${copy.clinic}:</strong> ${escapeHtml(booking.city)}</p><p><strong>${copy.treatment}:</strong> ${escapeHtml(booking.treatment)}</p><p><strong>${copy.phone}:</strong> ${escapeHtml(booking.phone)}</p></div><p style="font-size:16px;line-height:1.6">${copy.next}</p></div><div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b">${copy.signoff},<br><strong>${copy.team}</strong><br>+36 70 564 6837 | info@crowndental.hu</div></div>`,
  }, providerKey);
}

function settleBookingIdempotency(idempotencyKey: string, payload: Record<string, unknown>, emailSent: boolean) {
  if (emailSent) completeIdempotency('booking', idempotencyKey, payload, 24 * 60 * 60_000);
  else releaseIdempotency('booking', idempotencyKey);
}

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(request, 'book-appointment', { limit: 8, windowMs: 60 * 60_000 });
  if (rateLimitError) return rateLimitError;

  let idempotencyKey = '';
  try {
    const body = await request.json();
    idempotencyKey = getIdempotencyKey(request, body.idempotencyKey);
    if (!claimIdempotency('booking', idempotencyKey)) {
      const replay = getIdempotencyResponse<Record<string, unknown>>('booking', idempotencyKey);
      if (replay) return noStoreJson(replay);
      return noStoreJson({ error: 'Ezt a foglalási kérést már feldolgoztuk.' }, { status: 409 });
    }

    const city = cleanText(body.city, 80);
    const name = cleanText(body.name, 120);
    const nickname = cleanText(body.nickname, 80);
    const email = normalizeEmail(body.email);
    const phone = cleanText(body.phone, 40);
    const treatment = cleanText(body.treatment, 280);
    const locale = normalizeLocale(body.locale || body.marketingConsentLocale);
    const marketingConsent = body.marketingConsent === true;

    if (!name || !BOOKING_CITIES.has(city) || !treatment || !isValidEmail(email) || !isValidPhone(phone)) {
      releaseIdempotency('booking', idempotencyKey);
      return noStoreJson({ error: 'Kérjük, ellenőrizze a kötelező mezőket, az e-mail címet és a telefonszámot.' }, { status: 400 });
    }
    if (isBudapestCity(city) && !isBudapestBookingAvailable()) {
      releaseIdempotency('booking', idempotencyKey);
      return noStoreJson({ error: 'A budapesti rendelő jelenleg még nem foglalható.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      releaseIdempotency('booking', idempotencyKey);
      return noStoreJson({ error: 'A foglalási szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const receiptEmailIdempotencyKey = `booking-receipt/${idempotencyKey}`;
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        name, nickname, email, phone, city, treatment, locale, idempotency_key: idempotencyKey,
        request_receipt_email_idempotency_key: receiptEmailIdempotencyKey,
      })
      .select('id')
      .single();

    if (error || !appointment?.id) {
      if (error?.code === '23505') {
        const { data: existing, error: existingError } = await supabase
          .from('appointments')
          .select('id,name,nickname,email,phone,city,treatment,locale,request_receipt_email_sent_at,request_receipt_email_idempotency_key')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();
        if (existing?.id) {
          let emailSent = Boolean(existing.request_receipt_email_sent_at);
          if (!emailSent) {
            const emailResult = await sendBookingReceipt(
              existing as BookingReceipt,
              existing.request_receipt_email_idempotency_key || receiptEmailIdempotencyKey,
            );
            emailSent = emailResult.ok;
            if (emailSent) {
              const { error: markerError } = await supabase
                .from('appointments')
                .update({ request_receipt_email_sent_at: new Date().toISOString() })
                .eq('id', existing.id);
              if (markerError) console.error('Foglalási e-mail jelölési hiba:', markerError);
            }
          }
          const replayPayload = {
            success: true, appointmentId: existing.id,
            consentToken: createAppointmentConsentToken(String(existing.id)), marketingConsentSaved: false,
            emailSent,
          };
          settleBookingIdempotency(idempotencyKey, replayPayload, emailSent);
          return noStoreJson(replayPayload);
        }
        if (existingError) console.error('Foglalási ismétlés lekérdezési hiba:', existingError);
      }
      releaseIdempotency('booking', idempotencyKey);
      console.error('Supabase foglalási mentési hiba:', error);
      return noStoreJson({ error: 'A foglalás mentése átmenetileg nem sikerült.' }, { status: 503 });
    }

    const emailResult = await sendBookingReceipt({
      id: String(appointment.id), name, nickname, email, phone, city, treatment, locale,
    }, receiptEmailIdempotencyKey);
    const emailSent = emailResult.ok;
    if (emailSent) {
      const { error: markerError } = await supabase
        .from('appointments')
        .update({ request_receipt_email_sent_at: new Date().toISOString() })
        .eq('id', appointment.id);
      if (markerError) console.error('Foglalási e-mail jelölési hiba:', markerError);
    }

    let marketingConsentSaved: boolean | undefined;
    if (marketingConsent) {
      const marketingResult = await upsertMarketingSubscriber({
        email, name, nickname, phone, clinic: city,
        source: cleanText(body.marketingConsentSource, 80) || 'booking_form', locale,
        explicitConsent: true,
      });
      marketingConsentSaved = marketingResult.ok;
      if (!marketingResult.ok) console.warn('Marketing feliratkozás nem lett mentve:', marketingResult.error);
    }

    const responsePayload = {
      success: true,
      appointmentId: appointment.id,
      consentToken: createAppointmentConsentToken(String(appointment.id)),
      marketingConsentSaved,
      emailSent,
    };
    settleBookingIdempotency(idempotencyKey, responsePayload, emailSent);
    return noStoreJson(responsePayload);
  } catch (error) {
    if (idempotencyKey) releaseIdempotency('booking', idempotencyKey);
    console.error('Foglalási API hiba:', error);
    return noStoreJson({ error: 'Szerverhiba történt az adatok feldolgozásakor.' }, { status: 500 });
  }
}
