import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const privatePaths = [
  '/admin/',
  '/studio/',
  '/api/',
  '/idopont/sikeres',
  '/en/idopont/sikeres',
  '/sk/idopont/sikeres',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: privatePaths },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: privatePaths },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: privatePaths },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
