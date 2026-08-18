import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/compiler-runtime': path.resolve(__dirname, './shims/compiler-runtime.js'),
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
      // CANONICAL HOST - az apex domaint mindig permanensen a www hostra visszük.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'crowndental.hu' }],
        destination: 'https://www.crowndental.hu/:path*',
        permanent: true,
      },

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

      // KANNIBALIZÁLÓ BLOGCIKKEK - a hasznos forrástartalom a célcikkben
      // megmarad, a régi URL pedig permanensen átadja a jelzéseit.
      { source: '/blog/hetvege', destination: '/blog/fogaszati-ugyelet-esztergomban-2026', permanent: true },
      { source: '/sk/blog/vikendovy-zubar-preco-je-dolezite-osetrenie-v-sobotu-a-nedelu', destination: '/sk/blog/zubna-pohotovost-ostrihom-2026-ordinacne-hodiny', permanent: true },
      { source: '/en/blog/weekend-dentist-why-saturday-and-sunday-care-matters', destination: '/en/blog/emergency-dentist-esztergom-2026-weekend-hours', permanent: true },
      { source: '/de/blog/zahnarzt-am-wochenende-samstag-sonntag-esztergom', destination: '/de/blog/zahnaerztlicher-notdienst-esztergom-2026-wochenende', permanent: true },

      // A két sérült szlovák slug olvasható, stabil kanonikus URL-re költözik.
      { source: '/sk/blog/ko-ko-stoja-umele-zuby-v-ma-arsku-v-roku-2026-kompletn-sprievodca-cenami', destination: '/sk/blog/kolko-stoja-umele-zuby-v-madarsku-2026', permanent: true },
      { source: '/sk/blog/zubn-implantat-v-ma-arsku-ko-ko-m-ete-u-etri-a-pre-o-je-crown-dental-najlep-ou-vo-bou', destination: '/sk/blog/zubny-implantat-v-madarsku-cena-a-vyhody', permanent: true },

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
