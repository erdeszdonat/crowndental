'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

type PortableTextBlock = {
  _type: 'block'
  _key: string
  style: 'h2' | 'normal'
  markDefs: never[]
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks: never[]
  }>
}

type Expansion = {
  slug: string
  title: string
  marker: string
  blocks: PortableTextBlock[]
}

type Supplement = {
  marker: string
  blocks: PortableTextBlock[]
}

type PostSnapshot = {
  _id: string
  title: string
  slug: string
  content?: Array<{_key?: string}>
}

function block(key: string, text: string, style: 'h2' | 'normal' = 'normal'): PortableTextBlock {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{_type: 'span', _key: `${key}span`, text, marks: []}],
  }
}

function section(prefix: string, heading: string, paragraphs: string[]): PortableTextBlock[] {
  return [
    block(`${prefix}h`, heading, 'h2'),
    ...paragraphs.map((paragraph, index) => block(`${prefix}p${index + 1}`, paragraph)),
  ]
}

const expansions: Expansion[] = [
  {
    slug: 'fogimplantatum-magyarorszagon-arak-elonyok-kulfoldi-pacienseknek',
    title: 'Fogimplantátum Magyarországon',
    marker: 'seo260818huimph',
    blocks: [
      ...section('seo260818huimp', 'Mit tartalmaz a személyre szabott implantációs terv?', [
        'Az implantáció teljes költsége nem egyetlen tételből áll. A tervezés során külön kell számolni a diagnosztikával, az implantátummal, a felépítménnyel, a végleges koronával és az esetleg szükséges csontpótlással. Emiatt két páciens árajánlata akkor is eltérhet, ha ugyanannyi fogat szeretnének pótolni. A Crown Dental a vizsgálat és a képalkotó felvételek alapján írásos kezelési tervet készít, amelyben a fő lépések, a várható időzítés és a költségelemek külön is áttekinthetők.',
        'A döntésnél érdemes azt is megkérdezni, hogy az ajánlat pontosan milyen implantátumrendszert, milyen protetikai megoldást és hány kontrollt foglal magában. Az interneten látható induló ár önmagában nem mindig hasonlítható össze egy teljes, koronával és kontrollokkal együtt számolt kezeléssel.',
      ]),
      ...section('seo260818huvisit', 'Hány alkalommal kell Magyarországra utazni?', [
        'Egyszerűbb esetben az első látogatás a vizsgálatból, a 3D CT-ből és az implantátum beültetéséből állhat. A gyógyulási idő után egy következő időszakban készül el a felépítmény és a végleges korona. Ha csontpótlás, több implantátum vagy ideiglenes fogpótlás szükséges, az ütemezés több lépésből állhat. A pontos látogatásszámot ezért nem célszerű előre, vizsgálat nélkül ígérni.',
        'Külföldről érkező páciensként küldje el előre a meglévő panorámaröntgent, CT-t, gyógyszerlistát és korábbi kezelési dokumentumokat. Ezek segítik az előzetes tájékozódást, de a végleges döntést nem helyettesítik: az implantáció alkalmasságát személyes vizsgálat és szükség esetén friss 3D felvétel alapján lehet megítélni.',
      ]),
      ...section('seo260818huheal', 'Gyógyulás, ideiglenes megoldás és kontroll', [
        'A beültetés után a lágyrészek általában gyorsabban gyógyulnak, mint amennyi idő az implantátum csontba integrálódásához szükséges. A kezelőorvos egyéni utasítása szerint fontos a kímélet, a megfelelő szájhigiéné, az előírt gyógyszerek alkalmazása és a kontrollokon való részvétel. Dohányzás, kezeletlen fogágybetegség vagy bizonyos általános betegségek növelhetik a kockázatot, ezért ezeket már a tervezéskor jelezni kell.',
        'Az ideiglenes fogpótlás lehetősége a kiindulási állapottól és a terhelhetőségtől függ. A gyors vagy azonnali megoldás nem mindenkinél biztonságos; a hosszú távú eredményt a megfelelő gyógyulási idő, a pontos protetikai munka és az otthoni tisztítás együtt határozza meg.',
      ]),
      ...section('seo260818huquestions', 'Milyen kérdéseket tegyen fel konzultáció előtt?', [
        'Kérdezzen rá a teljes kezelési időre, a szükséges látogatásokra, az ideiglenes fogpótlásra, az implantátum és a korona típusára, valamint arra, hogy mi történik, ha a gyógyulás a vártnál lassabb. Hasznos előre tisztázni a garancia feltételeit és azt is, hol történnek a későbbi kontrollok. A jó kezelési terv nemcsak árat közöl, hanem érthetően bemutatja az alternatívákat, a korlátokat és a következő lépéseket is.',
      ]),
    ],
  },
  {
    slug: 'dental-implants-hungary-costs-benefits-international-patients',
    title: 'Dental Implants in Hungary',
    marker: 'seo260818enimph',
    blocks: [
      ...section('seo260818enimp', 'What should a complete implant treatment plan include?', [
        'The final cost of implant treatment is usually made up of several elements rather than a single implant fee. Diagnostics, the implant fixture, the abutment, the definitive crown and any necessary bone augmentation may all be separate parts of the plan. Two patients replacing the same number of teeth can therefore receive different proposals. Following an examination and appropriate imaging, Crown Dental prepares a written plan that sets out the main stages, expected timing and relevant cost components.',
        'When comparing quotations, ask which implant system and restorative solution are included, whether a temporary restoration is required and how many reviews are planned. A low starting price is not directly comparable with a complete proposal that already includes the abutment, crown and follow-up appointments.',
      ]),
      ...section('seo260818envisit', 'How many visits to Hungary may be needed?', [
        'In a straightforward case, the first visit may include the clinical examination, 3D imaging and implant placement. After the healing period, a later visit is normally used for the abutment, impressions or digital scanning, and the definitive crown. Bone grafting, multiple implants or a temporary prosthesis can require a different sequence. The exact number of visits should therefore be confirmed only after individual assessment.',
        'International patients can send existing X-rays, scans, a medication list and previous treatment records before travelling. These documents can support an initial discussion, but they do not replace an in-person examination or a current 3D scan when one is clinically required.',
      ]),
      ...section('seo260818enheal', 'Healing, temporary teeth and follow-up care', [
        'Soft-tissue healing is often quicker than the time required for the implant to integrate with the bone. Patients should follow the clinician’s individual instructions regarding oral hygiene, physical activity, medication and review appointments. Smoking, active gum disease and some general health conditions may increase risk, so they should be discussed honestly during planning.',
        'Whether a temporary tooth can be fitted depends on the starting condition and the stability available at placement. Immediate loading is not the safest option in every case. Long-term success depends on appropriate healing time, accurate restorative work, daily cleaning and regular professional maintenance.',
      ]),
      ...section('seo260818enquestions', 'Questions to ask before booking treatment abroad', [
        'Ask for the anticipated timeline, number of visits, temporary-tooth options, implant and crown materials, review arrangements and what happens if healing takes longer than expected. It is also useful to clarify the warranty conditions and where future maintenance will take place. A reliable plan explains alternatives and limitations as clearly as it explains the price.',
      ]),
    ],
  },
  {
    slug: 'zahnimplantate-ungarn-kosten-vorteile-internationale-patienten',
    title: 'Zahnimplantate in Ungarn',
    marker: 'seo260818deimph',
    blocks: [
      ...section('seo260818deimp', 'Was sollte ein vollständiger Implantatplan enthalten?', [
        'Die Gesamtkosten einer Implantatbehandlung bestehen meist aus mehreren Positionen. Diagnostik, Implantatkörper, Aufbau, endgültige Krone und eine eventuell notwendige Knochenaugmentation können getrennte Bestandteile sein. Deshalb können zwei Patienten trotz gleicher Anzahl fehlender Zähne unterschiedliche Angebote erhalten. Crown Dental erstellt nach Untersuchung und geeigneter Bildgebung einen schriftlichen Plan mit Behandlungsschritten, voraussichtlichem Zeitablauf und nachvollziehbaren Kostenpositionen.',
        'Beim Vergleich von Angeboten sollte geklärt werden, welches Implantatsystem und welche prothetische Versorgung enthalten sind, ob ein Provisorium benötigt wird und wie viele Kontrollen vorgesehen sind. Ein günstiger Einstiegspreis ist nicht direkt mit einem vollständigen Angebot vergleichbar, das Aufbau, Krone und Nachsorge bereits einschließt.',
      ]),
      ...section('seo260818devisit', 'Wie viele Termine in Ungarn sind erforderlich?', [
        'In einem unkomplizierten Fall können beim ersten Aufenthalt Untersuchung, 3D-Aufnahme und Implantation erfolgen. Nach der Einheilzeit werden bei einem weiteren Aufenthalt Aufbau, Abdruck oder digitaler Scan und die endgültige Krone angefertigt. Knochenaufbau, mehrere Implantate oder ein Provisorium können einen anderen Ablauf erfordern. Die genaue Zahl der Termine lässt sich daher erst nach individueller Beurteilung festlegen.',
        'Internationale Patienten können vorhandene Röntgenbilder, Befunde, eine Medikamentenliste und frühere Behandlungsunterlagen vorab übermitteln. Das erleichtert die erste Orientierung, ersetzt aber weder die persönliche Untersuchung noch eine aktuelle 3D-Aufnahme, wenn diese medizinisch notwendig ist.',
      ]),
      ...section('seo260818deheal', 'Einheilung, Provisorium und Nachsorge', [
        'Das Weichgewebe heilt häufig schneller als das Implantat in den Knochen einheilt. Wichtig sind die individuellen Anweisungen zu Mundhygiene, körperlicher Schonung, Medikamenten und Kontrollterminen. Rauchen, eine aktive Parodontitis und bestimmte Allgemeinerkrankungen können das Risiko erhöhen und sollten bereits bei der Planung offen angesprochen werden.',
        'Ob eine provisorische Versorgung möglich ist, hängt von der Ausgangssituation und der erreichbaren Stabilität ab. Eine sofortige Belastung ist nicht in jedem Fall die sicherste Lösung. Für den langfristigen Erfolg sind ausreichende Einheilzeit, präzise Zahntechnik, tägliche Reinigung und regelmäßige professionelle Kontrollen entscheidend.',
      ]),
      ...section('seo260818dequestions', 'Welche Fragen sollten Sie vor der Reise stellen?', [
        'Klären Sie Behandlungsdauer, Zahl der Aufenthalte, Möglichkeiten für ein Provisorium, verwendete Materialien, Nachsorge und den Umgang mit einer verzögerten Heilung. Fragen Sie außerdem nach Garantiebedingungen und späteren Wartungsterminen. Ein seriöser Behandlungsplan erläutert Alternativen und Grenzen ebenso verständlich wie den Preis.',
        'Zur Planung gehört auch die Prüfung möglicher Alternativen. Je nach Zustand der Nachbarzähne, Knochenangebot und Reinigungsmöglichkeit können eine Brücke, eine herausnehmbare Versorgung oder zunächst eine Vorbehandlung sinnvoller sein. Eine Implantation ist kein automatischer Standardweg. Lassen Sie sich erklären, warum die empfohlene Lösung zu Ihrer konkreten Situation passt und welche Folgen eine andere Entscheidung hätte.',
      ]),
    ],
  },
  {
    slug: 'mennyibe-kerul-mufogsor-magyarorszagon-2026-arkalauz',
    title: 'Műfogsor árkalauz 2026',
    marker: 'seo260818hudenth',
    blocks: [
      ...section('seo260818hudent', 'Mitől függ a műfogsor teljes ára?', [
        'A fogpótlás ára függ attól, hogy teljes vagy részleges kivehető megoldásra van-e szükség, milyen alaplemez és foganyag készül, maradnak-e megtartható fogak, illetve szükséges-e foghúzás vagy ínykezelés. Az implantátumokon rögzülő fogsor más műszaki és sebészeti tervet igényel, ezért nem hasonlítható közvetlenül a hagyományos kivehető fogsor árához.',
        'Az árajánlat összehasonlításakor érdemes ellenőrizni, hogy tartalmazza-e a vizsgálatot, lenyomatot vagy digitális adatfelvételt, a próbákat, az átadást és a szükséges korrekciókat. A pontos illeszkedéshez több munkafázis kell; a végső eredményt nemcsak az anyag, hanem a tervezés és a fogtechnikai kivitelezés pontossága is meghatározza.',
      ]),
      ...section('seo260818huproc', 'Hogyan készül egy új fogsor?', [
        'Az első vizsgálat során felmérjük a nyálkahártya, az állcsontgerinc és a megmaradt fogak állapotát. Ezt követi az anatómiai, majd szükség szerint funkciós lenyomat, a harapási helyzet meghatározása és a fogpróba. A próba alkalmat ad a fogszín, a fogforma, a mosolyvonal és a beszéd ellenőrzésére, mielőtt a fogsor végleg elkészül.',
        'Friss foghúzás után az íny és a csont alakja hónapokig változhat. Ilyenkor ideiglenes megoldás, alábélelés vagy későbbi újrakészítés is szóba kerülhet. A kezelési tervnek ezt az alkalmazkodási időszakot is figyelembe kell vennie.',
      ]),
      ...section('seo260818huadapt', 'Megszokás és mindennapi ápolás', [
        'Új fogsornál kezdetben gyakoribb lehet a nyálképződés, megváltozhat a beszéd, és kisebb nyomáspontok jelentkezhetnek. Ezek miatt az első napokban puhább ételek, kisebb falatok és kétoldali rágás javasolt. A tartósan fájó területet nem érdemes otthon csiszolni; a rendelői korrekció megőrzi az illeszkedést.',
        'A fogsort naponta, nem dörzsölő tisztítószerrel kell tisztítani, miközben a nyelv, az íny és a megmaradt fogak ápolása sem maradhat el. A rendszeres kontroll akkor is fontos, ha nincs panasz, mert az állcsont és a nyálkahártya idővel változik.',
      ]),
      ...section('seo260818hudec', 'Mikor érdemes implantátummal stabilizálni?', [
        'Ha a hagyományos alsó fogsor megfelelő kialakítás mellett is könnyen elmozdul, az implantátumokon rögzülő megoldás javíthatja a stabilitást. Ehhez azonban csontkínálat, általános egészségi állapot, tisztíthatóság és költség szempontjából is külön vizsgálat szükséges. A megfelelő megoldást nem az árlista, hanem a személyes állapotfelmérés alapján lehet kiválasztani.',
        'Repedés, törés vagy meglazult műfog esetén a fogsort a javításig ne ragassza háztartási ragasztóval. A pontatlan otthoni javítás megváltoztathatja a harapást és megnehezítheti a fogtechnikai helyreállítást. Vigye magával a letört részeket, és mondja el, mikor készült a fogsor, illetve volt-e korábban alábélelve vagy javítva.',
      ]),
    ],
  },
  {
    slug: 'dentures-cost-hungary-2026-price-guide',
    title: 'Dentures Cost in Hungary 2026',
    marker: 'seo260818endenth',
    blocks: [
      ...section('seo260818endent', 'What determines the total cost of dentures?', [
        'The price depends on whether a complete or partial removable denture is required, the base and tooth materials, the condition of any remaining teeth and whether extractions or gum treatment are needed. An implant-retained denture requires a different surgical and technical plan, so its cost should not be compared directly with that of a conventional removable denture.',
        'When comparing quotations, check whether the examination, impressions or digital records, try-in appointments, delivery and necessary adjustments are included. Accurate fit requires several clinical and laboratory stages. The final result depends not only on the material but also on careful planning and precise dental-technical work.',
      ]),
      ...section('seo260818enproc', 'How is a new denture made?', [
        'The first examination assesses the oral mucosa, jaw ridge and any remaining teeth. This is followed by preliminary and, where appropriate, functional impressions, registration of the bite and a tooth try-in. The try-in allows the tooth colour, shape, smile line and speech to be checked before the denture is finished.',
        'After recent extractions, the gum and bone can continue to change for several months. A temporary denture, relining or later replacement may therefore be needed. A realistic treatment plan should include this adaptation period rather than treating the first fit as the final stage.',
      ]),
      ...section('seo260818enadapt', 'Adapting to and caring for a new denture', [
        'In the first days, salivation may increase, speech may feel different and small pressure areas may develop. Softer foods, smaller bites and chewing on both sides can make adaptation easier. A persistently painful spot should not be adjusted at home; a professional correction protects the fit of the denture.',
        'Clean the denture every day with a suitable non-abrasive product, and continue cleaning the tongue, gums and any remaining teeth. Regular reviews remain important even without symptoms because the shape of the supporting tissues changes over time.',
      ]),
      ...section('seo260818endec', 'When can implants improve stability?', [
        'If a well-designed lower denture still moves significantly, an implant-retained option may improve stability. Bone availability, general health, cleanability and the patient’s budget must all be assessed separately. The appropriate solution should be selected after examination, not from a price list alone.',
        'If a denture cracks, breaks or loses a tooth, avoid household adhesives while waiting for assessment. An inaccurate home repair can alter the bite and make professional laboratory repair more difficult. Keep any broken pieces and tell the clinic when the denture was made and whether it has previously been relined or repaired. These details help determine whether repair or replacement is the more predictable option.',
      ]),
    ],
  },
  {
    slug: 'zahnersatz-prothesen-kosten-ungarn-2026-preisratgeber',
    title: 'Zahnersatz und Prothesen in Ungarn 2026',
    marker: 'seo260818dedenth',
    blocks: [
      ...section('seo260818dedent', 'Wovon hängen die Gesamtkosten einer Zahnprothese ab?', [
        'Der Preis hängt davon ab, ob eine Voll- oder Teilprothese benötigt wird, welche Basis- und Zahnmaterialien verwendet werden, welche eigenen Zähne erhalten werden können und ob zuvor Extraktionen oder eine Zahnfleischbehandlung notwendig sind. Eine implantatgetragene Prothese erfordert einen anderen chirurgischen und zahntechnischen Plan und ist deshalb nicht direkt mit einer konventionellen herausnehmbaren Prothese vergleichbar.',
        'Prüfen Sie bei Angeboten, ob Untersuchung, Abformung oder digitale Datenerfassung, Anproben, Eingliederung und notwendige Korrekturen enthalten sind. Eine präzise Passung entsteht in mehreren klinischen und zahntechnischen Schritten. Nicht nur das Material, sondern auch Planung und Ausführung bestimmen die Qualität.',
      ]),
      ...section('seo260818deproc', 'Wie entsteht eine neue Prothese?', [
        'Bei der ersten Untersuchung werden Schleimhaut, Kieferkamm und vorhandene Zähne beurteilt. Danach folgen Vorabformung und gegebenenfalls Funktionsabformung, die Bestimmung der Bisslage sowie eine Zahnprobe. Bei der Probe können Zahnfarbe, Zahnform, Lachlinie und Sprache kontrolliert werden, bevor die Prothese fertiggestellt wird.',
        'Nach kürzlich erfolgten Zahnentfernungen verändern sich Zahnfleisch und Knochen noch über Monate. Deshalb können ein Provisorium, eine Unterfütterung oder eine spätere Neuanfertigung notwendig sein. Ein realistischer Behandlungsplan berücksichtigt diese Anpassungsphase.',
      ]),
      ...section('seo260818deadapt', 'Eingewöhnung und tägliche Pflege', [
        'In den ersten Tagen können vermehrter Speichelfluss, eine veränderte Aussprache und kleine Druckstellen auftreten. Weichere Speisen, kleinere Bissen und beidseitiges Kauen erleichtern die Eingewöhnung. Dauerhaft schmerzende Stellen sollten nicht selbst abgeschliffen, sondern in der Praxis korrigiert werden.',
        'Reinigen Sie die Prothese täglich mit einem geeigneten, nicht scheuernden Mittel und pflegen Sie weiterhin Zunge, Zahnfleisch und eigene Zähne. Regelmäßige Kontrollen bleiben auch ohne Beschwerden wichtig, weil sich das Prothesenlager im Lauf der Zeit verändert.',
      ]),
      ...section('seo260818dedec', 'Wann können Implantate die Stabilität verbessern?', [
        'Wenn sich eine fachgerecht angefertigte Unterkieferprothese weiterhin stark bewegt, kann eine implantatgetragene Lösung die Stabilität verbessern. Knochenangebot, Allgemeingesundheit, Reinigungsmöglichkeiten und Budget müssen dafür individuell geprüft werden. Die passende Versorgung wird nach Untersuchung und nicht allein anhand einer Preisliste ausgewählt.',
        'Bei einem Riss, Bruch oder gelösten Prothesenzahn sollten bis zur Untersuchung keine Haushaltskleber verwendet werden. Eine ungenaue Selbstreparatur kann den Biss verändern und die fachgerechte Laborreparatur erschweren. Bewahren Sie abgebrochene Teile auf und teilen Sie mit, wann die Prothese angefertigt und ob sie bereits unterfüttert oder repariert wurde. So lässt sich besser beurteilen, ob eine Reparatur oder Neuanfertigung sinnvoller ist.',
        'Eine frühzeitige Kontrolle kann zudem verhindern, dass scharfe Bruchkanten die Schleimhaut verletzen oder ein kleiner Schaden während des Kauens größer wird.',
      ]),
    ],
  },
  {
    slug: 'fogorvos-esztergomban-miert-valasztjak-crown-dentalt-szlovak-paciensek',
    title: 'Fogorvos Esztergomban szlovák pácienseknek',
    marker: 'seo260818huclinh',
    blocks: [
      ...section('seo260818huclin', 'Hogyan hasonlítson össze határ menti fogászatokat?', [
        'A rendelő kiválasztásakor ne csak egyetlen kezelés árát nézze. Fontos, hogy rendelkezésre áll-e megfelelő diagnosztika, írásos kezelési terv, részletes árajánlat és későbbi kontroll. Kérdezze meg azt is, hogy ki végzi az egyes kezelési szakaszokat, hogyan működik a fogtechnikai együttműködés, és milyen nyelven kap tájékoztatást.',
        'Az összehasonlítható ajánlatnak ugyanazokat a tételeket kell tartalmaznia. Egy korona vagy implantátum ára félrevezető lehet, ha nem derül ki, hogy a diagnosztika, a felépítmény, az ideiglenes megoldás vagy a kontroll külön fizetendő-e. A Crown Dental célja, hogy a vizsgálat után a teljes javasolt folyamat érthető legyen.',
      ]),
      ...section('seo260818huaccess', 'Megközelítés Szlovákiából és időponttervezés', [
        'Az esztergomi rendelő Párkány felől a Mária Valéria hídon keresztül könnyen megközelíthető. Hosszabb kezelésnél már az időpontfoglalás előtt érdemes jelezni, hogy külföldről érkezik, így a diagnosztikai és kezelési lépések lehetőség szerint összehangolhatók. A pontos időigény mindig a beavatkozástól és az egyéni állapottól függ.',
        'Ha rendelkezik röntgennel, korábbi lelettel vagy gyógyszerlistával, küldje el előre. Ez segíthet a konzultáció előkészítésében, de a végleges tervhez személyes vizsgálat szükséges. Sürgős panasz esetén külön jelezze a fájdalom kezdetét, a duzzanatot, a lázat és azt, történt-e sérülés.',
      ]),
      ...section('seo260818huprop', 'Saját fogtechnikai labor és összetett kezelések', [
        'A helyben működő labor előnye leginkább a koronák, hidak és kivehető fogpótlások próbáinál érzékelhető. A fogorvos és a fogtechnikus közvetlenül egyeztethet a színről, formáról és illeszkedésről, szükség esetén pedig gyorsabban szervezhető korrekció. Ez nem helyettesíti a gondos klinikai tervezést, hanem annak része.',
        'Összetett kezelésnél kérjen szakaszokra bontott tervet. Így előre látható, melyik látogatáskor történik diagnosztika, sebészeti beavatkozás, próba, átadás és kontroll. A jól tervezett ütemezés különösen fontos, ha minden alkalommal át kell utaznia a határon.',
      ]),
      ...section('seo260818hufollow', 'Mi történik a kezelés után?', [
        'Már a kezelés előtt tisztázza, milyen kontrollokra lesz szükség, milyen tünet esetén kell azonnal jelentkezni, és hogyan történik a hosszú távú karbantartás. Implantátumoknál, koronáknál és fogpótlásoknál a rendszeres ellenőrzés és az otthoni tisztítás a kezelés tartósságának része, nem opcionális kiegészítés.',
        'Mielőtt dönt, kérje el írásban a diagnózist, a javasolt kezelési szakaszokat és a beleegyezéshez szükséges tájékoztatást. Ellenőrizze, hogy a dokumentumokból kiderülnek-e a fontosabb kockázatok, az alternatívák és a várható kontrollok. Így a választás nem pusztán ár alapján történik, és a későbbi egyeztetés során mindkét fél ugyanarra a tervre tud hivatkozni.',
      ]),
    ],
  },
  {
    slug: 'dentist-hungary-why-international-patients-choose-esztergom',
    title: 'Dentist in Hungary and Esztergom',
    marker: 'seo260818enclinh',
    blocks: [
      ...section('seo260818enclin', 'How to compare dental clinics abroad', [
        'Do not compare clinics on the advertised price of a single procedure alone. Check whether appropriate diagnostics, a written treatment plan, an itemised quotation and follow-up care are available. Ask who will carry out each stage, how the dentist works with the dental laboratory and in which language important instructions will be provided.',
        'Comparable quotations need to include the same components. A crown or implant price can be misleading if diagnostics, the abutment, a temporary restoration or reviews are charged separately. Following examination, Crown Dental aims to make the complete proposed process and its alternatives understandable.',
      ]),
      ...section('seo260818enaccess', 'Planning travel and appointments in Esztergom', [
        'Esztergom is close to the Slovak border and can be reached from Štúrovo across the Mária Valéria Bridge. If you are travelling from abroad for a longer procedure, mention this when booking so that diagnostic and treatment stages can be coordinated where clinically appropriate. The time required still depends on the procedure and your individual condition.',
        'Send available X-rays, previous reports and a medication list before the consultation. They can help the team prepare but do not replace an in-person examination. For an urgent problem, report when the pain began, whether swelling or fever is present and whether an injury occurred.',
      ]),
      ...section('seo260818enlab', 'Why an on-site dental laboratory can matter', [
        'Direct cooperation with an on-site technician is particularly useful during try-ins for crowns, bridges and removable dentures. The dentist and technician can discuss shade, form and fit directly, and adjustments can often be organised more efficiently. The laboratory does not replace careful clinical planning; it supports it.',
        'For complex treatment, request a plan divided into stages. It should show which visit is intended for diagnostics, surgery, try-ins, delivery and reviews. A clear sequence is especially important when every appointment involves international travel.',
      ]),
      ...section('seo260818enfollow', 'Follow-up after treatment abroad', [
        'Before treatment begins, clarify the required reviews, warning signs that need urgent attention and arrangements for long-term maintenance. For implants, crowns and dentures, professional checks and effective daily cleaning are part of maintaining the result rather than optional extras.',
        'Before deciding, request the diagnosis, proposed stages and consent information in writing. Check that the documents explain the main risks, reasonable alternatives and expected reviews. This makes it easier to compare clinics on the complete plan rather than price alone, and gives both patient and provider a clear reference if questions arise after the patient has returned home.',
      ]),
    ],
  },
  {
    slug: 'zahnarzt-ungarn-warum-patienten-esztergom-waehlen',
    title: 'Zahnarzt in Ungarn und Esztergom',
    marker: 'seo260818declinh',
    blocks: [
      ...section('seo260818declin', 'Wie lassen sich Zahnkliniken im Ausland vergleichen?', [
        'Vergleichen Sie Kliniken nicht allein anhand des beworbenen Preises einer einzelnen Leistung. Entscheidend sind geeignete Diagnostik, ein schriftlicher Behandlungsplan, ein detailliertes Angebot und eine geregelte Nachsorge. Fragen Sie, wer die einzelnen Schritte durchführt, wie die Zusammenarbeit mit dem Dentallabor organisiert ist und in welcher Sprache wichtige Hinweise erklärt werden.',
        'Vergleichbare Angebote müssen dieselben Bestandteile enthalten. Ein Preis für Krone oder Implantat kann irreführend sein, wenn Diagnostik, Aufbau, Provisorium oder Kontrollen separat berechnet werden. Crown Dental legt nach der Untersuchung Wert auf einen verständlichen Gesamtplan mit möglichen Alternativen.',
      ]),
      ...section('seo260818deaccess', 'Anreise und Terminplanung in Esztergom', [
        'Esztergom liegt nahe der slowakischen Grenze und ist von Štúrovo über die Mária-Valéria-Brücke erreichbar. Teilen Sie bei der Terminvereinbarung mit, wenn Sie aus dem Ausland anreisen. Diagnostik und Behandlungsschritte können dann, soweit medizinisch sinnvoll, koordiniert werden. Der tatsächliche Zeitbedarf hängt weiterhin von Behandlung und Ausgangssituation ab.',
        'Vorhandene Röntgenbilder, frühere Befunde und eine Medikamentenliste können vorab übermittelt werden. Sie erleichtern die Vorbereitung, ersetzen jedoch keine persönliche Untersuchung. Bei akuten Beschwerden sollten Beginn der Schmerzen, Schwellung, Fieber und eine mögliche Verletzung angegeben werden.',
      ]),
      ...section('seo260818delab', 'Vorteile eines eigenen Dentallabors', [
        'Die direkte Zusammenarbeit mit einem Zahntechniker vor Ort ist besonders bei Anproben von Kronen, Brücken und herausnehmbarem Zahnersatz hilfreich. Zahnarzt und Techniker können Farbe, Form und Passung unmittelbar abstimmen und Korrekturen effizient organisieren. Das Labor ersetzt keine sorgfältige klinische Planung, sondern unterstützt sie.',
        'Lassen Sie sich bei komplexen Behandlungen einen Plan in Etappen geben. Daraus sollte hervorgehen, welcher Aufenthalt für Diagnostik, chirurgische Behandlung, Anprobe, Eingliederung und Kontrolle vorgesehen ist. Eine klare Abfolge ist besonders wichtig, wenn jeder Termin mit einer Auslandsreise verbunden ist.',
      ]),
      ...section('seo260818defollow', 'Nachsorge nach einer Behandlung im Ausland', [
        'Klären Sie vor Behandlungsbeginn die notwendigen Kontrollen, Warnzeichen für eine rasche Rückmeldung und die langfristige Pflege. Bei Implantaten, Kronen und Prothesen gehören professionelle Kontrollen und gründliche tägliche Reinigung zum Erhalt des Ergebnisses.',
        'Lassen Sie sich Diagnose, geplante Schritte und Einwilligungsinformationen schriftlich geben. Prüfen Sie, ob wichtige Risiken, sinnvolle Alternativen und erwartete Kontrollen verständlich aufgeführt sind. So vergleichen Sie nicht nur Einzelpreise, sondern den vollständigen Behandlungsplan. Außerdem haben Patient und Klinik nach der Rückreise eine gemeinsame Grundlage, falls später Fragen oder Beschwerden auftreten.',
        'Bewahren Sie Rechnungen, Röntgenaufnahmen und den Implantat- oder Materialpass auf, damit spätere Behandler die Versorgung eindeutig nachvollziehen können.',
      ]),
    ],
  },
  {
    slug: 'master-craftsmanship-story-of-crown-dental',
    title: 'The Story of Crown Dental',
    marker: 'seo260818enstoryh',
    blocks: [
      ...section('seo260818enstory', 'From dental technology to coordinated patient care', [
        'Crown Dental’s development is closely connected to dental technology. Restorative treatment succeeds when clinical diagnosis, tooth preparation, digital or conventional records, material selection and laboratory production follow the same plan. Bringing these conversations closer together helps the dentist and technician resolve practical questions before a restoration reaches the patient.',
        'An on-site laboratory is not a promise that every case will be completed immediately. Its practical value lies in direct communication, supervised try-ins and the ability to assess shade, form and fit with the clinical situation in view. Complex work still requires enough time for accurate planning, manufacturing and quality control.',
      ]),
      ...section('seo260818enquality', 'What quality control means in everyday work', [
        'Quality control starts before manufacturing. The team checks whether the treatment plan, records and requested restoration are consistent. During production, contacts, bite, margins, surface and shade are assessed at the appropriate stages. At delivery, the dentist evaluates the restoration in the mouth and makes the final clinical decision.',
        'Digital tools can improve communication and repeatability, but they do not remove the need for professional judgement. Scans, photographs and design files are most useful when they support a clearly defined clinical objective and are combined with a careful try-in.',
      ]),
      ...section('seo260818enpatients', 'Supporting patients who travel for treatment', [
        'International care requires more than translation. Patients need a realistic sequence of appointments, clear cost information, instructions they can follow after returning home and a plan for reviews. Crown Dental asks travelling patients to share available records in advance and then confirms the definitive plan after personal examination.',
        'The team avoids promising a fixed outcome or timetable before the clinical situation is known. Transparent limitations are part of professional communication, particularly when healing time, laboratory stages or additional procedures may change the schedule.',
      ]),
      ...section('seo260818enfuture', 'A practical approach to long-term development', [
        'The clinic’s direction is to combine accessible cross-border care with coordinated dentistry and dental technology. New equipment and workflows are valuable when they make diagnosis clearer, treatment more predictable or communication easier. The guiding principle remains the same: the proposed solution should match the patient’s condition, maintenance ability and realistic expectations.',
      ]),
    ],
  },
  {
    slug: 'meisterhandwerk-geschichte-von-crown-dental',
    title: 'Die Geschichte von Crown Dental',
    marker: 'seo260818destoryh',
    blocks: [
      ...section('seo260818destory', 'Von der Zahntechnik zur koordinierten Patientenversorgung', [
        'Die Entwicklung von Crown Dental ist eng mit der Zahntechnik verbunden. Restaurative Behandlungen gelingen dann, wenn klinische Diagnose, Präparation, digitale oder konventionelle Datenerfassung, Materialauswahl und Laborfertigung demselben Plan folgen. Die direkte Abstimmung hilft Zahnarzt und Zahntechniker, praktische Fragen zu klären, bevor die Versorgung beim Patienten eingesetzt wird.',
        'Ein Labor vor Ort bedeutet nicht, dass jeder Fall sofort fertiggestellt werden kann. Der praktische Vorteil liegt in direkter Kommunikation, begleiteten Anproben und der gemeinsamen Beurteilung von Farbe, Form und Passung. Komplexe Arbeiten benötigen weiterhin ausreichend Zeit für Planung, Herstellung und Qualitätskontrolle.',
      ]),
      ...section('seo260818dequality', 'Qualitätskontrolle im täglichen Ablauf', [
        'Qualitätskontrolle beginnt vor der Herstellung. Das Team prüft, ob Behandlungsplan, Unterlagen und gewünschte Versorgung zusammenpassen. Während der Fertigung werden Kontakte, Biss, Ränder, Oberfläche und Farbe in den jeweiligen Arbeitsschritten kontrolliert. Bei der Eingliederung beurteilt der Zahnarzt die Arbeit im Mund und trifft die endgültige klinische Entscheidung.',
        'Digitale Werkzeuge können Kommunikation und Wiederholbarkeit verbessern, ersetzen jedoch nicht die fachliche Beurteilung. Scans, Fotos und Konstruktionsdaten sind besonders hilfreich, wenn sie einem klar definierten klinischen Ziel dienen und mit einer sorgfältigen Anprobe verbunden werden.',
      ]),
      ...section('seo260818depatients', 'Betreuung von Patienten mit längerer Anreise', [
        'Internationale Versorgung erfordert mehr als Übersetzung. Patienten benötigen eine realistische Terminfolge, verständliche Kosteninformationen, klare Hinweise für die Zeit nach der Heimreise und einen Plan für Kontrollen. Crown Dental bittet um vorhandene Unterlagen vorab und bestätigt den endgültigen Behandlungsplan nach der persönlichen Untersuchung.',
        'Vor Kenntnis der klinischen Situation sollten weder ein festes Ergebnis noch ein unveränderlicher Zeitplan versprochen werden. Transparente Grenzen gehören zu einer professionellen Beratung, besonders wenn Einheilzeiten, Laborphasen oder zusätzliche Maßnahmen den Ablauf beeinflussen können.',
      ]),
      ...section('seo260818defuture', 'Praktische Grundsätze für die weitere Entwicklung', [
        'Die Ausrichtung der Klinik verbindet gut erreichbare grenzüberschreitende Versorgung mit abgestimmter Zahnmedizin und Zahntechnik. Neue Geräte und Abläufe sind dann sinnvoll, wenn sie Diagnostik verständlicher, Behandlung planbarer oder Kommunikation einfacher machen. Entscheidend bleibt, dass die vorgeschlagene Lösung zur Ausgangssituation, zur möglichen Pflege und zu realistischen Erwartungen des Patienten passt.',
      ]),
    ],
  },
]

