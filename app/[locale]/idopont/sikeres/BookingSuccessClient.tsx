'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight, CalendarCheck2, CheckCircle2, Home, Mail, Phone } from 'lucide-react';
import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  currentConsentFrom,
  parseStoredConsent,
} from '@/lib/cookieConsent';

const BOOKING_SUCCESS_STORAGE_KEY = 'crown_booking_success';
const BOOKING_SUCCESS_CONTACT_KEY = 'crown_booking_contact';
const BOOKING_SUCCESS_EVENT = 'appointment_booking_success';

type BookingConsent = {
  consentToken?: string;
  marketingConsent?: boolean;
};

type SupportedLocale = 'hu' | 'en' | 'sk' | 'de';

function normalizeLocale(locale: string): SupportedLocale {
  return locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu';
}

const copyByLocale = {
  hu: {
    eyebrow: 'Foglalás rögzítve',
    title: 'Köszönjük, megkaptuk az időpontkérését.',
    subtitle: 'Kollégánk hamarosan felveszi Önnel a kapcsolatot a részletek egyeztetéséhez és a végleges visszaigazoláshoz.',
    nextTitle: 'Mi történik most?',
    nextItems: [
      'Ellenőrizzük a megadott adatokat és a választott kezelést.',
      'Telefonon vagy e-mailben visszajelzünk a lehető legrövidebb időn belül.',
      'Sürgős panasz esetén hívjon minket közvetlenül is.',
    ],
    call: 'Hívás most',
    email: 'E-mail küldése',
    home: 'Vissza a főoldalra',
    offerTitle: 'Szeretne időnként extra kedvezményeket kapni?',
    offerText: 'Akciós ajánlatok, ingyenes kezelési lehetőségek, nyereményjátékok és hasznos fogászati tippek e-mailben. Ritkán küldünk, és bármikor leiratkozhat.',
    offerCta: 'Kérem az ajánlatokat',
    offerNoThanks: 'Most nem kérem',
    offerDone: 'Köszönjük, feliratkozását rögzítettük.',
    offerAlready: 'A feliratkozási szándékát már rögzítettük.',
    offerError: 'Most nem sikerült rögzíteni, kérjük próbálja újra később.',
  },
  en: {
    eyebrow: 'Booking received',
    title: 'Thank you, we have received your appointment request.',
    subtitle: 'Our colleague will contact you shortly to confirm the details and finalize the appointment.',
    nextTitle: 'What happens next?',
    nextItems: [
      'We check your submitted details and selected treatment.',
      'We get back to you by phone or email as soon as possible.',
      'For urgent concerns, please call us directly as well.',
    ],
    call: 'Call now',
    email: 'Send email',
    home: 'Back to home',
    offerTitle: 'Would you like occasional exclusive offers?',
    offerText: 'Special offers, free treatment opportunities, giveaways and useful dental tips by email. We send rarely, and you can unsubscribe anytime.',
    offerCta: 'Send me the offers',
    offerNoThanks: 'Not now',
    offerDone: 'Thank you, your subscription has been recorded.',
    offerAlready: 'Your subscription preference has already been recorded.',
    offerError: 'We could not record it now, please try again later.',
  },
  sk: {
    eyebrow: 'Rezervácia prijatá',
    title: 'Ďakujeme, vašu žiadosť o termín sme prijali.',
    subtitle: 'Náš kolega vás čoskoro kontaktuje, aby potvrdil podrobnosti a finálny termín.',
    nextTitle: 'Čo bude nasledovať?',
    nextItems: [
      'Skontrolujeme zadané údaje a vybrané ošetrenie.',
      'Čo najskôr sa vám ozveme telefonicky alebo e-mailom.',
      'Pri urgentnom probléme nám zavolajte aj priamo.',
    ],
    call: 'Zavolať teraz',
    email: 'Poslať e-mail',
    home: 'Späť na hlavnú stránku',
    offerTitle: 'Chcete občas dostávať extra výhody?',
    offerText: 'Akčné ponuky, možnosti bezplatného ošetrenia, súťaže a užitočné tipy o zuboch e-mailom. Posielame zriedkavo a kedykoľvek sa môžete odhlásiť.',
    offerCta: 'Chcem dostávať ponuky',
    offerNoThanks: 'Teraz nie',
    offerDone: 'Ďakujeme, vašu registráciu sme uložili.',
    offerAlready: 'Váš záujem o odber sme už zaznamenali.',
    offerError: 'Teraz sa registráciu nepodarilo uložiť, skúste to prosím neskôr.',
  },
  de: {
    eyebrow: 'Anfrage erhalten',
    title: 'Vielen Dank, wir haben Ihre Terminanfrage erhalten.',
    subtitle: 'Unser Team meldet sich in Kürze bei Ihnen, um die Einzelheiten abzustimmen und den Termin endgültig zu bestätigen.',
    nextTitle: 'Wie geht es weiter?',
    nextItems: [
      'Wir prüfen Ihre Angaben und die ausgewählte Behandlung.',
      'Wir melden uns so schnell wie möglich telefonisch oder per E-Mail.',
      'Bei akuten Beschwerden können Sie uns auch direkt anrufen.',
    ],
    call: 'Jetzt anrufen',
    email: 'E-Mail senden',
    home: 'Zurück zur Startseite',
    offerTitle: 'Möchten Sie gelegentlich exklusive Vorteile erhalten?',
    offerText: 'Sonderangebote, kostenlose Behandlungsmöglichkeiten, Gewinnspiele und nützliche Zahnpflegetipps per E-Mail. Wir versenden nur selten, und Sie können sich jederzeit abmelden.',
    offerCta: 'Angebote erhalten',
    offerNoThanks: 'Jetzt nicht',
    offerDone: 'Vielen Dank, Ihre Anmeldung wurde gespeichert.',
    offerAlready: 'Ihre Einwilligung wurde bereits gespeichert.',
    offerError: 'Die Anmeldung konnte momentan nicht gespeichert werden. Bitte versuchen Sie es später erneut.',
  },
};

