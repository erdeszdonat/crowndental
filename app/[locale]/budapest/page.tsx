'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import locationGerman from '@/messages/location-de.json';
import GoogleReviewsCta from '@/components/GoogleReviewsCta';
import { translateLocationGerman } from '@/lib/locationGermanFallback';
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
  X,
} from 'lucide-react';

const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });

function useSanityImage(slug: string, fallback: string = '') {
  const [url, setUrl] = useState(fallback);
  useEffect(() => {
    const query = `*[_type == "location" && name == "${slug}"][0]{"url": image.asset->url}`;
    client.fetch(query).then((r: any) => { if (r?.url) setUrl(`${r.url}?auto=format&w=1920&q=75`); }).catch(() => {});
  }, [slug]);
  return url;
}

function useTreatmentImage(slug: string) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const query = `*[_type == "treatment" && slug.current == "${slug}"][0]{"url": mainImage.asset->url}`;
    client.fetch(query).then((r: any) => {
      if (r?.url) {
        const isLarge = slug.includes('fokep') || slug === 'esztetikai-fogaszat';
        setUrl(`${r.url}?auto=format&w=${isLarge ? 1920 : 800}&q=75`);
      } else {
        const fb = `*[_type == "location" && name == "${slug}"][0]{"url": image.asset->url}`;
        client.fetch(fb).then((r2: any) => { if (r2?.url) setUrl(`${r2.url}?auto=format&w=1920&q=75`); }).catch(() => {});
      }
    }).catch(() => {
      const fb = `*[_type == "location" && name == "${slug}"][0]{"url": image.asset->url}`;
      client.fetch(fb).then((r2: any) => { if (r2?.url) setUrl(`${r2.url}?auto=format&w=1920&q=75`); }).catch(() => {});
    });
  }, [slug]);
  return url;
}

const germanText = locationGerman.budapest as Record<string, string>;

function de(value: string) {
  return germanText[value] ?? translateLocationGerman(value);
}

function t(locale: string, hu: string, en: string, sk: string) {
  if (locale === 'de') return de(en);
  if (locale === 'en') return en;
  if (locale === 'sk') return sk;
  return hu;
}

// ─── SERVICE DATA ──────────────────────────────────────────────────────────
const servicesBase = [
  { href: '/kezelesek/implantatum', icon: <Stethoscope className="w-6 h-6" />, slug: 'implantatum' },
  { href: '/kezelesek/koronak-hidak', icon: <Sparkles className="w-6 h-6" />, slug: 'koronak-hidak' },
  { href: '/kezelesek/fogfeherites', icon: <Star className="w-6 h-6" />, slug: 'fogfeherites' },
  { href: '/kezelesek/fogszabalyozas', icon: <SmilePlus className="w-6 h-6" />, slug: 'fogszabalyozas' },
  { href: '/kezelesek/fogsor', icon: <Users className="w-6 h-6" />, slug: 'fogsor' },
  { href: '/kezelesek/szajsebeszet', icon: <Scissors className="w-6 h-6" />, slug: 'szajsebeszet' },
  { href: '/kezelesek/gyokerkezeles', icon: <Microscope className="w-6 h-6" />, slug: 'gyokerkezeles' },
  { href: '/kezelesek/esztetikai-fogaszat', icon: <Eye className="w-6 h-6" />, slug: 'esztetikai-fogaszat' },
  { href: '/kezelesek/allapotfelmeres', icon: <ScanLine className="w-6 h-6" />, slug: 'allapotfelmeres' },
  { href: '/kezelesek#arlista', icon: <ScanLine className="w-6 h-6" />, slug: 'allapotfelmeres' },
  { href: '/kezelesek#arlista', icon: <ScanLine className="w-6 h-6" />, slug: 'telerontgen' },
  { href: '/kezelesek/gockutatas', icon: <ScanLine className="w-6 h-6" />, slug: 'gockutatas' },
  { href: '/kezelesek/gockutatas', icon: <Search className="w-6 h-6" />, slug: 'gockutatas' },
  { href: '/kezelesek/gyerekfogaszat', icon: <Baby className="w-6 h-6" />, slug: 'gyerekfogaszat' },
  { href: '/kezelesek/fogtechnikai-megoldasok', icon: <FlaskConical className="w-6 h-6" />, slug: 'fogtechnika' },
];

