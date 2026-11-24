export const itopPractitioner = 'berber-waller-oxana';
export const itopFees = { itop: 25000, 'itop-kontroll': 15000 } as const;
export type ItopVisit = keyof typeof itopFees;
export function isItopVisit(value: unknown): value is ItopVisit {
  return value === 'itop' || value === 'itop-kontroll';
}
export const itopVisits = {
  itop: {
    hu: "iTOP – első alkalom szájápolási csomaggal (60 perc)",
    sk: "iTOP – prvá návšteva s balíčkom pomôcok (60 minút)",
    en: "iTOP – first visit with oral care kit (60 minutes)",
    de: "iTOP – Ersttermin mit Mundpflegeset (60 Minuten)",
  },
  'itop-kontroll': {
    hu: "iTOP Control – kontroll (30 perc)",
    sk: "iTOP Control – kontrola (30 minút)",
    en: "iTOP Control – follow-up (30 minutes)",
    de: "iTOP Control – Kontrolle (30 Minuten)",
  },
} as const;
export const itopCopy = {
  hu: {
    title: 'iTOP szájápolási tanácsadás Esztergomban',
    description: "Egyéni iTOP-oktatás Esztergomban fogpótlással, fogszabályzóval vagy implantátummal élőknek. 60 perc és 7 darabos csomag 25 000 Ft, 30 perces kontroll 15 000 Ft.",
    lead: "Esztergomban a Crown Dentalnál egy teljes órán át csak Önnel foglalkozik Berber-Waller Oxána iTOP-képzett dentálhigiénikus. Fogpótlás vagy implantátum átadása után, illetve fogszabályozás alatt és a készülék levétele után is begyakorolhatja, hogyan tisztítsa a nehezen elérhető helyeket.",
    profile: "iTOP-képzett dentálhigiénikus. Egyéni szájápolást tanít fogpótlást, fogszabályzót és implantátumot viselő pácienseknek, valamint a fogszabályozás befejezése után.",
    practice: 'Mi történik az első alkalmon?',
    steps: ['Megbeszélik, hogyan mos fogat, és melyik terület okoz nehézséget. Ha szeretné, hozza el a saját fogkeféjét és fogköztisztítóit.', 'Oxána segít kiválasztani a megfelelő méretű fogköztisztító kefét, és megmutatja, hogyan vezesse be kíméletesen.', 'Ön is kipróbálja a technikát. A végére tudni fogja, melyik eszközt hol és milyen mozdulattal használja.'],
    braces: 'Fogmosás fogszabályzóval', bracesText: "Rögzített készüléknél a drót alatti részt és a bracketek oldalát gyakorolhatja. A készülék levétele után a fogak mögé ragasztott retenciós drót körüli tisztítást is megmutatjuk.",
    first: "Az ár a teljes órát és a hazavihető, 7 darabos Curaprox szájápolási csomagot is tartalmazza. A csomagban 1 Ultra Soft fogkefe és összesen 6 Prime fogköztisztító kefe van, két méretből 3–3 darab. Oxánával közösen gyakorolhatja az eszközök használatát.", control: "Hozza el az otthon használt keféket. Oxánával megnézik, melyik terület okoz még nehézséget, ellenőrzik a fogköztisztító méretét, és újra begyakorolják a mozdulatot.",
    restoration: "Szájápolás fogpótlás és implantátum után",
    restorationText: "Koronánál az ínyszél, hídnál a hídtag alatti rész, implantátumra készült pótlásnál az ínnyel érintkező felszín igényel külön figyelmet. Oxána a saját pótlásán mutatja meg, hol és hogyan fér hozzá. Friss implantáció után a gyakorlás időpontját a kezelőorvos gyógyulásra vonatkozó útmutatásához igazítják.",
    crowns: "Koronák és hidak",
    implants: "Fogászati implantátumok",
    bookFirst: 'Időpontot kérek az első alkalomra', bookControl: "iTOP Control időpontot kérek", ortho: 'Fogszabályozás Esztergomban', meet: 'Berber-Waller Oxána bemutatkozása', bookingNote: 'Az időpontot Berber-Waller Oxánához kéri. A recepciónk egyezteti Önnel a helyszínt és az időpontot.',
  },
  sk: {
    title: 'iTOP – individuálna inštruktáž ústnej hygieny v Ostrihome',
    description: "Individuálna inštruktáž iTOP v Ostrihome pri strojčeku, zubnej náhrade či implantáte. Prvá návšteva s balíčkom na doma 25 000 HUF, kontrola 15 000 HUF.",
    lead: "V Crown Dental v Ostrihome sa vám dentálna hygienička Oxána Berber-Waller, vyškolená v metóde iTOP, venuje celú hodinu individuálne. Nacvičíte si čistenie ťažko dostupných miest pri zubnej náhrade, implantáte alebo strojčeku aj po ukončení ortodontickej liečby.",
    profile: "Dentálna hygienička vyškolená v metóde iTOP. Učí pacientov starostlivosti o chrup pri zubnej náhrade, implantáte alebo strojčeku aj po jeho zložení.",
    practice: 'Ako prebieha prvá návšteva?', steps: ['Porozprávate sa o svojich návykoch a o miestach, ktoré sa ťažko čistia. Môžete si priniesť vlastné kefky.', 'Oxána vám pomôže vybrať veľkosť medzizubnej kefky a ukáže šetrný spôsob zavádzania.', 'Techniku si vyskúšate a dohodnete sa, ktorú pomôcku použijete doma na jednotlivých miestach.'],
    braces: 'Ako si čistiť zuby so strojčekom', bracesText: "Pri fixnom strojčeku si nacvičíte čistenie pod drôtikom a okolo zámkov. Po zložení strojčeka vám ukážeme, ako čistiť okolie retenčného drôtika na vnútornej strane zubov.",
    first: "V cene je celá hodina individuálneho nácviku aj 7-dielny balíček Curaprox na doma. Obsahuje 1 zubnú kefku Ultra Soft a 6 medzizubných kefiek Prime v dvoch veľkostiach, po 3 kusy z každej. S Oxánou si vyskúšate, ako pomôcky používať.", control: "Prineste si kefky, ktoré používate doma. S Oxánou prejdete miesta, kde čistenie stále robí ťažkosti, skontrolujete veľkosti kefiek a precvičíte si techniku.",
    restoration: "Starostlivosť o zubné náhrady a implantáty",
    restorationText: "Pri korunke si precvičíte čistenie okraja ďasna, pri mostíku priestor pod medzičlenom a pri implantáte okolie náhrady. Po implantácii sa termín nácviku prispôsobí hojeniu podľa pokynov ošetrujúceho lekára.",
    crowns: "Korunky a mostíky",
    implants: "Zubné implantáty",
    bookFirst: 'Objednať sa na prvú návštevu', bookControl: "Objednať sa na iTOP Control", ortho: 'Ortodoncia v Ostrihome', meet: 'Spoznajte Oxánu Berber-Waller', bookingNote: 'O termín žiadate u Oxány Berber-Waller. Recepcia s vami potvrdí čas a miesto.',
  },
  en: {
    title: 'iTOP oral hygiene coaching in Esztergom',
    description: "One-to-one iTOP coaching in Esztergom for people with braces, restorations or implants. First visit with a 7-piece kit HUF 25,000. Follow-up HUF 15,000.",
    lead: "At Crown Dental in Esztergom, iTOP-trained dental hygienist Oxána Berber-Waller spends a full hour with you, one to one. Practise reaching the spaces around your bridge, implant restoration or braces, including behind a fixed retainer once your braces come off.",
    profile: "An iTOP-trained dental hygienist who teaches individual oral care for people with dental restorations, implants and braces, including after orthodontic treatment.",
    practice: 'What happens at the first visit?', steps: ['Talk through your routine and point out the places you find difficult to reach. You are welcome to bring your own brushes.', 'Oxána helps you find an interdental brush that fits and shows you how to guide it gently into place.', 'Practise the movements yourself and agree on which brush to use in each area at home.'],
    braces: 'Brushing with braces', bracesText: "With fixed braces, practise cleaning under the wire and around each bracket. Once the braces are removed, learn how to reach the spaces around a bonded retainer behind your teeth.",
    first: "The fee includes a full hour of individual coaching and a 7-piece Curaprox kit to take home. You receive 1 Ultra Soft toothbrush and 6 Prime interdental brushes in two sizes, 3 of each. Practise using them with Oxána during your visit.", control: "Bring the brushes you use at home. With Oxána, review any spots you still find difficult, check the brush sizes and practise the movements again.",
    restoration: "Caring for restorations and implants",
    restorationText: "Practise cleaning along the edge of a crown, underneath a bridge or where an implant restoration meets the gum. After recent implant surgery, your dentist’s healing instructions guide when to start hands-on practice.",
    crowns: "Crowns and bridges",
    implants: "Dental implants",
    bookFirst: 'Request a first visit', bookControl: "Book iTOP Control", ortho: 'Orthodontics in Esztergom', meet: 'Meet Oxána Berber-Waller', bookingNote: 'Your request is for Oxána Berber-Waller. Reception will confirm the appointment time and clinic with you.',
  },
  de: {
    title: 'iTOP-Mundhygieneschulung in Esztergom',
    description: "Persönliche iTOP-Schulung in Esztergom bei Zahnspange, Zahnersatz oder Implantaten. Ersttermin mit 7-teiligem Pflegeset 25.000 HUF, Kontrolle 15.000 HUF.",
    lead: "Bei Crown Dental in Esztergom nimmt sich die iTOP-geschulte Dentalhygienikerin Oxána Berber-Waller eine ganze Stunde nur für Sie. Sie üben die Pflege rund um Zahnersatz, Implantate und Zahnspangen sowie nach Abschluss Ihrer kieferorthopädischen Behandlung.",
    profile: "iTOP-geschulte Dentalhygienikerin. Sie vermittelt individuelle Mundpflege bei Zahnersatz, Implantaten und Zahnspangen sowie nach der kieferorthopädischen Behandlung.",
    practice: 'Was passiert beim Ersttermin?', steps: ['Sie besprechen Ihre Putzgewohnheiten und zeigen, welche Stellen schwer erreichbar sind. Bringen Sie gerne Ihre eigenen Bürsten mit.', 'Oxána hilft Ihnen, die passende Interdentalbürste auszuwählen, und zeigt, wie Sie sie sanft einführen.', 'Sie üben die Bewegungen selbst und besprechen, welche Bürste Sie zu Hause an welcher Stelle verwenden können.'],
    braces: 'Zähneputzen mit Zahnspange', bracesText: "Bei fester Zahnspange üben Sie die Reinigung unter dem Draht und rund um die Brackets. Nach dem Entfernen der Spange zeigen wir Ihnen, wie Sie die Bereiche um einen festsitzenden Retainer erreichen.",
    first: "Im Preis enthalten sind eine Stunde Einzelschulung und ein 7-teiliges Curaprox-Pflegeset für zu Hause. Es enthält 1 Ultra Soft Zahnbürste und 6 Prime Interdentalbürsten, je 3 Stück in zwei Größen. Die Anwendung üben Sie gemeinsam mit Oxána.", control: "Bringen Sie Ihre Bürsten von zu Hause mit. Gemeinsam mit Oxána prüfen Sie die Bürstengrößen und üben gezielt die Bewegungen, die Ihnen noch schwerfallen.",
    restoration: "Mundpflege bei Zahnersatz und Implantaten",
    restorationText: "Sie üben die Reinigung am Kronenrand, unter einem Brückenglied oder am Zahnfleischrand Ihres implantatgetragenen Zahnersatzes. Nach einer Implantation richtet sich der Beginn der Übungen nach den Anweisungen Ihrer behandelnden Praxis zur Wundheilung.",
    crowns: "Kronen und Brücken",
    implants: "Zahnimplantate",
    bookFirst: 'Ersttermin anfragen', bookControl: "iTOP Control anfragen", ortho: 'Kieferorthopädie in Esztergom', meet: 'Oxána Berber-Waller kennenlernen', bookingNote: 'Sie fragen einen Termin bei Oxána Berber-Waller an. Unsere Rezeption stimmt Zeit und Standort mit Ihnen ab.',
  },
} as const;
