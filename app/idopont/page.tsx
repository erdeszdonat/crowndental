'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  User,
  MessageSquare,
  Building2,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGÁCIÓ (Világító "Időpontot kérek" gombbal)
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image 
              src="/logo.webp" 
              alt="Crown Dental Logo" 
              width={220} 
              height={60} 
              className="object-contain h-10 md:h-12 w-auto drop-shadow-sm" 
              priority 
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</Link>
            <Link href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Szolgáltatások & Árak</Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</Link>
            <Link href="/blog" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Blog</Link>
            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</Link>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            {/* AKTÍV "VILÁGÍTÓ" GOMB: ring-4 ring-sky-200 */}
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md transform hover:-translate-y-0.5 text-sm md:text-base ring-4 ring-sky-100 shadow-sky-600/30">
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
                  <Link href="/idopont" className="flex justify-center items-center gap-2 w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md ring-4 ring-sky-100" onClick={() => setIsOpen(false)}>
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
// IDŐPONTFOGLALÓ ŰRLAP (Multi-step)
// ═══════════════════════════════════════════════════════════════════════════

const treatments = [
  "Állapotfelmérés és Konzultáció",
  "Fogimplantátum",
  "Cirkónium vagy Fémkerámia Korona",
  "Fogszabályozás",
  "Esztétikai fogászat (Fehérítés, Fogkő)",
  "Fogsor készítés / Javítás",
  "Szájsebészet / Foghúzás",
  "Gyökérkezelés / Fogtömés",
  "Egyéb / Nem tudom pontosan"
];

function BookingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    city: 'Esztergom',
    name: '',
    nickname: '',
    email: '',
    phone: '',
    treatment: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.treatment) return;

    setIsSubmitting(true);

    // ITT FOGJUK BEKÖTNI AZ API-T (Backend, Resend, Adatbázis)
    // Jelenleg szimuláljuk a hálózati kérést (1.5 mp)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SIKERES FOGLALÁS NÉZET (Modal szerű felület)
  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-16 text-center"
      >
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Köszönjük, {formData.nickname || formData.name.split(' ')[0]}!
        </h2>
        <h3 className="text-xl text-sky-600 font-bold mb-6">Sikeresen fogadtuk a kérését.</h3>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Munkatársaink hamarosan feldolgozzák az adatokat, és <strong>24 órán belül keresni fogjuk a megadott telefonszámon (+{formData.phone})</strong>, hogy egyeztessük a leghamarabbi elérhető időpontot.
        </p>
        <div className="p-6 bg-gray-50 rounded-2xl mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Választott rendelő:</p>
          <p className="font-bold text-gray-900 mb-4">{formData.city}</p>
          
          <p className="text-sm text-gray-500 mb-1">Kezelés:</p>
          <p className="font-bold text-gray-900">{formData.treatment}</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-sky-600 transition-colors">
          Vissza a főoldalra <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* LÉPÉS JELZŐ (Step Indicator) */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${step >= 1 ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <span className={`hidden sm:block font-bold ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Személyes adatok</span>
        </div>
        <div className="w-16 sm:w-24 h-1 mx-4 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full bg-sky-600 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-colors duration-500 ${step === 2 ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          <span className={`hidden sm:block font-bold transition-colors duration-500 ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Kezelés kiválasztása</span>
        </div>
      </div>

      {/* ŰRLAP KONTÉNER */}
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-12">
        <AnimatePresence mode="wait">
          {/* 1. LÉPÉS: SZEMÉLYES ADATOK */}
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleNext}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
                Melyik városban szeretné a kezelést?
              </h2>
              
              {/* Város választó (Radio Cards) */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <label className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${formData.city === 'Esztergom' ? 'border-sky-600 bg-sky-50 shadow-md' : 'border-gray-200 hover:border-sky-300'}`}>
                  <input type="radio" name="city" value="Esztergom" checked={formData.city === 'Esztergom'} onChange={handleInputChange} className="sr-only" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">Esztergom</span>
                    {formData.city === 'Esztergom' && <CheckCircle2 className="w-6 h-6 text-sky-600" />}
                  </div>
                  <p className="text-gray-500 text-sm">Petőfi Sándor utca 11.</p>
                </label>

                <label className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${formData.city === 'Budapest' ? 'border-sky-600 bg-sky-50 shadow-md' : 'border-gray-200 hover:border-sky-300'}`}>
                  <input type="radio" name="city" value="Budapest" checked={formData.city === 'Budapest'} onChange={handleInputChange} className="sr-only" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">Budapest</span>
                    {formData.city === 'Budapest' && <CheckCircle2 className="w-6 h-6 text-sky-600" />}
                  </div>
                  <p className="text-gray-500 text-sm">Királyok útja 55. (Hamarosan)</p>
                </label>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
                Adja meg elérhetőségeit
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teljes Név *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Pl. Kovács Mária" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all outline-none text-gray-900 font-medium" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hogyan szólíthatjuk? (Opcionális)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="Pl. Mari, Marcsi" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all outline-none text-gray-900 font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefonszám *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+36 30 123 4567" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all outline-none text-gray-900 font-medium" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email cím *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="minta@email.hu" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all outline-none text-gray-900 font-medium" />
                  </div>
                </div>
              </div>

              {/* Adatkezelési szöveg, bepipálás nélkül */}
              <div className="mt-8 text-sm text-gray-500">
                Tájékoztatjuk, hogy az űrlap elküldésével és az adataid megadásával Ön hozzájárul a kapcsolattartáshoz. Részletekért kérjük, olvassa el{' '}
                <Link href="/adatkezeles" target="_blank" className="text-sky-600 hover:underline font-bold">Adatkezelési Tájékoztatónkat</Link>.
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-sky-600 transition-colors shadow-lg">
                  Tovább a kezelés választáshoz <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          )}

          {/* 2. LÉPÉS: KEZELÉS KIVÁLASZTÁSA */}
          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                Milyen kezelésre lenne szüksége?
              </h2>
              <p className="text-gray-500 mb-8">Válassza ki a leginkább megfelelőt (később a rendelőben módosítható).</p>
              
              <div className="space-y-3 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {treatments.map((treatment, idx) => (
                  <label 
                    key={idx} 
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.treatment === treatment ? 'border-sky-600 bg-sky-50 shadow-sm' : 'border-gray-100 hover:bg-gray-50 hover:border-sky-200'}`}
                  >
                    <span className={`text-lg font-bold ${formData.treatment === treatment ? 'text-sky-900' : 'text-gray-700'}`}>
                      {treatment}
                    </span>
                    <input 
                      type="radio" 
                      name="treatment" 
                      value={treatment} 
                      onChange={handleInputChange} 
                      className="w-6 h-6 text-sky-600 border-gray-300 focus:ring-sky-600 cursor-pointer"
                      required
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-100">
                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-5 h-5" /> Vissza
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.treatment}
                  className={`inline-flex items-center justify-center gap-2 px-10 py-4 font-bold rounded-full transition-all shadow-lg w-full sm:w-auto ${isSubmitting || !formData.treatment ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-sky-600/30'}`}
                >
                  {isSubmitting ? (
                    <>Feldolgozás <Sparkles className="w-5 h-5 animate-pulse" /></>
                  ) : (
                    <>Foglalás Véglegesítése <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRÉMIUM 2026 FOOTER (Egyezik a többi oldallal)
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300 mt-24">
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
export default function BookingPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-32">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-100 rounded-full text-sky-700 text-sm font-bold tracking-wide uppercase mb-6">
            <Building2 className="w-4 h-4" /> Gyors és kényelmes
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Foglaljon Időpontot
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Kérjük, adja meg adatait és a kívánt kezelést, hogy kollégáink a legmegfelelőbb időponttal kereshessék.
          </p>
        </div>

        <BookingForm />
      </main>

      <Footer />
      
      {/* Egyedi scrollbar stílus a kezelések listájához */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #bae6fd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7dd3fc;
        }
      `}} />
    </div>
  );
}
