'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Calendar, 
  ArrowLeft, 
  MapPin, 
  Star, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Menu, 
  X, 
  Building2 
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// EGYSÉGES NAVIGÁCIÓ
// ═══════════════════════════════════════════════════════════════════════════
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white border-b border-gray-100'}`}>
      <nav className="container mx-auto px-4 flex items-center justify-between h-20">
        <a href="/">
          <img src="/logo.webp" alt="Crown Dental Logo" className="h-12 md:h-14 w-auto object-contain" />
        </a>
        
        <div className="hidden lg:flex items-center gap-8 font-bold text-gray-800">
          <a href="/" className="hover:text-sky-600 transition-colors">Főoldal</a>
          <a href="/kezelesek" className="hover:text-sky-600 transition-colors">Szolgáltatások & Árak</a>
          <a href="/blog" className="text-sky-600 bg-sky-50 px-4 py-2 rounded-full">Blog</a>
          <a href="/rolunk" className="hover:text-sky-600 transition-colors">Rólunk</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 transition-colors">
            <Phone className="w-5 h-5" /> +36 70 564 6837
          </a>
          <a href="/idopont" className="px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full shadow-lg hover:bg-sky-700 transition-all text-sm ring-4 ring-sky-100 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Időpontot kérek
          </a>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-600">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 font-bold shadow-xl">
          <a href="/" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Főoldal</a>
          <a href="/kezelesek" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Szolgáltatások</a>
          <a href="/blog" className="px-4 py-2 text-sky-600 bg-sky-50 rounded-xl">Blog</a>
          <a href="/rolunk" className="px-4 py-2 hover:bg-sky-50 rounded-xl">Rólunk</a>
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMÁLT SZÁMLÁLÓ
// ═══════════════════════════════════════════════════════════════════════════
function AnimatedCounter({ end, suffix = "", text, desc }: { end: number, suffix?: string, text: string, desc: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
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
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div 
      onMouseEnter={() => setIsVisible(true)}
      className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
    >
      <div className="text-5xl font-extrabold text-sky-600 mb-4 tracking-tight">
        {count.toLocaleString('hu-HU')}{suffix}
      </div>
      <div className="text-lg font-bold text-gray-900 mb-2">{text}</div>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100/50 rounded-full text-sky-700 text-sm font-bold uppercase mb-6">
          <Building2 className="w-4 h-4" /> Klinikánk Számokban
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 tracking-tight">Eredményeink az Önök szolgálatában</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <AnimatedCounter end={30} suffix="+" text="Év Tapasztalat" desc="1994 óta a pályán" />
          <AnimatedCounter end={15000} suffix="+" text="Elégedett Páciens" desc="Generációk bizalma" />
          <AnimatedCounter end={40} suffix="%" text="Megtakarítás" desc="Saját laborunk miatt" />
          <AnimatedCounter end={3} suffix=" nap" text="Korona Elkészítés" desc="Villámgyors fogpótlás" />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VÉLEMÉNYEK
// ═══════════════════════════════════════════════════════════════════════════
function ReviewsSection() {
  const reviews = [
    { name: 'Kovács Mária', text: 'Már 10 éve járok ide, a legjobb döntés volt. Kedvesek és precízek.', date: '2026. február' },
    { name: 'Nagy József', text: 'Nagyon profik, az implantátumom tökéletes lett. Mindenkinek ajánlom!', date: '2026. január' },
    { name: 'Szabó Anna', text: 'A korona 3 nap alatt elkészült a saját labor miatt. Hihetetlen!', date: '2025. december' },
    { name: 'Varga Péter', text: 'Sosem csalódtam bennük, Budapestről is megéri lejárni.', date: '2025. november' },
    { name: 'Tóth Gábor', text: 'Végre egy fogászat, ahol nem félek a beavatkozástól. Köszönöm!', date: '2025. október' },
  ];
  const extendedReviews = [...reviews, ...reviews, ...reviews];
  
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Pácienseink mondták</h3>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .animate-marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; } 
        .animate-marquee:hover { animation-play-state: paused; }
      `}} />
      <div className="animate-marquee gap-6 px-6">
        {extendedReviews.map((review, i) => (
          <div key={i} className="w-[350px] p-8 bg-gray-50 rounded-[2rem] shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1 mb-4 text-amber-400">
              {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
            </div>
            <p className="text-gray-600 mb-6 italic leading-relaxed">"{review.text}"</p>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200">
              <span className="font-bold text-gray-900">{review.name}</span>
              <span className="text-gray-400">{review.date}</span>
            </div>
          </div>
        ))}
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
              <img src="/logo.webp" alt="Logo" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Prémium fogászat Esztergomban és hamarosan Budapesten is. Saját laborunkkal spórolunk Önnek időt és költséget.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="/kezelesek/implantatum" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</a></li>
              <li><a href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</a></li>
              <li><a href="/kezelesek" className="hover:text-sky-400 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</a></li>
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
                <a href="tel:+36705646837" className="hover:text-white transition-colors font-bold">+36 70 564 6837</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/aszf" className="hover:text-white">ÁSZF</a></li>
              <li><a href="/adatkezeles" className="hover:text-white">Adatkezelés</a></li>
              <li><a href="/impresszum" className="hover:text-white">Impresszum</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-800 text-xs text-gray-500">
          © 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALOLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function BlogPostClient({ post }: { post: any }) {
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">A cikk nem található.</h1>
        <a href="/blog" className="text-sky-600 font-bold hover:underline">Vissza a blogra</a>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <article className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
        <a href="/blog" className="inline-flex items-center gap-2 text-sky-600 font-bold mb-8 bg-sky-50 px-4 py-2 rounded-full text-sm hover:bg-sky-100 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Vissza a blogra
        </a>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-gray-500 font-bold mb-6 text-sm uppercase tracking-wide">
            <Clock className="w-4 h-4 text-sky-600" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss tartalom'}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight italic">
            {post.title}
          </h1>
          {post.imageUrl && (
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-gray-100 group">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-sky max-w-none text-gray-700 mb-20 font-medium leading-relaxed">
          {post.content?.map((block: any, i: number) => {
            if (block._type === 'block') {
              const text = block.children?.map((c: any) => c.text).join('') || '';
              if (block.style === 'h2') return <h2 key={i} className="text-3xl font-extrabold mt-16 mb-8 text-gray-900 border-b pb-4 border-gray-100">{text}</h2>;
              if (block.style === 'h3') return <h3 key={i} className="text-2xl font-bold mt-12 mb-6 text-gray-800">{text}</h3>;
              if (block.style === 'blockquote') return <blockquote key={i} className="border-l-4 border-sky-500 pl-6 italic text-gray-600 my-10 bg-gray-50 py-8 rounded-r-3xl text-xl">{text}</blockquote>;
              return <p key={i} className="mb-6">{text}</p>;
            }
            return null;
          })}
        </div>

        <div className="p-10 md:p-16 bg-gradient-to-br from-sky-600 to-sky-800 rounded-[3rem] shadow-2xl text-center relative overflow-hidden text-white mt-24">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-inner">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Tegyük meg az első lépést a tökéletes mosoly felé!</h3>
            <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Foglaljon időpontot egy szakorvosi konzultációra, ahol minden kérdésére választ adunk és közösen megtervezzük új mosolyát.
            </p>
            <a href="/idopont" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold rounded-full shadow-xl hover:scale-105 transition-all text-lg tracking-wide group">
              Időpontot foglalok <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </article>

      <StatsSection />
      <ReviewsSection />

      <Footer />
    </main>
  );
}
