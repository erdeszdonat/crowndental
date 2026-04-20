import type { Metadata } from 'next';
import ImpresszumClient from './ImpresszumClient';

// ═══════════════════════════════════════════════════════════════════════════
// SEO ADATOK ÉS METADATA (Szerveroldali generálás)
// ═══════════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: "Impresszum | Crown Dental",
  description: "A Crown Dental Praxis és Labor Fogászati Kft. hivatalos impresszuma, üzemeltetői és tárhelyszolgáltatói adatai, valamint szerzői jogi nyilatkozata.",
};

export default function ImpresszumPage() {
  return <ImpresszumClient />;
}
