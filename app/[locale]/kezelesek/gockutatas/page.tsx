import type { Metadata } from 'next';
import GockutatasClient from './GockutatasClient';

// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
const seoTitle = "Fogászati Góckutatás & Diagnosztika 3D CT-vel | Crown Dental Budapest - Esztergom";
const seoDescription = "Hajhullás vagy ízületi fájdalom gyötri? Okai lehetnek a rejtett fogászati gócok. Modern 3D CT és panorámaröntgen diagnosztika Esztergomban és Budapesten.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Fogászati Góckutatás',
  description: seoDescription,
  howPerformed: 'Panoráma röntgen és 3D CBCT felvételek készítése, kiegészítve szájüregi fizikális és vitalitásvizsgálattal.',
  procedureType: 'Diagnostic',
  bodyLocation: 'Fogak, állkapocs, szájüreg',
  preparation: 'Nem igényel különleges előkészületet (nem kell éhgyomorra érkezni)',
  followup: 'A góc (pl. gyulladt fog) célzott kezelése (gyökérkezelés, húzás)',
  status: 'EventScheduled',
  provider: {
    '@type': 'Dentist',
    name: 'Crown Dental',
    address: [
      { '@type': 'PostalAddress', streetAddress: 'Királyok útja 55.', addressLocality: 'Budapest', postalCode: '1039', addressCountry: 'HU' },
      { '@type': 'PostalAddress', streetAddress: 'Petőfi Sándor utca 11.', addressLocality: 'Esztergom', postalCode: '2500', addressCountry: 'HU' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ALOLDAL EXPORT (Szerver Komponens)
// ═══════════════════════════════════════════════════════════════════════════
export default function GockutatasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GockutatasClient />
    </>
  );
}
