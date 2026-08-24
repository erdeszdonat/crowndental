'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Menu, X, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { INTERNATIONAL_PATIENT_PATHS } from '@/lib/internationalPaths';

const languages = [
  { code: 'hu', hrefLang: 'hu-HU', label: 'Magyar' },
  { code: 'en', hrefLang: 'en-GB', label: 'English' },
  { code: 'sk', hrefLang: 'sk-SK', label: 'Slovenčina' },
  { code: 'de', hrefLang: 'de-DE', label: 'Deutsch' },
] as const;

type LocaleCode = (typeof languages)[number]['code'];
const internationalPatientPathSet = new Set(
  Object.values(INTERNATIONAL_PATIENT_PATHS).map((path) => `/${path}`)
);

function localizedPath(locale: LocaleCode, path: string): string {
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  const prefix = locale === 'hu' ? '' : `/${locale}`;
  return `${prefix}${normalizedPath}` || '/';
}

function localeFallbackPath(pathname: string, newLocale: LocaleCode): string {
  const pathWithoutLocale = pathname.replace(/^\/(hu|en|sk|de)(?=\/|$)/, '') || '/';

  // These landing pages intentionally use a different, search-friendly slug
  // in every language, so preserving the current slug would create a 404.
  if (internationalPatientPathSet.has(pathWithoutLocale.replace(/\/$/, ''))) {
    return localizedPath(newLocale, INTERNATIONAL_PATIENT_PATHS[newLocale]);
  }

  // A translated post may have a different slug. Until the hreflang link is
  // read in the browser, the locale's blog hub is the only guaranteed URL.
  if (/^\/blog\/[^/]+\/?$/.test(pathWithoutLocale)) {
    return localizedPath(newLocale, 'blog');
  }

  return localizedPath(newLocale, pathWithoutLocale);
}

function localeDestination(pathname: string, newLocale: LocaleCode): string {
  const fallback = localeFallbackPath(pathname, newLocale);
  if (typeof document === 'undefined') return fallback;

  const hrefLang = languages.find((language) => language.code === newLocale)?.hrefLang;
  const alternate = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
  ).find((link) => {
    const value = link.hreflang.toLowerCase();
    return value === hrefLang?.toLowerCase() || value === newLocale;
  });

  if (!alternate?.href) return fallback;

  try {
    const target = new URL(alternate.href, window.location.origin);
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

// ─── Zászló ikonok ────────────────────────────────────────────────────────────
export function FlagIcon({ code }: { code: string }) {
  if (code === 'hu') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-[14px] rounded-sm flex-shrink-0">
      <rect width="3" height="0.667" y="0" fill="#CE2939"/>
      <rect width="3" height="0.667" y="0.667" fill="#FFFFFF"/>
      <rect width="3" height="0.667" y="1.333" fill="#477050"/>
    </svg>
  );
  if (code === 'en') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-[14px] rounded-sm flex-shrink-0">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );
  if (code === 'sk') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-[14px] rounded-sm flex-shrink-0">
      <rect width="3" height="2" fill="#FFFFFF"/>
      <rect width="3" height="0.667" fill="#0B4EA2" y="0.667"/>
      <rect width="3" height="0.667" fill="#EE1C25" y="1.333"/>
    </svg>
  );
  if (code === 'de') return (
    <span className="inline-flex flex-shrink-0 items-center -space-x-1" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="h-[14px] w-5 rounded-sm ring-1 ring-white">
        <rect width="5" height="1" y="0" fill="#000000"/>
        <rect width="5" height="1" y="1" fill="#DD0000"/>
        <rect width="5" height="1" y="2" fill="#FFCE00"/>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-[14px] w-[14px] rounded-sm ring-1 ring-white">
        <rect width="32" height="32" fill="#D52B1E"/>
        <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#FFFFFF"/>
      </svg>
    </span>
  );
  return null;
}

