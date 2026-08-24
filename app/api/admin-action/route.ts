import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { getPreferredGreetingName } from '@/lib/names';
import { requireAdminSession } from '@/lib/adminAuth';
import { normalizeLocale, noStoreJson, rejectUntrustedMutation, type SupportedLocale } from '@/lib/serverSecurity';

const ALLOWED_TABLES = new Set(['appointments', 'career_applications', 'quote_leads']);
const ALLOWED_STATUSES = new Set(['new', 'no_answer', 'processed', 'cancelled', 'special']);
const CLINIC_PHONE_DISPLAY = '+36 70 564 6837';
const CLINIC_PHONE_TEL = '+36705646837';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.crowndental.hu').replace(/\/$/, '');
const APPOINTMENT_DURATION_MINUTES = 60;

type AppointmentForNoAnswerEmail = {
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  treatment?: string | null;
  locale?: string | null;
  confirmation_email_idempotency_key?: string | null;
  no_answer_email_idempotency_key?: string | null;
  cancellation_email_idempotency_key?: string | null;
};

type AppointmentForConfirmationEmail = AppointmentForNoAnswerEmail & {
  city?: string | null;
  treatment?: string | null;
};

type AppointmentDateTimeMeta = {
  displayDateTime: string;
  googleCalendarUrl: string;
  appleCalendarUrl: string;
  location: string;
  isConsultationPolicyApplicable: boolean;
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type ResendEmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

class ResendSendError extends Error {
  constructor(status: number | null, code?: string) {
    const safeCode = String(code || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
    super(`Resend küldési hiba (${status ? `HTTP ${status}` : 'hálózati hiba'}, kód: ${safeCode || 'unknown'}).`);
    this.name = 'ResendSendError';
  }
}

function buildEmailIdempotencyKey(
  event: 'processed' | 'no-answer' | 'cancelled',
  appointmentId: unknown,
  previousEventKey: unknown,
  eventPayload: unknown = '',
) {
  const digest = createHash('sha256')
    .update([
      'crown-admin-email-v1',
      String(event),
      String(appointmentId ?? ''),
      String(previousEventKey ?? ''),
      String(eventPayload ?? ''),
    ].join('\u001f'))
    .digest('hex');

  return `crown-admin-${event}-${digest}`;
}

async function sendResendEmail(
  payload: ResendEmailPayload,
  idempotencyKey: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new ResendSendError(null, 'missing_api_key');
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ResendSendError(null, 'network_error');
  }

  const providerBody = await response.json().catch(() => null) as {
    id?: unknown;
    name?: unknown;
    error?: { name?: unknown } | unknown;
  } | null;

  const providerCode =
    typeof providerBody?.name === 'string'
      ? providerBody.name
      : providerBody?.error && typeof providerBody.error === 'object' && 'name' in providerBody.error
        ? String(providerBody.error.name)
        : undefined;

  if (!response.ok || typeof providerBody?.id !== 'string' || !providerBody.id) {
    throw new ResendSendError(response.status, providerCode);
  }

  return { id: providerBody.id };
}

function createIdempotentResendSender(idempotencyKey: string) {
  return {
    emails: {
      send: (payload: ResendEmailPayload) => sendResendEmail(payload, idempotencyKey),
    },
  };
}

function parseAppointmentDateTime(value: unknown) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const start = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0));

  if (Number.isNaN(start.getTime())) return null;

  const isSameDate =
    start.getUTCFullYear() === Number(year) &&
    start.getUTCMonth() === Number(month) - 1 &&
    start.getUTCDate() === Number(day) &&
    start.getUTCHours() === Number(hour) &&
    start.getUTCMinutes() === Number(minute);

  if (!isSameDate) return null;

  const pad = (number: number) => String(number).padStart(2, '0');
  const end = new Date(start.getTime() + APPOINTMENT_DURATION_MINUTES * 60_000);

  return {
    displayDateTime: `${year}.${month}.${day}. ${hour}:${minute}`,
    dateKey: `${year}-${month}-${day}`,
    startCompact: `${year}${month}${day}T${hour}${minute}00`,
    endCompact: `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00`,
  };
}

function isConsultationTreatment(treatment?: string | null) {
  return /(konzult|consult|beratung)/i.test(String(treatment || ''));
}

function getAppointmentLocale(appointment: AppointmentForNoAnswerEmail): SupportedLocale {
  return normalizeLocale(appointment.locale);
}

function getAppointmentLocation(city?: string | null) {
  const normalizedCity = String(city || '').toLowerCase();

  if (normalizedCity.includes('budapest')) {
    return 'Crown Dental Budapest, 1039 Budapest, Királyok útja 55.';
  }

  return 'Crown Dental Esztergom, 2500 Esztergom, Petőfi Sándor utca 11.';
}

