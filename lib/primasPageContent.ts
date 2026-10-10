import type { SupportedLocale } from '@/lib/seo';

type ContentCard = { title: string; description: string };
export type PrimasTreatmentSlug = 'allapotfelmeres' | 'gyokerkezeles' | 'fogfeherites' | 'koronak-hidak' | 'fogsor' | 'implantatum' | 'szajsebeszet' | 'gyerekfogaszat' | 'fogszabalyozas';
type PrimasPageContent = {
  heroTitle: string; heroAccent: string; heroDescription: string;
  introEyebrow: string; introTitle: string; introDescription: string;
  benefits: [ContentCard, ContentCard, ContentCard];
  smileEyebrow: string; smileTitle: string; smileDescription: string;
  treatmentsEyebrow: string; treatmentsTitle: string; treatmentsDescription: string;
  treatmentDescriptions: Record<PrimasTreatmentSlug, string>;
  labEyebrow: string; labTitle: string; labDescription: string; labFeatures: [string, string, string];
  stepsTitle: string; steps: [ContentCard, ContentCard, ContentCard];
  faqTitle: string; faqs: { question: string; answer: string }[];
  contactTitle: string; contactDescription: string;
  directionsLabel: string; treatmentLink: string; labLink: string; priceListLabel: string;
};

