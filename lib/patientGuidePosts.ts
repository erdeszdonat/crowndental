import { patientGuideLinks } from './patientGuideLinks';

type Inline = string | { text: string; href?: string; bold?: boolean };
const link = (text: string, href: string): Inline => ({ text, href });
const strong = (text: string): Inline => ({ text, bold: true });

function block(style: 'h2' | 'normal', parts: Inline[]) {
  const markDefs: { _type: 'link'; _key: string; href: string }[] = [];
  const children = parts.map((part, index) => {
    const value = typeof part === 'string' ? { text: part } : part;
    const marks = value.bold ? ['strong'] : [];
    if (value.href) {
      const key = 'link-' + index;
      markDefs.push({ _type: 'link', _key: key, href: value.href });
      marks.push(key);
    }
    return { _type: 'span', _key: 'span-' + index, text: value.text, marks };
  });
  return { _type: 'block', style, markDefs, children };
}

const paragraph = (...parts: Inline[]) => block('normal', parts);
const heading = (text: string) => block('h2', [text]);

export const patientGuidePosts = [
  {
    slug: patientGuideLinks.voucher.slug,
    title: "Milyen összegű fogászati ajándékutalványt válasszon karácsonyra?",
    seoTitle: "Fogászati ajándékutalvány karácsonyra – melyik összeget válasszam?",
    seoDescription: "Mire elég 10, 30 vagy 90 ezer forint a Crown Dentalnál? Útmutató a karácsonyi fogászati utalvány kiválasztásához, nyomtatásához és esztergomi átvételéhez.",
    excerpt: "Mit ajándékozhat 10, 30 vagy 90 ezer forintból? Kezelési példák, névre szóló PDF és nyomtatott átvétel Esztergomban.",
    category: "magazine",
    imageUrl: "https://www.crowndental.hu/images/blog/karacsonyi-fogaszati-ajandekutalvany.webp",
    mainImage: { alt: "A Crown Dental karácsonyi ajándékutalványának téli mintája" },
    content: [
      paragraph("Ha valaki régóta emlegeti, hogy szeretne elmenni fogfehérítésre, könnyű neki ajándékot választani. De mekkora összeget írjon a karácsonyi utalványra, ha csak annyit tud, hogy a párja januárban végre eljutna fogorvoshoz? A Crown Dental ajándékutalványán Ön az összeget választja ki. Hogy végül milyen kezelésre fordítja, azt a megajándékozott a fogorvossal egyeztetheti. Az értéket 10 000 és 500 000 Ft között, 5 000 Ft-os lépésekben állíthatja be."),
      heading("Mire elég 10 000, 30 000 vagy 90 000 forint?"),
      paragraph(
        strong("10 000 Ft"),
        " a jelenlegi árlistán egy ",
        link("fogászati elővizsgálat és kezelési terv", "/kezelesek/allapotfelmeres"),
        " díja. Akkor lehet jó választás, ha az első lépéshez szeretne hozzájárulni, és a megajándékozott még nem tudja, milyen kezelésre lesz szüksége.",
      ),
      paragraph(
        strong("30 000 Ft"),
        " fedezi mindkét állcsont ultrahangos fogkőeltávolítását. Ha a megajándékozott a ",
        link("prémium biofilm-terápiát", "/kezelesek/premium-biofilm-terapia"),
        " említette, annak jelenlegi díja két állcsontra 50 000 Ft. Ezt az összeget az „Egyéb összeg” lehetőségnél adhatja meg.",
      ),
      paragraph(
        strong("90 000 Ft"),
        " a ",
        link("rendelői, lámpás fogfehérítés", "/kezelesek/fogfeherites"),
        " jelenlegi díja mindkét fogívre. A fogorvos vizsgálatkor tudja megmondani, hogy az adott fogaknál megfelelő-e a fehérítés. Az összeg kiválasztásához itt találja a teljes ",
        link("fogászati árlistát", "/kezelesek"),
        ".",
      ),
      heading("Hogyan kerül az ajándék a fa alá?"),
      paragraph("A vásárláskor tetszés szerint ráírathatja az utalványra a megajándékozott nevét. Ha titoknak szánja, a számlázási e-mail-címhez a saját címét adja meg. Elektronikus átvételnél erre érkezik a nyomtatható, A5-ös PDF. A számlát a Számlázz.hu külön levélben küldi."),
      paragraph(
        "Ha kész, nyomtatott példányt szeretne, válassza a személyes átvételt. A fizetést követő harmadik naptári naptól, nyitvatartási időben veheti át belvárosi rendelőnkben, a ",
        strong("2500 Esztergom, Petőfi Sándor utca 11."),
        " alatt. Az első átvételi napot a visszaigazolásban is megtalálja.",
      ),
      paragraph("Az utalvány a fizetéstől számított egy évig, egy alkalommal használható fel bármelyik Crown Dental rendelőben adómentes fogászati kezelésre (ez rendelőinkben minden fogászati kezelést jelent). Boldog karácsonyt kívánunk!"),
      paragraph(link("Kiválasztom a karácsonyi utalvány összegét", "/karacsonyi-utalvanyok#utalvany-vasarlas")),
    ],
  },
  {
    slug: patientGuideLinks.orthodontics.slug,
    title: "Lehet fogszabályozóm, ha már van koronám vagy implantátumom?",
    seoTitle: "Fogszabályozás koronával vagy implantátummal | Crown Dental",
    seoDescription: "Saját fogon áll a koronája, vagy implantátumon? Ettől függ, mit lehet mozgatni. Mutatjuk, mit érdemes tisztázni a fogszabályozási konzultáción.",
    excerpt: "A koronás saját fog és az implantátum másképp viselkedik. Mit jelent ez a fogszabályozás tervezésénél?",
    category: "professional",
    imageUrl: "https://cdn.sanity.io/images/h68mmabs/production/cc628a46ca6b45d189e34d6c246771820a468f16-4302x6453.jpg",
    mainImage: { alt: "A Crown Dental fogszabályozási oldalának nyitóképe" },
    content: [
      paragraph("Két korona a tükörben egyformának tűnhet, miközben az egyik saját fogon, a másik implantátumon áll. Fogszabályozásnál ez fontos különbség. Meglévő korona vagy implantátum mellett is szóba jöhet fogszabályozás. A tervezés azzal kezdődik, hogy a fogszabályozó orvos megnézi, mi tartja a pótlást, és melyik fog helyzetén szeretne változtatni."),
      heading("Ha a korona saját fogon áll"),
      paragraph(
        "A koronával borított saját fog a gyökerével együtt mozdulhat el a kezelés során. Például ha egy koronás metszőfog kissé elfordult, a konzultáción meg lehet vizsgálni, hogy a fog elfordítása hogyan hatna az alsó és felső fogak érintkezésére. A döntéshez számít a fogágy állapota, a korona illeszkedése és a szomszédos fogak helyzete is. ",
        link("Az Amerikai Fogszabályozó Szövetség betegtájékoztatója", "https://aaoinfo.org/resources/faqs/page/28/"),
      ),
      heading("Ha a korona implantátumon áll"),
      paragraph(
        "A csontban rögzült implantátum helye fogszabályozás közben adott. A körülötte álló saját fogak mozgatását ehhez a ponthoz igazítják. Ha például a hátsó rágófog helyén van implantátum, az elülső torlódás rendezése még szóba jöhet. A megvalósíthatóságot az dönti el, mennyi hely kell a mozgáshoz, és hogyan záródnának utána a fogak. ",
        link("Az AAO ismertetője az implantátumokról", "https://aaoinfo.org/resources/glossary-of-orthodontic-terms/"),
      ),
      heading("Ha az implantátum még csak terv"),
      paragraph(
        "Az ",
        link("implantátum beültetése", "/kezelesek/implantatum"),
        " előtt érdemes összehangolni a fogpótlást és a fogszabályozást. Egy hiányzó fog helyén maradhat rés, miközben a szomszédos fogak már bedőltek. Ilyenkor a fogszabályozás egyik célja lehet, hogy megfelelő helyet készítsen a pótlásnak. A két kezelést végző orvos ennek alapján javasolhat sorrendet.",
      ),
      paragraph(
        "Az esztergomi konzultációra hozza magával a korábbi kezelési tervét vagy az implantátumhoz kapott dokumentumot, ha megvan. Érdemes a saját célját is elmondania: például azt, hogy az elfordult első fog zavarja, vagy a hiány helyére szeretne később pótlást. Így a megbeszélés rögtön arra irányulhat, amiért eljött. ",
        link("Fogszabályozási lehetőségek a Crown Dentalnál", "/kezelesek/fogszabalyozas"),
        " A készülékekről és a kontrollokról a ",
        link("fogszabályozási módszereket és árakat bemutató cikkünkben", "/blog/a-fogszabalyozas-menete-modszerek-es-arak-attekintese-crown-dental"),
        " olvashat.",
      ),
      paragraph(link("Időpontot kérek fogszabályozási konzultációra", "/idopont?kezeles=fogszabalyozas")),
    ],
  },
  {
    slug: patientGuideLinks.dentures.slug,
    title: "Mozog a kivehető fogsorom. Segíthet az alábélelés?",
    seoTitle: "Mozog a kivehető fogsor? Alábélelés és javítás Esztergomban",
    seoDescription: "Étkezéskor billeg a korábban kényelmes fogsor? Ebből látszik, mikor segíthet az alábélelés, mi indokolhat cserét, és mennyibe kerül a kezelés Esztergomban.",
    excerpt: "Ha a korábban kényelmes fogsor már billeg vagy nyomja az ínyt, nem mindig kell újat készíteni. Mikor jön szóba alábélelés, javítás vagy csere?",
    category: "professional",
    imageUrl: "https://cdn.sanity.io/images/h68mmabs/production/7d6f9d82f99f01727f37914d0af959be59366f7f-4480x6720.jpg",
    mainImage: { alt: "A Crown Dental fogsorkészítést bemutató oldalának nyitóképe" },
    content: [
      paragraph("Ha a felső fogsora évekig jól tartott, most viszont beszéd közben elenged, érthető, ha rögtön egy új fogsor árát kezdi keresni. A régi pótlást érdemes magával vinni egy vizsgálatra. A fogorvos abból, hogyan billen meg harapáskor és hol nyomja az ínyt, sokszor többet megtud, mint abból, hogy hány éve készült."),
      heading("Mit változtat meg az alábélelés?"),
      paragraph(
        "A kivehető fogsor belső felszíne készítéskor az íny és az alatta lévő állcsont formájához illeszkedik. Ez a forma idővel változhat. Az alábéleléskor a fogsor íny felőli oldalát igazítják a jelenlegi felszínhez. A műfogak megmaradnak. Ez akkor lehet jó megoldás, ha elsősorban a felfekvés romlott, miközben a fogsor alapja, a műfogak és a harapás még megfelelőek. ",
        link("Az Amerikai Fogpótlástani Kollégium betegtájékoztatója", "https://www.gotoapro.org/dentures-faq/"),
      ),
      heading("Mikor merül fel javítás vagy csere?"),
      paragraph(
        "Egy letört műfog, a megrepedt alaplemez és a lazán illeszkedő fogsor három különböző probléma. Az első kettőnél javításra lehet szükség. Ha a műfogak rágófelszíne is elkopott, vagy a harapás már nem megfelelő, az alábéleléstől önmagában nem várható kényelmes rágás. Ilyenkor új fogsor készítése is indokolt lehet. ",
        link("Szakmai állásfoglalás a fogsorcseréről", "https://www.prosthodontics.org/about-acp/position-statement-the-frequency-of-denture-replacement/"),
      ),
      heading("Mennyibe kerül, és mit vigyen a vizsgálatra?"),
      paragraph(
        "A Crown Dental árlistáján a fogsor alábélelése ",
        strong("25 000 Ft"),
        ", a teljes kivehető fogsor pedig ",
        strong("110 000 Ft állcsontonként"),
        ". Az utóbbi összeg egy felső vagy egy alsó fogsor díja. A vizsgálaton tudjuk megmondani, az Ön meglévő pótlásán melyik beavatkozás segíthet. ",
        link("Fogsorok és aktuális díjak", "/kezelesek/fogsor"),
        " A csere mérlegeléséhez olvassa el, ",
        link("mitől függ a felső teljes fogsor ára", "/blog/cuppanos-fogsor-arak-2026-ban-mennyibe-kerul-egy-stabil-kiveheto-fogsor"),
        ".",
      ),
      paragraph("Hozza el a használt fogsorát, és ha külön felső és alsó pótlást visel, mindkettőt. Jegyezze meg, mikor mozdul el: már beszédnél, az első falatnál vagy csak az egyik oldalon rágva. Ha ugyanott ismételten sebet okoz, ezt is mutassa meg. Ezek a részletek segítenek megtalálni, min kell változtatni."),
      paragraph(link("Időpontot kérek a fogsorom vizsgálatára", "/idopont?kezeles=fogsor")),
    ],
  },
  {
    slug: patientGuideLinks.filling.slug,
    title: "Kiesett a fogtömésem. Mit tegyek, ha még nem fáj?",
    seoTitle: "Kiesett a fogtömés? Teendők és a tömés ára Esztergomban",
    seoDescription: "Kiesett a fogtömése, de nem fáj a foga? Olvassa el, hogyan kímélje a vizsgálatig, milyen tünettel telefonáljon még aznap, és mennyibe kerülhet az új tömés.",
    excerpt: "Mit tehet, ha kiesett egy tömés, de a foga még nem fáj? Így kímélje a vizsgálatig, és ezekkel a tünetekkel kérjen sürgős segítséget.",
    category: "professional",
    imageUrl: "https://cdn.sanity.io/images/h68mmabs/production/d89c537b48e8a2c8022c776d77c74e6b5633538f-5760x3840.jpg",
    mainImage: { alt: "A Crown Dental fogmegtartó kezeléseit bemutató oldalának nyitóképe" },
    content: [
      paragraph("Ebéd után a nyelvével egy éles peremet érez a régen tömött fogán. A fog nem fáj, de valami megváltozott. Ilyenkor kérjen fogorvosi időpontot akkor is, ha jól tud rágni. Otthon nehéz megkülönböztetni, hogy a tömés esett-e ki, vagy a mellette lévő fogfalból tört le egy darab. A megmaradt foganyag állapota dönti el, hogyan lehet helyreállítani a fogat."),
      heading("Hogyan kímélheti a fogat a vizsgálatig?"),
      paragraph(
        "Puha fogkefével továbbra is óvatosan tisztítsa a területet. Rágjon inkább a másik oldalon, különösen, ha kemény vagy ropogós ételt eszik. Ha a hideg ital vagy a forró leves nyilallást vált ki, válasszon langyosat. A rendelőnek hasznos információ, hogy az érzékenység az inger elmúltával megszűnik-e, vagy a fog utána is fáj. ",
        link("Betegtájékoztató a kiesett tömésről", "https://primarycareone.nhs.wales/files/dental-posters/lost-filling-pdf/"),
      ),
      heading("Mikor telefonáljon még aznap?"),
      paragraph(
        "Erősödő fájdalom, láz vagy arcduzzanat esetén még aznap kérjen ",
        link("sürgős fogászati ellátást", "/blog/fogaszati-ugyelet-esztergomban-2026"),
        ". Telefonon mondja el a tüneteit, hogy az ellátó megítélhesse a sürgősséget. Ha a száj vagy a nyak duzzanata miatt nehezen kap levegőt vagy nehezen nyel, azonnal hívja a ",
        strong("112-t"),
        ". ",
        link("Egészségvonal – fogfájdalom és arcduzzanat", "https://egeszsegvonal.gov.hu/egeszseg-a-z/f/fogfajas-es-az-arc-feldagadasa.html"),
      ),
      heading("Elég lehet egy új tömés?"),
      paragraph(
        "Ha elegendő ép fogfal maradt, a fog sok esetben újra felépíthető tömőanyaggal. Nagyobb törésnél más helyreállítás, például korona is szóba jöhet. A fogorvos megvizsgálja a megmaradt fogfalakat és szükség esetén röntgenfelvételt kér. Egy kiesett tömésből önmagában még nem következik, hogy a fog ",
        link("gyökérkezelésre", "/kezelesek/gyokerkezeles"),
        " szorul.",
      ),
      paragraph(
        "A Crown Dental esztergomi árlistáján a fogtömés díja ",
        strong("30 000–35 000 Ft"),
        ". Ez a tömés ára. A vizsgálat, az esetleg szükséges röntgen és egy más típusú helyreállítás díját külön érdemes egyeztetni. Időpontkéréskor válassza a „Fogtömés” lehetőséget. ",
        link("A rendelő aktuális árlistája", "/kezelesek"),
      ),
      paragraph(link("Időpontot kérek fogtöméshez", "/idopont?kezeles=fogtomes")),
    ],
  },
].map(post => ({
  ...post,
  _id: post.slug,
  language: 'hu',
  publishedAt: '2026-11-24',
  _updatedAt: '2026-11-24',
  authorName: 'Crown Dental',
  content: post.content.map((item, index) => ({ ...item, _key: 'block-' + index })),
}));
