import type { Metadata } from 'next';
import ImplantatumClient from './ImplantatumClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'implantatum' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function ImplantatumPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <ImplantatumClient />
    </>
  );
}
