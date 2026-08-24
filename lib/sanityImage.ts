import type { ImageLoaderProps } from 'next/image';

const SANITY_IMAGE_HOST = 'cdn.sanity.io';

/**
 * Builds a responsive Sanity CDN URL for next/image without routing the image
 * through a second optimizer. Existing crop/hotspot query parameters are kept.
 */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' || url.hostname !== SANITY_IMAGE_HOST) return src;

    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    // Keep the generated resource width aligned with next/image's srcset
    // descriptor. Clamping would make (for example) a 32w candidate download
    // a 64px image and could make large candidates smaller than advertised.
    url.searchParams.set('w', String(Math.max(Math.round(width), 1)));
    url.searchParams.set('q', String(Math.min(Math.max(Math.round(quality ?? 78), 40), 90)));
    return url.toString();
  } catch {
    return src;
  }
}
