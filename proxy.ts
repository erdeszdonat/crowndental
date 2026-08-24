import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A támogatott nyelvek listája
  locales: ['hu', 'en', 'sk', 'de'],

  // Alapértelmezett nyelv – az URL prefixe nem jelenik meg (pl. / = magyar)
  defaultLocale: 'hu',

  // Az alapértelmezett nyelvnél (hu) nem kerül prefix az URL-be
  localePrefix: 'as-needed',

  // Ne érzékelje automatikusan a böngésző nyelvét – a felhasználó választ
  localeDetection: false,

  // Locale is fully encoded in the URL. Avoid setting NEXT_LOCALE on every
  // document response, which otherwise prevents shared CDN caching.
  localeCookie: false,

  // A blogfordítások eltérő slugot használnak. A next-intl automatikus Link
  // fejléce ugyanazt a slugot tenné minden locale alá, ezért a valódi
  // hreflang-készleteket az oldal metadata és a sitemap állítja elő.
  alternateLinks: false,
});

const exactLegacyRedirects = new Map<string, string>([
  ['/sk/kezelesek/tömesek', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/de/kezelesek/Gyokerkezeles', '/de/kezelesek/gyokerkezeles'],
  ['/de/kezelesek/Gockutatas', '/de/kezelesek/gockutatas'],
]);

export default function proxy(request: NextRequest) {
  // Browsers keep non-ASCII path segments percent encoded. Decode only for
  // this exact legacy URL and keep the original query string when redirecting.
  let decodedPathname = request.nextUrl.pathname;
  try {
    decodedPathname = decodeURIComponent(decodedPathname);
  } catch {}

  const redirectTarget = exactLegacyRedirects.get(decodedPathname);
  if (redirectTarget) {
    const destination = request.nextUrl.clone();
    destination.pathname = redirectTarget;
    return NextResponse.redirect(destination, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  // Minden útvonalra vonatkozik, kivéve az API-t, statikus fájlokat, studio-t
  matcher: [
    '/((?!api|studio|admin|_next|_vercel|.*\\..*).*)',
  ],
};
