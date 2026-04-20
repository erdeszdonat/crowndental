import type { Metadata } from 'next';
import RolunkClient from './RolunkClient';

const seoTitle = "Rólunk | Crown Dental – 30 Év Tapasztalat a Mosolyodért";
const seoDescription = "1994 óta dolgozunk a háttérben azért, hogy Ön bármikor, bármilyen helyzetben, gátlások nélkül mosolyoghass. Ismerje meg saját laborral rendelkező fogászatunkat.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Dentist',
    name: 'Crown Dental',
    foundingDate: '1994',
    description: seoDescription,
    address: [
      { '@type': 'PostalAddress', streetAddress: 'Királyok útja 55.', addressLocality: 'Budapest', postalCode: '1039', addressCountry: 'HU' },
      { '@type': 'PostalAddress', streetAddress: 'Petőfi Sándor utca 11.', addressLocality: 'Esztergom', postalCode: '2500', addressCountry: 'HU' }
    ]
  }
};

export default function RolunkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RolunkClient />
    </>
  );
}
