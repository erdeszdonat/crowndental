import type { Metadata } from 'next';
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
      'Crown Dental Esztergom elérhetőségei: 2500 Esztergom, Petőfi Sándor utca 11. Telefon, e-mail, útvonalterv és online időpontkérés.',
  },
  en: {
    title: 'Contact and directions | Crown Dental dentist Esztergom',
    description:
      'Contact Crown Dental Esztergom at 11 Petőfi Sándor Street, 2500 Esztergom. Phone, email, directions and online appointment requests.',
  },
  sk: {
    title: 'Kontakt a navigácia | Crown Dental zubár Ostrihom',
    description:
      'Kontaktujte Crown Dental Ostrihom na adrese Petőfi Sándor utca 11, 2500 Esztergom. Telefón, e-mail, navigácia a online rezervácia.',
  },
  de: {
    title: 'Kontakt und Anfahrt | Crown Dental Zahnarzt Esztergom',
    description: 'Kontaktieren Sie Crown Dental Esztergom in der Petőfi Sándor utca 11, 2500 Esztergom. Telefon, E-Mail, Anfahrt und Online-Terminbuchung.',
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
    mainEntity: { '@id': 'https://www.crowndental.hu/esztergom#dentist' },
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