// ─── Nyelvváltó dropdown ──────────────────────────────────────────────────────
function LanguageSwitcher() {
  const t = useTranslations('langSwitch');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  // Kattintás kezelése kívülről zárja be
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    const currentIndex = Math.max(0, languages.findIndex((language) => language.code === locale));
    const frame = window.requestAnimationFrame(() => {
      menuItemRefs.current[currentIndex]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [locale, open]);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    }

    const items = menuItemRefs.current.filter((item): item is HTMLButtonElement => item !== null);
    if (items.length === 0) return;

    const focusedIndex = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (focusedIndex + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (focusedIndex - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  };

  const switchLocale = (newLocale: LocaleCode) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (newLocale === locale) return;
    router.push(localeDestination(pathname, newLocale));
  };

  const currentLang = languages.find(l => l.code === locale) ?? languages[0];

  return (
    <div
      ref={ref}
      className="relative z-50"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        id={`${menuId}-trigger`}
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            closeAndRestoreFocus();
          }
        }}
        aria-label={t('ariaLabel')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all text-sm font-bold"
      >
        <FlagIcon code={currentLang.code} />
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-labelledby={`${menuId}-trigger`}
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                ref={(element) => {
                  menuItemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-current={locale === lang.code ? 'true' : undefined}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-sky-50 transition-colors text-left ${
                  locale === lang.code ? 'bg-sky-50 text-sky-700 font-bold' : 'text-gray-700'
                }`}
              >
                <FlagIcon code={lang.code} />
                <span>{lang.label}</span>
                {locale === lang.code && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-sky-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Fő navigáció ─────────────────────────────────────────────────────────────
export default function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Locale-függő prefix az URL-ekhez
  const prefix = locale === 'hu' ? '' : `/${locale}`;
  const homeHref = prefix || '/';

  const navLinks = [
    { name: t('home'), href: homeHref },
    { name: t('services'), href: `${prefix}/kezelesek` },
    { name: t('about'), href: `${prefix}/rolunk` },
    { name: t('blog'), href: `${prefix}/blog` },
    { name: t('career'), href: `${prefix}/karrier` },
  ];

  const isActive = (path: string) => {
    const normalizedPath = path.replace(/\/$/, '') || '/';
    const normalizedPathname = pathname.replace(/\/$/, '') || '/';
    if (normalizedPath === `${prefix}/` || normalizedPath === prefix || normalizedPath === '/') {
      return normalizedPathname === `${prefix}` || normalizedPathname === `${prefix}/` || normalizedPathname === '/';
    }
    return normalizedPathname.startsWith(normalizedPath);
  };

  if (pathname?.includes('/studio') || pathname?.includes('/admin')) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-transparent py-2'}`}>
      <nav className="container mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo */}
        <a href={homeHref} className="flex items-center relative h-full py-2 z-50">
          <Image
            src="/logo.webp"
            alt="Crown Dental Logo"
            width={140}
            height={84}
            priority
            className="h-12 w-auto object-contain drop-shadow-sm md:h-14"
          />
        </a>

        {/* Desktop nav linkek */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-bold transition-colors ${isActive(link.href) ? 'text-sky-600 bg-sky-50 px-4 py-2 rounded-full' : 'text-gray-800 hover:text-sky-600'}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Jobb oldali gombok */}
        <div className="flex items-center gap-2 z-50">
          <a href="tel:+36705646837" className="hidden xl:flex items-center gap-2 font-bold text-sky-700 hover:text-sky-600 mr-1">
            <Phone className="w-5 h-5" /> +36 70 564 6837
          </a>

          {/* Nyelvváltó */}
          <LanguageSwitcher />

          {/* Időpontfoglalás gomb */}
          <a
            href={`${prefix}/idopont`}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-xl hover:bg-sky-700 transform hover:-translate-y-0.5 text-sm md:text-base ring-4 ring-sky-50"
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5" /> {t('bookAppointment')}
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="lg:hidden p-2 rounded-lg text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile menü */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-4 font-bold shadow-2xl absolute w-full left-0 z-40"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-xl ${isActive(link.href) ? 'text-sky-600 bg-sky-50' : 'hover:bg-sky-50'}`}
              >
                {link.name}
              </a>
            ))}

            {/* Nyelvváltó mobilon */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-4">Nyelv / Language</p>
              <div className="flex gap-2 px-4">
                {languages.map((lang) => (
                  <a
                    key={lang.code}
                    href={localeFallbackPath(pathname, lang.code)}
                    hrefLang={lang.hrefLang}
                    onClick={(event) => {
                      event.preventDefault();
                      setIsOpen(false);
                      if (lang.code !== locale) {
                        router.push(localeDestination(pathname, lang.code));
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      locale === lang.code ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600 hover:bg-sky-50'
                    }`}
                  >
                    <FlagIcon code={lang.code} />{lang.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Telefonszám mobilon */}
            <a href="tel:+36705646837" className="flex items-center gap-2 px-4 py-3 bg-sky-50 text-sky-700 rounded-xl">
              <Phone className="w-5 h-5" /> +36 70 564 6837
            </a>

            {/* Időpontfoglalás mobilon */}
            <a
              href={`${prefix}/idopont`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 text-white font-bold rounded-full shadow-md"
            >
              <Calendar className="w-5 h-5" /> {t('bookAppointment')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
