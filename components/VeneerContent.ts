export type VeneerSlug = 'direkt-hej' | 'indirekt-hej';
export type VeneerFaq = { question: string; answer: string };

export const veneerContent = {
  'direkt-hej': {
    title: 'Direkt héj Esztergomban – kompozit héj árak | Crown Dental',
    description: 'Direkt kompozit héj Esztergomban: árak, a kezelés menete és időpontkérés. Ismerje meg a direkt és a saját laborban készülő porcelán héj közötti különbséget.',
    h1: 'Direkt héj Esztergomban',
    eyebrow: 'Kompozit héj · Crown Dental',
    lead: 'Szeretne változtatni mosolya színén vagy formáján? A direkt kompozit héj a fog felszínén készül, a választott árnyalat és fogforma összehangolásával. Induljon személyes konzultációval.',
    introTitle: 'Mit jelent a direkt kompozit héj?',
    intro: 'A „direkt” az elkészítés módját jelöli: a fogorvos a kompozit anyagot közvetlenül a fogon formázza. Az árnyalatot és a kontúrt a környező fogakhoz, valamint az Ön elképzeléséhez igazítja. A porcelán héj ezzel szemben külön, fogtechnikai laborban készül.',
    considerationsTitle: 'Milyen szempontokat érdemes átgondolni?',
    considerations: [
      { title: 'A kívánt változás', body: 'Hozza el a kérdéseit: egy fog formája zavarja, vagy a mosoly egészén szeretne változtatni? A szükséges fogszámot az egyéni terv határozza meg.' },
      { title: 'Fenntartás', body: 'A kompozit általában könnyebben javítható, ugyanakkor a kopásra és elszíneződésre érzékenyebb lehet, mint a porcelán. A későbbi polírozással és ellenőrzéssel is számolni kell.' },
      { title: 'A teljes költség', body: 'Az itt feltüntetett ár egy fog héjkezelésére vonatkozik. A fogszámot és az esetleges előkezelések díját a személyes kezelési tervben egyeztetjük.' },
    ],
    steps: [
      { title: 'Konzultáció és tervezés', body: 'Megbeszéljük az elképzelését, a fogszínt, a formát és a kezelésbe bevonható fogakat.' },
      { title: 'Kialakítás a rendelőben', body: 'A megfelelő előkészítés után a fogorvos felépíti a kompozit réteget, majd fénnyel megszilárdítja.' },
      { title: 'Finomítás és ellenőrzés', body: 'A felszín polírozása és a harapás ellenőrzése után megbeszéljük a következő kontrollt.' },
    ],
    faqs: [
      { question: 'Mennyibe kerül a direkt héj?', answer: 'Az aktuális, fogankénti árat és az akció pontos kezelési időszakát az árblokkban találja. Több fog esetén a héjak díja a fogszámmal arányos; a teljes kezelési költség az állapotfelmérés után határozható meg.' },
      { question: 'A direkt héj ugyanaz, mint a porcelán héj?', answer: 'Nem. A Crown Dentalnál a direkt változat kompozitból, a rendelőben készül; az indirekt változat porcelán, amelyet saját fogtechnikai laborunk készít el.' },
      { question: 'Mikor kérhetek időpontot?', answer: 'Az időpontkérő űrlap bármikor elküldhető. A direkt héj november–decemberi akciójára a rendelkezésre álló időpontok száma korlátozott; a kért időpontot visszaigazoljuk.' },
      { question: 'Hány fogra kell héj a szép mosolyhoz?', answer: 'Nincs mindenkire érvényes fogszám. A konzultáción azt egyeztetjük, mely fogakon indokolt változtatni, és milyen eredményt szeretne elérni.' },
      { question: 'Kérhetek Hollywood smile konzultációt direkt héjhoz?', answer: 'Igen. A hollywoodi mosoly megtervezésénél a kívánt megjelenésből indulunk ki, majd átbeszéljük, hogy az Ön esetében melyik kezelési lehetőség megfelelő.' },
    ],
    otherTitle: 'Inkább porcelán héjat keres?',
    otherDescription: 'Ismerje meg a saját laborban készülő indirekt kerámia héjat és annak külön árait.',
    otherSlug: 'indirekt-hej' as const,
  },
  'indirekt-hej': {
    title: 'Porcelán héj Esztergom – 99.000 Ft/fog | Crown Dental',
    description: 'Indirekt porcelán héj saját fogtechnikai laborból, Esztergomban. Most 99.000 Ft/fog 120.000 Ft helyett. Prémium kerámia, személyes konzultáció és időpontkérés.',
    h1: 'Indirekt porcelán héj saját laborból',
    eyebrow: 'Prémium kerámia · Esztergom',
    lead: 'Egyénre tervezett porcelán héj a Crown Dental saját fogtechnikai laborjából. A fogorvosi tervezés és a labor munkája együtt alakítja ki az Ön elképzeléséhez illő színt és formát. Már most kérhető időpont.',
    introTitle: 'Mi az indirekt, vagyis porcelán héj?',
    intro: 'A porcelán héj a fog látható felszínére készülő vékony kerámia borítás. Az „indirekt” azt jelenti, hogy a héjat a fogtechnikai labor készíti el, és a fogorvos ezután rögzíti. A Crown Dentalnál ez a munka saját laborunkban történik, prémium kerámiából.',
    considerationsTitle: 'Saját labor, személyes mosolyterv',
    considerations: [
      { title: 'Egyeztetett árnyalat és forma', body: 'A kívánt mosoly megtervezésénél az Ön elképzelése az egyik kiindulópont. A konzultáción a visszafogott és a világosabb megjelenésről is beszélhetünk.' },
      { title: 'Laborban készülő héj', body: 'A fogtechnikai munka a saját laborunkban zajlik. A kész héj illeszkedését és megjelenését a rögzítés előtt ellenőrizzük.' },
      { title: 'Foganként átlátható ár', body: 'A feltüntetett porcelán héj ár egy fogra vonatkozik. Az érintett fogak számát, az előkészítést és az esetleges további kezeléseket személyesen egyeztetjük.' },
    ],
    steps: [
      { title: 'Személyes mosolytervezés', body: 'A konzultáción átbeszéljük a célokat, a választott árnyalatot és a kezelés feltételeit.' },
      { title: 'Előkészítés és labor', body: 'A szükséges előkészítés és mintavétel után saját fogtechnikai laborunk elkészíti az egyéni porcelán héjakat.' },
      { title: 'Próba és rögzítés', body: 'A fogorvos ellenőrzi az illeszkedést és a formát, majd rögzíti a héjakat. A kezelést kontroll és személyes ápolási tanácsok egészítik ki.' },
    ],
    faqs: [
      { question: 'Mennyi a porcelán héj ára a Crown Dentalnál?', answer: 'A porcelán héj jelenlegi ára 99.000 Ft/fog, 120.000 Ft helyett. Ez egy fogra vonatkozó héjár; az esetleg szükséges további kezelések költsége az egyéni kezelési terv része.' },
      { question: 'Már most lehet időpontot kérni porcelán héjra?', answer: 'Igen, a porcelán héjra már most kérhető konzultációs időpont a jelenlegi kedvezményes áron. Az űrlap elküldése után egyeztetjük és visszaigazoljuk az időpontot.' },
      { question: 'Hol készül az indirekt héj?', answer: 'A Crown Dental saját fogtechnikai laborjában, a fogorvossal egyeztetett terv alapján. A rendelő Esztergomban, a Petőfi Sándor utca 11. alatt található.' },
      { question: 'Kell csiszolni a fogat a porcelán héjhoz?', answer: 'A szükséges előkészítés foganként eltérhet. A konzultáción tisztázzuk, mennyi foganyag megőrizhető, és milyen beavatkozás indokolt; csiszolásmentességet vizsgálat nélkül nem ígérünk.' },
      { question: 'A porcelán héjjal készül a Hollywood smile?', answer: 'A hollywoodi mosoly tervezésében a porcelán héj is szerepet kaphat. A kifejezés a kívánt megjelenést írja le; az anyagot és a fogszámot a személyes kezelési terv határozza meg.' },
    ],
    otherTitle: 'A direkt héjjal is összehasonlítaná?',
    otherDescription: 'Nézze meg a rendelőben kialakított kompozit héj menetét, árát és időpontkérési feltételeit.',
    otherSlug: 'direkt-hej' as const,
  },
};

export const hollywoodFaqs: VeneerFaq[] = [
  { question: 'Mit jelent a Hollywood smile, azaz hollywoodi mosoly?', answer: 'A kifejezést a harmonikus, megtervezett mosolyra használjuk. Nem egyetlen anyag vagy kötelező kezelési csomag neve: a fogszín, a fogforma és az egyéni adottságok alapján választjuk meg a megoldást.' },
  { question: 'Mennyibe kerül a hollywoodi mosoly?', answer: 'A teljes ár a kezelés típusától és az érintett fogak számától függ. Az alábbi összehasonlításban a direkt és porcelán héj fogankénti ára látható. Személyre szabott összeget az állapotfelmérés után tudunk adni.' },
  { question: 'Kötelező minden látható fogra héjat tenni?', answer: 'Nem kezelési csomagból indulunk ki. A konzultáció célja annak tisztázása, hogy Ön milyen változást szeretne, és ehhez milyen kezelés indokolt.' },
  { question: 'Hogyan kérhetek időpontot?', answer: 'Válassza ki a direkt vagy a porcelán héjat, és küldje el a hozzá tartozó időpontkérő űrlapot. Ha még nem döntött, kérjen általános konzultációt. Kollégánk egyezteti a részleteket.' },
];
