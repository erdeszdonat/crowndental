'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  MapPin, Phone, Mail, Calendar, Menu, X, ChevronRight, ChevronDown,
  Sparkles, Shield, Clock, Heart, ArrowRight, Plus, Minus, Crown, Gem, Layers
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SANITY KLIENS
// ═══════════════════════════════════════════════════════════════════════════
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD SEO ADATOK
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Fogkoronák és hidak – Esztétikus fogpótlás megoldások | Crown Dental";
const seoDescription = "Tartós és esztétikus koronák, hidak foghiány esetén. Konzultáció, egyedi kezelési terv az esztergomi Crown Dental rendelőben.";

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogkoronák és hidak',
  description: seoDescription,
  howPerformed: 'Helyi érzéstelenítésben történő fog-előkészítés, digitális vagy precíziós lenyomatvétel, laboratóriumi kidolgozás és rögzítés.',
  procedureType: 'Prosthodontic',
  bodyLocation: 'Fogak',
  preparation: 'Állapotfelmérés, panoráma röntgen, fog előkészítése (csiszolás)',
  followup: 'Rendszeres éves fogászati kontroll és megfelelő szájhigiénia.',
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
          <a href="/" className="flex items-center relative h-full py-1 z-50">
            <img src="/logo.webp" alt="Crown Dental Logo" className="object-contain h-12 w-auto" />
          </a>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</a>
            <a href="/kezelesek" className="font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-full transition-colors">Szolgáltatások & Árak</a>
            <a href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</a>
            <a href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</a>
            <a href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</a>
          </div>
          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <a href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </a>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobil menü */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-4 font-bold shadow-2xl absolute w-full left-0">
              <a href="/" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Főoldal</a>
              <a href="/kezelesek" className="px-4 py-2 text-sky-600 bg-sky-50 rounded-xl">Szolgáltatások & Árak</a>
              <a href="/rolunk" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Rólunk</a>
              <a href="/blog" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Blog</a>
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
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?q=80&w=2070&auto=format&fit=crop");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "koronak-hidak"][0]{"url": heroImage.asset->url}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) {
        console.error("Sanity kép lekérési hiba:", error);
      }
    };
    fetchImage();
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-sky-50/50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-6">
              <Crown className="w-4 h-4" /> Saját fogtechnikai labor
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Cirkónium és <br/> <span className="text-sky-600">Kerámia Koronák</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">
              Tartós és esztétikus koronák, hidak foghiány esetén. Saját laborunknak köszönhetően villámgyorsan, kompromisszumok nélkül.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/idopont" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-600/30">
                <Calendar className="w-5 h-5" /> Konzultációt Kérek
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-sky-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3]">
              <img src={imageUrl} alt="Cirkónium és Fémkerámia Koronák" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Gem className="w-6 h-6" />
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">Prémium Koronák</div>
                <div className="text-2xl font-extrabold text-gray-900">42.000 Ft<span className="text-lg font-bold text-gray-500">-tól</span></div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Probléma: Sérült vagy hiányzó fogak</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              A nagymértékben szuvasodott, gyökérkezelt vagy letört fogak szerkezete meggyengül, ami további törésekhez vezethet. A hiányzó fogak pedig nemcsak esztétikailag zavaróak, de nehezítik a rágást és a szomszédos fogak bedőlését, elvándorlását okozhatják.
            </p>
          </div>
          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(2,132,199,0.1)]">
            <div className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Megoldás: Koronák és Hidak</h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              A <strong>korona</strong> egy esztétikus, védő „sapka”, ami megmenti és megerősíti a sérült fogat. A <strong>híd</strong> pedig a hiányzó fogakat pótolja a szomszédos fogak pillérként való használatával. Saját laborunk modern CAD/CAM technológiával készíti el a fémkerámia vagy tökéletesen élethű, fémmentes cirkónium pótlást.
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
    { icon: <Clock className="w-6 h-6" />, title: 'Kész akár 3-5 nap alatt', desc: 'Mivel a fogtechnikai laboratóriumunk helyben van, a koronákat és hidakat a szokásos hetek helyett napok alatt elkészítjük.' },
    { icon: <Layers className="w-6 h-6" />, title: 'Cirkónium: 100% fémmentes', desc: 'A modern cirkónium koronák tökéletesen antiallergének, áttetszőségük a természetes fogakéval azonos.' },
    { icon: <Shield className="w-6 h-6" />, title: '5 Év Garancia', desc: 'A nálunk készült fix fogpótlásokra 5 év teljes körű garanciát vállalunk, mert hiszünk a minőségi munkában.' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'Digitális Precizitás', desc: 'A pótlásokat számítógépes CAD/CAM rendszerrel tervezzük, mikronos pontosságú illeszkedést biztosítva.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Nincs fájdalom', desc: 'A fogak előkészítése modern, mélyreható érzéstelenítésben történik, így garantáltan semmit sem fog érezni.' },
    { icon: <Crown className="w-6 h-6" />, title: 'Ideiglenes korona azonnal', desc: 'Nálunk egyetlen percig sem kell fogak nélkül maradnia. A lecsiszolt fogakra azonnal ideiglenes védőkoronát készítünk.' },
  ];
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Miért a Crown Dental?</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">A tartós és esztétikus fogpótlás titka</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">{b.icon}</div>
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
    { step: 1, title: 'Konzultáció és Tervezés', desc: 'Panoráma röntgen segítségével felmérjük a fogak állapotát. Kezelési tervet és pontos árajánlatot adunk.', time: '30 perc' },
    { step: 2, title: 'Fogak Előkészítése (Csiszolás)', desc: 'Helyi érzéstelenítésben, fájdalommentesen alakítjuk ki a fogak formáját, hogy a korona tökéletesen illeszkedjen.', time: '60-90 perc' },
    { step: 3, title: 'Lenyomatvétel és Ideiglenes Korona', desc: 'Precíz lenyomatot veszünk a labor számára, Ön pedig egy esztétikus ideiglenes koronával távozik a rendelőből.', time: '30 perc' },
    { step: 4, title: 'Saját Laboratóriumi Gyártás', desc: 'Helyi technikusaink megtervezik és kifaragják a végleges cirkónium vagy fémkerámia pótlást. Szükség esetén vázpróbát tartunk.', time: '3-5 nap' },
    { step: 5, title: 'Átadás és Rögzítés', desc: 'A kész koronát bepróbáljuk. Ha színe és formája mind Önnek, mind az orvosnak tökéletes, véglegesen felragasztjuk.', time: '30-45 perc' },
  ];
  
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">A folyamat</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Lépésről lépésre a tökéletes mosolyig</h3>
        </div>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center">
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
      <div className="absolute inset-0 bg-sky-50/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[100px]" />
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-sky-600/20 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-8 border border-white/20 shadow-inner">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">Egyeztessen időpontot <span className="text-sky-200">még ma!</span></h2>
            <p className="text-lg md:text-xl text-sky-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Jöjjön el egy állapotfelmérésre, és tudja meg, melyik fogpótlási megoldás lenne a legideálisabb az Ön számára.
            </p>
            <a href="/idopont" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 group">
              <span className="text-lg">Konzultációt Kérek</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
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
    { question: 'Fémkerámia vagy Cirkónium koronát válasszak?', answer: 'A cirkónium teljesen fémmentes, fényáteresztő képessége megegyezik a természetes fogéval, ezért a frontfogaknál mindenképp ezt javasoljuk. A fémkerámia olcsóbb, rendkívül erős, így a hátsó, rágó zónában ma is kiváló alternatíva.' },
    { question: 'Fájdalmas a fog csiszolása?', answer: 'Egyáltalán nem. A teljes beavatkozást helyi érzéstelenítésben végezzük, így Ön semmit sem fog érezni a csiszolás során.' },
    { question: 'Lesz fogam, amíg elkészül a végleges pótlás?', answer: 'Igen! Ahogy lecsiszoljuk a fogat, azonnal készítünk rá egy esztétikus műanyag ideiglenes koronát a rendelőben, így Ön nem fog hiányzó foggal vagy lecsiszolt csonkkal távozni.' },
    { question: 'Mennyi ideig bírja egy korona?', answer: 'Megfelelő szájhigiénia és rendszeres éves fogorvosi kontroll mellett a nálunk készült koronák és hidak 10-15 évig, de akár élethosszig is tökéletesen szolgálhatnak.' },
  ];
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold text-4xl mb-4">Gyakori Kérdések</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-sky-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="px-6 pb-6 text-gray-600 text-lg border-t border-gray-50 pt-4">{faq.answer}</div>
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
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <img src="/logo.webp" alt="Crown Dental Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül. Kezelések Esztergomban, és hamarosan Budapesten is.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><a href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</a></li>
              <li><a href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</a></li>
              <li><a href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</a></li>
              <li><a href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</a></li>
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
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500" />
                <a href="tel:+36705646837" className="hover:text-white transition-colors">+36 70 564 6837</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
}

export default function KoronakHidakPage() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
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
