'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type PortableBlock = {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3' | 'blockquote'
  listItem?: 'bullet' | 'number'
  level?: number
  markDefs: Array<{_type: 'link'; _key: string; href: string}>
  children: Span[]
}
type ContentItem = PortableBlock | Record<string, unknown>
type PostSnapshot = {
  _id: string
  title?: string
  slug?: string
  language?: string
  authorName?: string
  authorRole?: string
  content?: ContentItem[]
}
type ArticleDocument = Record<string, unknown> & {_id: string; _type: string; title: string}

function block(key: string, text: string, style: PortableBlock['style'] = 'normal'): PortableBlock {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: [{_type: 'span', _key: `${key}s`, text, marks: []}],
  }
}

function bullet(key: string, text: string): PortableBlock {
  return {...block(key, text), listItem: 'bullet', level: 1}
}

function source(key: string, label: string, href: string): PortableBlock {
  const markKey = `${key}link`
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [{_type: 'link', _key: markKey, href}],
    children: [
      {_type: 'span', _key: `${key}a`, text: 'Forrás: ', marks: []},
      {_type: 'span', _key: `${key}b`, text: label, marks: [markKey]},
    ],
  }
}

const articles: ArticleDocument[] = [
  {
    _id: 'post-2026-09-imaging-guide',
    _type: 'post',
    title: 'Panorámaröntgen, teleröntgen vagy 3D CT? Melyik vizsgálat mikor indokolt?',
    slug: {_type: 'slug', current: 'panorama-telerontgen-vagy-3d-ct-melyik-mikor-indokolt'},
    language: 'hu',
    translationGroupId: 'imaging-guide-2026-09',
    category: 'professional',
    authorName: 'Crown Dental',
    authorRole: 'Fogászati tájékoztató szerkesztőség',
    seoTitle: 'Panorámaröntgen, teleröntgen vagy 3D CT? | Crown Dental',
    seoDescription: 'Mikor elég a panorámaröntgen, mire való a teleröntgen, és mikor indokolt a 3D CT? Közérthető útmutató a vizsgálatokról és a Crown Dental árairól.',
    publishedAt: '2026-09-12',
    excerpt: 'A három vizsgálat nem egymás erősebb változata: más kérdésre adnak választ. Összefoglaljuk az indikációkat, a korlátokat és az aktuális árakat.',
    mainImage: {_type: 'image', asset: {_type: 'reference', _ref: 'image-0ac89213d5e66ee49be4feb0a046fb1158fbb8e0-1880x1253-jpg'}},
    content: [
      block('img01', 'A jó képalkotó vizsgálat nem attól jó, hogy a lehető legrészletesebb, hanem attól, hogy választ ad az adott klinikai kérdésre a szükséges legkisebb terhelés mellett. A döntést ezért fogorvosi vizsgálat előzi meg: ugyanaz a panasz más felvételt igényelhet fogszabályozás, implantáció, gyökérkezelés vagy szájsebészeti tervezés előtt.'),
      block('img02', 'Röviden: a panorámaröntgen kétdimenziós áttekintő kép, a teleröntgen a koponya és az állcsontok viszonyát mutatja oldalirányból, a CBCT pedig háromdimenziós információt ad egy kijelölt területről. A 3D CT nem automatikusan „jobb”: akkor indokolt, ha a plusz térbeli információ várhatóan befolyásolja a diagnózist vagy a kezelési tervet.'),
      block('img03', 'Panorámaröntgen: átfogó kiindulópont', 'h2'),
      block('img04', 'A panorámafelvételen egy képen látható a teljes fogazat, az állcsontok nagy része, a bölcsességfogak helyzete és több olyan eltérés, amely további célzott vizsgálatot tehet szükségessé. Gyakori kiindulópont állapotfelmérésnél, kiterjedtebb kezelési tervnél, foghúzás vagy fogszabályozás előkészítésénél.'),
      block('img05', 'Mivel kétdimenziós és lehetnek rajta nagyítások vagy egymásra vetülések, nem minden részlet ítélhető meg róla. Egy adott fog gyökércsatornáihoz, apró szuvasodáshoz vagy pontos implantációs méretezéshez más felvétel is szükséges lehet. A Crown Dental tájékoztató ára: panorámaröntgen 8.000 Ft.'),
      block('img06', 'Teleröntgen: főként fogszabályozási tervezéshez', 'h2'),
      block('img07', 'A teleröntgen – gyakran oldalirányú koponyafelvétel – a fogak, az állcsontok és az arcprofil egymáshoz való viszonyának elemzését segíti. Fogszabályozás előtt mérések készülnek rajta, amelyek támogatják a növekedési irány, a harapási eltérés és a tervezett fogmozgatás értékelését.'),
      block('img08', 'Nem helyettesíti a panorámaröntgent vagy a klinikai vizsgálatot, mert más anatómiai összefüggést mutat. A Crown Dental tájékoztató ára: teleröntgen 10.000 Ft.'),
      block('img09', '3D CT / CBCT: amikor a térbeli információ számít', 'h2'),
      block('img10', 'A fogászati CBCT rétegfelvételekből háromdimenziós képet készít. Hasznos lehet implantátum helyének és a rendelkezésre álló csontnak a megítélésében, fontos anatómiai képletekhez való távolság mérésében, impaktált bölcsességfog, összetett gyökércsatorna, gyökércsúcs körüli eltérés vagy szájsebészeti eset tisztázásában.'),
      block('img11', 'A vizsgált terület nagyságát az indikációhoz kell igazítani. A CBCT sugárterhelése és információtartalma is nagyobb lehet egy hagyományos fogászati felvételénél, ezért rutinszerű, indok nélküli használata nem cél. A Crown Dental tájékoztató ára: 3D CT felvétel 20.000 Ft.'),
      block('img12', 'Hogyan dől el, melyikre van szükség?', 'h2'),
      bullet('img13', 'A fogorvos először kikérdezi a panaszt és klinikai vizsgálatot végez.'),
      bullet('img14', 'Áttekintő kérdéshez panorámafelvétel, fogszabályozási arcelemzéshez teleröntgen lehet indokolt.'),
      bullet('img15', 'Ha a kétdimenziós kép nem ad elég információt, és a térbeli részlet módosíthatja a kezelést, szóba kerülhet CBCT.'),
      bullet('img16', 'Terhességet, korábbi felvételeket és minden fontos egészségügyi körülményt jelezni kell.'),
      block('img17', 'Az árak tájékoztató jellegűek. A felvétel nem önmagában diagnózis: az eredményt a panaszokkal és a klinikai vizsgálattal együtt kell értékelni. Ha friss, jó minőségű felvétele van, vigye magával, mert előfordulhat, hogy nem szükséges új vizsgálat.'),
      source('img18', 'American Dental Association – X-rays/Radiographs', 'https://www.ada.org/resources/ada-library/oral-health-topics/x-rays-radiographs'),
    ],
  },
  {
    _id: 'post-2026-09-root-canal-guide',
    _type: 'post',
    title: 'Gyökérkezelés menete, ára és mikor szükséges korona',
    slug: {_type: 'slug', current: 'gyokerkezeles-menete-ara-es-mikor-szukseges-korona'},
    language: 'hu',
    translationGroupId: 'root-canal-guide-2026-09',
    category: 'professional',
    authorName: 'Crown Dental',
    authorRole: 'Fogászati tájékoztató szerkesztőség',
    seoTitle: 'Gyökérkezelés menete, ára és a korona szerepe',
    seoDescription: 'Hogyan zajlik a gyökérkezelés, hány alkalom lehet, mennyibe kerül, és mikor javasolt korona a gyökérkezelt fogra? Közérthető útmutató.',
    publishedAt: '2026-09-12',
    excerpt: 'A gyökérkezelés célja a fertőzött vagy gyulladt fogbél eltávolítása és lehetőség szerint a saját fog megtartása. Bemutatjuk a lépéseket és a költségeket.',
    mainImage: {_type: 'image', asset: {_type: 'reference', _ref: 'image-28f45d9216e55a5a7fd12faf04ce1fe4db1b3a0f-6000x4000-jpg'}},
    content: [
      block('root01', 'Gyökérkezelésre akkor lehet szükség, amikor a fog belsejében lévő fogbél visszafordíthatatlanul begyullad vagy elhal, illetve fertőzés alakul ki. Ennek oka lehet mély szuvasodás, repedés, sérülés vagy korábbi nagy tömés. A kezelés célja a fertőzött szövet eltávolítása, a gyökércsatornák tisztítása és lezárása, majd a fog megfelelő helyreállítása.'),
      block('root02', 'Milyen tünetek utalhatnak rá?', 'h2'),
      bullet('root03', 'erős, lüktető vagy éjszaka fokozódó fogfájás;'),
      bullet('root04', 'elhúzódó hideg- vagy melegérzékenység;'),
      bullet('root05', 'harapásra, kopogtatásra jelentkező fájdalom;'),
      bullet('root06', 'duzzanat, sipoly vagy a fog elszíneződése.'),
      block('root07', 'Tünet nélkül is lehet eltérés, és nem minden fogfájás jelent gyökérkezelési szükségletet. A döntéshez klinikai vizsgálat, érzékenységi próbák és indokolt röntgenfelvétel szükséges. Arcduzzanat, láz, nyelési vagy légzési nehézség sürgős ellátást indokol.'),
      block('root08', 'A gyökérkezelés fő lépései', 'h2'),
      block('root09', 'A fogorvos helyi érzéstelenítést alkalmaz, majd izolálja és megnyitja a fogat. Eltávolítja a gyulladt vagy elhalt szövetet, megkeresi és műszerekkel kitisztítja a csatornákat, fertőtlenít, végül gyökértöméssel lezárja a rendszert. Az eset állapotától függően ideiglenes gyógyszeres lezárás és több alkalom is szükséges lehet.'),
      block('root10', 'A kezelés után a fogat végleges töméssel, betéttel vagy koronával kell helyreállítani. Az érzéstelenítés célja a kezelési fájdalom csökkentése, de nyomásérzés előfordulhat, utána pedig néhány napig érzékeny lehet a fog. Erősödő fájdalom, duzzanat vagy kiesett ideiglenes tömés esetén kontroll szükséges.'),
      block('root11', 'Mennyibe kerül a Crown Dentalnál?', 'h2'),
      bullet('root12', 'egygyökerű fog gyökértömése: 25.000 Ft;'),
      bullet('root13', 'kétgyökerű fog gyökértömése: 30.000 Ft;'),
      bullet('root14', 'háromgyökerű fog gyökértömése: 33.000 Ft;'),
      bullet('root15', 'régi gyökértömés eltávolítása: 20.000 Ft;'),
      bullet('root16', 'gyökérkezelési ülés: 10.000 Ft.'),
      block('root17', 'A végleges helyreállítás külön tétel lehet. Tájékoztató árként a fémkerámia korona 42.000 Ft, a cirkónium korona 65.000 Ft. Az összeg az érintett fogtól, a csatornák számától, az újrakezelés szükségességétől, a felépítéstől és az alkalmazott fogpótlástól függ. A személyre szabott teljes árat vizsgálat után lehet megadni.'),
      block('root18', 'Mikor kell korona a gyökérkezelt fogra?', 'h2'),
      block('root19', 'Nem minden gyökérkezelt fogra automatikusan korona kerül. A döntést az határozza meg, mennyi ép foganyag maradt, hol helyezkedik el a fog, mekkora rágóterhelést kap, van-e repedés és milyen korábbi restaurációk készültek. A nagyőrlők és kisőrlők csücsköket fedő helyreállítása gyakran mérlegelendő, mert a jelentősen meggyengült fog törési kockázata nagyobb lehet.'),
      block('root20', 'Frontfognál vagy elegendő ép foganyag esetén más helyreállítás is megfelelő lehet. A korona sem teszi törhetetlenné a fogat: fontos a jó szájhigiéné, a kontroll, a fogcsikorgatás kezelése és a túlzott terhelés kerülése.'),
      block('root21', 'Ez a cikk általános tájékoztatás, nem diagnózis. A fog megtarthatóságáról és a végleges helyreállításról csak vizsgálat és felvétel alapján lehet dönteni.'),
      source('root22', 'American Association of Endodontists – What is a Root Canal?', 'https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/'),
    ],
  },
  {
    _id: 'post-2026-09-wisdom-tooth-aftercare',
    _type: 'post',
    title: 'Bölcsességfog-eltávolítás után: teendők és veszélyjelek',
    slug: {_type: 'slug', current: 'bolcsessegfog-eltavolitas-utan-teendok-es-veszelyjelek'},
    language: 'hu',
    translationGroupId: 'wisdom-tooth-aftercare-2026-09',
    category: 'professional',
    authorName: 'Crown Dental',
    authorRole: 'Fogászati tájékoztató szerkesztőség',
    seoTitle: 'Bölcsességfog-eltávolítás utáni teendők és veszélyjelek',
    seoDescription: 'Mit szabad és mit nem bölcsességfog-eltávolítás után? Vérzés, duzzanat, étkezés, tisztítás és azok a tünetek, amelyekkel fogorvoshoz kell fordulni.',
    publishedAt: '2026-09-12',
    excerpt: 'A vérrög védelme, a kímélet és a kezelőorvos utasításainak betartása segíti a gyógyulást. Összegyűjtöttük a gyakori teendőket és veszélyjeleket.',
    mainImage: {_type: 'image', asset: {_type: 'reference', _ref: 'image-8b77673729e317c7359889cad223a990ecea2760-1672x941-png'}},
    content: [
      block('wis01', 'Bölcsességfog-eltávolítás után a sebben kialakuló vérrög természetes védőréteg. Ennek megőrzése különösen fontos az első napokban. A kezelőorvos személyre szabott utasítása mindig elsőbbséget élvez az általános tanácsokkal szemben, mert a gyógyulást befolyásolja a fog helyzete, a műtét nehézsége, az általános egészségi állapot és a szedett gyógyszerek.'),
      block('wis02', 'Az első 24 óra', 'h2'),
      bullet('wis03', 'A behelyezett gézt az utasítás szerint tartsa a seben; tartós vérzésnél kérjen tanácsot.'),
      bullet('wis04', 'Ne öblögessen erőteljesen, ne köpködjön, ne szívogassa és ne érintse a sebet.'),
      bullet('wis05', 'Kerülje a szívószálat, az alkoholt, a dohányzást és a megerőltető mozgást.'),
      bullet('wis06', 'Pihenjen megemelt fejjel, és kívülről rövid szakaszokban alkalmazhat hideg borogatást, ha ezt javasolták.'),
      block('wis07', 'Enyhe szivárgó vérzés, fájdalom, duzzanat és korlátozott szájnyitás kezdetben gyakori. A nyál vérrel keveredve többnek tűnhet. Ha a vérzés nyomásra sem csökken, friss gézre harapva sem áll el, vagy rosszullét jelentkezik, vegye fel a kapcsolatot az ellátóhellyel.'),
      block('wis08', 'Étkezés, gyógyszerek és szájápolás', 'h2'),
      block('wis09', 'Az érzéstelenítés elmúlásáig kerülje a forró ételt és italt, nehogy megégesse vagy megharapja a zsibbadt területet. Kezdetben puha, nem túl meleg ételeket válasszon, és lehetőleg a másik oldalon rágjon. Kemény, morzsálódó, magvas vagy nagyon fűszeres étel irritálhatja a sebet.'),
      block('wis10', 'Fájdalomcsillapítót, antibiotikumot vagy szájöblítőt csak az előírás szerint használjon. Aszpirin és véralvadásgátló gyógyszerek esetén különösen fontos az orvosi utasítás; rendszeresen szedett gyógyszert ne hagyjon el önállóan. A fogmosást általában folytatni kell, de a műtéti területet az első időszakban óvatosan kerülje, majd a kapott utasítás szerint tisztítsa.'),
      block('wis11', 'Mikor lehet száraz fogmeder?', 'h2'),
      block('wis12', 'A száraz fogmeder akkor alakulhat ki, ha a vérrög nem marad a helyén vagy idő előtt lebomlik. Jellemző lehet, hogy a fájdalom néhány nap után nem javul, hanem erősödik, a fül vagy halánték felé sugárzik, és kellemetlen szag vagy íz jelentkezik. Ez fogorvosi kezelést igényel; otthoni praktikákkal ne próbálja a sebet kitisztítani.'),
      block('wis13', 'Veszélyjelek: mikor kérjen sürgős segítséget?', 'h2'),
      bullet('wis14', 'nem csillapodó vagy újra erősödő vérzés;'),
      bullet('wis15', 'gyorsan növekvő duzzanat, láz, gennyes váladék vagy rossz általános állapot;'),
      bullet('wis16', 'nyelési vagy légzési nehézség – ez azonnali sürgősségi ellátást igényel;'),
      bullet('wis17', 'erősödő fájdalom, amely az előírt fájdalomcsillapítás mellett sem uralható;'),
      bullet('wis18', 'tartós érzéskiesés, allergiás tünet vagy gyógyszermellékhatás.'),
      block('wis19', 'A kontroll és a varratszedés időpontját tartsa be akkor is, ha panaszmentes. A Crown Dental árlistájában a bölcsességfog műtéti eltávolítása 55.000 Ft; a szükséges képalkotás külön tétel lehet. A pontos kezelési tervet és árat vizsgálat után adjuk meg.'),
      block('wis20', 'Ez a tájékoztató nem helyettesíti az eltávolítást végző orvos utasításait. Ha bizonytalan, inkább telefonáljon: egy rövid egyeztetés segíthet eldönteni, hogy a tünet a normál gyógyulás része-e vagy kontrollt igényel.'),
      source('wis21', 'NHS – Wisdom tooth removal', 'https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/'),
    ],
  },
  {
    _id: 'post-2026-09-dental-focal-screening',
    _type: 'post',
    title: 'Fogászati góckutatás: mit vizsgálunk és mikor lehet indokolt?',
    slug: {_type: 'slug', current: 'fogaszati-gockutatas-mit-vizsgalunk-es-mikor-indokolt'},
    language: 'hu',
    translationGroupId: 'dental-focal-screening-2026-09',
    category: 'professional',
    authorName: 'Crown Dental',
    authorRole: 'Fogászati tájékoztató szerkesztőség',
    seoTitle: 'Fogászati góckutatás: vizsgálat és indokok | Crown Dental',
    seoDescription: 'Mit jelent a fogászati góckutatás, hogyan zajlik, milyen eltéréseket keresünk, és mikor lehet indokolt? Közérthető, óvatos útmutató.',
    publishedAt: '2026-09-12',
    excerpt: 'A góckutatás célja lehetséges krónikus szájüregi gyulladásforrások felmérése. A leletet mindig a panaszokkal és a kezelőorvosi kérdéssel együtt kell értékelni.',
    mainImage: {_type: 'image', asset: {_type: 'reference', _ref: 'image-0ac89213d5e66ee49be4feb0a046fb1158fbb8e0-1880x1253-jpg'}},
    content: [
      block('foc01', 'A „góc” kifejezést gyakran olyan tartós, sokszor kevés helyi tünettel járó gyulladásforrásra használják, amely felmerülhet más panaszok kivizsgálásakor. Fogászati góckutatást kérhet például háziorvos vagy szakorvos műtét, bizonyos kezelések, visszatérő gyulladásos panaszok vagy tisztázatlan tünetek előtt. A vizsgálat célja nem az, hogy minden általános panaszra fogászati okot mondjon, hanem hogy a szájüregben felismerhető eltéréseket szakszerűen felmérje.'),
      block('foc02', 'Mikor merülhet fel?', 'h2'),
      bullet('foc03', 'szakorvosi kérésre tervezett műtét, implantáció vagy egyes gyógyszeres kezelések előtt;'),
      bullet('foc04', 'visszatérő, nehezen magyarázható gyulladásos panaszok kivizsgálásának részeként;'),
      bullet('foc05', 'ismert rossz fogak, ínyvérzés, duzzanat, sipoly vagy rágásra érzékeny fog esetén;'),
      bullet('foc06', 'ha korábbi gyökérkezelt fog vagy részben előtört bölcsességfog állapotát kell tisztázni.'),
      block('foc07', 'A fogászati és az általános betegségek között számos összefüggést kutatnak, de az együttjárás nem mindig bizonyít közvetlen ok-okozatot. Ezért egy fog eltávolítása vagy más beavatkozás nem indokolható pusztán általános tünettel: konkrét fogászati diagnózis, a várható előnyök és az alternatívák mérlegelése szükséges.'),
      block('foc08', 'Hogyan zajlik a vizsgálat?', 'h2'),
      block('foc09', 'A fogorvos áttekinti a beutalás okát, a panaszokat, korábbi kezeléseket, gyógyszereket és fontos általános betegségeket. Megvizsgálja a fogakat, töméseket, koronákat, ínyt, nyálkahártyát és a fogak körüli szöveteket. Kopogtatási, érzékenységi vagy fogágyvizsgálat is történhet.'),
      block('foc10', 'Képalkotás csak indokolt esetben szükséges. Panorámaröntgen adhat átfogó képet; célzott kisröntgen részletesebb információt adhat egy fogról; 3D CBCT akkor lehet hasznos, ha a kétdimenziós kép nem válaszolja meg a klinikai kérdést, és a térbeli információ befolyásolja a döntést.'),
      block('foc11', 'Milyen eltérések kerülhetnek elő?', 'h2'),
      bullet('foc12', 'kezeletlen mély szuvasodás vagy elhalt fogbél;'),
      bullet('foc13', 'gyökércsúcs körüli gyulladás vagy sikertelen korábbi gyökérkezelés gyanúja;'),
      bullet('foc14', 'fogágybetegség, mély tasakok vagy aktív ínygyulladás;'),
      bullet('foc15', 'részben előtört bölcsességfog körüli visszatérő gyulladás;'),
      bullet('foc16', 'egyéb, további vizsgálatot igénylő csont- vagy nyálkahártya-eltérés.'),
      block('foc17', 'Mi történik, ha találunk eltérést?', 'h2'),
      block('foc18', 'A lelet alapján nem mindig ugyanaz a kezelés következik. Lehet elegendő kontroll vagy tisztítás, szükség lehet tömésre, gyökérkezelésre, fogágykezelésre, esetleg eltávolításra. A döntéshez számít a fog megtarthatósága, az általános egészségi állapot, a tervezett más szakorvosi kezelés és annak időzítése. A fogorvosi leletet érdemes visszavinni a vizsgálatot kérő orvoshoz.'),
      block('foc19', 'Ár és gyakorlati tudnivalók', 'h2'),
      block('foc20', 'A Crown Dental fogászati góckutatásának tájékoztató ára 15.000 Ft-tól indul. Ha képalkotás is szükséges, annak díja külön tétel lehet: panorámaröntgen 8.000 Ft, teleröntgen 10.000 Ft, 3D CT felvétel 20.000 Ft. Nem minden vizsgálat szükséges minden esetben; a választást a klinikai kérdés határozza meg.'),
      block('foc21', 'Hozza magával a beutalót vagy a szakorvosi kérdést, a korábbi fogászati felvételeket, gyógyszerlistáját és a fontos egészségügyi dokumentumokat. Sürgős panasz, arcduzzanat, láz, nyelési vagy légzési nehézség esetén ne rutin góckutatási időpontra várjon, hanem kérjen sürgős ellátást.'),
      block('foc22', 'Ez a cikk általános tájékoztatás. A góckutatási lelet nem jelent automatikus ok-okozati bizonyítékot, és nem helyettesíti a fogorvos, a háziorvos vagy a kezelő szakorvos közös mérlegelését.'),
      source('foc23', 'Egészségvonal – Gócbetegségek', 'https://egeszsegvonal.gov.hu/egeszseg-a-z/g-gy/gocbetegsegek.html'),
      source('foc24', 'American Dental Association – Oral-Systemic Health', 'https://www.ada.org/resources/ada-library/oral-health-topics/oral-systemic-health'),
    ],
  },
]

