import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildLocalizedMetadata,
  localePrefix,
  normalizeLocale,
  type SupportedLocale,
} from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string }>;
};

type PageContent = {
  title: string;
  description: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  cta: string;
};

const content: Record<SupportedLocale, PageContent> = {
  hu: {
    title: 'Utazás és szállás fogászati kezeléshez Esztergomban | Crown Dental',
    description: 'Gyakorlati segítség az Esztergomba érkező pácienseknek: kezelési időpont, utazás, szállás tervezése és kontroll a Crown Dentalnál.',
    intro: 'Ha távolabbról érkezik, előre összehangoljuk a vizsgálatot, a kezelés várható lépéseit és az esetleges kontrollokat, hogy csak ezután kelljen utazást vagy szállást foglalnia.',
    sections: [
      { title: '1. Előzetes egyeztetés', body: 'Küldje el kérdését és a rendelkezésre álló fogászati dokumentumokat. A végleges diagnózis személyes vizsgálat után készül, de előre meg tudjuk beszélni a szükséges időkeretet.' },
      { title: '2. Utazás és szállás', body: 'Esztergom autóval és tömegközlekedéssel is elérhető. Szállást csak a visszaigazolt időpont és a tervezett kezelési napok ismeretében foglaljon.' },
      { title: '3. Kontroll és utógondozás', body: 'Távozás előtt írásban összefoglaljuk a teendőket, és egyeztetjük, mikor szükséges helyszíni vagy távoli kontroll.' },
    ],
    cta: 'Utazás előtti időpont-egyeztetés',
  },
  sk: {
    title: 'Cesta a ubytovanie pri zubnom ošetrení v Ostrihome | Crown Dental',
    description: 'Praktické informácie pre pacientov cestujúcich do Ostrihomu: termín, cesta, ubytovanie a následná kontrola v Crown Dental.',
    intro: 'Ak cestujete zo Slovenska alebo zo vzdialenejšieho mesta, vopred zosúladíme vyšetrenie, predpokladané kroky liečby a kontroly. Cestu a ubytovanie si rezervujte až po potvrdení termínu.',
    sections: [
      { title: '1. Konzultácia pred cestou', body: 'Pošlite nám svoju otázku a dostupnú zubnú dokumentáciu. Definitívna diagnóza vznikne po osobnom vyšetrení, vopred však vieme odhadnúť potrebný čas.' },
      { title: '2. Cesta a ubytovanie', body: 'Ostrihom je dostupný autom aj verejnou dopravou. Ubytovanie rezervujte podľa potvrdeného termínu a počtu plánovaných návštev.' },
      { title: '3. Kontrola a následná starostlivosť', body: 'Pred odchodom dostanete písomné pokyny a dohodneme si osobnú alebo vzdialenú kontrolu podľa typu ošetrenia.' },
    ],
    cta: 'Dohodnúť termín pred cestou',
  },
  en: {
    title: 'Travel, accommodation and dental aftercare in Hungary | Crown Dental',
    description: 'Plan your dental visit to Esztergom: appointment timing, travel, accommodation and aftercare for international Crown Dental patients.',
    intro: 'For patients travelling from abroad, we coordinate the examination, expected treatment stages and follow-up before you book transport or accommodation.',
    sections: [
      { title: '1. Pre-travel assessment', body: 'Send your question and any dental records you already have. A final diagnosis requires an in-person examination, but we can discuss the likely schedule in advance.' },
      { title: '2. Travel and accommodation', body: 'Esztergom can be reached by car or public transport. Book accommodation only after your appointment and expected number of treatment days have been confirmed.' },
      { title: '3. Follow-up and aftercare', body: 'Before you leave, we provide written instructions and agree whether your follow-up should be in person or remote, depending on the treatment.' },
    ],
    cta: 'Plan your visit with our team',
  },
  de: {
    title: 'Anreise, Unterkunft und Nachsorge beim Zahnarzt in Ungarn | Crown Dental',
    description: 'Planen Sie Ihren Zahnarztbesuch in Esztergom: Terminablauf, Anreise, Unterkunft und Nachsorge für internationale Patienten.',
    intro: 'Wenn Sie aus dem Ausland anreisen, stimmen wir Untersuchung, voraussichtliche Behandlungsschritte und Kontrollen ab, bevor Sie Anreise oder Unterkunft buchen.',
    sections: [
      { title: '1. Abstimmung vor der Reise', body: 'Senden Sie uns Ihre Frage und vorhandene zahnärztliche Unterlagen. Die endgültige Diagnose erfolgt nach der persönlichen Untersuchung; den voraussichtlichen Zeitrahmen können wir vorab besprechen.' },
      { title: '2. Anreise und Unterkunft', body: 'Esztergom ist mit dem Auto und öffentlichen Verkehrsmitteln erreichbar. Buchen Sie Ihre Unterkunft erst nach Terminbestätigung und Klärung der Behandlungstage.' },
      { title: '3. Kontrolle und Nachsorge', body: 'Vor der Abreise erhalten Sie schriftliche Hinweise. Je nach Behandlung vereinbaren wir eine persönliche oder digitale Kontrolle.' },
    ],
    cta: 'Reise und Termin abstimmen',
  },
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({
    locale,
    path: 'utazas-szallas',
    title: content[locale].title,
    description: content[locale].description,
  });
}

export default async function TravelAccommodationPage(props: PageProps) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  const page = content[locale];
  const prefix = localePrefix(locale);

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-32">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-sky-600">Crown Dental Esztergom</p>
          <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">{page.title.split(' | ')[0]}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{page.intro}</p>

          <div className="mt-10 grid gap-6">
            {page.sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>

          <Link
            href={`${prefix}/idopont`}
            className="mt-10 inline-flex rounded-full bg-sky-600 px-7 py-3 font-bold text-white shadow-md transition hover:bg-sky-700"
          >
            {page.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
