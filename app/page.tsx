'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Building2,
  Shield,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Star,
  Heart,
  Upload,
  Search,
  Activity,
  Sparkles,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Stabil fehér, MEGNÖVELT logóval)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28"> {/* h-24-ről h-28-ra növelve a nagyobb logó miatt */}
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              width={350} 
              height={100} 
              className="object-contain h-20 md:h-24 w-auto drop-shadow-sm" 
              priority 
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Főoldal
            </Link>
            <Link href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Szolgáltatások & Árak
            </Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Rólunk
            </Link>
            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Blog
            </Link>
            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Karrier
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
              className="lg:hidden absolute top-28 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>
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
// HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════
function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop",
      tag: "Budapest Minőség, Vidéki Árak",
      title: "Prémium Fogászat\nKompromisszumok Nélkül",
      subtitle: "Fedezze fel a fájdalommentes fogászati kezeléseket klinikánkon. Saját fogtechnikai laborunkkal időt és pénzt spórolunk Önnek."
    },
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop",
      tag: "Saját Fogtechnikai Labor",
      title: "Maximális Minőség\nKözvetítői Díjak Nélkül",
      subtitle: "Mivel saját laborral dolgozunk, a fogpótlások és koronák gyorsabban és szigorú ellenőrzés mellett készülnek el."
    },
    {
      image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop",
      tag: "30 Év Tapasztalat",
      title: "Új Mosoly,\nÚj Önbizalom",
      subtitle: "Több mint 15.000 sikeres kezelés bizonyítja szakértelmünket. Bízza ránk mosolyát, és mi visszaadjuk a rágás szabadságát!"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative mt-28 h-[80svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img src={slides[current].image} alt="Crown Dental Clinic" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-900/60" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4 mt-10">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-sm font-bold tracking-wide uppercase mb-6">
                <Sparkles className="w-4 h-4" />
                {slides[current].tag}
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight whitespace-pre-line drop-shadow-lg">
                {slides[current].title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl font-light">
                {slides[current].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/idopont" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-600 text-white text-lg font-bold rounded-full shadow-[0_0_40px_rgba(2,132,199,0.5)] transition-all">
                <Calendar className="w-6 h-6" />
                Azonnali Időpontfoglalás
              </motion.button>
            </Link>
            <a href="tel:+36705646837" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white text-sky-700 hover:bg-gray-50 text-lg font-bold rounded-full shadow-xl transition-all border border-gray-100">
                <Phone className="w-5 h-5 text-sky-600" />
                +36 70 564 6837
              </motion.button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BADGES
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award className="w-8 h-8" />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },
    { icon: <Building2 className="w-8 h-8" />, title: 'Saját Labor', desc: 'Tökéletes minőség, ellenőrzött folyamatok' },
    { icon: <Shield className="w-8 h-8" />, title: 'Prémium Alapanyagok', desc: 'Csúcsminőség kompromisszumok nélkül' },
    { icon: <Heart className="w-8 h-8" />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },
  ];

  return (
    <section className="relative bg-white z-20 pb-16 pt-8 -mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
            >
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
// ANIMÁLT TELJESÍTMÉNY SZÁMLÁLÓ (Tények és Számok animációval)
// ═══════════════════════════════════════════════════════════════════════════
function AnimatedCounter({ end, suffix = "", text, desc }: { end: number, suffix?: string, text: string, desc: string }) {
  const [count, setCount] = useState(0);

  return (
    <motion.div
      onViewportEnter={() => {
        let start = 0;
        const duration = 2000; // 2 másodperc alatt pörög fel
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.ceil(start));
          }
        }, 16);
      }}
      viewport={{ once: true, margin: "-100px" }}
      className="text-center p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50"
    >
      <div className="text-5xl md:text-6xl font-extrabold text-sky-600 mb-4 tracking-tight">
        {count.toLocaleString('hu-HU')}{suffix}
      </div>
      <div className="text-lg font-bold text-gray-900 mb-2">{text}</div>
      <p className="text-gray-500 text-sm">{desc}</p>
    </motion.div>
  );
}

