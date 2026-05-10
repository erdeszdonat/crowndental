import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { title, slug, seoTitle, seoDescription, excerpt, content, language, pexelsImage, publishedAt } = await req.json();

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

    const doc: any = {
      _type: 'post',
      title,
      slug: { _type: 'slug', current: slug },
      seoTitle: seoTitle ?? title,
      seoDescription: seoDescription ?? '',
      excerpt: excerpt ?? '',
      publishedAt: publishedAt ?? new Date().toISOString().split('T')[0],
      content,
    };

    // Download Pexels image and upload to Sanity assets
    if (pexelsImage?.url) {
      try {
        const imgRes = await fetch(pexelsImage.url);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const asset = await client.assets.upload('image', buffer, {
            filename: `${slug}.jpg`,
            contentType,
          });
          doc.mainImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          };
        }
      } catch (imgErr) {
        console.warn('Kép feltöltés sikertelen, cikk kép nélkül kerül fel:', imgErr);
      }
    }

    const created = await client.create(doc);

    return NextResponse.json({ success: true, id: created._id, slug, hasImage: !!doc.mainImage });
  } catch (err: any) {
    console.error('Sanity feltöltési hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
