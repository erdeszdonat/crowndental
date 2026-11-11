import Link from 'next/link';
import content from '@/lib/openingAnnouncement.json';

export default function OpeningAnnouncement({ locale, compact = false }: { locale: string; compact?: boolean }) {
  const language = locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu';
  const copy = content[language];
  const prefix = language === 'hu' ? '' : `/${language}`;
  return (
    <section aria-label={copy.bannerTitle} className="border-y border-sky-200 bg-sky-50 text-slate-950" data-cta-location="primas_opening">
      <div className={`mx-auto max-w-6xl px-5 ${compact ? 'py-7' : 'py-10 sm:py-14'}`}>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-700">Crown Dental Prímás Sziget · Esztergom</p>
        <h2 className="max-w-4xl text-2xl font-black leading-tight sm:text-3xl">{copy.bannerTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">{copy.bannerText}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href="tel:+36706042500" className="inline-flex min-h-12 items-center rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">+36 70 604 2500</a>
          <Link href={`${prefix}/idopont`} className="inline-flex min-h-12 items-center rounded-xl border border-sky-700 bg-white px-5 py-3 font-bold text-sky-800 hover:bg-sky-100">{copy.book}</Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed">{copy.fallback} <a href="tel:+36305892468" className="whitespace-nowrap font-bold underline underline-offset-4">+36 30 589 2468</a> · Crown Dental Belváros</p>
        {!compact && <p className="mt-3 max-w-3xl text-sm text-slate-600">{copy.note}</p>}
        <Link href={`${prefix}/blog/${copy.slug}`} className="mt-4 inline-block font-semibold text-sky-800 underline underline-offset-4">{copy.read} →</Link>
      </div>
    </section>
  );
}
