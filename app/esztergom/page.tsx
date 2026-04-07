'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Háttér */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6"
          >
            <Award className="w-4 h-4" />
            30+ év tapasztalat Esztergomban
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Fogászat{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Esztergomban
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed"
          >
            1994 óta a város megbízható fogászata. <strong className="text-white">Saját fogtechnikai laborunk</strong> miatt 
            gyorsabbak és kedvezőbbek vagyunk – prémium japán és koreai anyagokkal.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            {[
              { icon: <Users className="w-4 h-4" />, text: '10.000+ páciens' },
              { icon: <Building2 className="w-4 h-4" />, text: 'Saját labor' },
              { icon: <Car className="w-4 h-4" />, text: 'Ingyenes parkolás' },
              { icon: <Shield className="w-4 h-4" />, text: 'Garancia' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-slate-300 text-sm border border-white/10"
              >
                <span className="text-amber-400">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
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
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
            >
              <Calendar className="w-5 h-5" />
              Időpontfoglalás
            </Link>
            <a
              href="tel:+3633123456"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              +36 33 123 456
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ELÉRHETŐSÉGEK ÉS TÉRKÉP
// ═══════════════════════════════════════════════════════════════════════════
function ContactAndMap() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Bal oldal - Elérhetőségek */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Látogasson el hozzánk!
            </h2>

            <div className="space-y-6">
              {/* Cím */}
              <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Cím</h3>
                  <p className="text-slate-300">2500 Esztergom, Hősök tere 5.</p>
                  <p className="text-slate-400 text-sm mt-1">A Bazilika közelében, a belvárosban</p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Telefon</h3>
                  <a href="tel:+3633123456" className="text-amber-400 hover:text-amber-300 text-lg font-medium">
                    +36 33 123 456
                  </a>
                  <p className="text-slate-400 text-sm mt-1">Hétfő - Péntek: 8:00 - 18:00</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                  <a href="mailto:esztergom@crowndental.hu" className="text-amber-400 hover:text-amber-300">
                    esztergom@crowndental.hu
                  </a>
                  <p className="text-slate-400 text-sm mt-1">24 órán belül válaszolunk</p>
                </div>
              </div>

              {/* Nyitvatartás */}
              <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Nyitvatartás</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hétfő - Csütörtök</span>
                      <span className="text-white font-medium">8:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Péntek</span>
                      <span className="text-white font-medium">8:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Szombat - Vasárnap</span>
                      <span className="text-slate-500">Zárva</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parkolás */}
              <div className="flex gap-4 p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Ingyenes parkolás</h3>
                  <p className="text-slate-300">A rendelő előtt 5 db ingyenes parkolóhely áll rendelkezésre pácienseink számára.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobb oldal - Térkép */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="rounded-2xl overflow-hidden border border-white/10 h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2677.5!2d18.7403!3d47.7856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDQ3JzA4LjIiTiAxOMKwNDQnMjUuMSJF!5e0!3m2!1sen!2shu!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://maps.google.com/?q=Esztergom+Hősök+tere+5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Megnyitás Google Maps-ben
                  <ArrowRight className="w-4 h-4" />
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
// SZOLGÁLTATÁSOK GRID
// ═══════════════════════════════════════════════════════════════════════════
function ServicesSection() {
  const services = [
    {
      title: 'Fogimplantátum',
      description: 'Tartós megoldás foghiányra. Straumann és koreai implantátumok saját laborból.',
      href: '/kezelesek/implantatum',
      icon: <Stethoscope className="w-6 h-6" />,
      price: '280.000 Ft-tól',
    },
    {
      title: 'Fogkorona',
      description: 'Cirkónium és porcelán koronák 3 nap alatt a saját laborunkból.',
      href: '/kezelesek/koronak-es-hidak',
      icon: <Sparkles className="w-6 h-6" />,
      price: '89.000 Ft-tól',
    },
    {
      title: 'Fogfehérítés',
      description: 'Professzionális fehérítés 1 óra alatt, akár 8 árnyalattal világosabb.',
      href: '/kezelesek/fogfeherites',
      icon: <Star className="w-6 h-6" />,
      price: '45.000 Ft-tól',
    },
    {
      title: 'Fogszabályozás',
      description: 'Láthatatlan sínek és hagyományos készülékek felnőtteknek és gyerekeknek.',
      href: '/kezelesek/fogszabalyozas',
      icon: <CheckCircle2 className="w-6 h-6" />,
      price: '350.000 Ft-tól',
    },
    {
      title: 'Fogsor',
      description: 'Kivehető és rögzített fogsorok saját laborból, tökéletes illeszkedéssel.',
      href: '/kezelesek/fogsor',
      icon: <Users className="w-6 h-6" />,
      price: '120.000 Ft-tól',
    },
    {
      title: 'Állapotfelmérés',
      description: 'Teljes körű vizsgálat panoráma röntgennel. Első konzultáció ingyenes!',
      href: '/kezelesek/allapotfelmeres',
      icon: <Shield className="w-6 h-6" />,
      price: 'Ingyenes',
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Szolgáltatásaink Esztergomban
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Teljes körű fogászati ellátás egy helyen – a konzultációtól a végleges fogpótlásig.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={service.href}
                className="group block p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-400 mb-4 text-sm">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-semibold">{service.price}</span>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/kezelesek"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium"
          >
            Összes szolgáltatás megtekintése
            <ArrowRight className="w-4 h-4" />
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
      number: '10.000+',
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
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Miért a Crown Dental Esztergom?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            30 éve bizonyítunk – és továbbra is ugyanazzal az elkötelezettséggel dolgozunk.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="text-5xl font-bold text-amber-400 mb-2">{reason.number}</div>
              <div className="text-lg font-semibold text-white mb-2">{reason.label}</div>
              <p className="text-slate-400 text-sm">{reason.description}</p>
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
    {
      name: 'Kovács Mária',
      rating: 5,
      text: '20 éve járok ide, és mindig maximálisan elégedett vagyok. A gyerekeim is itt kezeltetik a fogaikat.',
      date: '2024. március',
    },
    {
      name: 'Nagy József',
      rating: 5,
      text: 'Féltem a fogorvostól, de itt olyan kedvesek és türelmesek, hogy már nem izgulok. Az implantátumom tökéletes!',
      date: '2024. február',
    },
    {
      name: 'Szabó Anna',
      rating: 5,
      text: 'A korona 3 nap alatt elkészült, máshol 3 hetet mondtak. És még olcsóbb is volt! Csak ajánlani tudom.',
      date: '2024. január',
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pácienseink mondták
          </h2>
          <div className="flex items-center justify-center gap-2 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="text-white font-semibold ml-2">4.9 / 5</span>
            <span className="text-slate-400 ml-1">(320+ vélemény)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-4 italic">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{review.name}</span>
                <span className="text-slate-500 text-sm">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://g.page/crowndental/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all"
          >
            Összes vélemény a Google-ön
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════════════════
function CTASection() {
  const [phone, setPhone] = useState('');

  return (
    <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-500">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Foglaljon időpontot még ma!
          </h2>
          <p className="text-xl text-slate-800 mb-8">
            Az első konzultáció ingyenes. Hívjon minket vagy kérjen visszahívást!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a
              href="tel:+3633123456"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
            >
              <Phone className="w-5 h-5" />
              +36 33 123 456
            </a>
            <Link
              href="/idopont"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              Online időpontfoglalás
            </Link>
          </div>

          <p className="text-slate-800">
            Vagy hagyja meg telefonszámát, és <strong>24 órán belül visszahívjuk</strong>:
          </p>
          <form className="mt-4 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+36 30 123 4567"
              className="flex-1 px-5 py-3 bg-white/90 border-2 border-white rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-900"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
            >
              Visszahívást kérek
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function EsztergomPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <HeroSection />
      <ContactAndMap />
      <ServicesSection />
      <WhyUsSection />
      <ReviewsSection />
      <CTASection />
    </main>
  );
}
