import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: "Fogászati Tudástár & Blog | Crown Dental",
  description: "Olvassa szakértő fogorvosaink tanácsait! Cikkeink segítenek a helyes szájápolásban, a fogászati problémák megelőzésében és a kezelések megértésében.",
  keywords: ['fogászati blog', 'szájápolási tanácsok', 'fogbeültetés információk', 'fogszabályozás tippek', 'Crown Dental tudástár'],
  openGraph: {
    title: "Crown Dental Fogászati Tudástár",
    description: "Érthető és hiteles információk az egészséges mosolyért.",
    url: 'https://www.crowndental.hu/blog',
    type: 'website',
  }
};

export default function BlogPage() {
  return <BlogClient />;
}
