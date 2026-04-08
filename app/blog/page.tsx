'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Calendar, 
  Clock, 
  ArrowRight, 
  MapPin, 
  Menu, 
  X, 
  ChevronRight, 
  BookOpen 
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
// PRÉMIUM 2026 FOOTER 
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
              <li><a href="/kezelesek/implantatum" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</a></li>
              <li><a href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</a></li>
              <li><a href="/kezelesek/koronak-hidak" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</a></li>
              <li><a href="/kezelesek" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</a></li>
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
              <li><a href="/aszf" className="hover:text-white transition-colors">Általános Szerződési Feltételek</a></li>
              <li><a href="/adatkezeles" className="hover:text-white transition-colors">Adatkezelési Tájékoztató</a></li>
              <li><a href="/impresszum" className="hover:text-white transition-colors">Impresszum</a></li>
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
// FŐ OLDAL KOMPONENS
// ═══════════════════════════════════════════════════════════════════════════
export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
        const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt, "imageUrl": mainImage.asset->url }`);
        const url = `https://${projectId}.api.sanity.io/v2024-03-08/data/query/${dataset}?query=${query}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.result) {
          setPosts(data.result);
        }
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 md:pt-32 flex flex-col">
      <Navigation />
      
      <section className="pb-16 text-center container mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-100/80 text-sky-700 rounded-full font-bold uppercase text-sm mb-6 border border-sky-200 shadow-sm">
          <BookOpen className="w-4 h-4" /> Crown Dental Magazin
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Fogászati <span className="text-sky-600">Tudástár</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          Hasznos cikkek, érdekességek és tanácsok szakértőinktől a tökéletes mosoly megőrzéséhez.
        </p>
      </section>

      <section className="py-12 container mx-auto px-4 max-w-6xl flex-1">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            Betöltés...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">Még nincsenek feltöltve cikkek.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <a href={`/blog/${post.slug}`} key={post._id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-sky-50">Kép hamarosan</div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sky-600 text-sm font-bold mb-4 bg-sky-50 self-start px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6 font-medium flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sky-600 font-bold uppercase tracking-wider text-sm pt-6 border-t border-gray-50 group-hover:gap-3 transition-all">
                    Tovább olvasom <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
