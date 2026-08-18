import type { Metadata } from 'next';
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
  SITE_URL,
  buildBreadcrumbJsonLd,
  localizedUrl,
  normalizeLocale,
} from '@/lib/seo';

type BlogPostPageProps = {
  params: { locale: string; slug: string };
};

type BlogPost = {
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

async function getPost(locale: string, slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "post" && slug.current == $slug && coalesce(language, "hu") == $language][0]{${postFields}}`;
  return client.fetch(query, { slug, language: locale });
}

async function getPostLanguageBySlug(slug: string): Promise<{ language: string } | null> {
  const query = `*[_type == "post" && slug.current == $slug][0]{"language": coalesce(language, "hu")}`;
  return client.fetch(query, { slug });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const locale = normalizeLocale(params.locale);
  const post = await getPost(locale, params.slug);

  if (!post) {
    return {
      title: locale === 'sk' ? 'Článok sa nenašiel | Crown Dental' : locale === 'en' ? 'Article not found | Crown Dental' : locale === 'de' ? 'Artikel nicht gefunden | Crown Dental' : 'Cikk nem található | Crown Dental',
      robots: { index: false, follow: false },
    };
  }

  const canonical = localizedUrl(locale, `blog/${params.slug}`);
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
      languages: blogLanguageAlternates(params.slug),
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const locale = normalizeLocale(params.locale);
  const post = await getPost(locale, params.slug);
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

  const blogJsonLd = buildBlogPostingJsonLd({ ...post, slug: params.slug, language: locale });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, `blog/${params.slug}`, post.title);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <BlogPostClient post={post} />
    </>
  );
}
