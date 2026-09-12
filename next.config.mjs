import createNextIntlPlugin from 'next-intl/plugin';

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

      // Régi angol slug, amely korábban a fogorvosválasztási cikk kanonikus
      // változataként szerepelt a Search Console-ban.
      { source: '/en/blog/fogorvos-valasztas', destination: '/en/blog/how-to-choose-dentist-10-signs-good-clinic', permanent: true },

      // Régi feed URL-eknek a bloglista a legközelebbi valódi megfelelője.
      { source: '/feed', destination: '/blog', permanent: true },
      { source: '/blog/feed', destination: '/blog', permanent: true },

      // KANNIBALIZÁLÓ BLOGCIKKEK - a hasznos forrástartalom a célcikkben
      // megmarad, a régi URL pedig permanensen átadja a jelzéseit.
      { source: '/blog/hetvege', destination: '/blog/fogaszati-ugyelet-esztergomban-2026', permanent: true },
      { source: '/sk/blog/vikendovy-zubar-preco-je-dolezite-osetrenie-v-sobotu-a-nedelu', destination: '/sk/blog/zubna-pohotovost-ostrihom-2026-ordinacne-hodiny', permanent: true },
      { source: '/en/blog/weekend-dentist-why-saturday-and-sunday-care-matters', destination: '/en/blog/emergency-dentist-esztergom-2026-weekend-hours', permanent: true },
      { source: '/de/blog/zahnarzt-am-wochenende-samstag-sonntag-esztergom', destination: '/de/blog/zahnaerztlicher-notdienst-esztergom-2026-wochenende', permanent: true },

      // A két sérült szlovák slug olvasható, stabil kanonikus URL-re költözik.
      { source: '/sk/blog/ko-ko-stoja-umele-zuby-v-ma-arsku-v-roku-2026-kompletn-sprievodca-cenami', destination: '/sk/blog/kolko-stoja-umele-zuby-v-madarsku-2026', permanent: true },
      { source: '/sk/blog/zubn-implantat-v-ma-arsku-ko-ko-m-ete-u-etri-a-pre-o-je-crown-dental-najlep-ou-vo-bou', destination: '/sk/blog/zubny-implantat-v-madarsku-cena-a-vyhody', permanent: true },
      { source: '/sk/blog/zubar-v-ma-arsku-pre-o-si-slovenski-pacienti-vyberaju-esztergom', destination: '/sk/blog/zubar-v-madarsku-preco-si-slovenski-pacienti-vyberaju-ostrihom', permanent: true },
      { source: '/sk/blog/ko-ko-stoji-zubna-korunka-v-roku-2026-kompletn-sprievodca-cenami', destination: '/sk/blog/kolko-stoji-zubna-korunka-2026', permanent: true },

      // A nem leképezett /cpg/ URL-ek szándékosan maradnak valódi 404-ek.
      // A főoldalra irányított tömeges 307 soft-404 jelzést okozott volna.
    ];
  },
  async rewrites() {
    return [
      { source: '/esztergom/:path*', destination: '/lokacio/esztergom/:path*' },
      { source: '/budapest/:path*', destination: '/lokacio/budapest/:path*' },

    ];
  },
};

export default withNextIntl(nextConfig);
