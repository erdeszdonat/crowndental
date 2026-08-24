'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin, Phone, Award, Building2, Shield, Calendar,
  ArrowRight, CheckCircle2, Star, Heart, Upload, Search, Activity,
  Sparkles, User, FileText, Loader2, Download, ChevronDown, Wrench,
  Pause, Play,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getPreferredGreetingName } from '@/lib/names';

export type HomeSanityImages = {
  hero: Record<'fokep' | 'fokep1' | 'fokep2', string>;
  locations: Record<string, { name?: string; title?: string; address?: string; tag?: string; imageUrl?: string }>;
  labImage: string;
  services: Record<string, string>;
};

const emptyHomeSanityImages: HomeSanityImages = {
  hero: { fokep: '', fokep1: '', fokep2: '' },
  locations: {},
  labImage: '',
  services: {},
};

const compressImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      if (typeof e.target?.result !== 'string') {
        reject(new Error('invalid_image_data'));
        return;
      }
      const img = document.createElement('img');
      img.src = e.target.result;
      img.onerror = () => reject(new Error('image_decode_failed'));
      img.onload = () => {
        if (!img.width || !img.height || img.width * img.height > 40_000_000) {
          reject(new Error('image_dimensions_unsupported'));
          return;
        }
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const MAX = 1200;
        if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas_unavailable'));
          return;
        }
        ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => blob
          ? resolve(new File([blob], 'c_' + file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }))
          : reject(new Error('blob')), 'image/jpeg', 0.6);
      };
    };
    reader.onerror = reject;
  });

function escapePdfHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildPDF(result: QuoteAnalysisResult, name: string, phone: string, email: string, nickname: string, locale: QuoteLocale) {
  const copy = {
    hu: { title: 'Automatikus előzetes ár-összehasonlítás', difference: 'Becsült megtakarítási tartomány', treatment: 'Kezelés', other: 'Másik árajánlat', crown: 'Crown Dental tájékoztató ártartomány', total: 'Összesen', manual: 'Kézi ellenőrzés szükséges', noSaving: 'Biztos megtakarítás nem állapítható meg', notice: 'Ez automatikus, tájékoztató becslés; nem diagnózis és nem kötelező érvényű ajánlat. A végleges kezelési tervet és árat személyes vizsgálat után adjuk meg.' },
    en: { title: 'Automated preliminary price comparison', difference: 'Estimated savings range', treatment: 'Treatment', other: 'Other quote', crown: 'Crown Dental guide range', total: 'Total', manual: 'Manual review required', noSaving: 'No guaranteed saving can be stated', notice: 'This automated estimate is for guidance only; it is not a diagnosis or a binding quote. A final treatment plan and price require an in-person examination.' },
    sk: { title: 'Automatické predbežné porovnanie cien', difference: 'Odhadované rozpätie úspory', treatment: 'Ošetrenie', other: 'Iná ponuka', crown: 'Orientačné cenové rozpätie Crown Dental', total: 'Celkom', manual: 'Potrebná manuálna kontrola', noSaving: 'Zaručenú úsporu nemožno určiť', notice: 'Ide o automatický orientačný odhad; nejde o diagnózu ani záväznú ponuku. Konečný plán ošetrenia a cenu určíme po osobnom vyšetrení.' },
    de: { title: 'Automatisierter vorläufiger Preisvergleich', difference: 'Geschätzte Ersparnisspanne', treatment: 'Behandlung', other: 'Anderes Angebot', crown: 'Crown Dental Richtpreisspanne', total: 'Gesamt', manual: 'Manuelle Prüfung erforderlich', noSaving: 'Keine sichere Ersparnis feststellbar', notice: 'Diese automatisierte Schätzung dient nur zur Orientierung; sie ist weder Diagnose noch verbindliches Angebot. Behandlungsplan und Endpreis werden nach einer persönlichen Untersuchung festgelegt.' },
  }[locale];
  const number = new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : locale === 'sk' ? 'sk-SK' : locale === 'de' ? 'de-DE' : 'en-GB');
  const money = (value: number) => `${number.format(value)} HUF`;
  const range = (min: number | null, max: number | null) => min === null || max === null
    ? copy.manual
    : min === max ? money(min) : `${number.format(min)}–${number.format(max)} HUF`;
  const date = new Date().toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'sk' ? 'sk-SK' : locale === 'de' ? 'de-DE' : 'en-GB');
  const patientLine = [nickname || name, phone, email].map(escapePdfHtml).join(' | ');
  const rows = result.items.map((item) => `<tr><td>${escapePdfHtml(item.name)}</td><td class="number">${money(item.competitorPrice)}</td><td class="number crown">${range(item.ourPriceMin, item.ourPriceMax)}</td></tr>`).join('');
  const summary = result.savingsMin !== null && result.savingsMax !== null
    ? range(result.savingsMin, result.savingsMax)
    : result.requiresManualReview ? copy.manual : copy.noSaving;

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${copy.title}</title><style>@page{size:A4;margin:16mm 18mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#0f172a;margin:0}.header{display:flex;justify-content:space-between;border-bottom:3px solid #0284c7;padding-bottom:14px}.brand{font-size:26px;font-weight:900;color:#0369a1}.meta{font-size:11px;color:#64748b;text-align:right}h1{font-size:22px;margin:24px 0 6px}.patient{font-size:12px;color:#64748b}.summary{background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px;text-align:center;margin:22px 0}.summary strong{display:block;font-size:22px;color:#0369a1;margin-top:5px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}.number{text-align:right}.crown{color:#0369a1;font-weight:800}tfoot td{border-top:2px solid #0284c7;font-weight:900}.notice{margin-top:24px;padding:14px;border:1px solid #fbbf24;background:#fffbeb;border-radius:10px;font-size:11px;line-height:1.55;color:#78350f}</style></head><body><div class="header"><div><div class="brand">CROWN DENTAL</div><div class="meta">Praxis és Labor · Esztergom · Budapest</div></div><div class="meta">${date}<br>+36 70 564 6837</div></div><h1>${copy.title}</h1><div class="patient">${patientLine}</div><div class="summary">${copy.difference}<strong>${summary}</strong></div><table><thead><tr><th>${copy.treatment}</th><th class="number">${copy.other}</th><th class="number">${copy.crown}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>${copy.total}</td><td class="number">${money(result.competitorTotal)}</td><td class="number crown">${range(result.ourTotalMin, result.ourTotalMax)}</td></tr></tfoot></table><div class="notice">${copy.notice}</div></body></html>`;
}

