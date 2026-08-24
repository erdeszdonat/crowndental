import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/addToAudience';
import { getPreferredGreetingName } from '@/lib/names';
import {
  claimIdempotency, cleanText, completeIdempotency, enforceRateLimit, getIdempotencyKey, getIdempotencyResponse,
  isValidEmail, isValidPhone, normalizeEmail, normalizeLocale, noStoreJson, releaseIdempotency, type SupportedLocale,
  rejectUntrustedMutation,
} from '@/lib/serverSecurity';

const LOCATIONS = new Set(['Esztergom', 'Budapest']);
const POSITIONS = new Set(['Fogorvos', 'Asszisztens']);

const EMAIL_COPY: Record<SupportedLocale, {
  subject: string; greeting: (name: string) => string; intro: string; details: string;
  position: string; location: string; next: string; signoff: string;
}> = {
  hu: { subject: 'Jelentkezését sikeresen fogadtuk – Crown Dental', greeting: (name) => `Kedves ${name}!`, intro: 'Köszönjük, hogy jelentkezett a Crown Dental csapatába. Pályázatát sikeresen rögzítettük.', details: 'Jelentkezésének részletei', position: 'Pozíció', location: 'Rendelő', next: 'HR csapatunk áttekinti a megadott adatokat, és megfelelő egyezés esetén telefonon jelentkezik.', signoff: 'Üdvözlettel, a Crown Dental HR csapata' },
  en: { subject: 'We received your application – Crown Dental', greeting: (name) => `Hello ${name}!`, intro: 'Thank you for applying to join Crown Dental. Your application has been recorded successfully.', details: 'Application details', position: 'Position', location: 'Clinic', next: 'Our HR team will review your details and contact you by phone if your profile matches the role.', signoff: 'Kind regards, the Crown Dental HR team' },
  sk: { subject: 'Vašu žiadosť sme prijali – Crown Dental', greeting: (name) => `Dobrý deň, ${name}!`, intro: 'Ďakujeme za váš záujem pracovať v Crown Dental. Vašu žiadosť sme úspešne zaznamenali.', details: 'Údaje žiadosti', position: 'Pozícia', location: 'Klinika', next: 'Náš HR tím údaje posúdi a v prípade zhody vás bude kontaktovať telefonicky.', signoff: 'S pozdravom, HR tím Crown Dental' },
  de: { subject: 'Ihre Bewerbung ist bei uns eingegangen – Crown Dental', greeting: (name) => `Guten Tag ${name}!`, intro: 'Vielen Dank für Ihre Bewerbung bei Crown Dental. Ihre Bewerbung wurde erfolgreich erfasst.', details: 'Ihre Bewerbung', position: 'Position', location: 'Praxis', next: 'Unser HR-Team prüft Ihre Angaben und meldet sich bei passendem Profil telefonisch bei Ihnen.', signoff: 'Mit freundlichen Grüßen, Ihr Crown Dental HR-Team' },
};

function escapeHtml(value: unknown) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

type CareerReceipt = {
  id: string;
  location: string;
  position: string;
  name: string;
  email: string;
  locale?: string | null;
  receipt_email_sent_at?: string | null;
  receipt_email_idempotency_key?: string | null;
};

async function sendCareerReceipt(application: CareerReceipt, providerKey: string) {
  const copy = EMAIL_COPY[normalizeLocale(application.locale)];
  const greeting = copy.greeting(escapeHtml(getPreferredGreetingName(application.name)));
  return sendTransactionalEmail({
    from: 'Crown Dental HR <info@crowndental.hu>',
    to: application.email,
    subject: copy.subject,
    html: `<div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden"><div style="background:#0284c7;padding:35px;text-align:center;color:white"><h1>${greeting}</h1></div><div style="padding:35px"><p>${copy.intro}</p><div style="background:#f0f9ff;padding:20px;border-radius:12px"><h3>${copy.details}</h3><p><strong>${copy.position}:</strong> ${escapeHtml(application.position)}</p><p><strong>${copy.location}:</strong> ${escapeHtml(application.location)}</p></div><p>${copy.next}</p></div><div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b">${copy.signoff}</div></div>`,
  }, providerKey);
}

