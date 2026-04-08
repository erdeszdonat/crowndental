import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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
  console.log("--- AI KALKULÁTOR ANALÍZIS INDÍTÁSA (PDF GENERÁLÁSSAL) ---");

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

    // 2. PDF GENERÁLÁS Python scripttel
    let pdfBase64 = "";
    try {
      const pdfPayload = JSON.stringify({
        name: nickname || name,
        phone,
        email,
        items: aiResult.items,
        competitorTotal: aiResult.competitorTotal,
        ourTotal: aiResult.ourTotal,
        savings: aiResult.savings,
        date: new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }),
      });

      // Python scriptet írunk ki temp fájlba és futtatjuk
      const scriptPath = path.join('/tmp', 'generate_pdf.py');
      const payloadPath = path.join('/tmp', 'pdf_payload.json');
      const outputPath = path.join('/tmp', 'arajanlat.pdf');

      fs.writeFileSync(payloadPath, pdfPayload, 'utf-8');
      fs.writeFileSync(scriptPath, PYTHON_PDF_SCRIPT, 'utf-8');

      execSync(`python3 ${scriptPath} ${payloadPath} ${outputPath}`, {
        timeout: 15000,
        encoding: 'utf-8',
      });

      const pdfBuffer = fs.readFileSync(outputPath);
      pdfBase64 = pdfBuffer.toString('base64');

      // Tisztítás
      try { fs.unlinkSync(scriptPath); } catch {}
      try { fs.unlinkSync(payloadPath); } catch {}
      try { fs.unlinkSync(outputPath); } catch {}

    } catch (pdfErr: any) {
      console.error("PDF generálási hiba:", pdfErr.message);
      // Ha a PDF generálás nem sikerül, folytatjuk a nélkül
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
      } catch (dbErr) { console.error("DB mentési hiba:", dbErr); }
    }

    // 4. RESEND E-MAIL KÜLDÉS PDF CSATOLMÁNNYAL
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);

        const itemsHtml = aiResult.items.map((item: any) =>
          `<tr>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; font-size:14px;">${item.name}</td>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#9ca3af; text-align:right; font-size:14px;"><del>${item.competitorPrice.toLocaleString('hu-HU')} Ft</del></td>
            <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#0369a1; font-weight:700; text-align:right; font-size:14px;">${item.ourPrice.toLocaleString('hu-HU')} Ft</td>
          </tr>`
        ).join('');

        const emailPayload: any = {
          from: 'Crown Dental <info@crowndental.hu>',
          to: email,
          subject: `Személyre szabott árajánlata elkészült – ${aiResult.savings.toLocaleString('hu-HU')} Ft megtakarítás`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:640px; margin:0 auto; background:#ffffff;">
              <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding:40px 30px; text-align:center; border-radius:12px 12px 0 0;">
                <img src="https://crowndental.hu/logo.webp" alt="Crown Dental" style="height:50px; margin-bottom:16px;" />
                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">Kedves ${nickname || name}!</h1>
                <p style="margin:8px 0 0 0; color:rgba(255,255,255,0.85); font-size:15px;">Elkészítettük az Ön személyre szabott árajánlatát.</p>
              </div>
              <div style="padding:32px 30px;">
                <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding:24px; border-radius:12px; text-align:center; margin-bottom:28px; border:1px solid #bae6fd;">
                  <p style="margin:0; color:#0369a1; font-size:13px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Az Ön megtakarítása</p>
                  <h2 style="margin:8px 0 0 0; color:#0284c7; font-size:36px; font-weight:800;">${aiResult.savings.toLocaleString('hu-HU')} Ft</h2>
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                  <thead>
                    <tr style="background:#f8fafc;">
                      <th style="padding:12px 16px; text-align:left; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e5e7eb;">Kezelés</th>
                      <th style="padding:12px 16px; text-align:right; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e5e7eb;">Másik árajánlat</th>
                      <th style="padding:12px 16px; text-align:right; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e5e7eb;">Crown Dental</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr style="background:#f0f9ff;">
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; border-top:2px solid #0284c7;">Összesen</td>
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; text-align:right; color:#9ca3af; border-top:2px solid #0284c7;"><del>${aiResult.competitorTotal.toLocaleString('hu-HU')} Ft</del></td>
                      <td style="padding:14px 16px; font-weight:700; font-size:15px; text-align:right; color:#0284c7; border-top:2px solid #0284c7;">${aiResult.ourTotal.toLocaleString('hu-HU')} Ft</td>
                    </tr>
                  </tfoot>
                </table>
                ${pdfBase64 ? '<p style="font-size:14px; color:#374151; margin-bottom:20px;">📄 <strong>A részletes árajánlatot PDF formátumban csatoltuk</strong> ehhez az e-mailhez. Kinyomtatva és aláírva hozza magával az első konzultációra!</p>' : ''}
                <p style="font-size:14px; color:#6b7280; line-height:1.6;">Kollégáink hamarosan keresni fogják a megadott telefonszámon (<strong>${phone}</strong>) az időpont egyeztetés céljából.</p>
                <div style="text-align:center; margin:32px 0;">
                  <a href="tel:+36XXXXXXXXX" style="display:inline-block; background:#0284c7; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:15px;">Hívjon minket</a>
                </div>
              </div>
              <div style="background:#f8fafc; padding:20px 30px; text-align:center; border-radius:0 0 12px 12px; border-top:1px solid #e5e7eb;">
                <p style="margin:0; color:#9ca3af; font-size:12px;">Crown Dental – Saját labor, kiemelkedő minőség, elérhető árak.</p>
              </div>
            </div>`,
        };

        // Ha van PDF, csatoljuk
        if (pdfBase64) {
          emailPayload.attachments = [{
            filename: `Crown_Dental_Arajanlat_${name.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          }];
        }

        await resend.emails.send(emailPayload);
      } catch (mailErr) { console.error("Email küldési hiba:", mailErr); }
    }

    return NextResponse.json({ success: true, result: aiResult, hasPdf: !!pdfBase64 });

  } catch (error: any) {
    console.error("Végzetes API hiba:", error);
    return NextResponse.json({
      error: 'Az AI szolgáltatás jelenleg túlterhelt. Kérjük, próbálja meg újra 30 másodperc múlva!'
    }, { status: 500 });
  }
}

