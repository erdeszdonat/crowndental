'use client';

// components/ServicePage.tsx
// Crown Dental - Sales-fókuszú szolgáltatás oldal sablon
// Minden kezelés oldalon (implantátum, fogszabályozás, stb.) ezt használd

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  Phone,
  Calendar,
  Clock,
  Shield,
  Award,
  Building2,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Upload,
  Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TÍPUSOK
// ═══════════════════════════════════════════════════════════════════════════
interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServicePageProps {
  // Alapadatok
  slug: string;
  title: string;
  heroSubtitle: string;
  heroImage: string;

  // Probléma-megoldás narratíva
  problemStatement: string;
  solutionIntro: string;

  // Tartalom
  benefits: Benefit[];
  process: ProcessStep[];
  faq: FAQ[];

  // Árazás
  priceFrom: number;
  competitorPrice?: number;
  priceNote?: string;

  // Opcionális
  videoUrl?: string;
  beforeAfterImages?: { before: string; after: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BADGE KOMPONENS - 30 év, Saját Labor, stb.
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award className="w-6 h-6" />, value: '30+', label: 'év tapasztalat' },
    { icon: <Building2 className="w-6 h-6" />, value: 'Saját', label: 'fogtechnikai labor' },
    { icon: <Shield className="w-6 h-6" />, value: '100%', label: 'garancia' },
    { icon: <Clock className="w-6 h-6" />, value: '24h', label: 'visszahívás' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
        >
          <div className="text-amber-400 mb-2">{badge.icon}</div>
          <div className="text-2xl font-bold text-white">{badge.value}</div>
          <div className="text-sm text-slate-400 text-center">{badge.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRAJÁNLAT ÖSSZEHASONLÍTÓ CTA
// ═══════════════════════════════════════════════════════════════════════════
function QuoteCompareCTA({ priceFrom, competitorPrice }: { priceFrom: number; competitorPrice?: number }) {
  const savings = competitorPrice ? Math.round(((competitorPrice - priceFrom) / competitorPrice) * 100) : 40;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-amber-500/20"
    >
      {/* Háttér dekoráció */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Árajánlat-elemző
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Van már árajánlata máshonnan?
          </h3>
          <p className="text-lg text-slate-300 mb-6">
            Töltse fel, és <span className="text-amber-400 font-semibold">azonnal megmutatjuk</span>, 
            mennyit spórolhat nálunk a <span className="text-amber-400 font-semibold">saját laborunk</span> miatt.
          </p>

          {competitorPrice && (
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20 mb-6">
              <div className="text-4xl font-bold text-green-400">-{savings}%</div>
              <div className="text-slate-300">
                átlagos megtakarítás<br />
                <span className="text-sm text-slate-400">a budapesti klinikákhoz képest</span>
              </div>
            </div>
          )}

          <Link
            href="/#arajanlat-elemzo"
            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
          >
            <Upload className="w-5 h-5" />
            Árajánlat feltöltése
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="relative">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Áraink ettől indulnak:</div>
            <div className="text-5xl font-bold text-white mb-1">
              {priceFrom.toLocaleString('hu-HU')} <span className="text-2xl">Ft</span>
            </div>
            <div className="text-slate-400">Végleges ár a konzultáció után</div>

            {competitorPrice && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-500 line-through">
                  Budapesti átlagár: {competitorPrice.toLocaleString('hu-HU')} Ft
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISSZAHÍVÁS CTA KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
function CallbackCTA() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API hívás
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Köszönjük!</h3>
        <p className="text-slate-300">24 órán belül visszahívjuk a megadott számon.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Kérdése van? Visszahívjuk!
          </h3>
          <p className="text-blue-100">
            Hagyja meg telefonszámát, és kollégánk <strong>24 órán belül</strong> visszahívja 
            – ingyenes konzultáció, kötelezettség nélkül.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+36 30 123 4567"
            required
            className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Visszahívást kérek
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════════════
function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Gyakran Ismételt Kérdések
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ha nem találja a választ, hívjon minket vagy kérjen visszahívást!
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <span className="font-medium text-white pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-amber-400 transition-transform ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-5 text-slate-300"
              >
                {faq.answer}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function ServicePage({
  slug,
  title,
  heroSubtitle,
  heroImage,
  problemStatement,
  solutionIntro,
  benefits,
  process,
  faq,
  priceFrom,
  competitorPrice,
  priceNote,
  videoUrl,
  beforeAfterImages,
}: ServicePageProps) {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Háttérkép */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/60" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Főoldal</Link>
              <span>/</span>
              <Link href="/kezelesek" className="hover:text-white transition-colors">Kezelések</Link>
              <span>/</span>
              <span className="text-amber-400">{title}</span>
            </nav>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                href="tel:+36301234567"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all"
              >
                <Phone className="w-5 h-5" />
                +36 30 123 4567
              </a>
            </motion.div>

            {/* Trust badges a hero-ban */}
            <TrustBadges />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PROBLÉMA → MEGOLDÁS NARRATÍVA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl p-8 md:p-12 border border-red-500/20 mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
              Ismeri ezt a problémát?
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">{problemStatement}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl p-8 md:p-12 border border-green-500/20"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
              A Crown Dental megoldás
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">{solutionIntro}</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ELŐNYÖK
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Miért válasszon minket?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              30 év tapasztalat és saját fogtechnikai labor – ez a Crown Dental különbség
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ÁRAJÁNLAT ÖSSZEHASONLÍTÓ CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 container mx-auto px-4">
        <QuoteCompareCTA priceFrom={priceFrom} competitorPrice={competitorPrice} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          A KEZELÉS MENETE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              A kezelés menete
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Lépésről lépésre – tudja, mire számíthat
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Összekötő vonal */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/50 to-transparent hidden md:block" />

              <div className="space-y-8">
                {process.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex gap-6"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-xl z-10">
                      {step.step}
                    </div>
                    <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        {step.duration && (
                          <span className="text-sm text-amber-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {step.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4">
        <FAQSection faqs={faq} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VISSZAHÍVÁS CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 container mx-auto px-4">
        <CallbackCTA />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VÉGSŐ CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Készen áll a változásra?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Foglaljon időpontot még ma – az első konzultáció ingyenes!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/idopont"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
            >
              <Calendar className="w-6 h-6" />
              Időpont foglalása
            </Link>
            <Link
              href="/#arajanlat-elemzo"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/20 transition-all"
            >
              <Upload className="w-6 h-6" />
              Árajánlat összehasonlítás
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
