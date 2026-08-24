import type { Metadata } from 'next';
import huMessages from '@/messages/hu.json';
import enMessages from '@/messages/en.json';
import skMessages from '@/messages/sk.json';
import deMessages from '@/messages/de.json';

export const SITE_URL = 'https://www.crowndental.hu';
export const SUPPORTED_LOCALES = ['hu', 'en', 'sk', 'de'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const HREFLANG_BY_LOCALE: Record<SupportedLocale, string> = {
  hu: 'hu-HU',
  en: 'en-GB',
  sk: 'sk-SK',
  de: 'de-DE',
};

export const TREATMENT_SLUGS = [
  'allapotfelmeres',
  'implantatum',
  'fogsor',
  'koronak-hidak',
  'gyokerkezeles',
  'fogfeherites',
  'esztetikai-fogaszat',
  'foghuzas',
  'fogszabalyozas',
  'fogtechnikai-megoldasok',
  'gockutatas',
  'gyerekfogaszat',
  'szajsebeszet',
] as const;

export type TreatmentSlug = (typeof TREATMENT_SLUGS)[number];

type TreatmentMessage = {
  heroTitle: string;
  heroDesc: string;
  faqs?: Array<{ q: string; a: string }>;
};

const messagesByLocale = {
  hu: huMessages,
  en: enMessages,
  sk: skMessages,
  de: deMessages,
};

const openGraphLocales: Record<SupportedLocale, string> = {
  hu: 'hu_HU',
  en: 'en_GB',
  sk: 'sk_SK',
  de: 'de_DE',
};

export function normalizeLocale(locale: string): SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'hu';
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function localePrefix(locale: string): string {
  return normalizeLocale(locale) === 'hu' ? '' : `/${normalizeLocale(locale)}`;
}

export function localizedUrl(locale: string, path = ''): string {
  const normalizedPath = path && path !== '/' ? `/${path.replace(/^\/+|\/+$/g, '')}` : '';
  return `${SITE_URL}${localePrefix(locale)}${normalizedPath}`;
}

export function languageAlternates(path = ''): Record<string, string> {
  return {
    [HREFLANG_BY_LOCALE.hu]: localizedUrl('hu', path),
    [HREFLANG_BY_LOCALE.en]: localizedUrl('en', path),
    [HREFLANG_BY_LOCALE.sk]: localizedUrl('sk', path),
    [HREFLANG_BY_LOCALE.de]: localizedUrl('de', path),
    'x-default': localizedUrl('hu', path),
  };
}

function shortenDescription(value: string, maxLength = 165): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  const shortened = normalized.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 120 ? lastSpace : maxLength - 1)}…`;
}

export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  image = '/og-image.jpg',
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const canonical = localizedUrl(normalizedLocale, path);
  const finalDescription = shortenDescription(description);
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title,
    description: finalDescription,
    keywords,
    authors: [{ name: 'Crown Dental', url: SITE_URL }],
    creator: 'Crown Dental',
    publisher: 'Crown Dental Praxis és Labor Fogászati Kft.',
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description: finalDescription,
      url: canonical,
      siteName: 'Crown Dental',
      locale: openGraphLocales[normalizedLocale],
      alternateLocale: SUPPORTED_LOCALES
        .filter((candidate) => candidate !== normalizedLocale)
        .map((candidate) => openGraphLocales[candidate]),
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: finalDescription,
      images: [imageUrl],
    },
  };
}

export function buildHomeMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const content: Record<SupportedLocale, { title: string; description: string; keywords: string[] }> = {
    hu: {
      title: 'Crown Dental Esztergom | Fogászat saját fogtechnikai laborral',
      description: 'Prémium fogászati ellátás Esztergom belvárosában saját fogtechnikai laborral, hétvégi rendelés és online időpontkérés magyar és szlovák pácienseknek.',
      keywords: ['Crown Dental Esztergom', 'fogászat Esztergom', 'fogorvos Esztergom', 'fogorvos Komárom-Esztergom'],
    },
    en: {
      title: 'Crown Dental Esztergom | Dentistry with an in-house laboratory',
      description: 'Modern dental care in central Esztergom with an in-house dental laboratory, weekend appointments and online booking for Hungarian and international patients.',
      keywords: ['dentist Esztergom', 'dental clinic Esztergom', 'dentist Hungary', 'Crown Dental'],
    },
    sk: {
      title: 'Crown Dental Ostrihom | Zubár pre pacientov zo Slovenska',
      description: 'Moderná zubná klinika v centre Ostrihomu s vlastným laboratóriom, víkendovými termínmi a online rezerváciou pre pacientov zo Štúrova a južného Slovenska.',
      keywords: ['zubár Ostrihom', 'zubná klinika Ostrihom', 'zubár Maďarsko', 'zubár pri Štúrove'],
    },
    de: {
      title: 'Crown Dental Esztergom | Zahnarztpraxis mit eigenem Dentallabor',
      description: 'Moderne Zahnmedizin im Zentrum von Esztergom mit eigenem Dentallabor, Wochenendterminen und Online-Terminbuchung für deutschsprachige Patienten.',
      keywords: ['Zahnarzt Esztergom', 'Zahnarzt Ungarn', 'Zahnklinik Esztergom', 'Crown Dental Esztergom'],
    },
  };

  return buildLocalizedMetadata({ locale: normalizedLocale, ...content[normalizedLocale] });
}

export function buildTreatmentListingMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const content: Record<SupportedLocale, { title: string; description: string; keywords: string[] }> = {
    hu: {
      title: 'Fogászati kezelések és árak Esztergomban | Crown Dental',
      description: 'Fogászati árlista és kezelések Esztergomban: implantátum, korona, fogszabályozás, fogsor, szájsebészet, teleröntgen és diagnosztika saját laborral.',
      keywords: ['fogászati árak Esztergom', 'fogorvos árlista Esztergom', 'fogászati kezelések Esztergom'],
    },
    en: {
      title: 'Dental treatments and prices in Esztergom | Crown Dental',
      description: 'Transparent dental prices in Esztergom for implants, crowns, orthodontics, dentures, oral surgery and diagnostics, supported by our in-house laboratory.',
      keywords: ['dental prices Esztergom', 'dentist Hungary prices', 'dental treatments Esztergom'],
    },
    sk: {
      title: 'Cenník zubných ošetrení v Ostrihome | Crown Dental',
      description: 'Prehľadné ceny ošetrení v Ostrihome: implantáty, korunky, ortodoncia, protézy, chirurgia a diagnostika s vlastným zubnotechnickým laboratóriom.',
      keywords: ['zubár Ostrihom cenník', 'zubné ošetrenie Maďarsko ceny', 'zubná klinika Ostrihom'],
    },
    de: {
      title: 'Zahnbehandlungen und Preise in Esztergom | Crown Dental',
      description: 'Transparente Preise für Implantate, Kronen, Kieferorthopädie, Zahnersatz, Oralchirurgie und Diagnostik in Esztergom – mit eigenem Dentallabor.',
      keywords: ['Zahnarzt Esztergom Preise', 'Zahnbehandlung Ungarn Preise', 'Zahnklinik Esztergom'],
    },
  };

  return buildLocalizedMetadata({
    locale: normalizedLocale,
    path: 'kezelesek',
    ...content[normalizedLocale],
  });
}

export function getTreatmentContent(locale: string, slug: TreatmentSlug): TreatmentMessage {
  const normalizedLocale = normalizeLocale(locale);
  const treatmentPages = messagesByLocale[normalizedLocale].treatmentPages as unknown as Record<string, TreatmentMessage>;
  return treatmentPages[slug];
}

export function buildTreatmentMetadata(locale: string, slug: TreatmentSlug): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const treatment = getTreatmentContent(normalizedLocale, slug);
  const localTitle: Record<SupportedLocale, string> = {
    hu: `${treatment.heroTitle} Esztergomban | Crown Dental`,
    en: `${treatment.heroTitle} in Esztergom | Crown Dental`,
    sk: `${treatment.heroTitle} v Ostrihome | Crown Dental`,
    de: `${treatment.heroTitle} in Esztergom | Crown Dental`,
  };
  const localLead: Record<SupportedLocale, string> = {
    hu: `${treatment.heroTitle} Esztergomban, a Crown Dental saját fogtechnikai laborral működő rendelőjében.`,
    en: `${treatment.heroTitle} at Crown Dental Esztergom, supported by our in-house dental laboratory.`,
    sk: `${treatment.heroTitle} v Crown Dental Ostrihom, s podporou vlastného zubnotechnického laboratória.`,
    de: `${treatment.heroTitle} bei Crown Dental Esztergom, unterstützt durch unser eigenes Dentallabor.`,
  };
  const keywordBase: Record<SupportedLocale, string[]> = {
    hu: [`${treatment.heroTitle} Esztergom`, 'fogorvos Esztergom', 'fogászat Esztergom'],
    en: [`${treatment.heroTitle} Esztergom`, 'dentist Esztergom', 'dental clinic Hungary'],
    sk: [`${treatment.heroTitle} Ostrihom`, 'zubár Ostrihom', 'zubná klinika Ostrihom'],
    de: [`${treatment.heroTitle} Esztergom`, 'Zahnarzt Esztergom', 'Zahnklinik Ungarn'],
  };

  return buildLocalizedMetadata({
    locale: normalizedLocale,
    path: `kezelesek/${slug}`,
    title: localTitle[normalizedLocale],
    description: `${localLead[normalizedLocale]} ${treatment.heroDesc}`,
    keywords: keywordBase[normalizedLocale],
  });
}

export function buildTreatmentJsonLd(locale: string, slug: TreatmentSlug) {
  const normalizedLocale = normalizeLocale(locale);
  const treatment = getTreatmentContent(normalizedLocale, slug);
  const url = localizedUrl(normalizedLocale, `kezelesek/${slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${url}#procedure`,
    name: treatment.heroTitle,
    description: treatment.heroDesc,
    url,
    inLanguage: normalizedLocale,
    provider: { '@id': `${SITE_URL}/esztergom#dentist` },
    mainEntityOfPage: { '@id': url },
  };
}

export function buildBreadcrumbJsonLd(locale: string, path: string, currentName: string) {
  const normalizedLocale = normalizeLocale(locale);
  const labels: Record<SupportedLocale, { home: string; treatments: string; blog: string }> = {
    hu: { home: 'Főoldal', treatments: 'Kezelések és árak', blog: 'Fogászati tudástár' },
    en: { home: 'Home', treatments: 'Treatments and prices', blog: 'Dental knowledge base' },
    sk: { home: 'Domov', treatments: 'Ošetrenia a ceny', blog: 'Dentálna poradňa' },
    de: { home: 'Startseite', treatments: 'Behandlungen und Preise', blog: 'Zahnmedizinischer Ratgeber' },
  };
  const items = [
    { '@type': 'ListItem', position: 1, name: labels[normalizedLocale].home, item: localizedUrl(normalizedLocale) },
  ];

  if (path.startsWith('kezelesek/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: labels[normalizedLocale].treatments,
      item: localizedUrl(normalizedLocale, 'kezelesek'),
    });
  }

  if (path.startsWith('blog/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: labels[normalizedLocale].blog,
      item: localizedUrl(normalizedLocale, 'blog'),
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: currentName,
    item: localizedUrl(normalizedLocale, path),
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
