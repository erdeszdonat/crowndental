'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
              {/* Itt kezdődnek a szöveges szakaszok - másold be az eredeti szöveget */}
              <div id="szolgaltato" className="scroll-mt-32">
                <h2>1. A Szolgáltató adatai</h2>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6 not-prose">
                  <ul className="space-y-3 text-slate-700 font-medium">
                    <li><strong className="text-slate-900">Cégnév:</strong> Crown Dentál Praxis és Labor Fogászati Kft.</li>
                    <li><strong className="text-slate-900">Székhely:</strong> 2500 Esztergom, Petőfi S. utca 11.</li>
                  </ul>
                </div>
              </div>
              {/* ... az összes többi szakaszt (2-9) másold be ide az eredeti fájlból ... */}
              <div id="garancia" className="scroll-mt-32">
                 <h2>7. Garanciális feltételek</h2>
                 <p>A Crown Dental magas minőségű anyagokkal dolgozik...</p>
              </div>
              {/* ...stb... */}
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
