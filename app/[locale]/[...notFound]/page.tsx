import { notFound } from 'next/navigation';

/**
 * Route unknown localized paths through the nearest locale-aware 404 page.
 * Without this catch-all, Next.js falls back to its generic English 404 for
 * URLs such as /sk/old-page, even though app/[locale]/not-found.tsx exists.
 */
export default function LocalizedCatchAllPage() {
  notFound();
}
