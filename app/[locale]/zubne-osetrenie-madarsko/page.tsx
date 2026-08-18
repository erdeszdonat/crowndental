import { notFound } from 'next/navigation';
import InternationalPatientLanding from '@/components/InternationalPatientLanding';
import {
  INTERNATIONAL_PATIENT_CONTENT,
  buildInternationalPatientMetadata,
} from '@/lib/internationalPatients';

export const metadata = buildInternationalPatientMetadata('sk');

export default function SlovakInternationalPatientPage({ params }: { params: { locale: string } }) {
  if (params.locale !== 'sk') notFound();
  return <InternationalPatientLanding content={INTERNATIONAL_PATIENT_CONTENT.sk} />;
}
