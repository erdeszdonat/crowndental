import type { Metadata } from 'next';
// ITT VOLT A HIBA: ImpresszumClient helyett CookieClient kell
import CookieClient from './CookieClient'; 

const seoTitle = "Süti (Cookie) Tájékoztató | Crown Dental";
const seoDescription = "Részletes tájékoztatás a Crown Dental weboldalán használt sütikről (cookie-król), azok céljáról, típusairól és kezelési lehetőségeiről.";

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
};

export default function CookiePage() {
  // ITT IS ÁT KELL ÍRNI:
  return <CookieClient />; 
}