function buildAppointmentDateTimeMeta(
  appointment: AppointmentForConfirmationEmail,
  appointmentDateTime: unknown
): AppointmentDateTimeMeta | null {
  const parsed = parseAppointmentDateTime(appointmentDateTime);
  if (!parsed) return null;

  const location = getAppointmentLocation(appointment.city);
  const locale = getAppointmentLocale(appointment);
  const calendarCopy: Record<SupportedLocale, { title: string; appointment: string; treatment: string; phone: string }> = {
    hu: { title: 'Crown Dental fogászati időpont', appointment: 'Időpont', treatment: 'Kezelés', phone: 'Telefon' },
    en: { title: 'Crown Dental dental appointment', appointment: 'Appointment', treatment: 'Treatment', phone: 'Phone' },
    sk: { title: 'Termín zubného ošetrenia Crown Dental', appointment: 'Termín', treatment: 'Ošetrenie', phone: 'Telefón' },
    de: { title: 'Crown Dental Zahnarzttermin', appointment: 'Termin', treatment: 'Behandlung', phone: 'Telefon' },
  };
  const copy = calendarCopy[locale];
  const details = [
    `${copy.appointment}: ${parsed.displayDateTime}`,
    appointment.treatment ? `${copy.treatment}: ${appointment.treatment}` : '',
    `${copy.phone}: ${CLINIC_PHONE_DISPLAY}`,
  ].filter(Boolean).join('\n');
  const encodedTitle = encodeURIComponent(copy.title);
  const encodedLocation = encodeURIComponent(location);
  const encodedDetails = encodeURIComponent(details);

  return {
    displayDateTime: parsed.displayDateTime,
    location,
    isConsultationPolicyApplicable: isConsultationTreatment(appointment.treatment) && parsed.dateKey >= '2026-07-01',
    googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${parsed.startCompact}/${parsed.endCompact}&ctz=Europe%2FBudapest&details=${encodedDetails}&location=${encodedLocation}`,
    appleCalendarUrl: `${SITE_URL}/api/calendar/appointment.ics?start=${parsed.startCompact}&end=${parsed.endCompact}&title=${encodedTitle}&location=${encodedLocation}&details=${encodedDetails}`,
  };
}

async function sendNoAnswerEmail(
  appointment: AppointmentForNoAnswerEmail,
  idempotencyKey: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, error: 'Nincs érvényes e-mail cím, ezért a „nem vette fel” státusz nem lett beállítva.' };
  }

  if (!resendKey) {
    return { sent: false, error: 'Hiányzik a RESEND_API_KEY, ezért a „nem vette fel” státusz nem lett beállítva.' };
  }

  const resend = createIdempotentResendSender(idempotencyKey);
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));
  const customerPhone = escapeHtml(appointment.phone || '');
  const appointmentLocale = getAppointmentLocale(appointment);

  if (appointmentLocale === 'en' || appointmentLocale === 'sk') {
    const copy = appointmentLocale === 'sk'
      ? {
          subject: 'Pokúšali sme sa vám dovolať – Crown Dental',
          greeting: `Dobrý deň, ${greetingName}!`,
          intro: 'Pokúšali sme sa vás telefonicky kontaktovať ohľadom vašej žiadosti o termín, ale nepodarilo sa nám vás zastihnúť.',
          action: 'Prosíme, zavolajte nám späť na číslo:',
          button: 'Zavolať do Crown Dental',
          signoff: 'S pozdravom',
        }
      : {
          subject: 'We tried to reach you by phone – Crown Dental',
          greeting: `Hello ${greetingName}!`,
          intro: 'We tried to contact you by phone about your appointment request, but unfortunately could not reach you.',
          action: 'Please call us back directly on:',
          button: 'Call Crown Dental',
          signoff: 'Kind regards',
        };
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>',
        to: email,
        subject: copy.subject,
        html: `<div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:auto;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden"><div style="background:#0284c7;padding:34px 30px;text-align:center;color:white"><h1>${copy.greeting}</h1></div><div style="padding:34px 30px"><p style="font-size:17px;line-height:1.65;color:#1f2937">${copy.intro}</p><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;padding:22px;margin:24px 0"><p style="color:#334155">${copy.action}</p><p style="font-size:24px;font-weight:900;color:#0284c7">${CLINIC_PHONE_DISPLAY}</p></div>${customerPhone ? `<p style="color:#64748b">${customerPhone}</p>` : ''}<a href="tel:${CLINIC_PHONE_TEL}" style="display:block;text-align:center;background:#0284c7;color:white;text-decoration:none;font-weight:900;padding:16px;border-radius:14px">${copy.button}</a></div><div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b">${copy.signoff},<br><strong>Crown Dental</strong></div></div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Nemzetközi visszahívó e-mail hiba:', mailErr);
      return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a „nem vette fel” státusz nem lett beállítva.' };
    }
  }

  if (getAppointmentLocale(appointment) === 'de') {
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>',
        to: email,
        subject: 'Wir haben versucht, Sie telefonisch zu erreichen – Crown Dental',
        html: `
          <div style="display:none; max-height:0; overflow:hidden;">Wir wollten Ihren Termin abstimmen, konnten Sie aber leider nicht erreichen. Bitte rufen Sie uns zurück.</div>
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9); padding:34px 30px; text-align:center;">
              <p style="margin:0 0 10px; color:#bae6fd; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Crown Dental Terminabstimmung</p>
              <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.25; font-weight:800;">Guten Tag ${greetingName}!</h1>
            </div>
            <div style="padding:34px 30px;">
              <p style="font-size:17px; color:#1f2937; line-height:1.65; margin:0 0 18px;">Wir haben versucht, Sie wegen Ihrer Terminanfrage telefonisch zu erreichen, konnten Sie aber leider nicht erreichen.</p>
              <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:14px; padding:22px; margin:24px 0;">
                <p style="margin:0 0 10px; color:#0369a1; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Wie geht es weiter?</p>
                <p style="margin:0; color:#334155; font-size:16px; line-height:1.6;">Bitte prüfen Sie Ihre verpassten Anrufe und rufen Sie uns direkt unter folgender Nummer zurück:</p>
                <p style="margin:16px 0 0; font-size:24px; font-weight:900; color:#0284c7;">${CLINIC_PHONE_DISPLAY}</p>
              </div>
              ${customerPhone ? `<p style="font-size:14px; color:#64748b; line-height:1.6; margin:0 0 24px;">Ihre angegebene Telefonnummer: <strong style="color:#0f172a;">${customerPhone}</strong></p>` : ''}
              <a href="tel:${CLINIC_PHONE_TEL}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">Crown Dental zurückrufen</a>
            </div>
            <div style="background:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Mit freundlichen Grüßen<br><strong style="color:#0f172a;">Ihr Crown Dental Team</strong></p>
              <p style="font-size:12px; color:#94a3b8; margin:10px 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
            </div>
          </div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Deutsche Rückruf-E-Mail konnte nicht gesendet werden:', mailErr);
      return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a „nem vette fel” státusz nem lett beállítva.' };
    }
  }

  try {
    await resend.emails.send({
      from: 'Crown Dental <info@crowndental.hu>',
      to: email,
      subject: 'Kerestük Önt telefonon - Crown Dental',
      html: `
        <div style="display:none; max-height:0; overflow:hidden;">
          Kerestük Önt időpont-egyeztetés miatt, de nem értük el. Kérjük, hívjon vissza minket.
        </div>
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9); padding:34px 30px; text-align:center;">
            <p style="margin:0 0 10px 0; color:#bae6fd; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Crown Dental időpont-egyeztetés</p>
            <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.25; font-weight:800;">Kedves ${greetingName}!</h1>
          </div>

          <div style="padding:34px 30px;">
            <p style="font-size:17px; color:#1f2937; line-height:1.65; margin:0 0 18px 0;">
              Kerestük Önt telefonon az időpontkérésével kapcsolatban, de sajnos nem sikerült elérnünk.
            </p>
            <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:14px; padding:22px; margin:24px 0;">
              <p style="margin:0 0 10px 0; color:#0369a1; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Mit tegyen most?</p>
              <p style="margin:0; color:#334155; font-size:16px; line-height:1.6;">
                Kérjük, nézze meg a nem fogadott hívásait, és hívjon vissza minket közvetlenül ezen a számon:
              </p>
              <p style="margin:16px 0 0 0; font-size:24px; font-weight:900; color:#0284c7;">${CLINIC_PHONE_DISPLAY}</p>
            </div>
            <p style="font-size:15px; color:#475569; line-height:1.65; margin:0 0 24px 0;">
              Ezt a telefonszámot a weboldalunkon is megtalálja. Ha a hívás közben épp nem tudjuk felvenni, rövid időn belül visszakeressük.
            </p>
            ${customerPhone ? `<p style="font-size:14px; color:#64748b; line-height:1.6; margin:0 0 24px 0;">Az Ön által megadott telefonszám: <strong style="color:#0f172a;">${customerPhone}</strong></p>` : ''}
            <a href="tel:${CLINIC_PHONE_TEL}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">
              Visszahívom a Crown Dentalt
            </a>
          </div>

          <div style="background:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
            <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Üdvözlettel,<br><strong style="color:#0f172a;">A Crown Dental csapata</strong></p>
            <p style="font-size:12px; color:#94a3b8; margin:10px 0 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
          </div>
        </div>
      `,
    });

    return { sent: true };
  } catch (mailErr) {
    console.error('Nem vette fel státusz e-mail hiba:', mailErr);
    return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a „nem vette fel” státusz nem lett beállítva.' };
  }
}

async function sendAppointmentCancellationEmail(
  appointment: AppointmentForNoAnswerEmail,
  idempotencyKey: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, error: 'Nincs érvényes e-mail cím, ezért a sztornózott státusz nem lett beállítva.' };
  }

  if (!resendKey) {
    return { sent: false, error: 'Hiányzik a RESEND_API_KEY, ezért a sztornózott státusz nem lett beállítva.' };
  }

  const resend = createIdempotentResendSender(idempotencyKey);
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));
  const appointmentLocale = getAppointmentLocale(appointment);

  if (appointmentLocale === 'en' || appointmentLocale === 'sk') {
    const copy = appointmentLocale === 'sk'
      ? {
          subject: 'Vaša žiadosť o termín bola zrušená – Crown Dental',
          greeting: `Dobrý deň, ${greetingName}!`,
          intro: 'Potvrdzujeme, že vaša žiadosť o termín bola zrušená. V našom systéme momentálne nemáte aktívnu žiadosť o rezerváciu.',
          action: 'Ak si neskôr budete chcieť dohodnúť nový termín, radi vám pomôžeme telefonicky alebo cez našu webovú stránku.',
          button: 'Dohodnúť nový termín', signoff: 'S pozdravom',
        }
      : {
          subject: 'Your appointment request has been cancelled – Crown Dental',
          greeting: `Hello ${greetingName}!`,
          intro: 'We confirm that your appointment request has been cancelled. There is currently no active booking request in our system.',
          action: 'If you would like to arrange a new appointment later, we will be happy to help by phone or through our website.',
          button: 'Arrange a new appointment', signoff: 'Kind regards',
        };
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>', to: email, subject: copy.subject,
        html: `<div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:auto;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden"><div style="background:#0f172a;padding:34px 30px;text-align:center;color:white"><h1>${copy.greeting}</h1></div><div style="padding:34px 30px"><p style="font-size:17px;line-height:1.65;color:#1f2937">${copy.intro}</p><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px;margin:24px 0"><p style="color:#334155">${copy.action}</p></div><a href="tel:${CLINIC_PHONE_TEL}" style="display:block;text-align:center;background:#0284c7;color:white;text-decoration:none;font-weight:900;padding:16px;border-radius:14px">${copy.button}</a></div><div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b">${copy.signoff},<br><strong>Crown Dental</strong></div></div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Nemzetközi sztornózó e-mail hiba:', mailErr);
      return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a sztornózott státusz nem lett beállítva.' };
    }
  }

  if (getAppointmentLocale(appointment) === 'de') {
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>',
        to: email,
        subject: 'Ihre Terminanfrage wurde storniert – Crown Dental',
        html: `
          <div style="display:none; max-height:0; overflow:hidden;">Ihre Terminanfrage wurde aus unserem System entfernt.</div>
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0f172a,#334155); padding:34px 30px; text-align:center;">
              <p style="margin:0 0 10px; color:#cbd5e1; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Crown Dental Terminanfrage</p>
              <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.25; font-weight:800;">Guten Tag ${greetingName}!</h1>
            </div>
            <div style="padding:34px 30px;">
              <p style="font-size:17px; color:#1f2937; line-height:1.65; margin:0 0 18px;">Wir bestätigen, dass Ihre Terminanfrage storniert wurde. Derzeit besteht keine aktive Buchungsanfrage in unserem System.</p>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:22px; margin:24px 0;">
                <p style="margin:0; color:#334155; font-size:16px; line-height:1.6;">Wenn Sie später einen neuen Termin vereinbaren möchten, sind wir telefonisch und über unsere Website gerne für Sie da.</p>
              </div>
              <a href="tel:${CLINIC_PHONE_TEL}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">Neuen Termin vereinbaren</a>
            </div>
            <div style="background:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Mit freundlichen Grüßen<br><strong style="color:#0f172a;">Ihr Crown Dental Team</strong></p>
              <p style="font-size:12px; color:#94a3b8; margin:10px 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
            </div>
          </div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Deutsche Stornierungs-E-Mail konnte nicht gesendet werden:', mailErr);
      return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a sztornózott státusz nem lett beállítva.' };
    }
  }

  try {
    await resend.emails.send({
      from: 'Crown Dental <info@crowndental.hu>',
      to: email,
      subject: 'Időpontkérését töröltük - Crown Dental',
      html: `
        <div style="display:none; max-height:0; overflow:hidden;">
          Időpontkérését kérésének megfelelően töröltük rendszerünkből.
        </div>
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a,#334155); padding:34px 30px; text-align:center;">
            <p style="margin:0 0 10px 0; color:#cbd5e1; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Crown Dental időpontkérés</p>
            <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.25; font-weight:800;">Kedves ${greetingName}!</h1>
          </div>

          <div style="padding:34px 30px;">
            <p style="font-size:17px; color:#1f2937; line-height:1.65; margin:0 0 18px 0;">
              Tájékoztatjuk, hogy időpontkérését töröltük, így jelenleg nincs aktív foglalási kérelme a Crown Dental rendszerében.
            </p>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:22px; margin:24px 0;">
              <p style="margin:0; color:#334155; font-size:16px; line-height:1.6;">
                Amennyiben később mégis szeretne új időpontot egyeztetni, szívesen állunk rendelkezésére telefonon vagy weboldalunkon keresztül.
              </p>
            </div>
            <a href="tel:${CLINIC_PHONE_TEL}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">
              Új időpont egyeztetése
            </a>
          </div>

          <div style="background:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
            <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Üdvözlettel,<br><strong style="color:#0f172a;">A Crown Dental csapata</strong></p>
            <p style="font-size:12px; color:#94a3b8; margin:10px 0 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
          </div>
        </div>
      `,
    });

    return { sent: true };
  } catch (mailErr) {
    console.error('Időpont sztornózva e-mail hiba:', mailErr);
    return { sent: false, error: 'Az e-mail küldése sikertelen volt, ezért a sztornózott státusz nem lett beállítva.' };
  }
}

async function sendAppointmentConfirmationEmail(
  appointment: AppointmentForConfirmationEmail,
  appointmentMeta: AppointmentDateTimeMeta,
  idempotencyKey: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, error: 'Nincs érvényes e-mail cím, ezért az időpont visszaigazolása nem küldhető el.' };
  }

  if (!resendKey) {
    return { sent: false, error: 'Hiányzik a RESEND_API_KEY, ezért az időpont visszaigazoló e-mail nem küldhető el.' };
  }

  const resend = createIdempotentResendSender(idempotencyKey);
  const appointmentLocale = getAppointmentLocale(appointment);
  const isGerman = appointmentLocale === 'de';
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));
  const customerPhone = escapeHtml(appointment.phone || '');
  const treatment = escapeHtml(appointment.treatment || (isGerman ? 'Zahnarzttermin' : 'Fogászati időpont'));
  const location = escapeHtml(appointmentMeta.location);
  const displayDateTime = escapeHtml(appointmentMeta.displayDateTime);
  const googleCalendarUrl = escapeHtml(appointmentMeta.googleCalendarUrl);
  const appleCalendarUrl = escapeHtml(appointmentMeta.appleCalendarUrl);
  const consultationPolicyNotice = appointmentMeta.isConsultationPolicyApplicable
    ? isGerman
      ? `
            <p style="font-size:11px; color:#64748b; line-height:1.55; margin:18px 0 0 0;">
              <strong>Wichtiger Hinweis für Beratungstermine:</strong> Bei Beratungsterminen ab dem 01.07.2026 kann Crown Dental eine Bereitstellungsgebühr in Höhe des jeweils gültigen Beratungshonorars berechnen, wenn der Termin nicht spätestens 24 Stunden vor der Behandlung abgesagt wird oder der Patient zum vereinbarten Termin nicht erscheint.
            </p>
        `
      : `
            <p style="font-size:11px; color:#64748b; line-height:1.55; margin:18px 0 0 0;">
              <strong>Fontos tájékoztatás konzultációs időpont esetén:</strong> A 2026.07.01. utáni konzultációs időpontokra vonatkozóan, amennyiben az időpont lemondása nem történik meg legkésőbb 24 órával a kezelés előtt, vagy a páciens nem jelenik meg az egyeztetett időpontban, a Crown Dental jogosult a konzultáció mindenkori díjával megegyező rendelkezésre állási díjat felszámítani.
            </p>
        `
    : '';

  if (appointmentLocale === 'en' || appointmentLocale === 'sk') {
    const copy = appointmentLocale === 'sk'
      ? {
          subject: `Váš termín je potvrdený – ${appointmentMeta.displayDateTime} | Crown Dental`, greeting: `Dobrý deň, ${greetingName}!`,
          eyebrow: 'Potvrdenie termínu Crown Dental', intro: 'Váš presný termín zubného ošetrenia bol potvrdený.', appointment: 'Váš termín', treatment: 'Ošetrenie', location: 'Miesto',
          arrive: 'Prosíme, príďte približne 5 minút vopred. Ak sa nemôžete dostaviť, oznámte nám to telefonicky aspoň 24 hodín pred ošetrením.',
          google: 'Pridať do Kalendára Google', apple: 'Pridať do Apple Kalendára / Outlooku', fallback: 'Ak sa kalendár neotvorí automaticky, termín si môžete uložiť manuálne:', signoff: 'S pozdravom',
        }
      : {
          subject: `Your appointment is confirmed – ${appointmentMeta.displayDateTime} | Crown Dental`, greeting: `Hello ${greetingName}!`,
          eyebrow: 'Crown Dental appointment confirmation', intro: 'Your exact dental appointment has been confirmed.', appointment: 'Your appointment', treatment: 'Treatment', location: 'Location',
          arrive: 'Please arrive about 5 minutes early. If you cannot attend, please let us know by phone at least 24 hours before treatment.',
          google: 'Add to Google Calendar', apple: 'Add to Apple Calendar / Outlook', fallback: 'If the calendar does not open automatically, you can add the appointment manually:', signoff: 'Kind regards',
        };
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>', to: email, subject: copy.subject,
        html: `<div style="font-family:'Segoe UI',sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden"><div style="background:linear-gradient(135deg,#0284c7,#0f172a);padding:36px 30px;text-align:center;color:white"><p>${copy.eyebrow}</p><h1>${copy.greeting}</h1><p>${copy.intro}</p></div><div style="padding:34px 30px"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:16px;padding:24px"><p>${copy.appointment}</p><p style="font-size:30px;font-weight:900">${displayDateTime}</p><p><strong>${copy.treatment}:</strong> ${treatment}<br><strong>${copy.location}:</strong> ${location}</p></div><p style="font-size:16px;line-height:1.65;color:#334155">${copy.arrive}</p><a href="${googleCalendarUrl}" style="display:block;text-align:center;background:#0284c7;color:white;text-decoration:none;font-weight:900;padding:16px;border-radius:14px;margin:12px 0">${copy.google}</a><a href="${appleCalendarUrl}" style="display:block;text-align:center;background:#0f172a;color:white;text-decoration:none;font-weight:900;padding:16px;border-radius:14px">${copy.apple}</a><p style="color:#64748b">${copy.fallback} <strong>${displayDateTime}</strong></p></div><div style="background:#f8fafc;padding:20px;text-align:center;color:#64748b">${copy.signoff},<br><strong>Crown Dental</strong></div></div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Nemzetközi időpont-visszaigazoló e-mail hiba:', mailErr);
      return { sent: false, error: 'Az e-mail küldése közben hiba történt, ezért a státusz nem lett átállítva.' };
    }
  }

  if (isGerman) {
    try {
      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>',
        to: email,
        subject: `Ihr Termin ist bestätigt – ${appointmentMeta.displayDateTime} | Crown Dental`,
        html: `
          <div style="display:none; max-height:0; overflow:hidden;">Ihr Termin bei Crown Dental wurde für ${displayDateTime} bestätigt. Fügen Sie ihn mit einem Klick Ihrem Kalender hinzu.</div>
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0284c7,#0f172a); padding:36px 30px; text-align:center;">
              <p style="margin:0 0 10px; color:#bae6fd; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.8px;">Crown Dental Terminbestätigung</p>
              <h1 style="margin:0; color:#ffffff; font-size:28px; line-height:1.25; font-weight:900;">Guten Tag ${greetingName}!</h1>
              <p style="margin:14px 0 0; color:#e0f2fe; font-size:16px; line-height:1.6;">Ihr genauer Zahnarzttermin wurde verbindlich eingetragen.</p>
            </div>
            <div style="padding:34px 30px;">
              <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:16px; padding:24px; margin:0 0 26px;">
                <p style="margin:0 0 8px; color:#0369a1; font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:1.2px;">Ihr Termin</p>
                <p style="margin:0; color:#0f172a; font-size:30px; line-height:1.2; font-weight:900;">${displayDateTime}</p>
                <p style="margin:18px 0 0; color:#334155; font-size:15px; line-height:1.6;"><strong>Behandlung:</strong> ${treatment}<br><strong>Ort:</strong> ${location}</p>
                ${customerPhone ? `<p style="margin:14px 0 0; color:#64748b; font-size:14px; line-height:1.6;">Ihre Telefonnummer: <strong style="color:#0f172a;">${customerPhone}</strong></p>` : ''}
              </div>
              <p style="font-size:16px; color:#334155; line-height:1.65; margin:0 0 18px;">Bitte kommen Sie nach Möglichkeit 5 Minuten vor Ihrem Termin. So können Sie die kurze Wartezeit entspannt in unserem komfortablen Praxiswartebereich verbringen. Falls Sie den Termin nicht wahrnehmen können, bitten wir Sie, uns spätestens 24 Stunden vor der Behandlung telefonisch zu informieren, damit wir den frei gewordenen Termin einem anderen Patienten anbieten können.</p>
              <div style="display:block; margin:26px 0;">
                <a href="${googleCalendarUrl}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px; margin-bottom:12px;">Zu Google Kalender hinzufügen</a>
                <a href="${appleCalendarUrl}" style="display:block; text-align:center; background:#0f172a; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">Zu Apple Kalender / Outlook hinzufügen</a>
              </div>
              <p style="font-size:14px; color:#64748b; line-height:1.6; margin:0;">Falls sich der Kalender nicht automatisch öffnet, können Sie den Termin auch manuell eintragen: <strong style="color:#0f172a;">${displayDateTime}</strong>.</p>
              ${consultationPolicyNotice}
            </div>
            <div style="background:#f8fafc; padding:22px 30px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Mit freundlichen Grüßen<br><strong style="color:#0f172a;">Ihr Crown Dental Team</strong></p>
              <p style="font-size:12px; color:#94a3b8; margin:10px 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
            </div>
          </div>`,
      });
      return { sent: true };
    } catch (mailErr) {
      console.error('Deutsche Terminbestätigung konnte nicht gesendet werden:', mailErr);
      return { sent: false, error: 'Az e-mail küldése közben hiba történt, ezért a státusz nem lett átállítva.' };
    }
  }

  try {
    await resend.emails.send({
      from: 'Crown Dental <info@crowndental.hu>',
      to: email,
      subject: `Időpontja visszaigazolva – ${appointmentMeta.displayDateTime} | Crown Dental`,
      html: `
        <div style="display:none; max-height:0; overflow:hidden;">
          Visszaigazoltuk Crown Dental időpontját: ${displayDateTime}. Egy kattintással hozzáadhatja a naptárához.
        </div>
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0284c7,#0f172a); padding:36px 30px; text-align:center;">
            <p style="margin:0 0 10px 0; color:#bae6fd; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.8px;">Crown Dental időpont visszaigazolás</p>
            <h1 style="margin:0; color:#ffffff; font-size:28px; line-height:1.25; font-weight:900;">Kedves ${greetingName}!</h1>
            <p style="margin:14px 0 0 0; color:#e0f2fe; font-size:16px; line-height:1.6;">Rögzítettük a pontos fogászati időpontját.</p>
          </div>

          <div style="padding:34px 30px;">
            <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:16px; padding:24px; margin:0 0 26px 0;">
              <p style="margin:0 0 8px 0; color:#0369a1; font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:1.2px;">Pontos időpont</p>
              <p style="margin:0; color:#0f172a; font-size:30px; line-height:1.2; font-weight:900;">${displayDateTime}</p>
              <p style="margin:18px 0 0 0; color:#334155; font-size:15px; line-height:1.6;">
                <strong>Kezelés:</strong> ${treatment}<br>
                <strong>Helyszín:</strong> ${location}
              </p>
              ${customerPhone ? `<p style="margin:14px 0 0 0; color:#64748b; font-size:14px; line-height:1.6;">Megadott telefonszám: <strong style="color:#0f172a;">${customerPhone}</strong></p>` : ''}
            </div>

            <p style="font-size:16px; color:#334155; line-height:1.65; margin:0 0 18px 0;">
              Kérjük, lehetőség szerint érkezzen 5 perccel korábban az időpontjához képest, így kényelmesen, nyugodt környezetben töltheti a várakozási időt a prémium rendelői várónkban. Amennyiben az időpont mégsem alkalmas, kérjük, legkésőbb 24 órával a kezelés előtt jelezze nekünk telefonon, hogy más páciensnek is fel tudjuk ajánlani a felszabaduló időpontot.
            </p>

            <div style="display:block; margin:26px 0;">
              <a href="${googleCalendarUrl}" style="display:block; text-align:center; background:#0284c7; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px; margin-bottom:12px;">
                Hozzáadás Google Calendarhoz
              </a>
              <a href="${appleCalendarUrl}" style="display:block; text-align:center; background:#0f172a; color:#ffffff; text-decoration:none; font-size:17px; font-weight:900; padding:16px 22px; border-radius:14px;">
                Hozzáadás Apple / Outlook naptárhoz
              </a>
            </div>

            <p style="font-size:14px; color:#64748b; line-height:1.6; margin:0;">
              Ha a naptárgomb nem nyílik meg automatikusan, a levélben szereplő pontos időpont alapján kézzel is rögzítheti: <strong style="color:#0f172a;">${displayDateTime}</strong>.
            </p>
            ${consultationPolicyNotice}
          </div>

          <div style="background:#f8fafc; padding:22px 30px; border-top:1px solid #e2e8f0; text-align:center;">
            <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">Üdvözlettel,<br><strong style="color:#0f172a;">A Crown Dental csapata</strong></p>
            <p style="font-size:12px; color:#94a3b8; margin:10px 0 0 0;">${CLINIC_PHONE_DISPLAY} | info@crowndental.hu</p>
          </div>
        </div>
      `,
    });

    return { sent: true };
  } catch (mailErr) {
    console.error('Időpont visszaigazoló e-mail hiba:', mailErr);
    return { sent: false, error: 'Az e-mail küldése közben hiba történt, ezért a státusz nem lett átállítva.' };
  }
}

