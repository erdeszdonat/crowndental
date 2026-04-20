'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Database, 
  Mail, 
  UserCheck, 
  BrainCircuit,
  Lock,
  Scale,
  Book,
  Activity,
  Server,
  MapPin,
  Phone
} from 'lucide-react';

function PrivacyHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-slate-900">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sky-300 text-sm font-bold tracking-widest uppercase mb-6">
            <ShieldCheck className="w-4 h-4" /> GDPR Kompatibilis & Jogilag Hitelesített
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Adatkezelési <span className="text-sky-400">Tájékoztató</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">
            Nálunk nemcsak a mosolya, de a személyes adatai is a legmagasabb szintű védelemben részesülnek. Kérjük, olvassa el részletes tájékoztatónkat.
          </p>
          <p className="text-sm text-slate-400 mt-6 font-medium tracking-widest uppercase">
            Hatályos: 2024. május 01-től visszavonásig
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PrivacyContent() {
  const [activeSection, setActiveSection] = useState('bevezeto');

  const sections = [
    { id: 'bevezeto', title: '1. Bevezető és Adatkezelő', icon: <Database className="w-4 h-4" /> },
    { id: 'fogalmak', title: '2. Fogalmak', icon: <Book className="w-4 h-4" /> },
    { id: 'kezelt-adatok', title: '3. Kezelt adatok és Célok', icon: <Activity className="w-4 h-4" /> },
    { id: 'ai-es-karrier', title: '4. AI Kalkulátor és Karrier', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'hirlevel', title: '5. Hírlevelek és Életút (CRM)', icon: <Mail className="w-4 h-4" /> },
    { id: 'jogok', title: '6. Az Ön jogai', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'panasz', title: '7. Kérelmek és Panaszkezelés', icon: <Scale className="w-4 h-4" /> },
    { id: 'biztonsag', title: '8. Adatbiztonság és Partnerek', icon: <Lock className="w-4 h-4" /> },
    { id: 'jogszabalyok', title: '9. Irányadó Jogszabályok', icon: <Server className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 250;

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
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          <aside className="w-full lg:w-1/3 xl:w-1/4">
            <div className="sticky top-32 bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Tartalomjegyzék</h3>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => scrollTo(e, section.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeSection === section.id 
                        ? 'bg-sky-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-sky-100 hover:text-sky-700'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="w-full lg:w-2/3 xl:w-3/4">
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-sky-600 prose-a:font-bold hover:prose-a:text-sky-700 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 text-left">
              
              <div id="bevezeto" className="scroll-mt-32">
                <p className="lead text-xl text-slate-500 font-medium mb-10">
                  A Crown Dental rendelő magas színvonalú ellátást biztosít az esztétikai fogászat, az implantáció, a fogszabályozás és az általános fogászati kezelések területén. Tevékenységünket a Nemzeti Egészségbiztosítási Alapkezelő által nem finanszírozott – magánellátás keretében – végezzük. Rendelőinkben nemcsak a legmodernebb diagnosztikai, kezelési eljárásokkal és AI technológiákkal kívánjuk garantálni a minőséget, hanem biztosítani szeretnénk a hozzánk forduló Pácienseket arról, hogy adataik a legmagasabb szintű védelemben részesülnek.
                </p>
                <p>
                  A tisztességesség és átláthatóság elve megköveteli, hogy Ön tájékoztatást kapjon az adatok kezelésének körülményeiről. A Tájékoztató rendelkezéseinek kialakításakor különös tekintettel vettük figyelembe a GDPR (Általános Adatvédelmi Rendelet), az Infotv., és az egészségügyi adatok kezelésére vonatkozó speciális ágazati szabályozásokat.
                </p>

                <h2>1. Az Adatkezelő Adatai</h2>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 my-6 not-prose">
                  <ul className="space-y-3 text-slate-700 font-medium">
                    <li><strong className="text-slate-900">Cégnév:</strong> Crown Dentál Praxis és Labor Fogászati Kft.</li>
                    <li><strong className="text-slate-900">Székhely és Rendelő:</strong> 2500 Esztergom, Petőfi Sándor utca 11.</li>
                    <li><strong className="text-slate-900">Budapesti Telephely:</strong> 1039 Budapest, Királyok útja 55.</li>
                    <li><strong className="text-slate-900">Cégjegyzékszám:</strong> 11-09-026431</li>
                    <li><strong className="text-slate-900">Adószám:</strong> 26537353-2-11</li>
                    <li><strong className="text-slate-900">E-mail:</strong> info@crowndental.hu</li>
                    <li><strong className="text-slate-900">Adatvédelmi tisztviselő elérhetősége:</strong> info@crowndental.hu</li>
                  </ul>
                </div>
              </div>

              <div id="fogalmak" className="scroll-mt-32">
                <h2>2. Fogalmak</h2>
                <ul className="space-y-4">
                  <li><strong>Személyes adat:</strong> Bármilyen adat vagy információ, amely alapján egy természetes személy („Érintett”) – közvetett vagy közvetlen módon – azonosíthatóvá válik.</li>
                  <li><strong>Érintett:</strong> Bármely meghatározott, személyes adat alapján azonosított vagy azonosítható természetes személy (Páciensek, érdeklődők, állásra jelentkezők).</li>
                  <li><strong>Egészségügyi adat:</strong> Egy természetes személy testi vagy pszichikai egészségi állapotára vonatkozó személyes adat, ideértve a nyújtott egészségügyi szolgáltatásokra vonatkozó adatokat is.</li>
                  <li><strong>Orvosi titok:</strong> A gyógykezelés során az Adatkezelő tudomására jutott egészségügyi és személyazonosító adat, valamint a gyógykezeléssel kapcsolatban megismert egyéb adat.</li>
                  <li><strong>Adatkezelés:</strong> A személyes adatokon végzett bármely művelet (gyűjtés, rögzítés, rendszerezés, tárolás, lekérdezés, továbbítás, törlés stb.).</li>
                  <li><strong>Adatfeldolgozó:</strong> Az a természetes vagy jogi személy, aki az adatkezelő nevében, annak utasítására személyes adatokat kezel (pl. tárhelyszolgáltatók, AI rendszerek, szoftverek).</li>
                </ul>
              </div>

              <div id="kezelt-adatok" className="scroll-mt-32">
                <h2>3. Milyen adatait kezeljük? (Célok és Jogalapok)</h2>
                <p>
                  A Crown Dental magánrendelőit a Páciensek önként keresik fel. Ha a kezelt személy önként fordul hozzánk, a kezeléssel összefüggő egészségügyi és személyazonosító adatainak kezelésére szolgáló hozzájárulását – ellenkező nyilatkozat hiányában – megadottnak kell tekinteni.
                </p>

                <h3>3.1. Egészségügyi ellátással összefüggő adatok kezelése</h3>
                <ul>
                  <li><strong>Cél:</strong> Az egészség megőrzése, javítása, az eredményes gyógykezelés elősegítése, az egészségi állapot nyomon követése.</li>
                  <li><strong>Jogalap:</strong> Jogi kötelezettség (1997. évi CLIV. törvény az egészségügyről; 1997. évi LXXXIII. törvény).</li>
                  <li><strong>Kezelt adatok:</strong> Név, születési név, TAJ szám (vényköteles gyógyszer esetén), lakcím, születési adatok, diagnózisok, kezelési tervek, röntgen/CT felvételek.</li>
                  <li><strong>Időtartam:</strong> Az adatfelvételtől számított 30 év, zárójelentések esetében 50 év, képalkotó diagnosztikai felvételek esetében 10 év.</li>
                </ul>

                <h3>3.2. Érdeklődés és Bejelentkezés (Időpontfoglalás)</h3>
                <ul>
                  <li><strong>Cél:</strong> Bejelentkezéssel kapcsolatos adatok kezelése weboldalon, telefonon vagy e-mailben történő időpontfoglaláskor.</li>
                  <li><strong>Jogalap:</strong> Szerződéses jogalap (Szerződéskötést megelőző lépés).</li>
                  <li><strong>Kezelt adatok:</strong> Név, telefonszám, e-mail cím, választott ellátás, választott klinika (Esztergom/Budapest).</li>
                  <li><strong>Időtartam:</strong> Adott év pénzügyi zárását követően megsemmisítjük a rögzítéseket, kivéve, ha a páciens bekerül a CRM Életút Rendszerbe.</li>
                </ul>

                <h3>3.3. Számlákkal összefüggő adatok kezelése</h3>
                <ul>
                  <li><strong>Cél:</strong> Pénzügyi elszámolás, bizonylati rend, számlakiállítás.</li>
                  <li><strong>Jogalap:</strong> Jogi kötelezettség (2000. évi C. törvény a Számvitelről).</li>
                  <li><strong>Kezelt adatok:</strong> Név, lakcím, ellátás típusa, végösszeg, esetenként Egészségpénztári azonosító.</li>
                  <li><strong>Időtartam:</strong> A Számviteli törvény előírásai szerint 8 év.</li>
                </ul>
              </div>

              <div id="ai-es-karrier" className="scroll-mt-32">
                <h2>4. Speciális weboldali funkciók adatkezelése</h2>
                
                <div className="bg-sky-50 border-l-4 border-sky-500 p-6 rounded-r-2xl my-6">
                  <h3 className="text-xl font-bold text-sky-900 mt-0">4.1. AI Árajánlat Kalkulátor</h3>
                  <p className="text-sky-800">
                    A Crown Dental Magyarországon egyedülálló módon mesterséges intelligenciát (Google Generative AI - AntiGravity technológia) használ a páciensek által más rendelőkből hozott árajánlatok elemzésére.
                  </p>
                  <ul className="text-sky-800">
                    <li><strong>Cél:</strong> Azonnali, automatizált másodvélemény és Crown Dental árajánlat (PDF) generálása a feltöltött dokumentum alapján.</li>
                    <li><strong>Kezelt adatok:</strong> Név, e-mail cím, telefonszám, és a feltöltött dokumentumban (kép/PDF) szereplő diagnosztikai vagy pénzügyi tételek.</li>
                    <li><strong>Adatfeldolgozás módja:</strong> A feltöltött fájlt a rendszer a Google AI szervereire továbbítja. <strong>Kifejezett garancia:</strong> A Google az így továbbított adatokat saját modelljeinek betanítására (training) NEM használja fel. A fájl a szerver memóriájában csak az elemzés idejére (néhány másodperc) létezik, majd véglegesen megsemmisül. Adatbázisunk (Supabase) csak az elemzés végösszegét és a kapcsolati adatokat tárolja.</li>
                    <li><strong>Jogalap:</strong> Az Érintett kifejezett, önkéntes hozzájárulása az űrlap beküldésével.</li>
                  </ul>
                </div>

                <h3>4.2. Karrier és Állásjelentkezés (HR)</h3>
                <ul>
                  <li><strong>Cél:</strong> A Crown Dental esztergomi és budapesti rendelőibe történő munkaerő-toborzás (orvosok, technikusok, asszisztensek).</li>
                  <li><strong>Kezelt adatok:</strong> Név, e-mail, telefon, tapasztalat, megpályázott pozíció, motivációs üzenet, önéletrajz linkje.</li>
                  <li><strong>Időtartam:</strong> Sikertelen pályázat esetén a kiválasztási folyamat lezárulta után (de legkésőbb 1 év múlva) az adatokat töröljük, kivéve ha az érintett hozzájárul a további tároláshoz.</li>
                </ul>
              </div>

              <div id="hirlevel" className="scroll-mt-32">
                <h2>5. Páciens Életút Rendszer (CRM) és Hírlevelek</h2>
                <p>
                  A Crown Dental célja, hogy a kezelések befejeztével se hagyja magára a pácienseket. Ezt egy magas szinten automatizált Életút Rendszerrel (elektronikus direkt marketing - eDM) valósítjuk meg.
                </p>
                <ul>
                  <li><strong>Jogalap:</strong> Az Ön, mint Páciens önkéntes hozzájárulása (amelyet a webes űrlapok kitöltésével vagy személyesen ad meg).</li>
                  <li><strong>Cél:</strong> A páciens elégedettségének mérése, a kezelés utókövetése, egészségmegőrző edukáció, és személyre szabott ajánlatok küldése.</li>
                </ul>

                <div className="overflow-x-auto my-8 not-prose">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-800 text-white text-sm uppercase tracking-wider">
                        <th className="p-4 rounded-tl-xl font-bold">Levél típusa (Automatizmus)</th>
                        <th className="p-4 font-bold">Kiküldés ideje</th>
                        <th className="p-4 rounded-tr-xl font-bold">Cél / Tartalom</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-slate-50 text-sm">
                      <tr>
                        <td className="p-4 font-bold text-slate-800">Utókövető "Hogy van?" E-mail</td>
                        <td className="p-4">7 nappal a kezelés után</td>
                        <td className="p-4">Közérzet ellenőrzése, panaszkezelés.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-800">Edukációs és Ápolási E-mail</td>
                        <td className="p-4">30-45-90 nappal a kezelés után</td>
                        <td className="p-4">Személyre szabott tanácsok az elvégzett kezeléshez (pl. implantátum tisztítása).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-800">Visszarendelő / Emlékeztető E-mail</td>
                        <td className="p-4">180 és 360 nappal a kezelés után</td>
                        <td className="p-4">Figyelmeztetés a kötelező éves kontrollra vagy fogkő-eltávolításra.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  <strong>Leiratkozás:</strong> Ön bármikor, indokolás nélkül, ingyenesen leiratkozhat a hírlevelekről az e-mailek alján található linkre kattintva.
                </p>
              </div>

              <div id="jogok" className="scroll-mt-32">
                <h2>6. Milyen jogai vannak Önnek?</h2>
                <p>A GDPR alapján az érintett pácienseket az alábbi jogok illetik meg:</p>
                <ul>
                  <li><strong>Hozzáféréshez való jog:</strong> Betekinthet az egészségügyi dokumentációjába, és arról másolatot kérhet.</li>
                  <li><strong>Helyesbítéshez való jog:</strong> Bármikor kérheti a pontatlan adatok javítását.</li>
                  <li><strong>Törléshez való jog:</strong> Kérheti adatai törlését (Kivéve jogi kötelezettség, pl. 30 éves megőrzés esetén).</li>
                  <li><strong>Adatkezelés korlátozásához való jog:</strong> Kérheti az adatkezelés korlátozását a kivizsgálás idejére.</li>
                  <li><strong>Tiltakozáshoz való jog:</strong> Tiltakozhat a közvetlen üzletszerzés (hírlevél) ellen.</li>
                </ul>
              </div>

              <div id="panasz" className="scroll-mt-32">
                <h2>7. Kérelmek és Panaszkezelés</h2>
                <p>
                  Kérelmeit legkésőbb <strong>30 napon belül</strong> írásban megválaszoljuk. Jogsérelem esetén a felügyeleti hatósághoz fordulhat:
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6 not-prose">
                  <p className="font-bold text-slate-900 mb-2">Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</p>
                  <ul className="space-y-1 text-slate-600 text-sm">
                    <li><strong>Cím:</strong> 1055 Budapest, Falk Miksa utca 9-11.</li>
                    <li><strong>Telefon:</strong> +36 (1) 391-1400</li>
                    <li><strong>E-mail:</strong> ugyfelszolgalat@naih.hu</li>
                  </ul>
                </div>
              </div>

              <div id="biztonsag" className="scroll-mt-32">
                <h2>8. Adatbiztonság és Partnerek</h2>
                <p>
                  Informatikai rendszerünket tűzfallal, adatbázisainkat 256-bites titkosítással védjük. Főbb technológiai partnereink:
                </p>
                <ul>
                  <li><strong>Vercel Inc.:</strong> Weboldal hoszting.</li>
                  <li><strong>Supabase Inc.:</strong> Titkosított felhő adatbázis.</li>
                  <li><strong>Resend Inc.:</strong> E-mail kommunikációs infrastruktúra.</li>
                  <li><strong>Google LLC:</strong> AI elemzőmotor és statisztika.</li>
                </ul>
              </div>

              <div id="jogszabalyok" className="scroll-mt-32">
                <h2>9. Irányadó Jogszabályok</h2>
                <ul>
                  <li>Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR)</li>
                  <li>2011. évi CXII. törvény (Infotv.)</li>
                  <li>1997. évi CLIV. tv. az egészségügyről</li>
                  <li>2000. évi C. Törvény a számvitelről</li>
                </ul>
              </div>

            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyClient() {
  return (
    <div className="bg-slate-50 min-h-screen selection:bg-sky-200 selection:text-sky-900 font-sans">
      <main>
        <PrivacyHero />
        <PrivacyContent />
      </main>
    </div>
  );
}
