import { notFound } from 'next/navigation';
import VeneerPage from '@/components/VeneerPage';
import { veneerContent } from '@/components/VeneerContent';
import { veneerMetadata } from '@/components/VeneerSeo';
import { VENEERS } from '@/lib/veneers.mjs';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  if ((await params).locale !== 'hu') notFound();
  const content = veneerContent['indirekt-hej'];
  return veneerMetadata(content.title, content.description, VENEERS['indirekt-hej'].path);
}

export default async function Page({ params }: Props) {
  if ((await params).locale !== 'hu') notFound();
  return <VeneerPage slug="indirekt-hej" />;
}
