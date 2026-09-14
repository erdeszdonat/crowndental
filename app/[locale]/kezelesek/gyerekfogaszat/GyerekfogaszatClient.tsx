'use client';
import TreatmentHero from '@/components/TreatmentHero';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowRight, Plus, Minus, Baby, Smile, CheckCircle2, Rocket, Gift } from 'lucide-react';


function ServiceHero({ imageUrl }: { imageUrl: string }) {
  return <TreatmentHero imageUrl={imageUrl} contentKey="gyerekfogaszat" />;
}

function ParentsSection() {
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-sky-500 font-bold uppercase tracking-widest mb-3">{t('parentsBadge')}</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('parentsTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(236,72,153,0.1)]">
            <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
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
  const colors = ["bg-sky-100 border-sky-200", "bg-amber-100 border-amber-200", "bg-sky-100 border-sky-200"];
  const icons = [<Rocket className="w-10 h-10 text-sky-500" />, <Sparkles className="w-10 h-10 text-amber-500" />, <Gift className="w-10 h-10 text-sky-500" />];
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
        <h2 className="text-sky-500 font-bold uppercase tracking-widest mb-3">{t('servicesBadge')}</h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">{t('servicesTitle')}</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
              <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-6">{icons[i]}</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-lg">{s.desc}</p>
              <div className="text-sky-500 font-extrabold text-xl">{s.price}</div>
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
    <section className="py-24 bg-sky-50 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-sky-500 to-rose-600 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <Baby className="w-16 h-16 text-white/20 absolute -top-4 -right-4" />
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
  const t = useTranslations('treatmentPages.gyerekfogaszat');
  const ts = useTranslations('treatmentPages.shared');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-sky-500 font-bold text-4xl mb-12 text-center">{ts('faqTitle')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)} aria-expanded={openIndex === index}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-sky-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
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

export default function GyerekfogaszatClient({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="crown-page bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <main>
        <ServiceHero imageUrl={imageUrl} />
        <ParentsSection />
        <KidsInteractiveSection />
        <ServicesSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
    </div>
  );
}
