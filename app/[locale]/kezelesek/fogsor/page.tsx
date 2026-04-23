import type { Metadata } from 'next';
import FogsorClient from './FogsorClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Kényelmes Kivehető & Rögzített Fogsorok | Crown Dental Budapest - Esztergom";
const seoDescription = "Esztétikus, kényelmes kivehető és implantátumon rögzített fogsorok saját laborunkból. Precíz illeszkedés, tartós megoldás fájdalommentesen Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogsor készítés és javítás',
  description: seoDescription,
  howPerformed: 'Precíz digitális vagy hagyományos lenyomatvétel, saját laboratóriumi kidolgozás, többszöri próba és végleges átadás.',
  procedureType: 'Prosthodontic',
  bodyLocation: 'Állkapocs, fogak',
  preparation: 'Szakorvosi állapotfelmérés, panoráma röntgen, szájüregi előkészítés',
  followup: 'Rendszeres kontroll, szükség esetén alábélelés vagy korrekció',
  status: 'EventScheduled',
  provider: {
    '@type': 'Dentist',
    name: 'Crown Dental',
    address: [
      { '@type': 'PostalAddress', streetAddress: 'Királyok útja 55.', addressLocality: 'Budapest', postalCode: '1039', addressCountry: 'HU' },
      { '@type': 'PostalAddress', streetAddress: 'Petőfi Sándor utca 11.', addressLocality: 'Esztergom', postalCode: '2500', addressCountry: 'HU' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ALOLDAL EXPORT (Szerver Komponens)
// ═══════════════════════════════════════════════════════════════════════════
export default async function FogsorPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['fogsor'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/fogsor', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <FogsorClient />
    </>
  );
}
