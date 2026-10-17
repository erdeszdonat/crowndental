import { NextRequest, NextResponse } from 'next/server';

// next.config redirects match case-insensitively. Keep these case-sensitive
// legacy corrections here to avoid redirecting the lowercase target to itself.
// Public documents and RSC requests still bypass this proxy; only the admin
// hostname, admin routes and these exact legacy corrections invoke it.
const exactLegacyRedirects = new Map<string, string>([
  ['/sk/kezelesek/tömesek', '/sk/kezelesek/esztetikai-fogaszat'],
  ['/de/kezelesek/Gyokerkezeles', '/de/kezelesek/gyokerkezeles'],
  ['/de/kezelesek/Gockutatas', '/de/kezelesek/gockutatas'],
]);

const ADMIN_ORIGIN = 'https://admin.crowndental.hu';
const PUBLIC_ORIGIN = 'https://www.crowndental.hu';
const adminApiPaths = new Set(['/api/admin-login', '/api/admin-logout', '/api/admin-data', '/api/admin-action']);
const privateHeaders = { 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Cache-Control': 'no-store' };

function adminDestination(path: string) {
  if (path === '/admin' || path === '/admin/portal') return '/';
  if (path === '/admin/beauty') return '/beauty-crown';
  return path.startsWith('/admin/') ? '/crown-dental/' + path.slice('/admin/'.length) : path;
}

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Next's internal request URL can use the server bind address. The Host
  // header is the hostname actually served by the platform/domain router.
  const hostname = (request.headers.get('host') || request.nextUrl.host).split(':')[0].toLowerCase();
  const isAdminHost = hostname === 'admin.crowndental.hu';
  const isPublicHost = hostname === 'crowndental.hu' || hostname === 'www.crowndental.hu';
  const isAdminApi = adminApiPaths.has(path) || path.startsWith('/api/admin/');
  const isAdminPage = path === '/admin' || path.startsWith('/admin/') || path === '/crown-dental' || path.startsWith('/crown-dental/') || path === '/beauty-crown';

  // Preserve old bookmarks, but never forward credential-bearing POST bodies.
  if (isPublicHost && isAdminPage) {
    return NextResponse.redirect(new URL(adminDestination(path) + request.nextUrl.search, ADMIN_ORIGIN), { status: 308, headers: privateHeaders });
  }
  if (isPublicHost && isAdminApi) {
    return NextResponse.json({ error: 'Az admin új címe: admin.crowndental.hu' }, { status: 421, headers: privateHeaders });
  }

  if (isAdminHost && (path === '/admin' || path.startsWith('/admin/'))) {
    return NextResponse.redirect(new URL(adminDestination(path) + request.nextUrl.search, ADMIN_ORIGIN), { status: 308, headers: privateHeaders });
  }
  if (isAdminHost && path === '/robots.txt') {
    return new NextResponse('User-agent: *\nDisallow: /\n', { headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  let internalPath: string | null = null;
  if (isAdminHost && path === '/') internalPath = '/admin/portal';
  if (path === '/crown-dental') internalPath = '/admin';
  if (path.startsWith('/crown-dental/')) internalPath = '/admin/' + path.slice('/crown-dental/'.length);
  if (path === '/beauty-crown') internalPath = '/admin/beauty';
  if (internalPath) {
    const destination = request.nextUrl.clone();
    destination.pathname = internalPath;
    return NextResponse.rewrite(destination, { headers: privateHeaders });
  }

  if (isAdminHost) {
    // All APIs retain their own existing authentication and origin checks.
    if (isAdminApi || path.startsWith('/_next/') || path.startsWith('/_vercel/') || ['/logo.webp', '/beauty-crown-logo.png', '/favicon.ico'].includes(path)) {
      return NextResponse.next({ headers: { 'X-Robots-Tag': privateHeaders['X-Robots-Tag'] } });
    }
    if (path.startsWith('/api/') || path === '/sitemap.xml') return new NextResponse(null, { status: 404, headers: privateHeaders });
    // Studio keeps its existing Sanity origin; public page links stay canonical.
    return NextResponse.redirect(new URL(path + request.nextUrl.search, PUBLIC_ORIGIN), { status: 307, headers: privateHeaders });
  }

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
    { source: '/:path*', has: [{ type: 'host', value: 'admin.crowndental.hu' }] },
    '/admin/:path*',
    '/crown-dental/:path*',
    '/beauty-crown',
    '/api/admin-login',
    '/api/admin-logout',
    '/api/admin-data',
    '/api/admin-action',
    '/api/admin/:path*',
    '/de/kezelesek/Gyokerkezeles',
    '/de/kezelesek/Gockutatas',
    '/sk/kezelesek/t%C3%B6mesek',
    '/sk/kezelesek/tömesek',
  ],
};
