import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getPreferredGreetingName } from '@/lib/names';

const ALLOWED_TABLES = new Set(['appointments', 'career_applications', 'quote_leads']);
const ALLOWED_STATUSES = new Set(['new', 'no_answer', 'processed']);
const CLINIC_PHONE_DISPLAY = '+36 70 564 6837';
const CLINIC_PHONE_TEL = '+36705646837';

type AppointmentForNoAnswerEmail = {
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

export async function POST(req: Request) {
  try {
    const { password, action, table, id, value } = await req.json();

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

      const { error } = await supabase.from(safeTable).update({ status: value }).eq('id', id);
      if (error) throw error;

      if (appointmentForNoAnswerEmail) {
        noAnswerEmailResult = await sendNoAnswerEmail(appointmentForNoAnswerEmail);
      }
    } else {
      return NextResponse.json({ error: 'Ismeretlen admin művelet.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      noAnswerEmailSent: noAnswerEmailResult?.sent ?? false,
      warning: noAnswerEmailResult?.warning,
    });
  } catch (error: any) {
    console.error('Action API Hiba:', error);
    return NextResponse.json({ error: 'Szerverhiba történt a művelet során.' }, { status: 500 });
  }
}
