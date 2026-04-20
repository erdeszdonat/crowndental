'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';

import {
  MapPin,
  Phone,
  Clock,
  Shield,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Star,
  Users,
  Stethoscope,
  Sparkles,
  ChevronDown,
  Zap,
  Heart,
  Eye,
  Microscope,
  Baby,
  Wrench,
  Scissors,
  ScanLine,
  Search,
  SmilePlus,
  FlaskConical,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SANITY KLIENS & KÉP HOOKOK (Valós, tiszta Sanity adatkérés)
// ═══════════════════════════════════════════════════════════════════════════
const client = createClient({
  projectId: projectId || 'fallback',
  dataset: dataset || 'production',
  apiVersion: '2024-03-08',
  useCdn: true,
});

// Helyszínekhez (pl. Esztergom hero kép)
function useSanityImage(name: string) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const query = `*[_type == "location" && name == "${name}"][0]{"url": image.asset->url}`;
    client.fetch(query).then((r: any) => { 
      if (r?.url) {
        // Kép optimalizálása (Modern formátum, 1920px max szélesség, 75% minőség)
        setUrl(`${r.url}?auto=format&w=1920&q=75`);
      }
    }).catch(() => {});
  }, [name]);
  return url;
}

// Kezelésekhez és globális bannerekhez (pl. fokep, fokep1)
function useTreatmentImage(slug: string) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const query = `*[_type == "treatment" && slug.current == "${slug}"][0]{"url": mainImage.asset->url}`;
    client
      .fetch(query)
      .then((r: any) => {
        if (r?.url) {
          // Ha banner kép (fokep, esztetikai-fogaszat), akkor 1920px, ha csak egy kis szolgáltatás kártya, akkor elég a 800px is!
          const isLargeBanner = slug.includes('fokep') || slug === 'esztetikai-fogaszat';
          const imgWidth = isLargeBanner ? 1920 : 800;
          setUrl(`${r.url}?auto=format&w=${imgWidth}&q=75`);
        } else {
          // Ha nincs treatment kép, megpróbáljuk location képként is behúzni (biztonsági tartalék)
          const fallbackQuery = `*[_type == "location" && name == "${slug}"][0]{"url": image.asset->url}`;
          client.fetch(fallbackQuery).then((r2: any) => { 
            if (r2?.url) {
              setUrl(`${r2.url}?auto=format&w=1920&q=75`);
            }
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [slug]);
  return url;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEBEGŐ IDŐPONT GOMB (STICKY FAB)
// ═══════════════════════════════════════════════════════════════════════════
function FloatingCTA() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end"
        >
          {/* Telefon gomb */}
          <a
            href="tel:+36705646837"
            className="group flex items-center gap-2 bg-white text-sky-700 pl-4 pr-5 py-3 rounded-full shadow-2xl border border-sky-100 hover:bg-sky-50 transition-all"
          >
            <Phone className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Hívjon most</span>
          </a>
          {/* Időpont gomb */}
          <Link href={`${p}/idopont`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-4 rounded-full shadow-[0_8px_40px_rgba(2,132,199,0.4)] hover:shadow-[0_8px_50px_rgba(2,132,199,0.6)] transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-bold">Időpontfoglalás</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION – PARALLAX (Sanity Slug: "esztergom")
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const heroImage = useSanityImage('esztergom');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative mt-24 h-[90svh] min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-950">
      {/* Parallax háttérkép a Sanity-ből */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0 will-change-transform bg-gray-900">
        {heroImage && (
          <img
            src={heroImage}
            alt="Crown Dental Esztergom"
            fetchPriority="high"
            className="w-full h-[120%] object-cover opacity-80"
          />
        )}
        {/* Gradient overlay-ek */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30" />
      </motion.div>

      {/* Alsó gradient a sima átmenethez */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white to-transparent z-10" />

      {/* Animated grid lines háttérben */}
      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      {/* Tartalom */}
      <motion.div style={{ y: textY, opacity }} className="relative z-20 container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-sky-300 text-sm font-bold tracking-wider uppercase mb-8">
              <MapPin className="w-4 h-4" />
              Esztergom Szívében
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight">
              Prémium Fogászat,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                helyben.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-xl font-light">
              1994 óta a város megbízható fogászata. Saját laborunkkal <span className="text-amber-300 font-semibold">gyorsabban és kedvezőbb áron</span> biztosítunk csúcsminőséget.
            </p>
          </motion.div>

          {/* CTA gombok */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href={`${p}/idopont`}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white text-lg font-bold rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.4)] transition-all"
              >
                <Calendar className="w-6 h-6" />
                Azonnali Időpontfoglalás
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <a href="tel:+36705646837">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-bold rounded-2xl transition-all border border-white/20"
              >
                <Phone className="w-5 h-5" />
                +36 70 564 6837
              </motion.button>
            </a>
          </motion.div>

          {/* Gyors info chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {[
              { icon: <Zap className="w-4 h-4" />, text: 'Korona 3 nap alatt' },
              { icon: <Shield className="w-4 h-4" />, text: '30 év tapasztalat' },
              { icon: <Clock className="w-4 h-4" />, text: 'Hétvégén is 7:00-13:00' },
            ].map((chip, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-md shadow-lg shadow-black/10">
                <span className="text-sky-200">{chip.icon}</span>
                <span>{chip.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-xs tracking-widest uppercase">Görgessen lejjebb</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KÉNYELEM ÉS KÖRNYEZET SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function ClinicEnvironmentSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl border border-gray-100 bg-white p-8 md:p-12 overflow-hidden shadow-xl">
            {/* Díszítő elemek */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-50 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-10 items-center">
                {/* Bal: Szöveg */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-100 rounded-full text-sky-700 text-sm font-bold uppercase tracking-wider mb-5">
                    <Heart className="w-4 h-4" />
                    Páciensközpontú szemlélet
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
                    Kellemes, stresszmentes környezet<br />
                    <span className="text-sky-600">Esztergom szívében</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Számunkra fontos, hogy a fogászati kezelés ne szorongással teli élmény legyen. Világos, barátságos várótermünkben nyugodt körülmények között készülhet fel a kezelésre. Rendelőnk kialakításakor mindenki kényelmére gondoltunk.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`${p}/idopont`}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-md"
                      >
                        <Calendar className="w-4 h-4" />
                        Konzultáció kérése
                      </motion.button>
                    </Link>
                  </div>
                </div>

                {/* Jobb: Vizuális ikon lista */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600 border border-gray-100">
                        <SmilePlus className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Modern váróterem</span>
                        <span className="text-sm text-gray-500">Nyugodt, tiszta környezet</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600 border border-gray-100">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Könnyű bejutás</span>
                        <span className="text-sm text-gray-500">Földszinti elhelyezkedés</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600 border border-gray-100">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Teljes akadálymentesítés</span>
                        <span className="text-sm text-gray-500">Kerekesszékkel és babakocsival is kényelmes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI KALKULÁTOR BANNER (Sanity Slug: "fokep")
// ═══════════════════════════════════════════════════════════════════════════
function AICalculatorBanner() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bgImage = useTreatmentImage('fokep');

  return (
    <section className="relative py-20 overflow-hidden bg-gray-950">
      {/* Opcionális háttérkép a Sanity 'fokep' elemből */}
      {bgImage && (
        <img src={bgImage} alt="AI Kalkulátor" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
      )}
      
      {/* Háttér gradient + pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600/90 via-sky-700/90 to-indigo-800/90" />
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />
      
      {/* Glow-k */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 border border-white/20 backdrop-blur-sm rounded-full text-cyan-200 text-sm font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" />
              AI-alapú eszköz
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Sokallja a máshol kapott
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200">
                árajánlatot?
              </span>
            </h2>

            <p className="text-lg md:text-xl text-sky-100/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Töltse fel bármely fogászat árajánlatát, és mesterséges intelligenciánk azonnal összehasonlítja a Crown Dental áraival. Tudja meg percek alatt, mennyit spórolhat a saját laborunknak köszönhetően!
            </p>

            <Link href={`${p}/#arajanlat-elemzo`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all"
              >
                <Sparkles className="w-6 h-6" />
                Árajánlat Elemző Indítása
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            {/* Trust badge-ek */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sky-200/60 text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Teljesen ingyenes</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Azonnali eredmény</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Adatai biztonságban</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SZOLGÁLTATÁSOK – BENTO GRID LAYOUT SANITY KÉPEKKEL
// ═══════════════════════════════════════════════════════════════════════════
function ServiceCard({ service, index, large = false }: { service: any; index: number; large?: boolean }) {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const imgUrl = useTreatmentImage(service.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={large ? 'md:col-span-2 md:row-span-2' : ''}
    >
      <Link
        href={`${p}${service.href}`}
        className={`group relative block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${
          large ? 'h-full min-h-[400px] md:min-h-[500px]' : 'h-full min-h-[320px]'
        }`}
      >
        {/* Háttérkép */}
        {imgUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={imgUrl}
              alt={service.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
          </div>
        )}
        {!imgUrl && (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-sky-50 to-gray-50" />
        )}

        {/* Tartalom */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            imgUrl
              ? 'bg-white/15 backdrop-blur-md text-white border border-white/20'
              : 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white'
          }`}>
            {service.icon}
          </div>
          <h4 className={`text-xl md:text-2xl font-bold mb-2 transition-colors ${
            imgUrl ? 'text-white' : 'text-gray-900 group-hover:text-sky-600'
          }`}>
            {service.title}
          </h4>
          <p className={`mb-4 leading-relaxed text-sm md:text-base ${
            imgUrl ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {service.description}
          </p>
          <div className="flex items-center justify-between">
            <span className={`font-extrabold text-lg ${imgUrl ? 'text-sky-300' : 'text-sky-600'}`}>
              {service.price}
            </span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1 ${
              imgUrl
                ? 'bg-white/10 text-white'
                : 'bg-gray-50 text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-600'
            }`}>
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ServicesSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const services = [
    {
      title: 'Fogimplantátum',
      description: 'Tartós megoldás foghiányra. Alpha Bio és DIO implantátumok saját laborból, életre szóló garanciával.',
      href: '/kezelesek/implantatum',
      icon: <Stethoscope className="w-6 h-6" />,
      price: '190.000 Ft-tól',
      slug: 'implantatum',
    },
    {
      title: 'Cirkónium Korona',
      description: 'Prémium koronák és hidak 3 nap alatt a saját laborból.',
      href: '/kezelesek/koronak-hidak',
      icon: <Sparkles className="w-6 h-6" />,
      price: '55.000 Ft-tól',
      slug: 'koronak-hidak',
    },
    {
      title: 'Fogfehérítés',
      description: 'Professzionális fehérítés, akár 8 árnyalattal világosabb 1 óra alatt.',
      href: '/kezelesek/fogfeherites',
      icon: <Star className="w-6 h-6" />,
      price: '30.000 Ft-tól',
      slug: 'fogfeherites',
    },
    {
      title: 'Fogszabályozás',
      description: 'Láthatatlan sínek és esztétikus készülékek gyerekeknek és felnőtteknek.',
      href: '/kezelesek/fogszabalyozas',
      icon: <SmilePlus className="w-6 h-6" />,
      price: '60.000 Ft-tól',
      slug: 'fogszabalyozas',
    },
    {
      title: 'Kivehető Fogsorok',
      description: 'Saját laborból, tökéletes illeszkedéssel, azonnali javítási lehetőséggel.',
      href: '/kezelesek/fogsor',
      icon: <Users className="w-6 h-6" />,
      price: '110.000 Ft-tól',
      slug: 'fogsor',
    },
    {
      title: 'Szájsebészet',
      description: 'Bölcsességfog, csontpótlás, szájsebészeti beavatkozások biztos kézzel.',
      href: '/kezelesek/szajsebeszet',
      icon: <Scissors className="w-6 h-6" />,
      price: 'Egyéni árazás',
      slug: 'szajsebeszet',
    },
    {
      title: 'Gyökérkezelés',
      description: 'Mikroszkópos precizitással mentjük meg fogait. Fájdalommentes eljárás.',
      href: '/kezelesek/gyokerkezeles',
      icon: <Microscope className="w-6 h-6" />,
      price: '25.000 Ft-tól',
      slug: 'gyokerkezeles',
    },
    {
      title: 'Esztétikai Fogászat',
      description: 'Héjak, veneerek, kompozit restaurációk – álmai mosolya.',
      href: '/kezelesek/esztetikai-fogaszat',
      icon: <Eye className="w-6 h-6" />,
      price: '40.000 Ft-tól',
      slug: 'esztetikai-fogaszat',
    },
    {
      title: 'Állapotfelmérés',
      description: 'Panoráma röntgen, 3D CT és teljes szájvizsgálat egyetlen alkalommal.',
      href: '/kezelesek/allapotfelmeres',
      icon: <ScanLine className="w-6 h-6" />,
      price: '10.000 Ft',
      slug: 'allapotfelmeres',
    },
    {
      title: 'Góckutatás',
      description: '3D CBCT technológiával, rejtett gócok felkutatása és kezelése.',
      href: '/kezelesek/gockutatas',
      icon: <Search className="w-6 h-6" />,
      price: '15.000 Ft-tól',
      slug: 'gockutatas',
    },
    {
      title: 'Gyermekfogászat',
      description: 'Barátságos, stresszmentes környezetben – hogy a kicsiknél is pozitív élmény legyen.',
      href: '/kezelesek/gyerekfogaszat',
      icon: <Baby className="w-6 h-6" />,
      price: '8.000 Ft-tól',
      slug: 'gyerekfogaszat',
    },
    {
      title: 'Fogtechnika',
      description: 'CAD/CAM tervezés, saját labor – a tökéletesség kulcsa.',
      href: '/kezelesek/fogtechnikai-megoldasok',
      icon: <FlaskConical className="w-6 h-6" />,
      price: 'Benne az árban',
      slug: 'fogtechnika',
    },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Szolgáltatásaink
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Minden kezelés,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">egy helyen.</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              A konzultációtól a végleges fogpótlásig – saját laborral, gyorsabban és kedvezőbb áron.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {/* Első nagy kártya: Implantátum */}
          <ServiceCard service={services[0]} index={0} large />
          {/* Többi kártya normál méretben */}
          {services.slice(1).map((service, i) => (
            <ServiceCard key={i} service={service} index={i + 1} />
          ))}
        </div>

        {/* Teljes árlista CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href={`${p}/kezelesek`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg"
          >
            Teljes árlista megtekintése
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MIÉRT MINKET – ANIMÁLT SZÁMOK + LABOR SHOWCASE (Sanity Slug: "fokep1")
// ═══════════════════════════════════════════════════════════════════════════
function AnimatedNumber({ end, suffix = '', label, desc }: { end: number; suffix?: string; label: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl lg:text-7xl font-black text-sky-500 mb-3 tracking-tight tabular-nums">
        {count.toLocaleString('hu-HU')}{suffix}
      </div>
      <div className="text-lg font-bold text-gray-900 mb-1">{label}</div>
      <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] mx-auto">{desc}</p>
    </div>
  );
}

function WhyUsSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const laborImage = useTreatmentImage('fokep1');

  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Tények és Számok
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Miért a Crown Dental?
            </h2>
          </motion.div>
        </div>

        {/* Számok grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto mb-20">
          <AnimatedNumber end={30} suffix="+" label="év tapasztalat" desc="1994 óta működünk, generációk bizalmával." />
          <AnimatedNumber end={10000} suffix="+" label="elégedett páciens" desc="Fiatalok és idősek egyaránt." />
          <AnimatedNumber end={40} suffix="%" label="megtakarítás" desc="Saját labor = nincs közvetítő díj." />
          <AnimatedNumber end={3} suffix=" nap" label="korona elkészítés" desc="Nem hetek, hanem 3 nap alatt kész." />
        </div>

        {/* Labor showcase – kiemelkedő kártya */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl">
            <div className="grid lg:grid-cols-2 items-center">
              {/* Kép */}
              <div className="relative h-[300px] lg:h-[500px] bg-gray-800">
                {laborImage && (
                  <img src={laborImage} alt="Crown Dental fogtechnikai labor" loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/60 hidden lg:block" />
              </div>
              {/* Szöveg */}
              <div className="p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 rounded-full text-sky-400 text-sm font-bold mb-6">
                  <Wrench className="w-4 h-4" />
                  Saját fogtechnikai labor
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                  A tökéletesség kulcsa: minden házon belül készül.
                </h3>
                <ul className="space-y-4 mb-8">
                  {[
                    'CAD/CAM digitális tervezés és gyártás',
                    'Koronák, hidak, fogsorok akár 3 nap alatt',
                    'Azonnali javítás és módosítás helyben',
                    'Nincs közvetítői felár – közvetlenül spórol',
                    'Prémium anyagok: cirkónium, porcelán, PEEK',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${p}/kezelesek/fogtechnikai-megoldasok`}
                  className="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors"
                >
                  Ismerje meg laborunkat <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BEFORE/AFTER SHOWCASE – ESZTÉTIKAI FOGÁSZAT KIEMELÉS (Sanity Slug: "esztetikai-fogaszat")
// ═══════════════════════════════════════════════════════════════════════════
function BeforeAfterBanner() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const esteticImage = useTreatmentImage('esztetikai-fogaszat');

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Szöveg */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Esztétikai fogászat
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Mosolyának<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                legjobb verziója.
              </span>
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Porcelán héjak, kompozit bonding, fogfehérítés – minden, amitől igazán magabiztosan mosolyoghat. Kérjen személyre szabott esztétikai tervet!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`${p}/idopont`}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-6 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Konzultáció foglalás
                </motion.button>
              </Link>
              <Link
                href={`${p}/kezelesek/esztetikai-fogaszat`}
                className="flex items-center gap-2 px-6 py-4 text-gray-600 hover:text-sky-600 font-bold transition-colors"
              >
                Részletek <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Kép */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
              {esteticImage && (
                <img
                  src={esteticImage}
                  alt="Esztétikai fogászat – Crown Dental"
                  loading="lazy"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              )}
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">4.8 / 5</div>
                  <div className="text-gray-500 text-sm">páciens elégedettség</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VÉLEMÉNYEK – MARQUEE CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════
function ReviewsSection() {
  const reviews = [
    { name: 'Kovács Mária', rating: 5, text: 'Már 10 éve járok ide, a legjobb döntés volt. A gyerekeim is ide járnak, sosem csalódtunk a csapatban.', date: '2026. február' },
    { name: 'Nagy József', rating: 4, text: 'Nagyon profik, az implantátumom tökéletes lett. Kicsit várni kellett az időpontra, de abszolút megérte.', date: '2026. január' },
    { name: 'Szabó Anna', rating: 5, text: 'A korona 3 nap alatt elkészült a saját labor miatt. Nagyon féltem a beavatkozástól, de teljesen fájdalommentes volt!', date: '2025. december' },
    { name: 'Tóth Gábor', rating: 5, text: '8 éve csak hozzájuk járok. Mindig kedvesek, gyorsak és a legmodernebb, legtisztább gépekkel dolgoznak.', date: '2025. november' },
    { name: 'Horváth Éva', rating: 4, text: 'Nagyon szép lett a kivehető fogsorom, a technikus azonnal tudott korrigálni a színen. Szuper szakemberek.', date: '2025. október' },
    { name: 'Varga Péter', rating: 5, text: '5 éve vagyok páciens. Életemben először nem gyomorgörccsel megyek fogorvoshoz, nagyon empatikusak.', date: '2025. szeptember' },
    { name: 'Kiss László', rating: 5, text: 'Komplikált gyökérkezelésen voltam, de megmentették a fogam. Precíz, gyors és alapos munka.', date: '2025. július' },
    { name: 'Farkas Zita', rating: 5, text: '10 éve hűséges páciensük vagyok. Bárkinek, aki Esztergomban keres fogorvost, csak ajánlani tudom őket!', date: '2025. május' },
  ];

  const extendedReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Vélemények
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8">
              Pácienseink mondták
            </h2>
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
              ))}
              <span className="text-gray-900 font-bold ml-2 text-lg">4.8 / 5</span>
              <span className="text-gray-500 font-medium ml-1">(320+ értékelés)</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-eszt { 0% { transform: translateX(0); } 100% { transform: translateX(-33.3333%); } }
        .animate-marquee-eszt { display: flex; width: max-content; animation: marquee-eszt 60s linear infinite; }
        .animate-marquee-eszt:hover { animation-play-state: paused; }
      `}} />

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="animate-marquee-eszt gap-6 px-6">
          {extendedReviews.map((review, i) => (
            <div
              key={i}
              className="w-[360px] md:w-[420px] p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex-shrink-0 cursor-default hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-5 h-5 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed min-h-[100px]">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
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

// ═══════════════════════════════════════════════════════════════════════════
// MÁSODIK AI KALKULÁTOR CTA – INLINE BANNER (Sanity Slug: "fokep")
// ═══════════════════════════════════════════════════════════════════════════
function InlineCalculatorCTA() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bgImage = useTreatmentImage('fokep');

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl bg-gray-900 p-8 md:p-14 overflow-hidden shadow-2xl border border-gray-800">
            {bgImage && (
              <img src={bgImage} alt="AI Kalkulátor" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90" />
            
            {/* Háttér elem */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 grid md:grid-cols-[1fr,auto] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 rounded-full text-sky-400 text-sm font-bold mb-5">
                  <Sparkles className="w-4 h-4" />
                  AI Árajánlat Elemző
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                  Hozza el bármely fogászat ajánlatát – mi megmondjuk, mennyit spórolhat.
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Töltse fel a kapott árajánlatot, és AI-rendszerünk tételes összehasonlítást készít a Crown Dental áraival.
                </p>
              </div>
              <Link href={`${p}/#arajanlat-elemzo`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl shadow-lg whitespace-nowrap transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Elemzés indítása
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁTFOGÓ CTA SECTION
// ═══════════════════════════════════════════════════════════════════════════
function CTASection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800" />
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Készen áll az első lépésre?
          </h2>
          <p className="text-lg md:text-xl text-sky-100/80 mb-12 max-w-2xl mx-auto font-light">
            Foglaljon időpontot online, vagy hívjon minket – és ismerje meg személyesen a Crown Dental különbséget.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href={`${p}/idopont`}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-sky-700 font-bold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all"
              >
                <Calendar className="w-6 h-6" />
                Online időpontfoglalás
              </motion.button>
            </Link>
            <a href="tel:+36705646837">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-lg rounded-2xl transition-all border border-sky-500/30"
              >
                <Phone className="w-5 h-5" />
                +36 70 564 6837
              </motion.button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GYIK SECTION – ESZTERGOM-SPECIFIKUS KÉRDÉSEK
// ═══════════════════════════════════════════════════════════════════════════
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Hol tudok parkolni az esztergomi rendelőnél?',
      answer: 'A Petőfi Sándor utcában és a környező utcákban fizetős utcai parkolás áll rendelkezésre. Kényelmes alternatívaként érdemes a közeli Bástya áruház parkolóját, vagy a Hősök tere körüli parkolóhelyeket igénybe venni, amik csak egy-két perc sétára vannak.',
    },
    {
      question: 'Mozgáskorlátozottak számára is megközelíthető a rendelő?',
      answer: 'Igen, a teljes rendelő akadálymentesített. Földszinti bejáratunk kerekesszékkel és babakocsival is könnyedén, küszöbök nélkül megközelíthető. Ezen felül tágas, szabványnak megfelelő akadálymentesített mosdó (rokkant WC) is pácienseink rendelkezésére áll.',
    },
    {
      question: 'Helyben készülnek a fogpótlások?',
      answer: 'Igen! Az esztergomi rendelőnkkel egy épületben működik a saját, modern gépekkel felszerelt fogtechnikai laborunk. Emiatt a fogpótlásokat (koronák, hidak) és a kivehető fogsor javításokat rekordidő alatt, sokkal kedvezőbb áron tudjuk elkészíteni.',
    },
    {
      question: 'Hétvégén is van rendelés Esztergomban?',
      answer: 'Igen, a pácienseink kényelme érdekében szombaton és vasárnap is tartunk ügyeletet 7:00 és 13:00 óra között, így hirtelen fellépő fájdalom esetén hétvégén is számíthat ránk.',
    },
    {
      question: 'Milyen fizetési lehetőségek vannak?',
      answer: 'Rendelőnkben készpénzzel és bankkártyával is fizethet. Ezen felül szerződésben állunk Magyarország szinte összes nagyobb egészségpénztárával, így EP kártyára is tudunk számlát kiállítani.',
    },
  ];

  return (
    <section className="py-28 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Gyakori kérdések
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Hasznos Információk
            </h2>
            <p className="text-xl text-gray-500 font-light">
              Minden, amit az esztergomi rendelőnkről tudni érdemes.
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={`rounded-2xl border transition-all duration-300 ${
                openIndex === index
                  ? 'border-sky-200 shadow-lg shadow-sky-100/50 bg-white'
                  : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg pr-4 transition-colors ${
                  openIndex === index ? 'text-sky-700' : 'text-gray-900'
                }`}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openIndex === index ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg border-t border-gray-100 pt-4">
                        {faq.answer}
                      </p>
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

// ═══════════════════════════════════════════════════════════════════════════
// ELÉRHETŐSÉGEK + GOOGLE TÉRKÉP (ESZTERGOM)
// ═══════════════════════════════════════════════════════════════════════════
function ContactAndMap() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const mapsUrl = 'https://maps.app.goo.gl/Xq9V8Z7yymT5nirb9';

  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

          {/* Bal oldal: info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
                Kapcsolat
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Látogasson el hozzánk!
              </h2>
              <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                Modern környezetben, akadálymentesített rendelővel, Esztergom szívében várjuk professzionális fogászati ellátással.
              </p>
            </motion.div>

            <div className="space-y-6">
              {/* Cím */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-5 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Cím</h4>
                  <p className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                    2500 Esztergom, Petőfi S. u. 11.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-sky-600 font-semibold mt-1 group-hover:underline">
                    Útvonaltervezés <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>

              {/* Telefon */}
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300">
                  <Phone className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Telefon</h4>
                  <a href="tel:+36705646837" className="text-xl font-bold text-gray-900 hover:text-sky-600 transition-colors">
                    +36 70 564 6837
                  </a>
                </div>
              </div>

              {/* Nyitvatartás */}
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300">
                  <Clock className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <div className="w-full max-w-[300px]">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Nyitvatartás</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">Hétfő – Péntek</span>
                      <span className="font-bold text-gray-900">8:00 – 20:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-600">Szombat – Vasárnap</span>
                      <span className="font-bold text-gray-900">7:00 – 13:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA gomb */}
            <Link href={`${p}/idopont`}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-8 py-5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-lg mt-4"
              >
                <Calendar className="w-5 h-5" />
                Időpont foglalása
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Jobb oldal: Google Map embed */}
          <div className="relative h-full min-h-[500px] lg:min-h-[650px]">
            <div className="sticky top-32 h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 z-0 bg-white">
              <iframe 
                className="absolute inset-0 w-full h-full"
                style={{ minHeight: '500px', border: 0 }}
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=hu&amp;q=Esztergom%20Pet%C5%91fi%20S%C3%A1ndor%20Utca%2011&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=B&amp;output=embed" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0}
                title="Crown Dental Esztergom Térkép"
              />
              
              {/* Útvonaltervezés gomb a térkép felett */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[400]">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-full shadow-2xl hover:bg-sky-50 hover:text-sky-600 transition-all transform hover:-translate-y-1 active:scale-95 border border-gray-100"
                >
                  <MapPin className="w-5 h-5" />
                  Útvonaltervezés
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function EsztergomPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-sky-200 selection:text-sky-900">
      <FloatingCTA />
      <HeroSection />
      <ClinicEnvironmentSection />
      <AICalculatorBanner />
      <ServicesSection />
      <WhyUsSection />
      <BeforeAfterBanner />
      <ReviewsSection />
      <InlineCalculatorCTA />
      <CTASection />
      <FAQSection />
      <ContactAndMap />
    </main>
  );
}
