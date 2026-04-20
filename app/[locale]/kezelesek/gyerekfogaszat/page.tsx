import type { Metadata } from 'next';
import GyerekfogaszatClient from './GyerekfogaszatClient';

const seoTitle = "Játékos Gyermekfogászat Fájdalommentesen | Crown Dental Budapest - Esztergom";
const seoDescription = "Barátságos gyermekfogászat, ahol a kicsik mosolyogva távoznak! Tejfog kezelések, barázdazárás és prevenció türelmes, játékos környezetben Budapesten és Esztergomban.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: 'Gyermekfogászat',
  description: seoDescription,
  howPerformed: 'Játékos ismerkedés a műszerekkel, fájdalommentes helyi érzéstelenítés, gyors és kíméletes beavatkozás.',
  procedureType: 'Therapeutic',
  bodyLocation: 'Fogak, szájüreg',
  preparation: 'Nincs szükség előkészületre, csak pozitív hozzáállásra',
  followup: 'Féléves rendszeres gyermekfogászati kontroll és motiválás',
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

export default function GyerekfogaszatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GyerekfogaszatClient />
    </>
  );
}
