import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ═══════════════════════════════════════════════════════════════════════════
// ALAPÉRTELMEZETT METADATA - Ez vonatkozik a főoldalra (/) és minden oldalra,
// ami nem definiál saját metadata-t
// ═══════════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  // Alapértelmezett title template - az al-oldalak title-je így jelenik meg: "Oldal neve | Crown Dental"
  title: {
    default: 'Crown Dental | Prémium Fogászat Saját Laborral – Esztergom & Budapest',
    template: '%s | Crown Dental',
  },
  description: 'Töltsd fel más klinika árajánlatát és nézd meg, mennyit spórolhatsz nálunk! Saját fogtechnikai labor = akár 40% megtakarítás. 30+ év tapasztalat, prémium minőség. Esztergom és Budapest.',
  keywords: [
    'fogászat',
    'fogorvos',
    'crown dental',
    'fogászat esztergom',
    'fogászat budapest',
    'saját fogtechnikai labor',
    'implantátum',
    'fogkorona',
    'fogszabályozás',
  ],
  authors: [{ name: 'Crown Dental' }],
  creator: 'Crown Dental',
  publisher: 'Crown Dental Praxis és Labor Kft.',
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph - Facebook, LinkedIn
  openGraph: {
    title: 'Crown Dental | Prémium Fogászat Saját Laborral',
    description: 'Saját fogtechnikai labor = akár 40% megtakarítás. 30+ év tapasztalat Esztergomban és Budapesten.',
    url: 'https://www.crowndental.hu',
    siteName: 'Crown Dental',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: 'https://www.crowndental.hu/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Crown Dental - Prémium fogászat saját laborral',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Crown Dental | Prémium Fogászat',
    description: 'Saját labor = akár 40% megtakarítás. 30+ év tapasztalat.',
    images: ['https://www.crowndental.hu/og-image.jpg'],
  },

  // Egyéb
  metadataBase: new URL('https://www.crowndental.hu'),
  alternates: {
    canonical: '/',
  },
  
  // Ikonok
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD STRUKTURÁLT ADATOK - Globális Organization schema
// ═══════════════════════════════════════════════════════════════════════════
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.crowndental.hu/#organization',
  name: 'Crown Dental',
  url: 'https://www.crowndental.hu',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.crowndental.hu/logo.webp',
    width: 280,
    height: 80,
  },
  description: 'Prémium fogászat saját fogtechnikai laborral Esztergomban és Budapesten. 30+ év tapasztalat.',
  foundingDate: '1994',
  telephone: '+36705646837',
  email: 'info@crowndental.hu',
  address: [
    {
      '@type': 'PostalAddress',
      name: 'Crown Dental Esztergom',
      streetAddress: 'Petőfi Sándor utca 11.',
      addressLocality: 'Esztergom',
      postalCode: '2500',
      addressCountry: 'HU',
    },
    {
      '@type': 'PostalAddress',
      name: 'Crown Dental Budapest',
      streetAddress: 'Királyok Útja 55.',
      addressLocality: 'Budapest',
      postalCode: '1039',
      addressCountry: 'HU',
    },
  ],
  sameAs: [
    'https://www.facebook.com/crowndental',
    'https://www.instagram.com/crowndental',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+36705646837',
    contactType: 'customer service',
    availableLanguage: ['Hungarian'],
    areaServed: 'HU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD Organization schema - minden oldalon megjelenik */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
