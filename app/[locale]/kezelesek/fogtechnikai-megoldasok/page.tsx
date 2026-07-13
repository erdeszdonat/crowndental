import type { Metadata } from 'next';
import FogtechnikaClient from './FogtechnikaClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'fogtechnikai-megoldasok' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function FogtechnikaPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <FogtechnikaClient />
    </>
  );
}
