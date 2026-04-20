'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  MapPin, Phone, Award, Building2, Shield, Calendar,
  ArrowRight, CheckCircle2, Star, Heart, Upload, Search, Activity,
  Sparkles, User, FileText, Loader2, Download, ChevronDown, Wrench,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const optimizeSanityImage = (url: string, w = 800, h?: number) => {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  return `${url}?fm=webp&w=${w}&q=65&fit=crop&auto=format${h ? `&h=${h}` : ''}`;
};

const fetchSanityData = async (query: string) => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
  const url = `https://${projectId}.api.sanity.io/v2024-03-08/data/query/production?query=${encodeURIComponent(query)}`;
  try { const res = await fetch(url); return (await res.json()).result; }
  catch { return null; }
};

const compressImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const MAX = 1200;
        if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => blob
          ? resolve(new File([blob], 'c_' + file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }))
          : reject(new Error('blob')), 'image/jpeg', 0.6);
      };
    };
    reader.onerror = reject;
  });

// PDF builder
function buildPDF(result: any, name: string, phone: string, email: string, nickname: string, locale: string) {
  const date = new Date().toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale === 'en' ? 'en-GB' : 'hu-HU', { year:'numeric', month:'long', day:'numeric' });
  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' HUF';
  const L: Record<string, Record<string, string>> = {
    hu: { title:'Személyre szabott árajánlat', savings:'Az Ön megtakarítása', breakdown:'Kezelések részletezése', treatment:'Kezelés', other:'Másik árajánlat', crown:'Crown Dental', saving:'Megtakarítás', total:'Összesen', sig1:'Páciens aláírása', sig2:'Kezelőorvos aláírása és pecsétje', f1:'Ez egy automatikusan generált árajánlat.', f2:'Az árajánlat a kiállítás napjától számított 30 napig érvényes.', tag:'Saját labor, kiemelkedő minőség, elérhető árak.' },
    en: { title:'Personalised Quote', savings:'Your Savings', breakdown:'Treatment Breakdown', treatment:'Treatment', other:'Other Quote', crown:'Crown Dental', saving:'Saving', total:'Total', sig1:'Patient signature', sig2:"Dentist's signature & stamp", f1:'This is an automatically generated quote.', f2:'Valid for 30 days from the date of issue.', tag:'Own lab, outstanding quality, affordable prices.' },
    sk: { title:'Individuálna cenová ponuka', savings:'Vaša úspora', breakdown:'Prehľad ošetrení', treatment:'Ošetrenie', other:'Iná ponuka', crown:'Crown Dental', saving:'Úspora', total:'Celkom', sig1:'Podpis pacienta', sig2:'Podpis a pečiatka lekára', f1:'Toto je automaticky vygenerovaná cenová ponuka.', f2:'Platnosť 30 dní od vystavenia.', tag:'Vlastné laboratórium, vynikajúca kvalita, dostupné ceny.' },
  };
  const l = L[locale] ?? L.hu;
  const rows = result.items.map((item: any, i: number) => {
    const diff = item.competitorPrice - item.ourPrice;
    return `<tr style="background:${i%2===0?'#fff':'#f8fafc'}"><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:12px">${item.name}</td><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:#9ca3af;text-decoration:line-through">${fmt(item.competitorPrice)}</td><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:#0369a1;font-weight:600">${fmt(item.ourPrice)}</td><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:${diff>0?'#059669':'#6b7280'};font-weight:600">${diff>0?'-'+fmt(diff):'—'}</td></tr>`;
  }).join('');
  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"><style>@page{size:A4;margin:16mm 18mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}</style></head><body><div style="max-width:700px;margin:0 auto"><table style="width:100%;margin-bottom:6px"><tr><td><div style="font-size:26px;font-weight:800;color:#0369a1">CROWN DENTAL</div><div style="font-size:10px;color:#94a3b8;letter-spacing:1.2px;text-transform:uppercase">Praxis és Labor · Esztergom · Budapest</div></td><td style="text-align:right;font-size:11px;color:#6b7280">${date}<br>+36 70 564 6837</td></tr></table><div style="height:3px;background:linear-gradient(90deg,#0284c7,#38bdf8,#7dd3fc);border-radius:2px;margin-bottom:22px"></div><div style="font-size:19px;font-weight:700;margin-bottom:5px">${l.title}</div><div style="font-size:12px;color:#6b7280;margin-bottom:20px">${nickname||name} | ${phone} | ${email}</div><div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:18px;text-align:center;margin-bottom:22px"><div style="font-size:11px;color:#0369a1;text-transform:uppercase;letter-spacing:1.2px;font-weight:600">${l.savings}</div><div style="font-size:32px;font-weight:800;color:#059669;margin-top:4px">${fmt(result.savings)}</div></div><table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:8px"><thead><tr style="background:#f1f5f9"><th style="padding:9px 12px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #0284c7">${l.treatment}</th><th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #0284c7">${l.other}</th><th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #0284c7">${l.crown}</th><th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #0284c7">${l.saving}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr style="background:#f0f9ff"><td style="padding:10px 12px;font-weight:700;font-size:13px;border-top:2px solid #0284c7">${l.total}</td><td style="padding:10px 12px;font-weight:700;text-align:right;color:#9ca3af;border-top:2px solid #0284c7;text-decoration:line-through">${fmt(result.competitorTotal)}</td><td style="padding:10px 12px;font-weight:700;text-align:right;color:#0284c7;border-top:2px solid #0284c7">${fmt(result.ourTotal)}</td><td style="padding:10px 12px;font-weight:700;text-align:right;color:#059669;border-top:2px solid #0284c7">-${fmt(result.savings)}</td></tr></tfoot></table><div style="margin-top:50px;border-top:1px solid #e5e7eb;padding-top:12px"><div style="font-size:13px;font-weight:700;color:#0369a1;margin-bottom:40px">Signatures</div><table style="width:100%"><tr><td style="width:44%;text-align:center"><div style="border-bottom:1.5px solid #94a3b8;height:1px;margin-bottom:6px"></div><div style="font-size:11px;color:#6b7280">${l.sig1}</div></td><td style="width:12%"></td><td style="width:44%;text-align:center"><div style="border-bottom:1.5px solid #94a3b8;height:1px;margin-bottom:6px"></div><div style="font-size:11px;color:#6b7280">${l.sig2}</div></td></tr></table></div><div style="margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px"><p style="font-size:9px;color:#9ca3af;text-align:center;margin-bottom:5px">${l.f1}</p><p style="font-size:9px;color:#9ca3af;text-align:center;margin-bottom:8px">${l.f2}</p><p style="font-size:10px;color:#0284c7;text-align:center;font-weight:700">Crown Dental – ${l.tag}</p></div></div></body></html>`;
}

