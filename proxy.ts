import { NextRequest, NextResponse } from 'next/server';

// next.config redirects match case-insensitively. Keep these case-sensitive
// legacy corrections here to avoid redirecting the lowercase target to itself.
// Normal public documents and RSC requests no longer invoke this proxy.
const exactLegacyRedirects = new Map<string, string>([
  ['/sk/kezelesek/tömesek', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/de/kezelesek/Gyokerkezeles', '/de/kezelesek/gyokerkezeles'],
  ['/de/kezelesek/Gockutatas', '/de/kezelesek/gockutatas'],
]);

export default function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/de/kezelesek/Gyokerkezeles',
    '/de/kezelesek/Gockutatas',
    '/sk/kezelesek/t%C3%B6mesek',
    '/sk/kezelesek/tömesek',
  ],
};
