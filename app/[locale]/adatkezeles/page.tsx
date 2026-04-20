import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

const seoTitle = "Adatkezelési Tájékoztató | Crown Dental";
const seoDescription = "A Crown Dental hivatalos, átfogó adatkezelési tájékoztatója. Ismerje meg adatvédelmi gyakorlatunkat, a GDPR és a hazai jogszabályok szerinti jogait.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

export default function AdatkezelesPage() {
  return <PrivacyClient />;
}
