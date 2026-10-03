import type { Metadata } from 'next';
import { SITE_URL, HREFLANG_BY_LOCALE, buildLocalizedMetadata, localizedUrl, safeJsonLd } from '@/lib/seo';
import { buildVeneerOfferSchema, VENEERS } from '@/lib/veneers.mjs';
import { getVeneerLabels, normalizeVeneerLocale } from '@/lib/veneerI18n';
import { getVeneerContent, getVeneerUi, type VeneerFaq, type VeneerSlug } from './VeneerContent';

export function veneerMetadata(title: string, description: string, path: string, locale = 'hu'): Metadata {
  return buildLocalizedMetadata({ locale, path, title, description });
}

export default function VeneerSeo({ name, path, faqs, slug, now, locale = 'hu' }: {
  name: string;
  path: string;
  faqs: VeneerFaq[];
  slug?: VeneerSlug;
  now?: string;
  locale?: string;
}) {
  const language = normalizeVeneerLocale(locale);
  const labels = getVeneerLabels(language);
  const ui = getVeneerUi(language);
  const url = localizedUrl(language, path);
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Crown Dental', item: localizedUrl(language) },
    ...(slug ? [{ '@type': 'ListItem', position: 2, name: ui.treatments, item: localizedUrl(language, '/kezelesek') }] : []),
    { '@type': 'ListItem', position: slug ? 3 : 2, name, item: url },
  ];
  const treatmentName = slug === 'direkt-hej' ? labels.directName : labels.indirectName;
  const offer = slug ? buildVeneerOfferSchema(slug, SITE_URL, now) : null;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, name, url, inLanguage: HREFLANG_BY_LOCALE[language],
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbs },
      {
        '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: HREFLANG_BY_LOCALE[language],
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question', name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      ...(slug && offer ? [{
        '@type': 'Service', '@id': `${url}#service`, url,
        name: treatmentName, description: getVeneerContent(slug, language).description,
        serviceType: treatmentName,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'City', name: 'Esztergom' },
        offers: {
          ...offer,
          url,
          priceSpecification: { ...offer.priceSpecification, unitText: labels.perTooth },
        },
      }] : [{
        '@type': 'ItemList', name: ui.serviceList,
        itemListElement: Object.values(VENEERS).map((treatment, index) => ({
          '@type': 'ListItem', position: index + 1,
          name: treatment.slug === 'direkt-hej' ? labels.directName : labels.indirectName,
          url: localizedUrl(language, treatment.path),
        })),
      }]),
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}
