import type { Metadata } from "next";
import Script from "next/script";
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ClientLayout from "./ClientLayout";

const locales = ['hu', 'en', 'sk'];

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// Dinamikus metadata localenként
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;

  const titles: Record<string, string> = {
    hu: 'Crown Dental | Prémium Fogászat Saját Laborral – Esztergom & Budapest',
    en: 'Crown Dental | Premium Dentistry with Own Lab – Esztergom & Budapest',
    sk: 'Crown Dental | Prémiová Stomatológia s Vlastným Lab – Ostrihom & Budapešť',
  };
  const descriptions: Record<string, string> = {
    hu: 'Prémium fogászati ellátás Esztergomban és Budapesten. Fájdalommentes kezelések, saját labor, akár 40%-kal kedvezőbb árak.',
    en: 'Premium dental care in Esztergom and Budapest. Pain-free treatments, in-house lab, up to 40% lower prices.',
    sk: 'Prémiová stomatologická starostlivosť v Ostrihome a Budapešti. Bezbolestné ošetrenia, vlastné laboratórium, ceny až o 40 % nižšie.',
  };

  const localeMap: Record<string, string> = { hu: 'hu_HU', en: 'en_US', sk: 'sk_SK' };

  return {
    title: {
      default: titles[locale] ?? titles.hu,
      template: '%s | Crown Dental',
    },
    description: descriptions[locale] ?? descriptions.hu,
    robots: { index: true, follow: true },
    openGraph: {
      title: titles[locale] ?? titles.hu,
      description: descriptions[locale] ?? descriptions.hu,
      url: 'https://www.crowndental.hu',
      siteName: 'Crown Dental',
      locale: localeMap[locale] ?? 'hu_HU',
      type: 'website',
    },
    alternates: {
      canonical: locale === 'hu' ? 'https://www.crowndental.hu' : `https://www.crowndental.hu/${locale}`,
      languages: {
        'hu': 'https://www.crowndental.hu',
        'en': 'https://www.crowndental.hu/en',
        'sk': 'https://www.crowndental.hu/sk',
      },
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Crown Dental',
  url: 'https://www.crowndental.hu',
  telephone: '+36705646837',
  foundingDate: '1994',
};

const esztergomJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: 'Crown Dental – Esztergom',
  url: 'https://www.crowndental.hu/esztergom',
  telephone: '+36705646837',
  foundingDate: '1994',
  image: 'https://www.crowndental.hu/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Petőfi Sándor utca 11.',
    addressLocality: 'Esztergom',
    postalCode: '2500',
    addressCountry: 'HU',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 47.7951, longitude: 18.7408 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
  ],
  priceRange: '$$',
};

const budapestJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: 'Crown Dental – Budapest',
  url: 'https://www.crowndental.hu/budapest',
  telephone: '+36705646837',
  image: 'https://www.crowndental.hu/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Királyok útja 55.',
    addressLocality: 'Budapest',
    postalCode: '1039',
    addressCountry: 'HU',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 47.5560, longitude: 19.0372 },
  priceRange: '$$',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!locales.includes(locale)) notFound();

  // Fordítási üzenetek betöltése
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* SEO JSON-LD adatok bekötése */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(esztergomJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(budapestJsonLd) }}
        />
      </head>
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9BS3P1DC4T" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-9BS3P1DC4T');`}
        </Script>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}