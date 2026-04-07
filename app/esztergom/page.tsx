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
  Users,
  Stethoscope,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Upload
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center relative h-full py-3 z-50">
            <Image 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              width={280} 
              height={80} 
              className="object-contain h-16 w-auto drop-shadow-sm" 
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
              className="lg:hidden absolute top-24 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
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
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
      tag: "Esztergom Szívében",
      title: "Prémium Fogászat\nHelyben",
      subtitle: "1994 óta a város megbízható fogászata. Saját laborunkkal gyorsabban és kedvezőbb áron biztosítunk csúcsminőséget."
    },
    {
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop",
      tag: "30 Év Tapasztalat",
      title: "Fájdalommentes\nKezelések",
      subtitle: "Több mint 10.000 elégedett páciens. Prémium japán és koreai anyagokkal dolgozunk, garanciával."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative mt-24 h-[80svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img src={slides[current].image} alt="Crown Dental Esztergom" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-900/60" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-4 mt-10">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-sm font-bold tracking-wide uppercase mb-6">
                <MapPin className="w-4 h-4" />
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
// AI ÁRAJÁNLAT ELEMZŐ (Felhoztuk a Slider alá)
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
// SZOLGÁLTATÁSOK GRID
// ═══════════════════════════════════════════════════════════════════════════
function ServicesSection() {
  const services = [
    {
      title: 'Fogimplantátum',
      description: 'Tartós megoldás foghiányra. Alpha Bio és DIO implantátumok saját laborból.',
      href: '/kezelesek/implantatum',
      icon: <Stethoscope className="w-8 h-8" />,
      price: '190.000 Ft-tól',
    },
    {
      title: 'Cirkónium Korona',
      description: 'Cirkónium és porcelán koronák 3 nap alatt a saját laborunkból.',
      href: '/kezelesek/koronak-hidak',
      icon: <Sparkles className="w-8 h-8" />,
      price: '55.000 Ft-tól',
    },
    {
      title: 'Fogfehérítés',
      description: 'Professzionális fehérítés 1 óra alatt, akár 8 árnyalattal világosabb.',
      href: '/kezelesek/fogfeherites',
      icon: <Star className="w-8 h-8" />,
      price: '30.000 Ft-tól',
    },
    {
      title: 'Fogszabályozás',
      description: 'Láthatatlan sínek és hagyományos készülékek felnőtteknek és gyerekeknek.',
      href: '/kezelesek/fogszabalyozas',
      icon: <CheckCircle2 className="w-8 h-8" />,
      price: '60.000 Ft-tól',
    },
    {
      title: 'Fogsorok',
      description: 'Kivehető és rögzített fogsorok saját laborból, tökéletes illeszkedéssel.',
      href: '/kezelesek/fogsor',
      icon: <Users className="w-8 h-8" />,
      price: '110.000 Ft-tól',
    },
    {
      title: 'Állapotfelmérés',
      description: 'Teljes körű vizsgálat panoráma röntgennel. Első konzultáció ingyenes!',
      href: '/kezelesek',
      icon: <Shield className="w-8 h-8" />,
      price: 'Ingyenes',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Szolgáltatásaink</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Minden egy helyen Esztergomban
          </h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Teljes körű fogászati ellátás – a konzultációtól a végleges fogpótlásig, saját laborral támogatva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={service.href}
                className="group block p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors">
                  {service.title}
                </h4>
                <p className="text-gray-500 mb-6 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sky-600 font-extrabold text-lg">{service.price}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/kezelesek"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-sky-600 font-bold transition-colors"
          >
            Teljes árlista megtekintése <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MIÉRT MINKET VÁLASSZON
// ═══════════════════════════════════════════════════════════════════════════
function WhyUsSection() {
  const reasons = [
    {
      number: '30+',
      label: 'év tapasztalat',
      description: '1994 óta szolgáljuk Esztergom és környéke lakóit.',
    },
    {
      number: '10k+',
      label: 'elégedett páciens',
      description: 'Generációk bizalma – nagyszülők, szülők, gyerekek.',
    },
    {
      number: '40%',
      label: 'megtakarítás',
      description: 'Saját labor = nincs közvetítő, alacsonyabb árak.',
    },
    {
      number: '3 nap',
      label: 'korona elkészítés',
      description: 'Nem 2-3 hét, hanem 3 nap alatt kész a fogpótlás.',
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Tények és Számok</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Miért a Crown Dental?
          </h3>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            30 éve bizonyítunk – és továbbra is ugyanazzal az elkötelezettséggel dolgozunk a város szívében.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100"
            >
              <div className="text-6xl font-extrabold text-sky-600 mb-4">{reason.number}</div>
              <div className="text-xl font-bold text-gray-900 mb-2">{reason.label}</div>
              <p className="text-gray-500">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VÉLEMÉNYEK
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
    { name: 'Farkas Zita', rating: 5, text: '10 éve hűséges páciensük vagyok. Bárkinek, aki Esztergomban keres fogorvost, csak ajánlani tudom őket!', date: '2025. május' },
  ];

  const extendedReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Vélemények</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Pácienseink mondták
          </h3>
          <div className="flex items-center justify-center gap-2 text-amber-400 bg-white inline-flex px-6 py-2 rounded-full shadow-sm border border-gray-100">
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
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="animate-marquee gap-6 px-6">
          {extendedReviews.map((review, i) => (
            <div
              key={i}
              className="w-[350px] md:w-[400px] p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex-shrink-0 cursor-default"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-5 h-5 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-gray-600 mb-8 italic leading-relaxed min-h-[80px]">"{review.text}"</p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
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
// CTA SECTION
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
// ELÉRHETŐSÉGEK ÉS TÉRKÉP (Lekerült a Footer fölé)
// ═══════════════════════════════════════════════════════════════════════════
function ContactAndMap() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Kapcsolat</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">
              Látogasson el hozzánk!
            </h3>

            <div className="space-y-6">
              {/* Cím */}
              <div className="flex gap-5 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Cím</h4>
                  <p className="text-gray-600 text-lg font-medium">2500 Esztergom, Petőfi Sándor utca 11.</p>
                  <p className="text-gray-500 text-sm mt-1">Központi elhelyezkedés a városban</p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex gap-5 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Telefon</h4>
                  <a href="tel:+36705646837" className="text-sky-600 hover:text-sky-700 text-lg font-bold">
                    +36 70 564 6837
                  </a>
                  <p className="text-gray-500 text-sm mt-1">Hívjon minket bizalommal!</p>
                </div>
              </div>

              {/* Nyitvatartás */}
              <div className="flex gap-5 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-sky-600" />
                </div>
                <div className="w-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Nyitvatartás</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-700">Hétfő - Péntek</span>
                      <span className="font-bold text-gray-900 text-base">8:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Szombat - Vasárnap</span>
                      <div className="text-right">
                        <span className="block font-bold text-amber-600 uppercase tracking-wide text-xs mb-0.5">Ügyelet</span>
                        <span className="font-bold text-gray-900 text-base">7:00 - 13:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobb oldal - Térkép */}
          <div className="relative h-full min-h-[500px] lg:min-h-[600px]">
            <div className="sticky top-32 h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2677.202377526978!2d18.737151315645366!3d47.79155987919792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476a65df1c08bd05%3A0x6b6c28f2441a1bd!2sEsztergom%2C%20Pet%C5%91fi%20S%C3%A1ndor%20u.%2011%2C%202500!5e0!3m2!1sen!2shu!4v1650000000000!5m2!1sen!2shu"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <a
                  href="https://share.google/UV0bxLOGoyQdgH826"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-sky-50 hover:text-sky-600 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Megnyitás navigációban
                </a>
              </div>
            </div>
          </div>
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
                  <span className="text-gray-400">2500 Esztergom, Petőfi Sándor utca 11.</span>
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
// FŐ OLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function EsztergomPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSlider />
      <QuoteAnalyzerSection />
      <ServicesSection />
      <WhyUsSection />
      <ReviewsSection />
      <CTASection />
      <ContactAndMap />
      <Footer />
    </main>
  );
}
