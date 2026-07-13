import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import BlogPostClient from './BlogPostClient';
import { buildBlogPostingJsonLd } from '@/lib/faqSchema';
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
  medicalReviewerRole
`;

async function getPost(locale: string, slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "post" && slug.current == $slug && coalesce(language, "hu") == $language][0]{${postFields}}`;
  return client.fetch(query, { slug, language: locale });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const locale = normalizeLocale(params.locale);
  const post = await getPost(locale, params.slug);

  if (!post) {
    return {
      title: locale === 'sk' ? 'Článok sa nenašiel | Crown Dental' : locale === 'en' ? 'Article not found | Crown Dental' : 'Cikk nem található | Crown Dental',
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
        : 'Olvassa el a Crown Dental szakmai cikkét.');
  const image = post.imageUrl || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    authors: post.authorName ? [{ name: post.authorName, url: post.authorProfileUrl }] : [{ name: 'Crown Dental' }],
    alternates: { canonical },
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
  if (!post) notFound();

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
