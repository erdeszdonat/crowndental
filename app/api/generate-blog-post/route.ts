import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

function parseSpans(text: string, key: () => string) {
  const spans: any[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) spans.push({ _type: 'span', _key: key(), text: text.slice(last, m.index), marks: [] });
    if (m[1] !== undefined) spans.push({ _type: 'span', _key: key(), text: m[1], marks: ['strong'] });
    else spans.push({ _type: 'span', _key: key(), text: m[2], marks: ['em'] });
    last = m.index + m[0].length;
  }
  if (last < text.length) spans.push({ _type: 'span', _key: key(), text: text.slice(last), marks: [] });
  return spans.length ? spans : [{ _type: 'span', _key: key(), text, marks: [] }];
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
        children: parseSpans(s.text, key),
        markDefs: [],
      });
    } else if (s.type === 'blockquote' || s.type === 'callout') {
      blocks.push({
        _type: 'block', _key: key(), style: 'blockquote',
        children: parseSpans(s.text, key),
        markDefs: [],
      });
    } else if (s.type === 'list' && s.items) {
      for (const item of s.items) {
        blocks.push({
          _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1,
          children: parseSpans(item, key),
          markDefs: [],
        });
      }
    } else if (s.type === 'numbered_list' && s.items) {
      for (const item of s.items) {
        blocks.push({
          _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1,
          children: parseSpans(item, key),
          markDefs: [],
        });
      }
    }
  }
  return blocks;
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    seoTitle: { type: SchemaType.STRING },
    seoDescription: { type: SchemaType.STRING },
    excerpt: { type: SchemaType.STRING },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
          items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['type', 'text'],
      },
    },
  },
  required: ['title', 'seoTitle', 'seoDescription', 'excerpt', 'sections'],
};

