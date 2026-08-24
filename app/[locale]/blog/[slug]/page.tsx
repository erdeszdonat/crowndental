import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import BlogPostClient from './BlogPostClient';
import { buildBlogPostingJsonLd } from '@/lib/faqSchema';
import {
  blogLanguageAlternates,
  findBlogTranslation,
} from '@/lib/blogTranslations';
import {
  canonicalBlogSlug,
  mergeArchivedBlogContent,
  mergedBlogSource,
  mergedBlogTarget,
  sanityBlogSlug,
} from '@/lib/blogConsolidation';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  localizedUrl,
  normalizeLocale,
  safeJsonLd,
} from '@/lib/seo';

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

type BlogPost = {
  slug?: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  _updatedAt?: string;
  excerpt?: string;
  language: string;
  category: string;
  imageUrl?: string;
  content?: unknown[];
  authorName?: string;
  authorRole?: string;
  authorProfileUrl?: string;
  medicalReviewerName?: string;
  medicalReviewerRole?: string;
  medicalReviewedAt?: string;
};

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: false,
});

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  try {
    const posts = await client.fetch<Array<{ slug?: string; locale?: string }>>(
      `*[_type == "post" && defined(slug.current)]{
        "slug": slug.current,
        "locale": coalesce(language, "hu")
      }`,
      {},
      { next: { revalidate: 300 } },
    );
    const supportedLocales = new Set(['hu', 'en', 'sk', 'de']);
    const unique = new Map<string, { locale: string; slug: string }>();
    for (const post of posts) {
      if (!post.slug || !post.locale || !supportedLocales.has(post.locale) || mergedBlogTarget(post.slug)) continue;
      const slug = canonicalBlogSlug(post.slug);
      unique.set(`${post.locale}/${slug}`, { locale: post.locale, slug });
    }
    return [...unique.values()];
  } catch (error) {
    console.error('Blog statikus útvonalak betöltési hiba:', error);
    return [];
  }
}

const postFields = `
  title,
  seoTitle,
  seoDescription,
  publishedAt,
  _updatedAt,
  excerpt,
  "language": coalesce(language, "hu"),
  "category": coalesce(category, "professional"),
  "imageUrl": mainImage.asset->url,
  content,
  authorName,
  authorRole,
  authorProfileUrl,
  medicalReviewerName,
  medicalReviewerRole,
  medicalReviewedAt
`;

const getPost = cache(async (locale: string, slug: string): Promise<BlogPost | null> => {
  const query = `*[_type == "post" && slug.current == $slug && coalesce(language, "hu") == $language][0]{${postFields}}`;
  return client.fetch(
    query,
    { slug: sanityBlogSlug(slug), language: locale },
    { next: { revalidate: 300 } },
  );
});

async function getConsolidatedPost(locale: string, slug: string): Promise<BlogPost | null> {
  const sourceSlug = mergedBlogSource(slug);
  if (!sourceSlug) {
    const post = await getPost(locale, slug);
    return post ? { ...post, slug } : null;
  }

  const [post, sourcePost] = await Promise.all([
    getPost(locale, slug),
    getPost(locale, sourceSlug),
  ]);
  if (!post) return null;

  return {
    ...post,
    slug,
    content: mergeArchivedBlogContent(post.content, sourcePost?.content, sourceSlug),
  };
}

const getPostLanguageBySlug = cache(async (slug: string): Promise<{ language: string } | null> => {
  const query = `*[_type == "post" && slug.current == $slug][0]{"language": coalesce(language, "hu")}`;
  return client.fetch(query, { slug }, { next: { revalidate: 300 } });
});

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  const canonicalSlug = canonicalBlogSlug(params.slug);
  const post = await getConsolidatedPost(locale, canonicalSlug);

  if (!post) {
    return {
      title: locale === 'sk' ? 'Článok sa nenašiel | Crown Dental' : locale === 'en' ? 'Article not found | Crown Dental' : locale === 'de' ? 'Artikel nicht gefunden | Crown Dental' : 'Cikk nem található | Crown Dental',
      robots: { index: false, follow: false },
    };
  }

  const canonical = localizedUrl(locale, `blog/${canonicalSlug}`);
  const title = post.seoTitle || `${post.title} | Crown Dental`;
  const description =
    post.seoDescription ||
    post.excerpt ||
    (locale === 'sk'
      ? 'Prečítajte si odborný článok Crown Dental.'
      : locale === 'en'
        ? 'Read this expert article from Crown Dental.'
        : locale === 'de'
          ? 'Lesen Sie diesen Fachartikel von Crown Dental.'
        : 'Olvassa el a Crown Dental szakmai cikkét.');
  const image = post.imageUrl || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    authors: post.authorName ? [{ name: post.authorName, url: post.authorProfileUrl }] : [{ name: 'Crown Dental' }],
    alternates: {
      canonical,
      languages: blogLanguageAlternates(canonicalSlug),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Crown Dental',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      authors: post.authorName ? [post.authorName] : ['Crown Dental'],
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const locale = normalizeLocale(params.locale);
  const mergeTarget = mergedBlogTarget(params.slug);
  if (mergeTarget) {
    permanentRedirect(localizedUrl(locale, `blog/${mergeTarget}`));
  }

  const canonicalSlug = canonicalBlogSlug(params.slug);
  if (canonicalSlug !== params.slug) {
    permanentRedirect(localizedUrl(locale, `blog/${canonicalSlug}`));
  }

  const post = await getConsolidatedPost(locale, canonicalSlug);
  if (!post) {
    // Historic language-switcher links kept the source-language slug under a
    // different locale prefix. Redirect those URLs to the real translation.
    const translation = findBlogTranslation(params.slug);
    if (translation) {
      const translatedSlug = translation.group[locale];
      if (translatedSlug !== params.slug) {
        permanentRedirect(localizedUrl(locale, `blog/${translatedSlug}`));
      }
    }

    // Future, unmapped cross-locale slugs still consolidate to the document's
    // actual canonical language instead of becoming another persistent 404.
    const sourcePost = await getPostLanguageBySlug(params.slug);
    if (sourcePost) {
      permanentRedirect(localizedUrl(sourcePost.language, `blog/${params.slug}`));
    }

    notFound();
  }

  const blogJsonLd = buildBlogPostingJsonLd({ ...post, slug: canonicalSlug, language: locale });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, `blog/${canonicalSlug}`, post.title);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <BlogPostClient post={post} />
    </>
  );
}