function StatsSection() {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Tények és Számok</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Teljesítményeink
          </h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Büszkék vagyunk az elmúlt évtizedek munkájára és a ránk bízott mosolyokra.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <AnimatedCounter end={30} suffix="+" text="Év Tapasztalat" desc="1994 óta a pályán" />
          <AnimatedCounter end={15000} suffix="+" text="Elégedett Páciens" desc="Generációk bizalma" />
          <AnimatedCounter end={40} suffix="%" text="Megtakarítás" desc="Saját laborunknak köszönhetően" />
          <AnimatedCounter end={3} suffix=" nap" text="Korona Elkészítés" desc="Villámgyors, precíz fogpótlás" />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Felhoztuk ide)
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sokallja az árajánlatot amit egy <span className="text-sky-400">másik rendelőben kapott?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              Töltse fel és azonnal megmutatjuk mennyit spórolhat ha minket választ!
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
// PRÉMIUM LOKÁCIÓ VÁLASZTÓ
// ═══════════════════════════════════════════════════════════════════════════
function LocationSelector() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Rendelőink</h2>
          <p className="text-xl text-gray-500">Válassza ki a leginkább megfelelő helyszínt</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Esztergom Kártya */}
          <Link href="/esztergom" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" alt="Esztergomi Klinika" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
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
// KIEMELT ÁRAK / KEZELÉSEK (Elegáns képekkel a kártyák tetején)
// ═══════════════════════════════════════════════════════════════════════════
function FeaturedPricesSection() {
  const cards = [
    {
      title: "Diagnosztika & Alap",
      subtitle: "Vizsgálat, röntgen, tömések",
      price: "10.000 Ft-tól",
      icon: <Search className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Gyökérkezelés",
      subtitle: "Fájdalommentes fogmegmentés",
      price: "10.000 Ft-tól",
      icon: <Activity className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Esztétika & Prevenció",
      subtitle: "Fogkőeltávolítás, fogfehérítés",
      price: "15.000 Ft-tól",
      icon: <Sparkles className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Fogpótlás & Koronák",
      subtitle: "Cirkónium, fémkerámia, fogsorok",
      price: "42.000 Ft-tól",
      icon: <CheckCircle2 className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Sebészet & Implantáció",
      subtitle: "Húzások, prémium implantátumok",
      price: "55.000 Ft-tól",
      icon: <Shield className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Gyermek & Fogszabályozás",
      subtitle: "Rögzített és kivehető készülékek",
      price: "15.000 Ft-tól",
      icon: <Heart className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Kiemelt Ajánlataink</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Prémium Kezelések</h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Saját laborunknak köszönhetően kimagasló minőséget nyújtunk kompromisszumok nélkül.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div key={idx} className="group [perspective:1000px] h-[400px] w-full cursor-pointer">
              <div className="relative w-full h-full duration-700 transition-transform [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                {/* Front (Előlap - Fent kép, lent szöveg) */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden group/front">
                  {/* Kép része sötét átmenettel */}
                  <div className="relative h-[55%] w-full overflow-hidden">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/front:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-sm">
                        {card.icon}
                      </div>
                      <h4 className="text-xl font-bold text-white">{card.title}</h4>
                    </div>
                  </div>
                  {/* Szöveges rész */}
                  <div className="p-6 flex flex-col flex-1 text-center justify-center">
                    <p className="text-gray-500 mb-3">{card.subtitle}</p>
                    <div className="mt-auto">
                      <span className="text-2xl font-extrabold text-sky-600">{card.price}</span>
                    </div>
                  </div>
                </div>

                {/* Back (Hátlap) */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-sky-600 to-sky-800 rounded-3xl p-8 shadow-2xl flex items-center justify-center">
                  <Link href="/idopont" className="flex flex-col items-center justify-center w-full h-full text-white group/link">
                    <Calendar className="w-16 h-16 mb-6 opacity-80 group-hover/link:scale-110 group-hover/link:opacity-100 transition-all duration-300" />
                    <span className="text-2xl font-bold text-center mb-2">Konzultáció Foglalása</span>
                    <span className="text-sky-200 text-sm font-medium">Kattintson ide az időponthoz</span>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
           <Link href="/kezelesek" className="inline-flex items-center gap-2 text-gray-500 hover:text-sky-600 font-bold transition-colors">
             Teljes árlista megtekintése <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VÉLEMÉNYEK - GÖRDÜLŐ MARQUEE 
// ═══════════════════════════════════════════════════════════════════════════
function ReviewsSection() {
  const reviews = [
    { name: 'Kovács Mária', rating: 5, text: 'Már 10 éve járok ide, a legjobb döntés volt. A gyerekeim is ide járnak, sosem csalódtunk a csapatban.', date: '2026. február' },
    { name: 'Nagy József', rating: 4, text: 'Nagyon profik, az implantátumom tökéletes lett. Kicsit várni kellett az időpontra, de abszolút megérte.', date: '2026. január' },
    { name: 'Szabó Anna', rating: 5, text: 'A korona 3 nap alatt elkészült a saját labor miatt. Nagyon féltem a beavatkozástól, de teljesen fájdalommentes volt!', date: '2025. december' },
    { name: 'Tóth Gábor', rating: 5, text: '8 éve csak hozzájuk járok. Mindig kedvesek, gyorsak és a legmodernebb, legtisztább gépekkel dolgoznak.', date: '2025. november' },
    { name: 'Horváth Éva', rating: 4, text: 'Nagyon szép lett a kivehető fogsorom, a technikus azonnal tudott korrigálni a színen. Szuper szakemberek.', date: '2025. október' },
    { name: 'Varga Péter', rating: 5, text: '5 éve vagyok páciens. Életemben először nem gyomorgörccsel megyek fogorvoshoz, nagyon empatikusak.', date: '2025. szeptember' },
    { name: 'Kiss László', rating: 5, text: 'Komplikált gyökérkezelésen voltam, de megmentették a fogam. Precíz, gyors és alapos munka.', date: '2025. július' },
    { name: 'Farkas Zita', rating: 5, text: '10 éve hűséges páciensük vagyok. Bárkinek, aki fogorvost keres, csak ajánlani tudom őket!', date: '2025. május' },
  ];

  const extendedReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Vélemények</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Pácienseink mondták
          </h3>
          <div className="flex items-center justify-center gap-2 text-amber-400 bg-gray-50 inline-flex px-6 py-2 rounded-full shadow-sm border border-gray-100">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="text-gray-900 font-bold ml-2 text-lg">4.8 / 5</span>
            <span className="text-gray-500 font-medium ml-1">(320+ értékelés)</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="animate-marquee gap-6 px-6">
          {extendedReviews.map((review, i) => (
            <div
              key={i}
              className="w-[350px] md:w-[400px] p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 flex-shrink-0 cursor-default"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-5 h-5 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-gray-600 mb-8 italic leading-relaxed min-h-[80px]">"{review.text}"</p>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-900 font-bold">{review.name}</span>
                <span className="text-gray-400 text-sm">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM 2026 FOOTER (Kattintható címmel, Teljes Árlista linkkel)
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
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      <main>
        <HeroSlider />
        <TrustBadges />
        <StatsSection />
        <QuoteAnalyzerSection />
        <LocationSelector />
        <FeaturedPricesSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
