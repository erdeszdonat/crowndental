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
  FileText,
  CheckCircle2,
  Sparkles,
  Star
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Stabil, fehér menüsáv, olvasható)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Görgetéskor csak a felső kis sávot tüntetjük el, a menü marad fehér
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Összes kezelés', href: '/kezelesek' }, // Bekerült legfelülre
    { name: 'Implantátumok', href: '/kezelesek/implantatum' },
    { name: 'Fogszabályozás', href: '/kezelesek/fogszabalyozas' },
    { name: 'Koronák és Hidak', href: '/kezelesek/koronak-hidak' },
    { name: 'Fogfehérítés', href: '/kezelesek/fogfeherites' },
    { name: 'Fogsorok', href: '/kezelesek/fogsor' },
    { name: 'Gyökérkezelés', href: '/kezelesek/gyokerkezeles' },
    { name: 'Szájsebészet', href: '/kezelesek/szajsebeszet' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* Top info bar - Eltűnik görgetéskor, hogy ne foglalja a helyet */}
      <div className={`bg-sky-700 transition-all duration-300 overflow-hidden ${scrolled ? 'h-0' : 'h-10'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center h-full text-white text-sm font-medium">
          <div className="flex items-center gap-6">
            <a href="tel:+36705646837" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Phone className="w-4 h-4" /> +36 70 564 6837
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Esztergom</span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1 text-amber-400"><MapPin className="w-4 h-4" /> Budapest (Hamarosan)</span>
          </div>
        </div>
      </div>

      {/* Fő menüsáv */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Nagy, Esztétikus Logo (Szöveg nélkül) */}
          <Link href="/" className="flex items-center relative h-full py-2">
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
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/" className="px-4 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Főoldal
            </Link>
            
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-4 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                Szolgáltatások <ChevronDown className="w-4 h-4" />
              </button>
              
              {servicesOpen && (
                <div
                  className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-gray-100 py-3 z-50 overflow-hidden"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {services.map((service, idx) => (
                    <Link 
                      key={service.name} 
                      href={service.href} 
                      className={`block px-6 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 hover:pl-8 transition-all font-medium ${idx === 0 ? 'text-sky-700 font-bold border-b border-gray-100 pb-3 mb-2' : ''}`}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/kezelesek" className="px-4 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Árlista
            </Link>
            <Link href="/rolunk" className="px-4 py-2 font-bold text-gray-800 hover:text-sky-600 transition-colors">
              Rólunk
            </Link>
          </div>

          {/* CTA + Mobile hamburger toggle */}
          <div className="flex items-center gap-4">
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:bg-sky-700 transform hover:-translate-y-0.5">
              <Calendar className="w-5 h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 hover:bg-gray-100">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
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
              className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
            >
              <div className="p-4 space-y-2 pb-6">
                <Link href="/" className="block px-4 py-3 text-gray-900 font-bold rounded-xl hover:bg-sky-50">Főoldal</Link>
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Szolgáltatások & Árak</div>
                {services.map((s, idx) => (
                  <Link 
                    key={s.name} 
                    href={s.href} 
                    className={`block px-4 py-2.5 text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl pl-6 ${idx === 0 ? 'font-bold text-sky-700' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    • {s.name}
                  </Link>
                ))}
                <Link href="/kezelesek" className="block px-4 py-3 text-gray-900 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Árlista</Link>
                <Link href="/idopont" className="block mt-6 text-center px-5 py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}>
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
// HERO SLIDER (Oldalirányú csúszás)
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

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      {/* Képek oldalra csúszva */}
      <AnimatePresence initial={false}>
        <motion.div 
          key={current} 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '-100%' }} 
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }} 
          className="absolute inset-0 z-0"
        >
          <img src={slides[current].image} alt="Crown Dental Banner" className="w-full h-full object-cover" />
          {/* Sötétítő réteg a képekre */}
          <div className="absolute inset-0 bg-gray-900/60" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4 mt-20">
        <div className="max-w-3xl">
          {/* Szöveg animáció - csak halványul és picit csúszik */}
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-sm font-bold tracking-wide uppercase mb-6">
                <Sparkles className="w-4 h-4" /> {slides[current].tag}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight whitespace-pre-line drop-shadow-lg">
                {slides[current].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl font-light drop-shadow-md">
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
// TRUST BADGES
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award className="w-8 h-8" />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },
    { icon: <Building2 className="w-8 h-8" />, title: 'Saját Labor', desc: 'Gyorsabb, olcsóbb munka' },
    { icon: <Shield className="w-8 h-8" />, title: 'Japán Anyagok', desc: 'Prémium minőség' },
    { icon: <Heart className="w-8 h-8" />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },
  ];

  return (
    <section className="relative bg-white z-20 pb-16 pt-8 -mt-8">
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
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">Miben segíthetünk ma?</h3>
          </div>
          <Link href="/kezelesek" className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all">
            Összes kezelés <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, i) => (
            <Link key={i} href={srv.href}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
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
// AI ÁRAJÁNLAT ELEMZŐ
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
              Töltse fel a máshol kapott kezelési tervet. Az AI azonnal megmutatja, <strong>mennyit spórolhat</strong> az esztergomi klinikánkon.
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
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo.webp" alt="Crown Dental Logo" width={150} height={50} className="object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
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
