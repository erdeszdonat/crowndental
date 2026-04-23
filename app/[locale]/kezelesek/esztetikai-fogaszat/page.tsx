import type { Metadata } from 'next';
import EsztetikaiFogaszatClient from './EsztetikaiFogaszatClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Esztétikai Fogászat & Mosolytervezés | Crown Dental Budapest - Esztergom";
const seoDescription = "Szerezze vissza önbizalmát! Teljes körű esztétikai fogászat: mosolytervezés, fogfehérítés, porcelán héjak és esztétikus tömések Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Esztétikai Fogászat',
  description: seoDescription,
  procedureType: 'Cosmetic',
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
export default async function EsztetikaiFogaszatPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['esztetikai-fogaszat'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/esztetikai-fogaszat', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <EsztetikaiFogaszatClient />
    </>
  );
}
