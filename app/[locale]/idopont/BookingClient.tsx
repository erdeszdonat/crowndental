'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { BUDAPEST_BOOKING_OPEN_LABELS, isBudapestBookingAvailable, isBudapestCity } from '@/lib/bookingAvailability';

const BOOKING_SUCCESS_STORAGE_KEY = 'crown_booking_success';
const BOOKING_SUCCESS_CONTACT_KEY = 'crown_booking_contact';
const SUPPORTED_LOCALES = new Set(['hu', 'en', 'sk', 'de']);

type SupportedLocale = 'hu' | 'en' | 'sk' | 'de';
type BookingResponse = {
  success?: boolean;
  appointmentId?: string;
  consentToken?: string;
  marketingConsentSaved?: boolean;
};

const bookingFeedback: Record<SupportedLocale, {
  generic: string;
  invalid: string;
  network: string;
  rateLimited: string;
  unavailable: string;
}> = {
  hu: {
    generic: 'Az időpontkérést most nem sikerült elküldeni. Kérjük, próbálja újra.',
    invalid: 'Kérjük, ellenőrizze a megadott adatokat, majd próbálja újra.',
    network: 'Nincs hálózati kapcsolat. Ellenőrizze az internetkapcsolatot, majd próbálja újra.',
    rateLimited: 'Túl sok kérés érkezett rövid időn belül. Kérjük, várjon néhány percet.',
    unavailable: 'A foglalási rendszer átmenetileg nem érhető el. Kérjük, próbálja újra később.',
  },
  en: {
    generic: 'We could not send your appointment request. Please try again.',
    invalid: 'Please check the information you entered and try again.',
    network: 'You appear to be offline. Check your connection and try again.',
    rateLimited: 'Too many requests were sent in a short time. Please wait a few minutes.',
    unavailable: 'The booking service is temporarily unavailable. Please try again later.',
  },
  sk: {
    generic: 'Žiadosť o termín sa nepodarilo odoslať. Skúste to prosím znova.',
    invalid: 'Skontrolujte zadané údaje a skúste to znova.',
    network: 'Nie ste pripojení k internetu. Skontrolujte pripojenie a skúste to znova.',
    rateLimited: 'Za krátky čas bolo odoslaných priveľa žiadostí. Počkajte prosím niekoľko minút.',
    unavailable: 'Rezervačný systém je dočasne nedostupný. Skúste to prosím neskôr.',
  },
  de: {
    generic: 'Ihre Terminanfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    invalid: 'Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.',
    network: 'Sie scheinen offline zu sein. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    rateLimited: 'In kurzer Zeit wurden zu viele Anfragen gesendet. Bitte warten Sie einige Minuten.',
    unavailable: 'Das Buchungssystem ist vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.',
  },
};

function normalizeLocale(locale: string): SupportedLocale {
  return SUPPORTED_LOCALES.has(locale) ? locale as SupportedLocale : 'hu';
}

function createIdempotencyKey(prefix: string) {
  const value = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}

