import type { Metadata } from 'next';
import ImpresszumClient from './ImpresszumClient';
import { buildLocalizedMetadata, normalizeLocale, type SupportedLocale } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';
import LocalizedLegalPage from '@/components/LocalizedLegalPage';

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Impresszum | Crown Dental',
    description: 'A Crown Dental Praxis és Labor Fogászati Kft. hivatalos impresszuma, üzemeltetői és tárhelyszolgáltatói adatai.',
  },
  en: {
    title: 'Legal Notice | Crown Dental',
    description: 'Official company, clinic, hosting, copyright, medical disclaimer and conciliation information for the operator of crowndental.hu.',
  },
  sk: {
    title: 'Právne informácie o prevádzkovateľovi | Crown Dental',
    description: 'Oficiálne údaje o spoločnosti, ambulanciách, hostingu, autorských právach, medicínskom upozornení a zmierovacom konaní.',
  },
  de: {
    title: 'Impressum | Crown Dental',
    description: 'Impressum und offizielle Unternehmensangaben von Crown Dental Praxis és Labor Fogászati Kft. in Esztergom, Ungarn.',
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'impresszum', ...metadataByLocale[locale] });
}

export default async function ImpresszumPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  if (locale === 'hu') return <ImpresszumClient />;
  if (locale === 'de') return <GermanLegalPage document="imprint" />;
  return <LocalizedLegalPage document="imprint" locale={locale} />;
}
