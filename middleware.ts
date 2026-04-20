import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A támogatott nyelvek listája
  locales: ['hu', 'en', 'sk'],

  // Alapértelmezett nyelv – az URL prefixe nem jelenik meg (pl. / = magyar)
  defaultLocale: 'hu',

  // Az alapértelmezett nyelvnél (hu) nem kerül prefix az URL-be
  localePrefix: 'as-needed',

  // Ne érzékelje automatikusan a böngésző nyelvét – a felhasználó választ
  localeDetection: false,
});

export const config = {
  // Minden útvonalra vonatkozik, kivéve az API-t, statikus fájlokat, studio-t
  matcher: [
    '/((?!api|studio|admin|_next|_vercel|.*\\..*).*)',
  ],
};
