import type { Metadata } from 'next';
import CookieClient from './CookieClient';
import { SITE_URL } from '@/lib/seo';
import GermanLegalPage from '@/components/GermanLegalPage';

const title = 'Süti (Cookie) Tájékoztató | Crown Dental';
const description = 'Tájékoztatás a Crown Dental weboldalán használt sütikről, azok céljáról, típusairól és kezelési lehetőségeiről.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isGerman = params.locale === 'de';
  return {
    title: isGerman ? 'Cookie-Richtlinie | Crown Dental' : title,
    description: isGerman ? 'Informationen zu notwendigen, statistischen und Marketing-Cookies auf crowndental.hu sowie zur Änderung Ihrer Einwilligung.' : description,
    alternates: { canonical: `${SITE_URL}${isGerman ? '/de' : ''}/cookie-tajekoztato`, languages: { hu: `${SITE_URL}/cookie-tajekoztato`, de: `${SITE_URL}/de/cookie-tajekoztato` } },
    robots: { index: params.locale === 'hu' || isGerman, follow: true },
  };
}

export default function CookiePage({ params }: { params: { locale: string } }) {
  if (params.locale === 'de') return <GermanLegalPage document="cookies" />;
  return <CookieClient />;
}