const servicesHu = [
  { title: 'Fogimplantátum', description: 'Tartós megoldás foghiányra. Alpha Bio és DIO implantátumok, írásos garanciális feltételekkel.', price: '190.000 Ft-tól' },
  { title: 'Cirkónium Korona', description: 'Fémmentes koronák és hidak saját fogtechnikai laborunk közreműködésével.', price: '65.000 Ft' },
  { title: 'Fogfehérítés', description: 'Professzionális fogfehérítés állapotfelmérés és egyéni konzultáció alapján.', price: '30.000 Ft-tól' },
  { title: 'Fogszabályozás', description: 'Láthatatlan sínek és esztétikus készülékek gyerekeknek és felnőtteknek.', price: '60.000 Ft-tól' },
  { title: 'Kivehető Fogsorok', description: 'Egyénre szabott megoldások saját laborháttérrel és helyi korrekciós lehetőséggel.', price: '110.000 Ft-tól' },
  { title: 'Szájsebészet', description: 'Bölcsességfog, csontpótlás, szájsebészeti beavatkozások biztos kézzel.', price: 'Egyéni árazás' },
  { title: 'Gyökérkezelés', description: 'A fog megtartását célzó kezelés helyi érzéstelenítésben, egyéni kezelési terv alapján.', price: '25.000 Ft-tól' },
  { title: 'Esztétikai Fogászat', description: 'Héjak, veneerek, kompozit restaurációk – álmai mosolya.', price: '40.000 Ft-tól' },
  { title: 'Állapotfelmérés', description: 'Részletes szájvizsgálat és személyre szabott kezelési terv.', price: '10.000 Ft' },
  { title: 'Panoráma Röntgen', description: 'Áttekintő felvétel a teljes fogazatról és az állcsontokról.', price: '8.000 Ft' },
  { title: 'Teleröntgen', description: 'Oldalirányú koponyafelvétel fogszabályozási diagnosztikához és pontos kezeléstervezéshez.', price: '10.000 Ft' },
  { title: '3D CT Felvétel', description: 'Részletes, háromdimenziós képalkotás a pontos diagnózishoz és tervezéshez.', price: '20.000 Ft' },
  { title: 'Góckutatás', description: 'Fogászati vizsgálat és az indokolt képalkotás a lehetséges gyulladásforrások felmérésére.', price: '15.000 Ft-tól' },
  { title: 'Gyermekfogászat', description: 'Barátságos, stresszmentes környezetben – hogy a kicsiknél is pozitív élmény legyen.', price: '8.000 Ft-tól' },
  { title: 'Fogtechnika', description: 'CAD/CAM tervezés, saját labor – a tökéletesség kulcsa.', price: 'Benne az árban' },
];

const servicesEn = [
  { title: 'Dental Implant', description: 'A durable option for missing teeth using Alpha Bio and DIO systems, subject to written guarantee terms.', price: 'from 190,000 HUF (~€543)' },
  { title: 'Zirconia Crown', description: 'Metal-free crowns and bridges made with support from our in-house dental laboratory.', price: '65,000 HUF' },
  { title: 'Teeth Whitening', description: 'Professional whitening — up to 8 shades brighter in just 1 hour.', price: 'from 30,000 HUF (~€86)' },
  { title: 'Orthodontics', description: 'Invisible aligners and aesthetic braces for children and adults.', price: 'from 60,000 HUF (~€172)' },
  { title: 'Removable Dentures', description: 'Perfect fit from our in-house lab, with immediate adjustment options.', price: 'from 110,000 HUF (~€314)' },
  { title: 'Oral Surgery', description: 'Wisdom tooth removal, bone grafting, and surgical procedures by expert hands.', price: 'Individual pricing' },
  { title: 'Root Canal Treatment', description: 'Treatment aimed at retaining the tooth, performed with local anaesthesia and an individual plan.', price: 'from 25,000 HUF (~€71)' },
  { title: 'Aesthetic Dentistry', description: 'Veneers, laminates, composite restorations — your dream smile awaits.', price: 'from 40,000 HUF (~€114)' },
  { title: 'Dental Check-up', description: 'Detailed oral examination and a personalised treatment plan.', price: '10,000 HUF' },
  { title: 'Panoramic X-ray', description: 'An overview image of the complete dentition and jaw bones.', price: '8,000 HUF' },
  { title: 'Cephalometric X-ray', description: 'A lateral skull X-ray for orthodontic diagnostics and accurate treatment planning.', price: '10,000 HUF' },
  { title: '3D CT Scan', description: 'Detailed three-dimensional imaging for accurate diagnosis and treatment planning.', price: '20,000 HUF' },
  { title: 'Focal Infection Screening', description: 'Dental examination with clinically indicated imaging to assess possible sources of inflammation.', price: 'from 15,000 HUF (~€43)' },
  { title: 'Pediatric Dentistry', description: 'Friendly, stress-free environment — making dentistry a positive experience for children.', price: 'from 8,000 HUF (~€23)' },
  { title: 'Dental Lab Services', description: 'CAD/CAM design, in-house lab — the key to perfection.', price: 'Included in price' },
];

