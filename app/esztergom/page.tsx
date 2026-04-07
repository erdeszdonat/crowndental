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
  Car,
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
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Kibővítve Blog és Karrier menüpontokkal)
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

          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            <Link href="/" className="px-3 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors">
              Főoldal
            </Link>
            
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-4 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
                onClick={() => window.location.href = '/kezelesek'}
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
                    <Link href="/kezelesek" className="block px-6 py-3 text-sky-700 font-bold hover:bg-sky-50 border-b border-gray-100 pb-4 mb-2 bg-sky-50/50">
                      Összes Kezelés és Árlista
                    </Link>
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
            <Link href="/blog" className="px-3 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors">
              Blog
            </Link>
            <Link href="/karrier" className="px-3 py-2 font-bold text-gray-600 hover:text-sky-600 transition-colors">
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
              className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások és Árak</Link>
                <div className="pl-4 border-l-2 border-gray-100 ml-6 space-y-1 my-1">
                  {services.map((s) => (
                    <Link key={s.name} href={s.href} className="block px-4 py-2 text-gray-500 hover:text-sky-600 text-sm font-medium" onClick={() => setIsOpen(false)}>
                      • {s.name}
                    </Link>
                  ))}
                </div>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                <Link href="/blog" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/karrier" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Karrier</Link>
                
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
// HERO SECTION (Világos, prémium dizájn)
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50">
      {/* Finom hátterek */}
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-sky-50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-sky-50/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-6"
          >
            <Award className="w-4 h-4" />
            30+ év tapasztalat Esztergomban
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Fogászat <span className="text-sky-600">Esztergomban</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed font-light"
          >
            1994 óta a város megbízható fogászata. <strong className="text-gray-900">Saját fogtechnikai laborunk</strong> miatt 
            gyorsabbak és kedvezőbbek vagyunk – prémium japán és koreai anyagokkal.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { icon: <Users className="w-4 h-4" />, text: '10.000+ páciens' },
              { icon: <Building2 className="w-4 h-4" />, text: 'Saját labor' },
              { icon: <Car className="w-4 h-4" />, text: 'Ingyenes parkolás' },
              { icon: <Shield className="w-4 h-4" />, text: 'Garancia' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-700 text-sm font-medium shadow-sm border border-gray-100"
              >
                <span className="text-sky-500">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </motion.div>

          {/* CTA gombok */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <Link
              href="/idopont"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-sky-600/25"
            >
              <Calendar className="w-5 h-5" />
              Időpontfoglalás
            </Link>
            <a
              href="tel:+36705646837"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-full border border-gray-200 shadow-sm transition-all"
            >
              <Phone className="w-5 h-5 text-sky-600" />
              +36 70 564 6837
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELÉRHETŐSÉGEK ÉS TÉRKÉP (Világos dizájn)
// ═══════════════════════════════════════════════════════════════════════════
function ContactAndMap() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Bal oldal - Elérhetőségek */}
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
                  <p className="text-gray-600 text-lg">2500 Esztergom, Hősök tere 5.</p>
                  <p className="text-gray-500 text-sm mt-1">A Bazilika közelében, a belvárosban</p>
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
                  <p className="text-gray-500 text-sm mt-1">Hétfő - Péntek: 8:00 - 18:00</p>
                </div>
              </div>

              {/* Nyitvatartás */}
              <div className="flex gap-5 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-sky-600" />
                </div>
                <div className="w-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Nyitvatartás</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Hétfő - Csütörtök</span>
                      <span className="font-bold text-gray-900">8:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Péntek</span>
                      <span className="font-bold text-gray-900">8:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Szombat - Vasárnap</span>
                      <span className="font-bold text-gray-400">Zárva</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parkolás */}
              <div className="flex gap-5 p-6 bg-sky-50 rounded-3xl border border-sky-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Car className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Ingyenes parkolás</h4>
                  <p className="text-gray-600">A rendelő előtt 5 db ingyenes parkolóhely áll rendelkezésre pácienseink számára.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobb oldal - Térkép */}
          <div className="relative h-full min-h-[500px] lg:min-h-[700px]">
            <div className="sticky top-24 h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2677.5!2d18.7403!3d47.7856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDQ3JzA4LjIiTiAxOMKwNDQnMjUuMSJF!5e0!3m2!1sen!2shu!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              />
              {/* Térkép feletti gomb */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <a
                  href="https://maps.google.com/?q=Esztergom+Hősök+tere+5"
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
// SZOLGÁLTATÁSOK GRID (Világos dizájn)
// ═══════════════════════════════════════════════════════════════════════════
function ServicesSection() {
  const services = [
    {
      title: 'Fogimplantátum',
      description: 'Tartós megoldás foghiányra. Straumann és koreai implantátumok saját laborból.',
      href: '/kezelesek/implantatum',
      icon: <Stethoscope className="w-8 h-8" />,
      price: '240.000 Ft-tól',
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
// MIÉRT MINKET VÁLASSZON (Világos dizájn)
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
// VÉLEMÉNYEK (Világos dizájn)
// ═══════════════════════════════════════════════════════════════════════════
function ReviewsSection() {
  const reviews = [
    {
      name: 'Kovács Mária',
      rating: 5,
      text: '20 éve járok ide, és mindig maximálisan elégedett vagyok. A gyerekeim is itt kezeltetik a fogaikat.',
      date: '2025. október',
    },
    {
      name: 'Nagy József',
      rating: 5,
      text: 'Féltem a fogorvostól, de itt olyan kedvesek és türelmesek, hogy már nem izgulok. Az implantátumom tökéletes!',
      date: '2025. augusztus',
    },
    {
      name: 'Szabó Anna',
      rating: 5,
      text: 'A korona 3 nap alatt elkészült, máshol 3 hetet mondtak. És még olcsóbb is volt! Csak ajánlani tudom.',
      date: '2025. július',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
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
            <span className="text-gray-900 font-bold ml-2 text-lg">4.9 / 5</span>
            <span className="text-gray-500 font-medium ml-1">(320+ értékelés)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 relative"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-8 italic leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-gray-900 font-bold">{review.name}</span>
                <span className="text-gray-400 text-sm">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION (Egyezik a kezelések oldalon lévő prémium verzióval)
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
// PRÉMIUM 2026 FOOTER (Megegyezik)
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
// FŐ OLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function EsztergomPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <ContactAndMap />
      <ServicesSection />
      <WhyUsSection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
