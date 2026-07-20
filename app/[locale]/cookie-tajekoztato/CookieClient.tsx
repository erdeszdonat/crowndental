'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Cookie, 
  Info, 
  Settings, 
  List, 
  Trash2, 
  Users, 
  ShieldCheck,
  Fingerprint,
  Globe
} from 'lucide-react';

function CookieHero() {
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
            <Cookie className="w-4 h-4" /> Átlátható Adatkezelés
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Süti (Cookie) <span className="text-sky-400">Tájékoztató</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-3xl mx-auto">
            Hogyan használjuk a sütiket a zökkenőmentes böngészés, a biztonság és a személyre szabott élmény biztosítása érdekében?
          </p>
          <p className="mt-6 text-sm font-medium uppercase tracking-widest text-slate-400">
            Hatályos: 2026. július 20-tól
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CookieContent() {
  const [activeSection, setActiveSection] = useState('mi-az-a-suti');

  const sections = [
    { id: 'mi-az-a-suti', title: '1. Mi az a süti?', icon: <Info className="w-4 h-4" /> },
    { id: 'miert-hasznaljuk', title: '2. Miért használjuk?', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'suti-tipusok', title: '3. Használt típusok', icon: <List className="w-4 h-4" /> },
    { id: 'reszletes-lista', title: '4. Sütik listája', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'harmadik-fel', title: '5. Harmadik felek', icon: <Globe className="w-4 h-4" /> },
    { id: 'sutik-kezelese', title: '6. Kezelés és törlés', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'kapcsolat', title: '7. Kapcsolat', icon: <Users className="w-4 h-4" /> },
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

  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-banner'));
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
              <div id="mi-az-a-suti" className="scroll-mt-32">
                <h2>1. Mi az a süti (cookie)?</h2>
                <p>A süti (cookie) egy kisméretű adatfájl, amelyet a weboldal vagy egy beágyazott szolgáltatás a böngészőben helyezhet el. Hasonló célt szolgálhat a helyi tárhely (localStorage) és a munkamenet-tárhely (sessionStorage) is. Ezek segíthetnek a weboldal működtetésében, a beállítások megjegyzésében, illetve – kizárólag az Ön hozzájárulásával – a forgalom mérésében és a hirdetések eredményességének vizsgálatában.</p>
                <p>Az adatkezelő a <strong>Crown Dental Praxis és Labor Fogászati Kft.</strong> (2500 Esztergom, Petőfi Sándor utca 11.; info@crowndental.hu).</p>
              </div>
              <div id="miert-hasznaljuk" className="scroll-mt-32">
                <h2>2. Miért használunk sütiket?</h2>
                <ul>
                  <li><strong>Alapvető működés:</strong> a sütiválasztás és az adott munkamenethez tartozó űrlapállapot megjegyzéséhez.</li>
                  <li><strong>Statisztika:</strong> annak megértéséhez, hogyan használják a látogatók az oldalt, és mely tartalmak szorulnak fejlesztésre.</li>
                  <li><strong>Marketing:</strong> a Google Ads- és Meta-kampányok eredményességének méréséhez és – ha engedélyezi – relevánsabb hirdetések megjelenítéséhez.</li>
                </ul>
              </div>
              <div id="suti-tipusok" className="scroll-mt-32">
                <h2>3. Az általunk használt sütik típusai</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="!m-0 !text-lg">Feltétlenül szükséges</h3>
                    <p className="!mt-2 text-sm">A weboldal alapfunkcióihoz és a választás megjegyzéséhez kellenek. Ezek hozzájárulás nélkül is használhatók.</p>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <h3 className="!m-0 !text-lg">Statisztikai</h3>
                    <p className="!mt-2 text-sm">Google Analytics mérés. Csak a „Statisztika” kategória engedélyezése után aktiválódik.</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                    <h3 className="!m-0 !text-lg">Marketing</h3>
                    <p className="!mt-2 text-sm">Google Ads és Meta Pixel. Csak a „Marketing” kategória engedélyezése után aktiválódik.</p>
                  </div>
                </div>
              </div>

              <div id="reszletes-lista" className="scroll-mt-32">
                <h2>4. A használt sütik és tárolóelemek listája</h2>
                <p>A szolgáltatók időről időre módosíthatják a technikai elnevezéseket. Az alábbi lista a weboldal jelenlegi beállítását mutatja.</p>
                <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="p-4 font-bold">Név</th>
                        <th className="p-4 font-bold">Szolgáltató / kategória</th>
                        <th className="p-4 font-bold">Cél</th>
                        <th className="p-4 font-bold">Jellemző időtartam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr><td className="p-4 font-mono text-xs">crown_cookie_consent</td><td className="p-4">Crown Dental / szükséges, localStorage</td><td className="p-4">Az elfogadott sütikategóriák megjegyzése.</td><td className="p-4">A böngésző helyi adatainak törléséig.</td></tr>
                      <tr><td className="p-4">Foglalási munkamenet-adatok</td><td className="p-4">Crown Dental / szükséges, sessionStorage</td><td className="p-4">A sikeresen elküldött időpontkérés visszaigazolása.</td><td className="p-4">A böngészőlap munkamenetének végéig.</td></tr>
                      <tr><td className="p-4 font-mono text-xs">_ga, _ga_*</td><td className="p-4">Google Analytics / statisztikai</td><td className="p-4">Látogatások és oldalhasználat megkülönböztetése.</td><td className="p-4">Legfeljebb 2 év.</td></tr>
                      <tr><td className="p-4 font-mono text-xs">_gcl_au, _gcl_aw_*</td><td className="p-4">Google Ads / marketing</td><td className="p-4">Hirdetési konverziók és kampányeredmények mérése.</td><td className="p-4">Jellemzően legfeljebb 90 nap.</td></tr>
                      <tr><td className="p-4 font-mono text-xs">_fbp</td><td className="p-4">Meta / marketing</td><td className="p-4">Kampánymérés és hirdetési hozzárendelés.</td><td className="p-4">Jellemzően legfeljebb 90 nap.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="harmadik-fel" className="scroll-mt-32">
                <h2>5. Harmadik fél szolgáltatók</h2>
                <ul>
                  <li><strong>Google Ireland Limited / Google LLC:</strong> Google Analytics, Google Ads és a helyszínoldalon megjelenő Google Maps-tartalom. A Google saját adatkezelési feltételei is alkalmazandók.</li>
                  <li><strong>Meta Platforms Ireland Limited:</strong> Meta Pixel kampánymérés kizárólag marketing-hozzájárulás esetén.</li>
                </ul>
                <p>A statisztikai és marketingcélú technológiák jogalapja az Ön önkéntes hozzájárulása. A hozzájárulás megtagadása nem akadályozza a weboldal alapvető használatát.</p>
              </div>

              <div id="sutik-kezelese" className="scroll-mt-32">
                <h2>6. A sütik kezelése és törlése</h2>
                <p>Az első látogatáskor a sütisávban elfogadhatja az összes kategóriát, csak a szükséges működést választhatja, vagy külön beállíthatja a statisztikai és marketingcélú használatot. Választását bármikor, a hozzájárulással azonos egyszerűséggel megváltoztathatja.</p>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
                >
                  <Settings className="h-4 w-4" /> Sütibeállítások megnyitása
                </button>
                <p>A sütik a böngésző beállításaiban is törölhetők vagy blokkolhatók. A korábban megadott hozzájárulás visszavonása nem érinti a visszavonás előtti adatkezelés jogszerűségét.</p>
              </div>

              <div id="kapcsolat" className="scroll-mt-32">
                <h2>7. Kapcsolat</h2>
                <div className="legal-reset rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <ul className="space-y-2 text-sm sm:text-base">
                    <li><strong>Crown Dental Praxis és Labor Fogászati Kft.</strong></li>
                    <li>2500 Esztergom, Petőfi Sándor utca 11.</li>
                    <li><a href="mailto:info@crowndental.hu">info@crowndental.hu</a> · <a href="tel:+36705646837">+36 70 564 6837</a></li>
                  </ul>
                </div>
                <p>A személyes adatok kezeléséről, az érintetti jogokról és a jogorvoslatról az <Link href="/adatkezeles">Adatkezelési tájékoztatóban</Link> olvashat részletesen.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function CookieClient() {
  return (
    <div className="bg-slate-50 min-h-screen selection:bg-sky-200 selection:text-sky-900 font-sans">
      <main>
        <CookieHero />
        <CookieContent />
      </main>
    </div>
  );
}
