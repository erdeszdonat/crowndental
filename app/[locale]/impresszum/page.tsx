import type { Metadata } from 'next';
import ImpresszumClient from './ImpresszumClient';
import { SITE_URL } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';

const title = 'Impresszum | Crown Dental';
const description = 'A Crown Dental Praxis és Labor Fogászati Kft. hivatalos impresszuma, üzemeltetői és tárhelyszolgáltatói adatai.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isGerman = params.locale === 'de';
  return {
    title: isGerman ? 'Impressum | Crown Dental' : title,
    description: isGerman ? 'Impressum und offizielle Unternehmensangaben von Crown Dental Praxis és Labor Fogászati Kft. in Esztergom, Ungarn.' : description,
    alternates: { canonical: `${SITE_URL}${isGerman ? '/de' : ''}/impresszum`, languages: { hu: `${SITE_URL}/impresszum`, de: `${SITE_URL}/de/impresszum` } },
    robots: { index: params.locale === 'hu' || isGerman, follow: true },
  };
}

export default function ImpresszumPage({ params }: { params: { locale: string } }) {
  if (params.locale === 'de') return <GermanLegalPage document="imprint" />;
  return <ImpresszumClient />;
}
