import type { Metadata } from 'next';
import KoronakHidakClient from './KoronakHidakClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'koronak-hidak' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function KoronakHidakPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <KoronakHidakClient />
    </>
  );
}
