import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- CROWN DENTAL FIX ÁRLISTA ---
const CROWN_DENTAL_PRICES: Record<string, string> = {
  "Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv": "10 000 Ft",
  "Tömés": "30 000 - 35 000 Ft",
  "Foghúzás": "25 000 - 35 000 Ft",
  "Röntgen felvétel (kisröntgen)": "5 000 Ft",
  "Panoráma röntgen": "6 000 Ft",
  "Gyökértömés (egy gyökerű)": "25 000 Ft",
  "Gyökértömés (két gyökerű)": "30 000 Ft",
  "Gyökértömés (három gyökerű)": "33 000 Ft",
  "Gyökértömés eltávolítása": "20 000 Ft",
  "Gyökérkezelés alkalmanként": "10 000 Ft",
  "Fogkőeltávolítás (állcsontonként)": "15 000 Ft",
  "Fogfehérítés otthoni (fogívenként)": "30 000 Ft",
  "Fogfehérítés rendelői lámpás (fogívenként)": "45 000 Ft",
  "Ideiglenes korona (rövidtávú)": "6 000 Ft",
  "Ideiglenes korona (hosszútávú)": "15 000 Ft",
  "Fémkerámia korona": "42 000 Ft",
  "Cirkónium korona (fémmentes)": "55 000 Ft",
  "Egyéni fogszínek készítése (foganként)": "15 000 Ft",
  "Kivehető fogsor (kompozit)": "110 000 Ft",
  "Fémlemezes fogsor": "150 000 Ft",
  "Régi híd eltávolítása (pillérenként)": "12 000 Ft",
  "Fogsor alábélelés": "25 000 Ft",
  "Foghúzás műtéttel": "55 000 Ft",
  "Bölcsességfog eltávolítása": "55 000 Ft",
  "Gyökércsúcs rezekció": "55 000 Ft",
  "DIO Implantátum": "240 000 Ft",
  "ALPHA BIO Implantátum": "180 000 Ft",
  "Csontpótlás": "190 000 Ft",
  "Tömés tejfogakba": "15 000 Ft",
  "Barázda zárás": "15 000 Ft",
  "Rögzített készülék": "190 000 - 285 000 Ft",
  "Kivehető készülék": "60 000 - 90 000 Ft",
  "Rögzített készülék aktiválása": "10 000 - 15 000 Ft",
  "Kivehető készülék aktiválása": "5 000 - 8 000 Ft",
};

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

    // 1. API KULCS ELLENŐRZÉSE
    const apiKey = process.env.GEMINI_API_KEY || process.env.GENINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'Rendszerhiba: Az AI kulcs nem olvasható a szerveren. Kérjük, végezzen egy CLEAN REDEPLOY-t a Vercelen!'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Árlista szöveg formázása a prompthoz
    const priceListText = Object.entries(CROWN_DENTAL_PRICES)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const prompt = `
Te egy profi fogászati árajánlat elemző vagy a Crown Dental klinikánál.
A feladatod, hogy a feltöltött dokumentumban lévő kezeléseket és azok árait felismerd,
majd összehasonlítsd a Crown Dental árlistájával.

Crown Dental Fix Árlista:
${priceListText}

SZABÁLYOK:
1. Minden egyes kezelést párosíts a legmegfelelőbb Crown Dental tétellel.
2. Ha egy tétel nincs a listán, adj meg egy 25%-kal olcsóbb árat nálunk, mint a fájlban talált ár.
3. Az árak mindig egész számok legyenek (Ft-ban).
4. Csak érvényes JSON struktúrában válaszolj, mindenféle magyarázat és markdown jelölés nélkül!
5. Magyar ékezetes karaktereket használj a kezelések neveinél!

FORMÁTUM:
{
  "items": [{ "name": "Kezelés neve ékezettel", "competitorPrice": 120000, "ourPrice": 85000 }],
  "competitorTotal": 120000,
  "ourTotal": 85000,
  "savings": 35000
}`;

    let responseText = "";
    let success = false;

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-lite",
      "gemini-3-flash"
    ];

    for (const modelName of modelsToTry) {
      if (success) break;
      console.log(`Próbálkozás modellel: ${modelName}`);

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
        if (err.message?.includes("503")) await wait(1000);
        continue;
      }
    }

    if (!success || !responseText) {
      throw new Error("Minden elérhető AI modellünk túlterhelt jelenleg.");
    }

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

    // 3. RESEND E-MAIL KÜLDÉS
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);

        const itemsHtml = aiResult.items.map((item: any, index: number) =>
          `<tr style="background:${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#1e293b;">${item.name}</td>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; text-align:right; font-size:14px;"><del>${item.competitorPrice.toLocaleString('hu-HU')} Ft</del></td>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#0369a1; font-weight:700; text-align:right; font-size:14px;">${item.ourPrice.toLocaleString('hu-HU')} Ft</td>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#059669; font-weight:600; text-align:right; font-size:14px;">-${(item.competitorPrice - item.ourPrice).toLocaleString('hu-HU')} Ft</td>
          </tr>`
        ).join('');

        await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: `Személyre szabott árajánlata elkészült – ${aiResult.savings.toLocaleString('hu-HU')} Ft megtakarítás`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:640px; margin:0 auto; background:#ffffff;">
              
              <!-- FEJLÉC – szöveges, logó nélkül -->
              <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding:40px 30px; text-align:center; border-radius:12px 12px 0 0;">
                <div style="font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; margin-bottom:4px;">CROWN DENTAL</div>
                <div style="font-size:11px; color:rgba(255,255,255,0.6); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:20px;">Praxis és Labor · Esztergom · Budapest</div>
                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">Kedves ${nickname || name}!</h1>
                <p style="margin:8px 0 0 0; color:rgba(255,255,255,0.85); font-size:15px;">Elkészítettük az Ön személyre szabott árajánlatát.</p>
              </div>

              <!-- TARTALOM -->
              <div style="padding:32px 30px;">

                <!-- MEGTAKARÍTÁS DOBOZ -->
                <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding:24px; border-radius:12px; text-align:center; margin-bottom:28px; border:1px solid #bae6fd;">
                  <p style="margin:0; color:#0369a1; font-size:12px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Az Ön megtakarítása</p>
                  <h2 style="margin:8px 0 0 0; color:#059669; font-size:38px; font-weight:800;">${aiResult.savings.toLocaleString('hu-HU')} Ft</h2>
                </div>

                <p style="font-size:15px; color:#374151; line-height:1.6; margin-bottom:24px;">
                  Saját fogtechnikai laborunknak köszönhetően <strong>${aiResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat</strong> a másik árajánlathoz képest. Az alábbiakban láthatja a tételes összehasonlítást:
                </p>

                <!-- TÁBLÁZAT -->
                <table style="width:100%; border-collapse:collapse; margin-bottom:24px; border:1px solid #e2e8f0;">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="padding:12px 16px; text-align:left; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #0284c7;">Kezelés</th>
                      <th style="padding:12px 16px; text-align:right; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #0284c7;">Másik ajánlat</th>
                      <th style="padding:12px 16px; text-align:right; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #0284c7;">Crown Dental</th>
                      <th style="padding:12px 16px; text-align:right; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #0284c7;">Spórolás</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr style="background:#f0f9ff;">
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; border-top:2px solid #0284c7; color:#1e293b;">Összesen</td>
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; text-align:right; color:#9ca3af; border-top:2px solid #0284c7;"><del>${aiResult.competitorTotal.toLocaleString('hu-HU')} Ft</del></td>
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; text-align:right; color:#0284c7; border-top:2px solid #0284c7;">${aiResult.ourTotal.toLocaleString('hu-HU')} Ft</td>
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; text-align:right; color:#059669; border-top:2px solid #0284c7;">-${aiResult.savings.toLocaleString('hu-HU')} Ft</td>
                    </tr>
                  </tfoot>
                </table>

                <!-- PDF TIPP -->
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:16px; margin-bottom:24px;">
                  <p style="margin:0; font-size:13px; color:#92400e; line-height:1.5;">
                    📄 <strong>Tipp:</strong> Az árajánlatot a weboldalunkon a „PDF Letöltés" gombbal mentheti el nyomtatható formátumban. 
                    Kinyomtatva és a kezelőorvos aláírásával hitelesítve válik érvényessé.
                  </p>
                </div>

                <p style="font-size:14px; color:#6b7280; line-height:1.6; margin-bottom:24px;">
                  Kollégáink hamarosan keresni fogják a megadott telefonszámon (<strong>${phone}</strong>) az időpont egyeztetés céljából.
                </p>

                <!-- CTA GOMB -->
                <div style="text-align:center; margin:32px 0 16px 0;">
                  <a href="tel:+36705646837" style="display:inline-block; background:#0284c7; color:#ffffff; text-decoration:none; padding:16px 36px; border-radius:8px; font-weight:700; font-size:16px;">
                    Hívjon minket: +36 70 564 6837
                  </a>
                </div>
              </div>

              <!-- LÁBLÉC -->
              <div style="background:#f8fafc; padding:24px 30px; border-radius:0 0 12px 12px; border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0; color:#6b7280; font-size:12px; text-align:center; line-height:1.5;">
                  Az árajánlat a kiállítás napjától számított 30 napig érvényes. Az árak az ÁFÁ-t tartalmazzák.<br/>
                  A végleges kezelési terv és összeg a szájüregi vizsgálat után kerül meghatározásra.
                </p>
                <p style="margin:0 0 12px 0; color:#0284c7; font-size:12px; text-align:center; font-weight:600;">
                  Crown Dental – Saját labor, kiemelkedő minőség, elérhető árak.
                </p>
                <div style="border-top:1px solid #e5e7eb; padding-top:12px;">
                  <p style="margin:0; color:#9ca3af; font-size:11px; text-align:center; line-height:1.6;">
                    Kérjük, erre az e-mailre ne válaszoljon, mert a válaszok nem kerülnek feldolgozásra.<br/>
                    Ha kérdése van, írjon nekünk az <a href="mailto:info@crowndental.hu" style="color:#0284c7; text-decoration:underline;">info@crowndental.hu</a> címre,<br/>
                    vagy hívjon minket a <a href="tel:+36705646837" style="color:#0284c7; text-decoration:underline;">+36 70 564 6837</a> telefonszámon.
                  </p>
                </div>
              </div>

            </div>`,
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
