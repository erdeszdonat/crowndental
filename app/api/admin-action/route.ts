import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getPreferredGreetingName } from '@/lib/names';

const ALLOWED_TABLES = new Set(['appointments', 'career_applications', 'quote_leads']);
const ALLOWED_STATUSES = new Set(['new', 'no_answer', 'processed']);
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
    startCompact: `${year}${month}${day}T${hour}${minute}00`,
    endCompact: `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00`,
  };
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
  const title = 'Crown Dental fogászati időpont';
  const details = [
    `Időpont: ${parsed.displayDateTime}`,
    appointment.treatment ? `Kezelés: ${appointment.treatment}` : '',
    `Telefon: ${CLINIC_PHONE_DISPLAY}`,
  ].filter(Boolean).join('\n');
  const encodedTitle = encodeURIComponent(title);
  const encodedLocation = encodeURIComponent(location);
  const encodedDetails = encodeURIComponent(details);

  return {
    displayDateTime: parsed.displayDateTime,
    location,
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
  const greetingName = escapeHtml(getPreferredGreetingName(appointment.name, appointment.nickname));
  const customerPhone = escapeHtml(appointment.phone || '');
  const treatment = escapeHtml(appointment.treatment || 'Fogászati időpont');
  const location = escapeHtml(appointmentMeta.location);
  const displayDateTime = escapeHtml(appointmentMeta.displayDateTime);
  const googleCalendarUrl = escapeHtml(appointmentMeta.googleCalendarUrl);
  const appleCalendarUrl = escapeHtml(appointmentMeta.appleCalendarUrl);

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
              Kérjük, érkezzen pár perccel korábban. Ha bármi közbejön, hívjon minket a lehető leghamarabb.
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
    const { password, action, table, id, value, appointmentDateTime } = await req.json();

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
    let appointmentConfirmationEmailSent = false;
    let appointmentConfirmationDateTime: string | undefined;

    if (action === 'hide') {
      const { error } = await supabase.from(safeTable).update({ is_hidden: true }).eq('id', id);
      if (error) throw error;
    } else if (action === 'update_status') {
      if (!ALLOWED_STATUSES.has(String(value || ''))) {
        return NextResponse.json({ error: 'Ismeretlen státusz.' }, { status: 400 });
      }

      if (safeTable === 'appointments' && value === 'no_answer') {
        const { data, error } = await supabase
          .from('appointments')
          .select('name,nickname,email,phone,status')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Nem található időpontkérés.' }, { status: 404 });

        if (data.status !== 'no_answer') {
          appointmentForNoAnswerEmail = data;
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

      const { error } = await supabase.from(safeTable).update({ status: value }).eq('id', id);
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

      if (appointmentForNoAnswerEmail) {
        noAnswerEmailResult = await sendNoAnswerEmail(appointmentForNoAnswerEmail);
      }
    } else {
      return NextResponse.json({ error: 'Ismeretlen admin művelet.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      noAnswerEmailSent: noAnswerEmailResult?.sent ?? false,
      appointmentConfirmationEmailSent,
      appointmentConfirmationDateTime,
      warning: noAnswerEmailResult?.warning,
    });
  } catch (error: any) {
    console.error('Action API Hiba:', error);
    return NextResponse.json({ error: 'Szerverhiba történt a művelet során.' }, { status: 500 });
  }
}
