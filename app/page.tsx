'use client';



import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import Image from 'next/image';

import { motion, AnimatePresence } from 'framer-motion';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import {

  MapPin,

  Phone,

  Mail,

  Clock,

  Award,

  Building2,

  Shield,

  Calendar,

  ArrowRight,

  CheckCircle2,

  Star,

  Heart,

  Upload,

  Search,

  Activity,

  Sparkles,

  Menu,

  X,

  ChevronRight,

  User,

  FileText,

  Loader2,

  Download

} from 'lucide-react';



// ═══════════════════════════════════════════════════════════════════════════

// NAVIGÁCIÓ (Stabil fehér, letisztult menü)

// ═══════════════════════════════════════════════════════════════════════════

function Navigation() {

  const [isOpen, setIsOpen] = useState(false);



  return (

    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">

      <nav className="container mx-auto px-4">

        <div className="flex items-center justify-between h-16 md:h-20">

          <Link href="/" className="flex items-center relative h-full py-1 z-50">

            <Image 

              src="/logo.webp" 

              alt="Crown Dental Logo" 

              width={280} 

              height={80} 

              className="object-contain h-full w-auto drop-shadow-sm" 

              priority 

            />

          </Link>



          <div className="hidden lg:flex items-center gap-6 xl:gap-8">

            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">

              Főoldal

            </Link>

            <Link href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">

              Szolgáltatások & Árak

            </Link>

            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">

              Rólunk

            </Link>

            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">

              Blog

            </Link>

            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">

              Karrier

            </Link>

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

              className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"

            >

              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">

                <Link href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>

                <Link href="/kezelesek" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>

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

    const timer = setInterval(() => {

      setCurrent((prev) => (prev + 1) % slides.length);

    }, 10000);

    return () => clearInterval(timer);

  }, [slides.length]);



  return (

    <section className="relative mt-16 md:mt-20 min-h-[100svh] md:min-h-[600px] md:h-[80svh] w-full overflow-hidden flex items-center justify-center bg-gray-900 pt-12 md:pt-0">

      <AnimatePresence mode="wait">

        <motion.div

          key={current}

          initial={{ opacity: 0, scale: 1.05 }}

          animate={{ opacity: 1, scale: 1 }}

          exit={{ opacity: 0 }}

          transition={{ duration: 1.2, ease: "easeInOut" }}

          className="absolute inset-0 z-0"

        >

          <img src={slides[current].image} alt="Crown Dental Clinic" className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gray-900/60" />

        </motion.div>

      </AnimatePresence>



      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent z-10" />



      <div className="relative z-20 container mx-auto px-4 mt-20 md:mt-10">

        <div className="max-w-3xl">

          <AnimatePresence mode="wait">

            <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, delay: 0.2 }}>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-200 text-xs sm:text-sm font-bold tracking-wide uppercase mb-4 md:mb-6">

                <Sparkles className="w-4 h-4" />

                {slides[current].tag}

              </div>

              

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 md:mb-6 leading-tight whitespace-pre-line drop-shadow-lg">

                {slides[current].title}

              </h1>

              

              <p className="text-lg md:text-2xl text-gray-200 mb-8 md:mb-10 leading-relaxed max-w-2xl font-light">

                {slides[current].subtitle}

              </p>

            </motion.div>

          </AnimatePresence>



          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

            <Link href="/idopont" className="w-full sm:w-auto">

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-sky-600 text-white text-lg font-bold rounded-full shadow-[0_0_40px_rgba(2,132,199,0.5)] transition-all">

                <Calendar className="w-6 h-6" />

                Azonnali Időpontfoglalás

              </motion.button>

            </Link>

            <a href="tel:+36705646837" className="w-full sm:w-auto">

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-white text-sky-700 hover:bg-gray-50 text-lg font-bold rounded-full shadow-xl transition-all border border-gray-100">

                <Phone className="w-5 h-5 text-sky-600" />

                +36 70 564 6837

              </motion.button>

            </a>

          </div>

        </div>

      </div>

    </section>

  );

}



// ═══════════════════════════════════════════════════════════════════════════

