import HomeClient, { type HomeSanityImages } from './HomeClient';

export const revalidate = 3600;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const emptyHomeSanityImages: HomeSanityImages = {
  hero: { fokep: '', fokep1: '', fokep2: '' },
  locations: {},
  labImage: '',
  services: {},
};

function optimizeSanityImage(url: string, width = 800, height?: number) {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  return `${url}?fm=webp&w=${width}&q=65&fit=crop&auto=format${height ? `&h=${height}` : ''}`;
}

async function fetchSanityData<T>(query: string): Promise<T | null> {
  const url = `https://${projectId}.api.sanity.io/v2024-03-08/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function getHomeSanityImages(): Promise<HomeSanityImages> {
  const [heroResults, locationResults, labResult, treatmentResults] = await Promise.all([
    fetchSanityData<Array<{ slug?: string; imageUrl?: string }>>(
      `*[_type=="treatment"&&slug.current in ["fokep","fokep1","fokep2"]]{"slug":slug.current,"imageUrl":coalesce(mainImage.asset->url,heroImage.asset->url)}`
    ),
    fetchSanityData<Array<{ name?: string; title?: string; address?: string; tag?: string; imageUrl?: string }>>(
      `*[_type=="location"]{name,title,address,tag,"imageUrl":image.asset->url}`
    ),
    fetchSanityData<{ url?: string }>(
      `*[_type=="treatment"&&slug.current=="fogtechnika"][0]{"url":coalesce(mainImage.asset->url,heroImage.asset->url)}`
    ),
    fetchSanityData<Array<{ slug?: string; imageUrl?: string }>>(
      `*[_type=="treatment"]{"slug":slug.current,"imageUrl":coalesce(mainImage.asset->url,heroImage.asset->url)}`
    ),
  ]);

  const hero = { ...emptyHomeSanityImages.hero };
  heroResults?.forEach((item) => {
    if (item.slug && item.imageUrl && item.slug in hero) {
      hero[item.slug as keyof typeof hero] = optimizeSanityImage(item.imageUrl, 1920, 1080);
    }
  });

  const locations: HomeSanityImages['locations'] = {};
  locationResults?.forEach((location) => {
    if (!location.name) return;
    locations[location.name] = {
      ...location,
      imageUrl: location.imageUrl ? optimizeSanityImage(location.imageUrl, 800, 500) : '',
    };
  });

  const services: HomeSanityImages['services'] = {};
  treatmentResults?.forEach((item) => {
    if (item.slug && item.imageUrl) {
      services[item.slug] = optimizeSanityImage(item.imageUrl, 600, 400);
    }
  });

  return {
    hero,
    locations,
    labImage: labResult?.url ? optimizeSanityImage(labResult.url, 1200, 800) : '',
    services,
  };
}

export default async function HomePage() {
  const sanityImages = await getHomeSanityImages();

  return <HomeClient sanityImages={sanityImages} />;
}
