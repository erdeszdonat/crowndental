'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Menu,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Mail,
  Search,
  Stethoscope,
  Crown,
  Scissors,
  Baby,
  Activity
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA ADATOK
// ═══════════════════════════════════════════════════════════════════════════
const priceCategories = [
  {
    id: 'diagnosztika',
    title: 'Diagnosztika és Alapkezelések',
    icon: <Search className="w-8 h-8" />,
    color: 'sky',
    items: [
      { name: 'Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv', price: '10.000 Ft', link: '/kezelesek/allapotfelmeres' },
      { name: 'Tömések', price: '30.000 - 35.000 Ft', link: '/kezelesek/tomes' },
      { name: 'Foghúzás', price: '25.000 - 35.000 Ft', link: '/kezelesek/foghuzas' },
      { name: 'Röntgen felvétel (kisröntgen / egy fogról)', price: '5.000 Ft' },
      { name: 'Panoráma röntgen', price: '6.000 Ft' },
    ],
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    icon: <Activity className="w-8 h-8" />,
    color: 'teal',
    items: [
      { name: 'Gyökértömés (Egy gyökerű)', price: '25.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés (Két gyökerű)', price: '30.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés (Három gyökerű)', price: '33.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés eltávolítása', price: '20.000 Ft' },
      { name: 'Gyökérkezelés alkalmanként', price: '10.000 Ft' },
    ],
  },
  {
    id: 'esztetika',
    title: 'Fogmegőrzés és Esztétika',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'violet',
    items: [
      { name: 'Fogkőeltávolítás (állcsontonként)', price: '15.000 Ft', link: '/kezelesek/fogko-eltavolitas' },
      { name: 'Fogfehérítés szilikon sínnel (otthoni) / fogívenként', price: '30.000 Ft', link: '/kezelesek/fogfeherites' },
      { name: 'Fogfehérítés rendelői (lámpás) / fogívenként', price: '45.000 Ft', link: '/kezelesek/fogfeherites', highlight: true },
    ],
  },
  {
    id: 'fogpotlas',
    title: 'Fogpótlások és Koronák',
    icon: <Crown className="w-8 h-8" />,
    color: 'amber',
    items: [
      { name: 'Ideiglenes korona (rövidtávú, 1-2 hétre)', price: '6.000 Ft' },
      { name: 'Ideiglenes korona (hosszútávú, max. 1 évre)', price: '15.000 Ft' },
      { name: 'Fémkerámia korona', price: '42.000 Ft', link: '/kezelesek/koronak-hidak' },
      { name: 'Cirkónium korona (fémmentes)', price: '55.000 Ft', link: '/kezelesek/koronak-hidak', highlight: true },
      { name: 'Egyéni fogszínek készítése (foganként)', price: '15.000 Ft' },
      { name: 'Kivehető fogsor egy állcsontra (kompozit)', price: '110.000 Ft', link: '/kezelesek/fogsor' },
      { name: 'Fémlemezes fogsor egy állcsontra', price: '150.000 Ft', link: '/kezelesek/fogsor' },
      { name: 'Régi híd eltávolítása (pillér foganként)', price: '12.000 Ft' },
      { name: 'Fogsor alábélelés', price: '25.000 Ft' },
    ],
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet és Implantáció',
    icon: <Shield className="w-8 h-8" />,
    color: 'rose',
    items: [
      { name: 'Foghúzás műtéttel', price: '55.000 Ft', link: '/kezelesek/foghuzas' },
      { name: 'Bölcsességfog eltávolítása', price: '55.000 Ft', link: '/kezelesek/szajsebeszet' },
      { name: 'Gyökércsúcs rezekció', price: '55.000 Ft', link: '/kezelesek/szajsebeszet' },
      { name: 'DIO Implantátum', price: '240.000 Ft', link: '/kezelesek/implantatum', highlight: true },
      { name: 'ALPHA BIO Implantátum', price: '180.000 Ft', link: '/kezelesek/implantatum' },
      { name: 'Csontpótlás', price: '190.000 Ft', link: '/kezelesek/implantatum' },
    ],
  },
  {
    id: 'gyermek',
    title: 'Gyermekfogászat és Fogszabályozás',
    icon: <Baby className="w-8 h-8" />,
    color: 'fuchsia',
    items: [
      { name: 'Tömés tejfogakba', price: '15.000 Ft', link: '/kezelesek/gyerekfogaszat' },
      { name: 'Barázda zárás', price: '15.000 Ft' },
      { name: 'Rögzített készülékek', price: '190.000 - 285.000 Ft', link: '/kezelesek/fogszabalyozas', highlight: true },
      { name: 'Kivehető készülékek', price: '60.000 - 90.000 Ft', link: '/kezelesek/fogszabalyozas' },
      { name: 'Rögzített készülék aktiválása', price: '10.000 - 15.000 Ft' },
      { name: 'Kivehető készülék aktiválása', price: '5.000 - 8.000 Ft' },
    ],
  },
];

