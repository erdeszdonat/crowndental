import { notFound } from 'next/navigation';
import InternationalPatientLanding from '@/components/InternationalPatientLanding';
import {
  INTERNATIONAL_PATIENT_CONTENT,
  buildInternationalPatientMetadata,
} from '@/lib/internationalPatients';

export const metadata = buildInternationalPatientMetadata('sk');

export default async function SlovakInternationalPatientPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (params.locale !== 'sk') notFound();
  return <InternationalPatientLanding content={INTERNATIONAL_PATIENT_CONTENT.sk} />;
}