// TRUST BADGES

// ═══════════════════════════════════════════════════════════════════════════

function TrustBadges() {

  const badges = [

    { icon: <Award className="w-8 h-8" />, title: '30 Év Tapasztalat', desc: 'Biztos szakmai háttér' },

    { icon: <Building2 className="w-8 h-8" />, title: 'Saját Labor', desc: 'Tökéletes minőség, ellenőrzött folyamatok' },

    { icon: <Shield className="w-8 h-8" />, title: 'Prémium Alapanyagok', desc: 'Csúcsminőség kompromisszumok nélkül' },

    { icon: <Heart className="w-8 h-8" />, title: 'Fájdalommentes', desc: 'Empatikus ellátás' },

  ];



  return (

    <section className="relative bg-white z-20 pb-16 pt-8 -mt-8">

      <div className="container mx-auto px-4">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">

          {badges.map((badge, i) => (

            <motion.div

              key={i}

              initial={{ opacity: 0, y: 20 }}

              whileInView={{ opacity: 1, y: 0 }}

              viewport={{ once: true }}

              transition={{ delay: i * 0.1 }}

              className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"

            >

              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">

                {badge.icon}

              </div>

              <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">{badge.title}</h3>

              <p className="text-gray-500 text-sm">{badge.desc}</p>

            </motion.div>

          ))}

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

    <motion.div

      onViewportEnter={() => {

        let start = 0;

        const duration = 2000;

        const increment = end / (duration / 16);

        const timer = setInterval(() => {

          start += increment;

          if (start >= end) {

            setCount(end);

            clearInterval(timer);

          } else {

            setCount(Math.ceil(start));

          }

        }, 16);

      }}

      viewport={{ once: true, margin: "-100px" }}

      className="text-center p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50"

    >

      <div className="text-5xl md:text-6xl font-extrabold text-sky-600 mb-4 tracking-tight">

        {count.toLocaleString('hu-HU')}{suffix}

      </div>

      <div className="text-lg font-bold text-gray-900 mb-2">{text}</div>

      <p className="text-gray-500 text-sm">{desc}</p>

    </motion.div>

  );

}



function StatsSection() {

  return (

    <section className="py-16 bg-gray-50 border-t border-gray-100">

      <div className="container mx-auto px-4">

        <div className="text-center mb-12">

          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Tények és Számok</h2>

          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">

            Teljesítményeink

          </h3>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto">

            Büszkék vagyunk az elmúlt évtizedek munkájára és a ránk bízott mosolyokra.

          </p>

        </div>



        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">

          <AnimatedCounter end={30} suffix="+" text="Év Tapasztalat" desc="1994 óta a pályán" />

          <AnimatedCounter end={15000} suffix="+" text="Elégedett Páciens" desc="Generációk bizalma" />

          <AnimatedCounter end={40} suffix="%" text="Megtakarítás" desc="Saját laborunknak köszönhetően" />

          <AnimatedCounter end={3} suffix=" nap" text="Korona Elkészítés" desc="Villámgyors, precíz fogpótlás" />

        </div>

      </div>

    </section>

  );

}



// ═══════════════════════════════════════════════════════════════════════════

// PRÉMIUM LOKÁCIÓ VÁLASZTÓ

// ═══════════════════════════════════════════════════════════════════════════