// Prémium szín mapping (világos témához igazítva)
const colorClasses: Record<string, { text: string; bgLight: string; border: string; borderHighlight: string }> = {
  sky: { text: 'text-sky-600', bgLight: 'bg-sky-50', border: 'border-sky-100', borderHighlight: 'border-sky-200' },
  teal: { text: 'text-teal-600', bgLight: 'bg-teal-50', border: 'border-teal-100', borderHighlight: 'border-teal-200' },
  violet: { text: 'text-violet-600', bgLight: 'bg-violet-50', border: 'border-violet-100', borderHighlight: 'border-violet-200' },
  amber: { text: 'text-amber-600', bgLight: 'bg-amber-50', border: 'border-amber-100', borderHighlight: 'border-amber-200' },
  rose: { text: 'text-rose-600', bgLight: 'bg-rose-50', border: 'border-rose-100', borderHighlight: 'border-rose-200' },
  fuchsia: { text: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50', border: 'border-fuchsia-100', borderHighlight: 'border-fuchsia-200' },
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Aktív "Szolgáltatások" menüponttal, külön Árlista gomb nélkül)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Implantátumok', href: '/kezelesek/implantatum' },
    { name: 'Fogszabályozás', href: '/kezelesek/fogszabalyozas' },
    { name: 'Koronák és Hidak', href: '/kezelesek/koronak-hidak' },
    { name: 'Fogfehérítés', href: '/kezelesek/fogfeherites' },
    { name: 'Fogsorok', href: '/kezelesek/fogsor' },
    { name: 'Gyökérkezelés', href: '/kezelesek/gyokerkezeles' },
    { name: 'Szájsebészet', href: '/kezelesek/szajsebeszet' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-white border-b border-gray-100 py-2'}`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image src="/logo.webp" alt="Crown Dental Logo" width={240} height={70} className="object-contain h-14 w-auto drop-shadow-sm" priority />
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/" className="px-3 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors">
              Főoldal
            </Link>
            
            <div className="relative group">
              {/* VILÁGÍTÓ AKTÍV MENÜPONT */}
              <button
                className="flex items-center gap-1 px-4 py-2 font-bold text-sky-600 bg-sky-50 rounded-full transition-colors"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                Szolgáltatások és Árak <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-72 bg-white shadow-2xl rounded-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    {services.map((service) => (
                      <Link key={service.name} href={service.href} className="block px-6 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:pl-8 transition-all font-medium">
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/rolunk" className="px-3 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors">
              Rólunk
            </Link>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <div className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl">Szolgáltatások és Árak</div>
                <div className="pl-4 border-l-2 border-sky-100 ml-6 space-y-1 my-2">
                  {services.map((s) => (
                    <Link key={s.name} href={s.href} className="block px-4 py-2 text-gray-600 hover:text-sky-600 text-sm font-medium" onClick={() => setIsOpen(false)}>
                      • {s.name}
                    </Link>
                  ))}
                </div>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                
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
// HERO SECTION (Belső oldalra szabva, elegáns és letisztult)
// ═══════════════════════════════════════════════════════════════════════════
function InnerHero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50">
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-sky-50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-6"
          >
            <Building2 className="w-4 h-4" />
            Saját labor = Kedvezőbb árak
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Kezeléseink és <span className="text-sky-600">Árlistánk</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transzparens árazás, rejtett költségek nélkül. Saját fogtechnikai laborunknak köszönhetően <strong>akár 40%-kal kedvezőbb</strong> árakat biztosítunk a fővárosi rendelőkhöz képest.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KATEGÓRIA KÁRTYA (Étlap dizájn, lenyitható harmonika)
// ═══════════════════════════════════════════════════════════════════════════
function CategoryCard({ category, index }: { category: typeof priceCategories[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const colors = colorClasses[category.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md ring-1 ring-gray-100/50' : 'hover:shadow-md hover:border-gray-200'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 ${colors.bgLight} rounded-2xl flex items-center justify-center ${colors.text} transition-transform duration-300 ${isOpen ? 'scale-110' : ''}`}>
            {category.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{category.title}</h2>
            <p className="text-sm text-gray-500 font-medium">{category.items.length} szolgáltatás</p>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-sky-50 text-sky-600' : ''}`}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="px-6 md:px-8 pb-8 pt-4 space-y-2">
              {category.items.map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col sm:flex-row sm:items-end justify-between p-4 rounded-2xl transition-colors group ${
                    item.highlight ? `${colors.bgLight} border ${colors.borderHighlight}` : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex-1 pr-4 mb-2 sm:mb-0">
                    {item.link ? (
                      <Link href={item.link} className={`inline-flex items-center font-semibold text-lg transition-colors ${item.highlight ? 'text-gray-900' : 'text-gray-800 group-hover:text-sky-600'}`}>
                        {item.name}
                        <ArrowRight className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 ${item.highlight ? colors.text : 'text-gray-400'}`} />
                      </Link>
                    ) : (
                      <span className={`font-semibold text-lg ${item.highlight ? 'text-gray-900' : 'text-gray-800'}`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Pontozott vonal (Étlap stílus) asztali nézeten */}
                  <div className="hidden sm:block flex-1 border-b-2 border-dotted border-gray-200 mb-2 mx-4 opacity-50 group-hover:border-sky-200 transition-colors"></div>
                  
                  <div className={`text-xl font-extrabold whitespace-nowrap ${item.highlight ? colors.text : 'text-gray-900'}`}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA KONTÉNER SECTION
// ═══════════════════════════════════════════════════════════════════════════
function PriceListSection() {
  return (
    <section className="pb-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {priceCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Információs doboz */}
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-sky-50 rounded-2xl border border-sky-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0 mt-1">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">Fontos Tájékoztató</h4>
            <p className="text-gray-600 leading-relaxed">
              Az árak tájékoztató jellegűek. Mivel minden fogazat egyedi, a végleges árat minden esetben egy alapos személyes vizsgálat, 
              és egy írásos, részletes kezelési terv átadása után határozzuk meg. <strong>Az első konzultáció ingyenes!</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Egyezik a főoldalival)
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 bg-sky-900/20" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6">
              <Sparkles className="w-4 h-4" /> AI Ár-kalkulátor
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sokallja a pesti árajánlatot? <br/><span className="text-sky-400">Mutassa meg nekünk!</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              Töltse fel a máshol kapott kezelési tervet. Az AI azonnal megmutatja, <strong>mennyit spórolhat</strong> saját laborunkkal.
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
// CTA SECTION (Elegáns alsó sáv)
// ═══════════════════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="py-20 bg-sky-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Kérdése van az árakkal kapcsolatban?
        </h2>
        <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto">
          Szívesen válaszolunk minden felmerülő kérdésére. Kérjen visszahívást, vagy foglaljon időpontot egy ingyenes, személyes állapotfelmérésre!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <a
            href="tel:+36705646837"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-full transition-all shadow-lg border border-sky-500"
          >
            <Phone className="w-5 h-5" />
            +36 70 564 6837
          </a>
          <Link
            href="/idopont"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-sky-700 font-bold rounded-full transition-all shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Ingyenes állapotfelmérés
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM 2026 FOOTER (Egyezik a főoldalival)
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
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors"><span className="font-bold">f</span></a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors"><span className="font-bold">in</span></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>
                  <span className="text-gray-400">2500 Esztergom, Hősök tere 5.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold">Budapesti Rendelő</span>
                  <span className="text-gray-400">Hamarosan nyitunk!</span>
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
            <span className="text-white text-2xl tracking-wider ml-1" style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>
              Crown Dental
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function KezelesekPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <InnerHero />
      <PriceListSection />
      <QuoteAnalyzerSection />
      <CTASection />
      <Footer />
    </main>
  );
}
