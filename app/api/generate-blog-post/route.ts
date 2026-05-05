import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 120;

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ö/g,'o').replace(/ő/g,'o')
    .replace(/ú/g,'u').replace(/ü/g,'u').replace(/ű/g,'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPortableText(sections: { type: string; text: string; items?: string[] }[]) {
  const blocks: any[] = [];
  let keyIdx = 0;
  const key = () => `k${keyIdx++}`;

  for (const s of sections) {
    if (s.type === 'h2' || s.type === 'h3') {
      blocks.push({
        _type: 'block', _key: key(), style: s.type,
        children: [{ _type: 'span', _key: key(), text: s.text, marks: [] }],
        markDefs: [],
      });
    } else if (s.type === 'paragraph') {
      blocks.push({
        _type: 'block', _key: key(), style: 'normal',
        children: [{ _type: 'span', _key: key(), text: s.text, marks: [] }],
        markDefs: [],
      });
    } else if (s.type === 'list' && s.items) {
      for (const item of s.items) {
        blocks.push({
          _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1,
          children: [{ _type: 'span', _key: key(), text: item, marks: [] }],
          markDefs: [],
        });
      }
    } else if (s.type === 'numbered_list' && s.items) {
      for (const item of s.items) {
        blocks.push({
          _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1,
          children: [{ _type: 'span', _key: key(), text: item, marks: [] }],
          markDefs: [],
        });
      }
    }
  }
  return blocks;
}

export async function POST(req: Request) {
  try {
    const { topic, keywords, language = 'hu' } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Hiányzó GEMINI_API_KEY' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    const langMap: Record<string, string> = { hu: 'magyarul', en: 'angolul', sk: 'szlovákul' };
    const langLabel = langMap[language] ?? 'magyarul';

    const prompt = `Te a Crown Dental fogászat (Esztergom és Budapest, crowndental.hu) tapasztalt blog szerzője vagy. Írj egy részletes, SEO-optimalizált, szakmai blogcikket ${langLabel} az alábbi témában: "${topic}"
${keywords ? `Fő kulcsszavak: ${keywords}` : ''}

KÖTELEZŐ STRUKTÚRA (pontosan ebben a sorrendben):
1. Bevezető (2-3 bekezdés) – az első bekezdés közvetlenül, tömören válaszolja meg a fő kérdést; szerepeljen benne a fő kulcsszó
2. 4-6 H2 fejezet, mindegyik alatt 2-4 bekezdés és/vagy felsorolás
3. Egy "Mennyibe kerül?" vagy "Árak és finanszírozás" H2 fejezet (ha releváns), pontos ársávokkal
4. Egy "A Crown Dental megoldása" vagy hasonló H2 fejezet – finoman, természetesen mutassa be a rendelőt; ne legyen reklámszöveg
5. "Gyakori kérdések" H2 fejezet, alatta 5 H3 kérdés-válasz pár (min. 3-4 mondatos válaszok)
6. Rövid összefoglaló bekezdés CTA-val (időpontfoglalás crowndental.hu)

SEO SZABÁLYOK:
- Minimális hossz: 2000 szó (törekedj 2200-2500 szóra)
- A fő kulcsszó szerepeljen: a címben, az első bekezdésben, legalább két H2-ben, és a metaleírásban
- Másodlagos kulcsszavakat természetesen szőj bele, ne tömörítve
- seoTitle: pontosan 55-65 karakter, tartalmazza a fő kulcsszót és "| Crown Dental" végződést
- seoDescription: pontosan 148-158 karakter, legyen cselekvésre ösztönző (pl. "Foglalj időpontot!")
- Kerüld a keyword stuffinget – természetes, folyékony szöveg kell

HANG ÉS STÍLUS:
- Barátságos, de szakmai; "te" megszólítás az olvasóhoz
- Konkrét adatok, számok, ársávok ahol releváns
- Nem túlzó, hiteles szöveg
- Ha fogászati beavatkozásról van szó, írd le a folyamatot lépésről lépésre

Válaszolj KIZÁRÓLAG az alábbi JSON formátumban, SEMMI más szöveg kívüle (ne kezdd \`\`\`json-nal):
{
  "title": "Cikk H1 cím (kulcsszóval, max 80 karakter)",
  "seoTitle": "55-65 karakteres SEO cím | Crown Dental",
  "seoDescription": "148-158 karakteres meta leírás, kulcsszóval és CTA-val.",
  "excerpt": "2-3 mondatos összefoglaló a blog listához.",
  "sections": [
    { "type": "paragraph", "text": "Bevezető bekezdés szövege..." },
    { "type": "paragraph", "text": "Második bevezető bekezdés..." },
    { "type": "h2", "text": "Fejezet cím" },
    { "type": "paragraph", "text": "Bekezdés szövege..." },
    { "type": "list", "text": "", "items": ["felsorolás 1", "felsorolás 2", "felsorolás 3"] },
    { "type": "h2", "text": "Másik fejezet" },
    { "type": "paragraph", "text": "..." },
    { "type": "numbered_list", "text": "", "items": ["1. lépés leírása", "2. lépés leírása"] },
    { "type": "h2", "text": "Gyakori kérdések" },
    { "type": "h3", "text": "Kérdés 1?" },
    { "type": "paragraph", "text": "Részletes válasz 3-4 mondatban..." },
    { "type": "h3", "text": "Kérdés 2?" },
    { "type": "paragraph", "text": "Részletes válasz..." }
  ]
}`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    // Strip possible markdown code fences
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(raw);

    const content = toPortableText(parsed.sections ?? []);
    const slug = toSlug(parsed.title ?? topic);
    const wordCount = (parsed.sections ?? [])
      .map((s: any) => (s.text || '') + (s.items ?? []).join(' '))
      .join(' ')
      .split(/\s+/).length;

    return NextResponse.json({
      title: parsed.title,
      slug,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      excerpt: parsed.excerpt,
      content,
      language,
      wordCount,
    });
  } catch (err: any) {
    console.error('Blog generálás hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
