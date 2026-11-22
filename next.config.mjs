import { articleTranslations, oldArticleSlugs, mergedArticleSlugs } from './lib/blogRouteData.mjs';
import createNextIntlPlugin from 'next-intl/plugin';

// Older links mixed a language prefix with the slug of a different translation.
// Resolve only known articles, before Next.js checks the list of static routes.
function translatedArticleRedirects() {
  const redirects = new Map();
  const groupForSlug = new Map();
  for (const group of articleTranslations) {
    for (const slug of Object.values(group)) groupForSlug.set(slug, group);
  }
  const aliases = {
    ...oldArticleSlugs,
    ...mergedArticleSlugs,
    'fogorvos-valasztas': 'how-to-choose-dentist-10-signs-good-clinic',
  };
  for (const slug of new Set([...groupForSlug.keys(), ...Object.keys(aliases)])) {
    const group = groupForSlug.get(aliases[slug] ?? slug);
    if (!group) throw new Error(`Missing canonical translation group for ${slug}`);
    for (const [locale, target] of Object.entries(group)) {
      if (slug === target) continue;
      const prefix = locale === 'hu' ? '/blog/' : `/${locale}/blog/`;
      const source = prefix + slug;
      redirects.set(source, { source, destination: prefix + target, permanent: true });
    }
  }
  return [...redirects.values()];
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
const sanityApiOrigin = `https://${sanityProjectId}.api.sanity.io`;
const sanityCdnApiOrigin = `https://${sanityProjectId}.apicdn.sanity.io`;

const publicContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://www.facebook.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
  "font-src 'self' data:",
  `connect-src 'self' ${sanityApiOrigin} ${sanityCdnApiOrigin} https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://*.doubleclick.net https://*.googlesyndication.com https://connect.facebook.net https://www.facebook.com https://graph.facebook.com`,
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https://cdn.sanity.io",
  "manifest-src 'self'",
  ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
].join('; ');

// Sanity Studio uses dynamic module evaluation and connects to project-specific
// Sanity endpoints. Keep that broader policy isolated from all public pages.
const studioContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https:",
  "manifest-src 'self'",
  ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
].join('; ');

const sharedSecurityHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const publicSecurityHeaders = [
  { key: 'Content-Security-Policy', value: publicContentSecurityPolicy },
  ...sharedSecurityHeaders,
];

