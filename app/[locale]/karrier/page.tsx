import type { Metadata } from 'next';
import CareerClient from './CareerClient';

const seoTitle = "Karrier | Csatlakozzon a Crown Dental csapatához!";
const seoDescription = "Építse velünk a jövő mosolyát! Kiemelkedő fizetés, támogató közösség és folyamatos fejlődési lehetőség a Crown Dental esztergomi és budapesti rendelőiben.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Karrier - Crown Dental',
  description: seoDescription,
  url: 'https://www.crowndental.hu/karrier'
};

export default function CareerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CareerClient />
    </>
  );
}
