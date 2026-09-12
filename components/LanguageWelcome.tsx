'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe2, X } from 'lucide-react';
import { FlagIcon } from '@/components/navigation';

const STORAGE_KEY = 'crown_language_prompt_seen_v1';

const languages = [
  { code: 'en', label: 'English', ariaLabel: 'Continue in English' },
  { code: 'de', label: 'Deutsch', ariaLabel: 'Auf Deutsch fortfahren – Deutschland oder Schweiz' },
  { code: 'sk', label: 'Slovenčina', ariaLabel: 'Pokračovať v slovenčine' },
] as const;

export default function LanguageWelcome() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const basePath = pathname.replace(/^\/(hu|en|sk|de)(?=\/|$)/, '') || '/';

  useEffect(() => {
    if (locale !== 'hu') return;

    try {
      if (!localStorage.getItem(STORAGE_KEY)) setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, [locale]);

  const rememberChoice = (choice: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {}
    setIsVisible(false);
  };

  const dismiss = () => rememberChoice('dismissed');

  if (locale !== 'hu') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="region"
          aria-label="Language selection"
          aria-live="polite"
          data-nosnippet=""
          className="pointer-events-none fixed bottom-3 left-3 right-3 z-[35] sm:bottom-auto sm:left-auto sm:right-4 sm:top-[100px] sm:w-auto sm:max-w-3xl"
        >
          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-sky-100/90 bg-white/95 p-2.5 shadow-[0_16px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-4 sm:rounded-full sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5 px-1 sm:px-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="min-w-0 text-[11px] font-bold leading-snug text-slate-700 sm:text-sm">
                Choose your language <span className="text-slate-300">·</span> Sprache wählen{' '}
                <span className="text-slate-300">·</span> Vyberte si jazyk
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close language selection"
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:hidden"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-0 sm:flex sm:items-center sm:gap-2">
              {languages.map((language) => {
                const href = `/${language.code}${basePath === '/' ? '' : basePath}`;
                return (
                  <Link
                    key={language.code}
                    href={href}
                    hrefLang={language.code}
                    onClick={() => rememberChoice(language.code)}
                    aria-label={language.ariaLabel}
                    className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:rounded-full sm:px-3.5"
                  >
                    <FlagIcon code={language.code} />
                    <span>{language.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close language selection"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:flex"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
