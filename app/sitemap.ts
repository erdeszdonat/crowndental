import { MetadataRoute } from 'next';

// ═══════════════════════════════════════════════════════════════════════════
// SANITY NATIV FETCH A BLOG CIKKEKHEZ
// ═══════════════════════════════════════════════════════════════════════════
const fetchSanityPosts = async () => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
  const dataset = 'production';
  const query = encodeURIComponent(`*[_type == "post"]{ "slug": slug.current, _updatedAt }`);
  const url = `https://${projectId}.api.sanity.io/v2024-03-08/data/query/${dataset}?query=${query}`;
  
  try {
    // Revalidate beállítás, hogy a Vercel óránként frissítse a cache-t
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.result || [];
  } catch (error) {
    console.error("Sitemap: Hiba a Sanity cikkek lekérésekor:", error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Végleges, éles domain
  const baseUrl = 'https://www.crowndental.hu';

  // 1. STATIKUS ÚTVONALAK DEFINIÁLÁSA
  const staticRoutes: MetadataRoute.Sitemap = [
    '', // Főoldal
    '/kezelesek',
    '/kezelesek/implantatum',
    '/kezelesek/fogszabalyozas',
    '/kezelesek/koronak-hidak',
    '/kezelesek/fogfeherites',
    '/kezelesek/fogsor',
    '/kezelesek/szajsebeszet',
    '/kezelesek/gyokerkezeles',
    '/kezelesek/esztetikai-fogaszat',
    '/kezelesek/allapotfelmeres',
    '/kezelesek/gockutatas',
    '/kezelesek/fogtechnikai-megoldasok',
    '/kezelesek/gyerekfogaszat',
    '/kezelesek/foghuzas',
    '/kezelesek/fogtechnika',
    '/esztergom',
    '/budapest',
    '/rolunk',
    '/kapcsolat',
    '/blog',
    '/karrier',
    '/idopont',
    '/aszf',
    '/adatkezeles',
    '/cookie-tajekoztato',
    '/impresszum',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    // A főoldal kapja a legnagyobb prioritást (1.0), a többi picit kevesebbet
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. DINAMIKUS BLOG CIKKEK LEKÉRÉSE A SANITY-BŐL
  const sanityPosts = await fetchSanityPosts();
  
  const dynamicBlogRoutes: MetadataRoute.Sitemap = sanityPosts
    .filter((post: any) => post.slug) // Csak azok kellenek, amiknek van URL-je
    .map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6, // A blog cikkek prioritása normál
    }));

  // Visszaadjuk a statikus és a dinamikus útvonalak egyesített listáját a Google-nek
  return [...staticRoutes, ...dynamicBlogRoutes];
}