const servicesSk = [
  { title: 'Zubný implantát', description: 'Trvalé riešenie chýbajúcich zubov so systémami Alpha Bio a DIO podľa písomných záručných podmienok.', price: 'od 190 000 Ft (~€543)' },
  { title: 'Zirkónová korunka', description: 'Bezkovové korunky a mostíky s podporou nášho vlastného zubnotechnického laboratória.', price: '65 000 Ft' },
  { title: 'Bielenie zubov', description: 'Profesionálne bielenie — až o 8 odtieňov svetlejšie za 1 hodinu.', price: 'od 30 000 Ft (~€86)' },
  { title: 'Ortodontia', description: 'Neviditeľné dlahičky a estetické aparáty pre deti aj dospelých.', price: 'od 60 000 Ft (~€172)' },
  { title: 'Snímateľná protéza', description: 'Dokonalé prispôsobenie z vlastného laboratória, okamžitá oprava na mieste.', price: 'od 110 000 Ft (~€314)' },
  { title: 'Orálna chirurgia', description: 'Extrakcia zubov múdrosti, augmentácia kosti, chirurgické zákroky v skúsených rukách.', price: 'Individuálna cena' },
  { title: 'Ošetrenie koreňových kanálikov', description: 'Ošetrenie zamerané na zachovanie zuba v lokálnej anestézii podľa individuálneho plánu.', price: 'od 25 000 Ft (~€71)' },
  { title: 'Estetická stomatológia', description: 'Fazety, laminátové obloženie, kompozitné rekonštrukcie — váš vysnívaný úsmev.', price: 'od 40 000 Ft (~€114)' },
  { title: 'Stomatologická prehliadka', description: 'Podrobné vyšetrenie ústnej dutiny a individuálny liečebný plán.', price: '10 000 Ft' },
  { title: 'Panoramatický RTG', description: 'Prehľadová snímka celého chrupu a čeľustných kostí.', price: '8 000 Ft' },
  { title: 'Teleröntgen', description: 'Bočný snímok lebky pre ortodontickú diagnostiku a presné plánovanie liečby.', price: '10 000 Ft' },
  { title: '3D CT snímka', description: 'Podrobné trojrozmerné zobrazenie pre presnú diagnostiku a plánovanie liečby.', price: '20 000 Ft' },
  { title: 'Vyšetrenie ložísk infekcie', description: 'Zubné vyšetrenie a podľa potreby zobrazovanie na posúdenie možných zdrojov zápalu.', price: 'od 15 000 Ft (~€43)' },
  { title: 'Detská stomatológia', description: 'Priateľské, bezstresové prostredie — aby bol zubár pre deti pozitívnym zážitkom.', price: 'od 8 000 Ft (~€23)' },
  { title: 'Zubná technika', description: 'CAD/CAM dizajn, vlastné laboratórium — kľúč k dokonalosti.', price: 'V cene' },
];

function getServices(locale: string) {
  const text = locale === 'de'
    ? servicesEn.map((service) => ({
        ...service,
        title: de(service.title),
        description: de(service.description),
        price: de(service.price),
      }))
    : locale === 'en' ? servicesEn : locale === 'sk' ? servicesSk : servicesHu;
  return text.map((s, i) => ({ ...s, ...servicesBase[i] }));
}

