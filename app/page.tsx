'use client';

import React, { useState } from 'react';
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
  Loader2,
  CheckCircle2,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SZÍNEK - Régi stílus alapján (kék-fehér)
// ═══════════════════════════════════════════════════════════════════════════
// Fő szín: #0891b2 (cyan-600) vagy #0284c7 (sky-600)
// Másodlagos: #06b6d4 (cyan-500)
// Accent: #f59e0b (amber-500) - CTA gombokhoz

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const services = [
    { name: 'Implantátumok', href: '/kezelesek/implantatum' },
    { name: 'Fogszabályozás', href: '/kezelesek/fogszabalyozas' },
    { name: 'Koronák és Hidak', href: '/kezelesek/koronak-es-hidak' },
    { name: 'Fogfehérítés', href: '/kezelesek/fogfeherites' },
    { name: 'Fogsorok', href: '/kezelesek/fogsor' },
    { name: 'Gyökérkezelés', href: '/kezelesek/gyokerkezeles' },
    { name: 'Szájsebészet', href: '/kezelesek/szajsebeszet' },
    { name: 'Összes kezelés →', href: '/kezelesek' },
  ];

  const menuItems = [
    { name: 'Főoldal', href: '/' },
    { name: 'Szolgáltatásaink', href: '/kezelesek', hasDropdown: true },
    { name: 'Időpont Foglalás', href: '/idopont' },
    { name: 'Árlista', href: '/kezelesek' },
    { name: 'Rólunk', href: '/rolunk' },
    { name: 'Blog', href: '/blog' },
    { name: 'Kapcsolat', href: '/kapcsolat' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-sky-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+36705646837" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Kérdése van?</span> +36 70 564 6837
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/esztergom" className="flex items-center gap-1 hover:text-sky-200 transition-colors">
              <MapPin className="w-4 h-4" />
              Esztergom
            </Link>
            <Link href="/budapest" className="flex items-center gap-1 hover:text-sky-200 transition-colors">
              <MapPin className="w-4 h-4" />
              Budapest
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CROWN DENTAL</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.hasDropdown ? (
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-sky-600 font-medium transition-colors"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-sky-600 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                )}

                {/* Dropdown */}
                {item.hasDropdown && servicesOpen && (
                  <div
                    className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/idopont"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-full transition-all"
            >
              <Calendar className="w-4 h-4" />
              Foglalok
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-700"
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
              className="lg:hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/idopont"
                  className="block mx-4 mt-4 text-center px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-full transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Időpont foglalás
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
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      {/* Háttér dekoráció */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Bal oldal - Szöveg */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 text-sm font-medium mb-6"
            >
              <Award className="w-4 h-4" />
              30+ év szakmai tapasztalat
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Ragyogóbb mosoly,{' '}
              <span className="text-sky-600">boldogabb élet</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Tapasztalja meg a profi fogászati ellátást nyugodt és tiszta környezetben. 
              <strong className="text-gray-900"> Saját fogtechnikai laborunk</strong> garantálja a 
              gyors és minőségi munkát, kedvező áron.
            </motion.p>

            {/* Szolgáltatások lista */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <p className="font-semibold text-gray-900 mb-3">Szolgáltatásaink:</p>
              <div className="flex flex-wrap gap-3">
                {['Konzerváló Fogászat', 'Esztétikai Fogászat', 'Szájsebészet'].map((service) => (
                  <div key={service} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    {service}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA gombok */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/idopont"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full transition-all hover:shadow-lg hover:shadow-sky-600/25"
              >
                <Calendar className="w-5 h-5" />
                Időpont foglalás
              </Link>
              <a
                href="tel:+36705646837"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-full border-2 border-gray-200 transition-all"
              >
                <Phone className="w-5 h-5" />
                +36 70 564 6837
              </a>
            </motion.div>
          </div>

          {/* Jobb oldal - Kép/CTA kártya */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Kép placeholder - majd cserélhető */}
              <div className="aspect-[4/3] bg-gradient-to-br from-sky-100 to-cyan-100 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-sky-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-12 h-12 text-sky-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-sky-700 mb-2">Azonnali konzultáció</h3>
                  <p className="text-sky-600">és szakértő állapotfelmérés</p>
                </div>
              </div>

              <Link
                href="/idopont"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all"
              >
                Foglalok
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Lebegő badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Ingyenes</p>
                  <p className="text-sm text-gray-500">első konzultáció</p>
                </div>
              </div>
            </div>
          </motion.div>
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
    {
      icon: <Award className="w-8 h-8" />,
      title: '30 év szakmai tapasztalat',
      description: 'Szakértelem, amiben megbízhat.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verhetetlen árak',
      description: 'Prémium minőség elérhető áron.',
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Saját fogtechnikai labor',
      description: 'Gyors munka, tökéletes minőség.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Teljes körű ellátás',
      description: 'Minden kezelés egy helyen.',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4"
            >
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 flex-shrink-0">
                {badge.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{badge.title}</h3>
                <p className="text-sm text-gray-500">{badge.description}</p>
              </div>
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
    {
      title: 'Implantátumok',
      image: '/images/services/implantatum.jpg',
      href: '/kezelesek/implantatum',
      price: '180.000 Ft-tól',
    },
    {
      title: 'Fogszabályozás',
      image: '/images/services/fogszabalyozas.jpg',
      href: '/kezelesek/fogszabalyozas',
      price: '60.000 Ft-tól',
    },
    {
      title: 'Gyökérkezelés',
      image: '/images/services/gyokerkezeles.jpg',
      href: '/kezelesek/gyokerkezeles',
      price: '25.000 Ft-tól',
    },
    {
      title: 'Fogsorok',
      image: '/images/services/fogsor.jpg',
      href: '/kezelesek/fogsor',
      price: '110.000 Ft-tól',
    },
    {
      title: 'Fogfehérítés',
      image: '/images/services/fogfeherites.jpg',
      href: '/kezelesek/fogfeherites',
      price: '30.000 Ft-tól',
    },
    {
      title: 'Fogkő Eltávolítás',
      image: '/images/services/fogko.jpg',
      href: '/kezelesek/fogko-eltavolitas',
      price: '15.000 Ft-tól',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            KIEMELT SZOLGÁLTATÁSAINK
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Válasszon szolgáltatásaink közül, és bízza magát szakértő kezeinkre.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={service.href}
                className="group block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-cyan-100"
              >
                {/* Placeholder - majd képek */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-900">
                    {service.price}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg group-hover:text-sky-300 transition-colors">
                    {service.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/kezelesek"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-full transition-all"
          >
            Összes szolgáltatás és árlista
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (Egyszerűsített verzió)
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section id="arajanlat-elemzo" className="py-20 bg-sky-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              AI-alapú árajánlat-elemző
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Van már árajánlata máshonnan?
            </h2>
            <p className="text-xl text-sky-100">
              Töltse fel, és azonnal megmutatjuk, mennyit spórolhat nálunk!
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all bg-white/10 ${
              isDragging ? 'border-white bg-white/20' : 'border-white/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <Upload className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Húzza ide az árajánlatot
            </h3>
            <p className="text-sky-100 mb-4">vagy kattintson a böngészéshez</p>
            <div className="flex justify-center gap-4 text-sm text-sky-200">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                PDF
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                JPG / PNG
              </span>
            </div>
          </motion.div>

          <p className="text-center text-sky-200 text-sm mt-4">
            Saját fogtechnikai laborunk miatt akár 40%-kal kedvezőbb árakat tudunk kínálni.
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOKÁCIÓK
// ═══════════════════════════════════════════════════════════════════════════
function LocationsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Rendelőink
          </h2>
          <p className="text-gray-600">
            Válassza az Önhöz közelebb eső lokációt
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Esztergom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/esztergom"
              className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-sky-100 to-cyan-100 relative">
                <div className="absolute top-4 right-4 px-3 py-1 bg-sky-600 text-white text-sm font-medium rounded-full">
                  30 év tapasztalat
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sky-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Hősök tere 5.</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                  Esztergom
                </h3>
                <p className="text-gray-600 mb-4">
                  30 éve a város fogászata. Saját labor, ingyenes parkolás.
                </p>
                <span className="inline-flex items-center gap-2 text-sky-600 font-semibold">
                  Részletek
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Budapest */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/budapest"
              className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative">
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                  Hamarosan nyitunk!
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Hamarosan</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                  Budapest
                </h3>
                <p className="text-gray-600 mb-4">
                  Új rendelőnk a fővárosban. Ugyanaz a minőség, esztergomi áron.
                </p>
                <span className="inline-flex items-center gap-2 text-sky-600 font-semibold">
                  Részletek
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>
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
    {
      name: 'Kovács Mária',
      text: '20 éve járok ide, és mindig maximálisan elégedett vagyok. A gyerekeim is itt kezeltetik a fogaikat.',
      rating: 5,
    },
    {
      name: 'Nagy József',
      text: 'Féltem a fogorvostól, de itt olyan kedvesek, hogy már nem izgulok. Az implantátumom tökéletes!',
      rating: 5,
    },
    {
      name: 'Szabó Anna',
      text: 'A korona 3 nap alatt elkészült, máshol 3 hetet mondtak. És még olcsóbb is volt!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pácienseink mondták
          </h2>
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
            ))}
            <span className="font-bold text-gray-900 ml-2">4.9 / 5</span>
            <span className="text-gray-500">(320+ vélemény)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{review.text}"</p>
              <p className="font-semibold text-gray-900">{review.name}</p>
            </motion.div>
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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo és leírás */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">CROWN DENTAL</span>
            </div>
            <p className="text-gray-400 mb-6">
              30+ év tapasztalat, saját fogtechnikai labor, prémium minőség elérhető áron. 
              Esztergomban és hamarosan Budapesten is.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com/crowndental" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <span className="sr-only">Facebook</span>
                f
              </a>
              <a href="https://instagram.com/crowndental" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <span className="sr-only">Instagram</span>
                @
              </a>
            </div>
          </div>

          {/* Linkek */}
          <div>
            <h3 className="font-bold mb-4">Szolgáltatások</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/kezelesek/implantatum" className="hover:text-white transition-colors">Implantátumok</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-white transition-colors">Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-es-hidak" className="hover:text-white transition-colors">Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-white transition-colors">Fogfehérítés</Link></li>
              <li><Link href="/kezelesek" className="hover:text-white transition-colors">Összes szolgáltatás →</Link></li>
            </ul>
          </div>

          {/* Kapcsolat */}
          <div>
            <h3 className="font-bold mb-4">Kapcsolat</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                2500 Esztergom, Hősök tere 5.
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-500" />
                <a href="tel:+36705646837" className="hover:text-white transition-colors">+36 70 564 6837</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                H-Cs: 8-18, P: 8-14
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alsó sáv */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Crown Dental. Minden jog fenntartva.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/adatkezeles" className="hover:text-white transition-colors">Adatkezelés</Link>
            <Link href="/aszf" className="hover:text-white transition-colors">ÁSZF</Link>
            <Link href="/impresszum" className="hover:text-white transition-colors">Impresszum</Link>
            <Link href="/cookie-szabalyzat" className="hover:text-white transition-colors">Cookie szabályzat</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <TrustBadges />
        <FeaturedServices />
        <QuoteAnalyzerSection />
        <LocationsSection />
        <ReviewsSection />
      </main>
      <Footer />
    </>
  );
}
