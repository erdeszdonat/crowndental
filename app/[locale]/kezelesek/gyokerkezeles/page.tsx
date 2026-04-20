import { Metadata } from 'next';
import GyokerkezelesClient from './GyokerkezelesClient';

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

export default function GyokerkezelesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GyokerkezelesClient />
    </>
  );
}
