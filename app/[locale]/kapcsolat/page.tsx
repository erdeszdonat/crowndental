import type { Metadata } from 'next';
import ContactClient from './ContactClient';

type Props = {
  params: { locale: string };
};

const metadataByLocale: Record<string, { title: string; description: string; canonical: string }> = {
  hu: {
    title: 'Kapcsolat | Crown Dental',
    description: 'Lépjen kapcsolatba a Crown Dental esztergomi rendelőjével. Telefon, e-mail, útvonalterv és gyors online időpontfoglalás.',
    canonical: 'https://www.crowndental.hu/kapcsolat',
  },
  en: {
    title: 'Contact | Crown Dental',
    description: 'Contact the Crown Dental clinic in Esztergom. Phone, email, directions and fast online appointment booking.',
    canonical: 'https://www.crowndental.hu/en/kapcsolat',
  },
  sk: {
    title: 'Kontakt | Crown Dental',
    description: 'Kontaktujte ambulanciu Crown Dental v Ostrihome. Telefón, e-mail, navigácia a rýchla online rezervácia termínu.',
    canonical: 'https://www.crowndental.hu/sk/kapcsolat',
  },
};

export function generateMetadata({ params }: Props): Metadata {
  const metadata = metadataByLocale[params.locale] ?? metadataByLocale.hu;

  return {
    title: { absolute: metadata.title },
    description: metadata.description,
    alternates: {
      canonical: metadata.canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
      siteName: 'Crown Dental',
      type: 'website',
      images: [{ url: 'https://www.crowndental.hu/og-image.jpg', width: 1200, height: 630, alt: 'Crown Dental kapcsolat' }],
    },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Kapcsolat - Crown Dental',
  url: 'https://www.crowndental.hu/kapcsolat',
  mainEntity: {
    '@type': 'Dentist',
    name: 'Crown Dental',
    telephone: '+36305892468',
    email: 'info@crowndental.hu',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Petőfi Sándor utca 11.',
        addressLocality: 'Esztergom',
        postalCode: '2500',
        addressCountry: 'HU',
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
