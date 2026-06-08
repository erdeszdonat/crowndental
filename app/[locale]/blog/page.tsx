import type { Metadata } from 'next';
import { normalizeBlogLanguage } from '@/lib/blogConfig';
import BlogClient from './BlogClient';

export const revalidate = 3600;

const blogMetadata: Record<'hu' | 'en' | 'sk', Metadata> = {
  hu: {
    title: "Fogászati Tudástár & Blog | Crown Dental",
    description: "Olvassa szakértő fogorvosaink tanácsait! Cikkeink segítenek a helyes szájápolásban, a fogászati problémák megelőzésében és a kezelések megértésében.",
    keywords: ['fogászati blog', 'szájápolási tanácsok', 'fogbeültetés információk', 'fogszabályozás tippek', 'Crown Dental tudástár'],
    openGraph: {
      title: "Crown Dental Fogászati Tudástár",
      description: "Érthető és hiteles információk az egészséges mosolyért.",
      url: 'https://www.crowndental.hu/blog',
      type: 'website',
    },
  },
  en: {
    title: "Dental Knowledge Base & Blog | Crown Dental",
    description: "Read expert dental articles from Crown Dental about oral care, treatment options, prices, prevention and confident treatment decisions.",
    keywords: ['dental blog', 'oral care tips', 'dental implants information', 'orthodontics tips', 'Crown Dental blog'],
    openGraph: {
      title: "Crown Dental Dental Knowledge Base",
      description: "Clear, trustworthy dental information for a healthier smile.",
      url: 'https://www.crowndental.hu/en/blog',
      type: 'website',
    },
  },
  sk: {
    title: "Dentálna poradňa a blog | Crown Dental",
    description: "Prečítajte si odborné články Crown Dental o starostlivosti o zuby, prevencii, možnostiach ošetrenia a cenách.",
    keywords: ['zubný blog', 'starostlivosť o zuby', 'zubné implantáty', 'ortodoncia', 'Crown Dental blog'],
    openGraph: {
      title: "Crown Dental Dentálna poradňa",
      description: "Zrozumiteľné a dôveryhodné informácie pre zdravší úsmev.",
      url: 'https://www.crowndental.hu/sk/blog',
      type: 'website',
    },
  },
};

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const language = normalizeBlogLanguage(params.locale);
  if (language === 'en' || language === 'sk') return blogMetadata[language];
  return blogMetadata.hu;
}

async function getBlogPosts() {
  try {
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
    const dataSet = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
    const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      "imageUrl": mainImage.asset->url,
      "language": coalesce(language, "hu"),
      "category": coalesce(category, "professional")
    }`);
    const response = await fetch(`https://${sanityProjectId}.api.sanity.io/v2024-03-08/data/query/${dataSet}?query=${query}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Blog lista betöltési hiba:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient initialPosts={posts} />;
}