const studioSecurityHeaders = [
  { key: 'Content-Security-Policy', value: studioContentSecurityPolicy },
  ...sharedSecurityHeaders,
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/utalvany/webhook': ['./prototypes/karacsonyi-utalvanyok/teli-mese-a5.pdf'],
    '/api/admin/utalvanyok': ['./prototypes/karacsonyi-utalvanyok/teli-mese-a5.pdf'],
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: publicSecurityHeaders },
      // Next.js applies the last matching value for an identical header key.
      { source: '/studio/:path*', headers: studioSecurityHeaders },
    ];
  },
  async redirects() {
    return [
      // Keep the former admin entrance a single hop, including on the apex.
      { source: '/admin', has: [{ type: 'host', value: 'crowndental.hu' }], destination: 'https://admin.crowndental.hu/', permanent: true },
      // CANONICAL HOST - az apex domaint mindig permanensen a www hostra visszük.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'crowndental.hu' }],
        destination: 'https://www.crowndental.hu/:path*',
        permanent: true,
      },

      // A magyar az alapértelmezett locale, ezért a /hu prefix mindenhol
      // felesleges és egyetlen permanens lépésben a kanonikus URL-re kerül.
      { source: '/hu', destination: '/', permanent: true },
      { source: '/hu/:path*', destination: '/:path*', permanent: true },

      // Korábbi és tartalomban előfordult időpontfoglaló URL-ek.
      { source: '/idopontfoglalas', destination: '/idopont', permanent: true },
      { source: '/:locale(en|sk|de)/idopontfoglalas', destination: '/:locale/idopont', permanent: true },

      // Former patient-facing URLs with a verified equivalent.
      { source: '/idopont-foglalas', destination: '/idopont', permanent: true },
      { source: '/rendelesi-idok', destination: '/kapcsolat', permanent: true },
      { source: '/arlista', destination: '/kezelesek#arlista', permanent: true },
      { source: '/sk/cennik', destination: '/sk/kezelesek#arlista', permanent: true },
      { source: '/fogpotlas', destination: '/kezelesek#fogpotlas', permanent: true },
      { source: '/kezelesek/diagnosztika', destination: '/kezelesek/allapotfelmeres', permanent: true },
      { source: '/kezelesek/tomes', destination: '/kezelesek#diagnosztika', permanent: true },
      { source: '/cpg/138879/Esztetikai-fogaszat', destination: '/kezelesek/esztetikai-fogaszat', permanent: true },
      { source: '/fogko-es-szajhigienia', destination: '/kezelesek/air-polishing', permanent: true },
      { source: '/gyerek-fogszabalyozas', destination: '/kezelesek/fogszabalyozas', permanent: true },
      { source: '/blog/fogszabalyozas-felnottkent', destination: '/blog/lathatatlan-sin-vagy-rogzitett-fogszabalyozo-felnottkorban', permanent: true },
      { source: '/kezelesek/gyerekfogazat', destination: '/kezelesek/gyerekfogaszat', permanent: true },
      { source: '/kezelesek/gyokerkezel%C3%A9s', destination: '/kezelesek/gyokerkezeles', permanent: true },
      { source: '/ajanlatkeres', destination: '/#arajanlat-elemzo', permanent: true },
      { source: '/de/unterkunft', destination: '/de/utazas-szallas', permanent: true },
      { source: '/fogfeherites', destination: '/kezelesek/fogfeherites', permanent: true },
      { source: '/fogtechnikus', destination: '/kezelesek/fogtechnikai-megoldasok', permanent: true },
      { source: '/en/dentures', destination: '/en/kezelesek/fogsor', permanent: true },

      // A szlovák cikkekben elterjedt hibás "kezeleses" útvonalszegmens.
      { source: '/sk/kezeleses/fogkovezetites', destination: '/sk/kezelesek/esztetikai-fogaszat', permanent: true },
      { source: '/sk/kezeleses/tomok', destination: '/sk/kezelesek/esztetikai-fogaszat', permanent: true },
      { source: '/sk/kezelesek/fogkovezetites', destination: '/sk/kezelesek/esztetikai-fogaszat', permanent: true },
      { source: '/sk/kezelesek/tomok', destination: '/sk/kezelesek/esztetikai-fogaszat', permanent: true },
      {
        source: '/sk/kezeleses/:slug(esztetikai-fogaszat|fogfeherites|fogsor|gyokerkezeles|implantatum|koronak-hidak|szajsebeszet)',
        destination: '/sk/kezelesek/:slug',
        permanent: true,
      },

      // Régi, túl hosszú implantátum-összehasonlító cikkcímek.
      { source: '/blog/fogaszati-hid-vagy-implantatum-ar-elonyok-es-elettartam', destination: '/blog/fogaszati-hid-vagy-implantatum', permanent: true },
      { source: '/en/blog/dental-bridge-or-implant-comparing-cost-benefits-and-longevity', destination: '/en/blog/dental-bridge-or-implant', permanent: true },
      { source: '/de/blog/zahnbruecke-oder-implantat-kosten-vorteile-haltbarkeit', destination: '/de/blog/zahnbruecke-oder-implantat', permanent: true },

      // A korábban hibás német kártya-ID-khez védő redirectet tartunk fenn.
      { source: '/de/kezelesek/Nebelzabalyozas', destination: '/de/kezelesek/fogszabalyozas', permanent: true },
      { source: '/de/kezelesek/Nebelfeheriten', destination: '/de/kezelesek/fogfeherites', permanent: true },
      { source: '/de/kezelesek/Nebel', destination: '/de/kezelesek/fogsor', permanent: true },
      { source: '/de/kezelesek/Nebelhuzas', destination: '/de/kezelesek/foghuzas', permanent: true },

      // A nemzetközi landingek nyelvenként eltérő slugjai. Ezek a szabályok
      // a korábbi nyelvváltó által létrehozott hibás kombinációkat is javítják.
      { source: '/en/zubne-osetrenie-madarsko', destination: '/en/dental-treatment-hungary', permanent: true },
      { source: '/de/zubne-osetrenie-madarsko', destination: '/de/zahnbehandlung-ungarn', permanent: true },
      { source: '/sk/dental-treatment-hungary', destination: '/sk/zubne-osetrenie-madarsko', permanent: true },
      { source: '/de/dental-treatment-hungary', destination: '/de/zahnbehandlung-ungarn', permanent: true },
      { source: '/sk/zahnbehandlung-ungarn', destination: '/sk/zubne-osetrenie-madarsko', permanent: true },
      { source: '/en/zahnbehandlung-ungarn', destination: '/en/dental-treatment-hungary', permanent: true },
      { source: '/zubne-osetrenie-madarsko', destination: '/utazas-szallas', permanent: true },
      { source: '/dental-treatment-hungary', destination: '/utazas-szallas', permanent: true },
      { source: '/zahnbehandlung-ungarn', destination: '/utazas-szallas', permanent: true },

      // SZOLGÁLTATÁSOK - Régi URL-ek → Új struktúra
      { source: '/cpg/891877/Fogsor', destination: '/kezelesek/fogsor', permanent: true },
      { source: '/cpg/133087/Fogtechnikai-megoldasok', destination: '/kezelesek/fogtechnikai-megoldasok', permanent: true },
      { source: '/cpg/550106/Szajsebeszet', destination: '/kezelesek/szajsebeszet', permanent: true },
      { source: '/cpg/162800/Fogfeherites', destination: '/kezelesek/fogfeherites', permanent: true },
      { source: '/cpg/881143/Allapotfelmeres', destination: '/kezelesek/allapotfelmeres', permanent: true },
      { source: '/fogaszati-implantatumok', destination: '/kezelesek/implantatum', permanent: true },
      { source: '/esztetikai-fogaszat', destination: '/kezelesek/esztetikai-fogaszat', permanent: true },
      { source: '/foghuzas', destination: '/kezelesek/foghuzas', permanent: true },
      { source: '/gyokerkezeles', destination: '/kezelesek/gyokerkezeles', permanent: true },
      { source: '/fogszabalyozas', destination: '/kezelesek/fogszabalyozas', permanent: true },
      { source: '/koronak-hidak', destination: '/kezelesek/koronak-hidak', permanent: true },
      { source: '/fogaszati-szolgaltatasok', destination: '/kezelesek', permanent: true },
      { source: '/gockutatas-fogaszati-hater-panaszok', destination: '/kezelesek/gockutatas', permanent: true },
      { source: '/fajdalommentes-fogaszat-esztergom', destination: '/esztergom', permanent: true },
      { source: '/szallas', destination: '/utazas-szallas', permanent: true },
      { source: '/:locale(en|sk|de)/szallas', destination: '/:locale/utazas-szallas', permanent: true },

      // FUNKCIONÁLIS OLDALAK
      { source: '/cpg/978873/Arlista', destination: '/kezelesek', permanent: true },
      { source: '/cpg/696488/Kapcsolat', destination: '/kapcsolat', permanent: true },
      { source: '/cpg/156506/Karrier', destination: '/karrier', permanent: true },
      { source: '/cpg/803324/Idopont-Foglalas', destination: '/idopont', permanent: true },
      { source: '/cpg/990688/Rolunk', destination: '/rolunk', permanent: true },

      // BLOG
      { source: '/cpg/930300/Blog', destination: '/blog', permanent: true },
      { source: '/cpg/930300,3399946/Faj-vagy-csak-kellemetlen', destination: '/blog/faj-vagy-csak-kellemetlen', permanent: true },
      { source: '/cpg/930300,3494336/Fogorvos-es-Fogtechnikus-egy-Csapatban', destination: '/blog/fogorvos-es-fogtechnikus-egy-csapatban', permanent: true },
      { source: '/cpg/930300,3466371/Hagyomanyos-vagy-elektromos-fogkefe-A-tiszta-fogak', destination: '/blog/hagyomanyos-vagy-elektromos-fogkefe-a-tiszta-fogak', permanent: true },
      { source: '/cpg/930300,3348316/Hogyan-valasszunk-fogorvost-5-szempont-ami-segit-a', destination: '/blog/hogyan-valasszunk-fogorvost-5-szempont-ami-segit-a', permanent: true },
      { source: '/cpg/930300,3348306/Ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi', destination: '/blog/ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi', permanent: true },
      { source: '/cpg/930300,3348311/Soha-nincs-keso-a-tokeletes-mosolyhoz-fogszabalyoz', destination: '/blog/soha-nincs-keso-a-tokeletes-mosolyhoz-fogszabalyoz', permanent: true },
      { source: '/cpg/930300,3348301/Uj-mosoly-varakozas-nelkul-minden-a-modern-fogsoro', destination: '/blog/uj-mosoly-varakozas-nelkul-minden-a-modern-fogsoro', permanent: true },

      // Régi feed URL-eknek a bloglista a legközelebbi valódi megfelelője.
      { source: '/feed', destination: '/blog', permanent: true },
      { source: '/blog/feed', destination: '/blog', permanent: true },

      ...translatedArticleRedirects(),

      // A nem leképezett /cpg/ URL-ek szándékosan maradnak valódi 404-ek.
      // A főoldalra irányított tömeges 307 soft-404 jelzést okozott volna.
    ];
  },
  async rewrites() {
    // The locale is encoded in the URL; public pages do not need a Node.js
    // proxy invocation merely to add the default locale. Keep root applications
    // and assets outside the rewrite, including their nested paths.
    return {
      beforeFiles: [
        { source: '/', destination: '/hu' },
        {
          source: '/:path((?!hu(?:/|$)|en(?:/|$)|sk(?:/|$)|de(?:/|$)|api(?:/|$)|studio(?:/|$)|admin(?:/|$)|hidfutas(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\..*).+)',
          destination: '/hu/:path',
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
