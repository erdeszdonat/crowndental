'use client';

import ClinicPhoneLinks from '@/components/ClinicPhoneLinks';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSiteCopy } from '@/lib/siteCopy';
import { ANALYTICS_READY_EVENT, rememberBookingSource, trackSiteEvent } from '@/lib/siteAnalytics';
import { bookingAnalyticsContext } from '@/lib/firstPartyAnalytics';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import GoogleReviewsCta from '@/components/GoogleReviewsCta';
import { getVeneerOffer } from '@/lib/veneers.mjs';
import { getVeneerLabels } from '@/lib/veneerI18n';
import { bookingTreatmentIds, type BookingTreatmentId } from '@/lib/bookingTreatment';
import { isValidEmail, isValidPhone } from '@/lib/contactValidation';
import VeneerOfferCard from '@/components/VeneerOffer';

type VeneerOffer = ReturnType<typeof getVeneerOffer>;
type VeneerTreatmentSlug = 'direkt-hej' | 'indirekt-hej' | 'hollywood-mosoly';

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

function veneerBookingLabels(locale: string): Record<VeneerTreatmentSlug, string> {
  const labels = getVeneerLabels(locale);
  return {
    'direkt-hej': labels.directName,
    'indirekt-hej': labels.indirectName,
    'hollywood-mosoly': labels.hollywoodName,
  };
}

const veneerBookingNotes: Record<SupportedLocale, { confirmation: string; consultation: string }> = {
  hu: {
    confirmation: 'A pontos időpontot és a személyre szabott kezelési tervet munkatársunk egyezteti Önnel.',
    consultation: 'A konzultáción átbeszéljük a mosollyal kapcsolatos elképzeléseit, és megvizsgáljuk, hogy a direkt vagy a porcelán héj megfelelő-e Önnek.',
  },
  en: {
    confirmation: 'Our team will confirm your appointment and discuss your personalised treatment plan with you.',
    consultation: 'At your consultation, we will discuss your smile goals and assess whether composite or porcelain veneers are suitable for you.',
  },
  de: {
    confirmation: 'Unser Team stimmt den genauen Termin und Ihren individuellen Behandlungsplan mit Ihnen ab.',
    consultation: 'Bei der Beratung besprechen wir Ihre Wünsche für Ihr Lächeln und prüfen, ob Komposit- oder Keramik-Veneers für Sie geeignet sind.',
  },
  sk: {
    confirmation: 'Náš tím s vami dohodne presný termín a individuálny plán ošetrenia.',
    consultation: 'Na konzultácii preberieme vaše predstavy o úsmeve a posúdime, či sú pre vás vhodné kompozitné alebo keramické fazety.',
  },
};

type BookingFormProps = {
  directOffer: VeneerOffer;
  initialTreatmentSlug?: BookingTreatmentId;
};

