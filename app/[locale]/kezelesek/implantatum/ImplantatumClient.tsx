'use client';
import TreatmentHero from '@/components/TreatmentHero';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, Clock, Banknote, Stethoscope, Microscope, Heart, ArrowRight, Plus, Minus } from 'lucide-react';


function ServiceHero({ imageUrl }: { imageUrl: string }) {
  return <TreatmentHero imageUrl={imageUrl} contentKey="implantatum" />;
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
              <p className="text-slate-600 leading-relaxed">{b.desc}</p>
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
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations('treatmentPages.implantatum');
  return (
    <section id="arajanlat-elemzo" className="bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-5">{t('quoteAnalyzerTitle')}</h2>
        <p className="text-slate-600 leading-relaxed mb-6">{t('quoteAnalyzerDesc')}</p>
        <Link href={`${p}/#arajanlat-elemzo`} className="crown-button">{t('quoteAnalyzerBtn')}<ArrowRight size={18} aria-hidden="true" /></Link>
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

export default function ImplantatumClient({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="crown-page bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <main>
        <ServiceHero imageUrl={imageUrl} />
        <ProblemSolution />
        <Benefits />
        <ProcessSection />
        <QuoteAnalyzerSection />
        <FAQSection />
      </main>
    </div>
  );
}
