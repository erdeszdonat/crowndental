'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ChevronRight, Facebook, Instagram, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();

  if (pathname?.includes('/studio') || pathname?.includes('/admin')) {
    return null;
  }

  const prefix = locale === 'hu' ? '' : `/${locale}`;

  const openCookieBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-banner'));
      if (typeof (window as any).openCookieBannerFunc === 'function') {
        (window as any).openCookieBannerFunc();
      }
    }
  };

  return (
    <footer className="bg-gray-950 pt-20 pb-10 border-t border-gray-900 text-gray-300 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* 1. OSZLOP: LOGÓ & BEMUTATKOZÁS */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="bg-white inline-block p-4 rounded-2xl mb-8 shadow-lg shadow-black/50">
              <img src="/logo.webp" alt="Crown Dental Logo" className="h-16 md:h-20 w-auto object-contain" />
            </div>

            <div className="mb-8 border-l-0 md:border-l-4 border-sky-500 pl-0 md:pl-5 w-full">
              <p className="text-xl md:text-2xl font-light text-white tracking-tight leading-snug">
                {t('tagline').split(' ').slice(0, 3).join(' ')} <br className="hidden md:block" />
                <span className="text-sky-400 font-extrabold drop-shadow-md">
                  {t('tagline').split(' ').slice(3, 5).join(' ')}
                </span>{' '}
                {t('tagline').split(' ').slice(5).join(' ')}
              </p>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed text-sm max-w-sm md:max-w-none">
              {t('description')}
            </p>

            <div className="flex gap-3 justify-center md:justify-start">
              <a href="https://www.facebook.com/koronafogaszatesztergom/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/crown_dental93/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@crowndentalhungary" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 2. OSZLOP: KEZELÉSEK */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('treatments')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`${prefix}/kezelesek/implantatum`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.implant')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/koronak-hidak`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.crowns')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/fogszabalyozas`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.orthodontics')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/fogfeherites`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.whitening')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/fogsor`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.dentures')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/szajsebeszet`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.surgery')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/gyokerkezeles`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.rootCanal')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/esztetikai-fogaszat`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.aesthetic')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/allapotfelmeres`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.assessment')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/gockutatas`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.focal')}</Link></li>
              <li><Link href={`${prefix}/kezelesek/fogtechnikai-megoldasok`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('treatmentLinks.labTech')}</Link></li>
            </ul>
          </div>

          {/* 3. OSZLOP: HASZNOS LINKEK & JOGI */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('usefulLinks')}</h4>
            <ul className="space-y-3 text-sm mb-10">
              <li><Link href={`${prefix}/kezelesek`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('fullPriceList')}</Link></li>
              <li><Link href={`${prefix}/idopont`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('bookingLink')}</Link></li>
              <li><Link href={`${prefix}/rolunk`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('aboutLink')}</Link></li>
              <li><Link href={`${prefix}/kapcsolat`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('contactLink')}</Link></li>
              <li><Link href={`${prefix}/blog`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('blogLink')}</Link></li>
              <li><Link href={`${prefix}/karrier`} className="hover:text-sky-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-sky-600" /> {t('careerLink')}</Link></li>
            </ul>

            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('legalInfo')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`${prefix}/aszf`} className="text-gray-400 hover:text-white transition-colors">{t('aszf')}</Link></li>
              <li><Link href={`${prefix}/adatkezeles`} className="text-gray-400 hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link href={`${prefix}/cookie-tajekoztato`} className="text-gray-400 hover:text-white transition-colors">{t('cookie')}</Link></li>
              <li><Link href={`${prefix}/impresszum`} className="text-gray-400 hover:text-white transition-colors">{t('imprint')}</Link></li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={openCookieBanner}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white transition-colors rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg"
                >
                  <Settings className="w-4 h-4" /> {t('cookieSettings')}
                </button>
              </li>
            </ul>
          </div>

          {/* 4. OSZLOP: KAPCSOLAT */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">{t('contact')}</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <span className="block text-white font-bold mb-1">{t('esztergomClinic')}</span>
                  <a href="https://share.google/UV0bxLOGoyQdgH826" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors leading-relaxed block">
                    2500 Esztergom,<br /> Petőfi Sándor utca 11.
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <span className="block text-white font-bold mb-1">{t('budapestClinic')}</span>
                  <a href="https://maps.google.com/?q=1039+Budapest+Királyok+útja+55" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors leading-relaxed block">
                    1039 Budapest,<br /> Királyok útja 55.
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-sky-500" />
                </div>
                <a href="tel:+36705646837" className="hover:text-white transition-colors font-bold text-lg">+36 70 564 6837</a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-sky-500" />
                </div>
                <a href="mailto:info@crowndental.hu" className="hover:text-white transition-colors text-base">info@crowndental.hu</a>
              </li>
            </ul>
          </div>
        </div>

        {/* LÁBLÉC ALJA */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