function settleCareerIdempotency(idempotencyKey: string, payload: Record<string, unknown>, emailSent: boolean) {
  if (emailSent) completeIdempotency('career', idempotencyKey, payload, 24 * 60 * 60_000);
  else releaseIdempotency('career', idempotencyKey);
}

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(request, 'career-application', { limit: 5, windowMs: 60 * 60_000 });
  if (rateLimitError) return rateLimitError;

  let idempotencyKey = '';
  try {
    const body = await request.json();
    idempotencyKey = getIdempotencyKey(request, body.idempotencyKey);
    if (!claimIdempotency('career', idempotencyKey)) {
      const replay = getIdempotencyResponse<Record<string, unknown>>('career', idempotencyKey);
      if (replay) return noStoreJson(replay);
      return noStoreJson({ error: 'Ezt a jelentkezést már feldolgoztuk.' }, { status: 409 });
    }

    const location = cleanText(body.location, 40);
    const position = cleanText(body.position, 80);
    const experience = cleanText(body.experience, 20) || '0';
    const name = cleanText(body.name, 120);
    const email = normalizeEmail(body.email);
    const phone = cleanText(body.phone, 40);
    const message = cleanText(body.message, 2_000);
    const locale = normalizeLocale(body.locale);

    if (!name || !LOCATIONS.has(location) || !POSITIONS.has(position) || !isValidEmail(email) || !isValidPhone(phone)) {
      releaseIdempotency('career', idempotencyKey);
      return noStoreJson({ error: 'Kérjük, ellenőrizze a jelentkezés adatait.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      releaseIdempotency('career', idempotencyKey);
      return noStoreJson({ error: 'A jelentkezési szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const receiptEmailIdempotencyKey = `career-receipt/${idempotencyKey}`;
    const { data: application, error } = await supabase.from('career_applications').insert({
      location, position, experience, name, email, phone, message, locale, idempotency_key: idempotencyKey,
      receipt_email_idempotency_key: receiptEmailIdempotencyKey,
    }).select('id').single();
    if (error || !application?.id) {
      if (error?.code === '23505') {
        const { data: existing, error: existingError } = await supabase
          .from('career_applications')
          .select('id,location,position,name,email,locale,receipt_email_sent_at,receipt_email_idempotency_key')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();
        if (existing?.id) {
          let emailSent = Boolean(existing.receipt_email_sent_at);
          if (!emailSent) {
            const emailResult = await sendCareerReceipt(
              existing as CareerReceipt,
              existing.receipt_email_idempotency_key || receiptEmailIdempotencyKey,
            );
            emailSent = emailResult.ok;
            if (emailSent) {
              const { error: markerError } = await supabase
                .from('career_applications')
                .update({ receipt_email_sent_at: new Date().toISOString() })
                .eq('id', existing.id);
              if (markerError) console.error('Karrier e-mail jelölési hiba:', markerError);
            }
          }
          const replayPayload = { success: true, applicationId: existing.id, emailSent };
          settleCareerIdempotency(idempotencyKey, replayPayload, emailSent);
          return noStoreJson(replayPayload);
        }
        if (existingError) console.error('Karrier ismétlés lekérdezési hiba:', existingError);
      }
      releaseIdempotency('career', idempotencyKey);
      console.error('Karrier jelentkezés mentési hiba:', error);
      return noStoreJson({ error: 'A jelentkezés mentése átmenetileg nem sikerült.' }, { status: 503 });
    }

    const emailResult = await sendCareerReceipt({
      id: String(application.id), location, position, name, email, locale,
    }, receiptEmailIdempotencyKey);
    const emailSent = emailResult.ok;
    if (emailSent) {
      const { error: markerError } = await supabase
        .from('career_applications')
        .update({ receipt_email_sent_at: new Date().toISOString() })
        .eq('id', application.id);
      if (markerError) console.error('Karrier e-mail jelölési hiba:', markerError);
    }

    const responsePayload = { success: true, applicationId: application.id, emailSent };
    settleCareerIdempotency(idempotencyKey, responsePayload, emailSent);
    return noStoreJson(responsePayload);
  } catch (error) {
    if (idempotencyKey) releaseIdempotency('career', idempotencyKey);
    console.error('Karrier API hiba:', error);
    return noStoreJson({ error: 'Szerverhiba történt az adatok feldolgozásakor.' }, { status: 500 });
  }
}
