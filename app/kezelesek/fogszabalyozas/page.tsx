'use client';

import React, { useState } from 'react';
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
  Sparkles,
  Shield,
  Clock,
  Banknote,
  Heart,
  ArrowRight,
  Plus,
  Minus,
  Smile,
  CheckCircle2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD SEO ADATOK - Fogszabályozás specifikus
// ═══════════════════════════════════════════════════════════════════════════
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogszabályozás',
  description: 'Esztétikus és egészséges fogsor kialakítása rögzített és láthatatlan készülékekkel.',
  howPerformed: 'Személyre szabott készülékekkel, rendszeres aktiválással',
  procedureType: 'Orthodontic',
  bodyLocation: 'Fogak, állkapocs',
  preparation: 'Digitális lenyomatvétel, panoráma röntgen, fotódokumentáció',
  followup: 'Havi kontroll, majd retenciós készülék viselése',
  status: 'EventScheduled',
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center relative h-full py-1 z-50">
            <Image src="/logo.webp" alt="Crown Dental Logo" width={280} height={80} className="object-contain h-full w-auto" priority />
          </Link>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</Link>
            <Link href="/kezelesek" className="font-bold text-violet-600 bg-violet-50 px-4 py-2 rounded-full transition-colors">Szolgáltatások & Árak</Link>
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
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-violet-50/50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-violet-600 text-sm font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" /> Esztétikus és egészséges fogsor
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Fogszabályozás <span className="text-violet-600">Crown Dental</span> módra
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">
              Modern fogszabályozási megoldások gyermekeknek és felnőtteknek. Szabályos fogsor, magabiztos mosoly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/idopont" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold rounded-full hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-600/30">
                <Calendar className="w-5 h-5" /> Szakorvosi Konzultáció
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-violet-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop" alt="Fogszabályozás" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">Készülékek</div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Probléma: Torlódott fogak</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              A kusza, torlódott fogazat nemcsak önbizalomhiányt okoz, de egészségügyi kockázat is. A nehezen tisztítható résekben könnyebben megtelepszik a lepedék, ami fogszuvasodáshoz, ínygyulladáshoz és a fogak korai elvesztéséhez vezethet.
            </p>
          </div>
          <div className="p-8 md:p-10 bg-violet-50 rounded-3xl border border-violet-100 shadow-[0_8px_30px_rgb(139,92,246,0.1)]">
            <div className="w-14 h-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Megoldás: Szabályozás</h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              A fogszabályozás segít a fogak ideális pozícióba terelésében. Nemcsak esztétikai javulást hoz, hanem helyreállítja a rágófunkciót és megkönnyíti a szájhigiéniát. Legyen szó fém, kerámia vagy láthatatlan készülékről, nálunk megtalálja a megoldást.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELŐNYÖK
