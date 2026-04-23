import type { Metadata } from 'next';
import ImplantatumClient from './ImplantatumClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const seoTitle = "Fogászati Implantátum Beültetés | Crown Dental Budapest - Esztergom";
const seoDescription = "Végleges, esztétikus és tartós fogpótlás prémium titán implantátumokkal (Alpha Bio, DIO). Szakértő beültetés és saját labor a Crown Dentalnál Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Implantátum beültetés',
  description: seoDescription,
  howPerformed: 'Helyi érzéstelenítésben, ambuláns beavatkozásként',
  procedureType: 'Surgical',
  bodyLocation: 'Állkapocs, fogmeder',
  preparation: 'Panoráma röntgen, CT felvétel, konzultáció',
  followup: '3-6 hónap gyógyulási idő, majd korona felhelyezés',
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

export default async function ImplantatumPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['implantatum'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/implantatum', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <ImplantatumClient />
    </>
  );
}
