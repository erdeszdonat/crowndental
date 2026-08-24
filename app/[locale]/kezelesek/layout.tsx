import type { Metadata } from 'next';
import { buildTreatmentListingMetadata } from '@/lib/seo';

type TreatmentsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: TreatmentsLayoutProps): Promise<Metadata> {
  const params = await props.params;
  return buildTreatmentListingMetadata(params.locale);
}

export default function TreatmentsLayout({ children }: TreatmentsLayoutProps) {
  return children;
}
