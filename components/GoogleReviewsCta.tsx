'use client';

import { ExternalLink, MessageSquareText } from 'lucide-react';
import { useLocale } from 'next-intl';
import { GOOGLE_BUSINESS_URL } from '@/lib/seo';

const copy = {
  hu: {
    eyebrow: 'Független páciensvélemények',
    title: 'Olvassa el a Google-on közzétett értékeléseket',
    description: 'Az aktuális pontszámot, az értékelések számát és a páciensek saját beszámolóit közvetlenül a Google Cégprofilon találja.',
    action: 'Google-értékelések megnyitása',
  },
  en: {
    eyebrow: 'Independent patient reviews',
    title: 'Read reviews published on Google',
    description: 'See the current rating, review count and patients’ own comments directly on our Google Business Profile.',
    action: 'Open Google reviews',
  },
  sk: {
    eyebrow: 'Nezávislé hodnotenia pacientov',
    title: 'Prečítajte si hodnotenia zverejnené na Google',
    description: 'Aktuálne skóre, počet hodnotení a skúsenosti pacientov nájdete priamo v našom firemnom profile Google.',
    action: 'Otvoriť hodnotenia Google',
  },
  de: {
    eyebrow: 'Unabhängige Patientenbewertungen',
    title: 'Lesen Sie die auf Google veröffentlichten Bewertungen',
    description: 'Die aktuelle Bewertung, Anzahl der Rezensionen und Erfahrungsberichte finden Sie direkt in unserem Google-Unternehmensprofil.',
    action: 'Google-Bewertungen öffnen',
  },
} as const;

export default function GoogleReviewsCta() {
  const locale = useLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.hu;

  return (
    <section className="border-y border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[2rem] border border-sky-100 bg-white p-8 text-center shadow-xl shadow-sky-900/5 md:p-12">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <MessageSquareText className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-sky-700">{text.eyebrow}</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{text.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{text.description}</p>
          <a
            href={GOOGLE_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-4 font-black text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            {text.action}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
