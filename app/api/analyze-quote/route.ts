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

    if (!file || !email || !name) {
      console.log("Hiba: Hiányzó adatok az űrlapból.");
      return NextResponse.json({ error: 'Kérjük, töltsön fel egy fájlt és adja meg az adatait.' }, { status: 400 });
    }

    // 1. GEMINI AI INICIALIZÁLÁSA ÉS FÁJL OLVASÁSA
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("HIÁNYZIK A GEMINI API KULCS!");
      return NextResponse.json({ error: 'Rendszerhiba: Nincs AI kulcs beállítva a szerveren.' }, { status: 500 });
    }

    // Fájl átalakítása Base64 formátumba, amit a Gemini megért (Képek és PDF-ek)
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // A Gemini 1.5 Flash a legújabb, leggyorsabb modell, kiváló dokumentum/számla elemzésre
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Te egy profi, precíz fogászati árajánlat elemző vagy a Crown Dental klinikánál.
    A felhasználó feltöltött egy fogászati árajánlatot vagy kezelési tervet, amit egy MÁSIK klinikától kapott (ez egy kép vagy PDF).
    
    FELADATOD:
    1. Olvasd el a feltöltött dokumentumban lévő kezeléseket és az ahhoz tartozó árakat (keresd a tételeket és a végösszegeket).
    2. Párosítsd össze a talált tételeket a Crown Dental hivatalos áraival.
    3. Számold ki az eredeti összesített árat, a mi összesített árunkat, és a pontos megtakarítást (különbséget).
    
    A Crown Dental Hivatalos Árai (közelítő értékek):
    - Fémkerámia korona: 42000 Ft
    - Cirkónium korona: 55000 Ft
    - Implantátum beültetés (Alpha Bio/DIO): 190000 Ft
    - Állapotfelmérés / Röntgen / CT / Konzultáció: 10000 Ft (vagy ingyenes, használd a 10000-et)
    - Foghúzás: 25000 Ft
    - Fogtömés: 30000 Ft
    - Gyökérkezelés: 30000 Ft
    - Kivehető fogsor: 110000 Ft
    - Fogkőeltávolítás: 15000 Ft
    - Fogfehérítés: 45000 (fogívenként) Ft
    
    SZABÁLY: Ha a feltöltött fájlban olyan kezelés van, ami nincs a fenti listánkon, becsüld meg és adj meg egy reális árat, ami KÖTELEZŐEN kb. 20-30%-kal olcsóbb, mint a versenytársé, hiszen saját laborunk van. Mindig nekünk kell olcsóbbnak lennünk!
    
    FONTOS: A válaszod KIZÁRÓLAG egy érvényes JSON objektum legyen! Ne írj köré magyarázatot, ne használj markdown jelöléseket (\`\`\`json). Csak a tiszta JSON kód!
    
    KÖTELEZŐ JSON FORMÁTUM:
    {
      "items": [
        { "name": "Kezelés pontos megnevezése", "competitorPrice": 100000, "ourPrice": 55000 }
      ],
      "competitorTotal": 200000,
      "ourTotal": 110000,
      "savings": 90000
    }
    `;

    console.log(`Fájl küldése a Google Gemini-nek elemzésre... (Típus: ${mimeType})`);
    
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
    console.log("AI Válasz megérkezett!");

    // JSON tisztítása (ha a Gemini véletlenül markdown blokkba tenné a JSON-t)
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("AI JSON Parse Hiba. Nyers válasz:", responseText);
      return NextResponse.json({ error: 'Az AI nem tudta értelmezni a fájlt. Kérjük, próbáljon meg egy tisztább képet vagy PDF-et feltölteni.' }, { status: 400 });
    }

    // 2. SUPABASE MENTÉS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error: dbError } = await supabase.from('quote_leads').insert([{
            name, 
            nickname: nickname || '', 
            email, 
            phone,
            original_total: aiResult.competitorTotal,
            new_total: aiResult.ourTotal,
            savings: aiResult.savings,
        }]);

        if (dbError) {
          console.error("Supabase mentési hiba:", dbError);
        } else {
          console.log("Sikeres mentés a Supabase táblába!");
        }
      } catch (dbEx) {
        console.error("Supabase kliens hiba:", dbEx);
      }
    } else {
      console.warn("Supabase kulcsok hiányoznak!");
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

        const { data, error } = await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>', // Itt már a beállított, valós domain-ed van!
          to: email,
          subject: `Elkészült az elemzés: ${aiResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat nálunk!`,
          html: `
            <div style="font-family: Helvetica, sans-serif; color: #333; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0284c7; padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Kedves ${greeting}!</h1>
                <p style="color: #e0f2fe; margin-top: 10px; font-size: 16px;">Mesterséges intelligenciánk sikeresen kielemezte a feltöltött árajánlatot.</p>
              </div>
              <div style="padding: 30px 20px;">
                <p style="font-size: 16px;">Örömmel értesítjük, hogy saját fogtechnikai laborunknak és modern eljárásainknak köszönhetően <strong>${aiResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat</strong> velünk!</p>
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
                  <p style="margin: 0; color: #0369a1; font-size: 18px;">Új végösszeg:</p>
                  <h2 style="margin: 5px 0 0 0; color: #0284c7; font-size: 28px;">${aiResult.ourTotal.toLocaleString('hu-HU')} Ft</h2>
                </div>
                <p style="font-size: 16px; margin-top: 30px;">Kollégáink hamarosan keresni fogják a megadott (<strong>${phone}</strong>) telefonszámon egy személyes konzultáció egyeztetése céljából, hogy pontosítsuk a részleteket.</p>
                <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">Üdvözlettel,<br><strong style="color: #333;">A Crown Dental Csapata</strong></p>
              </div>
            </div>
          `
        });

        if (error) {
          console.error("Resend küldési hiba:", error);
        } else {
          console.log("Sikeres email küldés!", data);
        }
      } catch (resendEx) {
        console.error("Resend API kivétel:", resendEx);
      }
    } else {
      console.warn("Hiányzik a Resend API kulcs!");
    }

    console.log("--- AI FOLYAMAT SIKERESEN BEFEJEZŐDÖTT ---");
    return NextResponse.json({ success: true, result: aiResult });
    
  } catch (error) {
    console.error("Általános API Hiba:", error);
    return NextResponse.json({ error: 'Hiba történt a szerveren az elemzés során.' }, { status: 500 });
  }
}
