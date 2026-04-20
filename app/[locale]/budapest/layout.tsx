import { Metadata } from 'next';

// ═══════════════════════════════════════════════════════════════════════════
// BUDAPEST ALOLDAL SEO ADATAI
// ═══════════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: 'Fogászat Budapesten – Római Part | Crown Dental',
  description:
    'Prémium fogászat Budapesten, a Római Parton. Implantátum, cirkónium korona, fogfehérítés, fogszabályozás, szájsebészet – saját fogtechnikai laborral, 30+ év tapasztalattal. Időpontfoglalás online!',
  keywords: [
    'fogászat budapest',
    'fogorvos budapest',
    'fogászat római part',
    'implantátum budapest',
    'cirkónium korona budapest',
    'fogfehérítés budapest',
    'fogszabályozás budapest',
    'szájsebészet budapest',
    'fogtechnikai labor budapest',
    'crown dental budapest',
  ],
  authors: [{ name: 'Crown Dental' }],
  creator: 'Crown Dental',
  publisher: 'Crown Dental',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Fogászat Budapesten – Római Part | Crown Dental',
    description:
      'Prémium fogászat a Római Parton. Implantátum, korona, fogfehérítés – saját labor, 30+ év tapasztalat.',
    url: 'https://www.crowndental.hu/budapest',
    siteName: 'Crown Dental',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: 'https://www.crowndental.hu/og-budapest.jpg',
        width: 1200,
        height: 630,
        alt: 'Crown Dental Budapest – Fogászat a Római Parton',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fogászat Budapesten – Római Part | Crown Dental',
    description:
      'Prémium fogászat a Római Parton. Saját labor, 30+ év tapasztalat.',
    images: ['https://www.crowndental.hu/og-budapest.jpg'],
  },
  alternates: {
    canonical: 'https://www.crowndental.hu/budapest',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD STRUKTURÁLT ADATOK (Dentist + LocalBusiness schema)
// ═══════════════════════════════════════════════════════════════════════════
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  '@id': 'https://www.crowndental.hu/budapest',
  name: 'Crown Dental Budapest',
  description:
    'Prémium fogászat és fogtechnikai labor Budapesten, a Római Parton. 30+ év tapasztalat, saját labor, csúcstechnológia.',
  url: 'https://www.crowndental.hu/budapest',
  telephone: '+36705646837',
  email: 'info@crowndental.hu',
  foundingDate: '1994',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Királyok útja 55.',
    addressLocality: 'Budapest',
    addressRegion: 'III. kerület (Óbuda-Békásmegyer)',
    postalCode: '1039',
    addressCountry: 'HU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.5697,
    longitude: 19.0505,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  image: 'https://www.crowndental.hu/images/budapest-rendelo.jpg',
  logo: 'https://www.crowndental.hu/logo.webp',
  sameAs: [
    'https://www.facebook.com/koronafogaszatesztergom',
    'https://www.instagram.com/crown_dental93',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Fogászati szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Implantátum',
          description: 'Alpha Bio és DIO implantátumok beültetése',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Cirkónium korona',
          description: 'Cirkónium és fémkerámia koronák saját laborból, akár 3 nap alatt',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fogszabályozás',
          description: 'Rögzített és láthatatlan fogszabályozó készülékek',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Szájsebészet',
          description: 'Bölcsességfog eltávolítás, csontpótlás, szájsebészeti beavatkozások',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Esztétikai fogászat',
          description: 'Héjak (veneerek), fogfehérítés, kompozit restaurációk',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '320',
    bestRating: '5',
    worstRating: '1',
  },
};

// FAQPage schema a GYIK-hez
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hol található a Crown Dental budapesti rendelője?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rendelőnk Budapest III. kerületében, a Római Parton található: 1039 Budapest, Királyok útja 55. Könnyű megközelíthetőség autóval és tömegközlekedéssel egyaránt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Helyben készülnek a fogpótlások Budapesten is?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Igen! Saját fogtechnikai laborunknak köszönhetően a koronák, hidak és fogsorok gyorsabban és kedvezőbb áron készülnek el – akár 3 nap alatt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Van ingyenes parkolás a rendelőnél?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Igen, a rendelő előtt és környékén ingyenes parkolási lehetőség áll rendelkezésre.',
      },
    },
  ],
};

export default function BudapestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