export async function POST(req: Request) {
  const originError = rejectUntrustedMutation(req);
  if (originError) return originError;
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    const { action, table, id, value, appointmentDateTime, statusNote } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Szerver beállítási hiba. Hiányzik a Service Role Key!' }, { status: 500 });
    }

    const safeTable = String(table || '');
    if (!ALLOWED_TABLES.has(safeTable)) {
      return NextResponse.json({ error: 'Ismeretlen admin tábla.' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Hiányzó azonosító.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let noAnswerEmailResult: Awaited<ReturnType<typeof sendNoAnswerEmail>> | null = null;
    let noAnswerEmailIdempotencyKey: string | undefined;
    let noAnswerEmailSentAt: string | undefined;
    let cancellationEmailResult: Awaited<ReturnType<typeof sendAppointmentCancellationEmail>> | null = null;
    let cancellationEmailIdempotencyKey: string | undefined;
    let cancellationEmailSentAt: string | undefined;
    let appointmentConfirmationEmailSent = false;
    let appointmentConfirmationDateTime: string | undefined;
    let appointmentConfirmationIdempotencyKey: string | undefined;
    let appointmentConfirmationSentAt: string | undefined;
    let specialNoteUpdatedAt: string | undefined;
    let normalizedStatusNote = '';

    if (action === 'hide') {
      const { error } = await supabase.from(safeTable).update({ is_hidden: true }).eq('id', id);
      if (error) throw error;
    } else if (action === 'update_status') {
      if (!ALLOWED_STATUSES.has(String(value || ''))) {
        return NextResponse.json({ error: 'Ismeretlen státusz.' }, { status: 400 });
      }

      if (value === 'cancelled' && safeTable !== 'appointments') {
        return NextResponse.json({ error: 'A sztornózott státusz csak időpontkérésekhez használható.' }, { status: 400 });
      }

      if (value === 'special' && safeTable !== 'appointments') {
        return NextResponse.json({ error: 'A különleges egyeztetés státusz csak időpontkérésekhez használható.' }, { status: 400 });
      }

      normalizedStatusNote = String(statusNote || '').trim().replace(/\s+/g, ' ').slice(0, 280);

      if (safeTable === 'appointments' && value === 'special' && !normalizedStatusNote) {
        return NextResponse.json({ error: 'Különleges egyeztetéshez kötelező rövid megjegyzést megadni.' }, { status: 400 });
      }

      if (safeTable === 'appointments' && value === 'no_answer') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,treatment,status,locale,no_answer_email_idempotency_key')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'no_answer') {
          noAnswerEmailIdempotencyKey = buildEmailIdempotencyKey(
            'no-answer',
            id,
            data.no_answer_email_idempotency_key,
          );
          noAnswerEmailResult = await sendNoAnswerEmail(data, noAnswerEmailIdempotencyKey);

          if (!noAnswerEmailResult.sent) {
            return noStoreJson(
              { error: noAnswerEmailResult.error || 'A visszahívó e-mail nem küldhető el; a státusz változatlan maradt.' },
              { status: 502 },
            );
          }

          noAnswerEmailSentAt = new Date().toISOString();
        }
      }

      if (safeTable === 'appointments' && value === 'cancelled') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,treatment,status,locale,cancellation_email_idempotency_key')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'cancelled') {
          cancellationEmailIdempotencyKey = buildEmailIdempotencyKey(
            'cancelled',
            id,
            data.cancellation_email_idempotency_key,
          );
          cancellationEmailResult = await sendAppointmentCancellationEmail(data, cancellationEmailIdempotencyKey);

          if (!cancellationEmailResult.sent) {
            return noStoreJson(
              { error: cancellationEmailResult.error || 'A sztornózó e-mail nem küldhető el; a státusz változatlan maradt.' },
              { status: 502 },
            );
          }

          cancellationEmailSentAt = new Date().toISOString();
        }
      }

      if (safeTable === 'appointments' && value === 'processed') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,city,treatment,status,locale,confirmation_email_idempotency_key')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'processed') {
          const appointmentMeta = buildAppointmentDateTimeMeta(data, appointmentDateTime);

          if (!appointmentMeta) {
            return NextResponse.json({ error: 'Kérjük, adja meg a pontos időpontot év-hónap-nap óra:perc formátumban.' }, { status: 400 });
          }

          appointmentConfirmationIdempotencyKey = buildEmailIdempotencyKey(
            'processed',
            id,
            data.confirmation_email_idempotency_key,
            appointmentMeta.displayDateTime,
          );
          const appointmentConfirmationResult = await sendAppointmentConfirmationEmail(
            data,
            appointmentMeta,
            appointmentConfirmationIdempotencyKey,
          );

          if (!appointmentConfirmationResult.sent) {
            return noStoreJson(
              { error: appointmentConfirmationResult.error || 'Az időpont-visszaigazoló e-mail nem küldhető el; a státusz változatlan maradt.' },
              { status: 502 },
            );
          }

          appointmentConfirmationEmailSent = true;
          appointmentConfirmationDateTime = appointmentMeta.displayDateTime;
          appointmentConfirmationSentAt = new Date().toISOString();
        }
      }

      const updatePayload: Record<string, unknown> = { status: value };

      if (safeTable === 'appointments' && value === 'special') {
        specialNoteUpdatedAt = new Date().toISOString();
        updatePayload.special_note = normalizedStatusNote;
        updatePayload.special_note_updated_at = specialNoteUpdatedAt;
      }

      if (noAnswerEmailResult?.sent && noAnswerEmailIdempotencyKey && noAnswerEmailSentAt) {
        updatePayload.no_answer_email_sent_at = noAnswerEmailSentAt;
        updatePayload.no_answer_email_idempotency_key = noAnswerEmailIdempotencyKey;
      }

      if (cancellationEmailResult?.sent && cancellationEmailIdempotencyKey && cancellationEmailSentAt) {
        updatePayload.cancellation_email_sent_at = cancellationEmailSentAt;
        updatePayload.cancellation_email_idempotency_key = cancellationEmailIdempotencyKey;
      }

      if (
        appointmentConfirmationEmailSent &&
        appointmentConfirmationDateTime &&
        appointmentConfirmationIdempotencyKey &&
        appointmentConfirmationSentAt
      ) {
        updatePayload.confirmed_appointment_local = appointmentConfirmationDateTime;
        updatePayload.confirmation_email_sent_at = appointmentConfirmationSentAt;
        updatePayload.confirmation_email_idempotency_key = appointmentConfirmationIdempotencyKey;
      }

      if (safeTable === 'appointments' && value === 'cancelled') {
        updatePayload.confirmed_appointment_local = null;
        updatePayload.confirmation_email_sent_at = null;
      }

      const { error } = await supabase.from(safeTable).update(updatePayload).eq('id', id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Ismeretlen admin művelet.' }, { status: 400 });
    }

    return noStoreJson({
      success: true,
      noAnswerEmailSent: noAnswerEmailResult?.sent ?? false,
      cancellationEmailSent: cancellationEmailResult?.sent ?? false,
      specialNote: value === 'special' ? normalizedStatusNote : undefined,
      specialNoteUpdatedAt,
      appointmentConfirmationEmailSent,
      appointmentConfirmationDateTime,
    });
  } catch (error: unknown) {
    console.error('Action API Hiba:', error);
    return noStoreJson({ error: 'Szerverhiba történt a művelet során.' }, { status: 500 });
  }
}
