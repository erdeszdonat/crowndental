import type { Metadata } from 'next';
import AszfClient from './AszfClient';

const seoTitle = "Általános Szerződési Feltételek (ÁSZF) | Crown Dental";
const seoDescription = "A Crown Dental Praxis és Labor Fogászati Kft. Általános Szerződési Feltételei. Ismerje meg a kezelések, garanciák és szolgáltatások igénybevételének szabályait.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

export default function AszfPage() {
  return <AszfClient />;
}