const supplementsBySlug: Record<string, Supplement> = {
  'fogimplantatum-magyarorszagon-arak-elonyok-kulfoldi-pacienseknek': {
    marker: 'seo260818huimp2h',
    blocks: section('seo260818huimp2', 'Mikor nem célszerű azonnal implantálni?', [
      'Aktív gyulladás, kezeletlen fogágybetegség, elégtelen szájhigiéné vagy nem megfelelően beállított általános betegség esetén először az alapállapot rendezése lehet szükséges. Ugyanez igaz akkor is, ha a rendelkezésre álló csont mennyisége vagy minősége további beavatkozást igényel. A halasztás ilyenkor nem felesleges várakozás, hanem a kockázatok csökkentésének része. Az implantáció időpontját a klinikai vizsgálat, a képalkotó eredmények és a páciens egészségi állapota együtt határozza meg.',
      'A konzultációra készüljön a rendszeresen szedett gyógyszerek listájával, és jelezze a véralvadásgátlót, cukorbetegséget, csontritkulás elleni kezelést, dohányzást, korábbi sugárkezelést vagy ismert gyógyszerallergiát. Gyógyszert önállóan ne hagyjon el a fogászati beavatkozás miatt; az esetleges módosításról a kezelőorvosoknak kell egyeztetniük.',
    ]),
  },
  'dental-implants-hungary-costs-benefits-international-patients': {
    marker: 'seo260818enimp2h',
    blocks: section('seo260818enimp2', 'When might implant placement need to be postponed?', [
      'Active infection, untreated gum disease, inadequate oral hygiene or a poorly controlled general health condition may need to be addressed before implant placement. Additional treatment may also be required when bone volume or quality is insufficient. In these situations, postponement is part of reducing risk rather than unnecessary waiting. Timing should be based on the clinical examination, imaging findings and the patient’s overall health together.',
      'Bring a complete medication list and report anticoagulants, diabetes, osteoporosis medication, smoking, previous radiotherapy and known drug allergies. Do not stop prescribed medicine on your own because of dental treatment. Any necessary change should be agreed between the relevant treating clinicians.',
    ]),
  },
  'zahnimplantate-ungarn-kosten-vorteile-internationale-patienten': {
    marker: 'seo260818deimp2h',
    blocks: section('seo260818deimp2', 'Wann sollte eine Implantation zunächst verschoben werden?', [
      'Aktive Entzündungen, unbehandelte Parodontitis, unzureichende Mundhygiene oder eine schlecht eingestellte Allgemeinerkrankung können eine Vorbehandlung erforderlich machen. Auch bei unzureichendem Knochenangebot sind zusätzliche Schritte möglich. Eine Verschiebung dient in solchen Situationen der Risikoreduktion und ist keine unnötige Wartezeit. Der geeignete Zeitpunkt ergibt sich gemeinsam aus klinischer Untersuchung, Bildgebung und allgemeinem Gesundheitszustand.',
      'Bringen Sie eine vollständige Medikamentenliste mit und nennen Sie Blutverdünner, Diabetes, Osteoporosemedikamente, Rauchen, frühere Bestrahlungen und bekannte Arzneimittelallergien. Setzen Sie verordnete Medikamente wegen einer Zahnbehandlung nicht selbstständig ab. Notwendige Änderungen müssen zwischen den behandelnden Ärzten abgestimmt werden.',
    ]),
  },
  'mennyibe-kerul-mufogsor-magyarorszagon-2026-arkalauz': {
    marker: 'seo260818hudent2h',
    blocks: section('seo260818hudent2', 'Milyen hosszú távú költségekkel számoljon?', [
      'A fogsor teljes költségéhez idővel korrekció, alábélelés, professzionális tisztítás vagy egy sérült elem javítása is hozzátartozhat. Ezek szükségessége függ a használattól, a szövetek változásától és az otthoni ápolástól. Az olcsóbb induló megoldás nem feltétlenül kedvezőbb, ha kevés próbát, korrekciót vagy rövid utánkövetést tartalmaz. Érdemes már az ajánlatkéréskor rákérdezni a kontrollok és a későbbi javítások feltételeire.',
      'A fogsor élettartamára nem adható minden páciensre érvényes fix évszám. Ha meglazul, billeg, feltöri az ínyt, megváltozik a harapás vagy romlik a rágás, kontroll szükséges. A tartósan rosszul illeszkedő fogsor nemcsak kényelmetlen, hanem a nyálkahártyát is sértheti és egyoldalú rágáshoz vezethet.',
    ]),
  },
  'dentures-cost-hungary-2026-price-guide': {
    marker: 'seo260818endent2h',
    blocks: section('seo260818endent2', 'What longer-term costs should be considered?', [
      'Over time, the overall cost may include adjustments, relining, professional cleaning or repair of a damaged component. The need for these services depends on use, tissue changes and home care. The lowest initial price is not necessarily the best value if it includes fewer try-ins, limited adjustment or little follow-up. Ask about review appointments and future repair arrangements when requesting the original quotation.',
      'There is no single fixed lifespan that applies to every denture. Arrange a review if it becomes loose, rocks during chewing, creates sores, changes the bite or makes eating more difficult. A persistently poor fit is not only uncomfortable; it can irritate the supporting tissues and encourage one-sided chewing.',
    ]),
  },
  'zahnersatz-prothesen-kosten-ungarn-2026-preisratgeber': {
    marker: 'seo260818dedent2h',
    blocks: section('seo260818dedent2', 'Welche Folgekosten sollten berücksichtigt werden?', [
      'Im Lauf der Zeit können Korrekturen, Unterfütterungen, professionelle Reinigung oder die Reparatur eines beschädigten Elements notwendig werden. Der Bedarf hängt von Nutzung, Gewebeveränderungen und häuslicher Pflege ab. Der niedrigste Anfangspreis ist nicht automatisch wirtschaftlicher, wenn weniger Anproben, begrenzte Korrekturen oder kaum Nachsorge enthalten sind. Fragen Sie bereits beim ersten Angebot nach Kontrollterminen und Bedingungen für spätere Reparaturen.',
      'Eine feste Lebensdauer, die für jede Prothese gilt, lässt sich nicht nennen. Eine Kontrolle ist erforderlich, wenn die Prothese locker wird, beim Kauen kippt, Druckstellen verursacht, den Biss verändert oder das Essen erschwert. Eine dauerhaft schlechte Passung ist nicht nur unangenehm, sondern kann die Schleimhaut reizen und einseitiges Kauen fördern.',
    ]),
  },
  'fogorvos-esztergomban-miert-valasztjak-crown-dentalt-szlovak-paciensek': {
    marker: 'seo260818huclinic2h',
    blocks: section('seo260818huclinic2', 'Ellenőrzőlista az első esztergomi konzultációhoz', [
      'Írja össze előre a legfontosabb panaszokat, korábbi kezeléseket, rendszeresen szedett gyógyszereket és azt, hogy milyen eredményt szeretne elérni. Vigye magával a meglévő felvételeket és fogászati dokumentumokat, de számítson rá, hogy friss diagnosztika is szükséges lehet. Kérdezze meg, melyik probléma sürgős, melyik halasztható, és milyen sorrendben érdemes elvégezni a kezeléseket.',
      'A konzultáció végén legyen világos a következő időpont célja, időtartama és várható költsége. Ha több megoldás is lehetséges, kérjen összehasonlítást a várható előnyökről, korlátokról, tisztíthatóságról és későbbi karbantartásról. Külföldi páciensként külön egyeztesse, melyik kontroll végezhető helyben, és mikor szükséges visszatérni Esztergomba.',
    ]),
  },
  'dentist-hungary-why-international-patients-choose-esztergom': {
    marker: 'seo260818enclinic2h',
    blocks: section('seo260818enclinic2', 'Checklist for a first consultation in Esztergom', [
      'Prepare a summary of your main symptoms, previous dental treatment, regular medication and desired outcome. Bring available images and records, while allowing for the possibility that current diagnostics will still be required. Ask which problems are urgent, which can safely wait and in what order the proposed treatments should be completed.',
      'By the end of the consultation, the purpose, approximate duration and expected cost of the next appointment should be clear. If several options are available, request a comparison of benefits, limitations, cleanability and future maintenance. As an international patient, confirm which reviews may be completed at home and when returning to Esztergom is important.',
    ]),
  },
  'zahnarzt-ungarn-warum-patienten-esztergom-waehlen': {
    marker: 'seo260818declinic2h',
    blocks: section('seo260818declinic2', 'Checkliste für die erste Beratung in Esztergom', [
      'Notieren Sie die wichtigsten Beschwerden, frühere Zahnbehandlungen, regelmäßig eingenommene Medikamente und Ihr gewünschtes Ergebnis. Bringen Sie vorhandene Aufnahmen und Unterlagen mit, rechnen Sie jedoch damit, dass eine aktuelle Diagnostik erforderlich sein kann. Fragen Sie, welche Probleme dringend sind, was warten kann und in welcher Reihenfolge die vorgeschlagenen Behandlungen sinnvoll sind.',
      'Am Ende der Beratung sollten Ziel, ungefähre Dauer und erwartete Kosten des nächsten Termins klar sein. Wenn mehrere Lösungen möglich sind, bitten Sie um einen Vergleich von Vorteilen, Grenzen, Reinigungsmöglichkeiten und späterer Pflege. Klären Sie als internationaler Patient, welche Kontrollen zu Hause erfolgen können und wann eine Rückkehr nach Esztergom wichtig ist.',
    ]),
  },
  'master-craftsmanship-story-of-crown-dental': {
    marker: 'seo260818enstory2h',
    blocks: section('seo260818enstory2', 'How clinical and laboratory feedback improves a restoration', [
      'A restoration may need adjustment during a try-in even when the digital design is technically correct. The mouth provides information that a screen cannot fully reproduce: the way the patient speaks, the movement of the lips, the relationship with neighbouring teeth and the comfort of the bite. Direct feedback between clinician and technician allows these observations to be incorporated before final completion.',
      'This workflow is particularly useful when matching a visible front tooth or coordinating several restorations. It does not eliminate biological limits or guarantee a perfect result, but it creates more opportunities to identify correctable issues at the appropriate stage. Patients also benefit from understanding why a careful try-in may be more valuable than the fastest possible delivery.',
    ]),
  },
  'meisterhandwerk-geschichte-von-crown-dental': {
    marker: 'seo260818destory2h',
    blocks: section('seo260818destory2', 'Wie klinische und zahntechnische Rückmeldung eine Versorgung verbessert', [
      'Eine Versorgung kann bei der Anprobe Anpassungen benötigen, auch wenn die digitale Konstruktion technisch korrekt ist. Im Mund zeigen sich Informationen, die ein Bildschirm nicht vollständig abbildet: Aussprache, Lippenbewegung, Beziehung zu Nachbarzähnen und Komfort des Bisses. Durch die direkte Rückmeldung zwischen Zahnarzt und Zahntechniker können diese Beobachtungen vor der endgültigen Fertigstellung berücksichtigt werden.',
      'Dieser Ablauf ist besonders beim Angleichen eines sichtbaren Frontzahns oder bei mehreren aufeinander abgestimmten Restaurationen hilfreich. Er beseitigt keine biologischen Grenzen und garantiert kein perfektes Ergebnis, schafft aber zusätzliche Möglichkeiten, korrigierbare Punkte im richtigen Arbeitsschritt zu erkennen. Patienten verstehen dadurch auch, warum eine sorgfältige Anprobe wichtiger sein kann als die schnellstmögliche Fertigstellung.',
    ]),
  },
}

