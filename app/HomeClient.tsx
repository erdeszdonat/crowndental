'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Calendar, ArrowRight, CheckCircle2, Upload, 
  User, Menu, X, ChevronRight, FileText, Loader2, Download, 
  Sparkles, Shield, Star, Activity, Heart, Crown, Baby, Scissors
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-transparent py-2'}`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image src="/logo.webp" alt="Crown Dental Logo" width={240} height={70} className="object-contain h-14 w-auto drop-shadow-sm" priority />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-sky-600 transition-colors">Főoldal</Link>
            <Link href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Szolgáltatások & Árak</Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</Link>
            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 ring-4 ring-sky-100">
              <Calendar className="w-5 h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-white hover:bg-gray-100 transition-colors shadow-sm">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40"
            >
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                <Link href="/blog" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Blog</Link>
                
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
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Prémium Fogászat <br className="hidden md:block"/> <span className="text-sky-600">Saját Laborral</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Esztergomi és Budapesti rendelőinkben fájdalommentes kezelésekkel várjuk. A saját fogtechnikai laborunknak köszönhetően időt és pénzt spórol Önnek.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/idopont" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-600/30">
            <Calendar className="w-5 h-5" /> Időpontfoglalás
          </Link>
          <a href="#arajanlat-elemzo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-700 font-bold rounded-full hover:bg-gray-50 transition-all shadow-sm border border-gray-200">
            <Upload className="w-5 h-5" /> Árajánlat Elemzés
          </a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF GENERÁLÓ – Böngésző natív print-to-PDF (0 külső dependency)
