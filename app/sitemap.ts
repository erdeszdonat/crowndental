import type { MetadataRoute } from 'next';
import { normalizeBlogLanguage } from '@/lib/blogConfig';
import { blogLanguageAlternates } from '@/lib/blogTranslations';
import {
  HREFLANG_BY_LOCALE,
  languageAlternates,
  localizedUrl,
  SUPPORTED_LOCALES,
  TREATMENT_SLUGS,
} from '@/lib/seo';

type SanityPost = {
  slug?: string;
  _updatedAt?: string;
  language?: string;
};

const fetchSanityPosts = async (): Promise<SanityPost[]> => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const query = encodeURIComponent(
    `*[_type == "post"]{ "slug": slug.current, _updatedAt, "language": coalesce(language, "hu") }`,
  );
  const url = `https://${projectId}.api.sanity.io/v2024-03-08/data/query/${dataset}?query=${query}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Sitemap: a blogbejegyzések lekérése sikertelen:', error);
    return [];
  }
};

const staticPaths = [
  '',
  'kezelesek',
  ...TREATMENT_SLUGS.map((slug) => `kezelesek/${slug}`),
  'esztergom',
  'budapest',
  'rolunk',
  'kapcsolat',
  'blog',
  'karrier',
  'idopont',
  'utazas-szallas',
];

const hungarianOnlyPaths = ['aszf', 'adatkezeles', 'cookie-tajekoztato', 'impresszum'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    SUPPORTED_LOCALES.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: path === '' ? 'daily' : path === 'blog' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : path === 'esztergom' ? 0.95 : path.startsWith('kezelesek') ? 0.9 : 0.7,
      alternates: { languages: languageAlternates(path) },
    })),
  );
  const legalRoutes: MetadataRoute.Sitemap = hungarianOnlyPaths.flatMap((path) =>
    (['hu', 'de'] as const).map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: {
          [HREFLANG_BY_LOCALE.hu]: localizedUrl('hu', path),
          [HREFLANG_BY_LOCALE.de]: localizedUrl('de', path),
        },
      },
    })),
  );

  const sanityPosts = await fetchSanityPosts();
  const dynamicBlogRoutes: MetadataRoute.Sitemap = sanityPosts
    .filter((post) => post.slug)
    .filter((post) => SUPPORTED_LOCALES.includes(normalizeBlogLanguage(post.language)))
    .map((post) => {
      const language = normalizeBlogLanguage(post.language);
      const alternates = blogLanguageAlternates(post.slug!);
      return {
        url: localizedUrl(language, `blog/${post.slug}`),
        lastModified: post._updatedAt ? new Date(post._updatedAt) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        ...(alternates ? { alternates: { languages: alternates } } : {}),
      };
    });

  return [...staticRoutes, ...legalRoutes, ...dynamicBlogRoutes];
}

export const dynamic = 'force-static';
export const revalidate = 3600;
