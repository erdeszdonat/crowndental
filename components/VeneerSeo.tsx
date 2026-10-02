import type { Metadata } from 'next';
import { SITE_URL, safeJsonLd } from '@/lib/seo';
import { buildVeneerOfferSchema, VENEERS } from '@/lib/veneers.mjs';
import type { VeneerFaq, VeneerSlug } from './VeneerContent';

export function veneerMetadata(title: string, description: string, path: string): Metadata {
  const canonical = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { 'hu-HU': canonical } },
    robots: { index: true, follow: true },
    openGraph: {
      title, description, url: canonical, siteName: 'Crown Dental',
      locale: 'hu_HU', type: 'website',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Crown Dental Esztergom' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/og-image.jpg`] },
  };
}

export default function VeneerSeo({ name, path, faqs, slug, now }: {
  name: string;
  path: string;
  faqs: VeneerFaq[];
  slug?: VeneerSlug;
  now?: string;
}) {
  const url = `${SITE_URL}${path}`;
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Crown Dental', item: SITE_URL },
    ...(slug ? [{ '@type': 'ListItem', position: 2, name: 'Kezelések', item: `${SITE_URL}/kezelesek` }] : []),
    { '@type': 'ListItem', position: slug ? 3 : 2, name, item: url },
  ];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, name, url, inLanguage: 'hu-HU',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbs },
      {
        '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: 'hu-HU',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question', name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      ...(slug ? [{
        '@type': 'Service', '@id': `${url}#service`, url,
        name: VENEERS[slug].name, description: VENEERS[slug].description,
        serviceType: VENEERS[slug].name,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'City', name: 'Esztergom' },
        offers: buildVeneerOfferSchema(slug, SITE_URL, now),
      }] : [{
        '@type': 'ItemList', name: 'Fogászati héj kezelések',
        itemListElement: Object.values(VENEERS).map((treatment, index) => ({
          '@type': 'ListItem', position: index + 1, name: treatment.name, url: `${SITE_URL}${treatment.path}`,
        })),
      }]),
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}
