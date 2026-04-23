import { Metadata } from 'next';
import SzajsebeszetClient from './SzajsebeszetClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


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

export default async function SzajsebeszetPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['szajsebeszet'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/szajsebeszet', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <SzajsebeszetClient />
    </>
  );
}
