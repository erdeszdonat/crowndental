import type { Metadata } from 'next';
import GockutatasClient from './GockutatasClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'gockutatas' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function GockutatasPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <GockutatasClient />
    </>
  );
}
