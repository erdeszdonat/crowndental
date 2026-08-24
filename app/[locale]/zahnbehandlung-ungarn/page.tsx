import { notFound } from 'next/navigation';
import InternationalPatientLanding from '@/components/InternationalPatientLanding';
import {
  INTERNATIONAL_PATIENT_CONTENT,
  buildInternationalPatientMetadata,
} from '@/lib/internationalPatients';

export const metadata = buildInternationalPatientMetadata('de');

export default async function GermanInternationalPatientPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (params.locale !== 'de') notFound();
  return <InternationalPatientLanding content={INTERNATIONAL_PATIENT_CONTENT.de} />;
}
