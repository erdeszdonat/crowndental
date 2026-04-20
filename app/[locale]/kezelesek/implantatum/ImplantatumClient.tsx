'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  Calendar, ChevronDown, CheckCircle2, Sparkles, Shield,
  Clock, Banknote, Stethoscope, Microscope, Heart,
  ArrowRight, Upload, Plus, Minus
} from 'lucide-react';

const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });

function ServiceHero() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations('treatmentPages.implantatum');
  const ts = useTranslations('treatmentPages.shared');
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "implantatum"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
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
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-sky-50/50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-6">
              <Stethoscope className="w-4 h-4" /> {t('heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              <span className="text-sky-600">{t('heroTitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">
              {t('heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`${p}/idopont`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-600/30">
                <Calendar className="w-5 h-5" /> {ts('consultationBtn')}
              </Link>
              <a href="#arajanlat-elemzo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-700 font-bold rounded-full hover:bg-gray-50 transition-all shadow-sm border border-gray-200">
                <Upload className="w-5 h-5" /> {t('quoteAnalyzerTitle')}
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-sky-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
              {imageUrl && <img src={imageUrl} alt="Implantátum beültetés" className="w-full h-full object-cover animate-in fade-in duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
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

function ProblemSolution() {
  const t = useTranslations('treatmentPages.implantatum');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(14,165,233,0.1)] relative">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('solutionTitle')}</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{t('solutionDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const t = useTranslations('treatmentPages.implantatum');
  const icons = [<Shield className="w-6 h-6" />, <Clock className="w-6 h-6" />, <Banknote className="w-6 h-6" />, <Stethoscope className="w-6 h-6" />, <Microscope className="w-6 h-6" />, <Heart className="w-6 h-6" />];
  const benefitItems = t.raw('benefitItems') as Array<{ title: string; desc: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">{t('benefitsBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('benefitsTitle')}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
          {benefitItems.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h4>
              <p className="text-gray-500 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const t = useTranslations('treatmentPages.implantatum');
  const steps = t.raw('processSteps') as Array<{ title: string; desc: string; time: string }>;
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">{t('processBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('processTitle')}</h3>
        <div className="space-y-8 text-left">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-sky-100 text-sky-600 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm">{i + 1}.</div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex-shrink-0 md:text-right">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium shadow-sm"><Clock className="w-4 h-4 text-sky-500" /> {s.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteAnalyzerSection() {
  const t = useTranslations('treatmentPages.implantatum');
  const [isDragging, setIsDragging] = useState(false);
  return (
    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6"><Sparkles className="w-4 h-4" /> {t('quoteAnalyzerBadge')}</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{t('quoteAnalyzerTitle')}</h2>
            <p className="text-xl text-gray-300 mb-8 font-light">{t('quoteAnalyzerDesc')}</p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className={`bg-white/5 backdrop-blur-xl border-2 border-dashed rounded-3xl p-10 lg:p-16 text-center transition-all ${isDragging ? 'border-sky-400 bg-sky-500/10 scale-105' : 'border-gray-600'}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}>
              <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Upload className="w-10 h-10 text-sky-400" /></div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('quoteAnalyzerDropTitle')}</h3>
              <button className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors">{t('quoteAnalyzerBtn')}</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('treatmentPages.implantatum');
  const ts = useTranslations('treatmentPages.shared');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-16">{ts('faqTitle')}</h3>
        <div className="space-y-4 text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-sky-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
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

export default function ImplantatumClient() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <main>
        <ServiceHero />
        <ProblemSolution />
        <Benefits />
        <ProcessSection />
        <QuoteAnalyzerSection />
        <FAQSection />
      </main>
    </div>
  );
}
