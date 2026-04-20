import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/compiler-runtime': false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
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
      { source: '/cpg/930300,3348316/Hogyan-valasszunk-fogorvost-5-szempont-ami-segit-a', destination: '/blog/fogorvos-valasztas', permanent: true },
      { source: '/cpg/930300,3348306/Ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi', destination: '/blog/ragyogo-mosoly-egy-ora-alatt', permanent: true },
      { source: '/cpg/930300,3348311/Soha-nincs-keso-a-tokeletes-mosolyhoz-fogszabalyoz', destination: '/blog/fogszabalyozas-felnottkent', permanent: true },
      { source: '/cpg/930300,3348301/Uj-mosoly-varakozas-nelkul-minden-a-modern-fogsoro', destination: '/blog/modern-fogsorok', permanent: true },

      // WILDCARD - minden maradék régi URL
      { source: '/cpg/:path*', destination: '/', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/esztergom/:path*', destination: '/lokacio/esztergom/:path*' },
      { source: '/budapest/:path*', destination: '/lokacio/budapest/:path*' },
      { source: '/studio', destination: 'https://crowndental-dun.vercel.app/studio' },
      { source: '/studio/:path*', destination: 'https://crowndental-dun.vercel.app/studio/:path*' },
    ];
  },
};

export default withNextIntl(nextConfig);
