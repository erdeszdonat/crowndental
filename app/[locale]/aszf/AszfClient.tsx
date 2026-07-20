'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FileSignature, 
  Building2, 
  Stethoscope, 
  CreditCard, 
  BrainCircuit, 
  CalendarX, 
  ShieldCheck, 
  AlertTriangle, 
  Scale 
} from 'lucide-react';

function TermsHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sky-300 text-sm font-bold tracking-widest uppercase mb-6">
            <FileSignature className="w-4 h-4" /> Jogi Információk
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Általános Szerződési <span className="text-sky-400">Feltételek</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-3xl mx-auto">
            A Crown Dental Praxis és Labor Fogászati Kft. szolgáltatásainak igénybevételére vonatkozó hivatalos szabályzat és garanciális feltételek.
          </p>
          <p className="mt-6 text-sm font-medium uppercase tracking-widest text-slate-400">
            Hatályos: 2026. július 20-tól visszavonásig
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TermsContent() {
  const [activeSection, setActiveSection] = useState('szolgaltato');

  const sections = [
    { id: 'szolgaltato', title: '1. A Szolgáltató adatai', icon: <Building2 className="w-4 h-4" /> },
    { id: 'altalanos', title: '2. Általános rendelkezések', icon: <FileSignature className="w-4 h-4" /> },
    { id: 'kezelesek', title: '3. Fogászati ellátás', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'dijazas', title: '4. Díjazás és fizetés', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'ai-kalkulator', title: '5. AI Árajánlat Kalkulátor', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'idopont', title: '6. Időpontfoglalás', icon: <CalendarX className="w-4 h-4" /> },
    { id: 'garancia', title: '7. Garanciális feltételek', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'felelosseg', title: '8. Felelősségkorlátozás', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'panasz', title: '9. Panaszkezelés', icon: <Scale className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <aside className="w-full lg:w-1/3 xl:w-1/4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm lg:sticky lg:top-32 lg:p-6">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400 lg:mb-6">Tartalomjegyzék</h3>
              <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} onClick={(e) => scrollTo(e, section.id)}
                    className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all lg:min-w-0 ${
                      activeSection === section.id ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:bg-sky-100 hover:text-sky-700'
                    }`}>
                    {section.icon} {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          <main className="w-full lg:w-2/3 xl:w-3/4 text-left">
            <div className="legal-content max-w-none">
              <div id="szolgaltato" className="scroll-mt-32">
                <h2>1. A Szolgáltató adatai</h2>
                <div className="legal-reset my-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                  <ul className="space-y-3 text-slate-700">
                    <li><strong>Cégnév:</strong> Crown Dental Praxis és Labor Fogászati Kft.</li>
                    <li><strong>Székhely és esztergomi rendelő:</strong> 2500 Esztergom, Petőfi Sándor utca 11.</li>
                    <li><strong>Budapesti telephely:</strong> 1039 Budapest, Királyok útja 55.</li>
                    <li><strong>Cégjegyzékszám:</strong> 11-09-026431</li>
                    <li><strong>Adószám:</strong> 26537353-2-11</li>
                    <li><strong>E-mail:</strong> <a href="mailto:info@crowndental.hu">info@crowndental.hu</a></li>
                    <li><strong>Telefon:</strong> <a href="tel:+36705646837">+36 70 564 6837</a></li>
                  </ul>
                </div>
              </div>

              <div id="altalanos" className="scroll-mt-32">
                <h2>2. Általános rendelkezések</h2>
                <p>Jelen Általános Szerződési Feltételek („ÁSZF”) a Szolgáltató által nyújtott magán fogászati ellátás, az online időpontkérés, valamint a weboldalon elérhető kiegészítő szolgáltatások alapvető feltételeit tartalmazza.</p>
                <ul>
                  <li>A pácienssel létrejövő egyedi jogviszony tartalmát az ÁSZF mellett az elfogadott kezelési terv, az árajánlat, a beleegyező nyilatkozatok, az egészségügyi dokumentáció és a vonatkozó jogszabályok határozzák meg.</li>
                  <li>Eltérés esetén az egyedileg megtárgyalt és írásban rögzített feltétel irányadó, ha az jogszabállyal nem ellentétes.</li>
                  <li>A Szolgáltató az ÁSZF-et a jövőre nézve módosíthatja. A módosítás nem csökkenti a már megkezdett kezeléshez kapcsolódó, korábban írásban vállalt jogokat.</li>
                </ul>
                <p>A 45/2014. (II. 26.) Korm. rendelet távollévők közötti szerződésekre vonatkozó elállási szabályai az egészségügyi ellátásra irányuló szerződésre nem alkalmazandók. Az online űrlap elküldése önmagában nem jelent kezelési szerződést vagy fizetési kötelezettséget.</p>
              </div>

              <div id="kezelesek" className="scroll-mt-32">
                <h2>3. A fogászati ellátás igénybevétele</h2>
                <ul>
                  <li>A diagnózist, a javasolt kezelést, annak lényegét, kockázatait, várható eredményét és lehetséges alternatíváit a kezelőorvos az egyedi vizsgálat alapján ismerteti.</li>
                  <li>A kezelés a páciens megfelelő tájékoztatáson alapuló beleegyezésével végezhető. A páciens a beleegyezését a jogszabályi keretek között visszavonhatja.</li>
                  <li>A páciens köteles a kezelés szempontjából lényeges egészségügyi adatokat, gyógyszerszedést, allergiát, korábbi beavatkozást és állapotváltozást valósan közölni.</li>
                  <li>A páciens együttműködik a kezelési, szájhigiénés, gyógyszerszedési és kontrollra vonatkozó utasítások betartásában.</li>
                  <li>A Szolgáltató jogosult a szakmailag nem indokolt, ellenjavallt vagy biztonságosan nem elvégezhető beavatkozást megtagadni, és szükség esetén más ellátóhoz irányítani a pácienst.</li>
                </ul>
              </div>

              <div id="dijazas" className="scroll-mt-32">
                <h2>4. Díjazás, árajánlat és fizetés</h2>
                <ul>
                  <li>A weboldalon közzétett árak tájékoztató jellegűek. A végleges kezelési terv és díj a személyes vizsgálat, a diagnosztika és az egyéni körülmények alapján határozható meg.</li>
                  <li>A Szolgáltató a tervezhető beavatkozások előtt tájékoztatást ad a várható költségekről. Ha a kezelés közben előre nem látható szakmai körülmény merül fel, a módosítást és annak költséghatását lehetőség szerint előzetesen egyezteti a pácienssel.</li>
                  <li>A fizetés az adott kezeléshez kapcsolódó megállapodás és a rendelőben elérhető fizetési módok szerint esedékes. A Szolgáltató a teljesített szolgáltatásról számlát állít ki.</li>
                  <li>Az írásos árajánlat a rajta feltüntetett ideig érvényes. Ennek hiányában az árajánlat nem tekinthető határozatlan ideig rögzített árnak.</li>
                </ul>
              </div>

              <div id="ai-kalkulator" className="scroll-mt-32">
                <h2>5. AI Árajánlat Kalkulátor</h2>
                <div className="rounded-2xl border-l-4 border-sky-500 bg-sky-50 p-6 text-sky-950">
                  <p className="!m-0">Az AI Árajánlat Kalkulátor a feltöltött dokumentumból automatikusan készít tájékoztató összehasonlítást. Az eredmény <strong>nem diagnózis, nem kezelési terv és nem kötelező árajánlat</strong>.</p>
                </div>
                <ul>
                  <li>Az automatikus felismerés tévedhet, ezért az eredményt fogorvosnak kell ellenőriznie.</li>
                  <li>A végleges kezelési terv és ár kizárólag személyes vizsgálat után állapítható meg.</li>
                  <li>A felhasználó csak olyan dokumentumot tölthet fel, amelynek kezelésére és továbbítására jogosult. Más személy adatait tartalmazó dokumentum feltöltése előtt a felesleges adatokat törölni vagy kitakarni kell.</li>
                  <li>Az adatkezelés részleteit az <Link href="/adatkezeles">Adatkezelési tájékoztató</Link> tartalmazza.</li>
                </ul>
              </div>

              <div id="idopont" className="scroll-mt-32">
                <h2>6. Időpontkérés, visszaigazolás és lemondás</h2>
                <ul>
                  <li>A weboldalon elküldött időpontkérés nem automatikusan visszaigazolt időpont. A foglalás akkor válik véglegessé, amikor a Szolgáltató a pontos dátumot és időpontot telefonon vagy e-mailben megerősíti.</li>
                  <li>A páciens köteles valós és elérhető kapcsolattartási adatokat megadni, valamint az időpontra pontosan, kezelésre alkalmas állapotban megjelenni.</li>
                  <li>Akadályoztatás esetén az időpontot a lehető leghamarabb, lehetőleg legalább 24 órával korábban telefonon vagy e-mailben kell lemondani.</li>
                  <li>A Szolgáltató szakmai vagy működési okból időpont-módosítást javasolhat; erről a pácienst a rendelkezésére álló elérhetőségen értesíti.</li>
                  <li>Ismételt, előzetes jelzés nélküli távolmaradás esetén a Szolgáltató a későbbi időpont biztosítását egyedi egyeztetéshez kötheti.</li>
                </ul>
              </div>

              <div id="garancia" className="scroll-mt-32">
                <h2>7. Garanciális feltételek és utógondozás</h2>
                <p>A Szolgáltató a kezelést a szakmai szabályok szerint végzi, és a jogszabályon alapuló páciensi, fogyasztói és kellékszavatossági jogokat tiszteletben tartja. Egyes fogpótlásokhoz vagy munkákhoz kapcsolódó, ezen felüli önkéntes garancia pontos időtartamát és feltételeit az egyedi kezelési terv, garancialevél vagy írásos tájékoztató tartalmazza.</p>
                <p>A kivizsgáláshoz a páciensnek a problémát indokolatlan késedelem nélkül jeleznie kell, és kontrollvizsgálaton kell részt vennie. Az önkéntes garancia különösen akkor korlátozható, ha a probléma oka:</p>
                <ul>
                  <li>az előírt kontroll vagy szájhigiénés utasítás elmulasztása;</li>
                  <li>külső sérülés, baleset, rendeltetésellenes terhelés vagy nem jelzett fogcsikorgatás;</li>
                  <li>a páciens egészségi állapotának, gyógyszerszedésének vagy dohányzási szokásának olyan változása, amely az eredményt befolyásolja;</li>
                  <li>más szolgáltató által a Szolgáltató előzetes egyeztetése nélkül végzett beavatkozás vagy javítás;</li>
                  <li>természetes elhasználódás vagy a kezeléstől független új megbetegedés.</li>
                </ul>
                <p>E felsorolás nem korlátozza a páciens jogszabályon alapuló igényeit.</p>
              </div>

              <div id="felelosseg" className="scroll-mt-32">
                <h2>8. Felelősség és a weboldal használata</h2>
                <ul>
                  <li>A Szolgáltató felelősségét a hatályos jogszabályok szerint viseli; nem zárható ki a szándékosan okozott, továbbá az emberi életet, testi épséget vagy egészséget megkárosító szerződésszegésért fennálló felelősség.</li>
                  <li>A kezelés eredményét az egyéni biológiai adottságok, az alapbetegségek és a páciens együttműködése is befolyásolhatják; gyógyászati eredmény feltétlen garantálására nincs lehetőség.</li>
                  <li>A weboldal egészségügyi tartalma általános tájékoztatás, nem helyettesíti a személyes vizsgálatot, diagnózist vagy sürgősségi ellátást.</li>
                  <li>A Szolgáltató törekszik a weboldal folyamatos és pontos működésére, de karbantartás, hálózati hiba vagy külső szolgáltató hibája miatt átmeneti kiesés előfordulhat.</li>
                </ul>
              </div>

              <div id="panasz" className="scroll-mt-32">
                <h2>9. Panaszkezelés és jogérvényesítés</h2>
                <p>Panasz személyesen a rendelőben, postai úton a Szolgáltató székhelyén, illetve az <a href="mailto:info@crowndental.hu">info@crowndental.hu</a> e-mail-címen tehető. Kérjük, a panasz tartalmazza a páciens nevét, elérhetőségét, a kifogásolt szolgáltatás leírását és a kért intézkedést.</p>
                <ul>
                  <li>Az egészségügyi ellátással kapcsolatos panaszt a Szolgáltató kivizsgálja, és annak eredményéről a lehető legrövidebb időn belül, de legfeljebb 30 munkanapon belül írásban tájékoztatást ad.</li>
                  <li>A páciens betegjogi képviselő segítségét is kérheti; az aktuális területi képviselő adatai a rendelőben és az Integrált Jogvédelmi Szolgálat felületein érhetők el.</li>
                  <li>Fogyasztói jogvita esetén, a Szolgáltatóval való közvetlen rendezés sikertelensége után a fogyasztó a lakóhelye szerint illetékes békéltető testülethez fordulhat.</li>
                </ul>
                <div className="legal-reset my-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="!m-0 font-bold text-slate-900">A Szolgáltató székhelye szerint illetékes regionális testület:</p>
                  <ul className="mt-3 space-y-1 text-sm sm:text-base">
                    <li><strong>Fejér Vármegyei Békéltető Testület</strong></li>
                    <li>8000 Székesfehérvár, Hosszúsétatér 4–6.</li>
                    <li>Telefon: +36 22 510 310</li>
                    <li>E-mail: <a href="mailto:bekeltetes@fmkik.hu">bekeltetes@fmkik.hu</a></li>
                    <li>Honlap: <a href="https://www.bekeltetesfejer.hu" target="_blank" rel="noreferrer">bekeltetesfejer.hu</a></li>
                  </ul>
                </div>
                <p>A páciens a jogszabályok szerint az illetékes népegészségügyi szervhez, szakmai-etikai fórumhoz vagy bírósághoz is fordulhat. A békéltető testületi eljárás nem érinti a bírói út igénybevételének jogát.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function AszfClient() {
  return (
    <div className="bg-slate-50 min-h-screen selection:bg-sky-200 selection:text-sky-900 font-sans">
      <main>
        <TermsHero />
        <TermsContent />
      </main>
    </div>
  );
}
