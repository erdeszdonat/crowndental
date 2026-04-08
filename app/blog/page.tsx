import React from 'react';
import { Metadata } from 'next';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import BlogPostClient from './BlogPostClient';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: false,
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const query = `*[_type == "post" && slug.current == $slug][0]{ title, seoTitle, seoDescription, excerpt }`;
  const post = await client.fetch(query, { slug: params.slug });
  
  if (!post) return { title: 'Cikk nem található | Crown Dental' };
  
  return {
    title: post.seoTitle || `${post.title} | Crown Dental`,
    description: post.seoDescription || post.excerpt || 'Olvassa el legújabb fogászati cikkünket.',
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    content
  }`;
  const post = await client.fetch(query, { slug: params.slug });

  // NUKLEÁRIS OPCIÓ: React.createElement használata a TypeScript hiba kikerülésére
  return React.createElement(BlogPostClient as any, { post: post });
}
