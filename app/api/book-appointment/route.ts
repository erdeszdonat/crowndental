import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isBudapestBookingAvailable, isBudapestCity } from '@/lib/bookingAvailability';
import { upsertMarketingSubscriber } from '@/lib/marketingSubscribers';
import { getPreferredGreetingName } from '@/lib/names';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(req: Request) {
  console.log("--- ÚJ IDŐPONTFOGLALÁSI KÉRÉS ÉRKEZETT ---");

  try {
    const body = await req.json();
    const { city, name, nickname, email, phone, treatment, marketingConsent, marketingConsentSource, marketingConsentLocale } = body;

    if (!name || !email || !phone || !city || !treatment) {
      return NextResponse.json({ error: 'Minden kötelező mezőt ki kell tölteni!' }, { status: 400 });
    }

    if (isBudapestCity(city) && !isBudapestBookingAvailable()) {
      return NextResponse.json({ error: 'A budapesti rendelő jelenleg még nem foglalható. Coming soon...' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Megpróbálja a Service Role kulcsot, ha az nincs, jó az Anon kulcs is
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    // 1. SUPABASE MENTÉS (Szigorú ellenőrzéssel)
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase.from('appointments').insert([{
        name: name,
        nickname: nickname || '',
        email: email,
        phone: phone,
        city: city,
        treatment: treatment
      }]);

      // HA HIBA VAN A SUPABASE-BEN, AZONNAL VISSZADOBJA A BÖNGÉSZŐNEK!
      if (error) {
        console.error("Supabase mentési hiba:", error);
        return NextResponse.json({ error: `Adatbázis hiba: ${error.message}` }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Hiányoznak a Supabase környezeti változók a Vercelből!' }, { status: 500 });
    }

    // 2. RESEND E-MAIL KÜLDÉS A PÁCIENSNEK (Csak ha a DB mentés sikeres volt)
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const greeting = escapeHtml(getPreferredGreetingName(name, nickname));
        const isGerman = marketingConsentLocale === 'de';
        const emailCopy = isGerman
          ? {
              subject: 'Ihre Terminanfrage wurde erhalten – Crown Dental',
              greeting: `Guten Tag ${greeting}!`,
              intro: 'Vielen Dank, dass Sie sich für Crown Dental entschieden haben. Ihre Terminanfrage wurde erfolgreich in unserem System erfasst.',
              details: 'Ihre Angaben',
              clinic: 'Gewählte Praxis',
              treatment: 'Gewünschte Behandlung',
              phone: 'Telefonnummer',
              next: 'Unser Team meldet sich in Kürze, spätestens innerhalb von 24 Stunden, unter der angegebenen Telefonnummer bei Ihnen, um den genauen Termin abzustimmen.',
              signoff: 'Mit freundlichen Grüßen',
              team: 'Ihr Crown Dental Team',
            }
          : {
              subject: 'Időpontfoglalási kérését rögzítettük - Crown Dental',
              greeting: `Kedves ${greeting}!`,
              intro: 'Köszönjük, hogy a Crown Dentalt választotta! Foglalási kérését sikeresen rögzítettük rendszerünkben.',
              details: 'Az Ön által megadott adatok:',
              clinic: 'Választott rendelő',
              treatment: 'Kezelés típusa',
              phone: 'Telefonszám',
              next: 'Munkatársaink hamarosan (legkésőbb 24 órán belül) felveszik Önnel a kapcsolatot a megadott telefonszámon, hogy egyeztessük a pontos időpontot.',
              signoff: 'Üdvözlettel',
              team: 'A Crown Dental csapata',
            };

        await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: emailCopy.subject,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
              <div style="background: linear-gradient(135deg, #0284c7, #0ea5e9); padding:35px 30px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:bold;">${emailCopy.greeting}</h1>
              </div>
              <div style="padding:35px 30px;">
                <p style="font-size:16px; color:#374151; line-height:1.6; margin-top:0;">
                  ${emailCopy.intro}
                </p>
                <div style="background:#f0f9ff; padding:20px 25px; border-radius:12px; margin:25px 0; border:1px solid #bae6fd;">
                  <h3 style="margin:0 0 15px 0; color:#0369a1; font-size:13px; text-transform:uppercase; letter-spacing:1px;">${emailCopy.details}</h3>
                  <p style="margin:8px 0; color:#1e293b; font-size:15px;"><strong>${emailCopy.clinic}:</strong> ${escapeHtml(city)}</p>
                  <p style="margin:8px 0; color:#1e293b; font-size:15px;"><strong>${emailCopy.treatment}:</strong> ${escapeHtml(treatment)}</p>
                  <p style="margin:8px 0; color:#1e293b; font-size:15px;"><strong>${emailCopy.phone}:</strong> ${escapeHtml(phone)}</p>
                </div>
                <p style="font-size:16px; color:#374151; line-height:1.6;">
                  ${emailCopy.next}
                </p>
              </div>
              <div style="background:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:14px; color:#64748b; margin:0; line-height:1.5;">${emailCopy.signoff},<br><strong style="color:#0f172a;">${emailCopy.team}</strong></p>
                <p style="font-size:12px; color:#94a3b8; margin-top:10px;">+36 70 564 6837 | info@crowndental.hu</p>
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        console.error("Resend e-mail hiba:", mailErr);
      }
    }

    if (marketingConsent === true) {
      const marketingResult = await upsertMarketingSubscriber({
        email,
        name,
        nickname,
        phone,
        clinic: city,
        source: marketingConsentSource || 'booking_form',
        locale: marketingConsentLocale || 'hu',
      });

      if (!marketingResult.ok) {
        console.warn('Marketing feliratkozás nem lett mentve:', marketingResult.error);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Végzetes API hiba az időpontfoglalásnál:", error);
    return NextResponse.json({ error: 'Szerverhiba történt az adatok feldolgozásakor.' }, { status: 500 });
  }
}
