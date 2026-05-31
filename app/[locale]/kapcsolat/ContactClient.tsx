'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowRight,
  Building2,
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
    badge: 'Kapcsolat',
    titleTop: 'Gyors válasz,',
    titleBottom: 'biztos irány.',
    subtitle: 'Hívjon minket, írjon e-mailt, vagy foglaljon online időpontot. Esztergomban már várjuk, Budapest pedig 2026. július 31-től fogad foglalásokat.',
    book: 'Időpontot foglalok',
    call: 'Hívás most',
    email: 'E-mail küldése',
    route: 'Útvonalterv',
    openMap: 'Megnyitás térképen',
    clinicsTitle: 'Két rendelő, egy prémium ellátási szint',
    clinicsSubtitle: 'Válassza ki az Önnek kényelmes helyszínt, a szakmai háttér és a saját labor ugyanaz a Crown Dental minőség.',
    esztergomDesc: 'Aktív rendelőnk Esztergom szívében, személyes vizsgálatokhoz és kezelésekhez.',
    budapestDesc: 'Új, Duna-parti rendelőnk 2026. július 31-től fogad időpontokat.',
    esztergomStatus: 'Foglalható most',
    budapestStatus: 'Foglalható július 31-től',
    hours: 'Hétfő – Péntek · 08:00 – 18:00',
    responseTitle: 'Mire számíthat?',
    responseItems: [
      'Telefonon a leggyorsabb: sürgős kérdésnél hívjon minket közvetlenül.',
      'Online foglalásnál azonnali visszajelzést kap a kiválasztott adatokkal.',
      'E-mailben küldhet röntgent, árajánlatot vagy rövid leírást a panaszról.',
    ],
    trustTitle: 'Nem kell mindent tudnia előre.',
    trustText: 'Ha bizonytalan, melyik kezelésre van szüksége, elég egy állapotfelmérést foglalni. A rendelőben átlátható tervet és pontos következő lépést adunk.',
  },
  en: {
    badge: 'Contact',
    titleTop: 'Fast reply,',
    titleBottom: 'clear next step.',
    subtitle: 'Call us, send an email or book online. Esztergom is open now, while Budapest accepts bookings from 31 July 2026.',
    book: 'Book appointment',
    call: 'Call now',
    email: 'Send email',
    route: 'Directions',
    openMap: 'Open map',
    clinicsTitle: 'Two clinics, one premium standard',
    clinicsSubtitle: 'Choose the location that works for you. The clinical background and in-house lab quality remain Crown Dental.',
    esztergomDesc: 'Our active clinic in the heart of Esztergom for consultations and treatments.',
    budapestDesc: 'Our new riverside Budapest clinic accepts appointments from 31 July 2026.',
    esztergomStatus: 'Bookable now',
    budapestStatus: 'Bookable from 31 July',
    hours: 'Monday – Friday · 08:00 – 18:00',
    responseTitle: 'What happens next?',
    responseItems: [
      'Phone is fastest: for urgent questions, call us directly.',
      'Online booking gives an immediate confirmation flow with your selected details.',
      'By email, you can send X-rays, quotes or a short description of your concern.',
    ],
    trustTitle: 'You do not need to know everything upfront.',
    trustText: 'If you are unsure which treatment you need, book an assessment. We will give you a clear plan and the precise next step.',
  },
  sk: {
    badge: 'Kontakt',
    titleTop: 'Rýchla odpoveď,',
    titleBottom: 'jasný ďalší krok.',
    subtitle: 'Zavolajte nám, pošlite e-mail alebo si rezervujte termín online. Ostrihom je otvorený, Budapešť prijíma rezervácie od 31. júla 2026.',
    book: 'Rezervovať termín',
    call: 'Zavolať teraz',
    email: 'Poslať e-mail',
    route: 'Navigácia',
    openMap: 'Otvoriť mapu',
    clinicsTitle: 'Dve ambulancie, jeden prémiový štandard',
    clinicsSubtitle: 'Vyberte si pohodlnú lokalitu. Odborné zázemie a vlastné laboratórium zostávajú v kvalite Crown Dental.',
    esztergomDesc: 'Naša aktívna ambulancia v srdci Ostrihomu pre konzultácie a ošetrenia.',
    budapestDesc: 'Nová budapeštianska ambulancia pri Dunaji prijíma termíny od 31. júla 2026.',
    esztergomStatus: 'Rezervácia možná teraz',
    budapestStatus: 'Rezervácia od 31. júla',
    hours: 'Pondelok – Piatok · 08:00 – 18:00',
    responseTitle: 'Čo bude nasledovať?',
    responseItems: [
      'Telefón je najrýchlejší: pri urgentnej otázke nám zavolajte priamo.',
      'Online rezervácia vás okamžite prevedie vybranými údajmi.',
      'E-mailom môžete poslať RTG, cenovú ponuku alebo krátky opis problému.',
    ],
    trustTitle: 'Nemusíte vedieť všetko vopred.',
    trustText: 'Ak si nie ste istí, aké ošetrenie potrebujete, rezervujte si vstupné vyšetrenie. Dostanete jasný plán a presný ďalší krok.',
  },
};

