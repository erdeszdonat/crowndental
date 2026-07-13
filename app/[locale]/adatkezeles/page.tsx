import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { SITE_URL } from '@/lib/seo';

const title = 'Adatkezelési Tájékoztató | Crown Dental';
const description = 'A Crown Dental hivatalos adatkezelési tájékoztatója, adatvédelmi gyakorlata és a GDPR szerinti érintetti jogok.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/adatkezeles` },
    robots: { index: params.locale === 'hu', follow: true },
  };
}

export default function AdatkezelesPage() {
  return <PrivacyClient />;
}
