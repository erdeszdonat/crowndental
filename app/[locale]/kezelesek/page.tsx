'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  Phone,
  Calendar,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
  Smile,
  Building2,
  Crown,
  Zap,
  Eye,
  Microscope,
  Wrench,
  Baby,
  Search,
  Activity
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: true,
});

// Icons in the same order as the cards array in messages
const cardIcons = [
  <Shield className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Smile className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Crown className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Activity className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Search className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Eye className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Heart className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Microscope className="w-6 h-6 sm:w-7 sm:h-7" />,
  <Baby className="w-6 h-6 sm:w-7 sm:h-7" />,
];

const cardColors = [
  'from-rose-500 to-orange-500',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-yellow-500',
  'from-sky-400 to-cyan-500',
  'from-teal-500 to-emerald-500',
  'from-indigo-500 to-blue-600',
  'from-red-500 to-pink-500',
  'from-green-500 to-lime-500',
  'from-fuchsia-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-slate-500 to-gray-600',
  'from-pink-400 to-rose-400',
];

function HeroSection() {
  const t = useTranslations('treatments');
  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-gray-50">
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-100/60 to-violet-100/40 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/50 to-rose-100/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-lg shadow-sky-100/50 border border-sky-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-8">
            <Building2 className="w-4 h-4" /> {t('heroBadge')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
            {t('heroTitle1')} <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">{t('heroTitle2')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg sm:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitleStart')} <strong className="text-gray-700">{t('heroSavings')}</strong> {t('heroSubtitleEnd')}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function TreatmentCard({ card, index, imageUrl }: { card: { id: string; title: string; description: string }; index: number; imageUrl?: string }) {
  const t = useTranslations('treatments');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.05, duration: 0.4 }}>
      <Link href={`${p}/kezelesek/${card.id}`} className="group block h-[320px] sm:h-[360px]">
        <div className={`relative h-full w-full rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-900/20 ${!imageUrl ? `bg-gradient-to-br ${cardColors[index] ?? 'from-sky-500 to-blue-600'}` : 'bg-gray-900'}`}>
          {imageUrl && (
            <>
              <img
                src={`${imageUrl}?auto=format&w=600`}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent opacity-90" />
            </>
          )}
          {!imageUrl && (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.4)_0%,_transparent_50%)]" />
          )}
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-inner">
              {cardIcons[index]}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
              {card.title}
            </h3>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 drop-shadow-sm font-light">
              {card.description}
            </p>
            <div className="flex items-center gap-2 text-sky-400 text-sm sm:text-base font-bold uppercase tracking-wider group-hover:gap-3 transition-all mt-auto">
              <span>{t('cardDetails')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TreatmentCardsSection() {
  const t = useTranslations('treatments');
  // @ts-ignore
  const cards = t.raw('cards') as Array<{ id: string; title: string; description: string }>;
  const [sanityImages, setSanityImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const query = `*[_type == "treatment"]{ "slug": slug.current, "imageUrl": mainImage.asset->url }`;
        const results = await client.fetch(query);
        const imageMap: Record<string, string> = {};
        results.forEach((item: any) => {
          if (item.slug && item.imageUrl) { imageMap[item.slug] = item.imageUrl; }
        });
        setSanityImages(imageMap);
      } catch (error) {
        console.error("Hiba a Sanity képek lekérésekor:", error);
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <TreatmentCard
              key={card.id}
              card={card}
              index={index}
              imageUrl={sanityImages[card.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceListSection() {
  const t = useTranslations('treatments');
  // @ts-ignore
  const priceCategories = t.raw('priceCategories') as Array<{ id: string; title: string; items: Array<{ name: string; price: string; highlight?: boolean }> }>;
  return (
    <section id="arlista" className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-[100px]" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            {t('priceListTitle')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-gray-500 text-lg leading-relaxed font-light">
            {t('priceListSubtitle')}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {priceCategories.map((category, catIndex) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: catIndex * 0.1 }} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{category.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-5 transition-colors ${item.highlight ? 'bg-gradient-to-r from-sky-50 to-violet-50' : 'bg-white hover:bg-gray-50'}`}>
                    <span className={`text-base sm:text-lg mb-2 sm:mb-0 pr-4 ${item.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold whitespace-nowrap ${item.highlight ? 'bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mt-10 sm:mt-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 sm:p-8 flex gap-4 sm:gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('disclaimerTitle')}</h4>
              <p className="text-gray-600 leading-relaxed text-base">{t('disclaimerText')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('treatments');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-sky-600 via-sky-500 to-violet-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">{t('ctaTitle')}</h2>
        <p className="text-lg sm:text-xl text-sky-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light">{t('ctaSubtitle')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <a href="tel:+36705646837" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-full transition-all border border-white/30 text-base md:text-lg shadow-inner">
            <Phone className="w-5 h-5" /> +36 70 564 6837
          </a>
          <Link href={`${p}/idopont`} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-sky-700 font-bold rounded-full transition-all shadow-xl shadow-sky-900/20 text-base md:text-lg">
            <Calendar className="w-5 h-5" /> {t('ctaBtn')}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function KezelesekPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TreatmentCardsSection />
      <PriceListSection />
      <CTASection />
    </main>
  );
}
