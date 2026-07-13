import type { Metadata } from 'next';
import { buildTreatmentListingMetadata } from '@/lib/seo';

type TreatmentsLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateMetadata({ params }: TreatmentsLayoutProps): Metadata {
  return buildTreatmentListingMetadata(params.locale);
}

export default function TreatmentsLayout({ children }: TreatmentsLayoutProps) {
  return children;
}
