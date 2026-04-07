'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Building2,
  Sparkles,
  Shield,
  Clock,
  Banknote,
  Stethoscope,
  Microscope,
  Heart,
  ArrowRight,
  Upload,
  Plus,
  Minus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD SEO ADATOK
// ═══════════════════════════════════════════════════════════════════════════
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Implantátum beültetés',
  description: 'Tartós fogpótlás titán implantátummal',
  howPerformed: 'Helyi érzéstelenítésben, ambuláns beavatkozásként',
  procedureType: 'Surgical',
  bodyLocation: 'Állkapocs, fogmeder',
  preparation: 'Panoráma röntgen, CT felvétel, konzultáció',
  followup: '3-6 hónap gyógyulási idő, majd korona felhelyezés',
  status: 'EventScheduled',
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Megegyezik a főoldalival)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center relative h-full py-1 z-50">
            <Image 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              width={280} 
              height={80} 
              className="object-contain h-full w-auto drop-shadow-sm" 
              priority 
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</Link>
            <Link href="/kezelesek" className="font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-full transition-colors">Szolgáltatások & Árak</Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</Link>
            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</Link>
            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</Link>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                <Link href="/blog" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/karrier" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Karrier</Link>
                
                <div className="pt-6 pb-2 border-t border-gray-100 mt-4">
                  <a href="tel:+36705646837" className="flex justify-center items-center gap-2 w-full py-4 bg-gray-50 text-sky-700 font-bold rounded-xl mb-3">
                    <Phone className="w-5 h-5" /> +36 70 564 6837
                  </a>
                  <Link href="/idopont" className="flex justify-center items-center gap-2 w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}>
                    <Calendar className="w-5 h-5" /> Időpont Foglalás
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function ServiceHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-sky-50/50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-6">
              <Stethoscope className="w-4 h-4" /> Prémium Szolgáltatás
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              <span className="text-sky-600">Implantátum</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">
              Tartós megoldás foghiányra – Prémium implantátumok saját laborból, akár 40%-kal kedvezőbb áron.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/idopont" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-600/30">
                <Calendar className="w-5 h-5" /> Ingyenes Konzultáció
              </Link>
              <a href="#arajanlat-elemzo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-700 font-bold rounded-full hover:bg-gray-50 transition-all shadow-sm border border-gray-200">
                <Upload className="w-5 h-5" /> Árajánlat Elemzés
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-sky-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1598256989800-fea5c5ce8720?q=80&w=2070&auto=format&fit=crop" 
                alt="Implantátum beültetés" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            
            {/* Lebegő kártya a képen */}
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">Árak már</div>
                <div className="text-2xl font-extrabold text-gray-900">190.000 Ft<span className="text-lg font-bold text-gray-500">-tól</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROBLÉMA ÉS MEGOLDÁS
// ═══════════════════════════════════════════════════════════════════════════
function ProblemSolution() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <Minus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Probléma: Hiányzó fogak</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Hiányzik egy vagy több foga? A lyukas mosoly nemcsak esztétikai probléma – a szomszédos fogak elmozdulnak, a csont visszahúzódik, az állkapocs deformálódhat. A hagyományos híd pedig a szomszédos, teljesen ép fogak lecsiszolásával jár, ami hosszú távon káros.
            </p>
          </div>

          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(14,165,233,0.1)] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-bl-full -mr-8 -mt-8 z-0" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">A Megoldás: Implantátum</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Az implantátum a természetes foggyökér pótlása titán csavarral. Nem kell hozzá a szomszédos fogakat bántani, és akár egy életen át tarthat. A Crown Dental-nál saját laborunkkal a teljes folyamat egy kézben van, így gyorsabb és <strong>akár 40%-kal olcsóbb</strong>, mint a fővárosban.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELŐNYÖK (Benefits)