function LocationSelector() {

  return (

    <section className="py-24 bg-white border-t border-gray-100">

      <div className="container mx-auto px-4">

        <div className="text-center mb-12">

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Rendelőink</h2>

          <p className="text-xl text-gray-500">Válassza ki a leginkább megfelelő helyszínt</p>

        </div>



        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

          {/* Esztergom Kártya */}

          <Link href="/esztergom" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer">

            <div className="absolute inset-0">

              <img src="https://images.unsplash.com/photo-1563212035-715a3bc32204?q=80&w=2070&auto=format&fit=crop" alt="Esztergom" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity group-hover:opacity-90" />

            

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">

              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider mb-3">

                <MapPin className="w-5 h-5" /> Komárom-Esztergom

              </div>

              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Esztergomi Rendelő</h3>

              <p className="text-gray-300 text-lg font-medium mb-4">Esztergom, Petőfi Sándor utca 11.</p>

              <p className="text-gray-400 text-base mb-8 max-w-md hidden md:block">30 éves múlt, saját fogtechnikai labor és családias, modern környezet a város szívében.</p>

              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-sky-400 transition-colors">

                Tovább a rendelőhöz <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all"><ArrowRight className="w-5 h-5" /></div>

              </div>

            </div>

          </Link>



          {/* Budapest Kártya */}

          <Link href="/budapest" className="group relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] lg:aspect-video cursor-pointer">

            <div className="absolute inset-0">

              <img src="https://images.unsplash.com/photo-1597818451878-c0b7fb562547?q=80&w=2070&auto=format&fit=crop" alt="Budapest Római Part" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

            </div>

            <div className="absolute top-6 right-6 z-20">

              <span className="px-4 py-2 bg-amber-500 text-white font-bold rounded-full text-sm shadow-lg">Hamarosan Nyitunk!</span>

            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity group-hover:opacity-90" />

            

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">

              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider mb-3">

                <MapPin className="w-5 h-5" /> Főváros - Római Part

              </div>

              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Budapesti Rendelő</h3>

              <p className="text-gray-300 text-lg font-medium mb-4">1039 Budapest, Királyok útja 55.</p>

              <p className="text-gray-400 text-base mb-8 max-w-md hidden md:block">A megszokott esztergomi minőség és árak, kompromisszumok nélkül, hamarosan a Római parton is.</p>

              <div className="inline-flex items-center gap-3 text-white font-bold group-hover:text-amber-400 transition-colors">

                Részletek megtekintése <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all"><ArrowRight className="w-5 h-5" /></div>

              </div>

            </div>

          </Link>

        </div>

      </div>

    </section>

  );

}



// ═══════════════════════════════════════════════════════════════════════════

// AI ÁRAJÁNLAT ELEMZŐ (AKTÍV, MŰKÖDŐ VERZIÓ!)

// ═══════════════════════════════════════════════════════════════════════════

