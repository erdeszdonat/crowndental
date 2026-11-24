import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { itopCopy, itopFees, itopPractitioner, itopVisits } from '@/lib/itop';
import { patientGuideLinks } from '@/lib/patientGuideLinks';
import { hygieneFee } from '@/lib/hygiene';
import { buildBreadcrumbJsonLd, buildLocalizedMetadata, localePrefix, localizedUrl, normalizeLocale, safeJsonLd, SITE_URL } from '@/lib/seo';
import { getSiteCopy } from '@/lib/siteCopy';

const path = 'kezelesek/itop';
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale((await params).locale);
  const { title, description } = itopCopy[locale];
  return buildLocalizedMetadata({ locale, path, title: title + ' | Crown Dental', description });
}

export default async function ItopPage({ params }: Props) {
  const locale = normalizeLocale((await params).locale);
  const prefix = localePrefix(locale);
  const copy = itopCopy[locale];
  const site = getSiteCopy(locale);
  const visits = (['itop', 'itop-kontroll'] as const).map(id => ({
    id, name: itopVisits[id][locale], price: itopFees[id], href: prefix + '/idopont?kezeles=' + id,
    detail: id === 'itop' ? copy.first : copy.control, action: id === 'itop' ? copy.bookFirst : copy.bookControl,
  }));
  const url = localizedUrl(locale, path);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', url,
    name: copy.title, description: copy.lead, areaServed: 'Esztergom',
    provider: { '@id': SITE_URL + '/#organization' },
    offers: visits.map(visit => ({ '@type': 'Offer', name: visit.name, price: visit.price, priceCurrency: 'HUF', url: SITE_URL + visit.href })),
  };
  return <main className="crown-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(locale, path, copy.title)) }} />
    <section className="crown-clinical-hero" data-cta-location="treatment_hero">
      <div className="crown-container">
        <Link className="crown-back" href={prefix + '/kezelesek'}><ArrowLeft size={16} />{site.back}</Link>
        <div className="crown-hero-grid">
          <div><h1>{copy.title}</h1><p className="crown-lead">{copy.lead}</p>
            <Link className="mt-5 inline-block font-semibold underline underline-offset-4" href={prefix + '/kartya/' + itopPractitioner}>{copy.meet}</Link>
          </div>
          <div className="space-y-4">{visits.map(visit => <section id={visit.id} key={visit.id} className="scroll-mt-28 rounded-2xl border border-sky-200 bg-white p-5 text-slate-900 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-bold">{visit.name}</h2><strong>{hygieneFee(locale, visit.price)}</strong></div>
            <p className="my-3 leading-relaxed">{visit.detail}</p>
            <Link className="crown-button" data-booking-cta href={visit.href}>{visit.action}<ArrowUpRight aria-hidden="true" size={16} /></Link>
          </section>)}</div>
        </div>
      </div>
    </section>
    <div className="crown-container grid gap-10 py-12 md:grid-cols-2 md:py-16">
      <section><h2 className="mb-4 text-2xl font-bold">{copy.practice}</h2>
        <ol className="list-decimal space-y-3 pl-5">{copy.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <section><h2 className="mb-4 text-2xl font-bold">{copy.braces}</h2>
        <p className="leading-relaxed">{copy.bracesText}</p>
        <div className="mt-4 grid gap-3 font-semibold text-sky-800 underline underline-offset-4">
          {locale === 'hu' && <Link href={'/blog/' + patientGuideLinks.itop.slug}>{patientGuideLinks.itop.label}</Link>}
          <Link href={prefix + '/kezelesek/fogszabalyozas'}>{copy.ortho}</Link>
        </div>
      </section>
    </div>
  </main>;
}
