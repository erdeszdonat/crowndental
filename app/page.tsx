'use client';

// app/page.tsx
// Crown Dental Főoldal - AI Árajánlat Elemzővel
// Ez a "Killer Feature" - a páciens feltölti a konkurens árajánlatát

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  TrendingDown,
  Phone,
  Calendar,
  Building2,
  Award,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  X,
  Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
interface QuoteItem {
  treatment: string;
  competitorPrice: number;
  crownDentalPrice: number;
}

interface AnalysisResult {
  competitorName: string;
  items: QuoteItem[];
  totalCompetitor: number;
  totalCrownDental: number;
  savings: number;
  savingsPercent: number;
}

function QuoteAnalyzer() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);

    // Szimulált AI elemzés - a valóságban API hívás lenne
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Demo eredmény
    setResult({
      competitorName: 'Budapest Dental Center',
      items: [
        { treatment: 'Fogimplantátum (Straumann)', competitorPrice: 450000, crownDentalPrice: 320000 },
        { treatment: 'Cirkónium korona', competitorPrice: 180000, crownDentalPrice: 120000 },
        { treatment: 'CT felvétel', competitorPrice: 25000, crownDentalPrice: 15000 },
        { treatment: 'Konzultáció', competitorPrice: 15000, crownDentalPrice: 0 },
      ],
      totalCompetitor: 670000,
      totalCrownDental: 455000,
      savings: 215000,
      savingsPercent: 32,
    });

    setIsAnalyzing(false);
  };

  const resetAnalyzer = () => {
    setFile(null);
    setResult(null);
    setShowCallbackForm(false);
  };

  return (
    <section id="arajanlat-elemzo" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI-alapú árajánlat-elemző
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Van már árajánlata máshonnan?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Töltse fel, és azonnal megmutatjuk, mennyit spórolhat nálunk a{' '}
            <span className="text-amber-400 font-semibold">saját fogtechnikai laborunk</span> miatt.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Feltöltés állapot */}
            {!file && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-amber-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Húzza ide az árajánlatot
                </h3>
                <p className="text-slate-400 mb-6">
                  vagy kattintson a böngészéshez
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    JPG / PNG
                  </span>
                </div>

                <p className="mt-6 text-xs text-slate-600">
                  Az adatait bizalmasan kezeljük. Az árajánlatot csak az elemzés idejére tároljuk.
                </p>
              </motion.div>
            )}

            {/* Elemzés alatt */}
            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 rounded-3xl p-12 text-center border border-slate-700"
              >
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Elemezzük az árajánlatot...</h3>
                <p className="text-slate-400">
                  AI rendszerünk azonosítja a kezeléseket és összehasonlítja az árainkkal.
                </p>
              </motion.div>
            )}

            {/* Eredmény */}
            {result && !showCallbackForm && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 rounded-3xl border border-slate-700 overflow-hidden"
              >
                {/* Fejléc a megtakarítással */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
                  <div className="text-green-200 mb-2">Megtakarítás nálunk</div>
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                    {result.savings.toLocaleString('hu-HU')} Ft
                  </div>
                  <div className="text-green-200">
                    Ez <span className="font-bold text-white">{result.savingsPercent}%</span> megtakarítás!
                  </div>
                </div>

                {/* Összehasonlító táblázat */}
                <div className="p-8">
                  <div className="mb-6">
                    <span className="text-sm text-slate-500">Elemzett árajánlat:</span>
                    <span className="ml-2 text-white font-medium">{result.competitorName}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-sm text-slate-500 border-b border-slate-700">
                          <th className="text-left py-3 pr-4">Kezelés</th>
                          <th className="text-right py-3 px-4">Konkurens ár</th>
                          <th className="text-right py-3 pl-4">Crown Dental ár</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, i) => (
                          <tr key={i} className="border-b border-slate-800">
                            <td className="py-4 pr-4 text-white">{item.treatment}</td>
                            <td className="py-4 px-4 text-right text-slate-400">
                              {item.competitorPrice.toLocaleString('hu-HU')} Ft
                            </td>
                            <td className="py-4 pl-4 text-right text-green-400 font-medium">
                              {item.crownDentalPrice === 0
                                ? 'Ingyenes'
                                : `${item.crownDentalPrice.toLocaleString('hu-HU')} Ft`}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="py-4 pr-4 text-white">Összesen</td>
                          <td className="py-4 px-4 text-right text-slate-300 line-through">
                            {result.totalCompetitor.toLocaleString('hu-HU')} Ft
                          </td>
                          <td className="py-4 pl-4 text-right text-green-400 text-xl">
                            {result.totalCrownDental.toLocaleString('hu-HU')} Ft
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* CTA gombok */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowCallbackForm(true)}
                      className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      Visszahívást kérek
                    </button>
                    <Link
                      href="/idopont"
                      className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all"
                    >
                      <Calendar className="w-5 h-5" />
                      Időpontot foglalok
                    </Link>
                  </div>

                  <button
                    onClick={resetAnalyzer}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    Másik árajánlat feltöltése
                  </button>
                </div>
              </motion.div>
            )}

            {/* Visszahívás form */}
            {showCallbackForm && (
              <motion.div
                key="callback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 rounded-3xl p-8 border border-slate-700"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Visszahívást kérek</h3>
                    <p className="text-slate-400">24 órán belül felhívjuk az elemzés részleteivel.</p>
                  </div>
                  <button
                    onClick={() => setShowCallbackForm(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Név</label>
                    <input
                      type="text"
                      placeholder="Kovács János"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Telefonszám</label>
                    <input
                      type="tel"
                      placeholder="+36 30 123 4567"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Melyik lokáció?</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input type="radio" name="location" value="esztergom" className="sr-only" />
                        <MapPin className="w-5 h-5 text-amber-400" />
                        <span className="text-white">Esztergom</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input type="radio" name="location" value="budapest" className="sr-only" />
                        <MapPin className="w-5 h-5 text-amber-400" />
                        <span className="text-white">Budapest</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all"
                  >
                    Visszahívást kérek
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOKÁCIÓ KÁRTYÁK
// ═══════════════════════════════════════════════════════════════════════════
function LocationCards() {
  const locations = [
    {
      slug: 'esztergom',
      name: 'Esztergom',
      address: 'Hősök tere 5.',
      description: '30 éve a város fogászata. Saját labor, ingyenes parkolás.',
      badge: '30 év tapasztalat',
      image: '/images/locations/esztergom.jpg',
    },
    {
      slug: 'budapest',
      name: 'Budapest',
      address: 'Hamarosan',
      description: 'Új rendelőnk a fővárosban. Ugyanaz a minőség, esztergomi áron.',
      badge: 'Hamarosan nyitunk!',
      isNew: true,
      image: '/images/locations/budapest.jpg',
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Rendelőink</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Válassza az Önhöz közelebb eső lokációt – mindkét helyen ugyanaz a prémium minőség várja.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/${loc.slug}`}
                className="group block relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all"
              >
                {/* Kép */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={loc.image}
                    alt={loc.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                  {/* Badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                      loc.isNew ? 'bg-amber-500 text-slate-900' : 'bg-white/10 text-white backdrop-blur-sm'
                    }`}
                  >
                    {loc.badge}
                  </div>
                </div>

                {/* Tartalom */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{loc.address}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{loc.name}</h3>
                  <p className="text-slate-400 mb-4">{loc.description}</p>
                  <span className="inline-flex items-center gap-2 text-amber-400 font-medium group-hover:gap-3 transition-all">
                    Részletek
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST SECTION - Miért válasszon minket
// ═══════════════════════════════════════════════════════════════════════════
function TrustSection() {
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Saját Fogtechnikai Labor',
      description:
        'Nincs közvetítő, nincs felesleges költség. A korona 3 nap alatt kész, nem 2-3 hét alatt.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: '30+ Év Tapasztalat',
      description: '1994 óta Esztergom fogászata. Több ezer elégedett páciens, generációk bizalma.',
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: 'Középkategóriás Árak',
      description:
        'Prémium japán és koreai anyagok, de a saját labor miatt akár 40%-kal olcsóbbak vagyunk.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Garancia Mindenre',
      description: 'Implantátumra életre szóló, koronára 5 év garancia. Ha bármi baj, ingyen javítjuk.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            A Crown Dental Különbség
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Miért választanak minket évtizedek óta a páciensek?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all"
            >
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Háttér gradiens */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-8"
          >
            <span className="flex items-center gap-2 text-amber-400">
              <Award className="w-4 h-4" />
              30+ év tapasztalat
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span className="flex items-center gap-2 text-white">
              <Building2 className="w-4 h-4" />
              Saját labor
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          >
            Prémium Fogászat,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Elérhető Áron
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Saját fogtechnikai laborunk miatt akár <strong className="text-amber-400">40%-kal olcsóbbak</strong> vagyunk 
            a budapesti klinikáknál – ugyanolyan prémium japán és koreai anyagokkal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a
              href="#arajanlat-elemzo"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
            >
              <Upload className="w-6 h-6" />
              Árajánlat összehasonlítás
            </a>
            <Link
              href="/idopont"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/20 transition-all"
            >
              <Calendar className="w-6 h-6" />
              Időpont foglalása
            </Link>
          </motion.div>

          {/* Lokációk */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-6 text-slate-400"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Esztergom – 30 éve szolgáljuk</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Budapest – Hamarosan nyitunk!</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#arajanlat-elemzo" className="text-white/30 hover:text-white/50 transition-colors">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐOLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <QuoteAnalyzer />
      <TrustSection />
      <LocationCards />
    </main>
  );
}
