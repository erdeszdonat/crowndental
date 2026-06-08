import React from 'react';
import { Metadata } from 'next';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import BlogPostClient from './BlogPostClient';
import { buildBlogPostingJsonLd } from '@/lib/faqSchema';
import { normalizeBlogLanguage } from '@/lib/blogConfig';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: false,
});

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const language = normalizeBlogLanguage(params.locale);
  const query = `*[_type == "post" && slug.current == $slug && coalesce(language, "hu") == $language][0]{ title, seoTitle, seoDescription, excerpt }`;
  const post = await client.fetch(query, { slug: params.slug, language });
  
  if (!post) return { title: 'Cikk nem található | Crown Dental' };
  
  return {
    title: post.seoTitle || `${post.title} | Crown Dental`,
    description: post.seoDescription || post.excerpt || 'Olvassa el legújabb fogászati cikkünket.',
    alternates: {
      canonical: `https://www.crowndental.hu${language === 'hu' ? '' : `/${language}`}/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  const language = normalizeBlogLanguage(params.locale);
  const query = `*[_type == "post" && slug.current == $slug && coalesce(language, "hu") == $language][0]{
    title,
    publishedAt,
    excerpt,
    "language": coalesce(language, "hu"),
    "category": coalesce(category, "professional"),
    "imageUrl": mainImage.asset->url,
    content
  }`;

  const post = await client.fetch(query, { slug: params.slug, language });

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <h1 className="text-2xl font-bold">A keresett cikk nem található.</h1>
      </div>
    );
  }

  const blogJsonLd = buildBlogPostingJsonLd({ ...post, slug: params.slug, language });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <BlogPostClient post={post} />
    </>
  );
}
