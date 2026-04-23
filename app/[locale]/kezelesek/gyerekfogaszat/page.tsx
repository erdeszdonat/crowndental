import type { Metadata } from 'next';
import GyerekfogaszatClient from './GyerekfogaszatClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const seoTitle = "Játékos Gyermekfogászat Fájdalommentesen | Crown Dental Budapest - Esztergom";
const seoDescription = "Barátságos gyermekfogászat, ahol a kicsik mosolyogva távoznak! Tejfog kezelések, barázdazárás és prevenció türelmes, játékos környezetben Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Gyermekfogászat',
  description: seoDescription,
  howPerformed: 'Játékos ismerkedés a műszerekkel, fájdalommentes helyi érzéstelenítés, gyors és kíméletes beavatkozás.',
  procedureType: 'Therapeutic',
  bodyLocation: 'Fogak, szájüreg',
  preparation: 'Nincs szükség előkészületre, csak pozitív hozzáállásra',
  followup: 'Féléves rendszeres gyermekfogászati kontroll és motiválás',
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

export default async function GyerekfogaszatPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['gyerekfogaszat'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/gyerekfogaszat', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <GyerekfogaszatClient />
    </>
  );
}
