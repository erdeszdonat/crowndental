import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { buildLocalizedMetadata, normalizeLocale, type SupportedLocale } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';
import LocalizedLegalPage from '@/components/LocalizedLegalPage';

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Adatkezelési Tájékoztató | Crown Dental',
    description: 'A Crown Dental hivatalos adatkezelési tájékoztatója, adatvédelmi gyakorlata és a GDPR szerinti érintetti jogok.',
  },
  en: {
    title: 'Privacy Notice | Crown Dental',
    description: 'How Crown Dental processes appointment, patient, quotation, career, marketing and website data, including GDPR rights and service providers.',
  },
  sk: {
    title: 'Oznámenie o ochrane osobných údajov | Crown Dental',
    description: 'Ako Crown Dental spracúva údaje o termínoch, pacientoch, ponukách, kariére, marketingu a webovej stránke vrátane práv podľa GDPR.',
  },
  de: {
    title: 'Datenschutzerklärung | Crown Dental',
    description: 'Datenschutzerklärung von Crown Dental zu Terminanfragen, Patientendaten, E-Mails, Marketingeinwilligung, Cookies und Betroffenenrechten.',
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'adatkezeles', ...metadataByLocale[locale] });
}

export default async function AdatkezelesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  if (locale === 'hu') return <PrivacyClient />;
  if (locale === 'de') return <GermanLegalPage document="privacy" />;
  return <LocalizedLegalPage document="privacy" locale={locale} />;
}
