'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
  Smile,
  Building2,
  Crown,
  Zap,
  Eye,
  Microscope,
  Wrench,
  Baby,
  Search,
  Activity
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SANITY KLIENS (Helyi inicializálás a biztos működésért)
// ═══════════════════════════════════════════════════════════════════════════
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// KEZELÉS KÁRTYÁK ALAPADATAI
// ═══════════════════════════════════════════════════════════════════════════
const treatmentCards = [
  {
    id: 'implantatum',
    title: 'Implantátum',
    description: 'Élethű fogpótlás titánium implantátummal, akár egy nap alatt.',
    icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/implantatum',
    color: 'from-rose-500 to-orange-500',
  },
  {
    id: 'fogszabalyozas',
    title: 'Fogszabályozás',
    description: 'Rögzített és kivehető készülékek gyerekeknek és felnőtteknek.',
    icon: <Smile className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/fogszabalyozas',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'koronak-hidak',
    title: 'Koronák és Hidak',
    description: 'Fémkerámia és cirkónium koronák prémium minőségben, saját laborból.',
    icon: <Crown className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/koronak-es-hidak',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'fogfeherites',
    title: 'Fogfehérítés',
    description: 'Professzionális fehérítés otthoni vagy rendelői módszerrel.',
    icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/fogfeherites',
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'fogsor',
    title: 'Fogsorok',
    description: 'Kivehető és rögzített fogsorok, precíz illeszkedés, alábélelés.',
    icon: <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/fogsor',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    description: 'Fájdalommentes gépi gyökértömés a legmodernebb technikával.',
    icon: <Activity className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/gyokerkezeles',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet',
    description: 'Bölcsességfog eltávolítás és gyökércsúcs rezekció szakértelemmel.',
    icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/szajsebeszet',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'allapotfelmeres',
    title: 'Állapotfelmérés',
    description: 'Részletes konzultáció, panoráma röntgen és személyre szabott kezelési terv.',
    icon: <Search className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/allapotfelmeres',
    color: 'from-green-500 to-lime-500',
  },
  {
    id: 'esztetikai-fogaszat',
    title: 'Esztétikai Fogászat',
    description: 'Kerámia héjak és láthatatlan tömések a tökéletes mosolyért.',
    icon: <Eye className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/esztetikai-fogaszat',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'foghuzas',
    title: 'Foghúzás',
    description: 'Kíméletes fogeltávolítás gyors gyógyulással.',
    icon: <Heart className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/foghuzas',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'gockutatas',
    title: 'Góckutatás',
    description: 'Rejtett gyulladások és gócok felderítése modern 3D CT-vel.',
    icon: <Microscope className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/gockutatas',
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: 'gyerekfogaszat',
    title: 'Gyermekfogászat',
    description: 'Tejfog kezelések és barázdazárás barátságos, türelmes környezetben.',
    icon: <Baby className="w-6 h-6 sm:w-7 sm:h-7" />,
    href: '/kezelesek/gyerekfogaszat',
    color: 'from-pink-400 to-rose-400',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA ADATOK
// ═══════════════════════════════════════════════════════════════════════════
const priceCategories = [
  {
    id: 'diagnosztika',
    title: 'Diagnosztika és Alapkezelések',
    items: [
      { name: 'Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv', price: '10.000 Ft' },
      { name: 'Tömések', price: '30.000 - 35.000 Ft' },
      { name: 'Foghúzás', price: '25.000 - 35.000 Ft' },
      { name: 'Röntgen felvétel (kisröntgen / egy fogról)', price: '5.000 Ft' },
      { name: 'Panoráma röntgen', price: '6.000 Ft' },
    ],
  },
  {
    id: 'gyokerkezeles',
    title: 'Gyökérkezelés',
    items: [
      { name: 'Gyökértömés (Egy gyökerű)', price: '25.000 Ft' },
      { name: 'Gyökértömés (Két gyökerű)', price: '30.000 Ft' },
      { name: 'Gyökértömés (Három gyökerű)', price: '33.000 Ft' },
      { name: 'Gyökértömés eltávolítása', price: '20.000 Ft' },
      { name: 'Gyökérkezelés alkalmanként', price: '10.000 Ft' },
    ],
  },
  {
    id: 'esztetika',
    title: 'Fogmegőrzés és Esztétika',
    items: [
      { name: 'Fogkőeltávolítás (állcsontonként)', price: '15.000 Ft' },
      { name: 'Fogfehérítés szilikon sínnel (otthoni) / fogívenként', price: '30.000 Ft' },
      { name: 'Fogfehérítés rendelői (lámpás) / fogívenként', price: '45.000 Ft', highlight: true },
    ],
  },
  {
    id: 'fogpotlas',
    title: 'Fogpótlások és Koronák',
    items: [
      { name: 'Ideiglenes korona (rövidtávú, 1-2 hétre)', price: '6.000 Ft' },
      { name: 'Ideiglenes korona (hosszútávú, max. 1 évre)', price: '15.000 Ft' },
      { name: 'Fémkerámia korona', price: '42.000 Ft' },
      { name: 'Cirkónium korona (fémmentes)', price: '55.000 Ft', highlight: true },
      { name: 'Egyéni fogszínek készítése (foganként)', price: '15.000 Ft' },
      { name: 'Kivehető fogsor egy állcsontra (kompozit)', price: '110.000 Ft' },
      { name: 'Fémlemezes fogsor egy állcsontra', price: '150.000 Ft' },
      { name: 'Régi híd eltávolítása (pillér foganként)', price: '12.000 Ft' },
      { name: 'Fogsor alábélelés', price: '25.000 Ft' },
    ],
  },
  {
    id: 'szajsebeszet',
    title: 'Szájsebészet és Implantáció',
    items: [
      { name: 'Foghúzás műtéttel', price: '55.000 Ft' },
      { name: 'Bölcsességfog eltávolítása', price: '55.000 Ft' },
      { name: 'Gyökércsúcs rezekció', price: '55.000 Ft' },
      { name: 'DIO Implantátum', price: '240.000 Ft', highlight: true },
      { name: 'ALPHA BIO Implantátum', price: '180.000 Ft' },
      { name: 'Csontpótlás', price: '190.000 Ft' },
    ],
  },
  {
    id: 'gyermek',
    title: 'Gyermekfogászat és Fogszabályozás',
    items: [
      { name: 'Tömés tejfogakba', price: '15.000 Ft' },
      { name: 'Barázda zárás', price: '15.000 Ft' },
      { name: 'Rögzített készülékek', price: '190.000 - 285.000 Ft', highlight: true },
      { name: 'Kivehető készülékek', price: '60.000 - 90.000 Ft' },
      { name: 'Rögzített készülék aktiválása', price: '10.000 - 15.000 Ft' },
      { name: 'Kivehető készülék aktiválása', price: '5.000 - 8.000 Ft' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Pontosan a Főoldallal megegyező, letisztult)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-white border-b border-gray-100 py-2'}`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center relative h-full py-1 z-50">
            <Image src="/logo.webp" alt="Crown Dental Logo" width={280} height={80} className="object-contain h-full w-auto" priority />
          </Link>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</Link>
            {/* Itt már nincs legördülő, csak a gyönyörű kék háttér */}
            <Link href="/kezelesek" className="font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-full transition-colors">Szolgáltatások & Árak</Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</Link>
            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</Link>
            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</Link>
          </div>
          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-[72px] md:top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                <Link href="/blog" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/karrier" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Karrier</Link>
                
                <div className="pt-6 pb-2 border-t border-gray-100 mt-4">
                  <a href="tel:+36705646837" className="flex justify-center items-center gap-2 w-full py-4 bg-gray-50 text-sky-700 font-bold rounded-xl mb-3">
                    <Phone className="w-5 h-5" /> +36 70 564 6837
                  </a>
                  <Link href="/idopont" className="flex justify-center items-center gap-2 w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}>
                    <Calendar className="w-5 h-5" /> Időpont Foglalás
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-gray-50">
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-100/60 to-violet-100/40 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/50 to-rose-100/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-lg shadow-sky-100/50 border border-sky-100 rounded-full text-sky-600 text-sm font-bold tracking-wide uppercase mb-8">
            <Building2 className="w-4 h-4" /> Saját labor = Kedvezőbb árak
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Fogászati <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">Kezeléseink</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg sm:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            Válassza ki a kezelést az alábbi kártyákból, vagy görgessen lejjebb a teljes árlistáért. 
            Saját fogtechnikai laborunknak köszönhetően <strong className="text-gray-700">akár 40%-kal kedvezőbb</strong> árakat biztosítunk.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÚJRATERVEZETT: PRÉMIUM KÉPES KÁRTYÁK
// ═══════════════════════════════════════════════════════════════════════════
function TreatmentCard({ treatment, index, imageUrl }: { treatment: typeof treatmentCards[0]; index: number; imageUrl?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.05, duration: 0.4 }}>
      <Link href={treatment.href} className="group block h-[320px] sm:h-[360px]">
        <div className={`relative h-full w-full rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-900/20 ${!imageUrl ? `bg-gradient-to-br ${treatment.color}` : 'bg-gray-900'}`}>
          
          {/* TELJES HÁTTÉRKÉP SÖTÉTÍTŐ GRADIENSSEL */}
          {imageUrl && (
            <>
              <img 
                src={`${imageUrl}?auto=format&w=600`} 
                alt={treatment.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent opacity-90" />
            </>
          )}

          {/* HA NINCS KÉP, AKKOR A SZÍNES HÁTTÉR */}
          {!imageUrl && (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.4)_0%,_transparent_50%)]" />
          )}

          {/* TARTALOM (Mindig fehér, árnyékolt, hogy jól olvasható legyen) */}
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-inner">
              {treatment.icon}
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
              {treatment.title}
            </h3>
            
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 drop-shadow-sm font-light">
              {treatment.description}
            </p>
            
            <div className="flex items-center gap-2 text-sky-400 text-sm sm:text-base font-bold uppercase tracking-wider group-hover:gap-3 transition-all mt-auto">
              <span>Részletek</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}

function TreatmentCardsSection() {
  const [sanityImages, setSanityImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const query = `*[_type == "treatment"]{ "slug": slug.current, "imageUrl": mainImage.asset->url }`;
        const results = await client.fetch(query);
        const imageMap: Record<string, string> = {};
        results.forEach((item: any) => {
          if (item.slug && item.imageUrl) { imageMap[item.slug] = item.imageUrl; }
        });
        setSanityImages(imageMap);
      } catch (error) {
        console.error("Hiba a Sanity képek lekérésekor:", error);
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Itt 1, 2 vagy 3 oszlopos elrendezés lesz, hogy jó nagyok legyenek a képek */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {treatmentCards.map((treatment, index) => (
            <TreatmentCard 
              key={treatment.id} 
              treatment={treatment} 
              index={index} 
              imageUrl={sanityImages[treatment.id]} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÁRLISTA SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function PriceListSection() {
  return (
    <section id="arlista" className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-[100px]" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            Teljes Árlistánk
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-gray-500 text-lg leading-relaxed font-light">
            Transzparens árazás, rejtett költségek nélkül.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {priceCategories.map((category, catIndex) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: catIndex * 0.1 }} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{category.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-5 transition-colors ${item.highlight ? 'bg-gradient-to-r from-sky-50 to-violet-50' : 'bg-white hover:bg-gray-50'}`}>
                    <span className={`text-base sm:text-lg mb-2 sm:mb-0 pr-4 ${item.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold whitespace-nowrap ${item.highlight ? 'bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mt-10 sm:mt-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 sm:p-8 flex gap-4 sm:gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Fontos Tudnivaló</h4>
              <p className="text-gray-600 leading-relaxed text-base">
                Az árak tájékoztató jellegűek. Mivel minden fogazat egyedi, a végleges árat személyes vizsgálat és részletes kezelési terv átadása után határozzuk meg.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA SZEKCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-sky-600 via-sky-500 to-violet-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">Kérdése van az árakkal kapcsolatban?</h2>
        <p className="text-lg sm:text-xl text-sky-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light">Foglaljon időpontot egy személyes állapotfelmérésre, ahol részletes kezelési tervet adunk.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <a href="tel:+36705646837" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-full transition-all border border-white/30 text-base md:text-lg shadow-inner">
            <Phone className="w-5 h-5" /> +36 70 564 6837
          </a>
          <Link href="/idopont" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-sky-700 font-bold rounded-full transition-all shadow-xl shadow-sky-900/20 text-base md:text-lg">
            <Calendar className="w-5 h-5" /> Szakorvosi Konzultáció
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER (Megegyezik a főoldallal)
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base font-light">
              Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül. Kezelések Esztergomban, és hamarosan Budapesten is.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors">
                <span className="font-bold">f</span>
              </a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors">
                <span className="font-bold">in</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-es-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
              <li><Link href="/kezelesek" className="hover:text-sky-400 transition-colors flex items-center gap-2 text-sm sm:text-base font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold text-sm sm:text-base">Esztergomi Rendelő</span>
                  <a href="https://share.google/UV0bxLOGoyQdgH826" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                    2500 Esztergom, Petőfi Sándor utca 11.
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold text-sm sm:text-base">Budapesti Rendelő</span>
                  <a href="https://maps.google.com/?q=1039+Budapest+Királyok+útja+55" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                    1039 Budapest, Királyok útja 55.
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500" />
                <a href="tel:+36705646837" className="hover:text-white transition-colors text-sm sm:text-base font-light">+36 70 564 6837</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sky-500" />
                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors text-sm sm:text-base font-light">info@crowndental.hu</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>
            <ul className="space-y-4">
              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base font-light">Általános Szerződési Feltételek</Link></li>
              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base font-light">Adatkezelési Tájékoztató (GDPR)</Link></li>
              <li><Link href="/impresszum" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base font-light">Impresszum</Link></li>
              <li><Link href="/cookie-tajekoztato" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base font-light">Sütik (Cookie) kezelése</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500 font-light">
          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
          <p className="flex items-center gap-2">
            Készítette: 
            <span className="text-white text-2xl tracking-wider ml-1" style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>
              Crown Dental
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function KezelesekPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TreatmentCardsSection />
      <PriceListSection />
      <CTASection />
      <Footer />
    </main>
  );
}
