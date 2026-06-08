import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { normalizeBlogCategory, normalizeBlogLanguage } from '@/lib/blogConfig';

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

function parseSpans(text: string, key: () => string): { spans: any[]; markDefs: any[] } {
  const spans: any[] = [];
  const markDefs: any[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) spans.push({ _type: 'span', _key: key(), text: text.slice(last, m.index), marks: [] });
    if (m[1] !== undefined) {
      spans.push({ _type: 'span', _key: key(), text: m[1], marks: ['strong'] });
    } else if (m[2] !== undefined) {
      spans.push({ _type: 'span', _key: key(), text: m[2], marks: ['em'] });
    } else {
      const linkKey = key();
      markDefs.push({ _key: linkKey, _type: 'link', href: m[4] });
      spans.push({ _type: 'span', _key: key(), text: m[3], marks: [linkKey] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) spans.push({ _type: 'span', _key: key(), text: text.slice(last), marks: [] });
  return {
    spans: spans.length ? spans : [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs,
  };
}

interface FaqItem { question: string; answer: string; }
interface Section {
  heading: string;
  paragraphs: string[];
  list?: string[];
  numberedList?: string[];
  faqItems?: FaqItem[];
}
interface ArticleData {
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  calloutIntro: string;
  intro: string[];
  sections: Section[];
  calloutOutro: string;
}

function toPortableText(data: ArticleData) {
  const blocks: any[] = [];
  let keyIdx = 0;
  const key = () => `k${keyIdx++}`;

  const addCallout = (text: string) => {
    const { spans, markDefs } = parseSpans(text, key);
    blocks.push({ _type: 'block', _key: key(), style: 'blockquote', children: spans, markDefs });
  };
  const addParagraph = (text: string) => {
    const { spans, markDefs } = parseSpans(text, key);
    blocks.push({ _type: 'block', _key: key(), style: 'normal', children: spans, markDefs });
  };
  const addHeading = (text: string, level: 'h2' | 'h3') => {
    blocks.push({
      _type: 'block', _key: key(), style: level,
      children: [{ _type: 'span', _key: key(), text, marks: [] }],
      markDefs: [],
    });
  };
  const addList = (items: string[], listItem: 'bullet' | 'number') => {
    for (const item of items) {
      const { spans, markDefs } = parseSpans(item, key);
      blocks.push({ _type: 'block', _key: key(), style: 'normal', listItem, level: 1, children: spans, markDefs });
    }
  };

  if (data.calloutIntro) addCallout(data.calloutIntro);
  for (const p of data.intro ?? []) addParagraph(p);

  for (const section of data.sections ?? []) {
    addHeading(section.heading, 'h2');
    for (const p of section.paragraphs ?? []) addParagraph(p);
    if (section.list?.length) addList(section.list, 'bullet');
    if (section.numberedList?.length) addList(section.numberedList, 'number');
    if (section.faqItems?.length) {
      for (const faq of section.faqItems) {
        addHeading(faq.question, 'h3');
        addParagraph(faq.answer);
      }
    }
  }

  if (data.calloutOutro) addCallout(data.calloutOutro);

  return blocks;
}

const faqItemSchema = {
  type: SchemaType.OBJECT,
  properties: {
    question: { type: SchemaType.STRING },
    answer: { type: SchemaType.STRING },
  },
  required: ['question', 'answer'],
};

const sectionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    heading: { type: SchemaType.STRING },
    paragraphs: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    list: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    numberedList: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    faqItems: { type: SchemaType.ARRAY, items: faqItemSchema },
  },
  required: ['heading', 'paragraphs'],
};

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    seoTitle: { type: SchemaType.STRING },
    seoDescription: { type: SchemaType.STRING },
    excerpt: { type: SchemaType.STRING },
    calloutIntro: { type: SchemaType.STRING },
    intro: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    sections: { type: SchemaType.ARRAY, items: sectionSchema },
    calloutOutro: { type: SchemaType.STRING },
  },
  required: ['title', 'seoTitle', 'seoDescription', 'excerpt', 'calloutIntro', 'intro', 'sections', 'calloutOutro'],
};

