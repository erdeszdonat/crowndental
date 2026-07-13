import type { Metadata } from 'next';
import CookieClient from './CookieClient';
import { SITE_URL } from '@/lib/seo';

const title = 'Süti (Cookie) Tájékoztató | Crown Dental';
const description = 'Tájékoztatás a Crown Dental weboldalán használt sütikről, azok céljáról, típusairól és kezelési lehetőségeiről.';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/cookie-tajekoztato` },
    robots: { index: params.locale === 'hu', follow: true },
  };
}

export default function CookiePage() {
  return <CookieClient />;
}
