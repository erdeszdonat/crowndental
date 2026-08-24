import type { Metadata } from 'next';
import { createClient } from 'next-sanity';
import CareerClient from './CareerClient';
import { apiVersion, dataset, projectId } from '@/sanity/env';
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  safeJsonLd,
  type SupportedLocale,
} from '@/lib/seo';

type CareerPageProps = { params: Promise<{ locale: string }> };

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const careerHeroImageQuery = `*[_type == "treatment" && slug.current == "karrier"][0]{
  "url": coalesce(mainImage.asset->url, heroImage.asset->url)
}`;

async function getCareerHeroImageUrl(): Promise<string | null> {
  try {
    const result = await client.fetch<{ url?: string } | null>(
      careerHeroImageQuery,
      {},
      { next: { revalidate: 3600 } },
    );

    if (!result?.url) return null;

    const url = new URL(result.url);
    return url.protocol === 'https:' && url.hostname === 'cdn.sanity.io' ? url.toString() : null;
  } catch (error) {
    console.error('Karrier hero Sanity kép betöltési hiba:', error);
    return null;
  }
}

export const revalidate = 3600;

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
  de: {
    title: 'Karriere in der Zahnmedizin in Esztergom | Crown Dental',
    description: 'Werden Sie Teil des Teams von Crown Dental Esztergom: moderne Praxis, eigenes Dentallabor und Möglichkeiten zur fachlichen Weiterentwicklung.',
  },
};

export async function generateMetadata(props: CareerPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'karrier', ...metadataByLocale[locale] });
}

export default async function CareerPage(props: CareerPageProps) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  const heroImageUrl = await getCareerHeroImageUrl();
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
    locale === 'sk' ? 'Kariéra' : locale === 'en' ? 'Careers' : locale === 'de' ? 'Karriere' : 'Karrier',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <CareerClient heroImageUrl={heroImageUrl} />
    </>
  );
}
