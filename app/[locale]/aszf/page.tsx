import type { Metadata } from 'next';
import AszfClient from './AszfClient';
import { buildLocalizedMetadata, normalizeLocale, type SupportedLocale } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';
import LocalizedLegalPage from '@/components/LocalizedLegalPage';

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Általános Szerződési Feltételek (ÁSZF) | Crown Dental',
    description: 'A Crown Dental Praxis és Labor Fogászati Kft. Általános Szerződési Feltételei, a kezelések és szolgáltatások igénybevételének szabályai.',
  },
  en: {
    title: 'Terms and Conditions | Crown Dental',
    description: 'Terms for Crown Dental appointment requests, dental treatment, indicative prices, cancellations, online services and patient complaints.',
  },
  sk: {
    title: 'Všeobecné obchodné podmienky | Crown Dental',
    description: 'Podmienky žiadostí o termín, zubného ošetrenia, orientačných cien, zrušenia termínu, online služieb a sťažností v Crown Dental.',
  },
  de: {
    title: 'Allgemeine Geschäftsbedingungen | Crown Dental',
    description: 'Allgemeine Geschäftsbedingungen von Crown Dental für Terminanfragen, Behandlungen, Preise, Absagen und Patientenkommunikation.',
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'aszf', ...metadataByLocale[locale] });
}

export default async function AszfPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  if (locale === 'hu') return <AszfClient />;
  if (locale === 'de') return <GermanLegalPage document="terms" />;
  return <LocalizedLegalPage document="terms" locale={locale} />;
}
