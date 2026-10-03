import VeneerPage from '@/components/VeneerPage';
import { getVeneerContent } from '@/components/VeneerContent';
import { veneerMetadata } from '@/components/VeneerSeo';
import { VENEERS } from '@/lib/veneers.mjs';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const content = getVeneerContent('direkt-hej', locale);
  return veneerMetadata(content.title, content.description, VENEERS['direkt-hej'].path, locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <VeneerPage locale={locale} slug="direkt-hej" />;
}
