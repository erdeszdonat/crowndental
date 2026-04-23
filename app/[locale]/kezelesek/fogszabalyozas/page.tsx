import { Metadata } from 'next';
import FogszabalyozasClient from './FogszabalyozasClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogszabályozás',
  description: 'Esztétikus fogsor kialakítása rögzített és láthatatlan fogszabályozókkal.',
  howPerformed: 'Személyre szabott készülékekkel, rendszeres aktiválással',
  procedureType: 'Orthodontic',
  bodyLocation: 'Fogak, állkapocs',
  preparation: 'Digitális lenyomatvétel, panoráma röntgen, fotódokumentáció',
  followup: 'Havi kontroll, majd retenciós készülék viselése',
  status: 'EventScheduled',
};

export const metadata: Metadata = {
  title: 'Fogszabályozás Felnőtteknek és Gyerekeknek | Crown Dental Budapest - Esztergom',
  description: 'Esztétikus fogsor kialakítása rögzített és láthatatlan fogszabályozókkal. Modern fogszabályozás felnőtteknek és gyerekeknek a Crown Dentalnál Budapesten és Esztergomban.',
};

export default async function FogszabalyozasPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['fogszabalyozas'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/fogszabalyozas', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <FogszabalyozasClient />
    </>
  );
}
