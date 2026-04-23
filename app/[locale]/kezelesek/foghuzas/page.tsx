import type { Metadata } from 'next';
import FoghuzasClient from './FoghuzasClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Fájdalommentes Foghúzás & Érzéstelenítés | Crown Dental Budapest - Esztergom";
const seoDescription = "Biztonságos és kíméletes foghúzás modern eszközökkel. Kérjen időpontot konzultációra a Crown Dentalhoz , várjuk Budapesten és Esztergomban";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Foghúzás és Bölcsességfog Eltávolítás',
  description: seoDescription,
  howPerformed: 'Helyi érzéstelenítésben végzett kíméletes fogeltávolítás.',
  procedureType: 'Surgical',
  bodyLocation: 'Állkapocs, fogak, szájüreg',
  preparation: 'Állapotfelmérés, panoráma röntgen vagy 3D CT felvétel',
  followup: 'Sebgyógyulás ellenőrzése, varratszedés (szükség esetén) 1 hét múlva',
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
export default async function FoghuzasPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['foghuzas'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/foghuzas', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <FoghuzasClient />
    </>
  );
}
