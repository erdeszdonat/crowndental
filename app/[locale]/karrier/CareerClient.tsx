'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  CheckCircle2,
  ArrowRight,
  Gem,
  MessageSquare
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: true,
});

const benefitIcons = [
  <Gem className="w-6 h-6" />,
  <Users className="w-6 h-6" />,
  <TrendingUp className="w-6 h-6" />,
  <Heart className="w-6 h-6" />,
];

function CareerHero() {
  const t = useTranslations('career');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "karrier"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) {
        console.error("Sanity hiba:", error);
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
              <Briefcase className="w-4 h-4" /> {t('heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {t('heroTitle')} <br/> <span className="text-sky-600">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light mb-8 max-w-xl">
              {t('heroSubtitle')}
            </p>
            <a href="#jelentkezes" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-all shadow-lg">
              {t('heroBtn')} <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-sky-100 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
              {imageUrl && <img src={imageUrl} alt="Crown Dental Csapat" className="w-full h-full object-cover animate-in fade-in duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MissionAndBenefits() {
  const t = useTranslations('career');
  // @ts-ignore
  const benefits = t.raw('benefits') as Array<{ title: string; desc: string }>;
  return (
    <section className="py-24 bg-white text-left">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">{t('benefitsTitle')}</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{t('benefitsSubtitle')}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex gap-6 items-start">
              <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0">{benefitIcons[i]}</div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h4>
                <p className="text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmployeeReviews() {
  const t = useTranslations('career');
  // @ts-ignore
  const reviews = t.raw('employeeReviews') as Array<{ role: string; text: string }>;
  const extendedReviews = [...reviews, ...reviews, ...reviews];
  return (
    <section className="py-24 bg-sky-900 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-career { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-career { display: flex; width: max-content; animation: marquee-career 40s linear infinite; }
      `}} />
      <div className="container mx-auto px-4 text-center mb-12 relative z-10 text-left">
        <h2 className="text-sky-300 font-bold uppercase tracking-widest mb-3">{t('reviewsLabel')}</h2>
      </div>
      <div className="animate-marquee-career gap-6 px-6">
        {extendedReviews.map((review, i) => (
          <div key={i} className="w-[320px] md:w-[400px] p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex-shrink-0 text-left">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sky-300">{review.role}</span>
            </div>
            <p className="text-gray-200 leading-relaxed font-medium">"{review.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CareerForm() {
  const t = useTranslations('career');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ location: '', position: '', experience: '0', name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/career_applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) setIsSuccess(true);
    } catch (error) {
      alert(t('formError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="py-24 text-center bg-white">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold">{t('formSuccess')}</h3>
    </div>
  );

  return (
    <section id="jelentkezes" className="py-24 bg-white text-left">
      <div className="container mx-auto px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[2rem] shadow-xl p-6 md:p-10 space-y-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <input required placeholder={t('formName')} name="name" onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-3.5 rounded-xl border w-full" />
            <input required placeholder={t('formPhone')} name="phone" onChange={(e) => setFormData({...formData, phone: e.target.value})} className="p-3.5 rounded-xl border w-full" />
            <input required placeholder={t('formEmail')} type="email" name="email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="p-3.5 rounded-xl border w-full sm:col-span-2" />
            <select required className="p-3.5 rounded-xl border w-full" onChange={(e) => setFormData({...formData, location: e.target.value})}>
               <option value="">{t('formLocationPlaceholder')}</option>
               <option value="Esztergom">Esztergom</option>
               <option value="Budapest">Budapest</option>
            </select>
            <select required className="p-3.5 rounded-xl border w-full" onChange={(e) => setFormData({...formData, position: e.target.value})}>
               <option value="">{t('formPositionPlaceholder')}</option>
               <option value="Fogorvos">{t('formPositionDoctor')}</option>
               <option value="Asszisztens">{t('formPositionAssistant')}</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-sky-600 text-white rounded-xl font-bold">
            {isSubmitting ? t('formSubmitting') : t('formSubmit')}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function CareerClient() {
  return (
    <div className="bg-white min-h-screen">
      <CareerHero />
      <MissionAndBenefits />
      <EmployeeReviews />
      <CareerForm />
    </div>
  );
}
