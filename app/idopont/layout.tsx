import { Metadata } from 'next';

// IDŐPONT FOGLALÁS OLDAL SEO
export const metadata: Metadata = {
  title: 'Időpont Foglalás | Crown Dental – Online Foglalás 0-24',
  description: 'Foglaljon időpontot online a Crown Dental fogászatra! Válasszon kezelést és időpontot Esztergomban vagy Budapesten. Azonnali visszaigazolás, első konzultáció ingyenes.',
  keywords: [
    'időpont foglalás fogászat',
    'online időpontfoglalás fogorvos',
    'fogászat időpont esztergom',
    'fogorvos időpont budapest',
    'crown dental időpont',
  ],
  authors: [{ name: 'Crown Dental' }],
  creator: 'Crown Dental',
  publisher: 'Crown Dental',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Időpont Foglalás | Crown Dental',
    description: 'Foglaljon időpontot online! Első konzultáció ingyenes. Esztergom és Budapest.',
    url: 'https://www.crowndental.hu/idopont',
    siteName: 'Crown Dental',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: 'https://www.crowndental.hu/og-idopont.jpg',
        width: 1200,
        height: 630,
        alt: 'Crown Dental - Időpont foglalás',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Időpont Foglalás | Crown Dental',
    description: 'Online időpontfoglalás Esztergomban és Budapesten. Első konzultáció ingyenes!',
  },
  alternates: {
    canonical: 'https://www.crowndental.hu/idopont',
  },
};

// JSON-LD - Reservation Action schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': 'https://www.crowndental.hu/idopont',
  name: 'Crown Dental - Időpont Foglalás',
  description: 'Online időpontfoglalás fogászati kezelésekre',
  url: 'https://www.crowndental.hu/idopont',
  telephone: '+36705646837',
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.crowndental.hu/idopont',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'Reservation',
      name: 'Fogászati időpont',
    },
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
};

export default function IdopontLayout({
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