export function BookingForm({ directOffer, initialTreatmentSlug }: BookingFormProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const safeLocale = normalizeLocale(locale);
  const veneerLabels = veneerBookingLabels(safeLocale);
  const router = useRouter();
  const p = safeLocale === 'hu' ? '' : `/${safeLocale}`;
  const [step, setStep] = useState<1 | 2>(1);
  // A native submit before hydration would navigate away from the form.
  const [interactive, setInteractive] = useState(false);
  useEffect(() => { setInteractive(true); }, []);
  const copy = getSiteCopy(safeLocale);
  const busyRef = useRef(false);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const formVisibleRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const measuredStepRef = useRef<number | null>(null);
  const previousStepRef = useRef(step);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', nickname: '', email: '', phone: '', treatment: initialTreatmentSlug ?? '' });
  const [otherNote, setOtherNote] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const otherNotePlaceholders: Record<string, string> = {
    hu: 'Írja le röviden, mi a panasza vagy mit szeretne...',
    en: 'Briefly describe your concern or what you would like...',
    sk: 'Stručne opíšte svoj problém alebo požiadavku...',
    de: 'Beschreiben Sie kurz Ihre Beschwerden oder Ihren Wunsch...',
  };
  const otherNotePlaceholder = otherNotePlaceholders[safeLocale] ?? otherNotePlaceholders.hu;
  const feedback = bookingFeedback[safeLocale];

  const treatmentLabels: Record<string, string> = { ...t.raw('treatments'), ...veneerLabels };
  const isOther = formData.treatment === 'egyeb';
  const treatmentLabel = treatmentLabels[formData.treatment] ?? '';

  useEffect(() => {
    const measure = () => {
      if (!formVisibleRef.current) return;
      rememberBookingSource(window.location.pathname);
      if (!viewedRef.current) viewedRef.current = trackSiteEvent('booking_form_view', safeLocale, { step });
      if (measuredStepRef.current !== step && trackSiteEvent('booking_step_view', safeLocale, { step })) measuredStepRef.current = step;
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      formVisibleRef.current = entries.some(entry => entry.isIntersecting);
      measure();
    });
    if (observer && panelRef.current) observer.observe(panelRef.current);
    else formVisibleRef.current = true;
    measure();
    window.addEventListener(ANALYTICS_READY_EVENT, measure);
    if (previousStepRef.current !== step) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.closest('.crown-booking-panel')?.scrollIntoView({ block: 'start', behavior: 'auto' });
      previousStepRef.current = step;
    }
    return () => {
      observer?.disconnect();
      window.removeEventListener(ANALYTICS_READY_EVENT, measure);
    };
  }, [safeLocale, step]);

  const markStarted = () => {
    if (!startedRef.current) {
      rememberBookingSource(window.location.pathname);
      startedRef.current = trackSiteEvent('booking_start', safeLocale, { step });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    idempotencyKeyRef.current = null;
    setSubmitError(null);
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treatment) return;
    setSubmitError(null);
    markStarted();
    trackSiteEvent('booking_step_complete', safeLocale, { step });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2 || !formData.treatment || busyRef.current) return;
    if (!formData.name.trim() || !isValidEmail(formData.email.trim()) || !isValidPhone(formData.phone.trim())) {
      setSubmitError(feedback.invalid);
      trackSiteEvent('booking_validation_error', safeLocale, { step, error: 'validation' });
      return;
    }
    busyRef.current = true;
    trackSiteEvent('booking_step_complete', safeLocale, { step });
    trackSiteEvent('booking_submit', safeLocale, { step });
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { name, nickname, email, phone } = formData;
      const idempotencyKey = idempotencyKeyRef.current ?? createIdempotencyKey('booking');
      idempotencyKeyRef.current = idempotencyKey;
      const bookingPayload = {
        name, nickname, email, phone,
        city: 'Esztergom',
        treatment: isOther && otherNote ? `${treatmentLabel}: ${otherNote}` : treatmentLabel,
        analytics: bookingAnalyticsContext(),
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
        trackSiteEvent('booking_error', safeLocale, { step, error: res.status === 429 ? 'rate_limited' : res.status >= 500 ? 'service' : res.status === 400 || res.status === 422 ? 'validation' : 'unknown' });
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
      trackSiteEvent('booking_success', safeLocale, { step });
      router.push(`${p}/idopont/sikeres`);
    } catch {
      trackSiteEvent('booking_error', safeLocale, { step, error: 'network' });
      setSubmitError(feedback.network);
    }
    finally { busyRef.current = false; setIsSubmitting(false); }
  };

  return (
    <div ref={panelRef} className="crown-booking-panel">
      <ol className="crown-booking-progress" aria-label={t('title')}>
        {copy.steps.map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}
      </ol>
      <h2 ref={headingRef} tabIndex={-1} style={{ scrollMarginTop: '7rem' }}>{t(step === 1 ? 'treatmentHeading' : 'contactHeading')}</h2>
      <p className="crown-booking-note mb-6">{copy.required}</p>
      <form key={step} onSubmit={step === 2 ? handleSubmit : handleNext} onChange={markStarted}
        onInvalidCapture={() => trackSiteEvent('booking_validation_error', safeLocale, { step, error: 'validation' })}
        aria-busy={isSubmitting}>
        <fieldset disabled={!interactive || isSubmitting} className="space-y-5">
          {step === 1 && <>
              <div>
                <label htmlFor="booking-treatment" className="crown-field-label">{t('treatment')} *</label>
                <select id="booking-treatment" name="treatment" value={formData.treatment} onChange={handleChange} required className="crown-input">
                  <option value="" disabled>{t('selectTreatment')}</option>
                  {bookingTreatmentIds.map(id => <option key={id} value={id}>{treatmentLabels[id]}</option>)}
                </select>
              </div>
              {(['direkt-hej', 'indirekt-hej'] as const).map(slug => formData.treatment === slug && (
                <div key={slug} className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
                  <VeneerOfferCard slug={slug} initialOffer={slug === 'direkt-hej' ? directOffer : getVeneerOffer(slug)} locale={safeLocale} compact />
                  <p className="crown-booking-note">{veneerBookingNotes[safeLocale].confirmation}</p>
                </div>
              ))}
              {formData.treatment === 'hollywood-mosoly' && (
                <p className="crown-booking-note">{veneerBookingNotes[safeLocale].consultation} {veneerBookingNotes[safeLocale].confirmation}</p>
              )}
              {isOther && <div>
                <label htmlFor="booking-note" className="crown-field-label">{copy.optional}</label>
                <textarea id="booking-note" value={otherNote} rows={4} maxLength={Math.max(0, 280 - treatmentLabel.length - 2)} className="crown-input" placeholder={otherNotePlaceholder}
                  onChange={event => { idempotencyKeyRef.current = null; setSubmitError(null); setOtherNote(event.target.value); }} />
              </div>}
          </>}
          {step === 2 && <>
              <div>
                <label htmlFor="booking-name" className="crown-field-label">{t('fullName')} *</label>
                <input id="booking-name" required maxLength={120} autoComplete="name" name="name" value={formData.name} onChange={handleChange} className="crown-input" />
              </div>
              <div>
                <label htmlFor="booking-phone" className="crown-field-label">{t('phone')} *</label>
                <input id="booking-phone" required maxLength={40} autoComplete="tel" inputMode="tel" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="crown-input" />
              </div>
              <div>
                <label htmlFor="booking-email" className="crown-field-label">{t('email')} *</label>
                <input id="booking-email" required maxLength={254} autoComplete="email" name="email" type="email" value={formData.email} onChange={handleChange} className="crown-input" />
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input type="checkbox" checked={marketingConsent} className="mt-1 h-5 w-5 shrink-0 accent-sky-700"
                  onChange={event => { idempotencyKeyRef.current = null; setSubmitError(null); setMarketingConsent(event.target.checked); }} />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{t('marketingOptInTitle')}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">{t('marketingOptInText')}</span>
                </span>
              </label>
              <p className="crown-booking-note">{copy.location}</p>
          </>}
          {submitError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{submitError}</p>
            <ClinicPhoneLinks tone="light" />
          </div>}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
            {step > 1 && <button type="button" onClick={() => { setSubmitError(null); setStep(1); }} className="crown-button crown-button-secondary"><ArrowLeft size={18} />{t('prevStep')}</button>}
            <button type="submit" className="crown-button flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />{t('submitting')}</> : <>{t(step === 2 ? 'submit' : 'nextStep')}<ArrowRight size={18} aria-hidden="true" /></>}
            </button>
          </div>
        </fieldset>
      </form>
      <p className="crown-booking-note mt-6"><Link href={`${p}/adatkezeles`} className="underline underline-offset-4">{copy.privacy}</Link></p>
    </div>
  );
}

export default function BookingClient({ directOffer, initialTreatmentSlug }: BookingFormProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const copy = getSiteCopy(locale);
  return (
    <div className="crown-page">
      <main className="crown-booking">
        <div className="crown-container">
          <header className="crown-booking-header">
            <p className="crown-eyebrow">{copy.bookingEyebrow}</p>
            <h1>{t('title')}</h1>
            <p className="crown-lead">{copy.bookingIntro}</p>
          </header>
          <div className="crown-booking-layout">
            <BookingForm directOffer={directOffer} initialTreatmentSlug={initialTreatmentSlug} />
            <aside className="crown-booking-help">
              <h2>{copy.nextTitle}</h2>
              <ol>{copy.next.map(item => <li key={item}>{item}</li>)}</ol>
              <p className="crown-booking-note">{copy.note}</p>
              <div className="crown-booking-contact">
                <p className="crown-booking-note">{copy.help}</p>
                <ClinicPhoneLinks tone="light" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <GoogleReviewsCta />
    </div>
  );
}
