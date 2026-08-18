import type { Metadata } from 'next';
import {
  HREFLANG_BY_LOCALE,
  buildLocalizedMetadata,
  localizedUrl,
} from '@/lib/seo';
import { INTERNATIONAL_PATIENT_PATHS } from '@/lib/internationalPaths';

export { INTERNATIONAL_PATIENT_PATHS } from '@/lib/internationalPaths';

export type InternationalLandingLocale = 'sk' | 'en' | 'de';

export type InternationalLandingContent = {
  locale: InternationalLandingLocale;
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  benefitsTitle: string;
  benefits: Array<{ title: string; body: string }>;
  treatmentsTitle: string;
  treatmentsIntro: string;
  treatments: Array<{ slug: string; title: string; body: string }>;
  processTitle: string;
  process: Array<{ title: string; body: string }>;
  planningTitle: string;
  planningBody: string;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
};

export const INTERNATIONAL_PATIENT_CONTENT: Record<InternationalLandingLocale, InternationalLandingContent> = {
  sk: {
    locale: 'sk',
    path: INTERNATIONAL_PATIENT_PATHS.sk,
    eyebrow: 'Crown Dental Ostrihom · pre pacientov zo Slovenska',
    title: 'Zubné ošetrenie v Maďarsku blízko Štúrova',
    description: 'Zubné ošetrenie v Ostrihome pre pacientov zo Slovenska: vlastné zubnotechnické laboratórium, prehľadný plán, ceny a následná starostlivosť.',
    lead: 'Crown Dental sa nachádza v centre Ostrihomu, neďaleko slovensko-maďarskej hranice. Vyšetrenie, plán ošetrenia aj potrebné kontroly koordinujeme tak, aby ste ešte pred cestou vedeli, koľko návštev bude pravdepodobne potrebných. Konečný plán a cena vzniknú po osobnom vyšetrení.',
    primaryCta: 'Objednať sa na vyšetrenie',
    secondaryCta: 'Pozrieť ošetrenia a ceny',
    benefitsTitle: 'Prečo pacienti zo Slovenska volia Crown Dental',
    benefits: [
      { title: 'Ostrihom pri slovenskej hranici', body: 'Ambulancia je prakticky dostupná zo Štúrova, Nových Zámkov, Komárna aj z južného Slovenska.' },
      { title: 'Vlastné zubnotechnické laboratórium', body: 'Pri korunkách, mostíkoch a protézach je komunikácia medzi ambulanciou a laboratóriom priama.' },
      { title: 'Plán pred ďalšími návštevami', body: 'Po vyšetrení dostanete zrozumiteľný návrh ďalších krokov, časového rámca a individuálnej ceny.' },
      { title: 'Kontrola a následná starostlivosť', body: 'Dohodneme si kontroly a vysvetlíme, ktoré situácie vyžadujú osobnú návštevu.' },
    ],
    treatmentsTitle: 'Najčastejšie vyhľadávané ošetrenia',
    treatmentsIntro: 'Najvhodnejšie riešenie závisí od vyšetrenia, snímok, zdravotného stavu a vašich očakávaní. Nasledujúce stránky vysvetľujú možnosti bez prísľubu diagnózy na diaľku.',
    treatments: [
      { slug: 'implantatum', title: 'Zubné implantáty', body: 'Možnosti náhrady chýbajúceho zuba a podmienky bezpečného plánovania.' },
      { slug: 'fogsor', title: 'Zubné protézy', body: 'Snímateľné a implantátmi stabilizované riešenia pri väčšom počte chýbajúcich zubov.' },
      { slug: 'koronak-hidak', title: 'Korunky a mostíky', body: 'Materiály, postup a spolupráca s vlastným zubnotechnickým laboratóriom.' },
      { slug: 'allapotfelmeres', title: 'Vstupné vyšetrenie', body: 'Prvý krok k diagnóze, možnostiam liečby a individuálnemu cenovému plánu.' },
    ],
    processTitle: 'Ako prebieha plánovanie',
    process: [
      { title: '1. Kontakt', body: 'Napíšte nám, s čím potrebujete pomôcť, a uveďte, odkiaľ cestujete.' },
      { title: '2. Osobné vyšetrenie', body: 'Lekár posúdi stav chrupu a podľa potreby odporučí snímky alebo ďalšiu diagnostiku.' },
      { title: '3. Individuálny plán', body: 'Dostanete vysvetlenie možností, poradia krokov, predpokladaného počtu návštev a ceny.' },
      { title: '4. Ošetrenie a kontrola', body: 'Termíny prispôsobíme jednotlivým fázam a dohodneme následnú starostlivosť.' },
    ],
    planningTitle: 'Cesta, termíny a dokumentácia',
    planningBody: 'Ak máte panoramatickú snímku, starší liečebný plán alebo zoznam užívaných liekov, prineste ich na vyšetrenie. Cestu alebo ubytovanie rezervujte až po potvrdení termínu a predpokladaného harmonogramu.',
    faqTitle: 'Časté otázky pacientov zo Slovenska',
    faqs: [
      { q: 'Dá sa konečná cena určiť pred návštevou?', a: 'Nie spoľahlivo. Presná cena závisí od osobného vyšetrenia, diagnostiky a zvoleného riešenia. Po vyšetrení dostanete individuálny plán.' },
      { q: 'Koľko návštev bude potrebných?', a: 'Závisí to od typu ošetrenia. Jednoduché zákroky môžu vyžadovať jednu návštevu, protetické a implantologické riešenia zvyčajne viac fáz.' },
      { q: 'Môžem poslať snímku vopred?', a: 'Áno, dostupná dokumentácia môže pomôcť pri príprave termínu, ale nenahrádza osobné vyšetrenie ani definitívnu diagnózu.' },
      { q: 'Je možné dohodnúť viac výkonov na jeden deň?', a: 'Niekedy áno, ak je to medicínsky vhodné. Rozsah sa potvrdí až po vyšetrení a zhodnotení bezpečnosti.' },
      { q: 'Ako fungujú kontroly?', a: 'Kontroly naplánujeme podľa ošetrenia. Pri akútnych ťažkostiach je potrebné kontaktovať ambulanciu bez odkladu.' },
    ],
  },
  en: {
    locale: 'en',
    path: INTERNATIONAL_PATIENT_PATHS.en,
    eyebrow: 'Crown Dental Esztergom · information for UK patients',
    title: 'Dental treatment in Hungary for UK patients',
    description: 'Plan dental treatment in Hungary with Crown Dental Esztergom: examination, individual quotation, in-house dental laboratory, travel and aftercare.',
    lead: 'Crown Dental is a dental clinic with an in-house laboratory in Esztergom, north of Budapest. We help international patients understand the likely treatment stages and number of visits before they commit to travel. A definitive diagnosis and quotation always require an in-person examination.',
    primaryCta: 'Request an examination',
    secondaryCta: 'View treatments and prices',
    benefitsTitle: 'What UK patients can expect',
    benefits: [
      { title: 'A clear treatment sequence', body: 'After assessment, we explain the available options, their order, likely timing and the individual quotation.' },
      { title: 'In-house dental laboratory', body: 'Direct communication between the clinic and laboratory supports crown, bridge and denture work.' },
      { title: 'Travel-aware scheduling', body: 'We consider the stages that require an in-person visit and avoid suggesting travel before the appointment is confirmed.' },
      { title: 'Written aftercare guidance', body: 'You receive practical instructions and an agreed follow-up plan before leaving Hungary.' },
    ],
    treatmentsTitle: 'Treatments international patients commonly research',
    treatmentsIntro: 'Suitability cannot be decided from price or photographs alone. Examination, imaging, medical history and your priorities all affect the safest option.',
    treatments: [
      { slug: 'implantatum', title: 'Dental implants', body: 'Assessment, treatment stages and factors that influence implant suitability.' },
      { slug: 'fogsor', title: 'Dentures', body: 'Removable and implant-stabilised options for multiple missing teeth.' },
      { slug: 'koronak-hidak', title: 'Crowns and bridges', body: 'Materials, preparation and collaboration with our in-house dental laboratory.' },
      { slug: 'allapotfelmeres', title: 'Initial dental assessment', body: 'The starting point for diagnosis, alternatives, timing and a personalised quotation.' },
    ],
    processTitle: 'How treatment planning works',
    process: [
      { title: '1. Tell us what you need', body: 'Describe the problem, where you are travelling from and any dates you are considering.' },
      { title: '2. Attend an examination', body: 'The dentist assesses your teeth and may recommend imaging or further diagnostic steps.' },
      { title: '3. Review your options', body: 'We explain reasonable alternatives, treatment stages, visit requirements and the individual quotation.' },
      { title: '4. Confirm treatment and aftercare', body: 'Appointments follow the clinical stages, with written advice and a follow-up plan.' },
    ],
    planningTitle: 'Travel, records and continuity of care',
    planningBody: 'Bring any recent dental imaging, treatment plans and an up-to-date medication list. Do not book non-refundable travel or accommodation until your appointment and expected schedule have been confirmed. Ask your usual dentist for copies of relevant records if ongoing care may be needed at home.',
    faqTitle: 'Questions UK patients often ask',
    faqs: [
      { q: 'Can I receive a final quote before travelling?', a: 'Not safely. Records may help with preparation, but a final diagnosis and quotation require an in-person examination and any necessary imaging.' },
      { q: 'How many trips will treatment require?', a: 'It depends on the treatment and healing stages. Some care may be completed in one visit, while implant and laboratory work commonly require more than one phase.' },
      { q: 'Can I send an X-ray in advance?', a: 'Yes. It may help us prepare for your appointment, but it does not replace a current examination or guarantee a particular treatment.' },
      { q: 'What happens if I need help after returning home?', a: 'Contact Crown Dental promptly for advice. Depending on the symptoms, you may also need an in-person assessment by a local dentist.' },
      { q: 'Are travel and accommodation included?', a: 'No. We help you understand the expected schedule, but travel and accommodation remain separate and should be booked only after confirmation.' },
    ],
  },
  de: {
    locale: 'de',
    path: INTERNATIONAL_PATIENT_PATHS.de,
    eyebrow: 'Crown Dental Esztergom · für deutschsprachige Patienten',
    title: 'Zahnbehandlung in Ungarn für deutsche Patienten',
    description: 'Zahnbehandlung in Ungarn planen: Untersuchung, individueller Kostenplan, eigenes Dentallabor, Anreise und Nachsorge bei Crown Dental Esztergom.',
    lead: 'Crown Dental ist eine Zahnarztpraxis mit eigenem Dentallabor in Esztergom, nördlich von Budapest. Wir stimmen die voraussichtlichen Behandlungsschritte und notwendigen Besuche ab, bevor Sie verbindlich anreisen. Eine endgültige Diagnose und ein verbindlicher Kostenplan sind erst nach der persönlichen Untersuchung möglich.',
    primaryCta: 'Untersuchung anfragen',
    secondaryCta: 'Behandlungen und Preise ansehen',
    benefitsTitle: 'Was deutschsprachige Patienten erwarten können',
    benefits: [
      { title: 'Nachvollziehbarer Behandlungsplan', body: 'Nach der Untersuchung erläutern wir Alternativen, Reihenfolge, Zeitrahmen und den individuellen Kostenplan.' },
      { title: 'Eigenes Dentallabor', body: 'Bei Kronen, Brücken und Prothesen erfolgt die Abstimmung zwischen Praxis und Labor auf direktem Weg.' },
      { title: 'Reisegerechte Terminplanung', body: 'Wir berücksichtigen, welche Behandlungsschritte einen persönlichen Termin erfordern.' },
      { title: 'Nachsorge mit klaren Hinweisen', body: 'Vor der Abreise erhalten Sie praktische Informationen und einen abgestimmten Kontrollplan.' },
    ],
    treatmentsTitle: 'Häufig gesuchte Behandlungen',
    treatmentsIntro: 'Die geeignete Versorgung hängt von Untersuchung, Bildgebung, Vorerkrankungen und Ihren persönlichen Zielen ab. Eine reine Preisentscheidung ist dafür nicht ausreichend.',
    treatments: [
      { slug: 'implantatum', title: 'Zahnimplantate', body: 'Voraussetzungen, Behandlungsschritte und Faktoren für eine sichere Planung.' },
      { slug: 'fogsor', title: 'Zahnprothesen', body: 'Herausnehmbare und implantatgestützte Möglichkeiten bei mehreren fehlenden Zähnen.' },
      { slug: 'koronak-hidak', title: 'Kronen und Brücken', body: 'Materialien, Ablauf und Zusammenarbeit mit dem eigenen Dentallabor.' },
      { slug: 'allapotfelmeres', title: 'Erstuntersuchung', body: 'Grundlage für Diagnose, Alternativen, Zeitplanung und einen individuellen Kostenplan.' },
    ],
    processTitle: 'So läuft die Planung ab',
    process: [
      { title: '1. Anfrage', body: 'Beschreiben Sie Ihr Anliegen, Ihren Wohnort und den möglichen Reisezeitraum.' },
      { title: '2. Persönliche Untersuchung', body: 'Der Zahnarzt beurteilt die Situation und empfiehlt bei Bedarf Bildgebung oder weitere Diagnostik.' },
      { title: '3. Individueller Plan', body: 'Sie erhalten eine Erklärung der Optionen, Behandlungsschritte, notwendigen Besuche und Kosten.' },
      { title: '4. Behandlung und Kontrolle', body: 'Die Termine folgen den medizinisch notwendigen Phasen; die Nachsorge wird vorab besprochen.' },
    ],
    planningTitle: 'Anreise, Unterlagen und Weiterbehandlung',
    planningBody: 'Bringen Sie vorhandene Röntgenaufnahmen, frühere Behandlungspläne und eine aktuelle Medikamentenliste mit. Buchen Sie nicht stornierbare Reisen oder Unterkünfte erst, wenn Termin und voraussichtlicher Ablauf bestätigt sind.',
    faqTitle: 'Häufige Fragen deutschsprachiger Patienten',
    faqs: [
      { q: 'Erhalte ich vor der Anreise einen verbindlichen Preis?', a: 'Nein. Unterlagen können die Vorbereitung erleichtern, doch Diagnose und verbindlicher Kostenplan setzen eine persönliche Untersuchung voraus.' },
      { q: 'Wie viele Termine sind notwendig?', a: 'Das hängt von der Behandlung und möglichen Heilungsphasen ab. Implantologische und zahntechnische Versorgungen benötigen häufig mehrere Schritte.' },
      { q: 'Kann ich Röntgenbilder vorab senden?', a: 'Ja. Vorhandene Aufnahmen können bei der Terminvorbereitung helfen, ersetzen aber keine aktuelle Untersuchung.' },
      { q: 'Wie funktioniert die Nachsorge in Deutschland?', a: 'Wir geben Ihnen Hinweise und einen Kontrollplan. Bei akuten Beschwerden kann zusätzlich eine persönliche Untersuchung bei einem Zahnarzt vor Ort notwendig sein.' },
      { q: 'Sind Reise und Unterkunft im Behandlungspreis enthalten?', a: 'Nein. Reise und Unterkunft werden separat organisiert und sollten erst nach der Terminbestätigung gebucht werden.' },
    ],
  },
};

