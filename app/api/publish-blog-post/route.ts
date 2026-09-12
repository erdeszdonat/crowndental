import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@sanity/client';
import { normalizeBlogCategory, normalizeBlogLanguage } from '@/lib/blogConfig';
import { submitToIndexNow } from '@/lib/indexNow';
import { localizedUrl } from '@/lib/seo';
import { requireAdminSession } from '@/lib/adminAuth';
import { cleanText, enforceRateLimit, noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export const maxDuration = 60;

const ALLOWED_IMAGE_HOSTS = new Set(['images.pexels.com']);
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function validateImageUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || value.length > 2_000) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

async function downloadTrustedImage(url: URL): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'image/jpeg,image/png,image/webp' },
  });
  const finalUrl = validateImageUrl(response.url);
  if (!response.ok || !finalUrl) throw new Error('A borítókép nem tölthető le biztonságosan.');

  const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) throw new Error('Nem támogatott borítókép-formátum.');
  if (contentLength > MAX_IMAGE_BYTES) throw new Error('A borítókép túl nagy.');

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error('A borítókép mérete érvénytelen.');
  return { buffer, contentType };
}

export async function POST(req: Request) {
  const originError = rejectUntrustedMutation(req);
  if (originError) return originError;
  const authError = requireAdminSession(req);
  if (authError) return authError;
  const rateLimitError = await enforceRateLimit(req, 'admin-blog-publish', { limit: 20, windowMs: 15 * 60_000 });
  if (rateLimitError) return rateLimitError;

  try {
    const input = await req.json();
    const title = cleanText(input.title, 180);
    const slug = cleanText(input.slug, 120).toLowerCase();
    const seoTitle = cleanText(input.seoTitle, 180);
    const seoDescription = cleanText(input.seoDescription, 320);
    const excerpt = cleanText(input.excerpt, 700);
    const content = input.content;
    const language = input.language;
    const category = input.category;
    const pexelsImage = input.pexelsImage;
    const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(String(input.publishedAt || '')) ? input.publishedAt : undefined;

    if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !Array.isArray(content) || !content.length) {
      return noStoreJson({ error: 'A cím, a szabályos slug és a cikk tartalma kötelező.' }, { status: 400 });
    }
    if (content.length > 500 || JSON.stringify(content).length > 1_000_000) {
      return noStoreJson({ error: 'A cikk tartalma túl nagy.' }, { status: 413 });
    }

    const token = process.env.SANITY_WRITE_TOKEN;
    if (!token) return noStoreJson({ error: 'Hiányzó SANITY_WRITE_TOKEN' }, { status: 500 });

    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-03-10',
      token,
      useCdn: false,
    });

    const normalizedLanguage = normalizeBlogLanguage(language);
    const existingId = await client.fetch<string | null>(
      '*[_type == "post" && language == $language && slug.current == $slug][0]._id',
      { language: normalizedLanguage, slug },
    );
    if (existingId) {
      return noStoreJson({ error: 'Ezen a nyelven már létezik cikk ezzel a sluggal.' }, { status: 409 });
    }

    const doc: any = {
      _type: 'post',
      title,
      slug: { _type: 'slug', current: slug },
      language: normalizedLanguage,
      category: normalizeBlogCategory(category),
      seoTitle: seoTitle ?? title,
      seoDescription: seoDescription ?? '',
      excerpt: excerpt ?? '',
      publishedAt: publishedAt ?? new Date().toISOString().split('T')[0],
      content,
    };

    // Download Pexels image and upload to Sanity assets
    if (pexelsImage?.url) {
      try {
        const safeImageUrl = validateImageUrl(pexelsImage.url);
        if (!safeImageUrl) throw new Error('A borítókép URL-je nem engedélyezett.');
        const { buffer, contentType } = await downloadTrustedImage(safeImageUrl);
        const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
        const asset = await client.assets.upload('image', buffer, {
          filename: `${slug}.${extension}`,
          contentType,
        });
        doc.mainImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        };
      } catch (imgErr) {
        console.warn('Kép feltöltés sikertelen, cikk kép nélkül kerül fel:', imgErr);
      }
    }

    const created = await client.create(doc);

    // next-intl rewrites the unprefixed Hungarian URL to /hu internally.
    // Revalidate the actual route paths because Proxy is not executed during
    // on-demand ISR. Only the changed locale and article are invalidated.
    const internalBlogPath = `/${normalizedLanguage}/blog`;
    revalidatePath(internalBlogPath);
    revalidatePath(`${internalBlogPath}/${slug}`);
    revalidatePath('/sitemap.xml');

    try {
      await submitToIndexNow([
        localizedUrl(doc.language, `blog/${slug}`),
        localizedUrl(doc.language, 'blog'),
      ]);
    } catch (indexNowError) {
      console.warn('IndexNow beküldés sikertelen:', indexNowError);
    }

    return noStoreJson({
      success: true,
      id: created._id,
      slug,
      language: doc.language,
      category: doc.category,
      hasImage: !!doc.mainImage,
    });
  } catch (err: any) {
    console.error('Sanity feltöltési hiba:', err);
    return noStoreJson({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
