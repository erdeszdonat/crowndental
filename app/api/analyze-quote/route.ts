import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
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

    // 1. KULCSOK ELLENŐRZÉSE (Golyóálló verzió)
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GENINI_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!geminiApiKey) {
      return NextResponse.json({ 
        error: 'Rendszerhiba: A Gemini AI kulcs nem olvasható a Vercelen. Kérjük, végezzen egy Clean Redeploy-t!' 
      }, { status: 500 });
    }

    // 2. GEMINI AI FOLYAMAT
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `
    Te egy profi fogászati elemző vagy a Crown Dentalnál.
    Feltöltöttek egy árajánlatot. Olvasd ki a tételeket és árakat.
    Párosítsd őket a Crown Dental áraival (korona: 55000, implant: 190000, röntgen: 10000 stb).
    Mindig adj 25% kedvezményt a konkurens árakhoz képest a nem listázott tételeknél.
    
    VÁLASZ: Kizárólag érvényes JSON, magyarázat nélkül!
    {
      "items": [{ "name": "Kezelés", "competitorPrice": 1000, "ourPrice": 800 }],
      "competitorTotal": 1000,
      "ourTotal": 800,
      "savings": 200
    }`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: file.type } }
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const aiResult = JSON.parse(cleanJson);

    // 3. SUPABASE MENTÉS (Csak ha megvannak a kulcsok)
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('quote_leads').insert([{
          name, nickname: nickname || '', email, phone,
          original_total: aiResult.competitorTotal,
          new_total: aiResult.ourTotal,
          savings: aiResult.savings,
      }]);
    }

    // 4. RESEND E-MAIL (Csak ha megvan a kulcs)
    if (resendKey) {
      const resend = new Resend(resendKey);
      const itemsHtml = aiResult.items.map((item: any) => 
        `<tr><td>${item.name}</td><td><del>${item.competitorPrice} Ft</del></td><td><strong>${item.ourPrice} Ft</strong></td></tr>`
      ).join('');

      await resend.emails.send({
        from: 'Crown Dental <info@crowndental.hu>',
        to: email,
        subject: `Kész az AI elemzés! ${aiResult.savings.toLocaleString()} Ft megtakarítás`,
        html: `<div style="font-family: sans-serif; padding: 20px;">
                <h1>Kedves ${nickname || name}!</h1>
                <p>Kiszámoltuk a megtakarítását: <strong>${aiResult.savings.toLocaleString()} Ft</strong>.</p>
                <table border="1" cellpadding="10" style="border-collapse: collapse;">
                  <thead><tr><th>Kezelés</th><th>Eredeti ár</th><th>Crown Dental ár</th></tr></thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
               </div>`
      });
    }

    return NextResponse.json({ success: true, result: aiResult });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Hiba történt az elemzés során. Kérjük, töltsön fel egy tisztább képet!' }, { status: 500 });
  }
}
