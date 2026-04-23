import { Metadata } from 'next';
import GyokerkezelesClient from './GyokerkezelesClient';
import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import { treatmentFaqs } from '@/lib/treatmentFaqs';


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Gyökérkezelés',
  description: 'Modern és kíméletes professzionális gyökérkezelés a fog megmentéséért.',
  howPerformed: 'Helyi érzéstelenítésben végzett fogbél eltávolítás, a gyökércsatornák gépi tisztítása és hermetikus lezárása.',
  procedureType: 'Therapeutic',
  bodyLocation: 'Fogak, fogbél',
  preparation: 'Állapotfelmérés és röntgenfelvétel',
  followup: 'Kontroll röntgen, majd a fog koronával vagy betéttel történő helyreállítása',
  status: 'EventScheduled',
};

export const metadata: Metadata = {
  title: 'Fájdalommentes Gyökérkezelés | Mentsük meg fogát! | Crown Dental Budapest - Esztergom',
  description: 'Modern és kíméletes professzionális gyökérkezelés a fog megmentéséért. Személyre szabott kezelési terv és szakértő ellátás a Crown Dentalnál Budapesten és Esztergomban.',
};

export default async function GyokerkezelesPage() {
  const faqJsonLd = buildFaqJsonLd(treatmentFaqs['gyokerkezeles'] ?? []);
  const speakableJsonLd = buildSpeakableJsonLd('https://www.crowndental.hu/kezelesek/gyokerkezeles', ['h1', '.treatment-lead', '.faq-section']);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
      <GyokerkezelesClient />
    </>
  );
}
