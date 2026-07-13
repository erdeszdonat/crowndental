import type { Metadata } from 'next';
import FogszabalyozasClient from './FogszabalyozasClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'fogszabalyozas' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function FogszabalyozasPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <FogszabalyozasClient />
    </>
  );
}
