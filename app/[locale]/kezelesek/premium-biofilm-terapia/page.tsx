import HygieneService, { hygieneMetadata } from '@/components/HygieneService';

const slug = 'premium-biofilm-terapia';
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return hygieneMetadata((await params).locale, slug);
}

export default async function Page({ params }: Props) {
  return <HygieneService language={(await params).locale} slug={slug} />;
}
