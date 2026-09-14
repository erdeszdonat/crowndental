import 'server-only';
import { cache } from 'react';

/** One bounded cache entry shared by every treatment and language, not one per visitor. */
export const getTreatmentImages = cache(async (): Promise<Record<string, string>> => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const query = '*[_type == "treatment" && !(_id in path("drafts.**"))]{"slug":slug.current,"url":coalesce(mainImage.asset->url,heroImage.asset->url)}';
  const url = `https://${projectId}.api.sanity.io/v2024-03-10/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, { next: { revalidate: 604800, tags: ['treatment-images'] } });
  // Failed revalidation must retain the last good page, not cache an empty image set.
  if (!response.ok) throw new Error(`Treatment images unavailable (${response.status})`);
  const data = await response.json() as { result: Array<{ slug?: string; url?: string }> };
  const images: Record<string, string> = {};
  for (const item of data.result) {
    if (item.slug && item.url?.startsWith('https://cdn.sanity.io/')) images[item.slug] = item.url;
  }
  images['fogtechnikai-megoldasok'] = images['fogtechnikai-megoldasok'] || images.fogtechnika || '';
  return images;
});
