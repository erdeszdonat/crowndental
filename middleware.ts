import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A támogatott nyelvek listája
  locales: ['hu', 'en', 'sk', 'de'],

  // Alapértelmezett nyelv – az URL prefixe nem jelenik meg (pl. / = magyar)
  defaultLocale: 'hu',

  // Az alapértelmezett nyelvnél (hu) nem kerül prefix az URL-be
  localePrefix: 'as-needed',

  // Ne érzékelje automatikusan a böngésző nyelvét – a felhasználó választ
  localeDetection: false,

  // A blogfordítások eltérő slugot használnak. A next-intl automatikus Link
  // fejléce ugyanazt a slugot tenné minden locale alá, ezért a valódi
  // hreflang-készleteket az oldal metadata és a sitemap állítja elő.
  alternateLinks: false,
});

export const config = {
  // Minden útvonalra vonatkozik, kivéve az API-t, statikus fájlokat, studio-t
  matcher: [
    '/((?!api|studio|admin|_next|_vercel|.*\\..*).*)',
  ],
};
