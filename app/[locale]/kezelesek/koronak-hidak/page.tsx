import type { Metadata } from 'next';
import KoronakHidakClient from './KoronakHidakClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const seoTitle = "Cirkon Koronák és Hidak | Esztétikus Fogpótlás | Crown Dental Budapest - Esztergom";
const seoDescription = "Tartós és esztétikus cirkónium és kerámia koronák, hidak foghiány esetén. Kérjen egyedi kezelési tervet Budapesten vagy Esztergomban!";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogkoronák és hidak',
  description: seoDescription,
  howPerformed: 'Helyi érzéstelenítésben történő fog-előkészítés, digitális lenyomatvétel, laboratóriumi gyártás és rögzítés.',
  procedureType: 'Prosthodontic',
  bodyLocation: 'Fogak',
  preparation: 'Állapotfelmérés, panoráma röntgen, fog előkészítése',
  followup: 'Rendszeres éves fogászati kontroll.',
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

export default async function KoronakHidakPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['koronak-hidak'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/koronak-hidak', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <KoronakHidakClient />
    </>
  );
}
