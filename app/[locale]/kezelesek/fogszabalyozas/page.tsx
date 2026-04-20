import { Metadata } from 'next';
import FogszabalyozasClient from './FogszabalyozasClient';

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

export default function FogszabalyozasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FogszabalyozasClient />
    </>
  );
}
