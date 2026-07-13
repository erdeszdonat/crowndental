import type { Metadata } from 'next';
import AszfClient from './AszfClient';
import { SITE_URL } from '@/lib/seo';

const title = 'Általános Szerződési Feltételek (ÁSZF) | Crown Dental';
const description = 'A Crown Dental Praxis és Labor Fogászati Kft. Általános Szerződési Feltételei, a kezelések és szolgáltatások igénybevételének szabályai.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/aszf` },
    robots: { index: params.locale === 'hu', follow: true },
  };
}

export default function AszfPage() {
  return <AszfClient />;
}