const maintenanceItems = expansions.map((expansion) => ({
  ...expansion,
  supplement: supplementsBySlug[expansion.slug],
}))

const slugs = maintenanceItems.map(({slug}) => slug)

function hasExpansion(post: PostSnapshot | undefined, marker: string): boolean {
  return Boolean(post?.content?.some((item) => item?._key === marker))
}

export default function BlogSeoMaintenanceTool() {
  const client = useClient({apiVersion: '2024-03-10'})
  const [posts, setPosts] = useState<PostSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await client.fetch<PostSnapshot[]>(
        '*[_type == "post" && slug.current in $slugs]{_id, title, "slug": slug.current, content}',
        {slugs},
        {perspective: 'published'},
      )
      setPosts(result)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const status = useMemo(() => {
    const bySlug = new Map(posts.map((post) => [post.slug, post]))
    return maintenanceItems.map((expansion) => ({
      ...expansion,
      post: bySlug.get(expansion.slug),
      initialComplete: hasExpansion(bySlug.get(expansion.slug), expansion.marker),
      supplementComplete: hasExpansion(bySlug.get(expansion.slug), expansion.supplement.marker),
      complete:
        hasExpansion(bySlug.get(expansion.slug), expansion.marker) &&
        hasExpansion(bySlug.get(expansion.slug), expansion.supplement.marker),
    }))
  }, [posts])

  const pending = status.filter((item) => item.post && !item.complete)
  const missing = status.filter((item) => !item.post)

  const runMigration = async () => {
    if (!pending.length || running) return
    setRunning(true)
    setMessage('')
    try {
      const transaction = client.transaction()
      for (const item of pending) {
        const blocks = [
          ...(item.initialComplete ? [] : item.blocks),
          ...(item.supplementComplete ? [] : item.supplement.blocks),
        ]
        transaction.patch(item.post!._id, (patch) =>
          patch
            .setIfMissing({content: []})
            .append('content', blocks)
            .set({authorName: 'Crown Dental'})
            .unset(['medicalReviewerName', 'medicalReviewerRole', 'medicalReviewedAt']),
        )
      }
      await transaction.commit({autoGenerateArrayKeys: false})
      setMessage(`${pending.length} cikk Sanity-tartalma sikeresen bővült.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'A Sanity-módosítás sikertelen.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <main style={{maxWidth: 920, margin: '0 auto', padding: 32, fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{fontSize: 30, marginBottom: 8}}>Blog SEO-karbantartás</h1>
      <p style={{lineHeight: 1.6, color: '#555'}}>
        Ez az eszköz a 11 rövid HU/EN/DE cikkhez hozzáfűzi az auditált, lokalizált szakmai
        bővítéseket. A meglévő tartalmat nem írja felül, a művelet blokkszinten idempotens, és a
        Sanity revíziótörténetéből visszaállítható.
      </p>

      <div style={{display: 'flex', gap: 12, alignItems: 'center', margin: '24px 0'}}>
        <button
          type="button"
          onClick={runMigration}
          disabled={loading || running || pending.length === 0 || missing.length > 0}
          style={{
            border: 0,
            borderRadius: 8,
            padding: '12px 18px',
            background: pending.length ? '#e5484d' : '#2b8a3e',
            color: 'white',
            cursor: pending.length ? 'pointer' : 'default',
            fontWeight: 700,
          }}
        >
          {running ? 'Sanity frissítése…' : pending.length ? `${pending.length} cikk bővítése` : 'Minden kész'}
        </button>
        <button type="button" onClick={() => void refresh()} disabled={loading || running}>
          Állapot frissítése
        </button>
      </div>

      {message ? <p role="status" style={{fontWeight: 700}}>{message}</p> : null}
      {missing.length ? (
        <p role="alert" style={{color: '#b42318'}}>
          Hiányzó dokumentum: {missing.map((item) => item.slug).join(', ')}. A futtatás le van tiltva.
        </p>
      ) : null}

      <ul style={{padding: 0, listStyle: 'none', display: 'grid', gap: 10}}>
        {status.map((item) => (
          <li
            key={item.slug}
            style={{border: '1px solid #ddd', borderRadius: 8, padding: 14, background: '#fff'}}
          >
            <strong>{item.complete ? 'Kész' : item.post ? 'Függőben' : 'Hiányzik'} — {item.title}</strong>
            <div style={{fontSize: 13, color: '#666', marginTop: 4}}>{item.slug}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
