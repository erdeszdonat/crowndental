import TreatmentsClient from './TreatmentsClient';
import { getTreatmentImages } from '@/lib/treatmentImages';
import { getVeneerOffer } from '@/lib/veneers.mjs';

export const revalidate = 3600;

export default async function TreatmentsPage() {
  return <TreatmentsClient images={await getTreatmentImages()} directOffer={getVeneerOffer('direkt-hej')} />;
}