// ─── Lebegő CTA ───────────────────────────────────────────────────────────────
function FloatingCTA() {
  const t = useTranslations('home.floatingCta');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 700);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.8 }} transition={{ type:'spring', damping:20, stiffness:300 }} className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
          <a href="tel:+36705646837" className="flex items-center gap-2 bg-white text-sky-700 pl-4 pr-5 py-3 rounded-full shadow-2xl border border-sky-100 hover:bg-sky-50 transition-all">
            <Phone className="w-5 h-5" /><span className="font-bold text-sm hidden sm:inline">{t('callNow')}</span>
          </a>
          <a href={`${p}/idopont`}>
            <motion.div whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-4 rounded-full shadow-[0_8px_40px_rgba(2,132,199,0.4)] hover:shadow-[0_8px_50px_rgba(2,132,199,0.6)] transition-all cursor-pointer">
              <Calendar className="w-5 h-5" /><span className="font-bold">{t('bookAppointment')}</span><ArrowRight className="w-4 h-4" />
            </motion.div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function HeroSlider() {
  const tSlides = useTranslations('home.hero');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [current, setCurrent] = useState(0);
  const [imgs, setImgs] = useState({ fokep:'', fokep1:'', fokep2:'' });
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset:['start start','end start'] });
  const imgY = useTransform(scrollYProgress, [0,1], ['0%','20%']);
  const textY = useTransform(scrollYProgress, [0,1], ['0%','40%']);
  const opacity = useTransform(scrollYProgress, [0,0.5], [1,0]);

  useEffect(() => {
    fetchSanityData(`*[_type=="treatment"&&slug.current in ["fokep","fokep1","fokep2"]]{"slug":slug.current,"imageUrl":coalesce(mainImage.asset->url,heroImage.asset->url)}`)
      .then(results => {
        if (!results) return;
        const n = { fokep:'', fokep1:'', fokep2:'' };
        results.forEach((item: any) => { if (item.slug && item.imageUrl) n[item.slug as keyof typeof n] = optimizeSanityImage(item.imageUrl, 1920, 1080); });
        setImgs(n);
      });
  }, []);

  // @ts-ignore
  const slideData = tSlides.raw('slides') as Array<{ tag:string; titleTop:string; titleBottom:string; subtitle:string; primaryText:string }>;

  const staticSlides = [
    { image: imgs.fokep,  href: '#arajanlat-elemzo', icon: <Upload className="w-6 h-6" /> },
    { image: imgs.fokep1, href: `${p}/idopont`,       icon: <Calendar className="w-6 h-6" /> },
    { image: imgs.fokep2, href: `${p}/idopont`,       icon: <Calendar className="w-6 h-6" /> },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c+1)%3), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} className="relative mt-24 h-[90svh] min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-950">
      <motion.div style={{ y:imgY }} className="absolute inset-0 z-0 will-change-transform">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity:0, scale:1.05 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:1.2, ease:'easeInOut' }} className="absolute inset-0">
            {staticSlides[current].image
              ? <img src={staticSlides[current].image} alt="Crown Dental" className="w-full h-[120%] object-cover" fetchPriority={current===0?'high':'auto'} decoding={current===0?'sync':'async'} />
              : <div className="w-full h-full bg-slate-800 animate-pulse" />}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white to-transparent z-10" />
      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize:'80px 80px' }} />

      <motion.div style={{ y:textY, opacity }} className="relative z-20 container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} transition={{ duration:0.6, delay:0.15 }}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-sky-300 text-xs sm:text-sm font-bold tracking-wider uppercase mb-8">
                <Sparkles className="w-4 h-4" /> {slideData[current]?.tag}
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight">
                {slideData[current]?.titleTop}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{slideData[current]?.titleBottom}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl font-light">{slideData[current]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={staticSlides[current].href}>
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white text-lg font-bold rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.4)] transition-all">
                    {staticSlides[current].icon} {slideData[current]?.primaryText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </a>
                <a href="tel:+36705646837">
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-bold rounded-2xl transition-all border border-white/20">
                    <Phone className="w-5 h-5" /> +36 70 564 6837
                  </motion.button>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2 mt-10">
            {[0,1,2].map(i => <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i===current?'w-10 bg-sky-400':'w-5 bg-white/30 hover:bg-white/50'}`} aria-label={`Slide ${i+1}`} />)}
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">{tCommon('scrollDown')}</span>
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity }}><ChevronDown className="w-5 h-5" /></motion.div>
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
function LocationSelector() {
  const t = useTranslations('home.locations');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [locations, setLocations] = useState<Record<string,any>>({});
  useEffect(() => {
    fetchSanityData(`*[_type=="location"]{name,title,address,tag,"imageUrl":image.asset->url}`)
      .then(result => {
        if (!result) return;
        const map: Record<string,any> = {};
        result.forEach((loc: any) => { if (loc.imageUrl) loc.imageUrl = optimizeSanityImage(loc.imageUrl,800,500); map[loc.name]=loc; });
        setLocations(map);
      });
  }, []);
  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('label')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {t('title')}<br />
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
function AnimatedNumber({ end, suffix='', label, desc }: { end:number; suffix?:string; label:string; desc:string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:'-100px' });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let s = 0; const step = end/(2000/16);
    const t = setInterval(() => { s+=step; if(s>=end){setCount(end);clearInterval(t);}else setCount(Math.ceil(s)); }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl lg:text-7xl font-black text-sky-500 mb-3 tracking-tight tabular-nums">{count.toLocaleString()}{suffix}</div>
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
              {t('title')}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t('titleHighlight')}</span>
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
function QuoteAnalyzerSection() {
  const t = useTranslations('home.quoteAnalyzer');
  const tC = useTranslations('common');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [formData, setFormData] = useState({ name:'', nickname:'', email:'', phone:'', acceptedTerms:false });

  const processFile = async (f: File) => {
    const MAX = 4.2;
    setErrorMsg(null);
    if (f.type.startsWith('image/')) {
      setIsLoading(true);
      try {
        const c = await compressImage(f);
        if (c.size > MAX*1024*1024) { setErrorMsg(t('errors.tooLarge', { size:(c.size/1024/1024).toFixed(1) })); setIsLoading(false); return; }
        setFile(c); setStep(2);
      } catch { if (f.size > MAX*1024*1024) { setErrorMsg(t('errors.tooLarge', { size:'4.2' })); setIsLoading(false); return; } setFile(f); setStep(2); }
      finally { setIsLoading(false); }
    } else {
      if (f.size > MAX*1024*1024) { setErrorMsg(t('errors.pdfTooLarge')); return; }
      setFile(f); setStep(2);
    }
  };

  const analyzeQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.acceptedTerms) return;
    setIsLoading(true); setStep(3);
    let attempts = 0;
    while (attempts < 2) {
      try {
        const data = new FormData();
        ['file','name','nickname','email','phone'].forEach(k => data.append(k, k==='file'?file:(formData as any)[k]));
        const res = await fetch('/api/analyze-quote', { method:'POST', body:data });
        const json = await res.json();
        if (json.success) { setResult(json.result); setStep(4); break; }
        if (++attempts >= 2) { setErrorMsg(t('errors.analysisFailed', { error: json.error||'?' })); setStep(2); }
        else await new Promise(r => setTimeout(r, 1500));
      } catch {
        if (++attempts >= 2) { setErrorMsg(t('errors.networkError')); setStep(2); }
        else await new Promise(r => setTimeout(r, 1500));
      }
    }
    setIsLoading(false);
  };

  const downloadPDF = () => {
    if (!result) return;
    const html = buildPDF(result, formData.name, formData.phone, formData.email, formData.nickname, locale);
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

  const termsText = t('step2.terms');
  const termsParts = termsText.split(/<\/?aszf>/);

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
                        {errorMsg&&<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{errorMsg}</div>}
                        <label className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block">
                          {t('step1.selectFile')}<input type="file" className="hidden" accept=".pdf,image/*" onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0]);}}/>
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
                      <button onClick={()=>{setStep(1);setFile(null);setErrorMsg(null);}} className="text-sm text-red-500 hover:text-red-700 font-bold whitespace-nowrap">{tC('cancel')}</button>
                    </div>
                    {errorMsg&&<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{errorMsg}</div>}
                    <form onSubmit={analyzeQuote} className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('step2.formTitle')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-700 mb-1">{t('step2.fullName')}</label><input required type="text" name="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                        <div><label className="block text-xs font-bold text-gray-700 mb-1">{t('step2.salutation')}</label><input type="text" name="nickname" value={formData.nickname} onChange={e=>setFormData({...formData,nickname:e.target.value})} placeholder={t('step2.salutationPlaceholder')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-700 mb-1">{t('step2.email')}</label><input required type="email" name="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                        <div><label className="block text-xs font-bold text-gray-700 mb-1">{t('step2.phone')}</label><input required type="tel" name="phone" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder={t('step2.phonePlaceholder')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm"/></div>
                      </div>
                      <label className="flex items-start gap-3 mt-4 cursor-pointer">
                        <input required type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={e=>setFormData({...formData,acceptedTerms:e.target.checked})} className="mt-1 w-5 h-5 text-sky-600 rounded"/>
                        <span className="text-xs text-gray-600 leading-relaxed">
                          {termsParts[0]}<a href={`${p}/aszf`} className="text-sky-600 hover:underline">{termsParts[1]}</a>{termsParts[2]}
                        </span>
                      </label>
                      <button type="submit" disabled={!formData.acceptedTerms||isLoading} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2">
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
                      <h3 className="text-2xl font-bold mb-1">{t('step4.doneTitle', { name: formData.nickname||formData.name.split(' ')[0] })}</h3>
                      <p className="text-sky-100 mb-3 text-sm">{t('step4.doneSubtitle')}</p>
                      <div className="text-5xl font-extrabold drop-shadow-md text-green-300">{result.savings.toLocaleString()} HUF</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="max-h-[180px] overflow-y-auto mb-6 pr-2">
                        <table className="w-full text-left text-sm">
                          <thead><tr className="border-b border-gray-200 text-gray-500"><th className="pb-2 font-medium">{t('step4.treatment')}</th><th className="pb-2 font-medium text-right">{t('step4.original')}</th><th className="pb-2 font-bold text-sky-600 text-right">Crown</th></tr></thead>
                          <tbody>{result.items.map((item:any,i:number)=><tr key={i} className="border-b border-gray-50"><td className="py-2 font-medium text-gray-900">{item.name}</td><td className="py-2 text-right text-gray-400 line-through">{item.competitorPrice.toLocaleString()}</td><td className="py-2 text-right font-bold text-sky-600">{item.ourPrice.toLocaleString()}</td></tr>)}</tbody>
                        </table>
                      </div>
                      <div className="mt-auto space-y-3">
                        <button onClick={downloadPDF} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"><Download className="w-5 h-5"/>{t('step4.downloadPDF')}</button>
                        <a href={`${p}/idopont`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all"><Calendar className="w-5 h-5"/>{t('step4.bookConsultation')}</a>
                        <button onClick={()=>{setStep(1);setFile(null);setResult(null);}} className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest transition-colors mt-2">{t('step4.newAnalysis')}</button>
                        <p className="text-center text-xs text-gray-400 pt-2">{t('step4.emailSent', { email: formData.email })}</p>
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
function LabShowcase() {
  const t = useTranslations('home.lab');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [laborImage, setLaborImage] = useState('');
  useEffect(() => {
    fetchSanityData(`*[_type=="treatment"&&slug.current=="fogtechnika"][0]{"url":coalesce(mainImage.asset->url,heroImage.asset->url)}`)
      .then((r:any) => { if(r?.url) setLaborImage(optimizeSanityImage(r.url,1200,800)); });
  }, []);
  // @ts-ignore
  const features = t.raw('features') as string[];
  return (
    <section className="py-28 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="max-w-6xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl">
            <div className="grid lg:grid-cols-2 items-center">
              <div className="relative h-[300px] lg:h-[500px]">
                {laborImage&&<img src={laborImage} alt="Crown Dental lab" className="w-full h-full object-cover" loading="lazy"/>}
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
function FeaturedPricesSection() {
  const t = useTranslations('home.services');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [sanityImages, setSanityImages] = useState<Record<string,string>>({});
  useEffect(() => {
    fetchSanityData(`*[_type=="treatment"]{"slug":slug.current,"imageUrl":coalesce(mainImage.asset->url,heroImage.asset->url)}`)
      .then(results => {
        if(!results) return;
        const map: Record<string,string> = {};
        results.forEach((item:any) => { if(item.slug&&item.imageUrl) map[item.slug]=optimizeSanityImage(item.imageUrl,600,400); });
        setSanityImages(map);
      });
  }, []);
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
              {t('title')}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t('titleHighlight')}</span>
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
  // @ts-ignore
  const reviews = t.raw('items') as Array<{ name:string; text:string; date:string }>;
  const ext = [...reviews,...reviews,...reviews];
  return (
    <section className="py-28 bg-white border-t border-gray-100 overflow-hidden">
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
          </motion.div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html:`@keyframes mhp{0%{transform:translateX(0)}100%{transform:translateX(-33.3333%)}}.amhp{display:flex;width:max-content;animation:mhp 60s linear infinite}.amhp:hover{animation-play-state:paused}` }}/>
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10"/>
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10"/>
        <div className="amhp gap-6 px-6">
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
            <a href={`${p}/idopont`}>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-sky-700 font-bold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all">
                <Calendar className="w-6 h-6"/> {t('bookOnline')}
              </motion.button>
            </a>
            <a href="tel:+36705646837">
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-lg rounded-2xl transition-all border border-sky-500/30">
                <Phone className="w-5 h-5"/> +36 70 564 6837
              </motion.button>
            </a>
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
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <FloatingCTA />
      <main>
        <HeroSlider />
        <TrustBadges />
        <LocationSelector />
        <StatsSection />
        <QuoteAnalyzerSection />
        <LabShowcase />
        <FeaturedPricesSection />
        <ReviewsSection />
        <CTASection />
        <FAQSection />
      </main>
    </div>
  );
}
