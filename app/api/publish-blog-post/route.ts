import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { title, slug, seoTitle, seoDescription, excerpt, content, language } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Hiányzó mezők: title, slug, content' }, { status: 400 });
    }

    const token = process.env.SANITY_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: 'Hiányzó SANITY_WRITE_TOKEN' }, { status: 500 });

    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-03-10',
      token,
      useCdn: false,
    });

    const doc = {
      _type: 'post',
      title,
      slug: { _type: 'slug', current: slug },
      seoTitle: seoTitle ?? title,
      seoDescription: seoDescription ?? '',
      excerpt: excerpt ?? '',
      publishedAt: new Date().toISOString().split('T')[0],
      content,
    };

    const created = await client.create(doc);

    return NextResponse.json({ success: true, id: created._id, slug });
  } catch (err: any) {
    console.error('Sanity feltöltési hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