export function internationalPatientAlternates(): Record<string, string> {
  return {
    [HREFLANG_BY_LOCALE.sk]: localizedUrl('sk', INTERNATIONAL_PATIENT_PATHS.sk),
    [HREFLANG_BY_LOCALE.en]: localizedUrl('en', INTERNATIONAL_PATIENT_PATHS.en),
    [HREFLANG_BY_LOCALE.de]: localizedUrl('de', INTERNATIONAL_PATIENT_PATHS.de),
    'x-default': localizedUrl('en', INTERNATIONAL_PATIENT_PATHS.en),
  };
}

export function buildInternationalPatientMetadata(locale: InternationalLandingLocale): Metadata {
  const content = INTERNATIONAL_PATIENT_CONTENT[locale];
  const metadata = buildLocalizedMetadata({
    locale,
    path: content.path,
    title: `${content.title} | Crown Dental`,
    description: content.description,
    keywords:
      locale === 'sk'
        ? ['zubné ošetrenie Maďarsko', 'zubár Maďarsko', 'zubár Ostrihom', 'zubná klinika pri Štúrove']
        : locale === 'en'
          ? ['dental treatment Hungary', 'dentist Hungary for UK patients', 'dental clinic Hungary', 'dentist Esztergom']
          : ['Zahnbehandlung Ungarn', 'Zahnarzt Ungarn', 'Zahnklinik Ungarn', 'Zahnarzt Esztergom'],
  });

  return {
    ...metadata,
    alternates: {
      canonical: localizedUrl(locale, content.path),
      languages: internationalPatientAlternates(),
    },
  };
}
