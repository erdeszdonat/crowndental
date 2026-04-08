import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  console.log("--- VALÓDI GEMINI AI KALKULÁTOR ELINDULT ---");
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const nickname = formData.get('nickname') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Alapvető adatok ellenőrzése
    if (!file || !email || !name) {
      console.log("Hiba: Hiányzó adatok az űrlapból.");
      return NextResponse.json({ error: 'Kérjük, töltsön fel egy fájlt és adja meg az adatait.' }, { status: 400 });
    }

    // 1. GEMINI AI INICIALIZÁLÁSA ÉS KULCS ELLENŐRZÉSE
    // Golyóálló megoldás: Bármelyik elnevezést is használod a Vercelben, működni fog!
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GENINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error("HIÁNYZIK A GEMINI API KULCS!");
      return NextResponse.json({ error: 'Rendszerhiba: Nincs AI kulcs beállítva a szerveren.' }, { status: 500 });
    }

    // Fájl átalakítása Base64 formátumba a Gemini számára
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Te egy profi, precíz fogászati árajánlat elemző vagy a Crown Dental klinikánál.
    A felhasználó feltöltött egy fogászati árajánlatot vagy kezelési tervet, amit egy MÁSIK klinikától kapott.
    
    FELADATOD:
    1. Olvasd el a dokumentumban lévő kezeléseket és azok árait.
    2. Párosítsd össze őket a Crown Dental hivatalos áraival.
    3. Számold ki az eredeti összesített árat, a mi árunkat és a megtakarítást.
    
    Crown Dental Hivatalos Árai (Fix bázis):
    - Fémkerámia korona: 42000 Ft
    - Cirkónium korona: 55000 Ft
    - Implantátum beültetés (Alpha Bio/DIO): 190000 Ft
    - Állapotfelmérés / Röntgen / Konzultáció: 10000 Ft
    - Foghúzás: 25000 Ft
    - Fogtömés: 30000 Ft
    - Gyökérkezelés: 30000 Ft
    - Kivehető fogsor: 110000 Ft
    - Fogkőeltávolítás: 15000 Ft
    - Fogfehérítés (fogívenként): 45000 Ft
    
    SZABÁLY: Ha olyan kezelést látsz, ami nincs a listában, adj meg egy reális Crown Dental árat, ami kb. 25%-kal olcsóbb, mint a talált ár.
    
    FONTOS: A válaszod KIZÁRÓLAG egy érvényes JSON objektum legyen! Ne írj köré szöveget!
    
    JSON FORMÁTUM:
    {
      "items": [
        { "name": "Kezelés neve", "competitorPrice": 100000, "ourPrice": 75000 }
      ],
      "competitorTotal": 100000,
      "ourTotal": 75000,
      "savings": 25000
    }
    `;

    console.log(`Fájl elemzése folyamatban... (Típus: ${mimeType})`);
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("AI JSON Parse Hiba:", responseText);
      return NextResponse.json({ error: 'Az AI nem tudta értelmezni a dokumentumot. Kérjük, töltsön fel tisztább képet.' }, { status: 400 });
    }

    // 2. SUPABASE MENTÉS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('quote_leads').insert([{
            name, 
            nickname: nickname || '', 
            email, 
            phone,
            original_total: aiResult.competitorTotal,
            new_total: aiResult.ourTotal,
            savings: aiResult.savings,
        }]);
        console.log("Sikeres mentés a Supabase-be.");
      } catch (dbEx) {
        console.error("Supabase hiba:", dbEx);
      }
    }

    // 3. RESEND E-MAIL KÜLDÉS
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const greeting = nickname ? nickname : name.split(' ')[0];
        
        const itemsHtml = aiResult.items.map((item: any) => 
          `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>${item.name}</strong></td>
            <td style="padding: 10px 0; color: #999; text-decoration: line-through;">${item.competitorPrice.toLocaleString('hu-HU')} Ft</td>
            <td style="padding: 10px 0; color: #0284c7; font-weight: bold;">${item.ourPrice.toLocaleString('hu-HU')} Ft</td>
          </tr>`
        ).join('');

        await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: `Kész az árajánlat elemzése! ${aiResult.savings.toLocaleString('hu-HU')} Ft megtakarítás`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0284c7; padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Kedves ${greeting}!</h1>
                <p style="color: #e0f2fe; margin-top: 10px;">Az AI sikeresen elemezte feltöltött dokumentumát.</p>
              </div>
              <div style="padding: 30px 20px;">
                <p>Örömmel értesítjük, hogy saját laborunknak köszönhetően <strong>${aiResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat</strong> nálunk!</p>
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                  <thead>
                    <tr style="text-align: left; color: #6b7280; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding-bottom: 10px;">Kezelés</th>
                      <th style="padding-bottom: 10px;">Eredeti ár</th>
                      <th style="padding-bottom: 10px;">Crown Dental</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; color: #0369a1; font-size: 18px;">Összesen nálunk:</p>
                  <h2 style="margin: 5px 0 0 0; color: #0284c7; font-size: 28px;">${aiResult.ourTotal.toLocaleString('hu-HU')} Ft</h2>
                </div>
                <p style="margin-top: 25px;">Kollégáink hamarosan keresni fogják a <strong>${phone}</strong> telefonszámon a részletek egyeztetése miatt.</p>
                <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">Üdvözlettel,<br><strong>A Crown Dental Csapata</strong></p>
              </div>
            </div>
          `
        });
        console.log("Email sikeresen elküldve.");
      } catch (resendEx) {
        console.error("Resend hiba:", resendEx);
      }
    }

    return NextResponse.json({ success: true, result: aiResult });
    
  } catch (error) {
    console.error("Váratlan hiba:", error);
    return NextResponse.json({ error: 'Hiba történt a feldolgozás során.' }, { status: 500 });
  }
}
