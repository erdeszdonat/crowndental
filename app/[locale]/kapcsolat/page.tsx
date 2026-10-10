import type { Metadata } from 'next';
import { buildLocationSchema } from '@/lib/clinicSchema';
import ContactClient from './ContactClient';
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  safeJsonLd,
  type SupportedLocale,
} from '@/lib/seo';

type ContactPageProps = { params: Promise<{ locale: string }> };

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Kapcsolat és útvonal | Crown Dental fogorvos Esztergom',
    description:
      'Crown Dental Esztergom elérhetőségei: Belváros, Petőfi Sándor utca 11.; Prímás Sziget, Helischer József út 6. Telefon, útvonalterv és időpontkérés.',
  },
  en: {
    title: 'Contact and directions | Crown Dental dentist Esztergom',
    description:
      'Contact both Crown Dental Esztergom clinics: Belváros, Petőfi Sándor utca 11, and Prímás Sziget, Helischer József út 6. Directions and appointments.',
  },
  sk: {
    title: 'Kontakt a navigácia | Crown Dental zubár Ostrihom',
    description:
      'Crown Dental Ostrihom: Belváros, Petőfi Sándor utca 11, a Prímás Sziget, Helischer József út 6. Kontakty, navigácia a online žiadosť o termín.',
  },
  de: {
    title: 'Kontakt und Anfahrt | Crown Dental Zahnarzt Esztergom',
    description: 'Crown Dental Esztergom: Belváros, Petőfi Sándor utca 11, und Prímás Sziget, Helischer József út 6. Kontakt, Anfahrt und Terminanfrage.',
  },
};

export async function generateMetadata(props: ContactPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'kapcsolat', ...metadataByLocale[locale] });
}

export default async function ContactPage(props: ContactPageProps) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  const url = localizedUrl(locale, 'kapcsolat');
  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    name: metadataByLocale[locale].title,
    description: metadataByLocale[locale].description,
    url,
    inLanguage: locale,
    mainEntity: [buildLocationSchema(locale, 0), buildLocationSchema(locale, 1)],
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    locale,
    'kapcsolat',
    locale === 'sk' ? 'Kontakt' : locale === 'en' ? 'Contact' : locale === 'de' ? 'Kontakt' : 'Kapcsolat',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(contactPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <ContactClient />
    </>
  );
}
