import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import { getVeneerOffer } from '@/lib/veneers.mjs';
import VeneerOffer from '@/components/VeneerOffer';
import ClinicDetails from '@/components/ClinicDetails';
import { clinicCopy, CLINIC_LOCATIONS } from '@/lib/clinicLocations';
import { buildLocationSchema } from '@/lib/clinicSchema';
import { buildBreadcrumbJsonLd, buildLocalizedMetadata, getTreatmentContent, localePrefix, normalizeLocale, safeJsonLd, type TreatmentSlug } from '@/lib/seo';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const copy = clinicCopy[locale];
  return buildLocalizedMetadata({ locale, path: 'primas-sziget', title: `${copy.title} | Crown Dental`, description: copy.description });
}

const treatments: TreatmentSlug[] = ['allapotfelmeres', 'gyokerkezeles', 'fogfeherites', 'koronak-hidak', 'fogsor', 'implantatum', 'szajsebeszet', 'gyerekfogaszat', 'fogszabalyozas'];

export default async function PrimasSzigetPage({ params }: Props) {
  const locale = normalizeLocale((await params).locale);
  const copy = clinicCopy[locale];
  const prefix = localePrefix(locale);
  return (
    <main className="bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildLocationSchema(locale, 1)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(locale, 'primas-sziget', 'Crown Dental Prímás Sziget')) }} />
      <section className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 pt-32 pb-20 sm:pt-40">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="mb-5 font-bold uppercase tracking-widest text-sky-700">Crown Dental Prímás Sziget</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`${prefix}/idopont`} className="rounded-2xl bg-sky-600 px-6 py-4 font-bold text-white hover:bg-sky-700">{copy.book}</Link>
              <a href="tel:+36305892468" className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 px-6 py-4 font-bold text-sky-800"><Phone className="h-5 w-5" aria-hidden="true" />+36 30 589 2468</a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-xl shadow-sky-100/50">
            <MapPin className="mb-4 h-8 w-8 text-sky-600" aria-hidden="true" />
            <h2 className="mb-5 text-2xl font-bold">Crown Dental Prímás Sziget</h2>
            <ClinicDetails locale={locale} index={1} showDetails={false} />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black">{copy.smile}</h2>
        <div className="my-8 grid gap-6 md:grid-cols-2">
          {[{ slug: 'direkt-hej' as const, title: copy.direct }, { slug: 'indirekt-hej' as const, title: copy.indirect }].map((item) => (
            <Link key={item.slug} href={`${prefix}/kezelesek/${item.slug}`} className="rounded-3xl border border-sky-100 bg-sky-50 p-8 transition-colors hover:bg-sky-100">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <div className="my-4 text-sky-700"><VeneerOffer slug={item.slug} initialOffer={getVeneerOffer(item.slug)} locale={locale} /></div>
              <ArrowRight className="h-5 w-5 text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="max-w-3xl leading-relaxed text-gray-600">{copy.smileNote}</p>
        <Link href={`${prefix}/hollywood-mosoly`} className="mt-5 inline-block font-bold text-sky-700 underline underline-offset-4">{copy.smile}</Link>
      </section>
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-black">{copy.treatments}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.map((slug) => <li key={slug}><Link href={`${prefix}/kezelesek/${slug}`} className="block rounded-2xl border border-gray-100 bg-white p-5 font-semibold hover:text-sky-700">{getTreatmentContent(locale, slug).heroTitle}</Link></li>)}
            <li><Link href={`${prefix}/kezelesek#arlista`} className="block rounded-2xl border border-gray-100 bg-white p-5 font-semibold hover:text-sky-700">{copy.fillings}</Link></li>
          </ul>
          <Link href={`${prefix}/kezelesek`} className="mt-6 inline-block font-bold text-sky-700 underline underline-offset-4">{copy.allTreatments}</Link>
          <p className="mt-8 max-w-3xl leading-relaxed text-gray-600">{copy.imaging}</p>
          <Link href={`${prefix}/esztergom`} className="mt-3 inline-block font-bold text-sky-700 underline underline-offset-4">Crown Dental Belváros · Petőfi Sándor utca 11.</Link>
        </div>
      </section>
      <section className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(CLINIC_LOCATIONS[1].address)}&output=embed`} title="Crown Dental Prímás Sziget — Helischer József út 6." loading="lazy" className="h-80 w-full rounded-3xl border-0" referrerPolicy="no-referrer-when-downgrade" />
        <div>
          <h2 className="text-3xl font-black">{copy.book}</h2>
          <p className="my-6 leading-relaxed text-gray-600">{copy.bookingNote}</p>
          <Link href={`${prefix}/idopont`} className="inline-block rounded-2xl bg-sky-600 px-6 py-4 font-bold text-white hover:bg-sky-700">{copy.book}</Link>
        </div>
      </section>
    </main>
  );
}
