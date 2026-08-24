import type { Metadata } from 'next';
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  safeJsonLd,
  type SupportedLocale,
} from '@/lib/seo';

type BudapestLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const metadataByLocale: Record<
  SupportedLocale,
  { title: string; description: string; keywords: string[] }
> = {
  hu: {
    title: 'Hamarosan nyíló fogorvosi rendelő Budapesten | Crown Dental',
    description:
      'A Crown Dental budapesti fogorvosi rendelője előkészítés alatt áll. A nyitásig teljes körű fogászati ellátással esztergomi rendelőnkben várjuk pácienseinket.',
    keywords: ['fogorvos Budapest', 'fogászat Budapest', 'Crown Dental Budapest', 'fogorvos Római-part'],
  },
  en: {
    title: 'Crown Dental Budapest opening soon | Dental clinic',
    description:
      'The Crown Dental Budapest clinic is currently in preparation. Until it opens, patients are welcome at our fully operational clinic in Esztergom.',
    keywords: ['dentist Budapest', 'dental clinic Budapest', 'Crown Dental Budapest'],
  },
  sk: {
    title: 'Crown Dental Budapešť – otvorenie čoskoro | Zubná klinika',
    description:
      'Budapeštianska klinika Crown Dental sa pripravuje. Do otvorenia poskytujeme kompletnú zubnú starostlivosť v našej fungujúcej klinike v Ostrihome.',
    keywords: ['zubár Budapešť', 'zubná klinika Budapešť', 'Crown Dental Budapešť'],
  },
  de: {
    title: 'Crown Dental Budapest – Eröffnung demnächst | Zahnklinik',
    description: 'Die Crown Dental Praxis in Budapest befindet sich in Vorbereitung. Bis zur Eröffnung begrüßen wir Patienten in unserer vollständig geöffneten Praxis in Esztergom.',
    keywords: ['Zahnarzt Budapest', 'Zahnklinik Budapest', 'Crown Dental Budapest'],
  },
};

export async function generateMetadata(props: BudapestLayoutProps): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({
    locale,
    path: 'budapest',
    image: '/og-budapest.jpg',
    ...metadataByLocale[locale],
  });
}

export default async function BudapestLayout(props: BudapestLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  const locale = normalizeLocale(params.locale);
  const pageUrl = localizedUrl(locale, 'budapest');
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: metadataByLocale[locale].title,
    description: metadataByLocale[locale].description,
    inLanguage: locale,
    isPartOf: { '@id': 'https://www.crowndental.hu/#website' },
    about: {
      '@type': 'Place',
      name: 'Crown Dental Budapest – hamarosan',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Királyok útja 55.',
        addressLocality: 'Budapest',
        addressRegion: 'Budapest III. kerület',
        postalCode: '1039',
        addressCountry: 'HU',
      },
    },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    locale,
    'budapest',
    locale === 'sk' ? 'Crown Dental Budapešť' : 'Crown Dental Budapest',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