const clinics = [
  {
    key: 'esztergom',
    name: 'Crown Dental Esztergom',
    address: '2500 Esztergom, Petőfi Sándor utca 11.',
    mapHref: 'https://share.google/UV0bxLOGoyQdgH826',
    accent: 'sky',
  },
  {
    key: 'budapest',
    name: 'Crown Dental Budapest',
    address: '1039 Budapest, Királyok útja 55.',
    mapHref: 'https://maps.google.com/?q=1039+Budapest+Királyok+útja+55',
    accent: 'amber',
  },
] as const;

export default function ContactClient() {
  const locale = useLocale();
  const text = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.hu;
  const prefix = locale === 'hu' ? '' : `/${locale}`;

  return (
    <div className="bg-white min-h-screen overflow-hidden selection:bg-sky-200 selection:text-sky-900">
      <main>
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-gray-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.28),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_52%,#082f49)]" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />

          <div className="relative z-10 container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/15 backdrop-blur-xl rounded-full text-sky-300 text-xs sm:text-sm font-bold tracking-wider uppercase mb-8">
                  <Sparkles className="w-4 h-4" /> {text.badge}
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8">
                  {text.titleTop}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-200">{text.titleBottom}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed font-light max-w-3xl mb-10">
                  {text.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`${prefix}/idopont`} className="group inline-flex items-center justify-center gap-3 px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white text-lg font-bold rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.35)] transition-all">
                    <Calendar className="w-5 h-5" /> {text.book} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="tel:+36705646837" className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-2xl border border-white/15 backdrop-blur-md transition-all">
                    <Phone className="w-5 h-5" /> {text.call}
                  </a>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
                <div className="absolute -inset-4 bg-sky-400/20 blur-3xl rounded-[2rem]" />
                <div className="relative bg-white/10 border border-white/15 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                  <div className="space-y-4">
                    <a href="tel:+36705646837" className="flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-900 shadow-xl hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">{text.call}</div>
                        <div className="font-black text-lg">+36 70 564 6837</div>
                      </div>
                    </a>
                    <a href="mailto:info@crowndental.hu" className="flex items-center gap-4 p-4 rounded-2xl bg-white/95 text-gray-900 shadow-xl hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">{text.email}</div>
                        <div className="font-black text-lg">info@crowndental.hu</div>
                      </div>
                    </a>
                    <Link href={`${prefix}/idopont`} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-xl hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                      <div>
                        <div className="text-sm text-sky-100 font-semibold">{text.book}</div>
                        <div className="font-black text-lg">crowndental.hu/idopont</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{text.route}</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">{text.clinicsTitle}</h2>
              <p className="text-xl text-gray-500 font-light">{text.clinicsSubtitle}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {clinics.map((clinic, index) => {
                const isBudapest = clinic.key === 'budapest';
                const isAmber = clinic.accent === 'amber';
                return (
                  <motion.div key={clinic.key} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="group relative rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 shadow-xl">
                    <div className={`h-2 ${isAmber ? 'bg-amber-500' : 'bg-sky-500'}`} />
                    <div className="p-8 md:p-10">
                      <div className="flex items-start justify-between gap-4 mb-8">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isAmber ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
                          <Building2 className="w-8 h-8" />
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-black ${isAmber ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isBudapest ? text.budapestStatus : text.esztergomStatus}
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{clinic.name}</h3>
                      <p className="text-gray-500 text-lg leading-relaxed mb-8">{isBudapest ? text.budapestDesc : text.esztergomDesc}</p>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3 text-gray-700">
                          <MapPin className={`w-5 h-5 mt-1 ${isAmber ? 'text-amber-500' : 'text-sky-500'}`} />
                          <span className="font-semibold">{clinic.address}</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-700">
                          <Clock className={`w-5 h-5 mt-1 ${isAmber ? 'text-amber-500' : 'text-sky-500'}`} />
                          <span className="font-semibold">{text.hours}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a href={clinic.mapHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-bold transition-all ${isAmber ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-600 hover:bg-sky-700'}`}>
                          <Navigation className="w-5 h-5" /> {text.openMap}
                        </a>
                        <Link href={`${prefix}/idopont`} className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-all">
                          <Calendar className="w-5 h-5" /> {text.book}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_420px] gap-10 max-w-6xl mx-auto items-start">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-black mb-6">
                  <MessageCircle className="w-4 h-4" /> {text.responseTitle}
                </div>
                <div className="space-y-5">
                  {text.responseItems.map((item) => (
                    <div key={item} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-lg leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="bg-gradient-to-br from-gray-950 to-sky-950 rounded-[2rem] p-8 md:p-10 shadow-2xl text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-sky-300 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black mb-4">{text.trustTitle}</h2>
                <p className="text-gray-300 leading-relaxed text-lg mb-8">{text.trustText}</p>
                <Link href={`${prefix}/idopont`} className="inline-flex items-center gap-3 px-6 py-4 bg-white text-sky-800 rounded-2xl font-black hover:bg-sky-50 transition-all">
                  {text.book} <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
