import type { Metadata } from 'next';
import AllapotfelmeresClient from './AllapotfelmeresClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Teljes Fogászati Állapotfelmérés & 3D CT | Crown Dental Budapest - Esztergom";
const seoDescription = "Átfogó fogászati állapotfelmérés panorámaröntgennel, intraorális kamerával és 3D CT-vel a legpontosabb diagnózis és kezelési terv érdekében Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogászati Állapotfelmérés',
  description: seoDescription,
  procedureType: 'Diagnostic',
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
export default async function AllapotfelmeresPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['allapotfelmeres'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/allapotfelmeres', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      {/* JSON-LD Strukturált adat beillesztése a keresőmotoroknak */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      
      {/* Itt töltjük be a vizuális, interaktív UI komponenst */}
      <AllapotfelmeresClient />
    </>
  );
}