// ─── Lebegő CTA ───────────────────────────────────────────────────────────────
function FloatingCTA() {
  const t = useTranslations('home.floatingCta');
  const locale = useLocale();
  const router = useRouter();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bookingHref = `${p}/idopont`;

  useEffect(() => {
    router.prefetch(bookingHref);
  }, [bookingHref, router]);

  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type:'spring', damping:20, stiffness:300, delay:0.15 }} className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      <a href="tel:+36705646837" className="flex items-center gap-2 bg-white text-sky-700 pl-4 pr-5 py-3 rounded-full shadow-2xl border border-sky-100 hover:bg-sky-50 transition-all">
        <Phone className="w-5 h-5" /><span className="font-bold text-sm hidden sm:inline">{t('callNow')}</span>
      </a>
      <Link
        href={bookingHref}
        prefetch
        onMouseEnter={() => router.prefetch(bookingHref)}
        onTouchStart={() => router.prefetch(bookingHref)}
        className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-4 rounded-full shadow-[0_8px_40px_rgba(2,132,199,0.4)] hover:scale-105 hover:shadow-[0_8px_50px_rgba(2,132,199,0.6)] active:scale-95 transition-all"
      >
        <Calendar className="w-5 h-5" /><span className="font-bold">{t('bookAppointment')}</span><ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function HeroSlider({ images }: { images: HomeSanityImages['hero'] }) {
  const tSlides = useTranslations('home.hero');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [current, setCurrent] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset:['start start','end start'] });
  const imgY = useTransform(scrollYProgress, [0,1], ['0%','20%']);
  const textY = useTransform(scrollYProgress, [0,1], ['0%','40%']);
  const opacity = useTransform(scrollYProgress, [0,0.5], [1,0]);
  const carouselPaused = Boolean(prefersReducedMotion) || isManuallyPaused || isInteractionPaused;
  const carouselControl = {
    hu: { pause: 'Diavetítés szüneteltetése', play: 'Diavetítés folytatása' },
    en: { pause: 'Pause slideshow', play: 'Resume slideshow' },
    sk: { pause: 'Pozastaviť prezentáciu', play: 'Pokračovať v prezentácii' },
    de: { pause: 'Diashow pausieren', play: 'Diashow fortsetzen' },
  }[locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu'];

  const slideData = tSlides.raw('slides') as Array<{ tag:string; titleTop:string; titleBottom:string; subtitle:string; primaryText:string }>;

  const staticSlides = [
    { image: images.fokep,  href: '#arajanlat-elemzo', icon: <Upload className="w-6 h-6" /> },
    { image: images.fokep1, href: `${p}/idopont`,       icon: <Calendar className="w-6 h-6" /> },
    { image: images.fokep2, href: `${p}/idopont`,       icon: <Calendar className="w-6 h-6" /> },
  ];

  useEffect(() => {
    if (carouselPaused) return;
    const t = setInterval(() => setCurrent(c => (c+1)%3), 10000);
    return () => clearInterval(t);
  }, [carouselPaused]);

  return (
    <section
      ref={ref}
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsInteractionPaused(false);
      }}
      className="relative mt-24 h-[90svh] min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-950"
    >
      <motion.div style={prefersReducedMotion ? undefined : { y:imgY }} className="absolute inset-0 z-0 will-change-transform">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current} initial={prefersReducedMotion ? false : { opacity:0, scale:1.03 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:prefersReducedMotion ? 0 : 0.65, ease:'easeInOut' }} className="absolute inset-0">
            {staticSlides[current].image
              ? (
                <div className="absolute inset-x-0 top-0 h-[120%]">
                  <Image
                    src={staticSlides[current].image}
                    alt="Crown Dental"
                    fill
                    priority={current === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              )
              : <div className="w-full h-full bg-slate-800 animate-pulse" />}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white to-transparent z-10" />
      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize:'80px 80px' }} />

      <motion.div style={prefersReducedMotion ? undefined : { y:textY, opacity }} className="relative z-20 container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current} initial={prefersReducedMotion ? false : { opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-24 }} transition={{ duration:prefersReducedMotion ? 0 : 0.45 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-sky-300 text-xs sm:text-sm font-bold tracking-wider uppercase mb-8">
                <Sparkles className="w-4 h-4" /> {slideData[current]?.tag}
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight">
                {slideData[current]?.titleTop}{' '}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{slideData[current]?.titleBottom}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl font-light">{slideData[current]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a href={staticSlides[current].href} whileHover={prefersReducedMotion ? undefined : { scale:1.03 }} whileTap={prefersReducedMotion ? undefined : { scale:0.97 }} className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white text-lg font-bold rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.4)] transition-all">
                  {staticSlides[current].icon} {slideData[current]?.primaryText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a href="tel:+36705646837" whileHover={prefersReducedMotion ? undefined : { scale:1.03 }} whileTap={prefersReducedMotion ? undefined : { scale:0.97 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-bold rounded-2xl transition-all border border-white/20">
                  <Phone className="w-5 h-5" /> +36 70 564 6837
                </motion.a>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-2 mt-10">
            {[0,1,2].map(i => <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i===current?'w-10 bg-sky-400':'w-5 bg-white/30 hover:bg-white/50'}`} aria-label={`Slide ${i+1}`} />)}
            {!prefersReducedMotion && <button type="button" onClick={() => setIsManuallyPaused((paused) => !paused)} aria-pressed={isManuallyPaused} aria-label={isManuallyPaused ? carouselControl.play : carouselControl.pause} className="ml-2 rounded-full border border-white/20 bg-white/10 p-2 text-white/80 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              {isManuallyPaused ? <Play className="h-4 w-4"/> : <Pause className="h-4 w-4"/>}
            </button>}
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">{tCommon('scrollDown')}</span>
        <motion.div animate={prefersReducedMotion ? undefined : { y:[0,8,0] }} transition={prefersReducedMotion ? undefined : { duration:1.5, repeat:Infinity }}><ChevronDown className="w-5 h-5" /></motion.div>
      </motion.div>
    </section>
  );
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────
function TrustBadges() {
  const t = useTranslations('home.trustBadges');
  const badges = [
    { icon:<Award className="w-7 h-7" />,    key:'experience' },
    { icon:<Building2 className="w-7 h-7" />, key:'lab' },
    { icon:<Shield className="w-7 h-7" />,    key:'materials' },
    { icon:<Heart className="w-7 h-7" />,     key:'painless' },
  ] as const;
  return (
    <section className="relative bg-white z-20 py-16 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {badges.map((b, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }} className="bg-white rounded-3xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">{b.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1 text-base md:text-lg">{t(`${b.key}.title`)}</h3>
              <p className="text-gray-500 text-sm">{t(`${b.key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Location Selector ────────────────────────────────────────────────────────
function LocationSelector({ locations }: { locations: HomeSanityImages['locations'] }) {
  const t = useTranslations('home.locations');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {t('title')}{' '}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Esztergom */}
          <motion.a href={`${p}/esztergom`} initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer bg-gray-900 block">
            <div className="absolute inset-0">{locations.esztergom?.imageUrl?<img src={locations.esztergom.imageUrl} loading="lazy" alt="Esztergom" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>:<div className="w-full h-full bg-slate-800"/>}</div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent"/>
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider mb-3 text-sm"><MapPin className="w-4 h-4"/>{locations.esztergom?.tag||'Komárom-Esztergom'}</div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{t('esztergomName')}</h3>
              <p className="text-gray-300 text-base md:text-lg font-medium mb-6">{locations.esztergom?.address||'Esztergom, Petőfi Sándor utca 11.'}</p>
              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-sky-400 transition-colors">{t('visitClinic')}<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-sky-500 transition-all"><ArrowRight className="w-5 h-5"/></div></div>
            </div>
          </motion.a>
          {/* Budapest */}
          <motion.a href={`${p}/budapest`} initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer bg-gray-900 block">
            <div className="absolute inset-0">{locations.budapest?.imageUrl?<img src={locations.budapest.imageUrl} loading="lazy" alt="Budapest" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>:<div className="w-full h-full bg-slate-800"/>}</div>
            <div className="absolute top-6 right-6 z-20"><span className="px-4 py-2 bg-amber-500 text-white font-bold rounded-full text-sm shadow-lg">{t('comingSoon')}</span></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent"/>
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider mb-3 text-sm"><MapPin className="w-4 h-4"/>{locations.budapest?.tag||'Főváros · Római Part'}</div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{t('budapestName')}</h3>
              <p className="text-gray-300 text-base md:text-lg font-medium mb-6">{locations.budapest?.address||'1039 Budapest, Királyok útja 55.'}</p>
              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-amber-400 transition-colors">{t('details')}<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-amber-500 transition-all"><ArrowRight className="w-5 h-5"/></div></div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function formatStatNumber(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

function AnimatedNumber({ end, suffix='', label, desc }: { end:number; suffix?:string; label:string; desc:string }) {
  return (
    <div className="text-center transition-transform duration-500 hover:-translate-y-1">
      <div className="text-5xl md:text-6xl lg:text-7xl font-black text-sky-500 mb-3 tracking-tight tabular-nums whitespace-nowrap">{formatStatNumber(end)}{suffix}</div>
      <div className="text-lg font-bold text-gray-900 mb-1">{label}</div>
      <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] mx-auto">{desc}</p>
    </div>
  );
}

function StatsSection() {
  const t = useTranslations('home.stats');
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {t('title')}{' '}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t('titleHighlight')}</span>
            </h2>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
          <AnimatedNumber end={30}    suffix="+"    label={t('years.label')}    desc={t('years.desc')} />
          <AnimatedNumber end={15000} suffix="+"    label={t('patients.label')} desc={t('patients.desc')} />
          <AnimatedNumber end={40}    suffix="%"    label={t('savings.label')}  desc={t('savings.desc')} />
          <AnimatedNumber end={3}     suffix={t('daysSuffix')} label={t('days.label')}     desc={t('days.desc')} />
        </div>
      </div>
    </section>
  );
}

// ─── AI Quote Analyzer ────────────────────────────────────────────────────────
type QuoteLocale = 'hu' | 'en' | 'sk' | 'de';
type QuoteAnalysisResult = {
  items: Array<{
    name: string;
    competitorPrice: number;
    ourPriceMin: number | null;
    ourPriceMax: number | null;
    manualReview: boolean;
  }>;
  competitorTotal: number;
  ourTotalMin: number | null;
  ourTotalMax: number | null;
  savingsMin: number | null;
  savingsMax: number | null;
  requiresManualReview: boolean;
};

const quoteFeedback: Record<QuoteLocale, {
  unsupportedFile: string;
  invalid: string;
  duplicate: string;
  network: string;
  rateLimited: string;
  unavailable: string;
  manualReview: string;
  noGuaranteedSaving: string;
  retryEmail: string;
  emailNotSent: string;
  emailRetryFailed: string;
  resultIntro: string;
  total: string;
  imageProcessingFailed: string;
}> = {
  hu: {
    unsupportedFile: 'Csak PDF, JPG, PNG vagy WebP fájl tölthető fel.',
    invalid: 'A dokumentumot nem sikerült biztonságosan elemezni. Ellenőrizze a fájlt és a megadott adatokat.',
    duplicate: 'Ezt az elemzési kérést már feldolgoztuk. Válassza ki újra a fájlt egy új elemzéshez.',
    network: 'Nincs hálózati kapcsolat. Ellenőrizze az internetkapcsolatot, majd próbálja újra.',
    rateLimited: 'Túl sok elemzési kérés érkezett rövid időn belül. Kérjük, várjon néhány percet.',
    unavailable: 'Az elemző szolgáltatás átmenetileg nem érhető el. Kérjük, próbálja újra később.',
    manualReview: 'Kézi ár-ellenőrzés szükséges', noGuaranteedSaving: 'Az ártartomány alapján biztos megtakarítás nem állapítható meg.',
    retryEmail: 'E-mail újraküldése', emailNotSent: 'Az elemzés elkészült, de az e-mailt most nem sikerült elküldeni.', emailRetryFailed: 'Az e-mail újraküldése most sem sikerült.',
    resultIntro: 'Az előzetes összehasonlítás eredménye:', total: 'Összesen',
    imageProcessingFailed: 'A képet nem sikerült biztonságosan feldolgozni. Kérjük, válasszon másik JPG, PNG vagy WebP fájlt.',
  },
  en: {
    unsupportedFile: 'Only PDF, JPG, PNG or WebP files can be uploaded.',
    invalid: 'We could not safely analyse this document. Check the file and your details.',
    duplicate: 'This analysis request has already been processed. Select the file again to start a new analysis.',
    network: 'You appear to be offline. Check your connection and try again.',
    rateLimited: 'Too many analysis requests were sent in a short time. Please wait a few minutes.',
    unavailable: 'The analysis service is temporarily unavailable. Please try again later.',
    manualReview: 'Manual price review required', noGuaranteedSaving: 'No guaranteed saving can be stated from the available price range.',
    retryEmail: 'Retry email', emailNotSent: 'The analysis is ready, but the email could not be sent.', emailRetryFailed: 'The email retry was not successful.',
    resultIntro: 'Preliminary comparison result:', total: 'Total',
    imageProcessingFailed: 'The image could not be processed safely. Please choose a different JPG, PNG or WebP file.',
  },
  sk: {
    unsupportedFile: 'Nahrať môžete iba súbor PDF, JPG, PNG alebo WebP.',
    invalid: 'Dokument sa nepodarilo bezpečne analyzovať. Skontrolujte súbor a zadané údaje.',
    duplicate: 'Táto žiadosť o analýzu už bola spracovaná. Pre novú analýzu vyberte súbor znova.',
    network: 'Nie ste pripojení k internetu. Skontrolujte pripojenie a skúste to znova.',
    rateLimited: 'Za krátky čas bolo odoslaných priveľa žiadostí o analýzu. Počkajte prosím niekoľko minút.',
    unavailable: 'Služba analýzy je dočasne nedostupná. Skúste to prosím neskôr.',
    manualReview: 'Potrebná manuálna kontrola ceny', noGuaranteedSaving: 'Z dostupného cenového rozpätia nemožno určiť zaručenú úsporu.',
    retryEmail: 'Znova odoslať e-mail', emailNotSent: 'Analýza je hotová, ale e-mail sa nepodarilo odoslať.', emailRetryFailed: 'E-mail sa nepodarilo odoslať ani opakovane.',
    resultIntro: 'Výsledok predbežného porovnania:', total: 'Celkom',
    imageProcessingFailed: 'Obrázok sa nepodarilo bezpečne spracovať. Vyberte iný súbor JPG, PNG alebo WebP.',
  },
  de: {
    unsupportedFile: 'Es können nur PDF-, JPG-, PNG- oder WebP-Dateien hochgeladen werden.',
    invalid: 'Das Dokument konnte nicht sicher analysiert werden. Prüfen Sie die Datei und Ihre Angaben.',
    duplicate: 'Diese Analyseanfrage wurde bereits verarbeitet. Wählen Sie die Datei für eine neue Analyse erneut aus.',
    network: 'Sie scheinen offline zu sein. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    rateLimited: 'In kurzer Zeit wurden zu viele Analyseanfragen gesendet. Bitte warten Sie einige Minuten.',
    unavailable: 'Der Analysedienst ist vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.',
    manualReview: 'Manuelle Preisprüfung erforderlich', noGuaranteedSaving: 'Aus der verfügbaren Preisspanne lässt sich keine sichere Ersparnis ableiten.',
    retryEmail: 'E-Mail erneut senden', emailNotSent: 'Die Analyse ist fertig, aber die E-Mail konnte nicht gesendet werden.', emailRetryFailed: 'Die E-Mail konnte auch beim erneuten Versuch nicht gesendet werden.',
    resultIntro: 'Ergebnis des vorläufigen Vergleichs:', total: 'Gesamt',
    imageProcessingFailed: 'Das Bild konnte nicht sicher verarbeitet werden. Bitte wählen Sie eine andere JPG-, PNG- oder WebP-Datei.',
  },
};

const quoteDisclosure: Record<QuoteLocale, {
  accept: string;
  terms: string;
  and: string;
  privacy: string;
  aiConsent: string;
}> = {
  hu: {
    accept: 'Elfogadom az',
    terms: 'Általános Szerződési Feltételeket',
    and: 'és az',
    privacy: 'Adatkezelési tájékoztatót',
    aiConsent: 'Kifejezetten hozzájárulok ahhoz, hogy a feltöltött dokumentumot külső AI-szolgáltató dolgozza fel az előzetes összehasonlítás elkészítéséhez.',
  },
  en: {
    accept: 'I accept the',
    terms: 'Terms and Conditions',
    and: 'and the',
    privacy: 'Privacy Policy',
    aiConsent: 'I expressly consent to an external AI provider processing the uploaded document to prepare the preliminary comparison.',
  },
  sk: {
    accept: 'Súhlasím so',
    terms: 'Všeobecnými obchodnými podmienkami',
    and: 'a so',
    privacy: 'Zásadami ochrany osobných údajov',
    aiConsent: 'Výslovne súhlasím so spracovaním nahraného dokumentu externým poskytovateľom AI na prípravu predbežného porovnania.',
  },
  de: {
    accept: 'Ich akzeptiere die',
    terms: 'Allgemeinen Geschäftsbedingungen',
    and: 'und die',
    privacy: 'Datenschutzerklärung',
    aiConsent: 'Ich willige ausdrücklich ein, dass ein externer KI-Anbieter das hochgeladene Dokument für den vorläufigen Vergleich verarbeitet.',
  },
};

function isQuoteAnalysisResult(value: unknown): value is QuoteAnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<QuoteAnalysisResult>;
  const validNumber = (number: unknown) => typeof number === 'number'
    && Number.isSafeInteger(number)
    && number >= 0
    && number <= 100_000_000;
  const validNullablePrice = (number: unknown) => number === null || (
    typeof number === 'number' && validNumber(number) && number > 0
  );
  const validItems = Array.isArray(candidate.items)
    && candidate.items.length > 0
    && candidate.items.length <= 100
    && candidate.items.every((item) => Boolean(item)
      && typeof item.name === 'string'
      && item.name.trim().length > 0
      && item.name.trim().length <= 240
      && validNumber(item.competitorPrice)
      && validNullablePrice(item.ourPriceMin)
      && validNullablePrice(item.ourPriceMax)
      && (item.ourPriceMin === null) === (item.ourPriceMax === null)
      && (item.ourPriceMin === null || item.ourPriceMax === null || item.ourPriceMin <= item.ourPriceMax)
      && typeof item.manualReview === 'boolean'
      && item.manualReview === (item.ourPriceMin === null));
  if (!validItems || !candidate.items) return false;
  const competitorTotal = candidate.items.reduce((sum, item) => sum + item.competitorPrice, 0);
  const requiresManualReview = candidate.items.some((item) => item.ourPriceMin === null);
  if (!Number.isSafeInteger(competitorTotal) || candidate.competitorTotal !== competitorTotal || candidate.requiresManualReview !== requiresManualReview) return false;
  if (requiresManualReview) {
    return candidate.ourTotalMin === null
      && candidate.ourTotalMax === null
      && candidate.savingsMin === null
      && candidate.savingsMax === null;
  }
  const ourTotalMin = candidate.items.reduce((sum, item) => sum + (item.ourPriceMin || 0), 0);
  const ourTotalMax = candidate.items.reduce((sum, item) => sum + (item.ourPriceMax || 0), 0);
  const hasGuaranteedSaving = competitorTotal > ourTotalMax;
  return Number.isSafeInteger(ourTotalMin)
    && Number.isSafeInteger(ourTotalMax)
    && candidate.ourTotalMin === ourTotalMin
    && candidate.ourTotalMax === ourTotalMax
    && candidate.savingsMin === (hasGuaranteedSaving ? competitorTotal - ourTotalMax : null)
    && candidate.savingsMax === (hasGuaranteedSaving ? competitorTotal - ourTotalMin : null);
}

function createQuoteIdempotencyKey() {
  const value = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `quote-${value}`;
}

function QuoteAnalyzerSection() {
  const t = useTranslations('home.quoteAnalyzer');
  const tC = useTranslations('common');
  const locale = useLocale();
  const safeLocale: QuoteLocale = locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu';
  const p = safeLocale === 'hu' ? '' : `/${safeLocale}`;
  const feedback = quoteFeedback[safeLocale];
  const disclosure = quoteDisclosure[safeLocale];
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailRetrying, setIsEmailRetrying] = useState(false);
  const [result, setResult] = useState<QuoteAnalysisResult | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailRetryFailed, setEmailRetryFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [formData, setFormData] = useState({ name:'', nickname:'', email:'', phone:'', acceptedTerms:false, aiProcessingConsent:false });
  const idempotencyKeyRef = useRef<string | null>(null);

  const resetQuoteSubmission = () => {
    idempotencyKeyRef.current = null;
    setErrorMsg(null);
    setEmailSent(null);
    setEmailRetryFailed(false);
  };

  const updateQuoteField = (field: keyof typeof formData, value: string | boolean) => {
    resetQuoteSubmission();
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const processFile = async (f: File) => {
    const MAX = 4.2;
    const isPdf = f.type === 'application/pdf';
    const isSupportedImage = f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp';
    resetQuoteSubmission();
    if (!isPdf && !isSupportedImage) {
      setFile(null);
      setErrorMsg(feedback.unsupportedFile);
      return;
    }
    if (isSupportedImage) {
      setIsLoading(true);
      try {
        const c = await compressImage(f);
        if (c.size > MAX*1024*1024) { setErrorMsg(t('errors.tooLarge', { size:(c.size/1024/1024).toFixed(1) })); setIsLoading(false); return; }
        setFile(c); setStep(2);
      } catch {
        setFile(null);
        setErrorMsg(feedback.imageProcessingFailed);
      }
      finally { setIsLoading(false); }
    } else {
      if (f.size > MAX*1024*1024) { setErrorMsg(t('errors.pdfTooLarge')); return; }
      setFile(f); setStep(2);
    }
  };

  const analyzeQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.acceptedTerms || !formData.aiProcessingConsent) return;
    setErrorMsg(null);
    setIsLoading(true);
    setStep(3);
    const idempotencyKey = idempotencyKeyRef.current ?? createQuoteIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;
    let attempts = 0;
    while (attempts < 2) {
      attempts += 1;
      try {
        const data = new FormData();
        data.append('file', file);
        data.append('name', formData.name);
        data.append('nickname', formData.nickname);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('locale', safeLocale);
        data.append('acceptedTerms', 'true');
        data.append('aiProcessingConsent', 'true');
        data.append('idempotencyKey', idempotencyKey);
        const res = await fetch('/api/analyze-quote', {
          method: 'POST',
          headers: { 'Idempotency-Key': idempotencyKey },
          body: data,
        });
        const json = await res.json().catch(() => ({})) as { success?: boolean; result?: unknown; emailSent?: boolean };
        if (res.ok && json.success === true && isQuoteAnalysisResult(json.result)) {
          setResult(json.result);
          setEmailSent(json.emailSent === true);
          setStep(4);
          break;
        }

        if (res.status === 429) {
          setErrorMsg(feedback.rateLimited);
          setStep(2);
          break;
        }
        if (res.status === 409) {
          setErrorMsg(feedback.duplicate);
          setStep(2);
          break;
        }
        if (res.status === 400 || res.status === 413 || res.status === 415 || res.status === 422) {
          setErrorMsg(feedback.invalid);
          setStep(2);
          break;
        }
        if (res.status < 500 && res.status !== 408) {
          setErrorMsg(feedback.invalid);
          setStep(2);
          break;
        }
        if (attempts < 2) await new Promise((resolve) => setTimeout(resolve, 1500));
        else {
          setErrorMsg(feedback.unavailable);
          setStep(2);
        }
      } catch {
        if (attempts < 2) await new Promise((resolve) => setTimeout(resolve, 1500));
        else {
          setErrorMsg(feedback.network);
          setStep(2);
        }
      }
    }
    setIsLoading(false);
  };

  const retryQuoteEmail = async () => {
    const idempotencyKey = idempotencyKeyRef.current;
    if (!file || !idempotencyKey || isEmailRetrying) return;
    setIsEmailRetrying(true);
    setEmailRetryFailed(false);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('name', formData.name);
      data.append('nickname', formData.nickname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('locale', safeLocale);
      data.append('acceptedTerms', 'true');
      data.append('aiProcessingConsent', 'true');
      data.append('idempotencyKey', idempotencyKey);
      const response = await fetch('/api/analyze-quote', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: data,
      });
      const payload = await response.json().catch(() => ({})) as { success?: boolean; result?: unknown; emailSent?: boolean };
      if (response.ok && payload.success === true && isQuoteAnalysisResult(payload.result)) {
        setResult(payload.result);
        setEmailSent(payload.emailSent === true);
        setEmailRetryFailed(payload.emailSent !== true);
      } else {
        setEmailRetryFailed(true);
      }
    } catch {
      setEmailRetryFailed(true);
    } finally {
      setIsEmailRetrying(false);
    }
  };

  const formatResultRange = (min: number | null, max: number | null) => {
    if (min === null || max === null) return feedback.manualReview;
    if (min === max) return `${min.toLocaleString()} HUF`;
    return `${min.toLocaleString()}–${max.toLocaleString()} HUF`;
  };
  const resultSummary = result
    ? result.savingsMin !== null && result.savingsMax !== null
      ? formatResultRange(result.savingsMin, result.savingsMax)
      : result.requiresManualReview ? feedback.manualReview : feedback.noGuaranteedSaving
    : '';

  const downloadPDF = () => {
    if (!result) return;
    const html = buildPDF(result, formData.name, formData.phone, formData.email, formData.nickname, safeLocale);
    const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isApple) {
      const w = window.open('','_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(()=>{w.focus();w.print();},500); }
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.cssText='position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;border:none;';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) { doc.open(); doc.write(html); doc.close(); iframe.onload=()=>{ setTimeout(()=>{ iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(()=>document.body.removeChild(iframe),1000); },300); }; }
    }
  };

  return (
    <section id="arajanlat-elemzo" className="py-28 relative overflow-hidden bg-gray-950">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"/>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"/>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize:'32px 32px' }}/>
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4"/> {t('badge')}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {t('title')}{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: t('desc').replace(/\*\*(.*?)\*\*/g,'<strong class="text-white">$1</strong>') }}/>
            <div className="flex gap-4 items-center mt-8">
              <div className="flex -space-x-4">{[1,2,3,4].map(i=><div key={i} className="w-12 h-12 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center"><User className="w-5 h-5 text-gray-400"/></div>)}</div>
              <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: t('socialProof') }}/>
            </div>
          </motion.div>

          {/* Widget */}
          <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative min-h-[480px] flex flex-col">
              <AnimatePresence mode="wait">

                {step===1&&(
                  <motion.div key="s1" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-10 text-center flex-1 flex flex-col justify-center">
                    <div className={`border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${isDragging?'border-sky-500 bg-sky-50 scale-105':'border-gray-300 hover:border-sky-400 hover:bg-gray-50'}`} onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)} onDrop={e=>{e.preventDefault();setIsDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0]);}}>
                      {isLoading?<div className="flex flex-col items-center py-6"><Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4"/><p className="text-sky-700 font-bold">{t('step1.optimizing')}</p></div>
                      :<>
                        <Upload className={`w-16 h-16 mx-auto mb-6 ${isDragging?'text-sky-500':'text-gray-400'}`}/>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('step1.dropzone')}</h3>
                        <p className="text-gray-500 mb-4 text-sm">{t('step1.dropzoneHint')}</p>
                        <p className="text-xs text-green-600 font-bold mb-6">{t('step1.compressionActive')}</p>
                        {errorMsg&&<div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{errorMsg}</div>}
                        <label htmlFor="quote-file" className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block">
                          {t('step1.selectFile')}<input id="quote-file" type="file" className="hidden" accept=".pdf,image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0]);}}/>
                        </label>
                      </>}
                    </div>
                  </motion.div>
                )}

                {step===2&&(
                  <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6 bg-sky-50 p-4 rounded-xl border border-sky-100">
                      <FileText className="w-8 h-8 text-sky-600 flex-shrink-0"/>
                      <div className="overflow-hidden flex-1"><p className="font-bold text-gray-900 text-sm">{t('step2.uploadedFile')}</p><p className="text-sky-700 font-medium truncate text-sm">{file?.name}</p></div>
                      <button type="button" onClick={()=>{setStep(1);setFile(null);resetQuoteSubmission();}} className="text-sm text-red-500 hover:text-red-700 font-bold whitespace-nowrap">{tC('cancel')}</button>
                    </div>
                    {errorMsg&&<div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{errorMsg}</div>}
                    <form onSubmit={analyzeQuote} className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('step2.formTitle')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="quote-name" className="block text-xs font-bold text-gray-700 mb-1">{t('step2.fullName')}</label><input id="quote-name" required autoComplete="name" type="text" name="name" value={formData.name} onChange={e=>updateQuoteField('name', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                        <div><label htmlFor="quote-nickname" className="block text-xs font-bold text-gray-700 mb-1">{t('step2.salutation')}</label><input id="quote-nickname" type="text" name="nickname" value={formData.nickname} onChange={e=>updateQuoteField('nickname', e.target.value)} placeholder={t('step2.salutationPlaceholder')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="quote-email" className="block text-xs font-bold text-gray-700 mb-1">{t('step2.email')}</label><input id="quote-email" required autoComplete="email" type="email" name="email" value={formData.email} onChange={e=>updateQuoteField('email', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                        <div><label htmlFor="quote-phone" className="block text-xs font-bold text-gray-700 mb-1">{t('step2.phone')}</label><input id="quote-phone" required autoComplete="tel" inputMode="tel" type="tel" name="phone" value={formData.phone} onChange={e=>updateQuoteField('phone', e.target.value)} placeholder={t('step2.phonePlaceholder')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                      </div>
                      <div className="flex items-start gap-3 mt-4">
                        <input id="quote-terms" required type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={e=>updateQuoteField('acceptedTerms', e.target.checked)} className="mt-1 w-5 h-5 text-sky-600 rounded"/>
                        <span className="text-xs text-gray-600 leading-relaxed">
                          <label htmlFor="quote-terms" className="cursor-pointer">{disclosure.accept}</label>{' '}
                          <Link href={`${p}/aszf`} className="text-sky-600 hover:underline">{disclosure.terms}</Link>{' '}
                          {disclosure.and}{' '}
                          <Link href={`${p}/adatkezeles`} className="text-sky-600 hover:underline">{disclosure.privacy}</Link>
                        </span>
                      </div>
                      <div className="flex items-start gap-3 mt-4">
                        <input id="quote-ai-consent" required type="checkbox" name="aiProcessingConsent" checked={formData.aiProcessingConsent} onChange={e=>updateQuoteField('aiProcessingConsent', e.target.checked)} className="mt-1 w-5 h-5 text-sky-600 rounded"/>
                        <label htmlFor="quote-ai-consent" className="cursor-pointer text-xs text-gray-600 leading-relaxed">{disclosure.aiConsent}</label>
                      </div>
                      <button type="submit" disabled={!formData.acceptedTerms||!formData.aiProcessingConsent||isLoading} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2">
                        {isLoading?<Loader2 className="animate-spin w-5 h-5"/>:<><Sparkles className="w-5 h-5"/>{t('step2.analyzeButton')}</>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step===3&&(
                  <motion.div key="s3" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-16 text-center flex flex-col items-center justify-center h-full flex-1">
                    <div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-sky-100 rounded-full"/><div className="absolute inset-0 border-4 border-sky-600 rounded-full border-t-transparent animate-spin"/><Loader2 className="absolute inset-0 m-auto w-10 h-10 text-sky-600 animate-pulse"/></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('step3.title')}</h3>
                    <p className="text-gray-500">{t('step3.subtitle')}</p>
                  </motion.div>
                )}

                {step===4&&result&&(
                  <motion.div key="s4" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white flex flex-col h-full">
                    <div className="bg-gradient-to-br from-sky-500 to-sky-700 p-8 text-center text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"/>
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300 drop-shadow-md"/>
                      <h3 className="text-2xl font-bold mb-1">{t('step4.doneTitle', { name: getPreferredGreetingName(formData.name, formData.nickname) })}</h3>
                      <p className="text-sky-100 mb-3 text-sm">{feedback.resultIntro}</p>
                      <div className="text-2xl md:text-3xl font-extrabold drop-shadow-md text-green-200">{resultSummary}</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="max-h-[180px] overflow-y-auto mb-6 pr-2">
                        <table className="w-full text-left text-sm">
                          <thead><tr className="border-b border-gray-200 text-gray-500"><th className="pb-2 font-medium">{t('step4.treatment')}</th><th className="pb-2 font-medium text-right">{t('step4.original')}</th><th className="pb-2 font-bold text-sky-600 text-right">Crown</th></tr></thead>
                          <tbody>{result.items.map((item, i)=><tr key={`${item.name}-${i}`} className="border-b border-gray-50"><td className="py-2 font-medium text-gray-900">{item.name}</td><td className="py-2 text-right text-gray-400 line-through">{item.competitorPrice.toLocaleString()} HUF</td><td className={`py-2 text-right font-bold ${item.manualReview ? 'text-amber-600' : 'text-sky-600'}`}>{formatResultRange(item.ourPriceMin, item.ourPriceMax)}</td></tr>)}</tbody>
                          <tfoot><tr className="border-t-2 border-sky-100"><td className="pt-3 font-bold text-gray-900">{feedback.total}</td><td className="pt-3 text-right font-bold text-gray-500">{result.competitorTotal.toLocaleString()} HUF</td><td className="pt-3 text-right font-bold text-sky-700">{formatResultRange(result.ourTotalMin, result.ourTotalMax)}</td></tr></tfoot>
                        </table>
                      </div>
                      <div className="mt-auto space-y-3">
                        <button onClick={downloadPDF} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"><Download className="w-5 h-5"/>{t('step4.downloadPDF')}</button>
                        <a href={`${p}/idopont`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all"><Calendar className="w-5 h-5"/>{t('step4.bookConsultation')}</a>
                        {emailSent === false && <button type="button" disabled={isEmailRetrying} onClick={retryQuoteEmail} className="w-full py-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 text-sm font-bold rounded-xl transition-colors">{isEmailRetrying ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : feedback.retryEmail}</button>}
                        <button onClick={()=>{setStep(1);setFile(null);setResult(null);resetQuoteSubmission();}} className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest transition-colors mt-2">{t('step4.newAnalysis')}</button>
                        {emailSent === true
                          ? <p className="text-center text-xs text-gray-400 pt-2">{t('step4.emailSent', { email: formData.email })}</p>
                          : <p role="status" className="text-center text-xs text-amber-700 pt-2">{emailRetryFailed ? feedback.emailRetryFailed : feedback.emailNotSent}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Lab Showcase ─────────────────────────────────────────────────────────────
function LabShowcase({ imageUrl }: { imageUrl: string }) {
  const t = useTranslations('home.lab');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  // @ts-ignore
  const features = t.raw('features') as string[];
  return (
    <section className="py-28 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="max-w-6xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl">
            <div className="grid lg:grid-cols-2 items-center">
              <div className="relative h-[300px] lg:h-[500px]">
                {imageUrl&&<img src={imageUrl} alt="Crown Dental lab" className="w-full h-full object-cover" loading="lazy"/>}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/60 hidden lg:block"/>
              </div>
              <div className="p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 rounded-full text-sky-400 text-sm font-bold mb-6"><Wrench className="w-4 h-4"/>{t('badge')}</div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">{t('title')}</h2>
                <ul className="space-y-4 mb-8">
                  {features.map((item,i) => <li key={i} className="flex items-start gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5"/><span>{item}</span></li>)}
                </ul>
                <a href={`${p}/kezelesek/fogtechnikai-megoldasok`} className="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors">{t('learnMore')}<ArrowRight className="w-4 h-4"/></a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Services (Flip Cards) ──────────────────────────────────────────
function FeaturedPricesSection({ sanityImages }: { sanityImages: HomeSanityImages['services'] }) {
  const t = useTranslations('home.services');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const slugs = ['allapotfelmeres','gyokerkezeles','esztetikai-fogaszat','koronak-hidak','implantatum','gyerekfogaszat'];
  const icons = [<Search className="w-6 h-6"/>,<Activity className="w-6 h-6"/>,<Sparkles className="w-6 h-6"/>,<CheckCircle2 className="w-6 h-6"/>,<Shield className="w-6 h-6"/>,<Heart className="w-6 h-6"/>];
  // @ts-ignore
  const cards = t.raw('cards') as Array<{ title:string; subtitle:string; price:string }>;
  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {t('title')}{' '}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">{t('subtitle')}</p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div key={idx} className="group [perspective:1000px] h-[400px] w-full cursor-pointer focus:outline-none" tabIndex={0}>
              <div className="relative w-full h-full duration-700 transition-transform [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] focus-within:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden group/front">
                  <div className="relative h-[55%] w-full overflow-hidden bg-slate-800">
                    {sanityImages[slugs[idx]]?<img src={sanityImages[slugs[idx]]} loading="lazy" alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/front:scale-110"/>:<div className="w-full h-full bg-slate-800"/>}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"/>
                    <div className="absolute bottom-4 left-6 right-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-sm">{icons[idx]}</div>
                      <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 text-center justify-center">
                    <p className="text-gray-500 mb-3">{card.subtitle}</p>
                    <div className="mt-auto"><span className="text-2xl font-extrabold text-sky-600">{card.price}</span></div>
                  </div>
                </div>
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-sky-600 to-sky-800 rounded-3xl p-8 shadow-2xl flex items-center justify-center">
                  <a href={`${p}/idopont`} className="flex flex-col items-center justify-center w-full h-full text-white group/link">
                    <Calendar className="w-16 h-16 mb-6 opacity-80 group-hover/link:scale-110 group-hover/link:opacity-100 transition-all duration-300"/>
                    <span className="text-2xl font-bold text-center mb-2">{t('bookConsultation')}</span>
                    <span className="text-sky-200 text-sm font-medium">{t('clickForAppointment')}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <a href={`${p}/kezelesek`} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg">
            {t('viewAllPrices')}<ArrowRight className="w-4 h-4"/>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
function ReviewsSection() {
  const t = useTranslations('home.reviews');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const marqueePaused = Boolean(prefersReducedMotion) || isManuallyPaused || isInteractionPaused;
  const marqueeControl = {
    hu: { pause: 'Értékelések szüneteltetése', play: 'Értékelések folytatása' },
    en: { pause: 'Pause reviews', play: 'Resume reviews' },
    sk: { pause: 'Pozastaviť recenzie', play: 'Pokračovať v recenziách' },
    de: { pause: 'Bewertungen pausieren', play: 'Bewertungen fortsetzen' },
  }[locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu'];
  // @ts-ignore
  const reviews = t.raw('items') as Array<{ name:string; text:string; date:string }>;
  const ext = [...reviews,...reviews,...reviews];
  return (
    <section
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsInteractionPaused(false);
      }}
      className="py-28 bg-white border-t border-gray-100 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8">{t('title')}</h2>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-amber-400 bg-gray-50 px-4 sm:px-6 py-3 rounded-full shadow-sm border border-gray-100 whitespace-nowrap">
              <div className="flex items-center">{[...Array(5)].map((_,i)=><Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-current"/>)}</div>
              <span className="text-gray-900 font-bold ml-1 sm:ml-2 text-base sm:text-lg">4.8 / 5</span>
              <span className="text-gray-500 font-medium ml-1 text-xs sm:text-base">{t('ratingCount')}</span>
            </div>
            {!prefersReducedMotion && <button type="button" onClick={() => setIsManuallyPaused((paused) => !paused)} aria-pressed={isManuallyPaused} className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              {isManuallyPaused ? <Play className="h-4 w-4"/> : <Pause className="h-4 w-4"/>}
              {isManuallyPaused ? marqueeControl.play : marqueeControl.pause}
            </button>}
          </motion.div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html:`@keyframes mhp{0%{transform:translateX(0)}100%{transform:translateX(-33.3333%)}}.amhp{display:flex;width:max-content;animation:mhp 60s linear infinite}.amhp:hover,.amhp:focus-within{animation-play-state:paused}@media(prefers-reduced-motion:reduce){.amhp{animation:none;transform:none}}` }}/>
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10"/>
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10"/>
        <div className="amhp gap-6 px-6" style={{ animationPlayState: marqueePaused ? 'paused' : 'running' }}>
          {ext.map((review,i) => (
            <div key={i} className="w-[360px] md:w-[420px] p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 flex-shrink-0 cursor-default hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-1 mb-5">{[...Array(5)].map((_,j)=><Star key={j} className="w-5 h-5 text-amber-400 fill-current"/>)}</div>
              <p className="text-gray-600 mb-8 leading-relaxed min-h-[100px]">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-900 font-bold">{review.name}</span>
                <span className="text-gray-400 text-sm">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  const t = useTranslations('home.cta');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800"/>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'60px 60px' }}/>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{t('title')}</h2>
          <p className="text-lg md:text-xl text-sky-100/80 mb-12 max-w-2xl mx-auto font-light">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <motion.a href={`${p}/idopont`} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-sky-700 font-bold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all">
              <Calendar className="w-6 h-6"/> {t('bookOnline')}
            </motion.a>
            <motion.a href="tel:+36705646837" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-lg rounded-2xl transition-all border border-sky-500/30">
              <Phone className="w-5 h-5"/> +36 70 564 6837
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const t = useTranslations('home.faq');
  const [openIndex, setOpenIndex] = useState<number|null>(0);
  // @ts-ignore
  const faqs = t.raw('items') as Array<{ question:string; answer:string }>;
  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-500 font-light">{t('subtitle')}</p>
          </motion.div>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:index*0.05 }} className={`rounded-2xl border transition-all duration-300 ${openIndex===index?'border-sky-200 shadow-lg shadow-sky-100/50 bg-white':'border-gray-100 bg-white/50 hover:bg-white hover:border-gray-200'}`}>
              <button onClick={()=>setOpenIndex(openIndex===index?null:index)} className="flex items-center justify-between w-full p-6 text-left focus:outline-none">
                <span className={`font-bold text-lg pr-4 transition-colors ${openIndex===index?'text-sky-700':'text-gray-900'}`}>{faq.question}</span>
                <motion.div animate={{ rotate:openIndex===index?180:0 }} transition={{ duration:0.2 }} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex===index?'bg-sky-100 text-sky-600':'bg-gray-100 text-gray-400'}`}>
                  <ChevronDown className="w-5 h-5"/>
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex===index&&(
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.3, ease:'easeInOut' }} className="overflow-hidden">
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg border-t border-gray-100 pt-4" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g,'<strong class="text-gray-900 font-bold">$1</strong>') }}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Főoldal export ───────────────────────────────────────────────────────────
export default function HomeClient({ sanityImages = emptyHomeSanityImages }: { sanityImages?: HomeSanityImages }) {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <FloatingCTA />
      <main>
        <HeroSlider images={sanityImages.hero} />
        <TrustBadges />
        <LocationSelector locations={sanityImages.locations} />
        <StatsSection />
        <QuoteAnalyzerSection />
        <LabShowcase imageUrl={sanityImages.labImage} />
        <FeaturedPricesSection sanityImages={sanityImages.services} />
        <ReviewsSection />
        <CTASection />
        <FAQSection />
      </main>
    </div>
  );
}