function QuoteAnalyzerSection() {

  const [isDragging, setIsDragging] = useState(false);

  const [step, setStep] = useState(1);

  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  

  const [formData, setFormData] = useState({

    name: '', nickname: '', email: '', phone: '', acceptedTerms: false

  });



  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {

      setFile(e.dataTransfer.files[0]);

      setStep(2);

    }

  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files.length > 0) {

      setFile(e.target.files[0]);

      setStep(2);

    }

  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });

  };



  const analyzeQuote = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!file || !formData.acceptedTerms) return;



    setIsLoading(true);

    setStep(3);



    try {

      const data = new FormData();

      data.append('file', file);

      data.append('name', formData.name);

      data.append('nickname', formData.nickname);

      data.append('email', formData.email);

      data.append('phone', formData.phone);



      const res = await fetch('/api/analyze-quote', {

        method: 'POST',

        body: data,

      });

      

      const responseData = await res.json();

      

      if (responseData.success) {

        setResult(responseData.result);

        setStep(4);

      } else {

        alert("Hiba történt az elemzés során: " + (responseData.error || "Ismeretlen hiba"));

        setStep(2);

      }

    } catch (error) {

      console.error("Hálózati hiba:", error);

      alert("Hálózati hiba történt a kommunikáció során.");

      setStep(2);

    } finally {

      setIsLoading(false);

    }

  };



  const downloadPDF = () => {

    if (!result) return;

    const doc = new jsPDF();

    

    doc.setFontSize(22);

    doc.setTextColor(2, 132, 199);

    doc.text("Crown Dental - AI Arajanlat Elemzes", 14, 20);

    

    doc.setFontSize(12);

    doc.setTextColor(100, 100, 100);

    doc.text(`Paciens neve: ${formData.name}`, 14, 30);

    doc.text(`Datum: ${new Date().toLocaleDateString('hu-HU')}`, 14, 36);



    const tableColumn = ["Kezeles megnevezese", "Masik rendelo", "Crown Dental"];

    const tableRows = result.items.map((item: any) => [

      item.name,

      `${item.competitorPrice.toLocaleString('hu-HU')} Ft`,

      `${item.ourPrice.toLocaleString('hu-HU')} Ft`

    ]);



    autoTable(doc, {

      head: [tableColumn],

      body: tableRows,

      startY: 45,

      theme: 'grid',

      headStyles: { fillColor: [2, 132, 199] }

    });



    const finalY = (doc as any).lastAutoTable.finalY || 45;

    doc.setFontSize(14);

    doc.setTextColor(0, 0, 0);

    doc.text(`Eredeti ajanlat osszege: ${result.competitorTotal.toLocaleString('hu-HU')} Ft`, 14, finalY + 15);

    doc.text(`Crown Dental ajanlat: ${result.ourTotal.toLocaleString('hu-HU')} Ft`, 14, finalY + 25);

    

    doc.setFontSize(16);

    doc.setTextColor(22, 163, 74);

    doc.text(`On megtakaritasa: ${result.savings.toLocaleString('hu-HU')} Ft!`, 14, finalY + 40);



    doc.save("Crown_Dental_Arajanlat.pdf");

  };



  return (

    <section id="arajanlat-elemzo" className="py-24 relative overflow-hidden bg-gray-900">

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />



      <div className="relative z-10 container mx-auto px-4">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase mb-6">

              <Sparkles className="w-4 h-4" /> AI Ár-kalkulátor

            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">

              Sokallja az árajánlatot amit egy <span className="text-sky-400">másik rendelőben kapott?</span>

            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">

              Töltse fel a meglévő árajánlatát (kép vagy PDF formátumban). Rendszerünk azonnal kielemzi, és megmutatja, <strong>mennyit spórolhat</strong> saját laborunkkal!

            </p>

            <div className="flex gap-4 items-center mt-8">

              <div className="flex -space-x-4">

                {[1, 2, 3, 4].map((i) => (

                  <div key={i} className="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-white font-bold">

                    <User className="w-5 h-5 text-gray-400" />

                  </div>

                ))}

              </div>

              <p className="text-gray-400 text-sm">Több mint <span className="text-white font-bold">500+</span> páciens spórolt velünk.</p>

            </div>

          </div>



          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative min-h-[450px] flex flex-col">

              <AnimatePresence mode="wait">

                

                {step === 1 && (

                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center flex-1 flex flex-col justify-center">

                    <div 

                      className={`border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-50 scale-105' : 'border-gray-300 hover:border-sky-400 hover:bg-gray-50'}`}

                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}

                    >

                      <Upload className={`w-16 h-16 mx-auto mb-6 ${isDragging ? 'text-sky-500' : 'text-gray-400'}`} />

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Húzza ide az árajánlatot</h3>

                      <p className="text-gray-500 mb-6 text-sm">vagy kattintson a fájl kiválasztásához (Kép vagy PDF)</p>

                      <label className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block">

                        Fájl Kiválasztása

                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileSelect} />

                      </label>

                    </div>

                  </motion.div>

                )}



                {step === 2 && (

                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-10">

                    <div className="flex items-center gap-4 mb-6 bg-sky-50 p-4 rounded-xl border border-sky-100">

                      <FileText className="w-8 h-8 text-sky-600 flex-shrink-0" />

                      <div className="overflow-hidden flex-1">

                        <p className="font-bold text-gray-900 text-sm">Feltöltött fájl:</p>

                        <p className="text-sky-700 font-medium truncate text-sm">{file?.name}</p>

                      </div>

                      <button onClick={() => setStep(1)} className="text-sm text-red-500 hover:text-red-700 font-bold whitespace-nowrap">Mégse</button>

                    </div>



                    <form onSubmit={analyzeQuote} className="space-y-4">

                      <h3 className="text-lg font-bold text-gray-900 mb-4">Hova küldhetjük a részletes eredményt?</h3>

                      

                      <div className="grid grid-cols-2 gap-4">

                        <div>

                          <label className="block text-xs font-bold text-gray-700 mb-1">Teljes Név *</label>

                          <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm" />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-700 mb-1">Megszólítás (opcionális)</label>

                          <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="Pl. Mari" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm" />

                        </div>

                      </div>



                      <div className="grid grid-cols-2 gap-4">

                        <div>

                          <label className="block text-xs font-bold text-gray-700 mb-1">Email cím *</label>

                          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm" />

                        </div>

                        <div>

                          <label className="block text-xs font-bold text-gray-700 mb-1">Telefonszám *</label>

                          <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+36..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-600 outline-none text-sm" />

                        </div>

                      </div>



                      <label className="flex items-start gap-3 mt-4 cursor-pointer">

                        <input required type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleInputChange} className="mt-1 w-5 h-5 text-sky-600 rounded" />

                        <span className="text-xs text-gray-600 leading-relaxed">

                          Elfogadom az <Link href="/aszf" className="text-sky-600 hover:underline">ÁSZF</Link>-et és az Adatkezelési Tájékoztatót, és kérem az árajánlatot emailben.

                        </span>

                      </label>



                      <button type="submit" disabled={!formData.acceptedTerms} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2">

                        <Sparkles className="w-5 h-5" /> Elemzés Indítása

                      </button>

                    </form>

                  </motion.div>

                )}



                {step === 3 && (

                  <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-16 text-center flex flex-col items-center justify-center h-full flex-1">

                    <div className="relative w-24 h-24 mx-auto mb-8">

                      <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>

                      <div className="absolute inset-0 border-4 border-sky-600 rounded-full border-t-transparent animate-spin"></div>

                      <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-sky-600 animate-pulse" />

                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Elemzés folyamatban...</h3>

                    <p className="text-gray-500">Tételek felismerése és párosítása a Crown Dental áraival.</p>

                  </motion.div>

                )}



                {step === 4 && result && (

                  <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white flex flex-col h-full">

                    <div className="bg-gradient-to-br from-sky-500 to-sky-700 p-8 text-center text-white relative overflow-hidden">

                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300 drop-shadow-md" />

                      <h3 className="text-2xl font-bold mb-1">Kész az elemzés, {formData.nickname || formData.name.split(' ')[0]}!</h3>

                      <p className="text-sky-100 mb-3 text-sm">Saját laborunkkal ennyit spórolhat nálunk:</p>

                      <div className="text-5xl font-extrabold drop-shadow-md text-green-300">

                        {result.savings.toLocaleString('hu-HU')} Ft

                      </div>

                    </div>

                    

                    <div className="p-6 flex-1 flex flex-col">

                      <div className="max-h-[180px] overflow-y-auto mb-6 pr-2">

                        <table className="w-full text-left text-sm">

                          <thead>

                            <tr className="border-b border-gray-200 text-gray-500">

                              <th className="pb-2 font-medium">Kezelés</th>

                              <th className="pb-2 font-medium text-right">Eredeti</th>

                              <th className="pb-2 font-bold text-sky-600 text-right">Crown</th>

                            </tr>

                          </thead>

                          <tbody>

                            {result.items.map((item: any, i: number) => (

                              <tr key={i} className="border-b border-gray-50">

                                <td className="py-2 font-medium text-gray-900">{item.name}</td>

                                <td className="py-2 text-right text-gray-400 line-through">{item.competitorPrice.toLocaleString('hu-HU')}</td>

                                <td className="py-2 text-right font-bold text-sky-600">{item.ourPrice.toLocaleString('hu-HU')}</td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>



                      <div className="mt-auto space-y-3">

                        <button onClick={downloadPDF} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">

                          <Download className="w-5 h-5" /> PDF Letöltés

                        </button>

                        <Link href="/idopont" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all">

                          <Calendar className="w-5 h-5" /> Ingyenes Konzultáció Kérése

                        </Link>

                        <p className="text-center text-xs text-gray-400">A részletes ajánlatot elküldtük a(z) {formData.email} címre is!</p>

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



// ═══════════════════════════════════════════════════════════════════════════

// KIEMELT ÁRAK / KEZELÉSEK

// ═══════════════════════════════════════════════════════════════════════════

function FeaturedPricesSection() {

  const cards = [

    {

      title: "Diagnosztika & Alap",

      subtitle: "Vizsgálat, röntgen, tömések",

      price: "10.000 Ft-tól",

      icon: <Search className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1598256989800-fea5c5ce8720?q=80&w=800&auto=format&fit=crop"

    },

    {

      title: "Gyökérkezelés",

      subtitle: "Fájdalommentes fogmegmentés",

      price: "10.000 Ft-tól",

      icon: <Activity className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop"

    },

    {

      title: "Esztétika & Prevenció",

      subtitle: "Fogkőeltávolítás, fogfehérítés",

      price: "15.000 Ft-tól",

      icon: <Sparkles className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?q=80&w=800&auto=format&fit=crop"

    },

    {

      title: "Fogpótlás & Koronák",

      subtitle: "Cirkónium, fémkerámia, fogsorok",

      price: "42.000 Ft-tól",

      icon: <CheckCircle2 className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?q=80&w=800&auto=format&fit=crop"

    },

    {

      title: "Sebészet & Implantáció",

      subtitle: "Húzások, prémium implantátumok",

      price: "55.000 Ft-tól",

      icon: <Shield className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"

    },

    {

      title: "Gyermek & Fogszabályozás",

      subtitle: "Rögzített és kivehető készülékek",

      price: "15.000 Ft-tól",

      icon: <Heart className="w-6 h-6" />,

      image: "https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=800&auto=format&fit=crop"

    }

  ];



  return (

    <section className="py-24 bg-gray-50 border-t border-gray-100">

      <div className="container mx-auto px-4">

        <div className="text-center mb-16">

          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Kiemelt Ajánlataink</h2>

          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Prémium Kezelések</h3>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Saját laborunknak köszönhetően kimagasló minőséget nyújtunk kompromisszumok nélkül.</p>

        </div>



        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {cards.map((card, idx) => (

            <div 

              key={idx} 

              className="group [perspective:1000px] h-[400px] w-full cursor-pointer focus:outline-none"

              tabIndex={0}

            >

              <div className="relative w-full h-full duration-700 transition-transform [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] focus-within:[transform:rotateY(180deg)]">

                

                <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden group/front">

                  <div className="relative h-[55%] w-full overflow-hidden">

                    <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/front:scale-110" />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />

                    <div className="absolute bottom-4 left-6 right-4 flex items-center gap-3">

                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-sm">

                        {card.icon}

                      </div>

                      <h4 className="text-xl font-bold text-white">{card.title}</h4>

                    </div>

                  </div>

                  <div className="p-6 flex flex-col flex-1 text-center justify-center">

                    <p className="text-gray-500 mb-3">{card.subtitle}</p>

                    <div className="mt-auto">

                      <span className="text-2xl font-extrabold text-sky-600">{card.price}</span>

                    </div>

                  </div>

                </div>



                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-sky-600 to-sky-800 rounded-3xl p-8 shadow-2xl flex items-center justify-center">

                  <Link href="/idopont" className="flex flex-col items-center justify-center w-full h-full text-white group/link">

                    <Calendar className="w-16 h-16 mb-6 opacity-80 group-hover/link:scale-110 group-hover/link:opacity-100 transition-all duration-300" />

                    <span className="text-2xl font-bold text-center mb-2">Konzultáció Foglalása</span>

                    <span className="text-sky-200 text-sm font-medium">Kattintson ide az időponthoz</span>

                  </Link>

                </div>



              </div>

            </div>

          ))}

        </div>

        

        <div className="text-center mt-16">

           <Link href="/kezelesek" className="inline-flex items-center gap-2 text-gray-500 hover:text-sky-600 font-bold transition-colors">

             Teljes árlista megtekintése <ArrowRight className="w-4 h-4" />

           </Link>

        </div>

      </div>

    </section>

  );

}



// ═══════════════════════════════════════════════════════════════════════════

// VÉLEMÉNYEK - GÖRDÜLŐ MARQUEE 

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

    { name: 'Farkas Zita', rating: 5, text: '10 éve hűséges páciensük vagyok. Bárkinek, aki fogorvost keres, csak ajánlani tudom őket!', date: '2025. május' },

  ];



  const extendedReviews = [...reviews, ...reviews, ...reviews];



  return (

    <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">

      <div className="container mx-auto px-4">

        <div className="text-center mb-16">

          <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3">Vélemények</h2>

          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">

            Pácienseink mondták

          </h3>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-amber-400 bg-gray-50 inline-flex px-4 sm:px-6 py-2 rounded-full shadow-sm border border-gray-100 whitespace-nowrap">

            <div className="flex items-center">

              {[...Array(5)].map((_, i) => (

                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />

              ))}

            </div>

            <span className="text-gray-900 font-bold ml-1 sm:ml-2 text-base sm:text-lg">4.8 / 5</span>

            <span className="text-gray-500 font-medium ml-1 text-xs sm:text-base">(320+ értékelés)</span>

          </div>

        </div>

      </div>



      <style dangerouslySetInnerHTML={{__html: `

        @keyframes marquee {

          0% { transform: translateX(0); }

          100% { transform: translateX(-33.3333%); }

        }

        .animate-marquee {

          display: flex;

          width: max-content;

          animation: marquee 50s linear infinite;

        }

        .animate-marquee:hover {

          animation-play-state: paused;

        }

      `}} />



      <div className="relative w-full">

        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />

        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />



        <div className="animate-marquee gap-6 px-6">

          {extendedReviews.map((review, i) => (

            <div

              key={i}

              className="w-[350px] md:w-[400px] p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 flex-shrink-0 cursor-default"

            >

              <div className="flex items-center gap-1 mb-6">

                {[...Array(5)].map((_, j) => (

                  <Star key={j} className={`w-5 h-5 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />

                ))}

              </div>

              <p className="text-gray-600 mb-8 italic leading-relaxed min-h-[80px]">"{review.text}"</p>

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



// ═══════════════════════════════════════════════════════════════════════════

// PRÉMIUM 2026 FOOTER (Frissített cím és kattintható link)

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

            <p className="text-gray-400 mb-6 leading-relaxed">

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

              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>

              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>

              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>

              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>

              <li><Link href="/kezelesek" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>

            </ul>

          </div>



          <div>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>

            <ul className="space-y-5">

              <li className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-sky-500 mt-1" />

                <div>

                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>

                  <a href="https://share.google/UV0bxLOGoyQdgH826" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">

                    2500 Esztergom, Petőfi Sándor utca 11.

                  </a>

                </div>

              </li>

              <li className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-amber-500 mt-1" />

                <div>

                  <span className="block text-white font-semibold">Budapesti Rendelő</span>

                  <a href="https://maps.google.com/?q=1039+Budapest+Királyok+útja+55" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">

                    1039 Budapest, Királyok útja 55.

                  </a>

                </div>

              </li>

              <li className="flex items-center gap-3">

                <Phone className="w-5 h-5 text-sky-500" />

                <a href="tel:+36705646837" className="hover:text-white transition-colors">+36 70 564 6837</a>

              </li>

              <li className="flex items-center gap-3">

                <Mail className="w-5 h-5 text-sky-500" />

                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors">info@crowndental.hu</a>

              </li>

            </ul>

          </div>



          <div>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>

            <ul className="space-y-4">

              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors">Általános Szerződési Feltételek</Link></li>

              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors">Adatkezelési Tájékoztató (GDPR)</Link></li>

              <li><Link href="/impresszum" className="text-gray-400 hover:text-white transition-colors">Impresszum</Link></li>

              <li><Link href="/cookie-tajekoztato" className="text-gray-400 hover:text-white transition-colors">Sütik (Cookie) kezelése</Link></li>

            </ul>

          </div>



        </div>



        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">

          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>

          <p className="flex items-center gap-2">

            Készítette: 

            <span 

              className="text-white text-2xl tracking-wider ml-1" 

              style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}

            >

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
