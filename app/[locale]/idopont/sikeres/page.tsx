import type { Metadata } from 'next';
import BookingSuccessClient from './BookingSuccessClient';

type Props = {
  params: { locale: string };
};

const metadataByLocale: Record<string, { title: string; description: string; canonical: string }> = {
  hu: {
    title: 'Sikeres foglalás | Crown Dental',
    description: 'Köszönjük az időpontkérést. Kollégánk hamarosan felveszi Önnel a kapcsolatot a visszaigazoláshoz.',
    canonical: 'https://www.crowndental.hu/idopont/sikeres',
  },
  en: {
    title: 'Booking received | Crown Dental',
    description: 'Thank you for your appointment request. Our colleague will contact you shortly to confirm the details.',
    canonical: 'https://www.crowndental.hu/en/idopont/sikeres',
  },
  sk: {
    title: 'Rezervácia prijatá | Crown Dental',
    description: 'Ďakujeme za vašu žiadosť o termín. Náš kolega vás čoskoro kontaktuje kvôli potvrdeniu.',
    canonical: 'https://www.crowndental.hu/sk/idopont/sikeres',
  },
};

export function generateMetadata({ params }: Props): Metadata {
  const metadata = metadataByLocale[params.locale] ?? metadataByLocale.hu;

  return {
    title: { absolute: metadata.title },
    description: metadata.description,
    robots: { index: false, follow: false },
    alternates: {
      canonical: metadata.canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
      siteName: 'Crown Dental',
      type: 'website',
    },
  };
}

export default function BookingSuccessPage() {
  return <BookingSuccessClient />;
}
