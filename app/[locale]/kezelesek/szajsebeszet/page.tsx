import { Metadata } from 'next';
import SzajsebeszetClient from './SzajsebeszetClient';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Szájsebészet és Foghúzás',
  description: 'Szájsebészeti beavatkozások biztonságosan, fájdalommentesen.',
  howPerformed: 'Helyi érzéstelenítésben végzett kíméletes szájsebészeti beavatkozások, lebenyképzéssel vagy anélkül.',
  procedureType: 'Surgical',
  bodyLocation: 'Állkapocs, fogak, szájüreg',
  preparation: 'Állapotfelmérés, 3D CT felvétel, panoráma röntgen',
  followup: 'Kontrollvizsgálat és varratszedés 1 hét múlva',
  status: 'EventScheduled',
};

export const metadata: Metadata = {
  title: 'Fájdalommentes Szájsebészet | Húzás, Bölcsességfog | Crown Dental Budapest - Esztergom',
  description: 'Szájsebészeti beavatkozások biztonságosan, fájdalommentesen. Bölcsességfog eltávolítás és komplikált húzások professzionális környezetben Budapesten és Esztergomban.',
};

export default function SzajsebeszetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SzajsebeszetClient />
    </>
  );
}
