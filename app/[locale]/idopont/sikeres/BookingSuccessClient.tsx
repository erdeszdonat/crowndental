'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowRight, CalendarCheck2, CheckCircle2, Home, Mail, Phone } from 'lucide-react';

const BOOKING_SUCCESS_STORAGE_KEY = 'crown_booking_success';
const BOOKING_SUCCESS_EVENT = 'appointment_booking_success';

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
  },
};

export default function BookingSuccessClient() {
  const locale = useLocale();
  const text = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.hu;
  const prefix = locale === 'hu' ? '' : `/${locale}`;

  useEffect(() => {
    const isRealBookingRedirect = sessionStorage.getItem(BOOKING_SUCCESS_STORAGE_KEY) === '1';

    if (!isRealBookingRedirect) return;

    sessionStorage.removeItem(BOOKING_SUCCESS_STORAGE_KEY);

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };

    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: BOOKING_SUCCESS_EVENT,
      event_category: 'booking',
      event_label: 'appointment_success_page',
      page_path: window.location.pathname,
    });

    win.gtag?.('event', BOOKING_SUCCESS_EVENT, {
      event_category: 'booking',
      event_label: 'appointment_success_page',
    });
  }, []);

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
