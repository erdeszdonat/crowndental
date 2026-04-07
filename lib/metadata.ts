// lib/metadata.ts - Crown Dental SEO Metadata konfiguráció
// Az összes oldal meta adatai egy helyen, a régi UNAS rendszerből átmentve

import { Metadata } from 'next';

// Alap metadata, amit minden oldal örököl
const baseUrl = 'https://www.crowndental.hu';
const siteName = 'Crown Dental';
const defaultOgImage = '/og-image.jpg';

// Közös meta elemek
const commonMeta = {
  authors: [{ name: 'Crown Dental' }],
  creator: 'Crown Dental',
  publisher: 'Crown Dental',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FŐOLDAL - AI Kalkulátorral
// ═══════════════════════════════════════════════════════════════════════════
export const homeMetadata: Metadata = {
  ...commonMeta,
  title: 'Crown Dental | Prémium Fogászat Saját Laborral – 30 Év Tapasztalat',
  description:
    'Töltsd fel más klinika árajánlatát és nézd meg, mennyit spórolhatsz nálunk! Saját fogtechnikai labor = alacsonyabb árak, prémium japán anyagok. Esztergom & Budapest.',
  keywords: [
    'fogászat budapest',
    'fogászat esztergom',
    'saját fogtechnikai labor',
    'olcsó fogászat',
    'prémium fogászat',
    'fogimplantátum ár',
    'korona ár',
  ],
  openGraph: {
    title: 'Crown Dental | Töltsd fel az árajánlatodat – Mutatjuk a megtakarítást!',
    description:
      'AI árajánlat-elemző: azonnal megmutatjuk, mennyit spórolhatsz a saját laborunk miatt. 30 év tapasztalat, prémium minőség.',
    url: baseUrl,
    siteName,
    images: [
      {
        url: `${baseUrl}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: 'Crown Dental - Prémium fogászat saját laborral',
      },
    ],
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crown Dental | Prémium Fogászat 30 Év Tapasztalattal',
    description: 'Saját labor = akár 40% megtakarítás. Töltsd fel az árajánlatodat!',
    images: [`${baseUrl}/og-home.jpg`],
  },
  alternates: {
    canonical: baseUrl,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LOKÁCIÓS OLDALAK
// ═══════════════════════════════════════════════════════════════════════════
export const esztergomMetadata: Metadata = {
  ...commonMeta,
  title: 'Fogászat Esztergom | Crown Dental – 30 Éve a Város Szolgálatában',
  description:
    'Fájdalommentes fogászat Esztergomban. Saját fogtechnikai labor, japán anyagok, azonnali időpont. A Hősök terén, parkolóval. Hívjon: +36 33 123 4567',
  openGraph: {
    title: 'Crown Dental Esztergom – Helyi Fogászat, Prémium Minőség',
    description:
      '30 éve Esztergom fogászata. Saját labor, rövid várakozás, kedvező árak. Hősök tere 5.',
    url: `${baseUrl}/esztergom`,
    siteName,
    images: [{ url: `${baseUrl}/og-esztergom.jpg`, width: 1200, height: 630 }],
    locale: 'hu_HU',
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/esztergom`,
  },
};

export const budapestMetadata: Metadata = {
  ...commonMeta,
  title: 'Fogászat Budapest | Crown Dental – Prémium Minőség, Középkategóriás Ár',
  description:
    'Új budapesti rendelőnk megnyílt! Saját fogtechnikai laborunk miatt akár 40%-kal olcsóbbak vagyunk a belvárosi klinikáknál. Prémium japán és koreai anyagok.',
  openGraph: {
    title: 'Crown Dental Budapest – Végre Elérhető Prémium Fogászat',
    description:
      'Ugyanaz a minőség, amit 30 éve Esztergomban bizonyítottunk – most Budapesten is. Saját labor = alacsonyabb árak.',
    url: `${baseUrl}/budapest`,
    siteName,
    images: [{ url: `${baseUrl}/og-budapest.jpg`, width: 1200, height: 630 }],
    locale: 'hu_HU',
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/budapest`,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// KEZELÉSEK / SZOLGÁLTATÁSOK
// Az eredeti UNAS meta description-ök átmentve és optimalizálva
// ═══════════════════════════════════════════════════════════════════════════
export const serviceMetadata: Record<string, Metadata> = {
  // Fogászati implantátumok (régi: /fogaszati-implantatumok)
  implantatum: {
    ...commonMeta,
    title: 'Fogimplantátum Ár 2024 | Crown Dental – Saját Labor, Akár 40% Megtakarítás',
    description:
      'Fogászati implantátumok tartós megoldásként foghiányra. Prémium Straumann és koreai implantátumok saját laborból. Ingyenes konzultáció, részletfizetés.',
    openGraph: {
      title: 'Fogimplantátum – Tartós Megoldás, Elérhető Áron',
      description:
        'Prémium implantátumok a saját laborunkból. 30 év tapasztalat, életre szóló garancia a beültetésre.',
      url: `${baseUrl}/kezelesek/implantatum`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/implantatum`,
    },
  },

  // Fogszabályozás (régi: /fogszabalyozas)
  fogszabalyozas: {
    ...commonMeta,
    title: 'Fogszabályozás Felnőtteknek és Gyerekeknek | Crown Dental',
    description:
      'Esztétikus és egészséges fogsor fogszabályozással. Láthatatlan sínek, hagyományos készülékek. Ingyenes konzultáció Esztergomban és Budapesten.',
    openGraph: {
      title: 'Fogszabályozás – Tökéletes Mosoly Minden Életkorban',
      description:
        'Felnőtt fogszabályozás láthatatlan sínekkel vagy hagyományos készülékkel. 30 év tapasztalat.',
      url: `${baseUrl}/kezelesek/fogszabalyozas`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/fogszabalyozas`,
    },
  },

  // Koronák és hidak (régi: /koronak-hidak)
  'koronak-es-hidak': {
    ...commonMeta,
    title: 'Fogkorona és Híd Ár | Crown Dental – Saját Laborból, 3 Nap Alatt',
    description:
      'Esztétikus fogpótlás megoldások: cirkónium koronák, porcelán hidak saját laborunkból. Gyors elkészítés, precíz illeszkedés, prémium anyagok.',
    openGraph: {
      title: 'Fogkoronák és Hidak – Prémium Minőség, Saját Laborból',
      description:
        'Cirkónium és porcelán koronák 3 nap alatt a saját laborunkból. Ez a Crown Dental előny.',
      url: `${baseUrl}/kezelesek/koronak-es-hidak`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/koronak-es-hidak`,
    },
  },

  // Fogfehérítés (régi: /cpg/162800/Fogfeherites)
  fogfeherites: {
    ...commonMeta,
    title: 'Professzionális Fogfehérítés | Crown Dental – Azonnal Látható Eredmény',
    description:
      'Rendelői fogfehérítés 1 óra alatt, akár 8 árnyalattal fehérebb fogak. Biztonságos eljárás, tartós eredmény. Kérjen időpontot online!',
    openGraph: {
      title: 'Fogfehérítés – Ragyogó Mosoly 1 Óra Alatt',
      description: 'Professzionális fogfehérítés azonnali eredménnyel. Biztonságos, tartós, elérhető.',
      url: `${baseUrl}/kezelesek/fogfeherites`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/fogfeherites`,
    },
  },

  // Esztétikai fogászat (régi: /esztetikai-fogaszat)
  'esztetikai-fogaszat': {
    ...commonMeta,
    title: 'Esztétikai Fogászat | Crown Dental – Fogfehérítés, Héjak, Mosolydesign',
    description:
      'Esztétikai fogászati kezelések: fogfehérítés, porcelán héjak, fogkő eltávolítás. Tervezze meg álmai mosolyát velünk!',
    openGraph: {
      title: 'Esztétikai Fogászat – Tökéletes Mosoly Design',
      description: 'Porcelán héjak, fogfehérítés, teljes mosolyátalakítás. 30 év esztétikai tapasztalat.',
      url: `${baseUrl}/kezelesek/esztetikai-fogaszat`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/esztetikai-fogaszat`,
    },
  },

  // Foghúzás (régi: /foghuzas)
  foghuzas: {
    ...commonMeta,
    title: 'Fájdalommentes Foghúzás | Crown Dental – Kíméletes Beavatkozás',
    description:
      'Kíméletes, fájdalommentes foghúzás modern érzéstelenítéssel. Bölcsességfog eltávolítás, azonnali pótlás lehetőséggel.',
    openGraph: {
      title: 'Foghúzás – Fájdalommentes és Kíméletes',
      description: 'Modern érzéstelenítés, gyors gyógyulás. Bölcsességfog és gyökérmaradvány eltávolítás.',
      url: `${baseUrl}/kezelesek/foghuzas`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/foghuzas`,
    },
  },

  // Gyökérkezelés (régi: /gyokerkezeles)
  gyokerkezeles: {
    ...commonMeta,
    title: 'Gyökérkezelés | Crown Dental – Fájdalommentes Megoldás Foggyulladásra',
    description:
      'Fájdalommentes foggyökér kezelés modern technikával. Mentse meg a fogát – ne húzassa ki! Gyors időpont Esztergomban.',
    openGraph: {
      title: 'Gyökérkezelés – Mentse Meg Fogát',
      description: 'Modern, fájdalommentes gyökérkezelés. A fog megmentése mindig jobb, mint a húzás.',
      url: `${baseUrl}/kezelesek/gyokerkezeles`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/gyokerkezeles`,
    },
  },

  // Szájsebészet (régi: /cpg/550106/Szajsebeszet)
  szajsebeszet: {
    ...commonMeta,
    title: 'Szájsebészet Esztergom | Crown Dental – Implantáció, Bölcsességfog',
    description:
      'Szájsebészeti beavatkozások: implantátum beültetés, bölcsességfog műtét, csontpótlás. Tapasztalt szájsebész, modern felszerelés.',
    openGraph: {
      title: 'Szájsebészet – Szakértő Kezekben',
      description: 'Implantáció, bölcsességfog eltávolítás, csontpótlás. 30 év sebészeti tapasztalat.',
      url: `${baseUrl}/kezelesek/szajsebeszet`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/szajsebeszet`,
    },
  },

  // Fogsor (régi: /cpg/891877/Fogsor)
  fogsor: {
    ...commonMeta,
    title: 'Kivehető és Rögzített Fogsor | Crown Dental – Saját Labor, Gyors Készítés',
    description:
      'Teljes és részleges fogsorok saját laborból, 5 nap alatt. Prémium akril és fém vázas fogsorok. Precíz illeszkedés garantálva.',
    openGraph: {
      title: 'Fogsor – Saját Laborból, Tökéletes Illeszkedés',
      description: 'Kivehető és implantátumon rögzített fogsorok. Saját labor = gyors és pontos.',
      url: `${baseUrl}/kezelesek/fogsor`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/fogsor`,
    },
  },

  // Fogtechnikai megoldások (régi: /cpg/133087/Fogtechnikai-megoldasok)
  'fogtechnikai-megoldasok': {
    ...commonMeta,
    title: 'Fogtechnikai Labor | Crown Dental – A Mi Titkos Fegyverünk',
    description:
      'Saját fogtechnikai labor = gyorsabb elkészítés, jobb minőség, alacsonyabb ár. Nézze meg, hogyan készülnek a koronák, hidak, fogsorok!',
    openGraph: {
      title: 'Saját Fogtechnikai Labor – A Crown Dental Különbség',
      description: 'Fedezze fel, miért olcsóbbak nálunk a fogpótlások: saját labor, japán anyagok.',
      url: `${baseUrl}/kezelesek/fogtechnikai-megoldasok`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/fogtechnikai-megoldasok`,
    },
  },

  // Góckutatás (régi: /gockutatas-fogaszati-hater-panaszok)
  gockutatas: {
    ...commonMeta,
    title: 'Góckutatás Esztergom | Crown Dental – Rejtett Gyulladások Feltárása',
    description:
      'Fogászati góckutatás: rejtett gyulladások, háttérpanaszok feltárása. Panoráma röntgen, részletes vizsgálat. Ne hagyja, hogy a fogai betegítsék!',
    openGraph: {
      title: 'Góckutatás – Amikor a Fog a Bűnös',
      description: 'Rejtett fogászati gyulladások feltárása. Sok betegség oka a szájban keresendő.',
      url: `${baseUrl}/kezelesek/gockutatas`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/gockutatas`,
    },
  },

  // Állapotfelmérés (régi: /cpg/881143/Allapotfelmeres)
  allapotfelmeres: {
    ...commonMeta,
    title: 'Fogászati Állapotfelmérés | Crown Dental – Ingyenes Konzultáció',
    description:
      'Teljes körű fogászati állapotfelmérés: panoráma röntgen, kezelési terv, árajánlat. Első konzultáció ingyenes!',
    openGraph: {
      title: 'Állapotfelmérés – Az Első Lépés a Tökéletes Mosoly Felé',
      description: 'Ingyenes konzultáció, panoráma röntgen, személyre szabott kezelési terv.',
      url: `${baseUrl}/kezelesek/allapotfelmeres`,
    },
    alternates: {
      canonical: `${baseUrl}/kezelesek/allapotfelmeres`,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EGYÉB OLDALAK
// ═══════════════════════════════════════════════════════════════════════════
export const pageMetadata: Record<string, Metadata> = {
  araink: {
    ...commonMeta,
    title: 'Fogászati Árak 2024 | Crown Dental – Transzparens Árlista',
    description:
      'Fogászati kezelések árai: implantátum, korona, fogszabályozás, fogfehérítés. Nálunk nincsenek rejtett költségek. Töltse fel más ajánlatát az összehasonlításhoz!',
    alternates: { canonical: `${baseUrl}/araink` },
  },

  kapcsolat: {
    ...commonMeta,
    title: 'Kapcsolat | Crown Dental – Esztergom & Budapest',
    description:
      'Lépjen kapcsolatba velünk! Esztergom: Hősök tere 5. Budapest: [cím]. Online időpontfoglalás, azonnali visszahívás.',
    alternates: { canonical: `${baseUrl}/kapcsolat` },
  },

  rolunk: {
    ...commonMeta,
    title: 'Rólunk | Crown Dental – 30 Év Tapasztalat, Saját Labor',
    description:
      'Ismerje meg a Crown Dental csapatát! 30 éve Esztergom fogászata, most Budapesten is. Saját fogtechnikai labor, családi vállalkozás.',
    alternates: { canonical: `${baseUrl}/rolunk` },
  },

  karrier: {
    ...commonMeta,
    title: 'Karrier | Crown Dental – Csatlakozz a Csapatunkhoz!',
    description:
      'Fogorvos, dentálhigiénikus, asszisztens álláslehetőségek. Versenyképes fizetés, modern környezet, családias légkör.',
    alternates: { canonical: `${baseUrl}/karrier` },
  },

  idopont: {
    ...commonMeta,
    title: 'Időpontfoglalás | Crown Dental – Online Foglalás 0-24',
    description:
      'Foglaljon időpontot online! Válasszon kezelést, lokációt és időpontot. Azonnali visszaigazolás email-ben.',
    alternates: { canonical: `${baseUrl}/idopont` },
  },

  blog: {
    ...commonMeta,
    title: 'Fogászati Blog | Crown Dental – Tippek, Hírek, Tudnivalók',
    description:
      'Fogászati tanácsok, kezelési útmutatók, hírek a Crown Dental blogján. Tudjon meg mindent a fogápolásról!',
    alternates: { canonical: `${baseUrl}/blog` },
  },

  adatkezeles: {
    ...commonMeta,
    title: 'Adatkezelési Tájékoztató | Crown Dental',
    description: 'Crown Dental Kft. adatkezelési tájékoztatója a GDPR előírásainak megfelelően.',
    robots: { index: false, follow: true },
    alternates: { canonical: `${baseUrl}/adatkezeles` },
  },

  aszf: {
    ...commonMeta,
    title: 'Általános Szerződési Feltételek | Crown Dental',
    description: 'Crown Dental Kft. általános szerződési feltételei.',
    robots: { index: false, follow: true },
    alternates: { canonical: `${baseUrl}/aszf` },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FÜGGVÉNYEK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generál egy service oldal metadata-t a slug alapján
 */
export function getServiceMetadata(slug: string): Metadata {
  return serviceMetadata[slug] || {
    ...commonMeta,
    title: `${slug} | Crown Dental`,
    description: 'Fogászati kezelés a Crown Dental-nál. 30 év tapasztalat, saját labor.',
  };
}

/**
 * Generál lokáció-specifikus metadata-t
 */
export function getLocationServiceMetadata(
  location: 'esztergom' | 'budapest',
  serviceSlug: string
): Metadata {
  const baseMeta = serviceMetadata[serviceSlug];
  const locationName = location === 'esztergom' ? 'Esztergom' : 'Budapest';

  if (!baseMeta) return getServiceMetadata(serviceSlug);

  return {
    ...baseMeta,
    title: `${String(baseMeta.title).replace(' | Crown Dental', '')} ${locationName}ben | Crown Dental`,
    alternates: {
      canonical: `${baseUrl}/${location}/kezelesek/${serviceSlug}`,
    },
  };
}

/**
 * JSON-LD strukturált adatok a főoldalhoz
 */
export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: 'Crown Dental',
  description: 'Prémium fogászat saját fogtechnikai laborral Esztergomban és Budapesten',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  image: `${baseUrl}/og-home.jpg`,
  telephone: '+36331234567',
  email: 'info@crowndental.hu',
  foundingDate: '1994',
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: 'Hősök tere 5.',
      addressLocality: 'Esztergom',
      postalCode: '2500',
      addressCountry: 'HU',
    },
  ],
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.7856,
    longitude: 18.7403,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '08:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '08:00', closes: '14:00' },
  ],
  priceRange: '$$',
  paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
  currenciesAccepted: 'HUF',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Fogászati szolgáltatások',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fogimplantátum' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fogkorona' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fogszabályozás' } },
    ],
  },
  sameAs: [
    'https://www.facebook.com/crowndental',
    'https://www.instagram.com/crowndental',
  ],
};
