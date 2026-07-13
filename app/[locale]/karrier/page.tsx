import type { Metadata } from 'next';
import CareerClient from './CareerClient';
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  type SupportedLocale,
} from '@/lib/seo';

type CareerPageProps = { params: { locale: string } };

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Fogászati állások Esztergomban | Karrier a Crown Dentalnál',
    description: 'Csatlakozzon a Crown Dental esztergomi csapatához. Modern rendelő, saját fogtechnikai labor és szakmai fejlődési lehetőség.',
  },
  en: {
    title: 'Dental careers in Esztergom | Join Crown Dental',
    description: 'Explore career opportunities at Crown Dental Esztergom, with a modern clinic, an in-house dental laboratory and professional development.',
  },
  sk: {
    title: 'Práca v zubnej klinike v Ostrihome | Crown Dental',
    description: 'Pridajte sa k tímu Crown Dental v Ostrihome. Moderná klinika, vlastné zubnotechnické laboratórium a možnosti odborného rastu.',
  },
};

export function generateMetadata({ params }: CareerPageProps): Metadata {
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'karrier', ...metadataByLocale[locale] });
}

export default function CareerPage({ params }: CareerPageProps) {
  const locale = normalizeLocale(params.locale);
  const url = localizedUrl(locale, 'karrier');
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: metadataByLocale[locale].title,
    description: metadataByLocale[locale].description,
    url,
    inLanguage: locale,
    about: { '@id': 'https://www.crowndental.hu/#organization' },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    locale,
    'karrier',
    locale === 'sk' ? 'Kariéra' : locale === 'en' ? 'Careers' : 'Karrier',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CareerClient />
    </>
  );
}
