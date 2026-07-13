import type { Metadata } from 'next';
import RolunkClient from './RolunkClient';
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  type SupportedLocale,
} from '@/lib/seo';

type AboutPageProps = { params: { locale: string } };

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Rólunk | Crown Dental Esztergom – saját labor 1994 óta',
    description:
      'Ismerje meg a Crown Dental esztergomi fogászati rendelőt és saját fogtechnikai laborját, amely 1994 óta dolgozik a tartós, esztétikus mosolyokért.',
  },
  en: {
    title: 'About Crown Dental Esztergom | In-house laboratory since 1994',
    description:
      'Discover Crown Dental Esztergom and its in-house dental laboratory, working together to create durable and natural-looking smiles since 1994.',
  },
  sk: {
    title: 'O Crown Dental Ostrihom | Vlastné laboratórium od roku 1994',
    description:
      'Spoznajte kliniku Crown Dental v Ostrihome a jej vlastné zubnotechnické laboratórium, ktoré od roku 1994 spolupracujú na kvalitných náhradách.',
  },
  de: {
    title: 'Über Crown Dental Esztergom | Eigenes Dentallabor seit 1994',
    description: 'Lernen Sie Crown Dental Esztergom und unser eigenes Dentallabor kennen, die seit 1994 gemeinsam langlebigen und natürlich wirkenden Zahnersatz schaffen.',
  },
};

export function generateMetadata({ params }: AboutPageProps): Metadata {
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'rolunk', ...metadataByLocale[locale] });
}

export default function RolunkPage({ params }: AboutPageProps) {
  const locale = normalizeLocale(params.locale);
  const url = localizedUrl(locale, 'rolunk');
  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    url,
    name: metadataByLocale[locale].title,
    description: metadataByLocale[locale].description,
    inLanguage: locale,
    mainEntity: { '@id': 'https://www.crowndental.hu/#organization' },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    locale,
    'rolunk',
    locale === 'sk' ? 'O nás' : locale === 'en' ? 'About us' : locale === 'de' ? 'Über uns' : 'Rólunk',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <RolunkClient />
    </>
  );
}