// Tökéletes ékezetek, elegáns design, aláírás mezők, lábléc
// ═══════════════════════════════════════════════════════════════════════════
function buildPrintableHtml(
  result: any,
  patientName: string,
  phone: string,
  email: string,
  nickname: string
): string {
  const today = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fmt = (n: number) => {
    const s = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s + ' Ft';
  };

  const rows = result.items.map((item: any, i: number) => {
    const diff = item.competitorPrice - item.ourPrice;
    return `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
        <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#1e293b">${item.name}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:#9ca3af;text-decoration:line-through">${fmt(item.competitorPrice)}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:#0369a1;font-weight:600">${fmt(item.ourPrice)}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;color:${diff > 0 ? '#059669' : '#6b7280'};font-weight:600">${diff > 0 ? '-' + fmt(diff) : '—'}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>Crown Dental Árajánlat – ${nickname || patientName}</title>
<style>
  @page {
    size: A4;
    margin: 16mm 18mm 18mm 18mm;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
    color: #1e293b;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
</style>
</head>
<body>

<div style="max-width:700px;margin:0 auto">

  <!-- ═══ FEJLÉC ═══ -->
  <table style="width:100%;margin-bottom:6px">
    <tr>
      <td style="vertical-align:middle">
        <div style="font-size:26px;font-weight:800;color:#0369a1;letter-spacing:-0.5px">CROWN DENTAL</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:1px;letter-spacing:1.2px;text-transform:uppercase">Praxis és Labor · Esztergom · Budapest</div>
      </td>
      <td style="text-align:right;vertical-align:middle;font-size:11px;color:#6b7280;line-height:1.6">
        ${today}<br>Tel: +36 70 564 6837
      </td>
    </tr>
  </table>

  <!-- Gradient vonal -->
  <div style="height:3px;background:linear-gradient(90deg,#0284c7,#38bdf8,#7dd3fc);border-radius:2px;margin-bottom:22px"></div>

  <!-- ═══ CÍM ═══ -->
  <div style="font-size:19px;font-weight:700;color:#0f172a;margin-bottom:5px">Személyre szabott árajánlat</div>
  <div style="font-size:12px;color:#6b7280;margin-bottom:20px;line-height:1.5">
    Készült: <strong style="color:#1e293b">${nickname || patientName}</strong> részére &nbsp;|&nbsp; Tel: ${phone} &nbsp;|&nbsp; E-mail: ${email}
  </div>

  <!-- ═══ MEGTAKARÍTÁS DOBOZ ═══ -->
  <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:18px;text-align:center;margin-bottom:22px">
    <div style="font-size:11px;color:#0369a1;text-transform:uppercase;letter-spacing:1.2px;font-weight:600">Az Ön megtakarítása</div>
    <div style="font-size:32px;font-weight:800;color:#059669;margin-top:4px">${fmt(result.savings)}</div>
  </div>

  <!-- ═══ TÁBLÁZAT ═══ -->
  <div style="font-size:13px;font-weight:700;color:#0369a1;margin-bottom:8px">Kezelések részletezése</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:8px">
    <thead>
      <tr style="background:#f1f5f9">
        <th style="padding:9px 12px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #0284c7;font-weight:700">Kezelés</th>
        <th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #0284c7;font-weight:700">Másik árajánlat</th>
        <th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #0284c7;font-weight:700">Crown Dental</th>
        <th style="padding:9px 12px;text-align:right;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #0284c7;font-weight:700">Megtakarítás</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr style="background:#f0f9ff">
        <td style="padding:10px 12px;font-weight:700;font-size:13px;border-top:2px solid #0284c7;color:#1e293b">Összesen</td>
        <td style="padding:10px 12px;font-weight:700;font-size:13px;text-align:right;color:#9ca3af;border-top:2px solid #0284c7;text-decoration:line-through">${fmt(result.competitorTotal)}</td>
        <td style="padding:10px 12px;font-weight:700;font-size:13px;text-align:right;color:#0284c7;border-top:2px solid #0284c7">${fmt(result.ourTotal)}</td>
        <td style="padding:10px 12px;font-weight:700;font-size:13px;text-align:right;color:#059669;border-top:2px solid #0284c7">-${fmt(result.savings)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ═══ ALÁÍRÁS MEZŐK ═══ -->
  <div style="margin-top:50px;border-top:1px solid #e5e7eb;padding-top:12px">
    <div style="font-size:13px;font-weight:700;color:#0369a1;margin-bottom:40px">Aláírások</div>
    <table style="width:100%">
      <tr>
        <td style="width:44%;text-align:center;vertical-align:bottom">
          <div style="border-bottom:1.5px solid #94a3b8;margin-bottom:6px;height:1px"></div>
          <div style="font-size:11px;color:#6b7280">Páciens aláírása</div>
        </td>
        <td style="width:12%"></td>
        <td style="width:44%;text-align:center;vertical-align:bottom">
          <div style="border-bottom:1.5px solid #94a3b8;margin-bottom:6px;height:1px"></div>
          <div style="font-size:11px;color:#6b7280">Kezelőorvos aláírása és pecsétje</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- ═══ LÁBLÉC ═══ -->
  <div style="margin-top:40px;border-top:1px solid #e5e7eb;padding-top:12px">
    <p style="font-size:9px;color:#9ca3af;text-align:center;line-height:1.6;margin-bottom:5px">
      Ez egy automatikusan generált árajánlat. A dokumentum kizárólag akkor válik hitelessé,
      amikor a páciens kinyomtatva magával hozza rendelőnkbe, és a kezelőorvos aláírásával, pecsétjével hitelesíti.
    </p>
    <p style="font-size:9px;color:#9ca3af;text-align:center;line-height:1.6;margin-bottom:8px">
      Az árajánlat a kiállítás napjától számított 30 napig érvényes. Az árak az ÁFÁ-t tartalmazzák.
      A végleges kezelési terv és összeg a szájüregi vizsgálat után kerül meghatározásra.
    </p>
    <p style="font-size:10px;color:#0284c7;text-align:center;font-weight:700">
      Crown Dental – Saját labor, kiemelkedő minőség, elérhető árak.
    </p>
  </div>

</div>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ÁRAJÁNLAT ELEMZŐ
// ═══════════════════════════════════════════════════════════════════════════
function QuoteAnalyzerSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    acceptedTerms: false
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

  // ═══════════════════════════════════════════════════════════════
  // PDF LETÖLTÉS – Böngésző print-to-PDF (iframe)
  // NINCS külső dependency, tökéletes ékezetek, mindig működik
  // ═══════════════════════════════════════════════════════════════
  const downloadPDF = () => {
    if (!result) return;

    const htmlContent = buildPrintableHtml(
      result,
      formData.name,
      formData.phone,
      formData.email,
      formData.nickname
    );

    // Rejtett iframe létrehozása, HTML betöltése, nyomtatás
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Várunk a renderelésre, majd nyomtatás (= PDF mentés)
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Takarítás a nyomtatás után
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 300);
      };
    }
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
                
                {/* LÉPÉS 1: FELTÖLTÉS */}
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

                {/* LÉPÉS 2: ŰRLAP */}
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

                {/* LÉPÉS 3: TÖLTÉS */}
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

                {/* LÉPÉS 4: EREDMÉNY */}
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
                        <button 
                          onClick={downloadPDF}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                          <Download className="w-5 h-5" /> PDF Letöltés (Nyomtatás)
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
// PRÉMIUM FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <Image src="/logo.webp" alt="Logo" width={160} height={50} className="object-contain" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light">Prémium fogászat Esztergomban és hamarosan Budapesten is. Saját laborunkkal spórolunk Önnek.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>
                  <span className="text-gray-400">2500 Esztergom, Petőfi Sándor u. 11.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="block text-white font-semibold">Budapesti Rendelő</span>
                  <span className="text-gray-400">1039 Budapest, Királyok útja 55.</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <a href="tel:+36705646837" className="hover:text-white font-bold">+36 70 564 6837</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/aszf" className="hover:text-white">ÁSZF</Link></li>
              <li><Link href="/adatkezeles" className="hover:text-white">Adatkezelés</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-800 text-xs text-gray-500">© 2026 Crown Dental Praxis és Labor Fogászati Kft.</div>
      </div>
    </footer>
  );
}

export default function HomeClient() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900">
      <Navigation />
      <main>
        <Hero />
        <QuoteAnalyzerSection />
      </main>
      <Footer />
    </div>
  );
}
