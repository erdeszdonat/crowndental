import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { SITE_URL } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';

const title = 'Adatkezelési Tájékoztató | Crown Dental';
const description = 'A Crown Dental hivatalos adatkezelési tájékoztatója, adatvédelmi gyakorlata és a GDPR szerinti érintetti jogok.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isGerman = params.locale === 'de';
  return {
    title: isGerman ? 'Datenschutzerklärung | Crown Dental' : title,
    description: isGerman ? 'Datenschutzerklärung von Crown Dental zu Terminanfragen, Patientendaten, E-Mails, Marketingeinwilligung, Cookies und Betroffenenrechten.' : description,
    alternates: { canonical: `${SITE_URL}${isGerman ? '/de' : ''}/adatkezeles`, languages: { hu: `${SITE_URL}/adatkezeles`, de: `${SITE_URL}/de/adatkezeles` } },
    robots: { index: params.locale === 'hu' || isGerman, follow: true },
  };
}

export default function AdatkezelesPage({ params }: { params: { locale: string } }) {
  if (params.locale === 'de') return <GermanLegalPage document="privacy" />;
  return <PrivacyClient />;
}
