import type { Metadata } from 'next';
import AszfClient from './AszfClient';
import { SITE_URL } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';

const title = 'Általános Szerződési Feltételek (ÁSZF) | Crown Dental';
const description = 'A Crown Dental Praxis és Labor Fogászati Kft. Általános Szerződési Feltételei, a kezelések és szolgáltatások igénybevételének szabályai.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isGerman = params.locale === 'de';
  return {
    title: isGerman ? 'Allgemeine Geschäftsbedingungen | Crown Dental' : title,
    description: isGerman ? 'Allgemeine Geschäftsbedingungen von Crown Dental für Terminanfragen, Behandlungen, Preise, Absagen und Patientenkommunikation.' : description,
    alternates: { canonical: `${SITE_URL}${isGerman ? '/de' : ''}/aszf`, languages: { hu: `${SITE_URL}/aszf`, de: `${SITE_URL}/de/aszf` } },
    robots: { index: params.locale === 'hu' || isGerman, follow: true },
  };
}

export default function AszfPage({ params }: { params: { locale: string } }) {
  if (params.locale === 'de') return <GermanLegalPage document="terms" />;
  return <AszfClient />;
}
