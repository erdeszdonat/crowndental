import type { SupportedLocale } from './seo';

export const hygieneSlugs = ['air-polishing', 'premium-biofilm-terapia'] as const;
export type HygieneSlug = typeof hygieneSlugs[number];
export const hygienePrices = { fogko: 15000, 'air-polishing': 20000, 'premium-biofilm-terapia': 25000 } as const;
export const hygieneGuides = {
  'air-polishing': 'air-polishing-kavefolt-fogko-vagy-elszinezodes',
  'premium-biofilm-terapia': 'biofilmfestes-mit-mutat-meg-a-lepedekfestes',
} as const;

type Service = { name: string; title: string; lead: string; alt: string; steps: string[]; question: string; answer: string };
type Copy = { base: string; unit: string; both: string; prices: string; process: string; imageLabel: string; air: Service; bio: Service };
const content: Record<SupportedLocale, Copy> = {
  hu: {
    base: 'Ultrahangos fogkőeltávolítás', unit: 'állcsont', both: 'Mindkét állcsont kezelése', prices: 'Dentálhigiéniai árak Esztergomban', process: 'Hogyan zajlik a kezelés?', imageLabel: 'Illusztráció',
    air: {
      name: 'Fogkőeltávolítás és porpolírozás (Airflow)', title: 'Airflow / air polishing és fogkőeltávolítás Esztergomban',
      lead: 'Érdes fogfelszínt érez a nyelvével, vagy zavarják a kávé után maradt foltok? Ebben a kezelésben az ultrahangos fogkőeltávolítást finom porral, vízzel és levegővel végzett tisztítás egészíti ki.',
      alt: 'Az air polishing fúvókája a felső fogak külső felszínének közelében.',
      steps: ['Megnézzük, hol található kemény fogkő, puha lepedék vagy felületi elszíneződés. Egyeztetjük, melyik állcsontot kezeljük.', 'Ultrahangos eszközzel eltávolítjuk a kemény fogkövet. Az air polishing során a víz, a levegő és a finom por a puha lerakódásokat és a felületi foltokat célozza.', 'A végén megmutatjuk a megtisztított területeket, és megbeszéljük, mire érdemes figyelni az otthoni fogápolásnál.'],
      question: 'Világosabbak lesznek a fogaim?', answer: 'A felszíni elszíneződések eltávolítása után jobban láthatóvá válhat a fog eredeti árnyalata. A mélyebben fekvő elszíneződések és a saját fogszín megváltoztatása külön fogfehérítési kérdés.',
    },
    bio: {
      name: 'Prémium biofilm-terápia', title: 'Prémium biofilm-terápia és lepedékfestés Esztergomban',
      lead: 'Hol marad lepedék akkor is, ha alaposan fogat mos? A biofilmfestés láthatóvá teszi a fogfelszínen megtapadt lepedéket. A megfestett területek irányt adnak a tisztításhoz és az otthoni fogápoláshoz.',
      alt: 'Lepedékfestést szemléltető fogmodell, az ínyszél mellett megjelölt területekkel.',
      steps: ['A fogfelszínre lepedékjelző festéket viszünk fel. Tükörben is megmutathatjuk, hol maradt biofilm, például az ínyszélnél vagy két fog találkozásánál.', 'Air polishing segítségével célzottan megtisztítjuk a megfestett fogfelszíneket. Ahol kemény fogkövet találunk, szükség szerint eltávolítjuk.', 'A látottak alapján megbeszéljük, mely területeket érdemes más szögből megmosni, és hogyan férhet hozzájuk fogköztisztításkor.'],
      question: 'Mit ad hozzá a festés a tisztításhoz?', answer: 'A puha lepedék színe hasonlíthat a fogéhoz. A festés kirajzolja az elhelyezkedését, így Ön is láthatja azokat a területeket, amelyekre otthon érdemes több figyelmet fordítania.',
    },
  },
  en: {
    base: 'Ultrasonic scaling', unit: 'arch', both: 'Both arches', prices: 'Dental hygiene fees in Esztergom', process: 'What happens during the visit?', imageLabel: 'Illustration',
    air: { name: 'Scaling and air polishing', title: 'Scaling and air polishing in Esztergom', lead: 'Rough deposits and coffee stains can look similar in the mirror. This visit combines ultrasonic removal of hardened tartar with a fine spray of water, air and powder for soft deposits and surface stains.', alt: 'An air-polishing nozzle positioned near the outer surface of upper teeth.', steps: ['We check the teeth for hard deposits and external stains and agree which arch to treat.', 'We remove tartar with an ultrasonic instrument. Air polishing targets soft plaque and staining on the tooth surface.', 'We show you the cleaned areas and discuss how to reach them when brushing at home.'], question: 'Will this change my tooth colour?', answer: 'Removing surface stains may reveal more of your natural shade. Changing the underlying tooth colour requires a separate whitening assessment.' },
    bio: { name: 'Premium biofilm therapy', title: 'Premium biofilm therapy and plaque disclosure in Esztergom', lead: 'Plaque can be difficult to see even after brushing. A disclosing dye shows where it remains and guides the clinician and patient during this hygiene visit.', alt: 'A dental model showing small patches of disclosing dye close to the gum margin.', steps: ['We apply a plaque-disclosing agent and show you the marked areas in a mirror.', 'We use air polishing to clean the marked surfaces and remove hardened tartar where needed.', 'We discuss brushing and interdental cleaning for the areas highlighted during your visit.'], question: 'What does the dye show?', answer: 'The dye highlights soft plaque that blends into the colour of enamel. Seeing its location makes it easier to discuss a particular tooth surface or gap during home-care advice.' },
  },
  de: {
    base: 'Zahnsteinentfernung mit Ultraschall', unit: 'Kiefer', both: 'Beide Kiefer', prices: 'Preise für Dentalhygiene in Esztergom', process: 'Wie läuft die Behandlung ab?', imageLabel: 'Illustration',
    air: { name: 'Zahnsteinentfernung mit Air-Polishing', title: 'Zahnsteinentfernung mit Air-Polishing in Esztergom', lead: 'Raue Stellen und dunkle Kaffeeränder haben unterschiedliche Ursachen. Bei dieser Behandlung kombinieren wir Ultraschall zur Zahnsteinentfernung mit einem Pulver-Wasser-Strahl für weiche Beläge und oberflächliche Verfärbungen.', alt: 'Air-Polishing-Düse nahe der Außenfläche der oberen Zähne.', steps: ['Wir untersuchen harte Ablagerungen und Verfärbungen und besprechen, welcher Kiefer behandelt wird.', 'Mit Ultraschall lösen wir Zahnstein. Der Pulver-Wasser-Strahl reinigt die Zahnoberflächen von weichen Belägen und äußeren Verfärbungen.', 'Anschließend zeigen wir Ihnen die gereinigten Stellen und besprechen die Pflege zu Hause.'], question: 'Werden meine Zähne heller?', answer: 'Nach der Entfernung äußerer Verfärbungen kann die natürliche Zahnfarbe wieder deutlicher sichtbar werden. Für eine Veränderung des Grundfarbtons beraten wir Sie gesondert zum Bleaching.' },
    bio: { name: 'Premium-Biofilmtherapie', title: 'Premium-Biofilmtherapie mit Plaqueanfärbung in Esztergom', lead: 'Wo bleibt nach dem Zähneputzen Plaque zurück? Durch Anfärben machen wir weiche Beläge sichtbar. So können wir gezielt reinigen und Ihnen die betreffenden Stellen zeigen.', alt: 'Zahnmodell mit angefärbten Stellen am Zahnfleischrand.', steps: ['Wir färben den Zahnbelag an und zeigen Ihnen im Spiegel, wo er haftet.', 'Mit Air-Polishing reinigen wir die markierten Flächen. Vorhandenen Zahnstein entfernen wir bei Bedarf.', 'Anhand der angefärbten Bereiche besprechen wir geeignete Putztechnik und Zwischenraumpflege.'], question: 'Was zeigt die Anfärbung?', answer: 'Plaque ist auf hellem Zahnschmelz oft schwer zu erkennen. Die Farbe macht ihre Verteilung sichtbar, etwa am Zahnfleischrand oder zwischen benachbarten Zähnen.' },
  },
  sk: {
    base: 'Ultrazvukové odstránenie zubného kameňa', unit: 'jeden zubný oblúk', both: 'Oba zubné oblúky', prices: 'Ceny dentálnej hygieny v Ostrihome', process: 'Ako prebieha ošetrenie?', imageLabel: 'Ilustrácia',
    air: { name: 'Odstránenie zubného kameňa a pieskovanie', title: 'Odstránenie zubného kameňa a pieskovanie v Ostrihome', lead: 'Drsné usadeniny a škvrny od kávy si vyžadujú odlišný prístup. Ultrazvukom odstránime tvrdý zubný kameň a pomocou vody, vzduchu a jemného prášku očistíme povrch zubov od mäkkého povlaku a pigmentácií.', alt: 'Koncovka na pieskovanie pri vonkajšom povrchu horných zubov.', steps: ['Skontrolujeme usadeniny a povrchové zafarbenie a dohodneme sa, ktorý zubný oblúk ošetríme.', 'Zubný kameň odstránime ultrazvukom. Pieskovaním, známym aj ako air polishing, očistíme povrch zubov.', 'Ukážeme vám ošetrené miesta a preberieme, ako ich čistiť doma.'], question: 'Zmení pieskovanie farbu zubov?', answer: 'Po odstránení povrchových škvŕn môže viac vyniknúť prirodzený odtieň zubov. Zmenu samotného odtieňa riešime pri samostatnej konzultácii o bielení.' },
    bio: { name: 'Prémiová terapia biofilmu', title: 'Prémiová terapia biofilmu s farbením povlaku v Ostrihome', lead: 'Aj po čistení zubov môže na ťažko dostupných miestach zostať povlak. Farbenie biofilmu ho zviditeľní a ukáže, ktorým plochám sa pri ošetrení aj doma oplatí venovať pozornosť.', alt: 'Dentálny model s farebne označeným povlakom pri okraji ďasna.', steps: ['Nanesieme farbivo na zobrazenie povlaku a v zrkadle vám ukážeme označené miesta.', 'Zafarbené plochy očistíme pieskovaním. Ak nájdeme tvrdý zubný kameň, podľa potreby ho odstránime.', 'Ukážeme vám vhodný spôsob čistenia pri ďasnách a v medzizubných priestoroch podľa nálezu.'], question: 'Čo ukáže farbenie povlaku?', answer: 'Mäkký povlak môže splývať s odtieňom skloviny. Po zafarbení lepšie vidno jeho polohu, napríklad pri okraji ďasna alebo medzi susednými zubami.' },
  },
};

export function hygieneCopy(locale: SupportedLocale, slug: HygieneSlug) {
  const copy = content[locale];
  return { copy, service: slug === 'air-polishing' ? copy.air : copy.bio };
}

export function hygieneFee(locale: SupportedLocale, amount: number) {
  const value = new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : locale, { useGrouping: true }).format(amount);
  return value + (locale === 'hu' ? ' Ft' : ' HUF');
}
