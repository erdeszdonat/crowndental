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
  ArrowRight,
  Sparkles,
  ChevronRight,
  Mail,
  Search,
  Crown,
  Baby,
  Activity,
  Shield,
  Building2,
  Smile,
  Zap,
  Heart,
  Eye,
  Wrench,
  Microscope
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// KEZELÉS KÁRTYÁK - Fő szolgáltatások
// ═══════════════════════════════════════════════════════════════════════════
const treatmentCards = [
  {
    id: 'implantatum',
    title: 'Implantátum',
    description: 'Élethű fogpótlás titánium implantátummal, akár egy nap alatt',
    icon: <Shield className="w-7 h-7" />,
    href: '/kezelesek/implantatum',
    color: 'from-rose-500 to-orange-500',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'fogszabalyozas',
    title: 'Fogszabályozás',
    description: 'Rögzített és kivehető készülékek gyerekeknek és felnőtteknek',
    icon: <Smile className="w-7 h-7" />,
    href: '/kezelesek/fogszabalyozas',
    color: 'from-violet-500 to-purple-600',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'koronak-hidak',
    title: 'Koronák és Hidak',
    description: 'Fémkerámia és cirkónium koronák saját laborból',
    icon: <Crown className="w-7 h-7" />,
    href: '/kezelesek/koronak-es-hidak',
    color: 'from-amber-500 to-yellow-500',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'fogfeherites',
    title: 'Fogfehérítés',
    description: 'Professzionális fehérítés otthoni vagy rendelői módszerrel',
    icon: <Sparkles className="w-7 h-7" />,
    href: '/kezelesek/fogfeherites',
    color: 'from-sky-400 to-cyan-500',
    bgPattern: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'fogsor',
    title: 'Fogsorok',
    description: 'Kivehető és rögzített fogsorok, alábélelés',
    icon: <Wrench className="w-7 h-7" />,
    href: '/kezelesek/fogsor',
    color: 'from-teal-500 to-emerald-500',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    description: 'Fájdalommentes gyökértömés modern technikával',
    icon: <Activity className="w-7 h-7" />,
    href: '/kezelesek/gyokerkezeles',
    color: 'from-indigo-500 to-blue-600',
    bgPattern: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet',
    description: 'Bölcsességfog eltávolítás, gyökércsúcs rezekció',
    icon: <Zap className="w-7 h-7" />,
    href: '/kezelesek/szajsebeszet',
    color: 'from-red-500 to-pink-500',
    bgPattern: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'allapotfelmeres',
    title: 'Állapotfelmérés',
    description: 'Ingyenes konzultáció, góckutatás, kezelési terv',
    icon: <Search className="w-7 h-7" />,
    href: '/kezelesek/allapotfelmeres',
    color: 'from-green-500 to-lime-500',
    bgPattern: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'esztetikai-fogaszat',
    title: 'Esztétikai Fogászat',
    description: 'Héjak, tömések, fogkőeltávolítás a tökéletes mosolyért',
    icon: <Eye className="w-7 h-7" />,
    href: '/kezelesek/esztetikai-fogaszat',
    color: 'from-fuchsia-500 to-pink-500',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'foghuzas',
    title: 'Foghúzás',
    description: 'Kíméletes fogeltávolítás, műtéti és hagyományos',
    icon: <Heart className="w-7 h-7" />,
    href: '/kezelesek/foghuzas',
    color: 'from-orange-500 to-red-500',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'gockutatas',
    title: 'Góckutatás',
    description: 'Rejtett gyulladások felderítése, háttér-panaszok',
    icon: <Microscope className="w-7 h-7" />,
    href: '/kezelesek/gockutatas',
    color: 'from-slate-500 to-gray-600',
    bgPattern: 'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'gyerekfogaszat',
    title: 'Gyermekfogászat',
    description: 'Tejfog kezelések, barázdazárás játékos környezetben',
    icon: <Baby className="w-7 h-7" />,
    href: '/kezelesek/gyerekfogaszat',
    color: 'from-pink-400 to-rose-400',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA ADATOK - Egyszerűsített struktúra
// ═══════════════════════════════════════════════════════════════════════════
const priceCategories = [
  {
    id: 'diagnosztika',
    title: 'Diagnosztika és Alapkezelések',
    items: [
      { name: 'Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv', price: '10.000 Ft' },
      { name: 'Tömések', price: '30.000 - 35.000 Ft' },
      { name: 'Foghúzás', price: '25.000 - 35.000 Ft' },
      { name: 'Röntgen felvétel (kisröntgen / egy fogról)', price: '5.000 Ft' },
      { name: 'Panoráma röntgen', price: '6.000 Ft' },
    ],
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    items: [
      { name: 'Gyökértömés (Egy gyökerű)', price: '25.000 Ft' },
      { name: 'Gyökértömés (Két gyökerű)', price: '30.000 Ft' },
      { name: 'Gyökértömés (Három gyökerű)', price: '33.000 Ft' },
      { name: 'Gyökértömés eltávolítása', price: '20.000 Ft' },
      { name: 'Gyökérkezelés alkalmanként', price: '10.000 Ft' },
    ],
  },
  {
    id: 'esztetika',
    title: 'Fogmegőrzés és Esztétika',
    items: [
      { name: 'Fogkőeltávolítás (állcsontonként)', price: '15.000 Ft' },
      { name: 'Fogfehérítés szilikon sínnel (otthoni) / fogívenként', price: '30.000 Ft' },
      { name: 'Fogfehérítés rendelői (lámpás) / fogívenként', price: '45.000 Ft', highlight: true },
    ],
  },
  {
    id: 'fogpotlas',
    title: 'Fogpótlások és Koronák',
    items: [
      { name: 'Ideiglenes korona (rövidtávú, 1-2 hétre)', price: '6.000 Ft' },
      { name: 'Ideiglenes korona (hosszútávú, max. 1 évre)', price: '15.000 Ft' },
      { name: 'Fémkerámia korona', price: '42.000 Ft' },
      { name: 'Cirkónium korona (fémmentes)', price: '55.000 Ft', highlight: true },
      { name: 'Egyéni fogszínek készítése (foganként)', price: '15.000 Ft' },
      { name: 'Kivehető fogsor egy állcsontra (kompozit)', price: '110.000 Ft' },
      { name: 'Fémlemezes fogsor egy állcsontra', price: '150.000 Ft' },
      { name: 'Régi híd eltávolítása (pillér foganként)', price: '12.000 Ft' },
      { name: 'Fogsor alábélelés', price: '25.000 Ft' },
    ],
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet és Implantáció',
    items: [
      { name: 'Foghúzás műtéttel', price: '55.000 Ft' },
      { name: 'Bölcsességfog eltávolítása', price: '55.000 Ft' },
      { name: 'Gyökércsúcs rezekció', price: '55.000 Ft' },
      { name: 'DIO Implantátum', price: '240.000 Ft', highlight: true },
      { name: 'ALPHA BIO Implantátum', price: '180.000 Ft' },
      { name: 'Csontpótlás', price: '190.000 Ft' },
    ],
  },
  {
    id: 'gyermek',
    title: 'Gyermekfogászat és Fogszabályozás',
    items: [
      { name: 'Tömés tejfogakba', price: '15.000 Ft' },
      { name: 'Barázda zárás', price: '15.000 Ft' },
      { name: 'Rögzített készülékek', price: '190.000 - 285.000 Ft', highlight: true },
      { name: 'Kivehető készülékek', price: '60.000 - 90.000 Ft' },
      { name: 'Rögzített készülék aktiválása', price: '10.000 - 15.000 Ft' },
      { name: 'Kivehető készülék aktiválása', price: '5.000 - 8.000 Ft' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ
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
    { name: 'Koronák és Hidak', href: '/kezelesek/koronak-es-hidak' },
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
// HERO SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-gray-50">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-100/60 to-violet-100/40 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/50 to-rose-100/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-lg shadow-sky-100/50 border border-sky-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-8"
          >
            <Building2 className="w-4 h-4" />
            Saját labor = Kedvezőbb árak
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]"
          >
            Fogászati <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">Kezeléseink</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed"
          >
            Válassza ki a kezelést az alábbi kártyákból, vagy görgessen lejjebb a teljes árlistáért. 
            Saját fogtechnikai laborunknak köszönhetően <strong className="text-gray-700">akár 40%-kal kedvezőbb</strong> árakat biztosítunk.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KEZELÉS KÁRTYÁK SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function TreatmentCard({ treatment, index }: { treatment: typeof treatmentCards[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={treatment.href} className="group block h-full">
        <div 
          className={`relative h-full bg-gradient-to-br ${treatment.color} rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/20`}
          style={{ backgroundImage: treatment.bgPattern }}
        >
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {/* Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
            {treatment.icon}
          </div>
          
          {/* Content */}
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
            {treatment.title}
          </h3>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4">
            {treatment.description}
          </p>
          
          {/* Arrow indicator */}
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
            <span>Részletek</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TreatmentCardsSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {treatmentCards.map((treatment, index) => (
            <TreatmentCard key={treatment.id} treatment={treatment} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA SZEKCIÓ - Tiszta, átlátható design
// ═══════════════════════════════════════════════════════════════════════════
function PriceListSection() {
  return (
    <section id="arlista" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4"
          >
            Teljes Árlistánk
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            Transzparens árazás, rejtett költségek nélkül
          </motion.p>
        </div>

        {/* Price tables */}
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {priceCategories.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: catIndex * 0.1 }}
              className="bg-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden"
            >
              {/* Category header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {category.title}
                </h3>
              </div>
              
              {/* Price items */}
              <div className="divide-y divide-gray-200">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-5 transition-colors ${
                      item.highlight 
                        ? 'bg-gradient-to-r from-sky-50 to-violet-50' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-base sm:text-lg mb-2 sm:mb-0 pr-4 ${item.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold whitespace-nowrap ${
                      item.highlight 
                        ? 'bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent' 
                        : 'text-gray-900'
                    }`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important note */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-10 sm:mt-12"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 sm:p-8 flex gap-4 sm:gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Fontos Tudnivaló</h4>
              <p className="text-gray-600 leading-relaxed">
                Az árak tájékoztató jellegűek. Mivel minden fogazat egyedi, a végleges árat személyes vizsgálat 
                és részletes kezelési terv átadása után határozzuk meg. <strong>Az első konzultáció ingyenes!</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-sky-600 via-sky-500 to-violet-600 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6">
          Kérdése van az árakkal kapcsolatban?
        </h2>
        <p className="text-lg sm:text-xl text-sky-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Foglaljon időpontot egy ingyenes, személyes állapotfelmérésre!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <a
            href="tel:+36705646837"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-full transition-all border border-white/30"
          >
            <Phone className="w-5 h-5" />
            +36 70 564 6837
          </a>
          <Link
            href="/idopont"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-sky-700 font-bold rounded-full transition-all shadow-xl shadow-sky-900/20"
          >
            <Calendar className="w-5 h-5" />
            Időpontot kérek
          </Link>
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
    <footer className="bg-gray-950 pt-16 sm:pt-20 pb-8 sm:pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
          
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
              Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül. 
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-es-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-4 sm:space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-white font-semibold text-sm sm:text-base">Esztergomi Rendelő</span>
                  <span className="text-gray-400 text-sm">2500 Esztergom, Hősök tere 5.</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <a href="tel:+36705646837" className="hover:text-white transition-colors text-sm sm:text-base">+36 70 564 6837</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors text-sm sm:text-base">info@crowndental.hu</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Általános Szerződési Feltételek</Link></li>
              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Adatkezelési Tájékoztató (GDPR)</Link></li>
              <li><Link href="/impresszum" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Impresszum</Link></li>
              <li><Link href="/cookie-tajekoztato" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Sütik (Cookie) kezelése</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500">
          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function KezelesekPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TreatmentCardsSection />
      <PriceListSection />
      <CTASection />
      <Footer />
    </main>
  );
}
