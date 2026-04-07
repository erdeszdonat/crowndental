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
  Award,
  Building2,
  Shield,
  Heart,
  ArrowRight,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Mail
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Letisztult, csak fehér menüsáv, nincs kék top-bar)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const services = [
    { name: 'Összes kezelés és Árlista', href: '/kezelesek' },
    { name: 'Implantátumok', href: '/kezelesek/implantatum' },
    { name: 'Fogszabályozás', href: '/kezelesek/fogszabalyozas' },
    { name: 'Koronák és Hidak', href: '/kezelesek/koronak-hidak' },
    { name: 'Fogfehérítés', href: '/kezelesek/fogfeherites' },
    { name: 'Fogsorok', href: '/kezelesek/fogsor' },
    { name: 'Gyökérkezelés', href: '/kezelesek/gyokerkezeles' },
    { name: 'Szájsebészet', href: '/kezelesek/szajsebeszet' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Nagy, Esztétikus Logo */}
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              width={240} 
              height={70} 
              className="object-contain h-14 w-auto drop-shadow-sm"
              priority
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/" className="px-3 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Főoldal
            </Link>
            
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-3 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                Szolgáltatások <ChevronDown className="w-4 h-4" />
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
                    {services.map((service, idx) => (
                      <Link 
                        key={service.name} 
                        href={service.href} 
                        className={`block px-6 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:pl-8 transition-all font-medium ${idx === 0 ? 'text-sky-700 font-bold border-b border-gray-100 pb-4 mb-2 bg-sky-50/50' : ''}`}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="#arlista" className="px-3 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Árlista
            </Link>
            <Link href="/rolunk" className="px-3 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Rólunk
            </Link>
          </div>

          {/* CTA + Mobile hamburger toggle */}
          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" />
              +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile menu (Lenyíló sáv) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-900 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-50 mt-2 pt-4">Szolgáltatások</div>
                {services.map((s, idx) => (
                  <Link 
                    key={s.name} 
                    href={s.href} 
                    className={`block px-4 py-3 text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl ${idx === 0 ? 'font-bold text-sky-700 bg-sky-50/50' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    • {s.name}
                  </Link>
                ))}
                <Link href="#arlista" className="block px-4 py-3 text-gray-900 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Árlista</Link>
                
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
// HERO SLIDER (Lassabb váltás, mobilon korrigált padding)
// ═══════════════════════════════════════════════════════════════════════════
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop",
      tag: "Budapest Minőség, Vidéki Árak",
      title: "Prémium Fogászat\nKompromisszumok Nélkül",
      subtitle: "Fedezze fel a fájdalommentes fogászati kezeléseket modern esztergomi klinikánkon."
    },
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop",
      tag: "Saját Fogtechnikai Labor",
      title: "Akár 40% Megtakarítás\nKözvetítői Díjak Nélkül",
      subtitle: "Saját laborral dolgozunk, a fogpótlások gyorsabban és kedvezőbb áron készülnek el."
    }
  ];

  // Kérés szerint: 12 másodperces lassított váltás
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 12000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[100svh] min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-900 pt-20">
      {/* Képek oldalra csúszva */}
      <AnimatePresence initial={false}>
        <motion.div 
          key={current} 
          initial={{ opacity: 0, scale: 1.05 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 1.5, ease: "easeInOut" }} 
          className="absolute inset-0 z-0"
        >
          <img src={slides[current].image} alt="Crown Dental Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-900/65" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-300 text-sm font-bold tracking-wide uppercase mb-6">
                <Sparkles className="w-4 h-4" /> {slides[current].tag}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight whitespace-pre-line drop-shadow-xl">
                {slides[current].title}
              </h1>
              <p className="text-lg md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl font-light drop-shadow-md">
                {slides[current].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Gombok */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Link href="/idopont">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-600 text-white text-lg font-bold rounded-full overflow-hidden shadow-[0_0_40px_rgba(2,132,199,0.5)]">
                <Calendar className="w-6 h-6" /> Azonnali Időpontfoglalás
              </motion.button>
            </Link>
            <a href="#arajanlat-elemzo">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-full transition-colors">
                <Upload className="w-5 h-5" /> Árajánlatot Töltök Fel
              </motion.button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BADGES (USPs)
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award className="w-8 h-8" />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },
    { icon: <Building2 className="w-8 h-8" />, title: 'Saját Labor', desc: 'Gyorsabb, olcsóbb munka' },
    { icon: <Shield className="w-8 h-8" />, title: 'Japán Anyagok', desc: 'Prémium minőség' },
    { icon: <Heart className="w-8 h-8" />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },
  ];

  return (
    <section className="relative bg-white z-20 pb-12 pt-8 -mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {badges.map((badge, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                {badge.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{badge.title}</h3>
              <p className="text-gray-500 text-sm">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM LOKÁCIÓ VÁLASZTÓ (Új szekció közvetlenül az USP-k alatt)
// ═══════════════════════════════════════════════════════════════════════════
function LocationSelector() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Melyik rendelőnk érdekli?</h2>
          <p className="text-xl text-gray-500">Válassza ki a leginkább megfelelő helyszínt</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Esztergom Kártya */}
          <Link href="/esztergom" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" alt="Esztergomi Klinika" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            {/* Gradiens fedés */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-5 h-5" /> Komárom-Esztergom
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Esztergomi Rendelő</h3>
              <p className="text-gray-300 text-lg mb-8 max-w-md">30 éves múlt, saját fogtechnikai labor és családias, modern környezet a város szívében.</p>
              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-sky-400 transition-colors">
                Tovább a rendelőhöz <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all"><ArrowRight className="w-5 h-5" /></div>
              </div>
            </div>
          </Link>

          {/* Budapest Kártya */}
          <Link href="/budapest" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1542456424-5d51379db6a6?q=80&w=2070&auto=format&fit=crop" alt="Budapesti Klinika" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute top-6 right-6 z-20">
              <span className="px-4 py-2 bg-amber-500 text-white font-bold rounded-full text-sm shadow-lg">Hamarosan Nyitunk!</span>
            </div>
            {/* Gradiens fedés */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-5 h-5" /> Főváros
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Budapesti Rendelő</h3>
              <p className="text-gray-300 text-lg mb-8 max-w-md">A megszokott esztergomi minőség és árak, kompromisszumok nélkül, hamarosan Budapesten is.</p>
              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-amber-400 transition-colors">
                Részletek megtekintése <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all"><ArrowRight className="w-5 h-5" /></div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TELJES ÁRLISTA SZEKCIÓ (Az általad küldött árakkal, elegáns kivitelben)
// ═══════════════════════════════════════════════════════════════════════════
function PriceListSection() {
  const priceCategories = [
    {
      title: "Diagnosztika és Alapkezelések",
      items: [
        { name: "Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv", price: "10.000 Ft" },
        { name: "Tömések", price: "30.000 - 35.000 Ft" },
        { name: "Foghúzás", price: "25.000 - 35.000 Ft" },
        { name: "Röntgen felvétel (kisröntgen filmes / egy fogról)", price: "5.000 Ft" },
        { name: "Panoráma röntgen", price: "6.000 Ft" },
      ]
    },
    {
      title: "Gyökérkezelés",
      items: [
        { name: "Gyökértömés (Egy gyökerű)", price: "25.000 Ft" },
        { name: "Gyökértömés (Két gyökerű)", price: "30.000 Ft" },
        { name: "Gyökértömés (Három gyökerű)", price: "33.000 Ft" },
        { name: "Gyökértömés eltávolítása", price: "20.000 Ft" },
        { name: "Gyökérkezelés alkalmanként", price: "10.000 Ft" },
      ]
    },
    {
      title: "Fogmegőrzés és Esztétika",
      items: [
        { name: "Fogkőeltávolítás állcsontonként", price: "15.000 Ft" },
        { name: "Fogfehérítés szilikon sínnel (otthoni) / fogívenként", price: "30.000 Ft" },
        { name: "Fogfehérítés rendelői (lámpás) / fogívenként", price: "45.000 Ft" },
      ]
    },
    {
      title: "Fogpótlások és Koronák",
      items: [
        { name: "Ideiglenes korona (rövidtávú, 1-2 hétre)", price: "6.000 Ft" },
        { name: "Ideiglenes korona (hosszútávú, max. 1 évre)", price: "15.000 Ft" },
        { name: "Fémkerámia korona", price: "42.000 Ft" },
        { name: "Cirkónium korona (fémmentes)", price: "55.000 Ft" },
        { name: "Egyéni fogszínek készítése (foganként)", price: "15.000 Ft" },
        { name: "Kivehető fogsor egy állcsontra (kompozit)", price: "110.000 Ft" },
        { name: "Fémlemezes fogsor egy állcsontra", price: "150.000 Ft" },
        { name: "Régi híd eltávolítása (pillér foganként)", price: "12.000 Ft" },
        { name: "Fogsor alábélelés", price: "25.000 Ft" },
      ]
    },
    {
      title: "Szájsebészet és Implantáció",
      items: [
        { name: "Foghúzás műtéttel", price: "55.000 Ft" },
        { name: "Bölcsességfog eltávolítása", price: "55.000 Ft" },
        { name: "Gyökércsúcs rezekció", price: "55.000 Ft" },
        { name: "DIO Implantátum", price: "240.000 Ft" },
        { name: "ALPHA BIO Implantátum", price: "180.000 Ft" },
        { name: "Csontpótlás", price: "190.000 Ft" },
      ]
    },
    {
      title: "Gyermekfogászat és Fogszabályozás",
      items: [
        { name: "Tömés tejfogakba", price: "15.000 Ft" },
        { name: "Barázda zárás", price: "15.000 Ft" },
        { name: "Rögzített készülékek", price: "190.000 - 285.000 Ft" },
        { name: "Kivehető készülékek", price: "60.000 - 90.000 Ft" },
        { name: "Rögzített készülék aktiválása", price: "10.000 - 15.000 Ft" },
        { name: "Kivehető készülék aktiválása", price: "Konzultáció alapján" },
      ]
    }
  ];

  return (
    <section id="arlista" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Transzparens Árképzés</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Teljes Árlistánk</h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Saját laborunknak köszönhetően prémium minőségű anyagokkal dolgozunk, rejtett költségek nélkül.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-12 max-w-6xl mx-auto">
          {priceCategories.map((category, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100 relative overflow-hidden"
            >
              {/* Dekoratív elem a kártyában */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -mr-8 -mt-8 z-0" />
              
              <h4 className="text-2xl font-bold text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                <div className="w-2 h-8 bg-sky-500 rounded-full" />
                {category.title}
              </h4>
              
              <ul className="space-y-4 relative z-10">
                {category.items.map((item, i) => (
                  <li key={i} className="flex justify-between items-end group">
                    <span className="text-gray-700 font-medium pr-4 leading-snug max-w-[70%] group-hover:text-sky-700 transition-colors">{item.name}</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-200 mb-1 mx-2 opacity-50"></div>
                    <span className="text-gray-900 font-extrabold whitespace-nowrap pl-2">{item.price}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-6 italic">Az árak tájékoztató jellegűek, a pontos kezelési tervet a személyes konzultáció során készítjük el.</p>
          <Link href="/idopont" className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-full hover:bg-sky-600 transition-colors shadow-lg">
            <Calendar className="w-5 h-5" /> Kérem a pontos árajánlatot
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Marad, mint egy erős sales eszköz)
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
              <button className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-8 rounded-full shadow-lg">
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
// PRÉMIUM 2026 FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Oszlop: Logo & About */}
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

          {/* 2. Oszlop: Gyorslinkek / Szolgáltatások */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
              <li><Link href="#arlista" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>
            </ul>
          </div>

          {/* 3. Oszlop: Kapcsolat */}
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

          {/* 4. Oszlop: Jogi Információk */}
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

        {/* Copyright Sáv */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Crown Dental Clinic & Lab. Minden jog fenntartva.</p>
          <p>Készítette: <span className="text-white font-semibold">Erdesz Donat & AI</span></p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      <main>
        <HeroSlider />
        <TrustBadges />
        <LocationSelector />
        <PriceListSection />
        <QuoteAnalyzerSection />
      </main>
      <Footer />
    </div>
  );
}