// ═══════════════════════════════════════════════════════════════════════════
function Benefits() {
  const benefits = [
    { icon: <Shield className="w-6 h-6" />, title: 'Életre szóló garancia', desc: 'A beültetésre életre szóló, a koronára 5 év garanciát vállalunk. Ha bármi probléma adódik, ingyen javítjuk.' },
    { icon: <Clock className="w-6 h-6" />, title: 'Gyors elkészülés', desc: 'Saját labor = nincs várakozás külső technikusra. A korona 3-5 nap alatt elkészül, nem 2-3 hét alatt.' },
    { icon: <Banknote className="w-6 h-6" />, title: 'Átlátható árazás', desc: 'Nincs rejtett költség. Az első konzultáción pontos árajánlatot kap, ami a kezelés végéig nem változik.' },
    { icon: <Stethoscope className="w-6 h-6" />, title: 'Fájdalommentes', desc: 'Modern érzéstelenítéssel a beavatkozás fájdalommentes. Sok páciensünk szerint kevésbé fáj, mint egy foghúzás.' },
    { icon: <Microscope className="w-6 h-6" />, title: 'Prémium anyagok', desc: 'Kiváló minőségű Alpha Bio és DIO implantátumokkal dolgozunk, hogy a legmagasabb minőséget nyújtsuk.' },
    { icon: <Heart className="w-6 h-6" />, title: '30 év tapasztalat', desc: 'Több ezer sikeres implantációs beavatkozás áll mögöttünk. Pácienseink biztonsága és kényelme a legfontosabb.' },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Miért minket válasszon?</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Az implantáció előnyei</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
                {b.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h4>
              <p className="text-gray-500 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLYAMAT (Process)
// ═══════════════════════════════════════════════════════════════════════════
function ProcessSection() {
  const steps = [
    { step: 1, title: 'Ingyenes konzultáció', desc: 'Panoráma röntgen, 3D CT felvétel, részletes vizsgálat. Megbeszéljük a lehetőségeket és pontos árajánlatot adunk.', time: '30-45 perc' },
    { step: 2, title: 'Implantátum beültetése', desc: 'Helyi érzéstelenítésben beültetjük a titán csavart. A beavatkozás fájdalommentes, utána azonnal hazamehet.', time: '30-60 perc' },
    { step: 3, title: 'Gyógyulási idő', desc: 'Az implantátum stabilan összeforr a csonttal, ami tökéletes alapot biztosít a végleges fogpótlásnak.', time: '3-6 hónap' },
    { step: 4, title: 'Korona készítés', desc: 'Saját laborunkban digitális precizitással elkészítjük a tökéletesen illeszkedő cirkónium vagy porcelán koronát.', time: '3-5 nap' },
    { step: 5, title: 'Korona felhelyezés', desc: 'Rögzítjük a végleges koronát. Innentől úgy használhatja, mintha mindig is az eredeti foga lett volna!', time: '30 perc' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Lépésről Lépésre</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Hogyan zajlik a beültetés?</h3>
          <p className="text-xl text-gray-500">Transzparens és kiszámítható folyamat a tökéletes mosolyig.</p>
        </div>

        <div className="space-y-8">
          {steps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-sky-100 text-sky-600 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm">
                {s.step}.
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex-shrink-0 md:text-right">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium shadow-sm">
                  <Clock className="w-4 h-4 text-sky-500" /> {s.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Beágyazva a CTA helyett)
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-700/40 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6">
              <Sparkles className="w-4 h-4" /> AI Ár-kalkulátor
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sokallja az árajánlatot amit egy <span className="text-sky-400">másik rendelőben kapott?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              Töltse fel a máshol kapott implantációs kezelési tervet. Az AI azonnal megmutatja, <strong>mennyit spórolhat</strong> saját laborunkkal!
            </p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div 
              className={`relative bg-white/5 backdrop-blur-xl border-2 border-dashed rounded-3xl p-10 lg:p-16 text-center transition-all duration-300 ${isDragging ? 'border-sky-400 bg-sky-500/10 scale-105' : 'border-gray-600'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Húzza ide a PDF-et</h3>
              <button className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors">
                Fájl Kiválasztása
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GY.I.K. (Accordion)
// ═══════════════════════════════════════════════════════════════════════════
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: 'Mennyibe kerül egy implantátum?', answer: 'Az Alpha Bio és DIO implantátumok beültetése 190.000 Ft-tól indul. A pontos és végleges árat (felépítménnyel, koronával együtt) a 3D CT felvétel és az ingyenes konzultáció után tudjuk megmondani, mivel minden eset egyedi (pl. szükség van-e csontpótlásra).' },
    { question: 'Fáj az implantátum beültetése?', answer: 'Nem. A beavatkozást a legmodernebb érzéstelenítőkkel végezzük, így teljesen fájdalommentes. A páciensek 90%-a arról számol be, hogy sokkal kevésbé megterhelő, mint egy egyszerű foghúzás. Utána 1-2 napig enyhe duzzanat előfordulhat, amit fájdalomcsillapítóval tökéletesen lehet kezelni.' },
    { question: 'Meddig tart a gyógyulás?', answer: 'Az implantátum és a csont összeforradása (csontosodás) általában 3-6 hónapot vesz igénybe a szervezet biológiai adottságaitól függően.' },
    { question: 'Milyen implantátum márkákkal dolgoznak?', answer: 'Kizárólag világszínvonalú anyagokkal dolgozunk. Az Alpha Bio és DIO implantátumok kiváló minőségű, rendkívül tartós és megbízható prémium megoldások, amelyek kiváló ár-érték arányt képviselnek.' },
    { question: 'Van garancia az implantátumra?', answer: 'Természetesen! Az implantátum anyagára (a titán csavarra) a legtöbb gyártó élettartam garanciát biztosít, az általunk készített prémium koronákra és fogpótlásokra pedig 5 év teljes körű garanciát vállalunk.' },
    { question: 'Miért olcsóbb a Crown Dental, mint más klinikák?', answer: 'Klinikánk legnagyobb előnye a saját, helyben lévő fogtechnikai laboratórium. Mivel a koronákat és felépítményeket mi magunk készítjük, nem kell külsős laborok közvetítői díjait kifizetnie. Ez jelentős megtakarítást, és hetek helyett mindössze néhány napos várakozási időt jelent Önnek!' }
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Tudástár</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Gyakori Kérdések</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:border-sky-300">
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-sky-600 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-lg leading-relaxed border-t border-gray-50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM 2026 FOOTER (Megegyezik a többi oldallal)
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül. Kezelések Esztergomban, és hamarosan Budapesten is.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors">
                <span className="font-bold">f</span>
              </a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors">
                <span className="font-bold">in</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
              <li><Link href="/kezelesek" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>
                  <a href="https://share.google/UV0bxLOGoyQdgH826" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    2500 Esztergom, Petőfi Sándor utca 11.
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold">Budapesti Rendelő</span>
                  <a href="https://maps.google.com/?q=1039+Budapest+Királyok+útja+55" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    1039 Budapest, Királyok útja 55.
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500" />
                <a href="tel:+36705646837" className="hover:text-white transition-colors">+36 70 564 6837</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sky-500" />
                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors">info@crowndental.hu</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>
            <ul className="space-y-4">
              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors">Általános Szerződési Feltételek</Link></li>
              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors">Adatkezelési Tájékoztató (GDPR)</Link></li>
              <li><Link href="/impresszum" className="text-gray-400 hover:text-white transition-colors">Impresszum</Link></li>
              <li><Link href="/cookie-tajekoztato" className="text-gray-400 hover:text-white transition-colors">Sütik (Cookie) kezelése</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
          <p className="flex items-center gap-2">
            Készítette: 
            <span 
              className="text-white text-2xl tracking-wider ml-1" 
              style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}
            >
              Crown Dental
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALOLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function ImplantatumPage() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      {/* Csendes JSON-LD a SEO-nak */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <main>
        <ServiceHero />
        <ProblemSolution />
        <Benefits />
        <ProcessSection />
        <QuoteAnalyzerSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
