'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Mail, Clock, Award, Building2, Shield, Calendar,
  ArrowRight, CheckCircle2, Star, Heart, Upload, Search, Activity,
  Sparkles, Menu, X, ChevronRight, User, FileText, Loader2, Download
} from 'lucide-react';

// --- PDF SEGÉDFÜGGVÉNYEK ÉS KONSTANSOK ---
const primaryColor = [2, 132, 199]; // Crown Blue
const accentColor = [22, 163, 74];  // Success Green
const secondaryColor = [100, 100, 100];

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Stabil fehér, letisztult menü)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center relative h-full py-1 z-50">
            <img 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              className="object-contain h-10 md:h-12 w-auto drop-shadow-sm" 
            />
          </a>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm xl:text-base">
            <a href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</a>
            <a href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Szolgáltatások & Árak</a>
            <a href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</a>
            <a href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</a>
            <a href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</a>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <a href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </a>
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
              className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3">
                <a href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50">Főoldal</a>
                <a href="/kezelesek" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50">Szolgáltatások & Árak</a>
                <a href="/rolunk" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50">Rólunk</a>
                <a href="/blog" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50">Blog</a>
                <a href="/karrier" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50">Karrier</a>
                <div className="pt-4 border-t border-gray-100">
                   <a href="tel:+36705646837" className="flex justify-center items-center gap-2 w-full py-4 bg-gray-50 text-sky-700 font-bold rounded-xl mb-3">
                    <Phone className="w-5 h-5" /> +36 70 564 6837
                  </a>
                  <a href="/idopont" className="flex justify-center items-center gap-2 w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md">
                    <Calendar className="w-5 h-5" /> Időpont Foglalás
                  </a>
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
// HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop",
      tag: "Prémium Minőség, Megfizethető Áron",
      title: "Prémium Fogászat\nKompromisszumok Nélkül",
      subtitle: "Fedezze fel a fájdalommentes fogászati kezeléseket klinikánkon. Saját fogtechnikai laborunkkal időt és pénzt spórolunk Önnek."
    },
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop",
      tag: "Saját Fogtechnikai Labor",
      title: "Maximális Minőség\nKözvetítői Díjak Nélkül",
      subtitle: "Mivel saját laborral dolgozunk, a fogpótlások és koronák gyorsabban és szigorú ellenőrzés mellett készülnek el."
    },
    {
      image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop",
      tag: "30 Év Tapasztalat",
      title: "Új Mosoly,\nÚj Önbizalom",
      subtitle: "Több mint 15.000 sikeres kezelés bizonyítja szakértelmünket. Bízza ránk mosolyát, és mi visszaadjuk a rágás szabadságát!"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative mt-16 md:mt-20 h-[80svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
          <img src={slides[current].image} alt="Hero" className="w-full h-full object-cover opacity-50" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-xs sm:text-sm font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" /> {slides[current].tag}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight whitespace-pre-line drop-shadow-lg">{slides[current].title}</h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl font-light">{slides[current].subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/idopont" className="px-8 py-4 bg-sky-600 text-white font-bold rounded-full shadow-2xl hover:bg-sky-700 transition-all text-center">Időpontfoglalás</a>
              <a href="tel:+36705646837" className="px-8 py-4 bg-white text-sky-700 font-bold rounded-full shadow-xl hover:bg-gray-50 transition-all text-center border border-gray-100">+36 70 564 6837</a>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BADGES
// ═══════════════════════════════════════════════════════════════════════════
function TrustBadges() {
  const badges = [
    { icon: <Award className="w-8 h-8" />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },
    { icon: <Building2 className="w-8 h-8" />, title: 'Saját Labor', desc: 'Tökéletes minőség' },
    { icon: <Shield className="w-8 h-8" />, title: 'Prémium Anyagok', desc: 'Csúcsminőség' },
    { icon: <Heart className="w-8 h-8" />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },
  ];
  return (
    <section className="relative bg-white z-20 pb-16 pt-8 -mt-8">
      <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {badges.map((b, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 text-center group hover:-translate-y-1 transition-all">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-sky-600 group-hover:text-white transition-all">{b.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
            <p className="text-gray-500 text-xs">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOKÁCIÓ VÁLASZTÓ
// ═══════════════════════════════════════════════════════════════════════════
function LocationSelector() {
  return (
    <section className="py-24 bg-white border-t">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Rendelőink</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
        <a href="/esztergom" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-video">
          <img src="https://images.unsplash.com/photo-1563212035-715a3bc32204?q=80&w=1000&auto=format" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">
            <h3 className="text-3xl font-bold">Esztergom</h3>
            <p className="opacity-80">Petőfi Sándor utca 11.</p>
          </div>
        </a>
        <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-400">Budapest</h3>
            <p className="text-sky-600 font-bold">Hamarosan Nyitunk!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMÁLT TELJESÍTMÉNY SZÁMLÁLÓ
// ═══════════════════════════════════════════════════════════════════════════
function AnimatedCounter({ end, suffix = "", text, desc }: { end: number, suffix?: string, text: string, desc: string }) {
  const [count, setCount] = useState(0);
  return (
    <motion.div onViewportEnter={() => {
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else { setCount(Math.ceil(start)); }
        }, 16);
      }}
      viewport={{ once: true }}
      className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-50"
    >
      <div className="text-5xl font-extrabold text-sky-600 mb-2">{count.toLocaleString('hu-HU')}{suffix}</div>
      <div className="font-bold text-gray-900">{text}</div>
      <p className="text-gray-500 text-sm mt-1">{desc}</p>
    </motion.div>
  );
}

function StatsSection() {
  return (
    <section className="py-16 bg-gray-50 border-t">
      <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatedCounter end={30} suffix="+" text="Év Tapasztalat" desc="1994 óta" />
        <AnimatedCounter end={15000} suffix="+" text="Elégedett Páciens" desc="Bizalom" />
        <AnimatedCounter end={40} suffix="%" text="Megtakarítás" desc="Saját labor" />
        <AnimatedCounter end={3} suffix=" nap" text="Elkészülés" desc="Villámgyors" />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ (PRÉMIUM PDF FUNKCIÓVAL)
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [libsReady, setLibsReady] = useState(false);
  const [formData, setFormData] = useState({ name: '', nickname: '', email: '', phone: '', acceptedTerms: false });

  useEffect(() => {
    const init = async () => {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.autotable.min.js');
      setLibsReady(true);
    };
    init();
  }, []);

  const handleInputChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const analyzeQuote = async (e: any) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true); setStep(3);
    const data = new FormData();
    data.append('file', file); data.append('name', formData.name); data.append('email', formData.email); data.append('phone', formData.phone);
    try {
      const res = await fetch('/api/analyze-quote', { method: 'POST', body: data });
      const resData = await res.json();
      if (resData.success) { setResult(resData.result); setStep(4); }
      else { alert(resData.error || "Hiba"); setStep(2); }
    } catch (err) { setStep(2); } finally { setIsLoading(false); }
  };

  const downloadPDF = () => {
    if (!result || !libsReady) return;
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    // Ékezet javító a standard PDF betűtípusokhoz (ő -> o, ű -> u)
    const f = (s: string) => s.replace(/[őŐ]/g, 'o').replace(/[űŰ]/g, 'u').replace(/[íÍ]/g, 'i');

    const img = new (window as any).Image();
    img.src = '/logo.webp';
    img.onload = () => {
      // Fejléc és Logó
      doc.addImage(img, 'WEBP', 14, 15, 45, 12);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(14, 32, 196, 32);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("AI ARAJANLAT ELEMZES", 196, 25, { align: 'right' });

      // Adatok
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont("helvetica", "normal");
      doc.text(`Paciens neve: ${f(formData.name)}`, 14, 42);
      doc.text(`Datum: ${new Date().toLocaleDateString('hu-HU')}`, 14, 48);
      doc.text("Klinika: Crown Dental Praxis es Labor", 196, 42, { align: 'right' });

      // Táblázat
      const tableRows = result.items.map((it: any) => [
        f(it.name),
        `${it.competitorPrice.toLocaleString('hu-HU')} Ft`,
        `${it.ourPrice.toLocaleString('hu-HU')} Ft`
      ]);

      (doc as any).autoTable({
        head: [["Kezeles megnevezese", "Masik rendelo", "Crown Dental"]],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      // Összesítés
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Eredeti osszeg: ${result.competitorTotal.toLocaleString('hu-HU')} Ft`, 196, finalY, { align: 'right' });
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Crown Dental osszeg: ${result.ourTotal.toLocaleString('hu-HU')} Ft`, 196, finalY + 10, { align: 'right' });
      doc.setFontSize(16);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`VARHATO MEGTAKARITAS: ${result.savings.toLocaleString('hu-HU')} Ft!`, 196, finalY + 22, { align: 'right' });

      // Aláírások
      const sigY = finalY + 50;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(14, sigY, 80, sigY);
      doc.line(130, sigY, 196, sigY);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Paciens alairasa", 14, sigY + 5);
      doc.text("Kezeloorvos alairasa", 130, sigY + 5);

      // Disclaimer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const disclaimer = "Ez egy automatikusan generalt ajanlat, amely akkor valik hitelesse, ha a rendelonkben az orvos alairasaval hitelesiti.";
      doc.text(f(disclaimer), 105, 285, { align: 'center' });

      doc.save(`Crown_Dental_Ajanlat_${formData.name.replace(/\s/g, '_')}.pdf`);
    };
  };

  return (
    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden bg-gray-900">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6">
            <Sparkles className="w-4 h-4" /> AI Ár-kalkulátor
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Sokallja az árajánlatot amit egy <span className="text-sky-400">másik rendelőben kapott?</span></h2>
          <p className="text-xl text-gray-300 mb-8 font-light">Töltse fel a meglévő árajánlatát (kép vagy PDF formátumban). Rendszerünk azonnal kielemzi, és megmutatja, <strong>mennyit spórolhat</strong> saját laborunkkal!</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl min-h-[450px] flex flex-col justify-center text-gray-900">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{opacity:0}} animate={{opacity:1}} className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-6 text-sky-600" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Árajánlat feltöltése</h3>
                <label className="cursor-pointer bg-sky-600 text-white font-bold py-4 px-10 rounded-full hover:bg-sky-700 transition-all inline-block shadow-lg">
                  Fájl kiválasztása
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => {if(e.target.files?.[0]) {setFile(e.target.files[0]); setStep(2);}}} />
                </label>
              </motion.div>
            )}
            {step === 2 && (
              <motion.form key="s2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} onSubmit={analyzeQuote} className="space-y-4">
                <div className="bg-sky-50 p-4 rounded-xl flex items-center justify-between"><span className="text-sky-800 font-bold truncate max-w-[200px]">{file?.name}</span><button type="button" onClick={()=>setStep(1)} className="text-red-500 font-bold">Törlés</button></div>
                <input required name="name" placeholder="Teljes Név *" className="w-full p-3 border rounded-xl" onChange={handleInputChange} />
                <div className="grid grid-cols-2 gap-4">
                  <input required name="email" type="email" placeholder="Email *" className="w-full p-3 border rounded-xl" onChange={handleInputChange} />
                  <input required name="phone" placeholder="Telefon *" className="w-full p-3 border rounded-xl" onChange={handleInputChange} />
                </div>
                <label className="flex items-start gap-2 text-xs text-gray-500"><input type="checkbox" required name="acceptedTerms" onChange={handleInputChange} /><span>Elfogadom az ÁSZF-et és kérem az elemzést.</span></label>
                <button type="submit" className="w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-lg">ELEMZÉS INDÍTÁSA</button>
              </motion.form>
            )}
            {step === 3 && (
              <motion.div key="s3" className="text-center"><Loader2 className="w-16 h-16 text-sky-600 animate-spin mx-auto mb-4" /><h3 className="text-xl font-bold">AI Elemzés folyamatban...</h3></motion.div>
            )}
            {step === 4 && result && (
              <motion.div key="s4" className="text-center flex flex-col h-full">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Kész az elemzés!</h3>
                <div className="text-4xl font-black text-sky-600 mb-8">{result.savings.toLocaleString('hu-HU')} Ft megtakarítás</div>
                <div className="space-y-3">
                  <button onClick={downloadPDF} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> PRÉMIUM PDF LETÖLTÉSE
                  </button>
                  <a href="/idopont" className="w-full py-4 border-2 border-sky-600 text-sky-600 font-bold rounded-xl block">IDŐPONTOT KÉREK</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KIEMELT ÁRAK
// ═══════════════════════════════════════════════════════════════════════════
function FeaturedPricesSection() {
  const cards = [
    { title: "Diagnosztika", price: "10.000 Ft-tól", image: "https://images.unsplash.com/photo-1598256989800-fea5c5ce8720?q=80&w=800&auto=format" },
    { title: "Fogpótlás", price: "42.000 Ft-tól", image: "https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?q=80&w=800&auto=format" },
    { title: "Implantáció", price: "190.000 Ft-tól", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format" }
  ];
  return (
    <section className="py-24 bg-gray-50 border-t">
      <div className="container mx-auto px-4 text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900">Kiemelt Ajánlataink</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <img src={c.image} className="h-48 w-full object-cover" />
            <div className="p-8 text-center">
              <h4 className="text-xl font-bold mb-2">{c.title}</h4>
              <div className="text-2xl font-black text-sky-600">{c.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VÉLEMÉNYEK
// ═══════════════════════════════════════════════════════════════════════════
function ReviewsSection() {
  const reviews = [
    { name: 'Kovács Mária', rating: 5, text: 'Már 10 éve járok ide, a legjobb döntés volt. Kedvesek és precízek.' },
    { name: 'Nagy József', rating: 4, text: 'Nagyon profik, az implantátumom tökéletes lett. Csak ajánlani tudom.' },
    { name: 'Szabó Anna', rating: 5, text: 'A korona 3 nap alatt elkészült a saját labor miatt. Fantasztikus!' }
  ];
  return (
    <section className="py-24 bg-white border-t overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h3 className="text-4xl font-extrabold text-gray-900">Pácienseink mondták</h3>
      </div>
      <div className="flex gap-6 justify-center flex-wrap px-4">
        {reviews.map((r, i) => (
          <div key={i} className="w-full max-w-sm p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex text-amber-400 mb-4">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}</div>
            <p className="text-gray-600 italic mb-6">"{r.text}"</p>
            <div className="font-bold text-gray-900">{r.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM 2026 FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4 text-center">
        <img src="/logo.webp" alt="Logo" className="h-10 mx-auto mb-8 grayscale brightness-200" />
        <p className="mb-8">© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
        <div className="flex justify-center gap-6 font-bold text-sm">
          <a href="/aszf" className="hover:text-white">ÁSZF</a>
          <a href="/adatkezeles" className="hover:text-white">Adatkezelés</a>
          <a href="tel:+36705646837" className="text-sky-500">+36 70 564 6837</a>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FŐ OLDAL EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      <main>
        <HeroSlider />
        <TrustBadges />
        <LocationSelector />
        <StatsSection />
        <QuoteAnalyzerSection />
        <FeaturedPricesSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
