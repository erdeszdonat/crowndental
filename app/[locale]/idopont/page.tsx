import type { Metadata } from 'next';
import BookingClient from './BookingClient';
import {
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  type SupportedLocale,
} from '@/lib/seo';

type BookingPageProps = { params: { locale: string } };

const metadataByLocale: Record<SupportedLocale, { title: string; description: string; keywords: string[] }> = {
  hu: {
    title: 'Online időpontkérés fogorvoshoz Esztergomban | Crown Dental',
    description: 'Kérjen online fogászati időpontot a Crown Dental esztergomi rendelőjébe. A kérés elküldése után kollégánk felveszi Önnel a kapcsolatot.',
    keywords: ['fogorvos időpont Esztergom', 'fogászati időpontkérés', 'Crown Dental időpont'],
  },
  en: {
    title: 'Request a dental appointment in Esztergom | Crown Dental',
    description: 'Request a dental appointment at Crown Dental Esztergom online. Our team will contact you to confirm the exact time and details.',
    keywords: ['dentist appointment Esztergom', 'book dentist Hungary', 'Crown Dental appointment'],
  },
  sk: {
    title: 'Online rezervácia termínu u zubára v Ostrihome | Crown Dental',
    description: 'Požiadajte online o termín v Crown Dental Ostrihom. Náš tím vás bude kontaktovať a potvrdí presný čas a podrobnosti.',
    keywords: ['zubár Ostrihom termín', 'rezervácia zubár Maďarsko', 'Crown Dental termín'],
  },
  de: {
    title: 'Zahnarzttermin in Esztergom anfragen | Crown Dental',
    description: 'Fragen Sie online einen Termin bei Crown Dental Esztergom an. Unser Team meldet sich bei Ihnen, um die genaue Zeit und alle Einzelheiten zu bestätigen.',
    keywords: ['Zahnarzttermin Esztergom', 'Zahnarzt Ungarn buchen', 'Crown Dental Termin'],
  },
};

export function generateMetadata({ params }: BookingPageProps): Metadata {
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'idopont', ...metadataByLocale[locale] });
}

export default function BookingPage({ params }: BookingPageProps) {
  const locale = normalizeLocale(params.locale);
  const url = localizedUrl(locale, 'idopont');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: metadataByLocale[locale].title,
    description: metadataByLocale[locale].description,
    url,
    inLanguage: locale,
    about: { '@id': 'https://www.crowndental.hu/esztergom#dentist' },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Fogászati időpontkérés' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BookingClient />
    </>
  );
}
