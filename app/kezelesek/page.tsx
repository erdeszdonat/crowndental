'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Sparkles,
  Crown,
  Scissors,
  Baby,
  Search,
  Phone,
  Calendar,
  ArrowRight,
  ChevronDown,
  Building2,
  Clock,
  Shield,
  Award,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA ADATOK
// ═══════════════════════════════════════════════════════════════════════════
const priceCategories = [
  {
    id: 'diagnosztika',
    title: 'Diagnosztika és Alapkezelések',
    icon: <Search className="w-6 h-6" />,
    color: 'blue',
    items: [
      { name: 'Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv', price: '10.000 Ft', link: '/kezelesek/allapotfelmeres' },
      { name: 'Tömések', price: '30.000 - 35.000 Ft', link: '/kezelesek/tomes' },
      { name: 'Foghúzás', price: '25.000 - 35.000 Ft', link: '/kezelesek/foghuzas' },
      { name: 'Röntgen felvétel (kisröntgen / egy fogról)', price: '5.000 Ft' },
      { name: 'Panoráma röntgen', price: '6.000 Ft' },
    ],
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'green',
    items: [
      { name: 'Gyökértömés (Egy gyökerű)', price: '25.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés (Két gyökerű)', price: '30.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés (Három gyökerű)', price: '33.000 Ft', link: '/kezelesek/gyokerkezeles' },
      { name: 'Gyökértömés eltávolítása', price: '20.000 Ft' },
      { name: 'Gyökérkezelés alkalmanként', price: '10.000 Ft' },
    ],
  },
  {
    id: 'esztetika',
    title: 'Fogmegőrzés és Esztétika',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'purple',
    items: [
      { name: 'Fogkőeltávolítás (állcsontonként)', price: '15.000 Ft', link: '/kezelesek/fogko-eltavolitas' },
      { name: 'Fogfehérítés szilikon sínnel (otthoni) / fogívenként', price: '30.000 Ft', link: '/kezelesek/fogfeherites' },
      { name: 'Fogfehérítés rendelői (lámpás) / fogívenként', price: '45.000 Ft', link: '/kezelesek/fogfeherites', highlight: true },
    ],
  },
  {
    id: 'fogpotlas',
    title: 'Fogpótlások és Koronák',
    icon: <Crown className="w-6 h-6" />,
    color: 'amber',
    items: [
      { name: 'Ideiglenes korona (rövidtávú, 1-2 hétre)', price: '6.000 Ft' },
      { name: 'Ideiglenes korona (hosszútávú, max. 1 évre)', price: '15.000 Ft' },
      { name: 'Fémkerámia korona', price: '42.000 Ft', link: '/kezelesek/koronak-es-hidak' },
      { name: 'Cirkónium korona (fémmentes)', price: '55.000 Ft', link: '/kezelesek/koronak-es-hidak', highlight: true },
      { name: 'Egyéni fogszínek készítése (foganként)', price: '15.000 Ft' },
      { name: 'Kivehető fogsor egy állcsontra (kompozit)', price: '110.000 Ft', link: '/kezelesek/fogsor' },
      { name: 'Fémlemezes fogsor egy állcsontra', price: '150.000 Ft', link: '/kezelesek/fogsor' },
      { name: 'Régi híd eltávolítása (pillér foganként)', price: '12.000 Ft' },
      { name: 'Fogsor alábélelés', price: '25.000 Ft' },
    ],
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet és Implantáció',
    icon: <Scissors className="w-6 h-6" />,
    color: 'red',
    items: [
      { name: 'Foghúzás műtéttel', price: '55.000 Ft', link: '/kezelesek/foghuzas' },
      { name: 'Bölcsességfog eltávolítása', price: '55.000 Ft', link: '/kezelesek/szajsebeszet' },
      { name: 'Gyökércsúcs rezekció', price: '55.000 Ft', link: '/kezelesek/szajsebeszet' },
      { name: 'DIO Implantátum', price: '240.000 Ft', link: '/kezelesek/implantatum', highlight: true },
      { name: 'ALPHA BIO Implantátum', price: '180.000 Ft', link: '/kezelesek/implantatum' },
      { name: 'Csontpótlás', price: '190.000 Ft', link: '/kezelesek/implantatum' },
    ],
  },
  {
    id: 'gyermek',
    title: 'Gyermekfogászat és Fogszabályozás',
    icon: <Baby className="w-6 h-6" />,
    color: 'pink',
    items: [
      { name: 'Tömés tejfogakba', price: '15.000 Ft', link: '/kezelesek/gyerekfogaszat' },
      { name: 'Barázda zárás', price: '15.000 Ft' },
      { name: 'Rögzített készülékek', price: '190.000 - 285.000 Ft', link: '/kezelesek/fogszabalyozas', highlight: true },
      { name: 'Kivehető készülékek', price: '60.000 - 90.000 Ft', link: '/kezelesek/fogszabalyozas' },
      { name: 'Rögzített készülék aktiválása', price: '10.000 - 15.000 Ft' },
      { name: 'Kivehető készülék aktiválása', price: '5.000 - 8.000 Ft' },
    ],
  },
];