const CONTENT_REPLACEMENTS: Record<string, Record<string, Array<[string, string]>>> = {
  '2O9MRZTkpcEGwsbTxVQndR': {
    k104: [['55.000 Ft', '65.000 Ft']],
    k196: [['55.000 Ft', '65.000 Ft']],
  },
  '2O9MRZTkpcEGwsbTxaaZaX': {
    k60: [['55.000 Ft', '65.000 Ft']],
    k108: [['6.000 Ft', '8.000 Ft'], ['55.000 Ft', '65.000 Ft']],
    k139: [['55.000 Ft', '65.000 Ft']],
    k186: [['55.000 Ft', '65.000 Ft']],
  },
  '9LkD2QQtmf28HBA1GSBR7c': {
    k46: [['55.000 Ft', '65.000 Ft']],
    k119: [['55.000 Ft', '65.000 Ft']],
  },
  'bc6b1f1f-fc0e-4fdf-91f1-7ee2ef552238': {
    eeed0fac2fbf: [['7:00–13:00', '08:00–20:00']],
  },
  'b0d676a0-77a7-418f-b55e-1ec900240f48': {
    '547d31a5af4e': [['7:00 to 13:00', '08:00 to 20:00']],
  },
  '2423aacc-1866-44b0-8f01-40550a90c3a8': {
    '87e0783b4311': [['7:00 bis 13:00', '08:00 bis 20:00']],
  },
}

