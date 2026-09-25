import type { Metadata } from 'next';
import HidfutasClient from './HidfutasClient';

export const metadata: Metadata = {
  title: 'Hídfutás 2026 · Pörgess a mosolyodért! | Crown Dental',
  description: 'Crown Dental nyereményjáték a Hídfutáson. Pörgess azonnali ajándékért, és nevezz a szeptember 28-i rendelői fogfehérítés-sorsolásra!',
  alternates: { canonical: 'https://www.crowndental.hu/hidfutas' },
  robots: { index: false, follow: true },
};

export default function HidfutasPage() {
  return <HidfutasClient />;
}
