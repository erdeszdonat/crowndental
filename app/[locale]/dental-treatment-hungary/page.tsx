import { notFound } from 'next/navigation';
import InternationalPatientLanding from '@/components/InternationalPatientLanding';
import {
  INTERNATIONAL_PATIENT_CONTENT,
  buildInternationalPatientMetadata,
} from '@/lib/internationalPatients';

export const metadata = buildInternationalPatientMetadata('en');

export default async function EnglishInternationalPatientPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (params.locale !== 'en') notFound();
  return <InternationalPatientLanding content={INTERNATIONAL_PATIENT_CONTENT.en} />;
}