const roleByLanguage: Record<string, string> = {
  hu: 'Fogászati tájékoztató szerkesztőség',
  sk: 'Redakcia stomatologických informácií',
  en: 'Dental information editorial team',
  de: 'Redaktion für zahnmedizinische Patienteninformationen',
}

function correctedContent(post: PostSnapshot): ContentItem[] | undefined {
  const replacements = CONTENT_REPLACEMENTS[post._id]
  if (!replacements || !post.content) return undefined
  let changed = false
  const content = post.content.map((item) => {
    const key = typeof item._key === 'string' ? item._key : ''
    const rules = replacements[key]
    if (!rules || item._type !== 'block' || !Array.isArray(item.children)) return item
    const children = item.children.map((child: unknown) => {
      if (!child || typeof child !== 'object' || !('text' in child) || typeof child.text !== 'string') return child
      let text = child.text
      for (const [before, after] of rules) text = text.replaceAll(before, after)
      if (text !== child.text) changed = true
      return text === child.text ? child : {...child, text}
    })
    return {...item, children}
  })
  return changed ? content : undefined
}

export default function ContentReleaseTool() {
  const client = useClient({apiVersion: '2024-03-10'})
  const [posts, setPosts] = useState<PostSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await client.fetch<PostSnapshot[]>(
        '*[_type == "post" && !(_id in path("drafts.**"))]{_id,title,"slug":slug.current,"language":coalesce(language,"hu"),authorName,authorRole,content}',
        {},
        {perspective: 'published'},
      )
      setPosts(result)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const status = useMemo(() => {
    const ids = new Set(posts.map((post) => post._id))
    return {
      articlesPublished: articles.filter((article) => ids.has(article._id)).length,
      missingAuthors: posts.filter((post) => !post.authorName || !post.authorRole).length,
      contentCorrections: posts.filter((post) => correctedContent(post)).length,
    }
  }, [posts])

  const complete = status.articlesPublished === articles.length && status.missingAuthors === 0 && status.contentCorrections === 0

  const runRelease = async () => {
    if (running || complete) return
    setRunning(true)
    setMessage('')
    try {
      const patches = posts.filter((post) => correctedContent(post) || !post.authorName || !post.authorRole)
      for (let index = 0; index < patches.length; index += 40) {
        const transaction = client.transaction()
        for (const post of patches.slice(index, index + 40)) {
          const content = correctedContent(post)
          transaction.patch(post._id, (patch) => {
            let next = patch
            if (content) next = next.set({content})
            if (!post.authorName) next = next.set({authorName: 'Crown Dental'})
            if (!post.authorRole) next = next.set({authorRole: roleByLanguage[post.language ?? 'hu'] ?? roleByLanguage.hu})
            return next
          })
        }
        await transaction.commit({autoGenerateArrayKeys: false})
      }

      let articleTransaction = client.transaction()
      for (const article of articles) articleTransaction = articleTransaction.createIfNotExists(article)
      await articleTransaction.commit({autoGenerateArrayKeys: false})
      setMessage(`Kész: ${patches.length} meglévő cikk frissítve, ${articles.length} új cikk ellenőrizve/publikálva.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'A tartalmi kiadás sikertelen.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <main style={{maxWidth: 960, margin: '0 auto', padding: 32, fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{fontSize: 30, marginBottom: 8}}>Ellenőrzött tartalmi kiadás</h1>
      <p style={{lineHeight: 1.6, color: '#555'}}>
        Ez az egyszer futtatható, idempotens eszköz javítja a régi ár- és nyitvatartási adatokat,
        kitölti a hiányzó szerkesztőségi szerzőmezőket, és nyilvánosan publikálja a négy új magyar
        páciens-tájékoztató cikket. Orvosi ellenőrzőt nem nevez meg, mert ilyen jóváhagyás nem áll rendelkezésre.
      </p>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, margin: '24px 0'}}>
        <div style={{padding: 16, border: '1px solid #ddd', borderRadius: 10}}><strong>{status.articlesPublished}/{articles.length}</strong><br />új cikk publikálva</div>
        <div style={{padding: 16, border: '1px solid #ddd', borderRadius: 10}}><strong>{status.missingAuthors}</strong><br />hiányzó szerzőmező</div>
        <div style={{padding: 16, border: '1px solid #ddd', borderRadius: 10}}><strong>{status.contentCorrections}</strong><br />javítandó dokumentum</div>
      </div>

      <button
        type="button"
        onClick={runRelease}
        disabled={loading || running || complete}
        style={{border: 0, borderRadius: 8, padding: '13px 18px', background: complete ? '#2b8a3e' : '#c2410c', color: 'white', fontWeight: 700}}
      >
        {running ? 'Publikálás és javítás folyamatban…' : complete ? 'A tartalmi kiadás kész' : '4 cikk publikálása és adatjavítások futtatása'}
      </button>
      <button type="button" onClick={() => void refresh()} disabled={loading || running} style={{marginLeft: 12}}>
        Állapot frissítése
      </button>
      {message ? <p role="status" style={{fontWeight: 700, marginTop: 18}}>{message}</p> : null}

      <h2 style={{marginTop: 32}}>Publikálandó cikkek</h2>
      <ul>
        {articles.map((article) => <li key={article._id} style={{marginBottom: 8}}>{article.title}</li>)}
      </ul>
    </main>
  )
}
