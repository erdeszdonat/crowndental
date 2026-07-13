import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fogászati Kezelések és Árak | Crown Dental - Esztergom & Budapest',
  description: 'Átlátható fogászati árak rejtett költségek nélkül. Teleröntgen, panoráma röntgen, diagnosztika, implantátumok és esztétikai fogászat egy helyen.',
  keywords: [
    'fogászati árak',
    'implantátum ár',
    'fogkorona ár',
    'fogszabályozás ár',
    'fogfehérítés ár',
    'fogorvos árlista',
    'fogászat esztergom árak',
    'teleröntgen ár',
    'fogászati teleröntgen',
    'cephalometric x-ray esztergom',
  ],
  openGraph: {
    title: 'Fogászati Kezelések és Árak | Crown Dental',
    description: 'Transzparens árazás, rejtett költségek nélkül. Teleröntgen 10.000 Ft, panoráma röntgen 6.000 Ft, saját labor = kedvezőbb árak.',
    url: 'https://www.crowndental.hu/kezelesek',
    type: 'website',
    images: [{ url: 'https://www.crowndental.hu/og-image.jpg', width: 1200, height: 630, alt: 'Crown Dental kezelések' }],
  },
  alternates: {
    canonical: 'https://www.crowndental.hu/kezelesek',
  },
};

export default function KezelesekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