function BookingForm() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const safeLocale = normalizeLocale(locale);
  const router = useRouter();
  const p = safeLocale === 'hu' ? '' : `/${safeLocale}`;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ city:'Esztergom', name:'', nickname:'', email:'', phone:'', treatment:'' });
  const [otherNote, setOtherNote] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const isBudapestOpen = isBudapestBookingAvailable();
  const budapestOpenLabel = BUDAPEST_BOOKING_OPEN_LABELS[safeLocale] ?? BUDAPEST_BOOKING_OPEN_LABELS.hu;
  const otherNotePlaceholders: Record<string, string> = {
    hu: 'Írja le röviden, mi a panasza vagy mit szeretne...',
    en: 'Briefly describe your concern or what you would like...',
    sk: 'Stručne opíšte svoj problém alebo požiadavku...',
    de: 'Beschreiben Sie kurz Ihre Beschwerden oder Ihren Wunsch...',
  };
  const otherNotePlaceholder = otherNotePlaceholders[safeLocale] ?? otherNotePlaceholders.hu;
  const feedback = bookingFeedback[safeLocale];

  const treatments = t.raw('treatments') as string[];
  const otherLabel = treatments[treatments.length - 1];
  const isOther = formData.treatment === otherLabel;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    idempotencyKeyRef.current = null;
    setSubmitError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBudapestCity(formData.city) && !isBudapestOpen) return;
    if (formData.name && formData.phone && formData.email) { setStep(2); window.scrollTo({ top:0, behavior:'smooth' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treatment) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload = isOther && otherNote ? { ...formData, treatment: `${formData.treatment}: ${otherNote}` } : formData;
      const idempotencyKey = idempotencyKeyRef.current ?? createIdempotencyKey('booking');
      idempotencyKeyRef.current = idempotencyKey;
      const bookingPayload = {
        ...payload,
        locale: safeLocale,
        idempotencyKey,
        marketingConsent,
        marketingConsentSource: 'booking_form',
        marketingConsentLocale: safeLocale,
      };
      const res = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(bookingPayload),
      });
      const data = await res.json().catch(() => ({})) as BookingResponse;
      if (!res.ok || data.success !== true) {
        if (res.status === 400 || res.status === 422) setSubmitError(feedback.invalid);
        else if (res.status === 429) setSubmitError(feedback.rateLimited);
        else if (res.status >= 500) setSubmitError(feedback.unavailable);
        else setSubmitError(feedback.generic);
        return;
      }

      try {
        sessionStorage.setItem(BOOKING_SUCCESS_STORAGE_KEY, '1');
        sessionStorage.setItem(BOOKING_SUCCESS_CONTACT_KEY, JSON.stringify({
          consentToken: typeof data.consentToken === 'string' ? data.consentToken : undefined,
          marketingConsent: marketingConsent && data.marketingConsentSaved === true,
        }));
      } catch {
        // The booking is already saved; storage is only used to enhance the success page.
      }
      router.push(`${p}/idopont/sikeres`);
    } catch {
      setSubmitError(feedback.network);
    }
    finally { setIsSubmitting(false); }
  };

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
                <label className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${formData.city==='Esztergom'?'border-sky-600 bg-sky-50':'border-gray-200 bg-white hover:border-sky-200'}`}>
                  <input type="radio" name="city" value="Esztergom" checked={formData.city==='Esztergom'} onChange={handleChange} className="sr-only"/>
                  <div className="flex items-center justify-between font-bold text-lg text-gray-900">Esztergom{formData.city==='Esztergom'&&<CheckCircle2 className="w-5 h-5 text-sky-600"/>}</div>
                  <p className="text-sm text-sky-600 font-medium mt-1">Petőfi Sándor utca 11.</p>
                </label>
                <label className={`relative rounded-2xl border-2 p-6 transition-all ${isBudapestOpen ? 'cursor-pointer select-auto' : 'cursor-not-allowed select-none opacity-70 grayscale border-gray-200 bg-gray-100'} ${isBudapestOpen ? (formData.city==='Budapest'?'border-sky-600 bg-sky-50':'border-gray-200 bg-gray-50 hover:border-sky-200') : ''}`}>
                  <input type="radio" name="city" value="Budapest" checked={formData.city==='Budapest'} disabled={!isBudapestOpen} onChange={handleChange} className="sr-only"/>
                  <div className={`flex items-center justify-between font-bold text-lg ${isBudapestOpen?'text-gray-900':'text-gray-400'}`}>Budapest{formData.city==='Budapest'?<CheckCircle2 className="w-5 h-5 text-sky-600"/>:<span className={`text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap ${isBudapestOpen ? 'bg-sky-400' : 'bg-gray-400'}`}>{budapestOpenLabel}</span>}</div>
                  <p className={`text-sm font-medium mt-1 ${isBudapestOpen?'text-sky-600':'text-gray-400'}`}>Királyok útja 55.</p>
                </label>
              </div>
              <div className="space-y-4">
                <label htmlFor="booking-name" className="sr-only">{t('fullName')}</label>
                <input id="booking-name" required autoComplete="name" name="name" value={formData.name} onChange={handleChange} placeholder={`${t('fullName')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
                <label htmlFor="booking-phone" className="sr-only">{t('phone')}</label>
                <input id="booking-phone" required autoComplete="tel" inputMode="tel" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={`${t('phone')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
                <label htmlFor="booking-email" className="sr-only">{t('email')}</label>
                <input id="booking-email" required autoComplete="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={`${t('email')} *`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-600"/>
              </div>
              <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-sky-600 transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
                {t('nextStep')} <ArrowRight className="w-5 h-5"/>
              </button>
            </motion.form>
          )}

          {step===2&&(
            <motion.form key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-900">{t('step2Title')}</h2>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {treatments.map((treatment) => (
                  <React.Fragment key={treatment}>
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.treatment===treatment?'border-sky-600 bg-sky-50':'border-gray-100 hover:border-sky-200'}`}>
                      <span className="font-bold text-gray-700">{treatment}</span>
                      <input type="radio" name="treatment" value={treatment} onChange={handleChange} className="sr-only" required/>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.treatment===treatment?'border-sky-600 bg-sky-600':'border-gray-300'}`}>
                        {formData.treatment===treatment&&<div className="w-2 h-2 bg-white rounded-full"/>}
                      </div>
                    </label>
                    {formData.treatment===treatment && treatment===otherLabel && (
                      <textarea
                        value={otherNote}
                        onChange={e => {
                          idempotencyKeyRef.current = null;
                          setSubmitError(null);
                          setOtherNote(e.target.value);
                        }}
                        placeholder={otherNotePlaceholder}
                        rows={3}
                        className="w-full p-4 bg-gray-50 border-2 border-sky-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 resize-none text-sm text-gray-700"
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-left transition-colors hover:border-sky-200">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => {
                    idempotencyKeyRef.current = null;
                    setSubmitError(null);
                    setMarketingConsent(event.target.checked);
                  }}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  <span className="block text-sm font-black text-gray-900">{t('marketingOptInTitle')}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">{t('marketingOptInText')}</span>
                </span>
              </label>
              {submitError && (
                <p role="alert" aria-live="assertive" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {submitError}
                </p>
              )}
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
