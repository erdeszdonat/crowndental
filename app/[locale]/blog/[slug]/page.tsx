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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <h1 className="text-2xl font-bold">A keresett cikk nem található.</h1>
      </div>
    );
  }

  // Ez a megoldás 100%, hogy nem dob TypeScript hibát és nem omlik össze a Vercelen
  return <BlogPostClient post={post} />;
}
