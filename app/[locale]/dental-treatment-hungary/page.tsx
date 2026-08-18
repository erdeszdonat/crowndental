import { notFound } from 'next/navigation';
import InternationalPatientLanding from '@/components/InternationalPatientLanding';
import {
  INTERNATIONAL_PATIENT_CONTENT,
  buildInternationalPatientMetadata,
} from '@/lib/internationalPatients';

export const metadata = buildInternationalPatientMetadata('en');

export default function EnglishInternationalPatientPage({ params }: { params: { locale: string } }) {
  if (params.locale !== 'en') notFound();
  return <InternationalPatientLanding content={INTERNATIONAL_PATIENT_CONTENT.en} />;
}
