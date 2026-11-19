import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import ClinicPhoneLinks from './ClinicPhoneLinks';
import { hygieneCopy, hygieneFee, hygieneGuides, hygienePrices, type HygieneSlug } from '@/lib/hygiene';
import { buildBreadcrumbJsonLd, buildLocalizedMetadata, localePrefix, localizedUrl, normalizeLocale, safeJsonLd, SITE_URL } from '@/lib/seo';
import { getSiteCopy } from '@/lib/siteCopy';

export function hygieneMetadata(language: string, slug: HygieneSlug) {
  const locale = normalizeLocale(language);
  const { copy, service } = hygieneCopy(locale, slug);
  const fee = hygieneFee(locale, hygienePrices[slug]);
  return buildLocalizedMetadata({
    locale, path: 'kezelesek/' + slug, title: service.title + ' | Crown Dental',
    description: service.name + ' · ' + fee + ' / ' + copy.unit + '. ' + service.lead,
    image: '/images/hygiene/' + slug + '.webp', imageHeight: 675,
  });
}

export default function HygieneService({ language, slug }: { language: string; slug: HygieneSlug }) {
  const locale = normalizeLocale(language);
  const p = localePrefix(locale), site = getSiteCopy(locale);
  const { copy, service } = hygieneCopy(locale, slug);
  const price = hygienePrices[slug], fee = (amount: number) => hygieneFee(locale, amount);
  const other = slug === 'air-polishing' ? 'premium-biofilm-terapia' : 'air-polishing';
  const path = 'kezelesek/' + slug, url = localizedUrl(locale, path);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', url, name: service.name,
    description: service.lead, image: SITE_URL + '/images/hygiene/' + slug + '.webp',
    provider: { '@id': SITE_URL + '/#organization' }, areaServed: 'Esztergom',
    offers: { '@type': 'Offer', url, priceCurrency: 'HUF', price, priceSpecification: {
      '@type': 'UnitPriceSpecification', price, priceCurrency: 'HUF',
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: copy.unit },
    } },
  };
  const booking = p + '/idopont?kezeles=' + slug;
  return <main className="crown-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(locale, path, service.name)) }} />
    <section className="crown-clinical-hero" data-cta-location="treatment_hero">
      <div className="crown-container">
        <Link className="crown-back" href={p + '/kezelesek'}><ArrowLeft size={16} />{site.back}</Link>
        <div className="crown-hero-grid">
          <div>
            <h1>{service.title}</h1>
            <p className="crown-lead">{service.lead}</p>
            <p className="mt-5 text-2xl font-bold">{fee(price)} / {copy.unit}</p>
            <div className="crown-actions"><Link className="crown-button" href={booking}>{site.book}<ArrowUpRight size={18} /></Link><ClinicPhoneLinks tone="light" /></div>
          </div>
          <figure><img className="w-full rounded-3xl" src={'/images/hygiene/' + slug + '.webp'} width={1200} height={675} fetchPriority="high" alt={service.alt} />
            <figcaption className="mt-2 text-sm text-slate-600">{copy.imageLabel}</figcaption></figure>
        </div>
      </div>
    </section>
    <div className="crown-container grid gap-12 py-12 lg:grid-cols-[1.25fr_1fr] lg:py-20">
      <div className="space-y-8">
        <section><h2 className="mb-4 text-3xl font-bold">{copy.process}</h2><ol className="list-decimal space-y-4 pl-6">{service.steps.map(step => <li key={step}>{step}</li>)}</ol></section>
        <section><h2 className="mb-3 text-2xl font-bold">{service.question}</h2><p>{service.answer}</p></section>
        {locale === 'hu' && <Link className="font-semibold text-sky-800 underline" href={'/blog/' + hygieneGuides[slug]}>{slug === 'air-polishing' ? 'Kávéfolt vagy fogkő? Így segíthet az air polishing' : 'Mit mutat meg a lepedékfestés fogmosás után?'}</Link>}
      </div>
      <section className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-5 text-2xl font-bold">{copy.prices}</h2>
        <dl className="space-y-4">{([['fogko', copy.base], ['air-polishing', copy.air.name], ['premium-biofilm-terapia', copy.bio.name]] as const).map(([id, name]) =>
          <div key={id}><dt>{name}</dt><dd className="font-semibold">{fee(hygienePrices[id])} / {copy.unit}</dd></div>)}</dl>
        <p className="my-5 border-t border-slate-300 pt-4">{service.name} · {copy.both} · <strong>{fee(2 * price)}</strong></p>
        <Link className="crown-button" href={booking}>{site.book}<ArrowUpRight size={16} /></Link>
        <p className="mt-5"><Link className="font-semibold text-sky-800 underline" href={p + '/kezelesek/' + other}>{hygieneCopy(locale, other).service.name}</Link></p>
      </section>
    </div>
  </main>;
}
