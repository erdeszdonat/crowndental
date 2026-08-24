import type { Metadata } from 'next';
import { buildLocalizedMetadata, normalizeLocale } from '@/lib/seo';
import BlogClient from './BlogClient';
import { canonicalBlogSlug, isMergedBlogSource } from '@/lib/blogConsolidation';

export const revalidate = 60;

const blogMetadata: Record<'hu' | 'en' | 'sk' | 'de', { title: string; description: string; keywords: string[] }> = {
  hu: {
    title: "Fogászati Tudástár & Blog | Crown Dental",
    description: "Olvassa szakértő fogorvosaink tanácsait! Cikkeink segítenek a helyes szájápolásban, a fogászati problémák megelőzésében és a kezelések megértésében.",
    keywords: ['fogászati blog', 'szájápolási tanácsok', 'fogbeültetés információk', 'fogszabályozás tippek', 'Crown Dental tudástár'],
  },
  en: {
    title: "Dental Knowledge Base & Blog | Crown Dental",
    description: "Read expert dental articles from Crown Dental about oral care, treatment options, prices, prevention and confident treatment decisions.",
    keywords: ['dental blog', 'oral care tips', 'dental implants information', 'orthodontics tips', 'Crown Dental blog'],
  },
  sk: {
    title: "Dentálna poradňa a blog | Crown Dental",
    description: "Prečítajte si odborné články Crown Dental o starostlivosti o zuby, prevencii, možnostiach ošetrenia a cenách.",
    keywords: ['zubný blog', 'starostlivosť o zuby', 'zubné implantáty', 'ortodoncia', 'Crown Dental blog'],
  },
  de: {
    title: 'Zahnmedizinischer Ratgeber & Blog | Crown Dental',
    description: 'Lesen Sie verständliche Fachartikel von Crown Dental über Zahnpflege, Vorsorge, Behandlungsmöglichkeiten, Preise und sichere Therapieentscheidungen.',
    keywords: ['Zahnarzt Blog', 'Zahnpflege Tipps', 'Zahnimplantate Informationen', 'Kieferorthopädie Ratgeber', 'Crown Dental Blog'],
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({ locale, path: 'blog', ...blogMetadata[locale] });
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
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.result || [])
      .filter((post: { slug?: string }) => post.slug && !isMergedBlogSource(post.slug))
      .map((post: { slug: string }) => ({ ...post, slug: canonicalBlogSlug(post.slug) }));
  } catch (error) {
    console.error('Blog lista betöltési hiba:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient initialPosts={posts} />;
}
