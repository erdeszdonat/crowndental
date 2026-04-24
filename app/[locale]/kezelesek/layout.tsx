import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fogászati Kezelések és Árak | Crown Dental - Esztergom & Budapest',
  description: 'Átlátható fogászati árak rejtett költségek nélkül. Fedezze fel kezeléseinket a diagnosztikától az implantátumokig és az esztétikai fogászatig!',
  keywords: [
    'fogászati árak',
    'implantátum ár',
    'fogkorona ár',
    'fogszabályozás ár',
    'fogfehérítés ár',
    'fogorvos árlista',
    'fogászat esztergom árak',
  ],
  openGraph: {
    title: 'Fogászati Kezelések és Árak | Crown Dental',
    description: 'Transzparens árazás, rejtett költségek nélkül. Saját labor = akár 40% megtakarítás a budapesti árakhoz képest.',
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
