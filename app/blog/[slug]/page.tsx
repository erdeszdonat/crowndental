'use client';



import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import Image from 'next/image';

import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from 'next-sanity';

import { dataset, projectId } from '@/sanity/env';

import { Phone, Calendar, Menu, X, ChevronRight, BookOpen, Clock, ArrowRight, MapPin, Mail } from 'lucide-react';



const client = createClient({ projectId, dataset, apiVersion: '2024-03-08', useCdn: true });



// ═══════════════════════════════════════════════════════════════════════════

// EGYSÉGES NAVIGÁCIÓ

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

        <div className="flex items-center justify-between h-20">

          <Link href="/" className="flex items-center relative h-full py-2 z-50">

            <Image src="/logo.webp" alt="Crown Dental Logo" width={240} height={70} className="object-contain h-14 w-auto drop-shadow-sm" priority />

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

            <Link href="/idopont" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5">

              <Calendar className="w-5 h-5" /> Időpontot kérek

            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">

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

                <Link href="/" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Főoldal</Link>

                <Link href="/kezelesek" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Szolgáltatások & Árak</Link>

                <Link href="/rolunk" className="block px-4 py-3 text-gray-600 font-bold rounded-xl hover:bg-sky-50" onClick={() => setIsOpen(false)}>Rólunk</Link>

                <div className="block px-4 py-3 text-sky-700 bg-sky-50 font-bold rounded-xl">Blog</div>

                

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

// EGYSÉGES PRÉMIUM FOOTER

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

              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors"><span className="font-bold">f</span></a>

              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors"><span className="font-bold">in</span></a>

            </div>

          </div>



          <div>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Szolgáltatások</h4>

            <ul className="space-y-4">

              <li><Link href="/kezelesek/implantatum" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Implantáció</Link></li>

              <li><Link href="/kezelesek/fogszabalyozas" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogszabályozás</Link></li>

              <li><Link href="/kezelesek/koronak-hidak" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Koronák és Hidak</Link></li>

              <li><Link href="/kezelesek/fogfeherites" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Fogfehérítés</Link></li>

              <li><Link href="/kezelesek" className="hover:text-sky-400 transition-colors flex items-center gap-2 font-light"><ChevronRight className="w-4 h-4 text-sky-600" /> Teljes Árlista</Link></li>

            </ul>

          </div>



          <div>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Kapcsolat</h4>

            <ul className="space-y-5">

              <li className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-sky-500 mt-1" />

                <div>

                  <span className="block text-white font-semibold">Esztergomi Rendelő</span>

                  <a href="https://share.google/UV0bxLOGoyQdgH826" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors font-light">

                    2500 Esztergom, Petőfi Sándor utca 11.

                  </a>

                </div>

              </li>

              <li className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-amber-500 mt-1" />

                <div>

                  <span className="block text-white font-semibold">Budapesti Rendelő</span>

                  <a href="https://maps.google.com/?q=1039+Budapest+Királyok+útja+55" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors font-light">

                    1039 Budapest, Királyok útja 55.

                  </a>

                </div>

              </li>

              <li className="flex items-center gap-3">

                <Phone className="w-5 h-5 text-sky-500" />

                <a href="tel:+36705646837" className="hover:text-white transition-colors font-light">+36 70 564 6837</a>

              </li>

              <li className="flex items-center gap-3">

                <Mail className="w-5 h-5 text-sky-500" />

                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors font-light">info@crowndental.hu</a>

              </li>

            </ul>

          </div>



          <div>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Jogi Információk</h4>

            <ul className="space-y-4">

              <li><Link href="/aszf" className="text-gray-400 hover:text-white transition-colors font-light">Általános Szerződési Feltételek</Link></li>

              <li><Link href="/adatkezeles" className="text-gray-400 hover:text-white transition-colors font-light">Adatkezelési Tájékoztató (GDPR)</Link></li>

              <li><Link href="/impresszum" className="text-gray-400 hover:text-white transition-colors font-light">Impresszum</Link></li>

              <li><Link href="/cookie-tajekoztato" className="text-gray-400 hover:text-white transition-colors font-light">Sütik (Cookie) kezelése</Link></li>

            </ul>

          </div>



        </div>



        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-light">

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

// FŐ OLDAL KOMPONENS

// ═══════════════════════════════════════════════════════════════════════════

export default function BlogPage() {

  const [posts, setPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const fetchPosts = async () => {

      try {

        const query = `*[_type == "post"] | order(publishedAt desc) {

          _id,

          title,

          "slug": slug.current,

          publishedAt,

          excerpt,

          "imageUrl": mainImage.asset->url

        }`;

        const result = await client.fetch(query);

        setPosts(result);

      } catch (error) {

        console.error("Hiba a Sanity lekéréskor:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchPosts();

  }, []);



  return (

    <main className="min-h-screen bg-gray-50 pt-24 md:pt-32">

      <Navigation />

      

      <section className="relative pb-16 overflow-hidden">

        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-100/80 text-sky-700 rounded-full font-bold uppercase tracking-wide text-sm mb-6 border border-sky-200">

            <BookOpen className="w-4 h-4" /> Crown Dental Magazin

          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">

            Fogászati <span className="text-sky-600">Tudástár</span>

          </h1>

          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">

            Hasznos cikkek, érdekességek és tanácsok szakértőinktől a tökéletes mosoly és az egészséges fogak megőrzéséhez.

          </p>

        </div>

      </section>



      <section className="py-12">

        <div className="container mx-auto px-4 max-w-6xl">

          {loading ? (

            <div className="text-center text-gray-500 text-lg py-20 flex flex-col items-center gap-4">

              <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>

              Cikkek betöltése...

            </div>

          ) : posts.length === 0 ? (

            <div className="text-center text-gray-500 text-lg py-20">Még nincsenek feltöltve cikkek a Sanity-ben.</div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {posts.map((post) => (

                <Link href={`/blog/${post.slug}`} key={post._id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-sky-900/10 border border-gray-100 transition-all duration-300 hover:-translate-y-2">

                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">

                    {post.imageUrl ? (

                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                    ) : (

                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-sky-50"><BookOpen className="w-12 h-12 opacity-50" /></div>

                    )}

                  </div>

                  <div className="p-8 flex flex-col flex-1">

                    <div className="flex items-center gap-2 text-sky-600 text-sm font-bold mb-4">

                      <Clock className="w-4 h-4" />

                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}

                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">

                      {post.title}

                    </h2>

                    <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6 font-medium flex-1">

                      {post.excerpt}

                    </p>

                    <div className="flex items-center gap-2 text-sky-600 font-bold uppercase tracking-wider text-sm group-hover:gap-3 transition-all mt-auto pt-6 border-t border-gray-50">

                      Tovább olvasom <ArrowRight className="w-4 h-4" />

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>



      <Footer />

    </main>

  );

} 
