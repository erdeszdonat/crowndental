
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import { 
  Phone, Calendar, Menu, X, BookOpen, Clock, 
  ArrowRight, MapPin, Mail, Sparkles, ChevronRight 
} from 'lucide-react';

const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });

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
            <Image src="/logo.webp" alt="Crown Dental Logo" width={280} height={80} className="object-contain h-full w-auto drop-shadow-sm" priority />
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
            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base ring-4 ring-sky-100 shadow-sky-600/30">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" /> Időpontot kérek
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="bg-white inline-block p-2 rounded-xl mb-6"><Image src="/logo.webp" alt="Crown Dental Logo" width={160} height={50} className="object-contain" /></div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm font-light">Kiváló minőségű fogászat saját fogtechnikai laborral, kompromisszumok nélkül. Kezelések Esztergomban és Budapesten is.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>
            <ul className="space-y-4">
              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>
              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>
              <li><Link href="/kezelesek" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Összes kezelés</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-sky-500 mt-1" /><div><span className="block text-white font-semibold">Esztergomi Rendelő</span><span className="text-gray-400">Petőfi Sándor u. 11.</span></div></li>
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-amber-500 mt-1" /><div><span className="block text-white font-semibold">Budapesti Rendelő</span><span className="text-gray-400">Királyok útja 55.</span></div></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors">ÁSZF</Link></li>
              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors">Adatkezelés</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt, "imageUrl": mainImage.asset->url }`;
        const result = await client.fetch(query);
        setPosts(result);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 md:pt-32">
      <Navigation />
      <section className="pb-16 text-center container mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-100/80 text-sky-700 rounded-full font-bold uppercase text-sm mb-6 border border-sky-200 shadow-sm"><BookOpen className="w-4 h-4" /> Crown Dental Magazin</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Fogászati <span className="text-sky-600">Tudástár</span></h1>
      </section>
      <section className="py-12 container mx-auto px-4 max-w-6xl">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>Betöltés...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post._id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-sky-50">Kép hiányzik</div>}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sky-600 text-sm font-bold mb-4 bg-sky-50 self-start px-3 py-1 rounded-full"><Clock className="w-4 h-4" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}</div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">{post.title}</h2>
                  <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6 font-medium flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-sky-600 font-bold uppercase tracking-wider text-sm pt-6 border-t border-gray-50">Tovább olvasom <ArrowRight className="w-4 h-4" /></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
