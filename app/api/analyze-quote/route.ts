import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  console.log("--- AI KALKULÁTOR ANALÍZIS INDÍTÁSA ---");
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const nickname = formData.get('nickname') as string;

    if (!file || !email || !name) {
      return NextResponse.json({ error: 'Hiányzó adatok az űrlapból.' }, { status: 400 });
    }

    // 1. KULCS ELLENŐRZÉSE
    const apiKey = process.env.GEMINI_API_KEY || process.env.GENINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Rendszerhiba: Az AI kulcs nem olvasható a szerveren. Kérjük, végezzen egy CLEAN REDEPLOY-t!' 
      }, { status: 500 });
    }

    // 2. GEMINI KONFIGURÁCIÓ - JAVÍTOTT MODELL NÉVVEL
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // A "gemini-1.5-flash-latest" az ajánlott, legstabilabb elnevezés
    // Ha ez is 404-et dobna, próbáljuk meg a "gemini-1.5-flash" formátumot újra, de "latest" toldalékkal
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `
    Te egy profi fogászati árajánlat elemző vagy a Crown Dental klinikánál.
    A feladatod, hogy a feltöltött dokumentumban lévő kezeléseket és azok árait felismerd.
    
    Crown Dental Fix Árak:
    - Fémkerámia korona: 42.000 Ft
    - Cirkónium korona: 55.000 Ft
    - Implantátum beültetés: 190.000 Ft
    - Konzultáció/Röntgen: 10.000 Ft
    - Foghúzás: 25.000 Ft
    - Fogtömés: 30.000 Ft
    - Gyökérkezelés: 30.000 Ft
    - Kivehető fogsor: 110.000 Ft
    - Fogkőeltávolítás: 15.000 Ft
    - Fogfehérítés: 45.000 Ft
    
    SZABÁLY: Ha egy tétel nincs a listán, adj meg egy 25%-kal olcsóbb árat nálunk.
    FONTOS: Kizárólag az alábbi JSON struktúrában válaszolj, mindenféle kísérőszöveg és markdown jelölés nélkül!
    
    FORMÁTUM:
    {
      "items": [{ "name": "Kezelés neve", "competitorPrice": 120000, "ourPrice": 85000 }],
      "competitorTotal": 120000,
      "ourTotal": 85000,
      "savings": 35000
    }`;

    console.log("Fájl küldése a Gemini-nek (v1.5-flash-latest)...");
    
    let responseText = "";
    try {
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: file.type } }
      ]);
      const response = await result.response;
      responseText = response.text();
    } catch (aiErr: any) {
      console.error("Gemini API Hiba részletei:", aiErr);
      // Ha a "latest" sem megy, próbáljuk meg a sima "gemini-1.5-flash" verziót fixen
      return NextResponse.json({ error: `AI Kapcsolódási hiba: ${aiErr.message}` }, { status: 500 });
    }

    console.log("AI Válasz érkezett, feldolgozás...");

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Az AI válasza nem tartalmaz feldolgozható adatokat.' }, { status: 500 });
    }

    let aiResult;
    try {
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return NextResponse.json({ error: 'Hiba történt az adatok értelmezésekor.' }, { status: 500 });
    }

    // 3. SUPABASE MENTÉS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('quote_leads').insert([{
            name, nickname: nickname || '', email, phone,
            original_total: aiResult.competitorTotal,
            new_total: aiResult.ourTotal,
            savings: aiResult.savings,
        }]);
      } catch (dbErr) {
        console.error("Supabase mentési hiba:", dbErr);
      }
    }

    // 4. RESEND E-MAIL
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const itemsHtml = aiResult.items.map((item: any) => 
          `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px; border-bottom:1px solid #eee;"><del>${item.competitorPrice.toLocaleString()} Ft</del></td><td style="padding:8px; border-bottom:1px solid #eee; color:#0284c7; font-weight:bold;">${item.ourPrice.toLocaleString()} Ft</td></tr>`
        ).join('');

        await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: `Elkészült az árajánlat elemzése! (${aiResult.savings.toLocaleString()} Ft megtakarítás)`,
          html: `
            <div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
              <div style="background-color:#0284c7; padding:20px; text-align:center; color:white;">
                <h1 style="margin:0;">Kedves ${nickname || name}!</h1>
              </div>
              <div style="padding:20px;">
                <p>Sikeresen kielemeztük a feltöltött árajánlatot. Nálunk ennyit spórolhat:</p>
                <div style="background:#f0f9ff; padding:15px; border-radius:8px; text-align:center; margin:20px 0;">
                  <h2 style="color:#0284c7; margin:0;">${aiResult.savings.toLocaleString()} Ft</h2>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                  <thead><tr style="text-align:left; color:#6b7280;"><th>Kezelés</th><th>Másik helyen</th><th>Crown Dental</th></tr></thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <p style="margin-top:30px;">Kollégáink hamarosan keresni fogják a megadott telefonszámon: <strong>${phone}</strong></p>
              </div>
            </div>`
        });
      } catch (mailErr) {
        console.error("Resend hiba:", mailErr);
      }
    }

    return NextResponse.json({ success: true, result: aiResult });

  } catch (error: any) {
    console.error("ÁLTALÁNOS KRITIKUS HIBA:", error);
    return NextResponse.json({ error: `Szerverhiba történt: ${error.message}` }, { status: 500 });
  }
}
