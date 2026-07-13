import type { Metadata } from 'next';
import ImpresszumClient from './ImpresszumClient';
import { SITE_URL } from '@/lib/seo';

const title = 'Impresszum | Crown Dental';
const description = 'A Crown Dental Praxis és Labor Fogászati Kft. hivatalos impresszuma, üzemeltetői és tárhelyszolgáltatói adatai.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/impresszum` },
    robots: { index: params.locale === 'hu', follow: true },
  };
}

export default function ImpresszumPage() {
  return <ImpresszumClient />;
}