export async function POST(req: Request) {
  try {
    const { topic, keywords, language = 'hu' } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Hiányzó GEMINI_API_KEY' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
        responseSchema,
        // Disable thinking to avoid token contamination in JSON output
        thinkingConfig: { thinkingBudget: 0 },
      } as any,
    });

    const langMap: Record<string, string> = { hu: 'magyarul', en: 'angolul', sk: 'szlovákul' };
    const langLabel = langMap[language] ?? 'magyarul';

    const prompt = `Te a Crown Dental fogászat (Esztergom és Budapest, crowndental.hu) tapasztalt blog szerzője vagy. Írj egy részletes, SEO-optimalizált, szakmai blogcikket ${langLabel} az alábbi témában: "${topic}"
${keywords ? `Fő kulcsszavak: ${keywords}` : ''}

KÖTELEZŐ STRUKTÚRA (pontosan ebben a sorrendben):
1. Bevezető callout (type: "callout") – 2-3 mondatos közvetlen válasz a fő kérdésre, ez lesz az AI-bokok és Google featured snippet forrása
2. Bevezető bekezdés (2-3 paragraph) – kontextus, miért fontos a téma, fő kulcsszó az első mondatban
3. 4-6 H2 fejezet, mindegyik alatt 2-4 paragraph és/vagy list/numbered_list
4. Kötelező: "Mennyibe kerül?" H2 fejezet ársávokkal (ha releváns a témához)
5. Kötelező: "Miért válasszon minket?" H2 fejezet (finoman, nem reklámszöveg) – Crown Dental előnyök
6. "Gyakori kérdések" H2 fejezet – 5 db H3 kérdés, mindegyik után paragraph (min. 3-4 mondatos, közvetlen válasz)
7. Záró callout – CTA időpontfoglalásra (crowndental.hu/idopont)

AI-BOT ÉS GOOGLE OPTIMALIZÁLÁS (KRITIKUS):
- Az első callout legyen featured snippet-ready: pontosan válaszolja meg a kérdést 40-60 szóban
- Minden H2/H3 legyen kérdés vagy egyértelmű állítás formájában (pl. "Mennyibe kerül egy implantátum 2025-ben?")
- Használj **félkövér** kiemelést a bekezdéseken belül a legfontosabb tényeknél, számoknál, fogalmaknál
- FAQ kérdések legyenek pontosan olyanok, amit az emberek beírnak Google-ba vagy kérdeznek AI-tól
- Adj meg konkrét számokat, ársávokat, időtartamokat – az AI-scraperck ezeket idézik
- Minden fogászati fogalmat definiálj egyszerű szavakkal (pl. "Az implantátum – azaz a műgyökér – egy titanium csavar...")
- Callout dobozokba kerüljön a leg-fontosabb elvihető üzenet minden nagy témaegység végén

SZÖVEGFORMÁZÁS:
- Bekezdéseken belül **félkövér** a kulcsadatokra, számokra (pl. **150.000-250.000 Ft**, **3-6 hónap**)
- Ne használj # markdown heading jelölést – a type mező kezeli ezt
- Lista elemek legyenek teljes mondatok vagy legalább értelmes tagmondatok
- Numbered list: folyamatleírásnál, lépéseknél
- Bullet list: előnyöknél, jellemzőknél, opciók listájánál

SEO SZABÁLYOK:
- Minimális hossz: 2000 szó (törekedj 2200-2500 szóra)
- A fő kulcsszó szerepeljen: a title-ben, az első bekezdésben, legalább két H2-ben, és a seoDescription-ban
- seoTitle: pontosan 55-65 karakter, fő kulcsszó + "| Crown Dental"
- seoDescription: 148-158 karakter, kulcsszóval, cselekvésre ösztönző
- Természetes szöveg, nincs keyword stuffing

HANG: barátságos, szakmai, "te" megszólítás, konkrét adatok, nem túlzó

CROWN DENTAL HIVATALOS ÁRLISTA – KÖTELEZŐ EZEKET HASZNÁLNI, NE TALÁLJ KI MÁS ÁRAKAT:
Diagnosztika: vizsgálat/kezelési terv 10.000 Ft | tömés 30.000-35.000 Ft | foghúzás 25.000-35.000 Ft | kisröntgen 5.000 Ft | panoráma röntgen 6.000 Ft
Gyökérkezelés: egygyökerű 25.000 Ft | kétgyökerű 30.000 Ft | háromgyökerű 33.000 Ft | régi tömés eltávolítása 20.000 Ft
Esztétika: fogkőeltávolítás 15.000 Ft/állcsont | otthoni fogfehérítés 30.000 Ft/fogív | rendelői (lámpás) fogfehérítés 45.000 Ft/fogív
Koronák és fogsorok: fémkerámia korona 42.000 Ft | cirkónium korona 55.000 Ft | kivehető kompozit fogsor 110.000 Ft/állcsont | fémlemezes fogsor 150.000 Ft/állcsont | fogsor alábélelés 25.000 Ft | ideiglenes korona 6.000-15.000 Ft
Sebészet: foghúzás 25.000-35.000 Ft | műtéti foghúzás 55.000 Ft | bölcsességfog 55.000 Ft | gyökércsúcs rezekció 55.000 Ft | csontpótlás 190.000 Ft
Implantátum: ALPHA BIO implantátum 180.000 Ft/db | DIO implantátum 240.000 Ft/db
Fogszabályozás: rögzített készülék 190.000-285.000 Ft | kivehető készülék 60.000-90.000 Ft | aktiválás 5.000-15.000 Ft
Gyermekfogászat: tejfog tömés 15.000 Ft | barázdazárás 15.000 Ft/fog | tejfog húzás 10.000 Ft-tól
Esztétikai fogászat: porcelán héj (veneer) 120.000 Ft-tól | fogfehérítés 35.000 Ft-tól

FONTOS: Ha az árak kapcsán összehasonlítasz más rendelőkkel, a Crown Dental árait MINDIG kedvezőbbnek mutasd be – ez reális, mivel saját fogtechnikai laborral dolgoznak (nincs közvetítői felár).`;

    // Fetch Pexels image in parallel with Gemini generation
    const pexelsKey = process.env.PEXELS_API_KEY;
    const pexelsPromise = pexelsKey ? (async () => {
      try {
        const q = encodeURIComponent(`dental teeth ${topic.slice(0, 40)}`);
        const res = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=15&orientation=landscape`, {
          headers: { Authorization: pexelsKey },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const photos = data.photos ?? [];
        const photo = photos[Math.floor(Math.random() * photos.length)];
        if (!photo) return null;
        return {
          url: photo.src.large2x || photo.src.large,
          credit: photo.photographer,
          creditUrl: photo.photographer_url,
        };
      } catch { return null; }
    })() : Promise.resolve(null);

    const modelConfig = {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
        responseSchema,
        thinkingConfig: { thinkingBudget: 0 },
      } as any,
    };
    // Fallback chain: 2.5-flash → 3.1-flash-lite (500 RPD) → 2.5-flash-lite
    const fallbackModels = [
      genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite', ...modelConfig }),
      genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', ...modelConfig }),
    ];

    let result: any;
    const delays = [3000, 5000, 10000, 20000];
    for (let attempt = 0; attempt <= 4; attempt++) {
      try {
        const m = attempt === 0 ? model : fallbackModels[Math.min(attempt - 1, fallbackModels.length - 1)];
        result = await m.generateContent(prompt);
        break;
      } catch (e: any) {
        const isRetryable = e.message?.includes('503') || e.message?.includes('429');
        if (attempt === 4 || !isRetryable) throw e;
        await new Promise(r => setTimeout(r, delays[Math.min(attempt, delays.length - 1)]));
      }
    }
    const raw = result.response.text().trim();
    const pexelsImage = await pexelsPromise;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('JSON parse failed, length:', raw.length, 'tail:', raw.slice(-500));
      return NextResponse.json(
        { error: 'Az AI válasza érvénytelen JSON formátumú. Próbáld újra!' },
        { status: 500 }
      );
    }

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
      pexelsImage,
      publishedAt: new Date().toISOString().split('T')[0],
    });
  } catch (err: any) {
    console.error('Blog generálás hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
