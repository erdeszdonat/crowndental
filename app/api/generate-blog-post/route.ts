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
      const { spans, markDefs } = parseSpans(s.text, key);
      blocks.push({ _type: 'block', _key: key(), style: 'normal', children: spans, markDefs });
    } else if (s.type === 'blockquote' || s.type === 'callout') {
      const { spans, markDefs } = parseSpans(s.text, key);
      blocks.push({ _type: 'block', _key: key(), style: 'blockquote', children: spans, markDefs });
    } else if (s.type === 'list' && s.items) {
      for (const item of s.items) {
        const { spans, markDefs } = parseSpans(item, key);
        blocks.push({
          _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1,
          children: spans, markDefs,
        });
      }
    } else if (s.type === 'numbered_list' && s.items) {
      for (const item of s.items) {
        const { spans, markDefs } = parseSpans(item, key);
        blocks.push({ _type: 'block', _key: key(), style: 'normal', listItem: 'number', level: 1, children: spans, markDefs });
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
        thinkingConfig: { thinkingBudget: 1024 },
      } as any,
    });

    const langMap: Record<string, string> = { hu: 'magyarul', en: 'angolul', sk: 'szlovákul' };
    const langLabel = langMap[language] ?? 'magyarul';
    const base = `https://www.crowndental.hu${language !== 'hu' ? `/${language}` : ''}`;

    const prompt = `Te a Crown Dental fogászat (Esztergom és Budapest, crowndental.hu) tapasztalt blog szerzője vagy. Írj egy részletes, SEO-optimalizált, szakmai blogcikket ${langLabel} az alábbi témában: "${topic}"
${keywords ? `Fő kulcsszavak: ${keywords}` : ''}

TARTALMI MINIMUMOK – EZEK KÖTELEZŐEK, NEM OPCIONÁLISAK:
- A teljes cikk legalább 2000 szó (törekedj 2200-2500 szóra) – ha nem éred el, folytasd a tartalmat
- MINDEN egyes H2 fejezet alatt minimum 3 db paragraph block kell (nem heading, hanem valódi bekezdés szöveg)
- Minden paragraph minimum 4-5 teljes, információdús mondat legyen – ne legyenek rövid, üres sorok
- A FAQ szekció minden H3 kérdése után minimum 4 mondatos, részletes paragraph válasz kell
- NE generálj csak fejléceket tartalom nélkül – minden heading után jön a tényleges szöveg

KÖTELEZŐ STRUKTÚRA (pontosan ebben a sorrendben):
1. Bevezető callout (type: "callout") – 2-3 mondatos közvetlen válasz a fő kérdésre
2. 2-3 bevezető paragraph – kontextus, miért fontos, fő kulcsszó az első mondatban
3. 4-6 H2 fejezet, mindegyik alatt MINIMUM 3 paragraph + opcionálisan list/numbered_list
4. "Mennyibe kerül?" H2 – ársávokkal és magyarázattal (min. 3 paragraph)
5. "Miért válasszon minket?" H2 – Crown Dental előnyök (min. 2 paragraph + list)
6. "Gyakori kérdések" H2 – 5 db H3, mindegyik után min. 4 mondatos paragraph
7. Záró callout – CTA időpontfoglalásra

AI-BOT ÉS GOOGLE OPTIMALIZÁLÁS:
- Az első callout legyen featured snippet-ready: pontosan válaszolja meg a kérdést 40-60 szóban
- Minden H2/H3 kérdés formájában (pl. "Mennyibe kerül egy cirkónium korona 2025-ben?")
- **félkövér** kiemelés a legfontosabb tényeknél, számoknál, fogalmaknál
- Adj meg konkrét számokat, ársávokat, időtartamokat
- Minden fogászati fogalmat definiálj egyszerű szavakkal

SZÖVEGFORMÁZÁS:
- Bekezdéseken belül **félkövér** a kulcsadatokra (pl. **55.000 Ft**, **3-5 munkanap**)
- Lista elemek legyenek teljes mondatok
- Numbered list: lépéseknél; Bullet list: előnyöknél, jellemzőknél

SEO SZABÁLYOK:
- Minimum 2000 szó – ez KEMÉNY LIMIT, ne add be a cikket ha kevesebb
- seoTitle: 55-65 karakter, fő kulcsszó + "| Crown Dental"
- seoDescription: 148-158 karakter, kulcsszóval, cselekvésre ösztönző

HANG: barátságos, szakmai, "te" megszólítás, konkrét adatok, nem túlzó

BELSŐ HIVATKOZÁSOK – KÖTELEZŐ 4-6 db PER CIKK:
Szőj be belső linkeket [szöveg](url) formátumban a bekezdések szövegébe, természetes helyekre. Minden kulcsszót csak egyszer linkeld:
- implantátum / dental implant / implantát → [implantátum](${base}/kezelesek/implantatum)
- fogkorona / cirkónium korona / fémkerámia korona / crown → [fogkorona](${base}/kezelesek/koronak-hidak)
- kivehető fogsor / teljes fogsor / fogsor / denture → [fogsor](${base}/kezelesek/fogsor)
- gyökérkezelés / gyökértömés / root canal → [gyökérkezelés](${base}/kezelesek/gyokerkezeles)
- fogfehérítés / fogkőeltávolítás / fogkő / whitening → [fogfehérítés](${base}/kezelesek/fogfeherites)
- esztétikai fogászat / porcelán héj / veneer → [esztétikai fogászat](${base}/kezelesek/esztetikai-fogaszat)
- foghúzás / bölcsességfog eltávolítás / tooth extraction → [foghúzás](${base}/kezelesek/foghuzas)
- fogszabályozás / fogszabályozó / braces / orthodontics → [fogszabályozás](${base}/kezelesek/fogszabalyozas)
- gyermekfogászat / tejfog / pediatric dentistry → [gyermekfogászat](${base}/kezelesek/gyerekfogaszat)
- szájsebészet / csontpótlás / oral surgery → [szájsebészet](${base}/kezelesek/szajsebeszet)
- állapotfelmérés / fogászati vizsgálat / dental check-up → [állapotfelmérés](${base}/kezelesek/allapotfelmeres)
- időpontfoglalás / rendelj időpontot / book appointment → [időpontfoglalás](${base}/idopont)
Ne linkeld a cikk fő témájának kulcsszavát (pl. ha a cikk a fogszabályozásról szól, ne linkeld a fogszabályozást).

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
        thinkingConfig: { thinkingBudget: 1024 },
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
