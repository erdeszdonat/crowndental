import ClinicPhoneLinks from '@/components/ClinicPhoneLinks';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { sanityImageLoader } from '@/lib/sanityImage';
import content from '@/lib/openingAnnouncement.json';

export default function OpeningAnnouncement({ locale, compact = false, imageUrl }: { locale: string; compact?: boolean; imageUrl?: string }) {
  const language = locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu';
  const copy = content[language];
  const prefix = language === 'hu' ? '' : `/${language}`;
  if (imageUrl && !compact) return (
    <section aria-label={copy.bannerTitle} className="bg-white px-4 py-10 sm:px-6 sm:py-16" data-cta-location="primas_opening">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/15">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 sm:p-10 xl:p-12">
            <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300"><span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />{copy.tag}</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">{copy.bannerTitle}</h2>
            <ul className="my-6 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">{copy.services.map(service => <li key={service} className="flex items-center gap-2"><span className="text-sky-300" aria-hidden="true">✓</span>{service}</li>)}</ul>
            <div className="flex flex-col gap-3">
              <Link href={`${prefix}/idopont`} className="inline-flex min-h-14 items-center justify-between gap-3 rounded-xl bg-sky-400 px-5 py-4 font-bold text-slate-950 transition-colors hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">{copy.book}<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link>
              <ClinicPhoneLinks tone="dark" />
            </div>
            <Link href={`${prefix}/blog/${copy.slug}`} className="mt-5 inline-block text-sm font-semibold text-sky-200 underline underline-offset-4">{copy.read} →</Link>
          </div>
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]">
            <Image loader={sanityImageLoader} src={imageUrl} alt={copy.imageAlt} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/10" />
            <span className="absolute left-6 top-6 rounded-full border border-white/30 bg-slate-950/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">{copy.availability}</span>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <p className="mb-2 text-2xl font-bold">Crown Dental Prímás Sziget</p>
              <p className="flex items-center gap-2 text-sm text-slate-200"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />2500 Esztergom, Helischer József út 6.</p>
              <Link href={`${prefix}/primas-sziget`} className="mt-4 inline-flex items-center gap-2 font-bold text-sky-200 underline underline-offset-4">{copy.visit}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/5 px-6 py-5 text-sm leading-relaxed sm:px-10">
          <p className="text-slate-200">{copy.fallback}</p>
          <p className="mt-2 text-xs text-slate-400">{copy.note}</p>
        </div>
      </div>
    </section>
  );
  return (
    <section aria-label={copy.bannerTitle} className="border-y border-sky-200 bg-sky-50 text-slate-950" data-cta-location="primas_opening">
      <div className={`mx-auto max-w-6xl px-5 ${compact ? 'py-7' : 'py-10 sm:py-14'}`}>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-700">Crown Dental Prímás Sziget · Esztergom</p>
        <h2 className="max-w-4xl text-2xl font-black leading-tight sm:text-3xl">{copy.bannerTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">{copy.bannerText}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ClinicPhoneLinks tone="light" />
          <Link href={`${prefix}/idopont`} className="inline-flex min-h-12 items-center rounded-xl border border-sky-700 bg-white px-5 py-3 font-bold text-sky-800 hover:bg-sky-100">{copy.book}</Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed">{copy.fallback}</p>
        {!compact && <p className="mt-3 max-w-3xl text-sm text-slate-600">{copy.note}</p>}
        <Link href={`${prefix}/blog/${copy.slug}`} className="mt-4 inline-block font-semibold text-sky-800 underline underline-offset-4">{copy.read} →</Link>
      </div>
    </section>
  );
}
