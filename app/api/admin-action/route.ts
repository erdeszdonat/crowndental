import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getPreferredGreetingName } from '@/lib/names';

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

function isGermanAppointment(appointment: AppointmentForNoAnswerEmail) {
  return /(zahn|kiefer|beratung|oralchirurgie|wurzelkanal|sonstiges|röntgen|dvt|beurteilung)/i.test(
    String(appointment.treatment || ''),
  );
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
  const isGerman = isGermanAppointment(appointment);
  const title = isGerman ? 'Crown Dental Zahnarzttermin' : 'Crown Dental fogászati időpont';
  const details = [
    `${isGerman ? 'Termin' : 'Időpont'}: ${parsed.displayDateTime}`,
    appointment.treatment ? `${isGerman ? 'Behandlung' : 'Kezelés'}: ${appointment.treatment}` : '',
    `${isGerman ? 'Telefon' : 'Telefon'}: ${CLINIC_PHONE_DISPLAY}`,
  ].filter(Boolean).join('\n');
  const encodedTitle = encodeURIComponent(title);
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

async function sendNoAnswerEmail(appointment: AppointmentForNoAnswerEmail) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, warning: 'A státusz mentve, de nincs érvényes e-mail cím a visszahívó levélhez.' };
  }

  if (!resendKey) {
    return { sent: false, warning: 'A státusz mentve, de hiányzik a RESEND_API_KEY, ezért nem ment ki e-mail.' };
  }

  const resend = new Resend(resendKey);
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));
  const customerPhone = escapeHtml(appointment.phone || '');

  if (isGermanAppointment(appointment)) {
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
      return { sent: false, warning: 'A státusz mentve, de az e-mail küldése közben hiba történt.' };
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
    return { sent: false, warning: 'A státusz mentve, de az e-mail küldése közben hiba történt.' };
  }
}

async function sendAppointmentCancellationEmail(appointment: AppointmentForNoAnswerEmail) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, warning: 'A státusz mentve, de nincs érvényes e-mail cím a sztornózó levélhez.' };
  }

  if (!resendKey) {
    return { sent: false, warning: 'A státusz mentve, de hiányzik a RESEND_API_KEY, ezért nem ment ki e-mail.' };
  }

  const resend = new Resend(resendKey);
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));

  if (isGermanAppointment(appointment)) {
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
      return { sent: false, warning: 'A státusz mentve, de az e-mail küldése közben hiba történt.' };
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
    return { sent: false, warning: 'A státusz mentve, de az e-mail küldése közben hiba történt.' };
  }
}

async function sendAppointmentConfirmationEmail(
  appointment: AppointmentForConfirmationEmail,
  appointmentMeta: AppointmentDateTimeMeta
) {
  const resendKey = process.env.RESEND_API_KEY;
  const email = appointment.email?.trim();

  if (!email || !email.includes('@')) {
    return { sent: false, error: 'Nincs érvényes e-mail cím, ezért az időpont visszaigazolása nem küldhető el.' };
  }

  if (!resendKey) {
    return { sent: false, error: 'Hiányzik a RESEND_API_KEY, ezért az időpont visszaigazoló e-mail nem küldhető el.' };
  }

  const resend = new Resend(resendKey);
  const isGerman = isGermanAppointment(appointment);
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
  try {
    const { password, action, table, id, value, appointmentDateTime, statusNote } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Jogosulatlan hozzáférés!' }, { status: 401 });
    }

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
    let appointmentForNoAnswerEmail: AppointmentForNoAnswerEmail | null = null;
    let cancellationEmailResult: Awaited<ReturnType<typeof sendAppointmentCancellationEmail>> | null = null;
    let appointmentForCancellationEmail: AppointmentForNoAnswerEmail | null = null;
    let appointmentConfirmationEmailSent = false;
    let appointmentConfirmationDateTime: string | undefined;
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
          .select('name,nickname,email,phone,treatment,status')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'no_answer') {
          appointmentForNoAnswerEmail = data;
        }
      }

      if (safeTable === 'appointments' && value === 'cancelled') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,treatment,status')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'cancelled') {
          appointmentForCancellationEmail = data;
        }
      }

      if (safeTable === 'appointments' && value === 'processed') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,city,treatment,status')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'processed') {
          const appointmentMeta = buildAppointmentDateTimeMeta(data, appointmentDateTime);

          if (!appointmentMeta) {
            return NextResponse.json({ error: 'Kérjük, adja meg a pontos időpontot év-hónap-nap óra:perc formátumban.' }, { status: 400 });
          }

          const appointmentConfirmationResult = await sendAppointmentConfirmationEmail(data, appointmentMeta);

          if (!appointmentConfirmationResult.sent) {
            return NextResponse.json({ error: appointmentConfirmationResult.error || 'Az időpont visszaigazoló e-mail nem küldhető el.' }, { status: 500 });
          }

          appointmentConfirmationEmailSent = true;
          appointmentConfirmationDateTime = appointmentMeta.displayDateTime;
        }
      }

      const updatePayload: Record<string, any> = { status: value };

      if (safeTable === 'appointments' && value === 'special') {
        specialNoteUpdatedAt = new Date().toISOString();
        updatePayload.special_note = normalizedStatusNote;
        updatePayload.special_note_updated_at = specialNoteUpdatedAt;
      }

      const { error } = await supabase.from(safeTable).update(updatePayload).eq('id', id);
      if (error) throw error;

      if (appointmentConfirmationEmailSent && appointmentConfirmationDateTime) {
        const { error: confirmationMetaError } = await supabase
          .from('appointments')
          .update({
            confirmed_appointment_local: appointmentConfirmationDateTime,
            confirmation_email_sent_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (confirmationMetaError) {
          console.warn('Időpont visszaigazolás meta mentési figyelmeztetés:', confirmationMetaError);
        }
      }

      if (safeTable === 'appointments' && value === 'cancelled') {
        const { error: cancellationMetaError } = await supabase
          .from('appointments')
          .update({
            confirmed_appointment_local: null,
            confirmation_email_sent_at: null,
          })
          .eq('id', id);

        if (cancellationMetaError) {
          console.warn('Időpont sztornózás meta törlési figyelmeztetés:', cancellationMetaError);
        }
      }

      if (appointmentForNoAnswerEmail) {
        noAnswerEmailResult = await sendNoAnswerEmail(appointmentForNoAnswerEmail);
      }

      if (appointmentForCancellationEmail) {
        cancellationEmailResult = await sendAppointmentCancellationEmail(appointmentForCancellationEmail);
      }
    } else {
      return NextResponse.json({ error: 'Ismeretlen admin művelet.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      noAnswerEmailSent: noAnswerEmailResult?.sent ?? false,
      cancellationEmailSent: cancellationEmailResult?.sent ?? false,
      specialNote: value === 'special' ? normalizedStatusNote : undefined,
      specialNoteUpdatedAt,
      appointmentConfirmationEmailSent,
      appointmentConfirmationDateTime,
      warning: noAnswerEmailResult?.warning || cancellationEmailResult?.warning,
    });
  } catch (error: any) {
    console.error('Action API Hiba:', error);
    return NextResponse.json({ error: 'Szerverhiba történt a művelet során.' }, { status: 500 });
  }
}