// Szín mapping
const colorClasses: Record<string, { bg: string; border: string; text: string; bgLight: string }> = {
  blue: { bg: 'bg-blue-500', border: 'border-blue-500/30', text: 'text-blue-400', bgLight: 'bg-blue-500/10' },
  green: { bg: 'bg-green-500', border: 'border-green-500/30', text: 'text-green-400', bgLight: 'bg-green-500/10' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-500/30', text: 'text-purple-400', bgLight: 'bg-purple-500/10' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-500/30', text: 'text-amber-400', bgLight: 'bg-amber-500/10' },
  red: { bg: 'bg-red-500', border: 'border-red-500/30', text: 'text-red-400', bgLight: 'bg-red-500/10' },
  pink: { bg: 'bg-pink-500', border: 'border-pink-500/30', text: 'text-pink-400', bgLight: 'bg-pink-500/10' },
};

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6"
          >
            <Building2 className="w-4 h-4" />
            Saját fogtechnikai labor = kedvezőbb árak
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Kezeléseink és{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Árlistánk
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 mb-8"
          >
            Transzparens árazás, rejtett költségek nélkül. A saját laborunk miatt akár 40%-kal kedvezőbbek vagyunk.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: <Shield className="w-4 h-4" />, text: 'Garancia minden munkára' },
              { icon: <Clock className="w-4 h-4" />, text: 'Gyors elkészülés' },
              { icon: <Award className="w-4 h-4" />, text: 'Prémium anyagok' },
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
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KATEGÓRIA KÁRTYA KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
function CategoryCard({ category, index }: { category: typeof priceCategories[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0); // Első alapból nyitva
  const colors = colorClasses[category.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border ${colors.border} overflow-hidden bg-slate-900/50 backdrop-blur-sm`}
    >
      {/* Header - kattintható */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${colors.bgLight} rounded-xl flex items-center justify-center ${colors.text}`}>
            {category.icon}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-white">{category.title}</h2>
            <p className="text-sm text-slate-400">{category.items.length} szolgáltatás</p>
          </div>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Tartalom */}
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/10"
        >
          <div className="p-6 space-y-3">
            {category.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  item.highlight ? `${colors.bgLight} border ${colors.border}` : 'bg-white/5'
                }`}
              >
                <div className="flex-1">
                  {item.link ? (
                    <Link
                      href={item.link}
                      className={`font-medium hover:${colors.text} transition-colors ${
                        item.highlight ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {item.name}
                      <ArrowRight className="inline w-4 h-4 ml-2 opacity-50" />
                    </Link>
                  ) : (
                    <span className={item.highlight ? 'text-white font-medium' : 'text-slate-200'}>
                      {item.name}
                    </span>
                  )}
                </div>
                <div className={`font-bold whitespace-nowrap ml-4 ${item.highlight ? colors.text : 'text-amber-400'}`}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA SECTION
// ═══════════════════════════════════════════════════════════════════════════
function PriceListSection() {
  return (
    <section className="py-12 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {priceCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Megjegyzés */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <p className="text-amber-200 text-sm">
            <strong>Megjegyzés:</strong> Az árak tájékoztató jellegűek. A végleges ár a vizsgálat után, 
            a kezelési terv alapján kerül meghatározásra. Az első konzultáció ingyenes!
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRAJÁNLAT ÖSSZEHASONLÍTÓ CTA
// ═══════════════════════════════════════════════════════════════════════════
function QuoteCompareCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-amber-500/20">
            {/* Háttér dekoráció */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Van már árajánlata máshonnan?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Töltse fel, és <span className="text-amber-400 font-semibold">azonnal megmutatjuk</span>, 
                mennyit spórolhat nálunk a saját laborunk miatt.
              </p>
              <Link
                href="/#arajanlat-elemzo"
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
              >
                Árajánlat összehasonlítás
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
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
    <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-500">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Kérdése van az árakkal kapcsolatban?
        </h2>
        <p className="text-xl text-slate-800 mb-8">
          Hívjon minket vagy foglaljon ingyenes konzultációt!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
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
            Ingyenes konzultáció
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function KezelesekPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <HeroSection />
      <PriceListSection />
      <QuoteCompareCTA />
      <CTASection />
    </main>
  );
}