// --- PYTHON SCRIPT A PDF GENERÁLÁSHOZ ---
const PYTHON_PDF_SCRIPT = `
# -*- coding: utf-8 -*-
import json
import sys
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# --- Betűtípus regisztrálás ---
# Próbáljuk a rendszeren elérhető betűtípusokat az ékezetek miatt
FONT_PATHS = [
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVuSans"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold"),
    ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "LiberationSans"),
    ("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", "LiberationSans-Bold"),
]

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

for fpath, fname in FONT_PATHS:
    if os.path.exists(fpath):
        try:
            pdfmetrics.registerFont(TTFont(fname, fpath))
            if "Bold" not in fname:
                FONT_REGULAR = fname
            else:
                FONT_BOLD = fname
        except:
            pass

# --- Színek ---
PRIMARY = HexColor("#0284c7")
PRIMARY_DARK = HexColor("#0369a1")
LIGHT_BG = HexColor("#f0f9ff")
BORDER_COLOR = HexColor("#bae6fd")
TEXT_DARK = HexColor("#1e293b")
TEXT_GRAY = HexColor("#6b7280")
TEXT_LIGHT_GRAY = HexColor("#9ca3af")
ROW_ALT = HexColor("#f8fafc")
WHITE = white
ACCENT_GREEN = HexColor("#059669")

def format_price(val):
    try:
        return f"{int(val):,} Ft".replace(",", " ")
    except:
        return str(val)

def generate_pdf(data, output_path):
    width, height = A4
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=20*mm,
    )

    elements = []

    # --- STÍLUSOK ---
    style_title = ParagraphStyle(
        "Title", fontName=FONT_BOLD, fontSize=20, textColor=PRIMARY_DARK,
        alignment=TA_LEFT, spaceAfter=2*mm
    )
    style_subtitle = ParagraphStyle(
        "Subtitle", fontName=FONT_REGULAR, fontSize=10, textColor=TEXT_GRAY,
        alignment=TA_LEFT, spaceAfter=6*mm
    )
    style_section = ParagraphStyle(
        "Section", fontName=FONT_BOLD, fontSize=12, textColor=PRIMARY_DARK,
        spaceBefore=6*mm, spaceAfter=3*mm
    )
    style_normal = ParagraphStyle(
        "Normal2", fontName=FONT_REGULAR, fontSize=9.5, textColor=TEXT_DARK,
        leading=13
    )
    style_small = ParagraphStyle(
        "Small", fontName=FONT_REGULAR, fontSize=8, textColor=TEXT_LIGHT_GRAY,
        alignment=TA_CENTER, leading=11
    )
    style_savings_label = ParagraphStyle(
        "SavingsLabel", fontName=FONT_REGULAR, fontSize=9, textColor=PRIMARY_DARK,
        alignment=TA_CENTER
    )
    style_savings_value = ParagraphStyle(
        "SavingsValue", fontName=FONT_BOLD, fontSize=22, textColor=ACCENT_GREEN,
        alignment=TA_CENTER, spaceBefore=1*mm
    )

    # --- FEJLÉC: Logó + Cím ---
    logo_path = os.path.join(os.getcwd(), "public", "logo.webp")
    header_items = []

    if os.path.exists(logo_path):
        try:
            logo = Image(logo_path, width=45*mm, height=15*mm)
            logo.hAlign = "LEFT"
            header_items.append([logo, ""])
        except:
            header_items.append([Paragraph("CROWN DENTAL", style_title), ""])
    else:
        header_items.append([Paragraph("CROWN DENTAL", style_title), ""])

    date_text = data.get("date", "")
    header_items[0][1] = Paragraph(
        f'<font name="{FONT_REGULAR}" size="9" color="#6b7280">{date_text}</font>',
        ParagraphStyle("DateRight", alignment=TA_RIGHT)
    )

    header_table = Table(header_items, colWidths=[100*mm, 70*mm])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 3*mm))

    # Vonal
    elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=4*mm))

    # --- CÍM ---
    elements.append(Paragraph("Személyre szabott árajánlat", style_title))
    elements.append(Paragraph(
        f"Készült: {data.get('name', '')} részére | Tel: {data.get('phone', '')} | E-mail: {data.get('email', '')}",
        style_subtitle
    ))

    # --- MEGTAKARÍTÁS DOBOZ ---
    savings_data = [
        [Paragraph("Az Ön megtakarítása", style_savings_label)],
        [Paragraph(format_price(data.get("savings", 0)), style_savings_value)],
    ]
    savings_table = Table(savings_data, colWidths=[170*mm])
    savings_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.75, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, 0), 4*mm),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 4*mm),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [3*mm, 3*mm, 3*mm, 3*mm]),
    ]))
    elements.append(savings_table)
    elements.append(Spacer(1, 6*mm))

    # --- TÁBLÁZAT ---
    elements.append(Paragraph("Kezelések részletezése", style_section))

    # Fejléc sor
    col_style_header = ParagraphStyle(
        "ColH", fontName=FONT_BOLD, fontSize=8.5, textColor=TEXT_GRAY,
    )
    col_style_header_right = ParagraphStyle(
        "ColHR", fontName=FONT_BOLD, fontSize=8.5, textColor=TEXT_GRAY, alignment=TA_RIGHT,
    )

    table_data = [[
        Paragraph("Kezelés", col_style_header),
        Paragraph("Másik árajánlat", col_style_header_right),
        Paragraph("Crown Dental ár", col_style_header_right),
        Paragraph("Megtakarítás", col_style_header_right),
    ]]

    items = data.get("items", [])

    cell_style = ParagraphStyle("Cell", fontName=FONT_REGULAR, fontSize=9, textColor=TEXT_DARK)
    cell_style_right = ParagraphStyle("CellR", fontName=FONT_REGULAR, fontSize=9, textColor=TEXT_DARK, alignment=TA_RIGHT)
    cell_style_strike = ParagraphStyle("CellS", fontName=FONT_REGULAR, fontSize=9, textColor=TEXT_LIGHT_GRAY, alignment=TA_RIGHT)
    cell_style_save = ParagraphStyle("CellSave", fontName=FONT_BOLD, fontSize=9, textColor=ACCENT_GREEN, alignment=TA_RIGHT)

    for item in items:
        comp = int(item.get("competitorPrice", 0))
        ours = int(item.get("ourPrice", 0))
        diff = comp - ours
        table_data.append([
            Paragraph(item.get("name", ""), cell_style),
            Paragraph(f"<strike>{format_price(comp)}</strike>", cell_style_strike),
            Paragraph(format_price(ours), cell_style_right),
            Paragraph(f"-{format_price(diff)}" if diff > 0 else "—", cell_style_save if diff > 0 else cell_style_right),
        ])

    # Összesen sor
    total_style = ParagraphStyle("TotalCell", fontName=FONT_BOLD, fontSize=10, textColor=TEXT_DARK)
    total_style_right = ParagraphStyle("TotalR", fontName=FONT_BOLD, fontSize=10, textColor=PRIMARY_DARK, alignment=TA_RIGHT)
    total_style_strike = ParagraphStyle("TotalS", fontName=FONT_BOLD, fontSize=10, textColor=TEXT_LIGHT_GRAY, alignment=TA_RIGHT)
    total_style_save = ParagraphStyle("TotalSave", fontName=FONT_BOLD, fontSize=10, textColor=ACCENT_GREEN, alignment=TA_RIGHT)

    table_data.append([
        Paragraph("Összesen", total_style),
        Paragraph(f"<strike>{format_price(data.get('competitorTotal', 0))}</strike>", total_style_strike),
        Paragraph(format_price(data.get('ourTotal', 0)), total_style_right),
        Paragraph(f"-{format_price(data.get('savings', 0))}", total_style_save),
    ])

    col_widths = [68*mm, 36*mm, 36*mm, 30*mm]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)

    table_style_cmds = [
        # Fejléc
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#f1f5f9")),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 3*mm),
        ("TOPPADDING", (0, 0), (-1, 0), 3*mm),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, PRIMARY),
        # Összesen sor
        ("LINEABOVE", (0, -1), (-1, -1), 1.5, PRIMARY),
        ("BACKGROUND", (0, -1), (-1, -1), LIGHT_BG),
        ("TOPPADDING", (0, -1), (-1, -1), 3*mm),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 3*mm),
        # Általános
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3*mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3*mm),
        ("TOPPADDING", (0, 1), (-1, -2), 2.5*mm),
        ("BOTTOMPADDING", (0, 1), (-1, -2), 2.5*mm),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
    ]

    # Alternáló sorok
    for i in range(1, len(table_data) - 1):
        if i % 2 == 0:
            table_style_cmds.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT))
        table_style_cmds.append(("LINEBELOW", (0, i), (-1, i), 0.5, HexColor("#e5e7eb")))

    table.setStyle(TableStyle(table_style_cmds))
    elements.append(table)
    elements.append(Spacer(1, 10*mm))

    # --- ALÁÍRÁS MEZŐK ---
    elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e5e7eb"), spaceAfter=6*mm))
    elements.append(Paragraph("Aláírások", style_section))
    elements.append(Spacer(1, 8*mm))

    sig_style_label = ParagraphStyle("SigLabel", fontName=FONT_REGULAR, fontSize=9, textColor=TEXT_GRAY, alignment=TA_CENTER)
    sig_style_line = ParagraphStyle("SigLine", fontName=FONT_REGULAR, fontSize=9, textColor=TEXT_DARK, alignment=TA_CENTER)

    sig_data = [[
        Paragraph("_" * 35, sig_style_line),
        Paragraph("", sig_style_line),
        Paragraph("_" * 35, sig_style_line),
    ], [
        Paragraph("Páciens aláírása", sig_style_label),
        Paragraph("", sig_style_label),
        Paragraph("Kezelőorvos aláírása és pecsétje", sig_style_label),
    ]]

    sig_table = Table(sig_data, colWidths=[70*mm, 30*mm, 70*mm])
    sig_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("TOPPADDING", (0, 0), (-1, -1), 1*mm),
    ]))
    elements.append(sig_table)
    elements.append(Spacer(1, 10*mm))

    # --- LÁBLÉC ---
    elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e5e7eb"), spaceAfter=3*mm))

    footer_style = ParagraphStyle(
        "Footer", fontName=FONT_REGULAR, fontSize=7.5, textColor=TEXT_LIGHT_GRAY,
        alignment=TA_CENTER, leading=11, spaceBefore=2*mm
    )
    elements.append(Paragraph(
        "Ez egy automatikusan generált árajánlat. A dokumentum kizárólag akkor válik hitelessé, "
        "amikor a páciens kinyomtatva magával hozza rendelőnkbe, és a kezelőorvos aláírásával, pecsétjével hitelesíti.",
        footer_style
    ))
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(
        "Az árajánlat a kiállítás napjától számított 30 napig érvényes. Az árak az ÁFÁ-t tartalmazzák. "
        "A végleges kezelési terv és összeg a szájüregi vizsgálat után kerül meghatározásra.",
        footer_style
    ))
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(
        "Crown Dental – Saját labor, kiemelkedő minőség, elérhető árak.",
        ParagraphStyle("FooterBrand", fontName=FONT_BOLD, fontSize=8, textColor=PRIMARY, alignment=TA_CENTER)
    ))

    # BUILD
    doc.build(elements)


if __name__ == "__main__":
    payload_path = sys.argv[1]
    output_path = sys.argv[2]
    with open(payload_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    generate_pdf(data, output_path)
    print("PDF OK")
`;
