export const itopPractitioner = 'berber-waller-oxana';
export const itopFees = { itop: 20000, 'itop-kontroll': 10000 } as const;
export type ItopVisit = keyof typeof itopFees;
export function isItopVisit(value: unknown): value is ItopVisit {
  return value === 'itop' || value === 'itop-kontroll';
}
export const itopVisits = {
  itop: { hu: 'iTOP – első alkalom', sk: 'iTOP – prvá návšteva', en: 'iTOP – first visit', de: 'iTOP – Ersttermin' },
  'itop-kontroll': { hu: 'iTOP kontroll', sk: 'iTOP kontrola', en: 'iTOP follow-up', de: 'iTOP-Kontrolle' },
} as const;
export const itopCopy = {
  hu: {
    title: 'iTOP szájápolási tanácsadás Esztergomban',
    description: 'Személyes fogmosási és fogköztisztítási oktatás Berber-Waller Oxánával a Crown Dentalnál. Fogszabályzóval is foglalható. Első alkalom 20 000 Ft, kontroll 10 000 Ft.',
    lead: 'A tükör előtt, a saját fogain gyakorolhatja, hogyan érje el az ínyszélt, a fogközöket és a fogszabályzó körüli zugokat. Berber-Waller Oxána iTOP-képzett dentálhigiénikus megmutatja a mozdulatot, majd közösen kipróbálják, mi működik Önnek otthon.',
    profile: 'iTOP-képzett dentálhigiénikus. Személyre szabott fogmosást és fogköztisztítást tanít, fogszabályzót viselő pácienseknek is.',
    practice: 'Mi történik az első alkalmon?',
    steps: ['Megbeszélik, hogyan mos fogat, és melyik terület okoz nehézséget. Ha szeretné, hozza el a saját fogkeféjét és fogköztisztítóit.', 'Oxána segít kiválasztani a megfelelő méretű fogköztisztító kefét, és megmutatja, hogyan vezesse be kíméletesen.', 'Ön is kipróbálja a technikát. A végére tudni fogja, melyik eszközt hol és milyen mozdulattal használja.'],
    braces: 'Fogmosás fogszabályzóval', bracesText: 'Ha a drót alatt gyakran ott marad az étel, vagy a hátsó bracketekhez nehéz odaférni, az alkalmon éppen ezeken a területeken gyakorolhat. Kivehető sín mellett a fogközök és az ínyszél tisztítása kerülhet előtérbe.',
    first: 'Akkor válassza, ha most tanulná meg a saját fogaihoz és készülékéhez illő technikát.', control: 'Ha már járt iTOP-oktatáson, hozza el az otthon használt eszközöket. Átbeszélik a tapasztalatait, és azokon a mozdulatokon finomítanak, amelyek még nehézséget okoznak.',
    bookFirst: 'Időpontot kérek az első alkalomra', bookControl: 'iTOP kontrollra jelentkezem', ortho: 'Fogszabályozás Esztergomban', meet: 'Berber-Waller Oxána bemutatkozása', bookingNote: 'Az időpontot Berber-Waller Oxánához kéri. A recepciónk egyezteti Önnel a helyszínt és az időpontot.',
  },
  sk: {
    title: 'iTOP – individuálna inštruktáž ústnej hygieny v Ostrihome',
    description: 'Čistenie zubov a medzizubných priestorov si prakticky nacvičíte s hygieničkou Oxánou Berber-Waller v Crown Dental. Prvá návšteva 20 000 HUF, kontrola 10 000 HUF.',
    lead: 'Pred zrkadlom si na vlastných zuboch vyskúšate, ako vyčistiť okraj ďasien, medzizubné priestory aj okolie strojčeka. Dentálna hygienička Oxána Berber-Waller, vyškolená v metóde iTOP, vám ukáže techniku a spolu ju prispôsobíte domácemu použitiu.',
    profile: 'Dentálna hygienička vyškolená v metóde iTOP. Učí individuálnu techniku čistenia zubov a medzizubných priestorov aj pacientov so strojčekom.',
    practice: 'Ako prebieha prvá návšteva?', steps: ['Porozprávate sa o svojich návykoch a o miestach, ktoré sa ťažko čistia. Môžete si priniesť vlastné kefky.', 'Oxána vám pomôže vybrať veľkosť medzizubnej kefky a ukáže šetrný spôsob zavádzania.', 'Techniku si vyskúšate a dohodnete sa, ktorú pomôcku použijete doma na jednotlivých miestach.'],
    braces: 'Ako si čistiť zuby so strojčekom', bracesText: 'Ak pod drôtikom zostáva jedlo alebo ťažko dosiahnete na zadné zámky, precvičíte si práve tieto miesta. Pri priehľadných dlahách sa môžete sústrediť na medzizubné priestory a okraj ďasien.',
    first: 'Pre tých, ktorí si chcú osvojiť techniku vhodnú pre svoje zuby a strojček.', control: 'Po prvej inštruktáži si prineste svoje kefky. Prejdete si skúsenosti z domu a zopakujete náročnejšie pohyby.',
    bookFirst: 'Objednať sa na prvú návštevu', bookControl: 'Objednať sa na kontrolu iTOP', ortho: 'Ortodoncia v Ostrihome', meet: 'Spoznajte Oxánu Berber-Waller', bookingNote: 'O termín žiadate u Oxány Berber-Waller. Recepcia s vami potvrdí čas a miesto.',
  },
  en: {
    title: 'iTOP oral hygiene coaching in Esztergom',
    description: 'Practise brushing and interdental cleaning with iTOP-trained hygienist Oxána Berber-Waller at Crown Dental, including care around braces. First visit HUF 20,000, follow-up HUF 10,000.',
    lead: 'Practise on your own teeth in front of a mirror. Oxána Berber-Waller, our iTOP-trained dental hygienist, shows you how to reach the gumline, clean between your teeth and work around braces. You try each movement together before using it at home.',
    profile: 'An iTOP-trained dental hygienist who teaches brushing and interdental cleaning tailored to each patient, including people wearing braces.',
    practice: 'What happens at the first visit?', steps: ['Talk through your routine and point out the places you find difficult to reach. You are welcome to bring your own brushes.', 'Oxána helps you find an interdental brush that fits and shows you how to guide it gently into place.', 'Practise the movements yourself and agree on which brush to use in each area at home.'],
    braces: 'Brushing with braces', bracesText: 'If food catches under your wire or the back brackets are hard to reach, practise on those areas during your visit. If you wear aligners, you can focus on the spaces between your teeth and along the gumline.',
    first: 'Choose this visit to learn a routine that suits your teeth and appliance.', control: 'Already attended iTOP coaching? Bring the brushes you use at home, discuss what has worked and practise the areas you still find difficult.',
    bookFirst: 'Request a first visit', bookControl: 'Request an iTOP follow-up', ortho: 'Orthodontics in Esztergom', meet: 'Meet Oxána Berber-Waller', bookingNote: 'Your request is for Oxána Berber-Waller. Reception will confirm the appointment time and clinic with you.',
  },
  de: {
    title: 'iTOP-Mundhygieneschulung in Esztergom',
    description: 'Zähneputzen und Zahnzwischenraumpflege mit der iTOP-geschulten Dentalhygienikerin Oxána Berber-Waller bei Crown Dental. Ersttermin 20.000 HUF, Kontrolle 10.000 HUF.',
    lead: 'Üben Sie vor dem Spiegel an Ihren eigenen Zähnen. Unsere iTOP-geschulte Dentalhygienikerin Oxána Berber-Waller zeigt Ihnen, wie Sie den Zahnfleischrand, Zahnzwischenräume und Bereiche rund um Ihre Zahnspange erreichen.',
    profile: 'iTOP-geschulte Dentalhygienikerin. Sie vermittelt individuelle Techniken für das Zähneputzen und die Zahnzwischenraumpflege, auch bei Patienten mit Zahnspange.',
    practice: 'Was passiert beim Ersttermin?', steps: ['Sie besprechen Ihre Putzgewohnheiten und zeigen, welche Stellen schwer erreichbar sind. Bringen Sie gerne Ihre eigenen Bürsten mit.', 'Oxána hilft Ihnen, die passende Interdentalbürste auszuwählen, und zeigt, wie Sie sie sanft einführen.', 'Sie üben die Bewegungen selbst und besprechen, welche Bürste Sie zu Hause an welcher Stelle verwenden können.'],
    braces: 'Zähneputzen mit Zahnspange', bracesText: 'Bleiben Speisereste unter dem Draht hängen oder erreichen Sie die hinteren Brackets schlecht? Genau diese Stellen können Sie üben. Bei herausnehmbaren Schienen stehen die Zahnzwischenräume und der Zahnfleischrand im Mittelpunkt.',
    first: 'Für alle, die eine zu ihren Zähnen und ihrer Zahnspange passende Technik erlernen möchten.', control: 'Waren Sie bereits bei einer iTOP-Schulung? Bringen Sie Ihre Bürsten mit und üben Sie gezielt die Bewegungen, die zu Hause noch schwerfallen.',
    bookFirst: 'Ersttermin anfragen', bookControl: 'iTOP-Kontrolle anfragen', ortho: 'Kieferorthopädie in Esztergom', meet: 'Oxána Berber-Waller kennenlernen', bookingNote: 'Sie fragen einen Termin bei Oxána Berber-Waller an. Unsere Rezeption stimmt Zeit und Standort mit Ihnen ab.',
  },
} as const;