export default function BookingSuccessClient() {
  const locale = useLocale();
  const safeLocale = normalizeLocale(locale);
  const text = copyByLocale[safeLocale];
  const prefix = safeLocale === 'hu' ? '' : `/${safeLocale}`;
  const [bookingConsent, setBookingConsent] = useState<BookingConsent | null>(null);
  const [offerStatus, setOfferStatus] = useState<'idle' | 'loading' | 'done' | 'already' | 'dismissed' | 'error'>('idle');

  useEffect(() => {
    const isRealBookingRedirect = sessionStorage.getItem(BOOKING_SUCCESS_STORAGE_KEY) === '1';

    if (!isRealBookingRedirect) return;

    const storedContact = sessionStorage.getItem(BOOKING_SUCCESS_CONTACT_KEY);
    let initialBookingConsent: BookingConsent | null = null;
    let initialOfferStatus: 'already' | null = null;
    if (storedContact) {
      try {
        const parsed = JSON.parse(storedContact) as BookingConsent;
        if (parsed?.marketingConsent) {
          initialBookingConsent = { marketingConsent: true };
          initialOfferStatus = 'already';
        } else if (typeof parsed?.consentToken === 'string' && parsed.consentToken.length > 0) {
          initialBookingConsent = { consentToken: parsed.consentToken, marketingConsent: false };
        }
      } catch {}
    }

    const stateFrame = window.requestAnimationFrame(() => {
      if (initialBookingConsent) setBookingConsent(initialBookingConsent);
      if (initialOfferStatus) setOfferStatus(initialOfferStatus);
    });

    sessionStorage.removeItem(BOOKING_SUCCESS_STORAGE_KEY);

    let conversionSent = false;
    const sendConversion = () => {
      if (conversionSent) return;
      conversionSent = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: BOOKING_SUCCESS_EVENT,
        event_category: 'booking',
        event_label: 'appointment_success_page',
        page_path: window.location.pathname,
      });
    };
    try {
      const stored = parseStoredConsent(localStorage.getItem(CONSENT_STORAGE_KEY)).consent;
      if (stored && (stored.analytics || stored.marketing)) sendConversion();
    } catch {
      // Invalid or unavailable consent storage means no measurement event.
    }
    const handleConsent = (event: Event) => {
      const detail = currentConsentFrom((event as CustomEvent<unknown>).detail);
      if (detail && (detail.analytics || detail.marketing)) sendConversion();
    };
    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => {
      window.cancelAnimationFrame(stateFrame);
      window.removeEventListener(CONSENT_EVENT, handleConsent);
    };
  }, []);

  const handleOfferSignup = async () => {
    if (!bookingConsent?.consentToken) return;
    setOfferStatus('loading');
    try {
      const res = await fetch('/api/marketing-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentToken: bookingConsent.consentToken,
          locale: safeLocale,
        }),
      });
      const data = await res.json().catch(() => ({})) as { success?: boolean };
      if (!res.ok || data.success !== true) throw new Error('Marketing consent failed');
      const updatedConsent = { marketingConsent: true };
      try {
        sessionStorage.setItem(BOOKING_SUCCESS_CONTACT_KEY, JSON.stringify(updatedConsent));
      } catch {
        // Consent is already saved server-side; storage only controls this local panel.
      }
      setBookingConsent(updatedConsent);
      setOfferStatus('done');
    } catch {
      setOfferStatus('error');
    }
  };

  const dismissOffer = () => {
    try {
      sessionStorage.removeItem(BOOKING_SUCCESS_CONTACT_KEY);
    } catch {
      // The token remains short-lived server-side if browser storage is unavailable.
    }
    setBookingConsent(null);
    setOfferStatus('dismissed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pt-28 pb-20 selection:bg-sky-200 selection:text-sky-900">
      <main className="container mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl shadow-sky-100/70 border border-sky-100 md:p-10 lg:p-12">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="text-center lg:text-left">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-100 lg:mx-0">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-sky-700">
                  <CalendarCheck2 className="h-4 w-4" /> {text.eyebrow}
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-950 md:text-5xl">
                  {text.title}
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-gray-600">
                  {text.subtitle}
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-gray-50 p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-black text-gray-950">{text.nextTitle}</h2>
                <div className="space-y-4">
                  {text.nextItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <p className="text-gray-600 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                {bookingConsent && offerStatus !== 'dismissed' && (
                  <div className="mt-8 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                      Crown Dental extra
                    </div>
                    <h3 className="text-xl font-black text-gray-950">{text.offerTitle}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{text.offerText}</p>
                    {(offerStatus === 'done' || offerStatus === 'already') ? (
                      <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        {offerStatus === 'done' ? text.offerDone : text.offerAlready}
                      </p>
                    ) : (
                      <>
                        {offerStatus === 'error' && (
                          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{text.offerError}</p>
                        )}
                        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                          <button
                            type="button"
                            onClick={handleOfferSignup}
                            disabled={offerStatus === 'loading'}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white transition-all hover:bg-emerald-600 disabled:bg-gray-300"
                          >
                            {offerStatus === 'loading' ? '...' : text.offerCta}
                          </button>
                          <button
                            type="button"
                            onClick={dismissOffer}
                            className="rounded-2xl px-5 py-4 text-sm font-black text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          >
                            {text.offerNoThanks}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a href="tel:+36705646837" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 font-black text-white transition-all hover:bg-sky-700">
                    <Phone className="h-5 w-5" /> {text.call}
                  </a>
                  <a href="mailto:info@crowndental.hu" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 font-black text-gray-900 transition-all hover:bg-sky-50">
                    <Mail className="h-5 w-5 text-sky-600" /> {text.email}
                  </a>
                </div>

                <Link href={`${prefix}/`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-4 font-black text-white transition-all hover:bg-gray-800">
                  <Home className="h-5 w-5" /> {text.home} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
