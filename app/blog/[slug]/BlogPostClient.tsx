'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Menu, X, ChevronRight, Clock, ArrowLeft, MapPin, Mail } from 'lucide-react';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center relative h-full py-2 z-50">
            <Image src="/logo.webp" alt="Crown Dental Logo" width={220} height={60} className="object-contain h-10 md:h-12 w-auto drop-shadow-sm" priority />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Főoldal</Link>
            <Link href="/kezelesek" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Szolgáltatások & Árak</Link>
            <Link href="/rolunk" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Rólunk</Link>
            <Link href="/blog" className="font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-full transition-colors">Blog</Link>
            <Link href="/karrier" className="font-bold text-gray-800 hover:text-sky-600 transition-colors">Karrier</Link>
          </div>

          <div className="flex items-center gap-4 z-50">
            <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-2">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:-translate-y-0.5 text-sm md:text-base ring-4 ring-sky-100">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-40">
              <div className="px-6 py-6 space-y-3 max-h-[80vh] overflow-y-auto">
                <Link href="/" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>
                <Link href="/kezelesek" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>
                <Link href="/rolunk" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>
                <Link href="/blog" className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/karrier" className="block px-4 py-3 text-gray-800 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Karrier</Link>
                
                <div className="pt-6 pb-2 border-t border-gray-100 mt-4">
                  <a href="tel:+36705646837" className="flex justify-center items-center gap-2 w-full py-4 bg-gray-50 text-sky-700 font-bold rounded-xl mb-3"><Phone className="w-5 h-5" /> +36 70 564 6837</a>
                  <Link href="/idopont" className="flex justify-center items-center gap-2 w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}><Calendar className="w-5 h-5" /> Időpont Foglalás</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300 mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6">
              <Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>
              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 mt-1" />
                <div>
                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>
                  <span className="text-gray-400">2500 Esztergom, Petőfi Sándor utca 11.</span>
                </div>
              </li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-sky-500" /><a href="tel:+36705646837" className="hover:text-white transition-colors">+36 70 564 6837</a></li>
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-sky-500" /><a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors">info@crowndental.hu</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
          <p>© 2026 Crown Dental Praxis és Labor Fogászati Kft. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
}

export default function BlogPostClient({ post }: { post: any }) {
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">A cikk nem található.</h1>
        <Link href="/blog" className="px-6 py-3 bg-sky-600 text-white rounded-full font-bold">Vissza a blogra</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <article className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 transition-colors mb-8 bg-sky-50 px-4 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Vissza a cikkekhez
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-2 text-gray-500 font-bold mb-6">
              <Clock className="w-5 h-5 text-sky-600" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
              {post.title}
            </h1>
            
            {post.imageUrl && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl mb-12 border border-gray-100">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
          </header>

          <div className="prose prose-lg prose-sky max-w-none text-gray-700">
            {post.content && post.content.map((block: any, index: number) => {
              if (block._type === 'block') {
                const text = block.children?.map((child: any) => child.text).join('') || '';
                if (text.trim() === '') return <br key={index} />;
                if (block.style === 'h2') return <h2 key={index} className="text-3xl font-extrabold mt-12 mb-6 text-gray-900">{text}</h2>;
                if (block.style === 'h3') return <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">{text}</h3>;
                if (block.style === 'blockquote') return <blockquote key={index} className="border-l-4 border-sky-500 pl-6 italic text-gray-600 my-8 bg-gray-50 py-4 rounded-r-2xl font-medium">{text}</blockquote>;
                return <p key={index} className="mb-6 leading-relaxed text-lg font-medium">{text}</p>;
              }
              return null;
            })}
          </div>

        </div>
      </article>

      <Footer />
    </main>
  );
}
