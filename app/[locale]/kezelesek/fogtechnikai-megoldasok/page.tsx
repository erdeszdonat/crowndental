import type { Metadata } from 'next';
import FogtechnikaClient from './FogtechnikaClient';

// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Saját Fogtechnikai Labor | Fogsor Javítás Akár 1 Nap Alatt";
const seoDescription = "Prémium fogpótlások 1994 óta saját laborunkból Budapesten és Esztergomban. Gyors fogsor javítás 24 órán belül, közvetlen orvos-technikus egyeztetés. Kérjen időpontot!";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogtechnikai Laboratóriumi Szolgáltatások',
  description: seoDescription,
  howPerformed: 'Helyben történő, gyors és precíz fogtechnikai gyártás (CAD/CAM), azonnali javítások és alábélelések.',
  procedureType: 'Prosthodontic',
  provider: {
    '@type': 'Dentist',
    name: 'Crown Dental',
    address: [
      { '@type': 'PostalAddress', streetAddress: 'Királyok útja 55.', addressLocality: 'Budapest', postalCode: '1039', addressCountry: 'HU' },
      { '@type': 'PostalAddress', streetAddress: 'Petőfi Sándor utca 11.', addressLocality: 'Esztergom', postalCode: '2500', addressCountry: 'HU' }
    ]
  },
  status: 'EventScheduled',
};

// ═══════════════════════════════════════════════════════════════════════════
// ALOLDAL EXPORT (Szerver Komponens)
// ═══════════════════════════════════════════════════════════════════════════
export default function FogtechnikaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FogtechnikaClient />
    </>
  );
}
