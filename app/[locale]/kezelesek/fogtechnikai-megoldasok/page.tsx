import type { Metadata } from 'next';
import FogtechnikaClient from './FogtechnikaClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'fogtechnikai-megoldasok' as const;

type TreatmentPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: TreatmentPageProps): Promise<Metadata> {
  const params = await props.params;
  return buildTreatmentMetadata(params.locale, slug);
}

export default async function FogtechnikaPage(props: TreatmentPageProps) {
  const params = await props.params;
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <FogtechnikaClient />
    </>
  );
}
