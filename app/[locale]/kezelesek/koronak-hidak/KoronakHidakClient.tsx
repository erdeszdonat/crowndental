'use client';
import TreatmentHero from '@/components/TreatmentHero';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Shield, Clock, Heart, ArrowRight, Plus, Minus, Crown, Layers } from 'lucide-react';


function ServiceHero({ imageUrl }: { imageUrl: string }) {
  return <TreatmentHero imageUrl={imageUrl} contentKey="koronak-hidak" />;
}

function ProblemSolution() {
  const t = useTranslations('treatmentPages.koronak-hidak');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(2,132,199,0.1)]">
            <div className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('solutionTitle')}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{t('solutionDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const t = useTranslations('treatmentPages.koronak-hidak');
  const ts = useTranslations('treatmentPages.shared');
  const icons = [<Clock className="w-6 h-6" />, <Layers className="w-6 h-6" />, <Shield className="w-6 h-6" />, <Sparkles className="w-6 h-6" />, <Heart className="w-6 h-6" />, <Crown className="w-6 h-6" />];
  const benefitItems = t.raw('benefitItems') as Array<{ title: string; desc: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">{ts('whyCrownBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('benefitsTitle')}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
          {benefitItems.map((b, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h4>
              <p className="text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const t = useTranslations('treatmentPages.koronak-hidak');
  const ts = useTranslations('treatmentPages.shared');
  const steps = t.raw('processSteps') as Array<{ title: string; desc: string; time: string }>;
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">{ts('processBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('processTitle')}</h3>
        <div className="space-y-8 text-left">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-sky-100 text-sky-600 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm">{i + 1}.</div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium shadow-sm">
                <Clock className="w-4 h-4 text-sky-500" /> {s.time}
              </div>
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
  const t = useTranslations('treatmentPages.koronak-hidak');
  const ts = useTranslations('treatmentPages.shared');
  return (
    <section className="py-24 bg-sky-50 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">{t('ctaTitle')}</h2>
            <p className="text-lg text-sky-100 mb-10 max-w-2xl mx-auto">{t('ctaDesc')}</p>
            <Link href={`${p}/idopont`} className="crown-button crown-button-secondary">
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
  const t = useTranslations('treatmentPages.koronak-hidak');
  const ts = useTranslations('treatmentPages.shared');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-sky-600 font-bold text-4xl mb-12">{ts('faqTitle')}</h2>
        <div className="space-y-4 text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
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

export default function KoronakHidakClient({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="crown-page bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <main>
        <ServiceHero imageUrl={imageUrl} />
        <ProblemSolution />
        <Benefits />
        <ProcessSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
    </div>
  );
}
