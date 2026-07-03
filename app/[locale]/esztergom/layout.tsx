import { Metadata } from 'next';

// ═══════════════════════════════════════════════════════════════════════════
// A RÉGI FŐOLDAL SEO ADATAI
// Cél: az Esztergom aloldalra irányítva a Google helyezés megőrzéséhez
// ═══════════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: 'Fogászat és Fogtechnikai Labor Esztergomban | Crown Dental',
  description: 'Modern Fogászatot Keres Esztergomban? Fogpótlás, Panoráma röntgen, szájsebészeti, dentálhigiénia és általános fogászat. Várjuk esztergomi fogászati rendelőnkben!',
  keywords: [
    'fogászat esztergom',
    'fogorvos esztergom',
    'fogtechnikai labor esztergom',
    'fogpótlás esztergom',
    'implantátum esztergom',
    'fogszabályozás esztergom',
    'fogfehérítés esztergom',
    'crown dental esztergom',
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
    title: 'Fogászat és Fogtechnikai Labor Esztergomban | Crown Dental',
    description: 'Modern Fogászatot Keres Esztergomban? Fogpótlás, Panoráma röntgen, szájsebészeti, dentálhigiénia és általános fogászat. 30+ év tapasztalat, saját labor.',
    url: 'https://www.crowndental.hu/esztergom',
    siteName: 'Crown Dental',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: 'https://www.crowndental.hu/og-esztergom.jpg',
        width: 1200,
        height: 630,
        alt: 'Crown Dental Esztergom - Fogászat és Fogtechnikai Labor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fogászat és Fogtechnikai Labor Esztergomban | Crown Dental',
    description: 'Modern Fogászatot Keres Esztergomban? 30+ év tapasztalat, saját fogtechnikai labor.',
    images: ['https://www.crowndental.hu/og-esztergom.jpg'],
  },
  alternates: {
    canonical: 'https://www.crowndental.hu/esztergom',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Cseréld ki a saját kódodra, vagy intézd a TXT rekorddal
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD STRUKTURÁLT ADATOK (LocalBusiness schema a helyi SEO-hoz)
// ═══════════════════════════════════════════════════════════════════════════
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  '@id': 'https://www.crowndental.hu/esztergom',
  name: 'Crown Dental Esztergom',
  description: 'Modern fogászat és fogtechnikai labor Esztergomban. 30+ év tapasztalat, saját labor, prémium anyagok.',
  url: 'https://www.crowndental.hu/esztergom',
  telephone: '+36705646837',
  email: 'info@crowndental.hu',
  foundingDate: '1994',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Petőfi Sándor utca 11.',
    addressLocality: 'Esztergom',
    postalCode: '2500',
    addressCountry: 'HU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.79269,
    longitude: 18.74323,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '07:00',
      closes: '13:00',
    },
  ],
  image: 'https://www.crowndental.hu/images/esztergom-rendelo.jpg',
  logo: 'https://www.crowndental.hu/logo.webp',
  sameAs: [
    'https://www.wikidata.org/wiki/Q139545504',
    'https://www.facebook.com/koronafogaszatesztergom',
    'https://www.instagram.com/crown_dental93',
    'https://www.google.com/maps?cid=13855060144941940295',
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
          name: 'Fogpótlás',
          description: 'Cirkónium és fémkerámia koronák saját laborból',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fogszabályozás',
          description: 'Rögzített és kivehető fogszabályozó készülékek',
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

export default function EsztergomLayout({
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
      {children}
    </>
  );
}
