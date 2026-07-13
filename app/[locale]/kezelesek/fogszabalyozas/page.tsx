import { Metadata } from 'next';
import FogszabalyozasClient from './FogszabalyozasClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogszabályozás',
  description: 'Esztétikus fogsor kialakítása rögzített és láthatatlan fogszabályozókkal, helyben elérhető teleröntgen diagnosztikával.',
  howPerformed: 'Személyre szabott készülékekkel, helyben végzett teleröntgen diagnosztikával és rendszeres aktiválással',
  procedureType: 'Orthodontic',
  bodyLocation: 'Fogak, állkapocs',
  preparation: 'Digitális lenyomatvétel, panoráma röntgen, helyben végzett teleröntgen, fotódokumentáció',
  followup: 'Havi kontroll, majd retenciós készülék viselése',
  status: 'EventScheduled',
};

export const metadata: Metadata = {
  title: 'Fogszabályozás Teleröntgennel Felnőtteknek és Gyerekeknek | Crown Dental',
  description: 'Modern fogszabályozás felnőtteknek és gyerekeknek, helyben végzett teleröntgen diagnosztikával és személyre szabott kezelési tervvel Esztergomban.',
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