// ─── FAQs ─────────────────────────────────────────────────────────────────
function getFaqs(locale: string): Array<{ question: string; answer: string }> {
  if (locale === 'de') return getFaqs('en').map((faq) => ({ question: de(faq.question), answer: de(faq.answer) }));
  if (locale === 'en') return [
    { question: 'Where exactly is the Budapest clinic located?', answer: 'Our clinic is located in Budapest\'s 3rd district, at the Római Part waterfront: 1039 Budapest, Királyok útja 55. It\'s situated right next to the Danube, in a quiet and pleasant environment.' },
    { question: 'Is parking available at the clinic?', answer: 'Yes, free parking is available in front of the clinic and in the surrounding streets. The clinic is also easily accessible by car from Szentendrei út, and is just a few minutes\' walk from the Aquincum HÉV (suburban railway) stop.' },
    { question: 'Are dental prosthetics made on-site in Budapest too?', answer: 'Our dental laboratory is based at the Esztergom clinic and will support Budapest treatment planning through direct coordination. Timing and final cost will depend on the individual case; Budapest booking is not open yet.' },
    { question: 'What payment options are available?', answer: 'You can pay by cash or bank card. We have agreements with most health insurance funds, so we can also invoice to health fund cards (EP). Installment payment is possible for larger treatments — please ask when booking.' },
    { question: 'What happens on the first visit?', answer: 'The first visit is a comprehensive assessment: panoramic X-ray, oral examination, and a detailed treatment plan. This way you\'ll know exactly what treatments are needed, how much they cost, and how long they\'ll take.' },
  ];
  if (locale === 'sk') return [
    { question: 'Kde presne sa nachádza budapeštianska ordinácia?', answer: 'Naša ordinácia sa nachádza v 3. obvode Budapešti, pri nábreží Rímska časť: 1039 Budapešť, Királyok útja 55. Priamo pri Dunaji, v tichom a príjemnom prostredí.' },
    { question: 'Je pri ordinácii možné parkovať?', answer: 'Áno, pred ordináciou a v okolitých uliciach je k dispozícii bezplatné parkovanie. Ordinácia je pohodlne dostupná autom zo Szentendrei útja a od zastávky predmestskej železnice Aquincum HÉV je len pár minút pešo.' },
    { question: 'Vyrábajú sa zubné náhrady aj priamo v Budapešti?', answer: 'Naše zubnotechnické laboratórium sídli v ambulancii v Ostrihome a budapeštianske plánovanie bude podporovať priamou koordináciou. Čas a konečná cena budú závisieť od konkrétneho prípadu; rezervácia v Budapešti ešte nie je otvorená.' },
    { question: 'Aké možnosti platby sú k dispozícii?', answer: 'Platiť môžete v hotovosti aj platobnou kartou. Máme zmluvy s väčšinou zdravotných poisťovní, takže môžeme vystaviť faktúru aj na zdravotnú kartu (EP). Pri väčších ošetreniach je možné splácanie — informujte sa pri rezervácii.' },
    { question: 'Čo sa stane pri prvej návšteve?', answer: 'Prvá návšteva je komplexné vyšetrenie: panoramatický RTG, vyšetrenie chrupu a zostavenie podrobného liečebného plánu. Budete presne vedieť, aké ošetrenia sú potrebné, koľko budú stáť a ako dlho potrvajú.' },
  ];
  return [
    { question: 'Hol található pontosan a budapesti rendelő?', answer: 'Rendelőnk Budapest III. kerületében, a Római Parton található: 1039 Budapest, Királyok útja 55. A Duna-part közvetlen közelében, csendes, kellemes környezetben.' },
    { question: 'Van parkolási lehetőség a rendelőnél?', answer: 'Igen, a rendelő előtt és a környező utcákban ingyenes parkolási lehetőség áll rendelkezésre. Autóval kényelmesen megközelíthető a Szentendrei útról és az Aquincum HÉV megállótól is pár perc sétára van.' },
    { question: 'Helyben készülnek a fogpótlások Budapesten is?', answer: 'Fogtechnikai laborunk az esztergomi rendelőben működik, és közvetlen együttműködéssel támogatja majd a budapesti kezeléstervezést. Az elkészítési idő és a végleges ár az egyéni esettől függ; Budapestre egyelőre még nem foglalható időpont.' },
    { question: 'Milyen fizetési lehetőségek vannak?', answer: 'Készpénzzel és bankkártyával is fizethet. Szerződésben állunk a legtöbb egészségpénztárral, így EP kártyával is tudunk számlázni. Nagyobb kezelések esetén részletfizetés is lehetséges – kérjük, érdeklődjön az időpontfoglaláskor.' },
    { question: 'Első alkalommal mi történik?', answer: 'Az első vizit egy átfogó állapotfelmérés: panoráma röntgen, szájvizsgálat, és egy részletes kezelési terv elkészítése. Így pontosan tudja, milyen kezelésekre van szükség, mennyibe kerülnek, és mennyi ideig tartanak.' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
function OpeningSoonBanner() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 text-gray-900 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 relative">
        <div className="flex items-center gap-3 text-center flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t(locale, 'Hamarosan', 'Coming Soon', 'Čoskoro')}
          </span>
          <span className="font-extrabold text-sm md:text-base">
            {t(locale,
              'Budapesti rendelőnk hamarosan nyit. Coming soon...',
              'Our Budapest clinic is coming soon...',
              'Naša budapeštianska ordinácia sa čoskoro otvorí. Coming soon...'
            )}
          </span>
          <span className="text-amber-900/70 text-sm hidden sm:inline">
            {t(locale,
              'Addig is szeretettel várjuk esztergomi rendelőnkben.',
              'In the meantime, visit us at our Esztergom clinic.',
              'Medzitým vás srdečne vítame v našej ordinácii v Ostrihome.'
            )}
          </span>
          <Link href={`${p}/esztergom`} className="inline-flex items-center gap-1 bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
            {t(locale, 'Esztergomi rendelő', 'Esztergom Clinic', 'Ordinácia Ostrihom')}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-amber-600/20 transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FloatingCTA() {
  const locale = useLocale();
  const router = useRouter();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bookingHref = `${p}/idopont`;

  useEffect(() => {
    router.prefetch(bookingHref);
  }, [bookingHref, router]);

  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.15 }} className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      <a href="tel:+36705646837" className="group flex items-center gap-2 bg-white text-sky-700 pl-4 pr-5 py-3 rounded-full shadow-2xl border border-sky-100 hover:bg-sky-50 transition-all">
        <Phone className="w-5 h-5" />
        <span className="font-bold text-sm hidden sm:inline">{t(locale, 'Hívjon most', 'Call now', 'Zavolajte nám')}</span>
      </a>
      <Link
        href={bookingHref}
        prefetch
        onMouseEnter={() => router.prefetch(bookingHref)}
        onTouchStart={() => router.prefetch(bookingHref)}
        className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-4 rounded-full shadow-[0_8px_40px_rgba(2,132,199,0.4)] hover:scale-105 hover:shadow-[0_8px_50px_rgba(2,132,199,0.6)] active:scale-95 transition-all"
      >
        <Calendar className="w-5 h-5" />
        <span className="font-bold">{t(locale, 'Időpontfoglalás', 'Book Appointment', 'Rezervácia termínu')}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

function HeroSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const heroImage = useSanityImage('budapest');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative mt-24 h-[90svh] min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-950">
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0 will-change-transform">
        {heroImage && <img src={heroImage} alt="Crown Dental Budapest – Római Part" fetchPriority="high" className="w-full h-[120%] object-cover opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30" />
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-white to-transparent z-10" />
      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <motion.div style={{ y: textY, opacity }} className="relative z-20 container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-sky-300 text-sm font-bold tracking-wider uppercase mb-8">
              <MapPin className="w-4 h-4" />
              {t(locale, 'Budapest · Római Part', 'Budapest · Római Part', 'Budapešť · Rímska časť')}
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight">
              {t(locale, 'Fogászat,', 'Dentistry,', 'Stomatológia,')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                {t(locale, 'újragondolva.', 'reimagined.', 'nanovo.')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-xl font-light">
              {t(locale,
                'Saját fogtechnikai labor. 30 év tapasztalat. A legmodernebb technológia –',
                'In-house dental lab. 30 years of experience. The latest technology —',
                'Vlastné zubnotechnické laboratórium. 30 rokov skúseností. Najmodernejšie technológie —'
              )}{' '}
              <span className="text-gray-200 font-semibold">
                {t(locale,
                  'hamarosan Budapest szívében is. Coming soon...',
                  'coming soon to the heart of Budapest.',
                  'čoskoro aj v centre Budapešti. Coming soon...'
                )}
              </span>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-col sm:flex-row gap-4">
            <Link href={`${p}/idopont`}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white text-lg font-bold rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.4)] transition-all">
                <Calendar className="w-6 h-6" />
                {t(locale, 'Online Időpontfoglalás', 'Book Online', 'Online rezervácia')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <a href="tel:+36705646837">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-bold rounded-2xl transition-all border border-white/20">
                <Phone className="w-5 h-5" />
                +36 70 564 6837
              </motion.button>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: <Zap className="w-4 h-4" />, text: t(locale, 'Saját fogtechnikai labor', 'In-house dental laboratory', 'Vlastné zubnotechnické laboratórium') },
              { icon: <Shield className="w-4 h-4" />, text: t(locale, 'Ingyenes parkoló', 'Free parking', 'Bezplatné parkovanie') },
              { icon: <Clock className="w-4 h-4" />, text: t(locale, 'H-P 8:00–20:00', 'Mon–Fri 8:00–20:00', 'Po–Pia 8:00–20:00') },
            ].map((chip, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-md shadow-lg shadow-black/10">
                <span className="text-sky-200">{chip.icon}</span>
                <span>{chip.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">{t(locale, 'Görgessen lejjebb', 'Scroll down', 'Posúňte nadol')}</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function ComingSoonNotice() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 via-white to-slate-100 p-8 md:p-12 overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gray-300/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-slate-300/20 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-bold uppercase tracking-wider mb-5">
                    <Clock className="w-4 h-4" />
                    {t(locale, 'Coming soon...', 'Coming soon...', 'Coming soon...')}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
                    {t(locale, 'Budapesti rendelőnk', 'Our Budapest clinic', 'Naša budapeštianska ordinácia')}<br />
                    <span className="text-gray-600">{t(locale, 'Coming soon...', 'Coming soon...', 'Coming soon...')}</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t(locale,
                      'A Római Parton épülő új rendelőnk előkészítés alatt áll, pontos nyitási dátumot még nem hirdetünk. Addig is teljes körű fogászati ellátással, saját laborral és 30 év tapasztalatával várjuk Önt ',
                      'Our new clinic on the Danube waterfront is being prepared, and we are not announcing an exact opening date yet. In the meantime, we welcome you with full dental care, an in-house lab, and 30 years of experience at our ',
                      'Naša nová ordinácia na nábreží Dunaja je v príprave a presný dátum otvorenia zatiaľ neoznamujeme. Medzitým vás vítame s kompletnou stomatologickou starostlivosťou, vlastným laboratóriom a 30-ročnými skúsenosťami v našej '
                    )}
                    <span className="font-bold">{t(locale, 'esztergomi rendelőnkben', 'Esztergom clinic', 'ordinácii v Ostrihome')}</span>
                    {t(locale, ' – mindössze 50 perc Budapestről!', ' — just 50 minutes from Budapest!', ' — len 50 minút od Budapešti!')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`${p}/esztergom`}>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-md">
                        <MapPin className="w-4 h-4" />
                        {t(locale, 'Esztergomi rendelőnk', 'Our Esztergom Clinic', 'Ordinácia Ostrihom')}
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <a href="tel:+36705646837">
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl transition-all border border-gray-200 shadow-sm">
                        <Phone className="w-4 h-4" />
                        +36 70 564 6837
                      </motion.button>
                    </a>
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

function AICalculatorBanner() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bgImage = useTreatmentImage('fokep');
  return (
    <section className="relative py-20 overflow-hidden bg-gray-950">
      {bgImage && <img src={bgImage} alt="AI Calculator" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 border border-white/20 backdrop-blur-sm rounded-full text-cyan-200 text-sm font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" />
              {t(locale, 'AI-alapú eszköz', 'AI-powered tool', 'AI nástroj')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {t(locale, 'Sokallja a máshol kapott', 'Think you\'ve been quoted', 'Zdá sa vám ponuka inej')}{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200">
                {t(locale, 'árajánlatot?', 'too much?', 'kliniky príliš vysoká?')}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-sky-100/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t(locale,
                'Töltse fel bármely fogászat árajánlatát, és mesterséges intelligenciánk azonnal összehasonlítja a Crown Dental áraival. Tudja meg percek alatt, mennyit spórolhat a saját laborunknak köszönhetően!',
                'Upload any dental quote and our AI instantly compares it to Crown Dental\'s prices. Find out in minutes how much you can save thanks to our in-house lab!',
                'Nahrajte akúkoľvek cenovú ponuku a naša AI ju okamžite porovná s cenami Crown Dental. Zistite za pár minút, koľko ušetríte vďaka nášmu vlastnému laboratóriu!'
              )}
            </p>
            <Link href={`${p}/#arajanlat-elemzo`}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all">
                <Sparkles className="w-6 h-6" />
                {t(locale, 'Árajánlat Elemző Indítása', 'Start Quote Analyser', 'Spustiť analýzu cenovej ponuky')}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sky-200/60 text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t(locale, 'Teljesen ingyenes', 'Completely free', 'Úplne zadarmo')}</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t(locale, 'Azonnali eredmény', 'Instant result', 'Okamžitý výsledok')}</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t(locale, 'Adatai biztonságban', 'Your data is secure', 'Vaše údaje sú v bezpečí')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index, large = false }: { service: any; index: number; large?: boolean }) {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const imgUrl = useTreatmentImage(service.slug);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: index * 0.08, duration: 0.5 }} className={large ? 'md:col-span-2 md:row-span-2' : ''}>
      <Link href={`${p}${service.href}`} className={`group relative block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${large ? 'h-full min-h-[400px] md:min-h-[500px]' : 'h-full min-h-[320px]'}`}>
        {imgUrl && (
          <div className="absolute inset-0 z-0">
            <img src={imgUrl} alt={service.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
          </div>
        )}
        {!imgUrl && <div className="absolute inset-0 z-0 bg-gradient-to-br from-sky-50 to-gray-50" />}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${imgUrl ? 'bg-white/15 backdrop-blur-md text-white border border-white/20' : 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white'}`}>{service.icon}</div>
          <h4 className={`text-xl md:text-2xl font-bold mb-2 transition-colors ${imgUrl ? 'text-white' : 'text-gray-900 group-hover:text-sky-600'}`}>{service.title}</h4>
          <p className={`mb-4 leading-relaxed text-sm md:text-base ${imgUrl ? 'text-gray-300' : 'text-gray-500'}`}>{service.description}</p>
          <div className="flex items-center justify-between">
            <span className={`font-extrabold text-lg ${imgUrl ? 'text-sky-300' : 'text-sky-600'}`}>{service.price}</span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1 ${imgUrl ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-600'}`}><ArrowUpRight className="w-5 h-5" /></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ServicesSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const services = getServices(locale);
  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t(locale, 'Szolgáltatásaink', 'Our Services', 'Naše služby')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {t(locale, 'Minden kezelés,', 'Every treatment,', 'Všetky ošetrenia,')}{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{t(locale, 'egy helyen.', 'one place.', 'na jednom mieste.')}</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              {t(locale,
                'A konzultációtól a végleges fogpótlásig – saját laborral, gyorsabban és kedvezőbb áron.',
                'From consultation to final restoration — with our own lab, faster and at a better price.',
                'Od konzultácie po definitívnu náhradu — s vlastným laboratóriom, rýchlejšie a za lepšiu cenu.'
              )}
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          <ServiceCard service={services[0]} index={0} large />
          {services.slice(1).map((service, i) => <ServiceCard key={i} service={service} index={i + 1} />)}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-16">
          <Link href={`${p}/kezelesek`} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg">
            {t(locale, 'Teljes árlista megtekintése', 'View full price list', 'Zobraziť kompletný cenník')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function WhyUsSection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const laborImage = useTreatmentImage('fogtechnika');
  const facts = [
    { value: t(locale, '1994 óta', 'Since 1994', 'Od roku 1994'), label: t(locale, 'esztergomi tapasztalat', 'Esztergom experience', 'skúsenosti z Ostrihomu'), desc: t(locale, 'A budapesti indulás mögött a meglévő szakmai háttér áll.', 'The Budapest launch is backed by the existing Esztergom team.', 'Za otvorením v Budapešti stojí existujúci tím z Ostrihomu.') },
    { value: t(locale, 'Saját labor', 'In-house lab', 'Vlastné laboratórium'), label: t(locale, 'közvetlen együttműködés', 'direct collaboration', 'priama spolupráca'), desc: t(locale, 'Fogorvos és fogtechnikus összehangolt munkája.', 'Coordinated work between dentist and dental technician.', 'Koordinovaná práca zubára a zubného technika.') },
    { value: t(locale, '4 nyelv', '4 languages', '4 jazyky'), label: t(locale, 'érthető tájékoztatás', 'clear information', 'zrozumiteľné informácie'), desc: t(locale, 'Magyar, szlovák, angol és német kommunikáció.', 'Communication in Hungarian, Slovak, English and German.', 'Komunikácia po maďarsky, slovensky, anglicky a nemecky.') },
    { value: t(locale, 'Hamarosan', 'Coming soon', 'Čoskoro'), label: t(locale, 'budapesti rendelő', 'Budapest clinic', 'ambulancia v Budapešti'), desc: t(locale, 'Időpont még nem foglalható; az indulást külön jelezzük.', 'Booking is not open yet; the launch will be announced separately.', 'Rezervácia ešte nie je otvorená; spustenie oznámime samostatne.') },
  ];
  const labFeatures = [
    t(locale, 'CAD/CAM digitális tervezés és gyártás', 'CAD/CAM digital design and manufacturing', 'CAD/CAM digitálny dizajn a výroba'),
    t(locale, 'A kezeléshez igazított gyártás és próba', 'Production and fitting coordinated with the treatment plan', 'Výroba a skúšky koordinované s liečebným plánom'),
    t(locale, 'Javítási és módosítási lehetőség az adott esettől függően', 'Repairs and adjustments where appropriate for the individual case', 'Opravy a úpravy podľa konkrétneho prípadu'),
    t(locale, 'Közvetlen kommunikáció a fogorvos és a fogtechnikus között', 'Direct communication between dentist and dental technician', 'Priama komunikácia medzi zubárom a zubným technikom'),
    t(locale, 'Prémium anyagok: cirkónium, porcelán, PEEK', 'Premium materials: zirconia, porcelain, PEEK', 'Prémiové materiály: zirkón, porcelán, PEEK'),
  ];
  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t(locale, 'Ami számít', 'What matters', 'Na čom záleží')}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">{t(locale, 'Miért a Crown Dental?', 'Why Crown Dental?', 'Prečo Crown Dental?')}</h2>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-20">
          {facts.map((fact) => (
            <div key={fact.value} className="rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-sm">
              <div className="mb-3 text-2xl font-black tracking-tight text-sky-600">{fact.value}</div>
              <div className="mb-2 font-bold text-gray-900">{fact.label}</div>
              <p className="text-sm leading-relaxed text-gray-500">{fact.desc}</p>
            </div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl">
            <div className="grid lg:grid-cols-2 items-center">
              <div className="relative h-[300px] lg:h-[500px]">
                {laborImage && <img src={laborImage} alt="Crown Dental dental lab" loading="lazy" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/60 hidden lg:block" />
              </div>
              <div className="p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 rounded-full text-sky-400 text-sm font-bold mb-6">
                  <Wrench className="w-4 h-4" />
                  {t(locale, 'Saját fogtechnikai labor', 'In-house dental lab', 'Vlastné zubnotechnické laboratórium')}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                  {t(locale, 'A fogorvos és a fogtechnikus közvetlenül együtt dolgozik.', 'Dentists and dental technicians collaborate directly.', 'Zubári a zubní technici spolupracujú priamo.')}
                </h3>
                <ul className="space-y-4 mb-8">
                  {labFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`${p}/kezelesek/fogtechnikai-megoldasok`} className="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors">
                  {t(locale, 'Ismerje meg laborunkat', 'Learn about our lab', 'Spoznajte naše laboratórium')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BeforeAfterBanner() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const esteticImage = useTreatmentImage('esztetikai-fogaszat');
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t(locale, 'Esztétikai fogászat', 'Aesthetic Dentistry', 'Estetická stomatológia')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {t(locale, 'Mosolyának', 'Your smile\'s', 'Najlepšia verzia')}{' '}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                {t(locale, 'legjobb verziója.', 'best version.', 'vášho úsmevu.')}
              </span>
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              {t(locale,
                'Porcelán héjak, kompozit bonding, fogfehérítés – minden, amitől igazán magabiztosan mosolyoghat. Kérjen személyre szabott esztétikai tervet!',
                'Porcelain veneers, composite bonding, teeth whitening — everything to help you smile with true confidence. Request a personalised aesthetic plan!',
                'Porcelánové fazety, kompozitný bonding, bielenie zubov — všetko, vďaka čomu budete sa usmievať s istotou. Požiadajte o osobný estetický plán!'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`${p}/idopont`}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-3 px-6 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-lg">
                  <Calendar className="w-5 h-5" />
                  {t(locale, 'Konzultáció foglalás', 'Book consultation', 'Rezervovať konzultáciu')}
                </motion.button>
              </Link>
              <Link href={`${p}/kezelesek/esztetikai-fogaszat`} className="flex items-center gap-2 px-6 py-4 text-gray-600 hover:text-sky-600 font-bold transition-colors">
                {t(locale, 'Részletek', 'Details', 'Podrobnosti')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              {esteticImage && <img src={esteticImage} alt="Aesthetic Dentistry – Crown Dental" loading="lazy" className="w-full h-[400px] lg:h-[500px] object-cover" />}
            </div>
            <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-sky-600" /></div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{t(locale, 'Saját labor', 'In-house lab', 'Vlastné laboratórium')}</div>
                  <div className="text-gray-500 text-sm">{t(locale, 'közvetlen csapatmunka', 'direct teamwork', 'priama tímová práca')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InlineCalculatorCTA() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const bgImage = useTreatmentImage('fokep');
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-14 overflow-hidden shadow-2xl border border-gray-800">
            {bgImage && <img src={bgImage} alt="AI Calculator" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" />}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 grid md:grid-cols-[1fr,auto] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 rounded-full text-sky-400 text-sm font-bold mb-5">
                  <Sparkles className="w-4 h-4" />
                  {t(locale, 'AI Árajánlat Elemző', 'AI Quote Analyser', 'AI Analyzátor cenovej ponuky')}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                  {t(locale,
                    'Hozza el bármely fogászat ajánlatát – mi megmondjuk, mennyit spórolhat.',
                    'Bring any dental quote — we\'ll tell you exactly how much you can save.',
                    'Prineste akúkoľvek ponuku — povieme vám, koľko ušetríte.'
                  )}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t(locale,
                    'Töltse fel a kapott árajánlatot, és AI-rendszerünk tételes összehasonlítást készít a Crown Dental áraival.',
                    'Upload the quote you received, and our AI system will create an itemised comparison with Crown Dental\'s prices.',
                    'Nahrajte prijatú ponuku a náš AI systém vytvorí podrobné porovnanie s cenami Crown Dental.'
                  )}
                </p>
              </div>
              <Link href={`${p}/#arajanlat-elemzo`}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-3 px-8 py-5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl shadow-lg whitespace-nowrap transition-all">
                  <Sparkles className="w-5 h-5" />
                  {t(locale, 'Elemzés indítása', 'Start analysis', 'Spustiť analýzu')}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {t(locale, 'Készen áll az első lépésre?', 'Ready to take the first step?', 'Ste pripravení urobiť prvý krok?')}
          </h2>
          <p className="text-lg md:text-xl text-sky-100/80 mb-12 max-w-2xl mx-auto font-light">
            {t(locale,
              'Foglaljon időpontot online, vagy hívjon minket – és ismerje meg személyesen a Crown Dental különbséget.',
              'Book an appointment online or give us a call — and experience the Crown Dental difference in person.',
              'Rezervujte si termín online alebo nám zavolajte — a osobne zažite rozdiel Crown Dental.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href={`${p}/idopont`}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-sky-700 font-bold text-lg rounded-2xl shadow-2xl hover:bg-sky-50 transition-all">
                <Calendar className="w-6 h-6" />
                {t(locale, 'Online időpontfoglalás', 'Book online', 'Online rezervácia')}
              </motion.button>
            </Link>
            <a href="tel:+36705646837">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-3 px-10 py-5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-lg rounded-2xl transition-all border border-sky-500/30">
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

function FAQSection() {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = getFaqs(locale);
  return (
    <section className="py-28 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t(locale, 'Gyakori kérdések', 'FAQ', 'Časté otázky')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{t(locale, 'Amit érdemes tudni', 'Good to know', 'Užitočné informácie')}</h2>
            <p className="text-xl text-gray-500 font-light">{t(locale, 'A leggyakoribb kérdések a budapesti rendelőnkről.', 'The most common questions about our Budapest clinic.', 'Najčastejšie otázky o našej budapeštiansej ordinácii.')}</p>
          </motion.div>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className={`rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-sky-200 shadow-lg shadow-sky-100/50 bg-white' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}>
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="flex items-center justify-between w-full p-6 text-left focus:outline-none">
                <span className={`font-bold text-lg pr-4 transition-colors ${openIndex === index ? 'text-sky-700' : 'text-gray-900'}`}>{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                    <div className="px-6 pb-6"><p className="text-gray-600 leading-relaxed text-base md:text-lg border-t border-gray-100 pt-4">{faq.answer}</p></div>
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

function ContactAndMap() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Budapest+Királyok+útja+55';
  return (
    <section className="py-28 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-sky-600 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t(locale, 'Elérhetőség', 'Contact', 'Kontakt')}</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {t(locale, 'Látogasson el', 'Visit us at', 'Navštívte nás na')}<br />
                {t(locale, 'a Római Partra!', 'Római Part!', 'Rímskej časti!')}
              </h2>
              <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                {t(locale,
                  'Csendes, Duna-parti helyszín, modern felszereléssel – kényelmes parkolással és kiváló megközelíthetőséggel.',
                  'A quiet Danube-side location with modern equipment — convenient parking and excellent accessibility.',
                  'Tiché miesto pri Dunaji s moderným vybavením — pohodlné parkovanie a výborná dostupnosť.'
                )}
              </p>
            </motion.div>
            <div className="space-y-6">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group cursor-pointer">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300"><MapPin className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" /></div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t(locale, 'Cím', 'Address', 'Adresa')}</h4>
                  <p className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">1039 Budapest, Királyok útja 55.</p>
                  <span className="inline-flex items-center gap-1 text-sm text-sky-600 font-semibold mt-1 group-hover:underline">{t(locale, 'Útvonaltervezés', 'Get directions', 'Navigovať')} <ArrowUpRight className="w-3.5 h-3.5" /></span>
                </div>
              </a>
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300"><Phone className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" /></div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t(locale, 'Telefon', 'Phone', 'Telefón')}</h4>
                  <a href="tel:+36705646837" className="text-xl font-bold text-gray-900 hover:text-sky-600 transition-colors">+36 70 564 6837</a>
                </div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors duration-300"><Clock className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" /></div>
                <div className="w-full max-w-[300px]">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t(locale, 'Nyitvatartás', 'Opening Hours', 'Otváracie hodiny')}</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">{t(locale, 'Hétfő – Péntek', 'Monday – Friday', 'Pondelok – Piatok')}</span>
                      <span className="font-bold text-gray-900">8:00 – 20:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t(locale, 'Szombat – Vasárnap', 'Saturday – Sunday', 'Sobota – Nedeľa')}</span>
                      <span className="text-gray-400">{t(locale, 'Zárva', 'Closed', 'Zatvorené')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link href={`${p}/idopont`}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-3 px-8 py-5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-lg mt-4">
                <Calendar className="w-5 h-5" />
                {t(locale, 'Időpont foglalása', 'Book appointment', 'Rezervovať termín')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
          <div className="relative h-full min-h-[500px] lg:min-h-[650px]">
            <div className="sticky top-32 h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2693.5!2d19.048!3d47.5697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDM0JzEwLjkiTiAxOcKwMDMnMDEuOCJF!5e0!3m2!1shu!2shu!4v1" width="100%" height="100%" style={{ border: 0, minHeight: '500px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Crown Dental Budapest – Királyok útja 55." className="w-full h-full min-h-[500px] lg:min-h-[650px]" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-full shadow-2xl hover:bg-sky-50 hover:text-sky-600 transition-all transform hover:-translate-y-1 active:scale-95 border border-gray-100">
                  <MapPin className="w-5 h-5" />
                  {t(locale, 'Útvonaltervezés', 'Get directions', 'Navigovať')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BudapestPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden">
      <OpeningSoonBanner />
      <FloatingCTA />
      <HeroSection />
      <ComingSoonNotice />
      <AICalculatorBanner />
      <ServicesSection />
      <WhyUsSection />
      <BeforeAfterBanner />
      <GoogleReviewsCta />
      <InlineCalculatorCTA />
      <CTASection />
      <FAQSection />
    </main>
  );
}
