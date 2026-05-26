import type { Metadata } from 'next';
import BookingClient from './BookingClient';

export const metadata: Metadata = {
  title: 'Azonnali Időpont Foglalás | Crown Dental – Online Foglalás 0-24',
  description: 'Foglaljon időpontot online a Crown Dental fogászatra! Válasszon kezelést és időpontot Esztergomban vagy Budapesten. Azonnali visszaigazolás!',
  keywords: [
    'időpont foglalás fogászat',
    'online időpontfoglalás fogorvos',
    'fogászat időpont esztergom',
    'fogorvos időpont budapest',
  ],
  alternates: {
    canonical: 'https://www.crowndental.hu/idopont',
  },
  openGraph: {
    title: 'Időpont Foglalás | Crown Dental',
    description: 'Foglaljon időpontot online! Első konzultáció ingyenes. Esztergom és Budapest.',
    url: 'https://www.crowndental.hu/idopont',
    type: 'website',
  }
};

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
};

export default function BookingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookingClient />
    </>
  );
}
