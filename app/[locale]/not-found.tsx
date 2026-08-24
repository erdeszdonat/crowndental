import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { localePrefix, normalizeLocale, type SupportedLocale } from '@/lib/seo';

export const metadata: Metadata = {
  title: '404 | Crown Dental',
  robots: { index: false, follow: true },
};

const copy: Record<SupportedLocale, { title: string; description: string; home: string; treatments: string; contact: string }> = {
  hu: {
    title: 'Az oldal nem található',
    description: 'A hivatkozás elavult vagy az oldal más címre költözött. Az alábbi oldalak segítenek folytatni a böngészést.',
    home: 'Főoldal',
    treatments: 'Kezelések és árak',
    contact: 'Kapcsolat',
  },
  sk: {
    title: 'Stránka sa nenašla',
    description: 'Odkaz je zastaraný alebo bola stránka presunutá. Pokračujte cez jednu z možností nižšie.',
    home: 'Domov',
    treatments: 'Ošetrenia a cenník',
    contact: 'Kontakt',
  },
  en: {
    title: 'Page not found',
    description: 'The link may be outdated or the page may have moved. Use one of the options below to continue.',
    home: 'Home',
    treatments: 'Treatments and prices',
    contact: 'Contact',
  },
  de: {
    title: 'Seite nicht gefunden',
    description: 'Der Link ist möglicherweise veraltet oder die Seite wurde verschoben. Nutzen Sie eine der folgenden Optionen.',
    home: 'Startseite',
    treatments: 'Behandlungen und Preise',
    contact: 'Kontakt',
  },
};

export default async function LocalizedNotFound() {
  const locale = normalizeLocale(await getLocale());
  const content = copy[locale];
  const prefix = localePrefix(locale);

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 pb-20 pt-32">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-sky-600">404</p>
        <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">{content.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">{content.description}</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={prefix || '/'} className="rounded-full bg-sky-600 px-6 py-3 font-black text-white transition hover:bg-sky-700">
            {content.home}
          </Link>
          <Link href={`${prefix}/kezelesek`} className="rounded-full border border-slate-200 px-6 py-3 font-black text-slate-800 transition hover:border-sky-300 hover:bg-sky-50">
            {content.treatments}
          </Link>
          <Link href={`${prefix}/kapcsolat`} className="rounded-full border border-slate-200 px-6 py-3 font-black text-slate-800 transition hover:border-sky-300 hover:bg-sky-50">
            {content.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
