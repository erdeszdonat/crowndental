import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Segédfüggvény a várakozáshoz retry esetén
const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  console.log("--- AI KALKULÁTOR ANALÍZIS INDÍTÁSA (NAGY TELJESÍTMÉNYŰ MODELLEK) ---");
  
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
        error: 'Rendszerhiba: Az AI kulcs nem olvasható a szerveren. Kérjük, végezzen egy CLEAN REDEPLOY-t a Vercelen!' 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `
    Te egy profi fogászati árajánlat elemző vagy a Crown Dental klinikánál.
    A feladatod, hogy a feltöltött dokumentumban lévő kezeléseket és azok árait felismerd.
    
    Crown Dental Fix Árak összehasonlításhoz:
    - Fémkerámia korona: 42.000 Ft
    - Cirkónium korona: 55.000 Ft
    - Implantátum beültetés (Alpha Bio/DIO): 190.000 Ft
    - Konzultáció/Röntgen/CT: 10.000 Ft
    - Foghúzás: 25.000 Ft
    - Fogtömés: 30.000 Ft
    - Gyökérkezelés: 30.000 Ft
    - Kivehető fogsor: 110.000 Ft
    - Fogkőeltávolítás: 15.000 Ft
    - Fogfehérítés: 45.000 Ft
    
    SZABÁLYOK:
    1. Ha egy tétel nincs a listán, adj meg egy 25%-kal olcsóbb árat nálunk, mint a fájlban talált ár.
    2. Csak érvényes JSON struktúrában válaszolj, mindenféle magyarázat és markdown jelölés nélkül!
    
    FORMÁTUM:
    {
      "items": [{ "name": "Kezelés neve", "competitorPrice": 120000, "ourPrice": 85000 }],
      "competitorTotal": 120000,
      "ourTotal": 85000,
      "savings": 35000
    }`;

    let responseText = "";
    let success = false;

    // --- A LISTÁD ALAPJÁN ELÉRHETŐ MODELLEK ---
    const modelsToTry = [
      "gemini-2.5-flash",       // 1. számú választás (Nagyon okos)
      "gemini-3.1-flash-lite",  // 2. számú választás (Legmagasabb RPM kereted van rá)
      "gemini-2.5-flash-lite",  // 3. számú választás (Stabil tartalék)
      "gemini-3-flash"          // 4. számú választás
    ];

    for (const modelName of modelsToTry) {
      if (success) break;
      
      console.log(`Próbálkozás a nálad elérhető modellel: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);
        
        const response = await result.response;
        responseText = response.text();
        
        if (responseText && responseText.includes('{')) {
          success = true;
          console.log(`SIKER! Használt modell: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Hiba a(z) ${modelName} modellnél: ${err.message}`);
        // Ha túlterhelt (503), várunk egy kicsit a következő modell előtt
        if (err.message?.includes("503")) await wait(1000);
        continue; 
      }
    }

    if (!success || !responseText) {
      throw new Error("Minden elérhető AI modellünk túlterhelt jelenleg.");
    }

    // JSON kinyerése és tisztítása
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Hibás válaszformátum az AI-tól.");
    const aiResult = JSON.parse(jsonMatch[0]);

    // 2. SUPABASE MENTÉS
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
      } catch (dbErr) { console.error("DB mentési hiba:", dbErr); }
    }

    // 3. RESEND E-MAIL KÜLDÉS (Hitelesített domaineddel)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const itemsHtml = aiResult.items.map((item: any) => 
          `<tr><td style="padding:10px; border-bottom:1px solid #eee;">${item.name}</td><td style="padding:10px; border-bottom:1px solid #eee; color:#999;"><del>${item.competitorPrice.toLocaleString()} Ft</del></td><td style="padding:10px; border-bottom:1px solid #eee; color:#0284c7; font-weight:bold;">${item.ourPrice.toLocaleString()} Ft</td></tr>`
        ).join('');

        await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: `Kész az elemzése! ${aiResult.savings.toLocaleString()} Ft-ot spórolhat nálunk`,
          html: `
            <div style="font-family:sans-serif; max-width:600px; margin:0 auto; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
              <div style="background-color:#0284c7; padding:30px; text-align:center; color:white;">
                <h1 style="margin:0;">Kedves ${nickname || name}!</h1>
                <p style="margin-top:10px; opacity:0.9;">Kielemeztük a feltöltött árajánlatot a legújabb AI technológiával.</p>
              </div>
              <div style="padding:30px;">
                <p style="font-size:16px;">Saját laborunknak köszönhetően <strong>${aiResult.savings.toLocaleString()} Ft-ot spórolhat</strong> velünk!</p>
                <div style="background:#f0f9ff; padding:20px; border-radius:8px; text-align:center; margin:25px 0;">
                  <p style="margin:0; color:#0369a1;">Az Ön megtakarítása:</p>
                  <h2 style="margin:5px 0 0 0; color:#0284c7; font-size:32px;">${aiResult.savings.toLocaleString()} Ft</h2>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                  <thead><tr style="text-align:left; color:#6b7280; font-size:12px; text-transform:uppercase;"><th>Kezelés</th><th>Másik hely</th><th>Crown Dental</th></tr></thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <p style="margin-top:30px; color:#666; font-size:14px;">Kollégáink hamarosan keresni fogják a megadott (<strong>${phone}</strong>) telefonszámon.</p>
              </div>
            </div>`
        });
      } catch (mailErr) { console.error("Email küldési hiba:", mailErr); }
    }

    return NextResponse.json({ success: true, result: aiResult });

  } catch (error: any) {
    console.error("Végzetes API hiba:", error);
    return NextResponse.json({ 
      error: 'Az AI szolgáltatás jelenleg túlterhelt. Kérjük, próbálja meg újra 30 másodperc múlva!' 
    }, { status: 500 });
  }
}
