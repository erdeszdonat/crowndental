import TreatmentsClient from './TreatmentsClient';
import { getTreatmentImages } from '@/lib/treatmentImages';

export default async function TreatmentsPage() {
  return <TreatmentsClient images={await getTreatmentImages()} />;
}
