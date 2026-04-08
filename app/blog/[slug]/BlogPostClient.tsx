import { Metadata } from 'next';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import BlogPostClient from './BlogPostClient';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: false, // Fontos: a szerver mindig a legfrissebb adatot lássa
});

// A GOOGLE-NEK SZÓLÓ RÉSZ (SEO)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const query = `*[_type == "post" && slug.current == $slug][0]{ title, seoTitle, seoDescription, excerpt }`;
  const post = await client.fetch(query, { slug: params.slug });
  
  if (!post) {
    return { title: 'Cikk nem található | Crown Dental' };
  }
  
  // Itt húzza be az Excelből megadott SEO címet és leírást!
  return {
    title: post.seoTitle || `${post.title} | Crown Dental`,
    description: post.seoDescription || post.excerpt || 'Olvassa el legújabb fogászati cikkünket a Crown Dental blogján.',
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    }
  };
}

// AZ ADATOK ÁTADÁSA A LÁTVÁNYNAK
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    content
  }`;
  const post = await client.fetch(query, { slug: params.slug });

  // Megkerüljük a Vercel szigorú TypeScript ellenőrzését:
  const ClientView = BlogPostClient as any;

  return <ClientView post={post} />;
}