export const primasPageContent = {
  hu: {
    heroTitle: 'Fogászat Esztergomban,', heroAccent: 'a Prímás-szigeten.',
    heroDescription: 'Személyre szabott fogászati ellátás a Helischer József út 6. alatt. Esztétikai kezelések, fogmegtartás és fogpótlások, hétvégi és ünnepnapi rendelési idővel.',
    introEyebrow: 'Crown Dental Prímás Sziget', introTitle: 'A mosolyára figyelünk. Az érkezést is megkönnyítjük.',
    introDescription: 'Akár rendszeres ellenőrzésre érkezik, akár új mosolyt tervez, az első lépés az állapotfelmérés. Megbeszéljük az elképzeléseit, a kezelési lehetőségeket és a költségeket, hogy átgondolt döntést hozhasson.',
    benefits: [
      { title: 'Ingyenes saját parkoló', description: 'Autóval érkező pácienseink a rendelő saját parkolóját díjmentesen használhatják.' },
      { title: 'Akadálymentes érkezés', description: 'Rendelőnk bejárata és mosdója is akadálymentes.' },
      { title: 'Hétvégén is számíthat ránk', description: 'Szombaton, vasárnap és ünnepnapokon is 8:00–20:00 között várjuk. Az időpontot előre egyeztetjük.' },
    ],
    smileEyebrow: 'Esztétikai fogászat', smileTitle: 'Mosoly, amely illik Önhöz.',
    smileDescription: 'Direkt kompozit és indirekt porcelán héjakkal is foglalkozunk. A megfelelő megoldást fogai állapota, az elérni kívánt forma és árnyalat alapján, személyes konzultáción választjuk ki.',
    treatmentsEyebrow: 'Kezeléseink', treatmentsTitle: 'Az ellenőrzéstől az új mosolyig.',
    treatmentsDescription: 'Fogtömés, gyökérkezelés, professzionális tisztítás, fogfehérítés, héjak és fogpótlások: a kezelési tervet az Ön fogaihoz és igényeihez igazítjuk.',
    treatmentDescriptions: {
      allapotfelmeres: 'Személyes vizsgálat, az igények megbeszélése és kezelési terv. A szükséges röntgen- vagy CT-vizsgálatot Belváros rendelőnkbe egyeztetjük.',
      gyokerkezeles: 'A fog megtartását célzó kezelés. A szükséges lépéseket és alkalmakat a fog állapotának felmérése után beszéljük meg.',
      fogfeherites: 'A fogak árnyalatának világosítására szolgáló esztétikai kezelés. A lehetőségeket és a várható változást személyes vizsgálat alapján egyeztetjük.',
      'koronak-hidak': 'Egyénileg tervezett fogpótlások saját fogtechnikai laborhátterünkkel. A megoldást, az anyagot és a fogszínt konzultáción egyeztetjük.',
      fogsor: 'Kivehető fogpótlások több vagy valamennyi fog hiánya esetére. A kialakítást és az illeszkedést egyéni vizsgálat és próbák alapján tervezzük.',
      implantatum: 'Implantátumra épülő megoldások hiányzó fogak pótlására. Az alkalmasságot és a kezelés menetét az egyéni állapot alapján tervezzük meg.',
      szajsebeszet: 'Fogeltávolítás és egyéb szájsebészeti ellátás. A beavatkozás szükségességét, menetét és az utókezelést személyes konzultáción beszéljük át.',
      gyerekfogaszat: 'Fogászati vizsgálat és kezelés gyermekeknek. A fogak állapotát és az otthoni szájápolás teendőit a szülőkkel is átbeszéljük.',
      fogszabalyozas: 'Személyre szabott tervezés a fogak és a harapás rendezéséhez. A szükséges képalkotó vizsgálatokat Belváros rendelőnkben szervezzük meg.',
    },
    labEyebrow: 'Saját fogtechnikai háttér', labTitle: 'A részletek teszik személyessé.',
    labDescription: 'A Crown Dental saját fogtechnikai laborja támogatja a fogpótlások elkészítését. A fogorvosi és fogtechnikai munka összehangolása a tervezéstől a próbákig kíséri a kezelést.',
    labFeatures: ['Egyénileg tervezett koronák és hidak', 'Fogszín és forma egyeztetése', 'Fogorvos és fogtechnikus együttműködése'],
    stepsTitle: 'Így indul a kezelés.', steps: [
      { title: 'Kérjen időpontot', description: 'Telefonáljon, vagy küldje el az online űrlapot. Munkatársunk visszahívja, és egyezteti a rendelőt, valamint az időpontot.' },
      { title: 'Ismerjük meg az igényeit', description: 'A személyes konzultáción megvizsgáljuk fogait, átbeszéljük panaszait és elképzeléseit.' },
      { title: 'Tervezzen velünk', description: 'Megbeszéljük a javasolt kezeléseket, azok menetét és költségét. Ha képalkotó vizsgálat szükséges, annak helyszínét is egyeztetjük.' },
    ],
    faqTitle: 'Hasznos tudnivalók az érkezéshez.', faqs: [
      { question: 'Hol található a Prímás Sziget rendelő?', answer: 'Címünk: 2500 Esztergom, Helischer József út 6., a Prímás-szigeten. Az útvonaltervezés gombbal megnyithatja a térképet.' },
      { question: 'Lehet ingyen parkolni, és akadálymentes a rendelő?', answer: 'Igen, saját parkolónk használata ingyenes. A rendelő bejárata és mosdója is akadálymentes.' },
      { question: 'Mikor van nyitva a rendelő?', answer: 'Hétfőtől péntekig 8:00–18:00, szombaton, vasárnap és ünnepnapokon 8:00–20:00 között. A látogatás időpontját kérjük, egyeztesse munkatársunkkal.' },
      { question: 'Hol készülnek a röntgen- és CT-felvételek?', answer: 'A szükséges fogászati röntgen- és CT-felvételeket Belváros rendelőnkben, a 2500 Esztergom, Petőfi Sándor utca 11. alatt készítjük. A vizsgálatot és az érkezést telefonon egyeztetjük.' },
      { question: 'Hogyan kérhetek időpontot?', answer: 'Telefonon vagy az online űrlapon. Az űrlap elküldése időpontkérés; a pontos rendelőt és időpontot munkatársunk visszahíváskor erősíti meg. Sürgős panasz esetén kérjük, telefonáljon.' },
    ],
    contactTitle: 'Találkozzunk a Prímás-szigeten.', contactDescription: 'Mondja el, miben segíthetünk. Az első konzultáció időpontját telefonon vagy visszahíváskor egyeztetjük.',
    directionsLabel: 'Útvonaltervezés', treatmentLink: 'A kezelés részletei', labLink: 'Ismerje meg a laborunkat', priceListLabel: 'Teljes árlista',
  },
  en: {
    heroTitle: 'Dentist in Esztergom,', heroAccent: 'on Prímás Island.',
    heroDescription: 'Personalised dental care at Helischer József út 6. Cosmetic, restorative and prosthetic treatments, with opening hours on weekends and Hungarian public holidays.',
    introEyebrow: 'Crown Dental Prímás Sziget', introTitle: 'Care for your smile. An easier arrival.',
    introDescription: 'Whether you are visiting for a check-up or considering a new smile, we start with an examination. We discuss your wishes, treatment options and costs so you can make an informed choice.',
    benefits: [
      { title: 'Free on-site parking', description: 'Patients arriving by car can use the clinic’s own car park free of charge.' },
      { title: 'Accessible facilities', description: 'Our clinic has an accessible entrance and toilet.' },
      { title: 'Weekend appointments', description: 'We are open 08:00–20:00 on Saturdays, Sundays and Hungarian public holidays. Please arrange your visit in advance.' },
    ],
    smileEyebrow: 'Cosmetic dentistry', smileTitle: 'A smile that suits you.',
    smileDescription: 'We offer direct composite and indirect porcelain veneers. At your consultation, we discuss the condition of your teeth and your preferred shape and shade to find a suitable option.',
    treatmentsEyebrow: 'Our treatments', treatmentsTitle: 'From a check-up to a new smile.',
    treatmentsDescription: 'Fillings, root canal treatment, professional cleaning, whitening, veneers and dental restorations: your treatment plan is tailored to your teeth and needs.',
    treatmentDescriptions: {
      allapotfelmeres: 'An examination, a discussion of your needs and a treatment plan. Any required X-rays or CT scans are arranged at our Belváros clinic.',
      gyokerkezeles: 'Treatment aimed at retaining your tooth. We discuss the necessary steps and appointments after assessing its condition.',
      fogfeherites: 'Cosmetic treatment to lighten the shade of your teeth. We discuss suitable options and the expected change after an examination.',
      'koronak-hidak': 'Individually planned restorations supported by our own dental laboratory. We discuss the design, material and tooth shade at your consultation.',
      fogsor: 'Removable restorations for several or all missing teeth. The design and fit are planned through an individual examination and fitting appointments.',
      implantatum: 'Implant-supported options for replacing missing teeth. We assess suitability and plan the treatment according to your individual condition.',
      szajsebeszet: 'Tooth extraction and other oral surgery care. We explain the need for treatment, the procedure and aftercare at your consultation.',
      gyerekfogaszat: 'Dental examinations and treatment for children. We also discuss the condition of their teeth and home oral care with parents.',
      fogszabalyozas: 'Individual planning to improve tooth alignment and the bite. Required imaging is arranged at our Belváros clinic.',
    },
    labEyebrow: 'Our own dental laboratory', labTitle: 'Personal care is in the details.',
    labDescription: 'Crown Dental’s own dental laboratory supports the creation of your restorations. Dentists and dental technicians coordinate their work from planning through to fitting appointments.',
    labFeatures: ['Individually planned crowns and bridges', 'A considered choice of shade and shape', 'Dentist and dental technician collaboration'],
    stepsTitle: 'Your first steps.', steps: [
      { title: 'Request an appointment', description: 'Call us or send the online form. Our team will call back to confirm the clinic and appointment time.' },
      { title: 'Tell us what you need', description: 'At your consultation, we examine your teeth and discuss your concerns and wishes.' },
      { title: 'Plan your treatment', description: 'We explain the proposed care, the steps involved and the cost. If imaging is needed, we also arrange where it will take place.' },
    ],
    faqTitle: 'Before your visit.', faqs: [
      { question: 'Where is the Prímás Sziget clinic?', answer: 'Our address is 2500 Esztergom, Helischer József út 6, on Prímás Island. Use the directions button to open the map.' },
      { question: 'Is parking free, and is the clinic accessible?', answer: 'Yes. Our own on-site car park is free to use. The clinic has an accessible entrance and toilet.' },
      { question: 'What are the opening hours?', answer: 'Monday–Friday 08:00–18:00; Saturday, Sunday and Hungarian public holidays 08:00–20:00. Please arrange your visit with our team.' },
      { question: 'Where are X-rays and CT scans taken?', answer: 'Required dental X-rays and CT scans are taken at our Belváros clinic, 2500 Esztergom, Petőfi Sándor utca 11. We arrange the examination and visit by phone.' },
      { question: 'How do I book an appointment?', answer: 'Call us or send the online form. The form is an appointment request; our team confirms the clinic and time when calling back. For urgent concerns, please call.' },
    ],
    contactTitle: 'Visit us on Prímás Island.', contactDescription: 'Tell us how we can help. We arrange your first consultation by phone or when calling you back.',
    directionsLabel: 'Get directions', treatmentLink: 'Explore the treatment', labLink: 'Explore our laboratory', priceListLabel: 'Full price list',
  },
  sk: {
    heroTitle: 'Zubár v Ostrihome,', heroAccent: 'na Prímás-sziget.',
    heroDescription: 'Individuálna stomatologická starostlivosť na adrese Helischer József út 6. Estetické ošetrenia, záchovná stomatológia a zubné náhrady aj s víkendovými a sviatočnými ordinačnými hodinami.',
    introEyebrow: 'Crown Dental Prímás Sziget', introTitle: 'Myslíme na váš úsmev aj pohodlný príchod.',
    introDescription: 'Či prichádzate na kontrolu, alebo plánujete nový úsmev, začíname vyšetrením. Preberieme vaše predstavy, možnosti ošetrenia a náklady, aby ste sa mohli informovane rozhodnúť.',
    benefits: [
      { title: 'Bezplatné vlastné parkovisko', description: 'Pacienti prichádzajúci autom môžu bezplatne využiť vlastné parkovisko ambulancie.' },
      { title: 'Bezbariérový prístup', description: 'Vchod do ambulancie aj toaleta sú bezbariérové.' },
      { title: 'Ordinujeme aj cez víkend', description: 'V sobotu, nedeľu a počas maďarských sviatkov sme otvorení od 8:00 do 20:00. Termín návštevy si dohodnite vopred.' },
    ],
    smileEyebrow: 'Estetická stomatológia', smileTitle: 'Úsmev, ktorý vám pristane.',
    smileDescription: 'Ponúkame priame kompozitné aj nepriame porcelánové fazety. Vhodné riešenie vyberieme pri konzultácii podľa stavu vašich zubov, požadovaného tvaru a odtieňa.',
    treatmentsEyebrow: 'Naše ošetrenia', treatmentsTitle: 'Od kontroly po nový úsmev.',
    treatmentsDescription: 'Výplne, ošetrenie koreňových kanálikov, dentálna hygiena, bielenie, fazety a zubné náhrady: liečebný plán prispôsobíme vašim zubom a potrebám.',
    treatmentDescriptions: {
      allapotfelmeres: 'Osobné vyšetrenie, rozhovor o vašich potrebách a liečebný plán. Potrebné RTG alebo CT vyšetrenie dohodneme v ambulancii Belváros.',
      gyokerkezeles: 'Ošetrenie zamerané na zachovanie zuba. Potrebné kroky a počet návštev preberieme po posúdení jeho stavu.',
      fogfeherites: 'Estetické ošetrenie na zosvetlenie odtieňa zubov. Vhodné možnosti a očakávanú zmenu preberieme po osobnom vyšetrení.',
      'koronak-hidak': 'Individuálne plánované zubné náhrady s podporou nášho vlastného laboratória. Riešenie, materiál a odtieň dohodneme pri konzultácii.',
      fogsor: 'Snímateľné náhrady pri chýbaní viacerých alebo všetkých zubov. Vyhotovenie a dosadnutie plánujeme na základe vyšetrenia a skúšok.',
      implantatum: 'Možnosti náhrady chýbajúcich zubov pomocou implantátov. Vhodnosť a priebeh liečby posúdime podľa vášho individuálneho stavu.',
      szajsebeszet: 'Extrakcie zubov a ďalšia stomatochirurgická starostlivosť. Potrebu zákroku, jeho priebeh a následnú starostlivosť vysvetlíme pri konzultácii.',
      gyerekfogaszat: 'Zubné vyšetrenia a ošetrenia pre deti. Stav zubov a domácu ústnu hygienu preberieme aj s rodičmi.',
      fogszabalyozas: 'Individuálne plánovanie úpravy postavenia zubov a zhryzu. Potrebné zobrazovacie vyšetrenia zabezpečíme v ambulancii Belváros.',
    },
    labEyebrow: 'Vlastné zubnotechnické zázemie', labTitle: 'Na detailoch záleží.',
    labDescription: 'Vlastné zubnotechnické laboratórium Crown Dental podporuje výrobu zubných náhrad. Zubný lekár a zubný technik spolupracujú od plánovania až po skúšky náhrady.',
    labFeatures: ['Individuálne plánované korunky a mostíky', 'Spoločný výber odtieňa a tvaru', 'Spolupráca zubného lekára a technika'],
    stepsTitle: 'Ako začať.', steps: [
      { title: 'Požiadajte o termín', description: 'Zavolajte nám alebo odošlite online formulár. Zavoláme vám späť a potvrdíme ambulanciu aj čas návštevy.' },
      { title: 'Povedzte nám svoje predstavy', description: 'Pri osobnej konzultácii vyšetríme vaše zuby a preberieme ťažkosti aj želania.' },
      { title: 'Naplánujme ošetrenie', description: 'Vysvetlíme navrhované ošetrenia, ich priebeh a cenu. Ak je potrebné zobrazovacie vyšetrenie, dohodneme aj jeho miesto.' },
    ],
    faqTitle: 'Pred návštevou ambulancie.', faqs: [
      { question: 'Kde sa nachádza ambulancia Prímás Sziget?', answer: 'Naša adresa je 2500 Esztergom (Ostrihom), Helischer József út 6, na Prímás-sziget. Mapu otvoríte tlačidlom navigácie.' },
      { question: 'Je parkovanie bezplatné a ambulancia bezbariérová?', answer: 'Áno. Naše vlastné parkovisko môžete používať bezplatne. Vchod do ambulancie aj toaleta sú bezbariérové.' },
      { question: 'Aké sú ordinačné hodiny?', answer: 'Pondelok–piatok 8:00–18:00; sobota, nedeľa a maďarské sviatky 8:00–20:00. Termín návštevy si dohodnite s naším tímom.' },
      { question: 'Kde sa zhotovujú RTG a CT snímky?', answer: 'Potrebné zubné RTG a CT snímky zhotovujeme v ambulancii Belváros na adrese 2500 Esztergom, Petőfi Sándor utca 11. Vyšetrenie a príchod dohodneme telefonicky.' },
      { question: 'Ako sa môžem objednať?', answer: 'Telefonicky alebo online formulárom. Formulár je žiadosť o termín; presnú ambulanciu a čas potvrdíme pri spätnom telefonáte. Pri akútnych ťažkostiach nám zavolajte.' },
    ],
    contactTitle: 'Stretnime sa na Prímás-sziget.', contactDescription: 'Povedzte nám, s čím vám môžeme pomôcť. Prvú konzultáciu dohodneme telefonicky alebo pri spätnom volaní.',
    directionsLabel: 'Navigácia', treatmentLink: 'Podrobnosti o ošetrení', labLink: 'Spoznajte naše laboratórium', priceListLabel: 'Kompletný cenník',
  },
  de: {
    heroTitle: 'Zahnarzt in Esztergom,', heroAccent: 'auf der Prímás-Insel.',
    heroDescription: 'Individuelle Zahnmedizin in der Helischer József út 6. Ästhetische Behandlungen, Zahnerhaltung und Zahnersatz, mit Öffnungszeiten am Wochenende und an ungarischen Feiertagen.',
    introEyebrow: 'Crown Dental Prímás Sziget', introTitle: 'Ihr Lächeln im Mittelpunkt. Die Anreise gut geplant.',
    introDescription: 'Ob Kontrolluntersuchung oder der Wunsch nach einem neuen Lächeln: Am Anfang steht eine Untersuchung. Wir besprechen Ihre Vorstellungen, Behandlungsmöglichkeiten und Kosten, damit Sie eine fundierte Entscheidung treffen können.',
    benefits: [
      { title: 'Kostenloser eigener Parkplatz', description: 'Unsere Patienten können den praxiseigenen Parkplatz kostenlos nutzen.' },
      { title: 'Barrierefreier Zugang', description: 'Unsere Praxis verfügt über einen barrierefreien Eingang und ein barrierefreies WC.' },
      { title: 'Auch am Wochenende für Sie da', description: 'Samstags, sonntags und an ungarischen Feiertagen öffnen wir von 08:00 bis 20:00 Uhr. Bitte stimmen Sie Ihren Besuch vorab mit uns ab.' },
    ],
    smileEyebrow: 'Ästhetische Zahnmedizin', smileTitle: 'Ein Lächeln, das zu Ihnen passt.',
    smileDescription: 'Wir bieten direkte Komposit- und indirekte Keramik-Veneers an. Bei der persönlichen Beratung wählen wir anhand Ihres Zahnbefunds sowie der gewünschten Form und Farbe eine geeignete Lösung.',
    treatmentsEyebrow: 'Unsere Behandlungen', treatmentsTitle: 'Von der Kontrolle zum neuen Lächeln.',
    treatmentsDescription: 'Füllungen, Wurzelkanalbehandlungen, professionelle Zahnreinigung, Bleaching, Veneers und Zahnersatz: Wir stimmen den Behandlungsplan auf Ihre Zähne und Bedürfnisse ab.',
    treatmentDescriptions: {
      allapotfelmeres: 'Persönliche Untersuchung, Besprechung Ihrer Wünsche und Behandlungsplanung. Erforderliche Röntgen- oder CT-Aufnahmen vereinbaren wir in unserer Praxis Belváros.',
      gyokerkezeles: 'Eine Behandlung mit dem Ziel, den Zahn zu erhalten. Die notwendigen Schritte und Termine besprechen wir nach der Untersuchung.',
      fogfeherites: 'Ästhetische Behandlung zur Aufhellung Ihrer Zähne. Geeignete Möglichkeiten und die zu erwartende Veränderung besprechen wir nach einer Untersuchung.',
      'koronak-hidak': 'Individuell geplanter Zahnersatz mit Unterstützung unseres eigenen Dentallabors. Ausführung, Material und Zahnfarbe stimmen wir bei der Beratung ab.',
      fogsor: 'Herausnehmbarer Zahnersatz bei mehreren oder vollständig fehlenden Zähnen. Gestaltung und Sitz planen wir anhand der Untersuchung und der Einproben.',
      implantatum: 'Implantatgetragene Möglichkeiten zum Ersatz fehlender Zähne. Eignung und Behandlungsablauf planen wir anhand Ihres individuellen Befunds.',
      szajsebeszet: 'Zahnentfernungen und weitere oralchirurgische Behandlungen. Notwendigkeit, Ablauf und Nachsorge erläutern wir bei der persönlichen Beratung.',
      gyerekfogaszat: 'Zahnärztliche Untersuchungen und Behandlungen für Kinder. Den Zustand der Zähne und die häusliche Mundpflege besprechen wir auch mit den Eltern.',
      fogszabalyozas: 'Individuelle Planung zur Korrektur von Zahnstellung und Biss. Erforderliche Aufnahmen organisieren wir in unserer Praxis Belváros.',
    },
    labEyebrow: 'Unser eigenes Dentallabor', labTitle: 'Persönlich bis ins Detail.',
    labDescription: 'Das eigene Dentallabor von Crown Dental unterstützt die Herstellung Ihres Zahnersatzes. Zahnarzt und Zahntechniker stimmen ihre Arbeit von der Planung bis zu den Einproben aufeinander ab.',
    labFeatures: ['Individuell geplante Kronen und Brücken', 'Abstimmung von Zahnfarbe und Form', 'Zusammenarbeit von Zahnarzt und Zahntechniker'],
    stepsTitle: 'So beginnt Ihre Behandlung.', steps: [
      { title: 'Termin anfragen', description: 'Rufen Sie uns an oder senden Sie das Onlineformular. Beim Rückruf bestätigt unser Team die Praxis und den Termin.' },
      { title: 'Ihre Wünsche besprechen', description: 'Bei der persönlichen Beratung untersuchen wir Ihre Zähne und besprechen Ihre Beschwerden und Vorstellungen.' },
      { title: 'Behandlung gemeinsam planen', description: 'Wir erläutern die vorgeschlagene Behandlung, ihren Ablauf und die Kosten. Falls Aufnahmen erforderlich sind, stimmen wir auch den Untersuchungsort ab.' },
    ],
    faqTitle: 'Wissenswertes vor Ihrem Besuch.', faqs: [
      { question: 'Wo befindet sich die Praxis Prímás Sziget?', answer: 'Unsere Adresse lautet: 2500 Esztergom, Helischer József út 6, auf der Prímás-Insel. Über die Routenplanung öffnen Sie die Karte.' },
      { question: 'Ist das Parken kostenlos und die Praxis barrierefrei?', answer: 'Ja. Unser eigener Parkplatz steht Ihnen kostenlos zur Verfügung. Der Praxiseingang und das WC sind barrierefrei.' },
      { question: 'Wann ist die Praxis geöffnet?', answer: 'Montag bis Freitag 08:00–18:00 Uhr; samstags, sonntags und an ungarischen Feiertagen 08:00–20:00 Uhr. Bitte vereinbaren Sie Ihren Besuch mit unserem Team.' },
      { question: 'Wo werden Röntgen- und CT-Aufnahmen erstellt?', answer: 'Erforderliche zahnärztliche Röntgen- und CT-Aufnahmen erstellen wir in unserer Praxis Belváros, 2500 Esztergom, Petőfi Sándor utca 11. Untersuchung und Anreise stimmen wir telefonisch ab.' },
      { question: 'Wie kann ich einen Termin vereinbaren?', answer: 'Telefonisch oder über das Onlineformular. Das Formular ist eine Terminanfrage; Praxis und Uhrzeit bestätigen wir beim Rückruf. Bei akuten Beschwerden rufen Sie uns bitte an.' },
    ],
    contactTitle: 'Besuchen Sie uns auf der Prímás-Insel.', contactDescription: 'Erzählen Sie uns, wie wir Ihnen helfen können. Ihre erste Beratung vereinbaren wir telefonisch oder bei unserem Rückruf.',
    directionsLabel: 'Route planen', treatmentLink: 'Mehr zur Behandlung', labLink: 'Unser Labor kennenlernen', priceListLabel: 'Vollständige Preisliste',
  },
} satisfies Record<SupportedLocale, PrimasPageContent>;
