import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ClientLayout from "./ClientLayout";
import { SITE_URL, normalizeLocale } from '@/lib/seo';

const locales = ['hu', 'en', 'sk'];

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// Dinamikus metadata localenként
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = normalizeLocale(params.locale);

  const titles: Record<string, string> = {
    hu: 'Crown Dental Esztergom | Fogászat saját laborral',
    en: 'Crown Dental Esztergom | Dentistry with an in-house laboratory',
    sk: 'Crown Dental Ostrihom | Zubná klinika s vlastným laboratóriom',
  };
  const descriptions: Record<string, string> = {
    hu: 'Modern fogászati ellátás Esztergomban saját fogtechnikai laborral, hétvégi rendelés és online időpontkérés magyar és szlovák pácienseknek.',
    en: 'Modern dental care in Esztergom with an in-house laboratory, weekend appointments and online booking.',
    sk: 'Moderná zubná klinika v Ostrihome s vlastným laboratóriom, víkendovými termínmi a online rezerváciou.',
  };

  const localeMap: Record<string, string> = { hu: 'hu_HU', en: 'en_US', sk: 'sk_SK' };

  return {
    metadataBase: new URL(SITE_URL),
    title: titles[locale] ?? titles.hu,
    description: descriptions[locale] ?? descriptions.hu,
    robots: { index: true, follow: true },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
    openGraph: { siteName: 'Crown Dental', locale: localeMap[locale] ?? 'hu_HU', type: 'website' },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Crown Dental',
      legalName: 'Crown Dental Praxis és Labor Fogászati Kft.',
      alternateName: ['Crown Dental Esztergom', 'Crown Dental Ostrihom'],
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.webp` },
      image: `${SITE_URL}/og-image.jpg`,
      telephone: '+36705646837',
      email: 'info@crowndental.hu',
      foundingDate: '1994',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Petőfi Sándor utca 11.',
        addressLocality: 'Esztergom',
        addressRegion: 'Komárom-Esztergom',
        postalCode: '2500',
        addressCountry: 'HU',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+36705646837',
        contactType: 'appointments',
        availableLanguage: ['hu', 'sk', 'en'],
        areaServed: ['HU', 'SK'],
      },
      sameAs: [
        'https://www.facebook.com/koronafogaszatesztergom/',
        'https://www.instagram.com/crown_dental93/',
        'https://www.tiktok.com/@crowndentalhungary',
        'https://www.google.com/maps?cid=13855060144941940295',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Crown Dental',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['hu', 'sk', 'en'],
    },
  ],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!locales.includes(locale)) notFound();

  // Fordítási üzenetek betöltése
  const messages = await getMessages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9BS3P1DC4T" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-9BS3P1DC4T');gtag('config','AW-16510822421');`}
      </Script>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1245020569792754');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img height="1" width="1" style={{display:'none'}} src="https://www.facebook.com/tr?id=1245020569792754&ev=PageView&noscript=1" alt="" />
      </noscript>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ClientLayout>{children}</ClientLayout>
      </NextIntlClientProvider>
    </>
  );
}
