// app/kezelesek/implantatum/page.tsx
// Fogimplantátum szolgáltatás oldal - példa a ServicePage sablon használatára

import { Metadata } from 'next';
import ServicePage from '@/components/ServicePage';
import { serviceMetadata } from '@/lib/metadata';
import {
  Clock,
  Shield,
  Banknote,
  Stethoscope,
  Microscope,
  Heart,
} from 'lucide-react';

// SEO Metadata - a központi konfigból
export const metadata: Metadata = serviceMetadata.implantatum;

// JSON-LD strukturált adat
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogimplantátum beültetés',
  description: 'Tartós fogpótlás titán implantátummal',
  howPerformed: 'Helyi érzéstelenítésben, ambuláns beavatkozásként',
  procedureType: 'Surgical',
  bodyLocation: 'Állkapocs, fogmeder',
  preparation: 'Panoráma röntgen, CT felvétel, konzultáció',
  followup: '3-6 hónap gyógyulási idő, majd korona felhelyezés',
  status: 'EventScheduled',
};

export default function ImplantatumPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ServicePage
        slug="implantatum"
        title="Fogimplantátum"
        heroSubtitle="Tartós megoldás foghiányra – Prémium implantátumok saját laborból, akár 40%-kal kedvezőbb áron"
        heroImage="/images/services/implantatum-hero.jpg"
        problemStatement="Hiányzik egy vagy több foga? A lyukas mosoly nemcsak esztétikai probléma – a szomszédos fogak elmozdulnak, a csont visszahúzódik, az állkapocs deformálódhat. A hagyományos híd pedig a szomszédos, ép fogak lecsiszolásával jár."
        solutionIntro="A fogimplantátum a természetes foggyökér pótlása titán csavarral. Nem kell hozzá a szomszédos fogakat bántani, és akár egy életen át tarthat. A Crown Dental-nál saját fogtechnikai laborunk van, így a teljes folyamat – az implantátum beültetéstől a korona elkészítéséig – egy kézben van. Ez gyorsabb, precízebb, és akár 40%-kal olcsóbb, mint a budapesti klinikákon."
        benefits={[
          {
            icon: <Shield className="w-6 h-6" />,
            title: 'Életre szóló garancia',
            description:
              'A beültetésre életre szóló, a koronára 5 év garanciát vállalunk. Ha bármi probléma adódik, ingyen javítjuk.',
          },
          {
            icon: <Clock className="w-6 h-6" />,
            title: 'Gyors elkészülés',
            description:
              'Saját labor = nincs várakozás külső technikusra. A korona 3-5 nap alatt elkészül, nem 2-3 hét alatt.',
          },
          {
            icon: <Banknote className="w-6 h-6" />,
            title: 'Átlátható árazás',
            description:
              'Nincs rejtett költség. Az első konzultáción pontos árajánlatot kap, ami nem változik.',
          },
          {
            icon: <Stethoscope className="w-6 h-6" />,
            title: 'Fájdalommentes eljárás',
            description:
              'Modern érzéstelenítéssel a beavatkozás fájdalommentes. Sok páciensünk szerint kevésbé fáj, mint egy foghúzás.',
          },
          {
            icon: <Microscope className="w-6 h-6" />,
            title: 'Prémium anyagok',
            description:
              'Straumann (svájci) és Osstem (koreai) implantátumok – mindkettő világszínvonalú, de eltérő árkategória.',
          },
          {
            icon: <Heart className="w-6 h-6" />,
            title: '30 év tapasztalat',
            description:
              'Dr. Kovács Péter 30 éve végez implantációkat. Több ezer sikeres beavatkozás áll mögöttünk.',
          },
        ]}
        process={[
          {
            step: 1,
            title: 'Ingyenes konzultáció',
            description:
              'Panoráma röntgen, CT felvétel (ha szükséges), részletes vizsgálat. Megbeszéljük a lehetőségeket és pontos árajánlatot adunk.',
            duration: '30-45 perc',
          },
          {
            step: 2,
            title: 'Implantátum beültetése',
            description:
              'Helyi érzéstelenítésben beültetjük az implantátumot. A beavatkozás fájdalommentes, utána azonnal hazamehet.',
            duration: '30-60 perc',
          },
          {
            step: 3,
            title: 'Gyógyulási idő',
            description:
              'Az implantátum összeforr a csonttal. Ez általában 3-6 hónap, de egynapos implantátumnál akár azonnal terhelhetõ.',
            duration: '3-6 hónap',
          },
          {
            step: 4,
            title: 'Korona készítés',
            description:
              'Saját laborunkban elkészítjük a tökéletesen illeszkedő koronát. Cirkónium vagy porcelán – Ön választ.',
            duration: '3-5 nap',
          },
          {
            step: 5,
            title: 'Korona felhelyezés',
            description:
              'Felhelyezzük a végleges koronát. Innentől használhatja, mintha saját foga lenne!',
            duration: '30 perc',
          },
        ]}
        faq={[
          {
            question: 'Mennyibe kerül egy fogimplantátum?',
            answer:
              'A teljes kezelés (implantátum + felépítmény + korona) 280.000 Ft-tól indul koreai implantátummal, és 380.000 Ft-tól Straumann implantátummal. A pontos ár a CT felvétel alapján derül ki – van-e szükség csontpótlásra, hány implantátumra van szükség, stb.',
          },
          {
            question: 'Fáj az implantátum beültetése?',
            answer:
              'Nem. Modern érzéstelenítéssel a beavatkozás teljesen fájdalommentes. Utána 1-2 napig lehet enyhe duzzanat és kellemetlenség, amit gyulladáscsökkentővel kezelünk.',
          },
          {
            question: 'Meddig tart a gyógyulás?',
            answer:
              'Az implantátum és a csont összeforradása általában 3-6 hónap. Ez idő alatt ideiglenes pótlást kap, hogy ne járjon lyukas mosolylyal. Bizonyos esetekben egynapos implantátum is lehetséges.',
          },
          {
            question: 'Mi a különbség a Straumann és a koreai implantátum között?',
            answer:
              'Mindkettő kiváló minőségű, világszerte használt implantátum. A Straumann (svájci) a prémium kategória, 60+ év fejlesztéssel a háta mögött. A koreai (Osstem, Dentium) implantátumok újabbak, de kiváló eredményekkel – és jelentősen olcsóbbak.',
          },
          {
            question: 'Van garancia az implantátumra?',
            answer:
              'A beültetésre életre szóló, a koronára 5 év garanciát vállalunk. A gyártói garancia (Straumann: 10 év, Osstem: 5 év) ezen felül érvényes.',
          },
          {
            question: 'Miért olcsóbb nálatok, mint máshol?',
            answer:
              'Saját fogtechnikai laborunk van. A legtöbb klinika külső laborba küldi a munkát, ami felárral jár és lassabb. Nálunk a fogorvos és a fogtechnikus együtt dolgozik – ez gyorsabb, pontosabb, és olcsóbb.',
          },
        ]}
        priceFrom={280000}
        competitorPrice={450000}
        priceNote="A végleges ár a CT felvétel és konzultáció után derül ki"
      />
    </>
  );
}
