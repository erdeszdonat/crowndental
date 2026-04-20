'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Server, 
  Copyright, 
  ShieldAlert, 
  Scale, 
  Info,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

function ImpresszumHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-500/20 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3" />
      <div className="relative z-10 container mx-auto px-4 text-center text-left">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sky-300 text-sm font-bold tracking-widest uppercase mb-6">
            <Info className="w-4 h-4" /> Céginformációk
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            <span className="text-sky-400">Impresszum</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-3xl mx-auto">
            A weboldal üzemeltetőjének hivatalos adatai, a tárhelyszolgáltató információi és szerzői jogi nyilatkozata.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ImpresszumContent() {
  const [activeSection, setActiveSection] = useState('szolgaltato');
  const sections = [
    { id: 'szolgaltato', title: '1. Üzemeltető adatai', icon: <Building2 className="w-4 h-4" /> },
    { id: 'tarhely', title: '2. Tárhelyszolgáltató', icon: <Server className="w-4 h-4" /> },
    { id: 'szerzoi-jogok', title: '3. Szerzői jogok', icon: <Copyright className="w-4 h-4" /> },
    { id: 'felelosseg', title: '4. Jogi nyilatkozat', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'jogvita', title: '5. Vitarendezés', icon: <Scale className="w-4 h-4" /> },
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
              <div id="szolgaltato" className="scroll-mt-32">
                <h2>1. A weboldal üzemeltetője (Szolgáltató)</h2>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 my-6 not-prose shadow-sm">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cégnév</p><p className="text-lg font-bold text-slate-900">Crown Dental Praxis és Labor Fogászati Kft.</p></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Székhely</p><p className="text-base text-slate-700 flex items-start gap-2"><MapPin className="w-5 h-5 text-sky-500" /> 2500 Esztergom, Petőfi Sándor utca 11.</p></div>
                    </div>
                    <div className="space-y-4 sm:border-l sm:border-slate-200 sm:pl-6">
                      <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Adószám</p><p className="text-base font-mono text-slate-700">26537353-2-11</p></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Elérhetőség</p><p className="text-base text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-sky-500" /> info@crowndental.hu</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="tarhely" className="scroll-mt-32">
                <h2>2. Tárhelyszolgáltató</h2>
                <p>Weboldalunkat a <strong>Vercel Inc.</strong> (USA) felhő alapú infrastruktúrája szolgálja ki.</p>
              </div>
              <div id="szerzoi-jogok" className="scroll-mt-32">
                <h2>3. Szerzői jogok</h2>
                <p>A weboldalon található tartalom a Crown Dental kizárólagos szellemi tulajdona.</p>
              </div>
              <div id="felelosseg" className="scroll-mt-32">
                <h2>4. Jogi nyilatkozat</h2>
                <p>A weboldalon megjelenő információk kizárólag általános tájékoztató jellegűek, nem minősülnek orvosi tanácsadásnak.</p>
              </div>
              <div id="jogvita" className="scroll-mt-32">
                <h2>5. Békéltető testület</h2>
                <p>Komárom-Esztergom Megyei Békéltető Testület: 2800 Tatabánya, Fő tér 36.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function ImpresszumClient() {
  return (
    <div className="bg-slate-50 min-h-screen selection:bg-sky-200 selection:text-sky-900 font-sans">
      <main>
        <ImpresszumHero />
        <ImpresszumContent />
      </main>
    </div>
  );
}
