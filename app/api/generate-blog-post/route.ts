import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const langMap: Record<string, string> = { hu: 'magyarul', en: 'angolul', sk: 'szlovákul' };
    const langLabel = langMap[language] ?? 'magyarul';

    const prompt = `Te a Crown Dental fogászat (Esztergom és Budapest, crowndental.hu) blog szerzője vagy.
Írj egy SEO-optimalizált, informatív blog cikket ${langLabel} az alábbi témában: "${topic}"
${keywords ? `Kulcsszavak: ${keywords}` : ''}

FONTOS SZABÁLYOK:
- A cikk legyen legalább 600 szó
- Első bekezdés közvetlenül válaszolja meg a fő kérdést (AI-barát formátum)
- Tartalmaz 3-5 H2 fejezetet
- Legyen 1-2 FAQ szekció a végén (kérdés-válasz formátum)
- Természetes, barátságos hang, de szakmai
- Ne reklámozzon túlzottan, inkább legyen informatív
- Hivatkozzon finoman a Crown Dentalra mint megoldásra

Válaszolj KIZÁRÓLAG az alábbi JSON formátumban, semmi más szöveg:
{
  "title": "...",
  "seoTitle": "... | Crown Dental",
  "seoDescription": "Max 160 karakter...",
  "excerpt": "2-3 mondatos összefoglaló...",
  "sections": [
    { "type": "paragraph", "text": "Bevezető bekezdés..." },
    { "type": "h2", "text": "Fejezet cím" },
    { "type": "paragraph", "text": "..." },
    { "type": "list", "text": "", "items": ["pont 1", "pont 2"] },
    { "type": "h2", "text": "Gyakori kérdések" },
    { "type": "h3", "text": "Kérdés 1?" },
    { "type": "paragraph", "text": "Válasz..." }
  ]
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(raw);

    const content = toPortableText(parsed.sections ?? []);
    const slug = toSlug(parsed.title ?? topic);

    return NextResponse.json({
      title: parsed.title,
      slug,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      excerpt: parsed.excerpt,
      content,
      language,
    });
  } catch (err: any) {
    console.error('Blog generálás hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