// ═══════════════════════════════════════════════════════════════════════════
function Benefits() {
  const benefits = [
    { icon: <Shield className="w-6 h-6" />, title: 'Széles választék', desc: 'A hagyományos fém készülékektől az esztétikus zafír kristályos és láthatatlan sínekig minden megoldást kínálunk.' },
    { icon: <Smile className="w-6 h-6" />, title: 'Minden korosztálynak', desc: 'Gyermekkorban a fejlődés irányítása, felnőttkorban a már rögzült hibák korrigálása a cél. Sosem késő elkezdeni!' },
    { icon: <Banknote className="w-6 h-6" />, title: 'Részletfizetési lehetőség', desc: 'Tudjuk, hogy a fogszabályozás befektetés. Rugalmas fizetési konstrukciókkal segítünk a költségek ütemezésében.' },
    { icon: <Clock className="w-6 h-6" />, title: 'Saját labor háttér', desc: 'Saját fogtechnikai laborunkban készítjük a kivehető készülékeket és síneket, így garantáljuk a gyorsaságot.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Arc-esztétikai szemlélet', desc: 'Nemcsak fogakat mozgatunk, hanem az arc harmonikus megjelenését is szem előtt tartjuk a kezelés során.' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'Modern technológia', desc: 'Digitális tervezéssel és modern anyagokkal rövidítjük le a kezelési időt a lehető legkényelmesebb módon.' },
  ];
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-violet-600 font-bold uppercase tracking-widest mb-3">Miért a Crown Dental?</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">A tökéletes mosoly titka</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6">{b.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h4>
              <p className="text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLYAMAT
// ═══════════════════════════════════════════════════════════════════════════
function ProcessSection() {
  const steps = [
    { step: 1, title: 'Konzultáció és Diagnosztika', desc: 'Átfogó vizsgálat, panoráma röntgen és digitális lenyomatvétel alapján felmérjük a fogsor állapotát.', time: '45 perc' },
    { step: 2, title: 'Kezelési terv', desc: 'Látványtervvel bemutatjuk a várható eredményt, megbeszéljük a készülék típusát és a kezelés időtartamát.', time: '1 hét' },
    { step: 3, title: 'Készülék felhelyezése', desc: 'Precíz és fájdalommentes felhelyezés, ahol megtanítjuk a készülék viselését és tisztítását.', time: '60-90 perc' },
    { step: 4, title: 'Aktiválás és kontroll', desc: 'Rendszeres (általában havi) kontrollok során állítunk a készüléken, hogy a fogak a megfelelő irányba mozduljanak.', time: '12-24 hónap' },
    { step: 5, title: 'Retenció', desc: 'A rögzített készülék levétele után egy vékony sínnel fixáljuk az eredményt, hogy a mosolya örökre ilyen maradjon.', time: 'Folyamatos' },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-violet-600 font-bold uppercase tracking-widest mb-3">A folyamat</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Út a szabályos mosolyig</h3>
        </div>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-violet-100 text-violet-600 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm">{s.step}.</div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex-shrink-0 md:text-right">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium shadow-sm">
                  <Clock className="w-4 h-4 text-violet-500" /> {s.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMÁLT IDŐPONTFOGLALÁS CTA
// ═══════════════════════════════════════════════════════════════════════════
function AppointmentCTASection() {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Dekoratív blur háttér */}
      <div className="absolute inset-0 bg-violet-50/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-200/40 rounded-full blur-[100px]" />
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Lebegő, pulzáló kártya */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-violet-600/20 border border-white/10 relative overflow-hidden"
          >
            {/* Inner glow/shine */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-8 border border-white/20 shadow-inner">
              <Calendar className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Készen áll a <span className="text-violet-200">tökéletes mosolyra?</span>
            </h2>
            
            <p className="text-lg md:text-xl text-violet-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Ne halogassa tovább! Kérjen időpontot szakorvosi konzultációra, ahol részletesen átbeszéljük a lehetőségeit és megtervezzük a személyre szabott kezelését.
            </p>
            
            <Link href="/idopont" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-violet-700 font-extrabold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 group">
              <span className="text-lg">Időpontot foglalok</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GYIK
// ═══════════════════════════════════════════════════════════════════════════
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { question: 'Fájdalmas a fogszabályozás?', answer: 'Maga a felhelyezés nem fájdalmas. Az aktiválásokat követő 2-3 napban enyhe feszítő érzés jelentkezhet, ami teljesen természetes, hiszen a fogak mozgásban vannak.' },
    { question: 'Felnőttként is belekezdhetek?', answer: 'Természetesen! Manapság a pácienseink közel fele felnőtt. Nekik különösen ajánljuk az esztétikus kerámia vagy a szinte láthatatlan sínrendszerű megoldásainkat.' },
    { question: 'Mennyi ideig tart a kezelés?', answer: 'Ettől függ a probléma súlyossága, de általában 1.5 - 2 év. Kisebb esztétikai korrekciók akár 6-10 hónap alatt is elvégezhetőek.' },
    { question: 'Hogyan kell tisztítani a készüléket?', answer: 'A rögzített készülékhez speciális fogkefét és fogköztisztítót javasolunk, aminek használatát a felhelyezéskor alaposan megmutatjuk.' },
  ];
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-violet-600 font-bold text-4xl mb-4">Gyakori Kérdések</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-violet-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 text-lg border-t border-gray-50 pt-4">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white inline-block p-2 rounded-xl mb-6">
          <Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" />
        </div>
        <p className="max-w-xl mx-auto mb-8 text-gray-400">Esztétikus és funkcionális fogszabályozás minden korosztálynak saját fogtechnikai háttérrel.</p>
        <div className="pt-8 border-t border-gray-800 text-sm">© 2026 Crown Dental Praxis és Labor Kft.</div>
      </div>
    </footer>
  );
}

export default function FogszabalyozasPage() {
  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main>
        <ServiceHero />
        <ProblemSolution />
        <Benefits />
        <ProcessSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
