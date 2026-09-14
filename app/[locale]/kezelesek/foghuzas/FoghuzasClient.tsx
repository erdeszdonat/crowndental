'use client';
import TreatmentHero from '@/components/TreatmentHero';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Shield, Clock, Heart, ArrowRight, Plus, Minus, Activity, Layers, CheckCircle2, Zap } from 'lucide-react';


function ServiceHero({ imageUrl }: { imageUrl: string }) {
  return <TreatmentHero imageUrl={imageUrl} contentKey="foghuzas" />;
}

function ProblemSolution() {
  const t = useTranslations('treatmentPages.foghuzas');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-orange-50 rounded-3xl border border-orange-100 shadow-[0_8px_30px_rgb(249,115,22,0.1)]">
            <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('solutionTitle')}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{t('solutionDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const t = useTranslations('treatmentPages.foghuzas');
  const icons = [<Activity className="w-8 h-8" />, <Layers className="w-8 h-8" />, <Zap className="w-8 h-8" />];
  const services = t.raw('services') as Array<{ title: string; desc: string; price: string }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-orange-600 font-bold uppercase tracking-widest mb-3">{t('servicesBadge')}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('servicesTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-lg">{s.desc}</p>
              <div className="text-orange-600 font-extrabold text-xl">{s.price}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const t = useTranslations('treatmentPages.foghuzas');
  const ts = useTranslations('treatmentPages.shared');
  const icons = [<Heart className="w-6 h-6" />, <CheckCircle2 className="w-6 h-6" />, <Shield className="w-6 h-6" />, <Sparkles className="w-6 h-6" />];
  const benefitItems = t.raw('benefitItems') as Array<{ title: string; desc: string }>;
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-orange-600 font-bold uppercase tracking-widest mb-3">{ts('whyCrownBadge')}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('benefitsTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefitItems.map((b, i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
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
  const t = useTranslations('treatmentPages.foghuzas');
  const ts = useTranslations('treatmentPages.shared');
  const steps = t.raw('processSteps') as Array<{ title: string; desc: string; time: string }>;
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-orange-600 font-bold uppercase tracking-widest mb-3">{ts('processBadge')}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('processTitle')}</h3>
        </div>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 items-start md:items-center shadow-sm">
              <div className="flex-shrink-0 w-16 h-16 bg-orange-50 border-2 border-orange-100 text-orange-600 font-black text-2xl rounded-2xl flex items-center justify-center shadow-sm">{i + 1}.</div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{s.desc}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 text-orange-700 font-medium shadow-sm">
                <Clock className="w-4 h-4" /> {s.time}
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
  const t = useTranslations('treatmentPages.foghuzas');
  const ts = useTranslations('treatmentPages.shared');
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-orange-50/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-200/40 rounded-full blur-[100px]" />
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-orange-600/20 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-8 border border-white/20">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">{t('ctaTitle')}</h2>
            <p className="text-lg md:text-xl text-orange-100 mb-10 max-w-2xl mx-auto font-normal">{t('ctaDesc')}</p>
            <Link href={`${p}/idopont`} className="crown-button crown-button-secondary">
              <span className="text-lg">{ts('consultationBtn')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('treatmentPages.foghuzas');
  const ts = useTranslations('treatmentPages.shared');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16"><h2 className="text-orange-600 font-bold text-4xl mb-4">{ts('faqTitle')}</h2></div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-orange-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
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

export default function FoghuzasClient({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="crown-page bg-white min-h-screen selection:bg-orange-200 selection:text-orange-900">
      <main>
        <ServiceHero imageUrl={imageUrl} />
        <ProblemSolution />
        <ServicesSection />
        <Benefits />
        <ProcessSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
    </div>
  );
}
