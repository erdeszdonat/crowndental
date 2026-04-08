import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req: Request) {
  console.log("--- AI KALKULÁTOR API ELINDULT ---");
  
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

    // 1. AI KIÉRTÉKELÉS SZIMULÁCIÓJA
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Szimulált feldolgozási idő (2.5mp)

    const simulatedResult = {
      items: [
        { name: "Fémmentes Cirkónium korona", competitorPrice: 85000, ourPrice: 55000 },
        { name: "Prémium implantátum beültetés", competitorPrice: 280000, ourPrice: 190000 },
        { name: "Digitális állapotfelmérés és 3D röntgen", competitorPrice: 25000, ourPrice: 10000 }
      ],
      competitorTotal: 390000,
      ourTotal: 255000,
      savings: 135000
    };

    // 2. SUPABASE MENTÉS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error: dbError } = await supabase.from('quote_leads').insert([
          {
            name,
            nickname: nickname || '',
            email,
            phone,
            original_total: simulatedResult.competitorTotal,
            new_total: simulatedResult.ourTotal,
            savings: simulatedResult.savings,
          }
        ]);

        if (dbError) {
          console.error("Supabase mentési hiba:", dbError);
        } else {
          console.log("Sikeres mentés a Supabase táblába!");
        }
      } catch (dbEx) {
        console.error("Supabase kliens hiba:", dbEx);
      }
    } else {
      console.warn("Hiányoznak a Supabase kulcsok a környezeti változókból!");
    }

    // 3. RESEND E-MAIL KÜLDÉS
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const greeting = nickname ? nickname : name.split(' ')[0];
        
        const itemsHtml = simulatedResult.items.map(item => 
          `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>${item.name}</strong></td>
            <td style="padding: 10px 0; color: #999; text-decoration: line-through;">${item.competitorPrice.toLocaleString('hu-HU')} Ft</td>
            <td style="padding: 10px 0; color: #0284c7; font-weight: bold;">${item.ourPrice.toLocaleString('hu-HU')} Ft</td>
          </tr>`
        ).join('');

        // FONTOS: A Resend { data, error } objektummal tér vissza
        const { data, error } = await resend.emails.send({
          from: 'Crown Dental <info@crowndental.hu>', // Hitelesített domained!
          to: email,
          subject: `Kész az új árajánlata! ${simulatedResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat`,
          html: `
            <div style="font-family: Helvetica, sans-serif; color: #333; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0284c7; padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Kedves ${greeting}!</h1>
                <p style="color: #e0f2fe; margin-top: 10px; font-size: 16px;">Elkészült az intelligens árajánlat-elemzése.</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <p style="font-size: 16px; line-height: 1.6;">Örömmel értesítjük, hogy saját fogtechnikai laborunknak köszönhetően <strong>${simulatedResult.savings.toLocaleString('hu-HU')} Ft-ot spórolhat</strong> nálunk!</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                  <thead>
                    <tr style="text-align: left; color: #6b7280; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding-bottom: 10px;">Kezelés</th>
                      <th style="padding-bottom: 10px;">Eredeti ár</th>
                      <th style="padding-bottom: 10px;">Crown Dental</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
                  <p style="margin: 0; color: #0369a1; font-size: 18px;">Új végösszeg:</p>
                  <h2 style="margin: 5px 0 0 0; color: #0284c7; font-size: 28px;">${simulatedResult.ourTotal.toLocaleString('hu-HU')} Ft</h2>
                </div>
                
                <p style="font-size: 16px; margin-top: 30px;">Kollégáink hamarosan keresni fogják a megadott (<strong>${phone}</strong>) telefonszámon egy ingyenes, személyes konzultáció egyeztetése céljából.</p>
                
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

    console.log("--- API VÉGE ---");
    return NextResponse.json({ success: true, result: simulatedResult });
  } catch (error) {
    console.error("Általános API Hiba:", error);
    return NextResponse.json({ error: 'Hiba történt az elemzés során.' }, { status: 500 });
  }
}
