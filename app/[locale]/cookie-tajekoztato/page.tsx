import type { Metadata } from 'next';
import CookieClient from './CookieClient';
import { buildLocalizedMetadata, normalizeLocale, type SupportedLocale } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';
import LocalizedLegalPage from '@/components/LocalizedLegalPage';

const metadataByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  hu: {
    title: 'Süti (Cookie) Tájékoztató | Crown Dental',
    description: 'Tájékoztatás a Crown Dental weboldalán használt sütikről, azok céljáról, típusairól és kezelési lehetőségeiről.',
  },
  en: {
    title: 'Cookie Notice | Crown Dental',
    description: 'Necessary, analytics and marketing browser storage used on crowndental.hu, including providers, typical retention and consent controls.',
  },
  sk: {
    title: 'Oznámenie o používaní cookies | Crown Dental',
    description: 'Nevyhnutné, analytické a marketingové úložisko na crowndental.hu vrátane poskytovateľov, typickej doby uchovávania a nastavení súhlasu.',
  },
  de: {
    title: 'Cookie-Richtlinie | Crown Dental',
    description: 'Informationen zu notwendigen, statistischen und Marketing-Cookies auf crowndental.hu sowie zur Änderung Ihrer Einwilligung.',
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'cookie-tajekoztato', ...metadataByLocale[locale] });
}

export default async function CookiePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  if (locale === 'hu') return <CookieClient />;
  if (locale === 'de') return <GermanLegalPage document="cookies" />;
  return <LocalizedLegalPage document="cookies" locale={locale} />;
}
