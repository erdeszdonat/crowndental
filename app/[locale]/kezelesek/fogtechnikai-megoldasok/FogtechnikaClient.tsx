'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  Calendar, ChevronDown, Sparkles, Shield, Clock, Heart,
  ArrowRight, Plus, Minus, Wrench, Microscope, Users,
  Award, CheckCircle2, Zap, Gem, Smile
} from 'lucide-react';

const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });

function ServiceHero() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  const ts = useTranslations('treatmentPages.shared');
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "fogtechnika"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
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
      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-slate-200/50 to-gray-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-slate-300/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-slate-700 text-sm font-bold tracking-wide uppercase mb-6">
              <Microscope className="w-4 h-4" /> {t('heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {t('heroTitle').split('\n').map((line, i) => i === 0 ? <span key={i}>{line}<br/></span> : <span key={i} className="text-slate-600">{line}</span>)}
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">{t('heroDesc')}</p>
            <Link href={`${p}/idopont`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-900 transition-all shadow-lg hover:shadow-slate-800/30">
              <Calendar className="w-5 h-5" /> {ts('consultationBtn')}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-slate-200 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
              {imageUrl && <img src={imageUrl} alt="Saját Fogtechnikai Labor" className="w-full h-full object-cover animate-in fade-in duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600"><Wrench className="w-6 h-6" /></div>
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

function TeamHistorySection() {
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  const teamBenefits = t.raw('teamBenefits') as Array<{ title: string; desc: string }>;
  const icons = [<Clock className="w-5 h-5 text-sky-400" />, <Users className="w-5 h-5 text-sky-400" />, <Gem className="w-5 h-5 text-sky-400" />];
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-sm font-bold uppercase mb-6">
              <Award className="w-4 h-4" /> {t('teamBadge')}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{t('teamTitle')}</h2>
            <div className="space-y-6 text-lg text-slate-300 font-light leading-relaxed">
              <p>{t('teamText1')}</p>
              <p>{t('teamText2')}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="text-4xl font-black text-sky-400 mb-2">1994</div>
                <div className="text-sm text-slate-300 font-medium">{t('teamFoundingLabel')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="text-4xl font-black text-sky-400 mb-2">10.000+</div>
                <div className="text-sm text-slate-300 font-medium">{t('teamProsthesesLabel')}</div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="bg-slate-800 p-8 md:p-12 rounded-[3rem] border border-slate-700 shadow-2xl relative">
              <QuoteIcon className="w-16 h-16 text-slate-700 absolute top-8 left-8" />
              <h3 className="text-2xl font-bold text-white mb-8 relative z-10 pt-4">{t('teamWhyTitle')}</h3>
              <ul className="space-y-6 relative z-10">
                {teamBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-1">{icons[i]}</div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{b.title}</h4>
                      <p className="text-slate-400 text-sm">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function ProblemSolution() {
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="p-8 md:p-10 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><Minus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('problemTitle')}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{t('problemDesc')}</p>
          </div>
          <div className="p-8 md:p-10 bg-sky-50 rounded-3xl border border-sky-100 shadow-[0_8px_30px_rgb(14,165,233,0.1)]">
            <div className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><Plus className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('solutionTitle')}</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{t('solutionDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  const icons = [<Zap className="w-8 h-8" />, <Gem className="w-8 h-8" />, <Shield className="w-8 h-8" />, <Microscope className="w-8 h-8" />, <Wrench className="w-8 h-8" />, <Smile className="w-8 h-8" />];
  const services = t.raw('services') as Array<{ title: string; desc: string; highlight?: boolean }>;
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-slate-600 font-bold uppercase tracking-widest mb-3">{t('servicesBadge')}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('servicesTitle')}</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col ${i === 0 ? 'bg-sky-50 border-sky-200' : 'bg-white border-gray-100'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${i === 0 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}>{icons[i]}</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h4>
              <p className={`leading-relaxed mb-6 flex-1 text-lg ${i === 0 ? 'text-sky-900' : 'text-gray-500'}`}>{s.desc}</p>
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
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  const ts = useTranslations('treatmentPages.shared');
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-[100px]" />
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-slate-900/20 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-8 border border-white/20">
              <Wrench className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">{t('ctaTitle')}</h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">{t('ctaDesc')}</p>
            <Link href={`${p}/idopont`} className="inline-flex items-center gap-3 px-10 py-5 bg-sky-600 text-white font-extrabold rounded-full shadow-xl hover:shadow-2xl hover:bg-sky-500 hover:scale-105 transition-all group">
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
  const t = useTranslations('treatmentPages.fogtechnikai-megoldasok');
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>;
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16"><h2 className="text-slate-600 font-bold text-4xl mb-4">{t('faqTitle')}</h2></div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button className="w-full px-6 py-5 text-left flex items-center justify-between" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
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

export default function FogtechnikaClient() {
  return (
    <div className="bg-white min-h-screen selection:bg-slate-200 selection:text-slate-900">
      <main>
        <ServiceHero />
        <TeamHistorySection />
        <ProblemSolution />
        <ServicesSection />
        <AppointmentCTASection />
        <FAQSection />
      </main>
    </div>
  );
}