export async function POST(req: Request) {
  try {
    const { topic, keywords, language = 'hu', category = 'professional' } = await req.json();
    if (!topic) return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Hiányzó GEMINI_API_KEY' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelConfig = {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
        responseSchema,
        thinkingConfig: { thinkingBudget: 1024 },
      } as any,
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', ...modelConfig });
    const fallbackModels = [
      genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', ...modelConfig }),
    ];

    const langMap: Record<string, string> = { hu: 'magyarul', en: 'angolul', sk: 'szlovákul' };
    const normalizedLanguage = normalizeBlogLanguage(language);
    const normalizedCategory = normalizeBlogCategory(category);
    const langMapWithGerman: Record<string, string> = { ...langMap, sk: 'szlovákul', de: 'németül' };
    const langLabel = langMapWithGerman[normalizedLanguage] ?? 'magyarul';
    const base = `https://www.crowndental.hu${normalizedLanguage !== 'hu' ? `/${normalizedLanguage}` : ''}`;
    const categoryInstruction = normalizedCategory === 'magazine'
      ? 'Kategória: fejlődésünk és érdekességek. Ne száraz szakmai SEO-cikket írj, hanem magazinos, emberközeli anyagot a Crown Dental fejlődéséről, újdonságokról, kulisszatitkokról vagy hasznos érdekességekről. Maradjon hiteles, konverziót segítő és keresőbarát, de ne erőltesd mindenhol az árlistát.'
      : 'Kategória: orvosi szakmai cikk. A cikk a leggyakrabban keresett fogászati kérdésekre adjon részletes, közérthető, orvosi szakmai választ, konkrét fogászati magyarázatokkal, belső linkekkel és CTA-val.';

    const prompt = `Te a Crown Dental fogászat (Esztergom és Budapest, crowndental.hu) tapasztalt blog szerzője vagy. Írj egy részletes, SEO-optimalizált, szakmai blogcikket ${langLabel} az alábbi témában: "${topic}"
${keywords ? `Fő kulcsszavak: ${keywords}` : ''}

A VÁLASZ STRUKTÚRÁJA – PONTOSAN EZT A JSON FORMÁTUMOT ADD VISSZA:
{
  "title": "A cikk H1 címe",
  "seoTitle": "55-65 karakteres Google cím | Crown Dental",
  "seoDescription": "148-158 karakteres meta leírás kulcsszóval és CTA-val",
  "excerpt": "2-3 mondatos összefoglaló a blog kártyához",
  "calloutIntro": "40-60 szavas featured snippet szöveg: pontosan válaszolja meg a fő kérdést",
  "intro": [
    "Első bevezető bekezdés – minimum 5 mondat, fő kulcsszó az első mondatban, kontextus",
    "Második bevezető bekezdés – minimum 5 mondat, miért fontos a téma",
    "Harmadik bevezető bekezdés – minimum 4 mondat, mit talál a cikkben az olvasó"
  ],
  "sections": [
    {
      "heading": "H2 fejléc kérdés formájában",
      "paragraphs": [
        "Első bekezdés – MINIMUM 5 teljes, információdús mondat. Konkrét adatok, számok, magyarázatok.",
        "Második bekezdés – MINIMUM 5 teljes mondat. Folytatás, részletek, összefüggések.",
        "Harmadik bekezdés – MINIMUM 4 teljes mondat. Konklúzió, tanács, CTA."
      ],
      "list": ["Lista elem ha releváns", "Lista elem 2"]
    },
    {
      "heading": "Mennyibe Kerül? – H2 az árakról",
      "paragraphs": [
        "Árak bevezetése – minimum 5 mondat az árak kontextusáról",
        "Konkrét árak részletezése bekezdésben – minimum 5 mondat",
        "Ár-összehasonlítás és Crown Dental előnye – minimum 4 mondat"
      ]
    },
    {
      "heading": "Miért Válassza a Crown Dentalt?",
      "paragraphs": [
        "Bevezető bekezdés – minimum 4 mondat",
        "Előnyök kifejtése – minimum 4 mondat"
      ],
      "list": ["Előny 1 teljes mondatban", "Előny 2 teljes mondatban"]
    },
    {
      "heading": "Gyakori Kérdések",
      "paragraphs": ["Bevezető bekezdés a FAQ-hoz – minimum 3 mondat"],
      "faqItems": [
        { "question": "H3 kérdés 1?", "answer": "Minimum 4-5 mondatos részletes válasz. Konkrét adatokkal, számokkal, magyarázattal." },
        { "question": "H3 kérdés 2?", "answer": "Minimum 4-5 mondatos részletes válasz." },
        { "question": "H3 kérdés 3?", "answer": "Minimum 4-5 mondatos részletes válasz." },
        { "question": "H3 kérdés 4?", "answer": "Minimum 4-5 mondatos részletes válasz." },
        { "question": "H3 kérdés 5?", "answer": "Minimum 4-5 mondatos részletes válasz." }
      ]
    }
  ],
  "calloutOutro": "CTA szöveg időpontfoglalásra – 2-3 mondat, lelkesítő, crowndental.hu/idopont link"
}

KÖTELEZŐ MENNYISÉG:
- intro: minimum 3 bekezdés, mindegyik minimum 5 mondat
- sections: minimum 5 section (4-6 témaegység + ár + miért mi + FAQ)
- minden section paragraphs tömbje: minimum 3 elem, mindegyik minimum 5 mondat
- faqItems: pontosan 5 db, mindegyik answer minimum 4-5 mondat
- TELJES CIKK: minimum 2000 szó – ha kevesebb, folytasd a bekezdéseket

SZÖVEGFORMÁZÁS:
- **félkövér** a kulcsadatokra: **55.000 Ft**, **3-5 munkanap**, **15 év tapasztalat**
- Belső linkek: [szöveg](url) formátumban a bekezdések szövegébe szőve
- Lista elemek legyenek teljes mondatok
- "te" megszólítás, barátságos szakmai hang

SEO:
- seoTitle: pontosan 55-65 karakter
- seoDescription: pontosan 148-158 karakter
- Fő kulcsszó: title-ben, első intro bekezdésben, legalább 2 section headingben

BELSŐ HIVATKOZÁSOK – 4-6 db kötelező, a paragraphs szövegekbe szőve:
- implantátum → [implantátum](${base}/kezelesek/implantatum)
- fogkorona / cirkónium korona / fémkerámia korona → [fogkorona](${base}/kezelesek/koronak-hidak)
- kivehető fogsor / teljes fogsor → [fogsor](${base}/kezelesek/fogsor)
- gyökérkezelés / gyökértömés → [gyökérkezelés](${base}/kezelesek/gyokerkezeles)
- fogfehérítés / fogkőeltávolítás → [fogfehérítés](${base}/kezelesek/fogfeherites)
- esztétikai fogászat / porcelán héj / veneer → [esztétikai fogászat](${base}/kezelesek/esztetikai-fogaszat)
- foghúzás / bölcsességfog → [foghúzás](${base}/kezelesek/foghuzas)
- fogszabályozás → [fogszabályozás](${base}/kezelesek/fogszabalyozas)
- gyermekfogászat / tejfog → [gyermekfogászat](${base}/kezelesek/gyerekfogaszat)
- szájsebészet / csontpótlás → [szájsebészet](${base}/kezelesek/szajsebeszet)
- időpontfoglalás → [időpontfoglalás](${base}/idopont)
Ne linkeld a cikk fő témájának kulcsszavát.

CROWN DENTAL HIVATALOS ÁRLISTA – CSAK EZEKET HASZNÁLD:
Diagnosztika: vizsgálat 10.000 Ft | tömés 30.000-35.000 Ft | foghúzás 25.000-35.000 Ft | kisröntgen 5.000 Ft | panoráma röntgen 6.000 Ft
Gyökérkezelés: egygyökerű 25.000 Ft | kétgyökerű 30.000 Ft | háromgyökerű 33.000 Ft
Esztétika: fogkőeltávolítás 15.000 Ft/állcsont | otthoni fogfehérítés 30.000 Ft/fogív | rendelői fogfehérítés 45.000 Ft/fogív
Koronák: fémkerámia korona 42.000 Ft | cirkónium korona 55.000 Ft | ideiglenes korona 6.000-15.000 Ft
Fogsorok: kivehető kompozit fogsor 110.000 Ft/állcsont | fémlemezes fogsor 150.000 Ft/állcsont | fogsor alábélelés 25.000 Ft
Sebészet: műtéti foghúzás 55.000 Ft | bölcsességfog 55.000 Ft | csontpótlás 190.000 Ft
Implantátum: ALPHA BIO 180.000 Ft/db | DIO 240.000 Ft/db
Fogszabályozás: rögzített 190.000-285.000 Ft | kivehető 60.000-90.000 Ft
Gyermekfogászat: tejfog tömés 15.000 Ft | barázdazárás 15.000 Ft/fog | tejfog húzás 10.000 Ft-tól
Esztétikai fogászat: porcelán héj (veneer) 120.000 Ft-tól

Ha más rendelőkkel hasonlítasz, a Crown Dental árait mutasd kedvezőbbnek (saját labor = nincs közvetítői felár).`;

    // Fetch Pexels image in parallel
    const pexelsKey = process.env.PEXELS_API_KEY;
    const pexelsPromise = pexelsKey ? (async () => {
      try {
        const page = Math.floor(Math.random() * 4) + 1;
        const q = encodeURIComponent(`dental teeth ${topic.slice(0, 40)}`);
        const res = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=15&page=${page}&orientation=landscape`, {
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

    let result: any;
    const delays = [5000, 10000, 20000, 30000];
    for (let attempt = 0; attempt <= 4; attempt++) {
      try {
        const m = attempt === 0 ? model : fallbackModels[Math.min(attempt - 1, fallbackModels.length - 1)];
        result = await m.generateContent(`${prompt}

BLOG KATEGÓRIA INSTRUKCIÓ:
${categoryInstruction}`);
        break;
      } catch (e: any) {
        const isRetryable = e.message?.includes('503') || e.message?.includes('429');
        if (attempt === 4 || !isRetryable) throw e;
        await new Promise(r => setTimeout(r, delays[Math.min(attempt, delays.length - 1)]));
      }
    }

    const raw = result.response.text().trim();
    const pexelsImage = await pexelsPromise;

    let parsed: ArticleData;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('JSON parse failed, length:', raw.length, 'tail:', raw.slice(-500));
      return NextResponse.json(
        { error: 'Az AI válasza érvénytelen JSON formátumú. Próbáld újra!' },
        { status: 500 }
      );
    }

    const content = toPortableText(parsed);
    const slug = toSlug(parsed.title ?? topic);

    const allText = [
      parsed.calloutIntro ?? '',
      ...(parsed.intro ?? []),
      ...(parsed.sections ?? []).flatMap(s => [
        ...(s.paragraphs ?? []),
        ...(s.list ?? []),
        ...(s.numberedList ?? []),
        ...(s.faqItems ?? []).flatMap(f => [f.question, f.answer]),
      ]),
      parsed.calloutOutro ?? '',
    ].join(' ');
    const wordCount = allText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      title: parsed.title,
      slug,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      excerpt: parsed.excerpt,
      content,
      language: normalizedLanguage,
      category: normalizedCategory,
      wordCount,
      pexelsImage,
      publishedAt: new Date().toISOString().split('T')[0],
    });
  } catch (err: any) {
    console.error('Blog generálás hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
