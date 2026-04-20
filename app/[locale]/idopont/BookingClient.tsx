'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

function BookingForm() {
  const t = useTranslations('booking');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ city:'Esztergom', name:'', nickname:'', email:'', phone:'', treatment:'' });

  // @ts-ignore
  const treatments = t.raw('treatments') as string[];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) { setStep(2); window.scrollTo({ top:0, behavior:'smooth' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treatment) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/book-appointment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { setIsSuccess(true); window.scrollTo({ top:0, behavior:'smooth' }); }
    } catch {}
    finally { setIsSubmitting(false); }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-16 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="w-12 h-12"/></div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t('successTitle')}</h2>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">{t('successText')}</p>
        <Link href={`${p}/`} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-sky-600 transition-colors">
          {tNav('home')} <ArrowRight className="w-5 h-5"/>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-left">
      {/* Progress */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${step>=1?'bg-sky-600 text-white shadow-lg':'bg-gray-200 text-gray-400'}`}>1</div>
        <div className="w-16 sm:w-24 h-1 mx-4 rounded-full bg-gray-200 overflow-hidden">
          <div className={`h-full bg-sky-600 transition-all duration-500 ${step===2?'w-full':'w-0'}`}/>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${step===2?'bg-sky-600 text-white shadow-lg':'bg-gray-200 text-gray-400'}`}>2</div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-12 backdrop-blur-sm bg-white/95">
        <AnimatePresence mode="wait">
          {step===1&&(
            <motion.form key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} onSubmit={handleNext} className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{t('step1Title')}</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <label className="relative cursor-pointer rounded-2xl border-2 p-6 transition-all border-sky-600 bg-sky-50">
                  <input type="radio" name="city" value="Esztergom" checked onChange={handleChange} className="sr-only"/>
                  <div className="flex items-center justify-between font-bold text-lg text-gray-900">Esztergom<CheckCircle2 className="w-5 h-5 text-sky-600"/></div>
                  <p className="text-sm text-sky-600 font-medium mt-1">Petőfi Sándor utca 11.</p>
                </label>
                <div className="relative rounded-2xl border-2 p-6 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed select-none">
                  <div className="flex items-center justify-between font-bold text-lg text-gray-400">Budapest<span className="text-xs font-semibold text-white bg-sky-400 px-2 py-1 rounded-full whitespace-nowrap">Jún. 1-től</span></div>
                  <p className="text-sm text-gray-400 font-medium mt-1">Királyok útja 55.</p>
                </div>
              </div>
              <div className="space-y-4">
                <input required name="name" value={formData.name} onChange={handleChange} placeholder={`${t('fullName')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
                <input required name="phone" value={formData.phone} onChange={handleChange} placeholder={`${t('phone')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
                <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder={`${t('email')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
              </div>
              <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-sky-600 transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
                {t('nextStep')} <ArrowRight className="w-5 h-5"/>
              </button>
            </motion.form>
          )}

          {step===2&&(
            <motion.form key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">{t('step2Title')}</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {treatments.map((treatment) => (
                  <label key={treatment} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.treatment===treatment?'border-sky-600 bg-sky-50':'border-gray-100 hover:border-sky-200'}`}>
                    <span className="font-bold text-gray-700">{treatment}</span>
                    <input type="radio" name="treatment" value={treatment} onChange={handleChange} className="sr-only" required/>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.treatment===treatment?'border-sky-600 bg-sky-600':'border-gray-300'}`}>
                      {formData.treatment===treatment&&<div className="w-2 h-2 bg-white rounded-full"/>}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <button type="button" onClick={()=>setStep(1)} className="flex items-center justify-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5"/> {t('prevStep')}
                </button>
                <button type="submit" disabled={isSubmitting||!formData.treatment} className="flex-1 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 shadow-lg disabled:bg-gray-300">
                  {isSubmitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReviewsSection() {
  const t = useTranslations('home.reviews');
  // @ts-ignore
  const allReviews = (t.raw('items') as Array<{name:string;text:string;date:string}>).slice(0,3);
  const ext = [...allReviews,...allReviews,...allReviews];
  return (
    <section className="py-24 overflow-hidden relative">
      <h3 className="text-4xl font-extrabold text-center mb-12 text-gray-900">{t('title')}</h3>
      <style dangerouslySetInnerHTML={{__html:`@keyframes mrq{0%{transform:translateX(0)}100%{transform:translateX(-33.3333%)}}.amrq{display:flex;width:max-content;animation:mrq 50s linear infinite}.amrq:hover{animation-play-state:paused}`}}/>
      <div className="amrq gap-6 px-6">
        {ext.map((review,i) => (
          <div key={i} className="w-[350px] p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex text-amber-400 mb-4">{[...Array(5)].map((_,j)=><Star key={j} className="w-5 h-5 fill-current"/>)}</div>
            <p className="text-gray-600 italic mb-6">"{review.text}"</p>
            <div className="flex justify-between border-t pt-4 font-bold text-gray-900"><span>{review.name}</span><span className="text-gray-400 text-sm font-normal">{review.date}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BookingClient() {
  const t = useTranslations('booking');
  return (
    <div className="min-h-screen pt-24 md:pt-32 bg-gray-50 overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px] -z-10"/>
      <main className="container mx-auto px-4 py-12 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">{t('title')}</h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-12">{t('subtitle')}</p>
        <BookingForm/>
      </main>
      <ReviewsSection/>
      <style dangerouslySetInnerHTML={{__html:`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#bae6fd;border-radius:10px}`}}/>
    </div>
  );
}
