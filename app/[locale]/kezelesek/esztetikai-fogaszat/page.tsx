import type { Metadata } from 'next';
import EsztetikaiFogaszatClient from './EsztetikaiFogaszatClient';
import TreatmentSeoScripts from '@/components/TreatmentSeoScripts';
import { buildTreatmentMetadata } from '@/lib/seo';

const slug = 'esztetikai-fogaszat' as const;

type TreatmentPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentPageProps): Metadata {
  return buildTreatmentMetadata(params.locale, slug);
}

export default function EsztetikaiFogaszatPage({ params }: TreatmentPageProps) {
  return (
    <>
      <TreatmentSeoScripts locale={params.locale} slug={slug} />
      <EsztetikaiFogaszatClient />
    </>
  );
}
