'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cookie, 
  Info, 
  Settings, 
  List, 
  Trash2, 
  Users, 
  ShieldCheck,
  Fingerprint,
  Globe,
  MapPin,
  Mail,
  Phone
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

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <aside className="w-full lg:w-1/3 xl:w-1/4">
            <div className="sticky top-32 bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-left">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Tartalomjegyzék</h3>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} onClick={(e) => scrollTo(e, section.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeSection === section.id ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:bg-sky-100 hover:text-sky-700'
                    }`}>
                    {section.icon} {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          <main className="w-full lg:w-2/3 xl:w-3/4 text-left">
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-sky-600 prose-a:font-bold hover:prose-a:text-sky-700 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
              <div id="mi-az-a-suti" className="scroll-mt-32">
                <h2>1. Mi az a süti (cookie)?</h2>
                <p>A süti (cookie) egy kisméretű szöveges fájl, amelyet a weboldal az Ön eszközére ment el a látogatása során.</p>
              </div>
              <div id="miert-hasznaljuk" className="scroll-mt-32">
                <h2>2. Miért használunk sütiket?</h2>
                <ul>
                   <li><strong>Alapvető működés:</strong> A weboldal biztonsága és funkciói érdekében.</li>
                   <li><strong>AI Kalkulátor:</strong> Az űrlap állapotának ideiglenes mentéséhez.</li>
                   <li><strong>Analitika:</strong> A látogatói szokások megértéséhez (Google Analytics).</li>
                </ul>
              </div>
              <div id="suti-tipusok" className="scroll-mt-32">
                <h2>3. Az általunk használt sütik típusai</h2>
                <p>Használunk feltétlenül szükséges, funkcionális és statisztikai sütiket is.</p>
              </div>
              {/* Ide másold be a teljes táblázatot és a többi szöveges részt az eredeti fájlból */}
              <div id="kapcsolat" className="scroll-mt-32">
                <h2>7. Kapcsolat</h2>
                <p>Crown Dental Praxis és Labor Fogászati Kft. | info@crowndental.hu</p>
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
