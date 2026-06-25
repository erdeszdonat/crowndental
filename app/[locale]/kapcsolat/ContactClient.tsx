'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const copyByLocale = {
  hu: {
    eyebrow: 'Kapcsolat',
    title: 'Beszéljünk, és megtaláljuk a legjobb következő lépést.',
    subtitle: 'Esztergomi rendelőnkben várjuk pácienseinket. Hívjon, írjon e-mailt, vagy foglaljon online időpontot pár kattintással.',
    call: 'Hívás most',
    book: 'Időpontfoglalás',
    email: 'E-mail küldése',
    map: 'Útvonalterv',
    urgentTitle: 'Sürgős eset?',
    urgentText: 'Hívjon hétvégén is, ha sürgős panaszról van szó.',
    available: 'Hétfő – vasárnap',
    availableNote: 'A hét minden napján fogadjuk a megkereséseket.',
    clinicTitle: 'Crown Dental Esztergom',
    clinicIntro: 'Aktív rendelőnk Esztergom központjában, saját laborháttérrel és átlátható kezelési tervvel.',
    addressLabel: 'Cím',
    phoneLabel: 'Telefon',
    emailLabel: 'E-mail',
    nextTitle: 'Miben segítünk gyorsan?',
    nextItems: [
      'Ha fájdalma vagy sürgős panasza van, telefonon tudunk a leggyorsabban segíteni.',
      'Ha kezelési tervet vagy árajánlatot szeretne, foglaljon állapotfelmérést online.',
      'Ha röntgent, fotót vagy korábbi árajánlatot küldene, írjon e-mailt rövid leírással.',
    ],
    trustTitle: 'Nem kell pontosan tudnia, mire van szüksége.',
    trustText: 'Elég, ha leírja vagy elmondja, mi zavarja. Mi segítünk eldönteni, hogy vizsgálat, konzultáció vagy sürgősebb ellátás a jó következő lépés.',
  },
  en: {
    eyebrow: 'Contact',
    title: 'Let’s talk and find the best next step.',
    subtitle: 'Our Esztergom clinic is ready to welcome you. Call, email or book your appointment online in a few clicks.',
    call: 'Call now',
    book: 'Book appointment',
    email: 'Send email',
    map: 'Directions',
    urgentTitle: 'Urgent concern?',
    urgentText: 'Call us on weekends as well if your concern is urgent.',
    available: 'Monday – Sunday',
    availableNote: 'We receive enquiries every day of the week.',
    clinicTitle: 'Crown Dental Esztergom',
    clinicIntro: 'Our active clinic in central Esztergom, with in-house lab support and transparent treatment planning.',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    nextTitle: 'How can we help quickly?',
    nextItems: [
      'If you have pain or an urgent concern, phone is the fastest way to reach us.',
      'If you need a treatment plan or quote, book an assessment online.',
      'If you want to send an X-ray, photo or previous quote, email us with a short note.',
    ],
    trustTitle: 'You do not need to know exactly what you need.',
    trustText: 'Just tell us what bothers you. We will help decide whether an assessment, consultation or more urgent care is the right next step.',
  },
  sk: {
    eyebrow: 'Kontakt',
    title: 'Porozprávajme sa a nájdime najlepší ďalší krok.',
    subtitle: 'Naša ambulancia v Ostrihome vás privíta. Zavolajte, napíšte e-mail alebo si rezervujte termín online.',
    call: 'Zavolať teraz',
    book: 'Rezervovať termín',
    email: 'Poslať e-mail',
    map: 'Navigácia',
    urgentTitle: 'Súrny problém?',
    urgentText: 'Ak ide o urgentný problém, zavolajte nám aj cez víkend.',
    available: 'Pondelok – nedeľa',
    availableNote: 'Dopyty prijímame každý deň v týždni.',
    clinicTitle: 'Crown Dental Esztergom',
    clinicIntro: 'Naša aktívna ambulancia v centre Ostrihomu, s vlastným laboratórnym zázemím a jasným liečebným plánom.',
    addressLabel: 'Adresa',
    phoneLabel: 'Telefón',
    emailLabel: 'E-mail',
    nextTitle: 'S čím pomôžeme rýchlo?',
    nextItems: [
      'Ak máte bolesť alebo urgentný problém, telefonát je najrýchlejší kontakt.',
      'Ak potrebujete plán liečby alebo cenovú ponuku, rezervujte si vstupné vyšetrenie online.',
      'Ak chcete poslať RTG, fotografiu alebo staršiu ponuku, pošlite nám e-mail s krátkym opisom.',
    ],
    trustTitle: 'Nemusíte presne vedieť, čo potrebujete.',
    trustText: 'Stačí povedať, čo vás trápi. Pomôžeme určiť, či je vhodné vyšetrenie, konzultácia alebo urgentnejšia starostlivosť.',
  },
};

const address = '2500 Esztergom, Petőfi Sándor utca 11.';
const phone = '06 30 589 2468';
const email = 'info@crowndental.hu';
const mapHref = 'https://share.google/UV0bxLOGoyQdgH826';

