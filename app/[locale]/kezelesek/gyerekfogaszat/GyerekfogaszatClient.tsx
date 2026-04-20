'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  Calendar, ChevronDown, Sparkles, Shield, Clock, Heart,
  ArrowRight, Plus, Minus, Baby, Smile, CheckCircle2,
  Rocket, Gift, Star
} from 'lucide-react';

const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });

function ServiceHero() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const ts = useTranslations('treatmentPages.shared');
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "gyerekfogaszat"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) {
        console.error("Sanity kép hiba:", error);
      }
    };
    fetchImage();
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-pink-50/80 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-rose-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-pink-500 text-sm font-bold tracking-wide uppercase mb-6">
              <Baby className="w-4 h-4" /> {t('heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {t('heroTitle').split('Crown Dental')[0]}<span className="text-pink-500">Crown Dental</span>{t('heroTitle').split('Crown Dental')[1]}
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">{t('heroDesc')}</p>
            <Link href={`${p}/idopont`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-all shadow-lg hover:shadow-pink-500/30">
              <Calendar className="w-5 h-5" /> {ts('consultationBtn')}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-pink-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
              {imageUrl && <img src={imageUrl} alt="Gyermekfogászat" className="w-full h-full object-cover animate-in fade-in duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500"><Smile className="w-6 h-6" /></div>
              <div>
                <div className="text-gray-500 text-sm font-medium">{t('heroPriceLabel')}</div>
                <div className="text-2xl font-extrabold text-gray-900">{t('heroPriceValue')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ParentsSection() {
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-pink-500 font-bold uppercase tracking-widest mb-3">{t('parentsBadge')}</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('parentsTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-pink-50 rounded-3xl border border-pink-100 shadow-[0_8px_30px_rgb(236,72,153,0.1)]">
            <div className="w-14 h-14 bg-pink-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('solutionTitle')}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{t('solutionDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function KidsInteractiveSection() {
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const kidsFunFacts = t.raw('kidsFunFacts') as Array<{ title: string; desc: string }>;
  const colors = ["bg-sky-100 border-sky-200", "bg-amber-100 border-amber-200", "bg-pink-100 border-pink-200"];
  const icons = [<Rocket className="w-10 h-10 text-sky-500" />, <Sparkles className="w-10 h-10 text-amber-500" />, <Gift className="w-10 h-10 text-pink-500" />];
  return (
    <section className="py-24 relative overflow-hidden bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block bg-yellow-100 text-yellow-800 font-black px-6 py-2 rounded-full mb-4 transform -rotate-2 border border-yellow-300 shadow-sm">{t('kidsSectionBadge')}</div>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">{t('kidsSectionTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {kidsFunFacts.map((fact, i) => (
            <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: i * 0.4 }}
              className={`p-8 rounded-[2.5rem] border-4 shadow-lg flex flex-col items-center text-center ${colors[i]}`}>
              <div className="bg-white p-4 rounded-full shadow-inner mb-6">{icons[i]}</div>
              <h4 className="text-2xl font-black text-gray-800 mb-3">{fact.title}</h4>
              <p className="text-gray-700 font-medium leading-relaxed">{fact.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const icons = [<CheckCircle2 className="w-8 h-8" />, <Sparkles className="w-8 h-8" />, <Minus className="w-8 h-8" />, <Smile className="w-8 h-8" />];
  const services = t.raw('services') as Array<{ title: string; desc: string; price: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-pink-500 font-bold uppercase tracking-widest mb-3">{t('servicesBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('servicesTitle')}</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
              <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h4>
              <p className="text-gray-500 leading-relaxed mb-6 flex-1 text-lg">{s.desc}</p>
              <div className="text-pink-500 font-extrabold text-xl">{s.price}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppointmentCTASection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const ts = useTranslations('treatmentPages.shared');
  return (
    <section className="py-24 bg-pink-50 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <Baby className="w-16 h-16 text-white/20 absolute -top-4 -right-4" />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">{t('ctaTitle')}</h2>
            <p className="text-lg text-pink-100 mb-10 max-w-2xl mx-auto">{t('ctaDesc')}</p>
            <Link href={`${p}/idopont`} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-pink-600 font-extrabold rounded-full shadow-xl hover:scale-105 transition-all group">
              <span className="text-lg">{ts('consultationBtn')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const ts = useTranslations('treatmentPages.shared');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-pink-500 font-bold text-4xl mb-12 text-center">{ts('faqTitle')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-pink-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="px-6 pb-6 text-gray-600 text-lg border-t border-gray-50 pt-4">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function GyerekfogaszatClient() {
  return (
    <div className="bg-white min-h-screen selection:bg-pink-200 selection:text-pink-900">
      <main>
        <ServiceHero />
        <ParentsSection />
        <KidsInteractiveSection />
        <ServicesSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
    </div>
  );
}
