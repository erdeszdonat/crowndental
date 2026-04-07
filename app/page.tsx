'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  FileText,
  CheckCircle2,
  Sparkles,
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Glassmorphism hatással görgetéskor)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Görgetés figyelése a menü átlátszóságához
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-transparent py-2'
      }`}
    >
      {/* Top info bar - Eltűnik görgetéskor */}
      <div className={`transition-all duration-300 overflow-hidden ${scrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center h-full text-white/90 text-sm font-medium">
          <div className="flex items-center gap-6">
            <a href="tel:+36705646837" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              +36 70 564 6837
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Esztergom</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1 text-amber-300"><MapPin className="w-4 h-4" /> Budapest (Hamarosan)</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${scrolled ? 'bg-sky-600' : 'bg-white'}`}>
              <span className={`font-bold text-xl ${scrolled ? 'text-white' : 'text-sky-600'}`}>C</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>CROWN DENTAL</span>
              <span className={`text-xs tracking-widest uppercase font-semibold ${scrolled ? 'text-sky-600' : 'text-sky-200'}`}>Clinic & Lab</span>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/" className={`px-4 py-2 font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-sky-600' : 'text-white/90 hover:text-white'}`}>Főoldal</Link>
            
            <div className="relative group">
              <button
                className={`flex items-center gap-1 px-4 py-2 font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-sky-600' : 'text-white/90 hover:text-white'}`}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                Szolgáltatások <ChevronDown className="w-4 h-4" />
              </button>
              
              {servicesOpen && (
                <div
                  className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="block px-6 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:pl-8 transition-all font-medium"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/arak" className={`px-4 py-2 font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-sky-600' : 'text-white/90 hover:text-white'}`}>Árak</Link>
            <Link href="/rolunk" className={`px-4 py-2 font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-sky-600' : 'text-white/90 hover:text-white'}`}>Rólunk</Link>
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/idopont"
              className={`hidden sm:inline-flex items-center gap-2 px-6 py-3 font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                scrolled 
                  ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20' 
                  : 'bg-white text-sky-700 hover:bg-sky-50 shadow-black/10'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Időpontot kérek
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-900 bg-gray-100' : 'text-white bg-white/20'}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white mt-2 rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="p-4 space-y-1">
                <Link href="/" className="block px-4 py-3 text-gray-900 font-medium rounded-xl hover:bg-sky-50">Főoldal</Link>
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Szolgáltatások</div>
                {services.map(s => (
                  <Link key={s.name} href={s.href} className="block px-4 py-2.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl pl-6">
                    • {s.name}
                  </Link>
                ))}
                <Link href="/arak" className="block px-4 py-3 text-gray-900 font-medium rounded-xl hover:bg-sky-50">Árak</Link>
                <Link
                  href="/idopont"
                  className="block mt-4 text-center px-5 py-4 bg-sky-600 text-white font-bold rounded-xl"
                >
                  Időpont Foglalás
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODERN FULL-SCREEN HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════
function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop",
      tag: "Budapest Minőség, Vidéki Árak",
      title: "Prémium Fogászat\nKompromisszumok Nélkül",
      subtitle: "Fedezze fel a fájdalommentes fogászati kezeléseket modern esztergomi klinikánkon. Saját fogtechnikai laborunkkal időt és pénzt spórolunk Önnek."
    },
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop",
      tag: "Saját Fogtechnikai Labor",
      title: "Akár 40% Megtakarítás\nKözvetítői Díjak Nélkül",
      subtitle: "Mivel saját laborral dolgozunk, a fogpótlások és koronák nem csak gyorsabban, de jelentősen kedvezőbb áron készülnek el, csúcsminőségű japán anyagokból."
    },
    {
      image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop",
      tag: "30 Év Tapasztalat",
      title: "Új Mosoly,\nÚj Önbizalom",
      subtitle: "Több mint 15.000 sikeres kezelés bizonyítja szakértelmünket. Bízza ránk mosolyát, és mi visszaadjuk a rágás szabadságát!"
    }
  ];

  // Automatikus léptetés 6 másodpercenként
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center justify-center">
      {/* Slider Képek */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={slides[current].image} 
            alt="Crown Dental Clinic" 
            className="w-full h-full object-cover"
          />
          {/* Sötétítő réteg a szöveg olvashatóságáért */}
          <div className="absolute inset-0 bg-gray-900/60" />
        </motion.div>
      </AnimatePresence>

      {/* A titkos fegyver: A belemosódó alsó gradiens, ami összeköti a képet a fehér weblappal */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      {/* Tartalom (Szöveg és Gombok) */}
      <div className="relative z-20 container mx-auto px-4 mt-16">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-sm font-bold tracking-wide uppercase mb-6">
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

          {/* Lebegő, pulzáló CTA gombok */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Link href="/idopont">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-600 text-white text-lg font-bold rounded-full overflow-hidden shadow-[0_0_40px_rgba(2,132,199,0.5)]"
              >
                {/* Gomb csillogás effektus */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
                <Calendar className="w-6 h-6" />
                Azonnali Időpontfoglalás
              </motion.button>
            </Link>
            
            <a href="#arajanlat-elemzo">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-full transition-colors"
              >
                <Upload className="w-5 h-5" />
                Árajánlatot Töltök Fel
              </motion.button>
            </a>
          </div>
        </div>
      </div>

      {/* Slider Indikátorok alul */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`transition-all duration-300 rounded-full ${
              current === idx ? 'w-10 h-2 bg-sky-500' : 'w-2 h-2 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Ugrás a ${idx + 1}. diára`}
          />
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BADGES (Prémium Megjelenés)
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },
    { icon: <Building2 />, title: 'Saját Labor', desc: 'Gyorsabb, olcsóbb munka' },
    { icon: <Shield />, title: 'Japán Anyagok', desc: 'Prémium minőség' },
    { icon: <Heart />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },
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
                {React.cloneElement(badge.icon as React.ReactElement, { className: "w-8 h-8" })}
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
// KIEMELT SZOLGÁLTATÁSOK
// ═══════════════════════════════════════════════════════════════════════════
function FeaturedServices() {
  const services = [
    { title: 'Implantátumok', price: '180.000 Ft-tól', href: '/kezelesek/implantatum' },
    { title: 'Fogszabályozás', price: '60.000 Ft-tól', href: '/kezelesek/fogszabalyozas' },
    { title: 'Cirkon Koronák', price: 'Saját Labor Ár', href: '/kezelesek/koronak-hidak' },
    { title: 'Fogsorok', price: '110.000 Ft-tól', href: '/kezelesek/fogsor' },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sky-600 font-bold uppercase tracking-wider mb-2">Szakértelem & Minőség</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Miben segíthetünk ma?
            </h3>
          </div>
          <Link href="/kezelesek" className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all">
            Összes kezelés megtekintése <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, i) => (
            <Link key={i} href={srv.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{srv.title}</h4>
                <p className="text-sky-600 font-semibold mb-6">{srv.price}</p>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Sales fókusz)
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden">
      {/* Sötét, elegáns háttér */}
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 bg-sky-900/20" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Szöveges rész */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6">
              <Sparkles className="w-4 h-4" /> AI Ár-kalkulátor
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sokallja a pesti árajánlatot? <br/>
              <span className="text-sky-400">Mutassa meg nekünk!</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              Töltse fel a máshol kapott kezelési tervet. Mesterséges intelligenciánk azonnal beolvassa, és megmutatja, <strong>mennyit spórolhat</strong> a mi esztergomi klinikánkon, saját laborunk használatával.
            </p>
            <ul className="space-y-4 mb-10">
              {['Azonnali ár-összehasonlítás', '100% ingyenes és kötelezettségmentes', 'Saját fogtechnikai labor = Nincs felár'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-200 font-medium">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Feltöltő box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div 
              className={`relative bg-white/5 backdrop-blur-xl border-2 border-dashed rounded-3xl p-10 lg:p-16 text-center transition-all duration-300 ${
                isDragging ? 'border-sky-400 bg-sky-500/10 scale-105' : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Húzza ide a PDF-et vagy fotót
              </h3>
              <p className="text-gray-400 mb-8">
                vagy kattintson a gombra a fájl kiválasztásához
              </p>
              
              <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-8 rounded-full transition-colors shadow-lg shadow-sky-900/50">
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
// FOOTER (Egyszerűsítve)
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">CROWN DENTAL</h2>
        <p className="text-gray-600 mb-8">Kiváló minőségű fogászat Esztergomban, hamarosan Budapesten is.</p>
        <p className="text-sm text-gray-400">© 2026 Crown Dental. Minden jog fenntartva.</p>
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
      {/* CSS az animált gomb-csillogáshoz */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}} />
      
      <Navigation />
      <main>
        <HeroSlider />
        <TrustBadges />
        <FeaturedServices />
        <QuoteAnalyzerSection />
      </main>
      <Footer />
    </div>
  );
}