function ContactAnimation() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      <motion.div
        className="absolute inset-0 rounded-full border border-sky-200"
        animate={{ scale: [0.86, 1.08, 0.86], opacity: [0.65, 0.15, 0.65] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-10 rounded-full border border-cyan-200"
        animate={{ scale: [1, 0.84, 1], opacity: [0.2, 0.75, 0.2] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-gradient-to-br from-sky-500 to-cyan-400 shadow-[0_24px_80px_rgba(14,165,233,0.35)]"
        animate={{ y: [-8, 8, -8], rotate: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-[2rem] bg-white/10" />
        <div className="flex h-full w-full items-center justify-center text-white">
          <Phone className="h-14 w-14" />
        </div>
      </motion.div>
      <motion.div
        className="absolute right-8 top-14 rounded-2xl bg-white px-4 py-3 shadow-xl border border-sky-100"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Mail className="h-5 w-5 text-sky-600" />
      </motion.div>
      <motion.div
        className="absolute bottom-14 left-8 rounded-2xl bg-white px-4 py-3 shadow-xl border border-sky-100"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Calendar className="h-5 w-5 text-sky-600" />
      </motion.div>
    </div>
  );
}

export default function ContactClient() {
  const locale = useLocale();
  const text = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.hu;
  const prefix = locale === 'hu' ? '' : `/${locale}`;

  return (
    <div className="min-h-screen bg-white selection:bg-sky-200 selection:text-sky-900">
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white pt-28 pb-16 lg:pt-36 lg:pb-20">
          <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.12),transparent_28%)]" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-sky-700 shadow-sm">
                  <Sparkles className="h-4 w-4" /> {text.eyebrow}
                </div>
                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                  {text.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                  {text.subtitle}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="tel:+36305892468" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-sky-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-sky-600/20 transition-all hover:-translate-y-0.5 hover:bg-sky-700">
                    <Phone className="h-5 w-5" /> {text.call}
                  </a>
                  <Link href={`${prefix}/idopont`} className="inline-flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-7 py-4 text-base font-black text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                    <Calendar className="h-5 w-5 text-sky-600" /> {text.book}
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
                <ContactAnimation />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="pb-24 pt-4">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/60 md:p-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> {text.available}
                    </div>
                    <h2 className="text-3xl font-black text-gray-950 md:text-4xl">{text.clinicTitle}</h2>
                    <p className="mt-3 max-w-2xl text-gray-600 leading-relaxed">{text.clinicIntro}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-5">
                    <MapPin className="mb-4 h-6 w-6 text-sky-600" />
                    <div className="mb-1 text-xs font-black uppercase tracking-widest text-gray-400">{text.addressLabel}</div>
                    <div className="font-bold text-gray-900">{address}</div>
                  </div>
                  <a href="tel:+36305892468" className="rounded-2xl bg-sky-50 p-5 transition-all hover:-translate-y-1 hover:bg-sky-100">
                    <Phone className="mb-4 h-6 w-6 text-sky-600" />
                    <div className="mb-1 text-xs font-black uppercase tracking-widest text-sky-500">{text.phoneLabel}</div>
                    <div className="font-black text-gray-950">{phone}</div>
                  </a>
                  <a href="mailto:info@crowndental.hu" className="rounded-2xl bg-gray-50 p-5 transition-all hover:-translate-y-1 hover:bg-sky-50">
                    <Mail className="mb-4 h-6 w-6 text-sky-600" />
                    <div className="mb-1 text-xs font-black uppercase tracking-widest text-gray-400">{text.emailLabel}</div>
                    <div className="font-bold text-gray-900">{email}</div>
                  </a>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-4 font-black text-white transition-all hover:-translate-y-0.5 hover:bg-gray-800">
                    <Navigation className="h-5 w-5" /> {text.map}
                  </a>
                  <a href="mailto:info@crowndental.hu" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 font-black text-gray-900 transition-all hover:border-sky-200 hover:bg-sky-50">
                    <Mail className="h-5 w-5 text-sky-600" /> {text.email}
                  </a>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-[2rem] bg-gradient-to-br from-gray-950 to-sky-950 p-6 text-white shadow-2xl md:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
                  <Clock className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-black">{text.urgentTitle}</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-300">{text.urgentText}</p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5">
                  <div className="font-black text-sky-200">{text.available}</div>
                  <div className="mt-1 text-sm text-gray-300">{text.availableNote}</div>
                </div>
                <a href="tel:+36305892468" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-sky-800 transition-all hover:bg-sky-50">
                  <Phone className="h-5 w-5" /> {text.call}
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 max-w-6xl mx-auto lg:grid-cols-[1fr_420px]">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] bg-white p-8 shadow-xl shadow-gray-200/70 md:p-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-sky-700">
                  <MessageCircle className="h-4 w-4" /> {text.nextTitle}
                </div>
                <div className="space-y-5">
                  {text.nextItems.map((item) => (
                    <div key={item} className="flex items-start gap-4">
                      <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-500" />
                      <p className="text-lg leading-relaxed text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-[2rem] border border-sky-100 bg-sky-50 p-8 md:p-10">
                <ShieldCheck className="mb-6 h-10 w-10 text-sky-600" />
                <h2 className="text-3xl font-black text-gray-950">{text.trustTitle}</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">{text.trustText}</p>
                <Link href={`${prefix}/idopont`} className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-sky-600 px-6 py-4 font-black text-white transition-all hover:bg-sky-700">
                  {text.book} <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
