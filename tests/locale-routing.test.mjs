import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import nextConfig from '../next.config.mjs';

// Next installs this global at server startup; make its official route-testing
// utilities available in the network-free Node test runner as well.
globalThis.AsyncLocalStorage = AsyncLocalStorage;
const { default: testing } = await import('next/experimental/testing/server.js');
const { unstable_getResponseFromNextConfig, unstable_doesMiddlewareMatch, getRewrittenUrl } = testing;
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const proxyModule = { exports: {} };
const source = ts.transpileModule(readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
vm.runInNewContext(source, { module: proxyModule, exports: proxyModule.exports, require, URL });
const { default: proxy, config: proxyConfig } = proxyModule.exports;
const origin = 'https://www.crowndental.hu';

const publicPaths = ['/', '/esztergom', '/budapest', '/kezelesek/direkt-hej', '/hollywood-mosoly', '/blog', '/idopont', '/en', '/sk/blog', '/de/kezelesek/gyokerkezeles'];

test('public documents and RSC prefetches never invoke the locale proxy', () => {
  for (const pathname of publicPaths) {
    for (const headers of [{}, { rsc: '1', 'next-router-prefetch': '1' }]) {
      assert.equal(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig, url: origin + pathname, headers }), false, pathname);
    }
  }
});

test('default-locale rewrites preserve deep routes and booking query parameters', async () => {
  for (const [pathname, destination] of [
    ['/', '/hu'],
    ['/esztergom', '/hu/esztergom'],
    ['/budapest', '/hu/budapest'],
    ['/kezelesek/direkt-hej', '/hu/kezelesek/direkt-hej'],
    ['/idopont?treatment=direkt-hej&utm_source=organic', '/hu/idopont?treatment=direkt-hej&utm_source=organic'],
    ['/cpg/not-a-real-page', '/hu/cpg/not-a-real-page'],
  ]) {
    const response = await unstable_getResponseFromNextConfig({ url: origin + pathname, nextConfig });
    assert.equal(getRewrittenUrl(response), origin + destination, pathname);
  }
});

test('locale prefixes, root applications and static assets bypass Hungarian rewrites', async () => {
  for (const pathname of ['/en', '/sk/blog', '/de/kezelesek/foghuzas', '/api/book-appointment', '/admin', '/admin/hidfutas', '/studio', '/studio/structure', '/hidfutas', '/hidfutas/szabalyzat', '/_next/image', '/_next/static/test.js', '/logo.webp', '/sitemap.xml', '/robots.txt', '/indexnow-key.txt']) {
    const response = await unstable_getResponseFromNextConfig({ url: origin + pathname, nextConfig });
    assert.equal(getRewrittenUrl(response), null, pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test('legacy spelling corrections preserve queries and do not redirect canonical targets', () => {
  for (const [pathname, target] of [
    ['/de/kezelesek/Gyokerkezeles', '/de/kezelesek/gyokerkezeles'],
    ['/de/kezelesek/Gockutatas', '/de/kezelesek/gockutatas'],
    ['/sk/kezelesek/t%C3%B6mesek', '/sk/kezelesek/esztetikai-fogaszat'],
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig, url: origin + pathname }), true, pathname);
    const response = proxy(new NextRequest(origin + pathname + '?utm_source=legacy'));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), origin + target + '?utm_source=legacy');
    assert.equal(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig, url: origin + target }), false, target);
    assert.equal(proxy(new NextRequest(origin + target)).headers.get('location'), null, target);
  }
});

test('admin hostname opens the brand chooser and routes each brand separately', () => {
  for (const [pathname, internalPath] of [
    ['/', '/admin/portal'], ['/crown-dental', '/admin'],
    ['/crown-dental/hidfutas', '/admin/hidfutas'], ['/beauty-crown', '/admin/beauty'],
  ]) {
    const url = 'https://admin.crowndental.hu' + pathname;
    assert.equal(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig, url }), true);
    const response = proxy(new NextRequest(url));
    assert.equal(getRewrittenUrl(response), 'https://admin.crowndental.hu' + internalPath);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('old admin bookmarks redirect without loops and preserve deep links and queries', () => {
  for (const hostname of ['www.crowndental.hu', 'crowndental.hu', 'admin.crowndental.hu']) {
    for (const [pathname, destination] of [['/admin', '/'], ['/admin/portal', '/'], ['/admin/hidfutas', '/crown-dental/hidfutas'], ['/admin/beauty', '/beauty-crown']]) {
      const response = proxy(new NextRequest(`https://${hostname}${pathname}?page=2`));
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), 'https://admin.crowndental.hu' + destination + '?page=2');
    }
  }
});

test('retired public-host admin APIs reject requests without forwarding credentials', async () => {
  for (const pathname of ['/api/admin-login', '/api/admin-logout', '/api/admin-data', '/api/admin-action', '/api/admin/hidfutas', '/api/admin/import-resend']) {
    for (const hostname of ['www.crowndental.hu', 'crowndental.hu']) {
      const response = proxy(new NextRequest(`https://${hostname}${pathname}`, { method: 'POST' }));
      assert.equal(response.status, 421);
      assert.equal(response.headers.get('location'), null);
      assert.equal(response.headers.get('x-middleware-rewrite'), null);
    }
    const response = proxy(new NextRequest('https://admin.crowndental.hu' + pathname));
    assert.equal(response.headers.get('x-middleware-next'), '1');
  }
});

test('admin hostname cannot serve public forms or an indexable duplicate website', async () => {
  const robots = proxy(new NextRequest('https://admin.crowndental.hu/robots.txt'));
  assert.equal(await robots.text(), 'User-agent: *\nDisallow: /\n');
  for (const path of ['/api/book-appointment', '/api/career_applications', '/sitemap.xml']) {
    assert.equal(proxy(new NextRequest('https://admin.crowndental.hu' + path)).status, 404);
  }
  for (const path of ['/studio', '/studio/structure', '/blog/test', '/hidfutas']) {
    assert.equal(proxy(new NextRequest('https://admin.crowndental.hu' + path)).headers.get('location'), origin + path);
  }
});

test('local and preview verification stays local instead of using production admin', () => {
  for (const host of ['http://localhost:3050', 'https://review.vercel.app']) {
    assert.equal(getRewrittenUrl(proxy(new NextRequest(host + '/crown-dental'))), host + '/admin');
    assert.equal(proxy(new NextRequest(host + '/admin/portal')).headers.get('location'), null);
    assert.equal(proxy(new NextRequest(host + '/api/admin-login')).headers.get('x-middleware-next'), '1');
  }
});

test('admin origin matching is exact and leaves similarly named public paths alone', () => {
  for (const url of ['https://admin.crowndental.hu.evil.example/', origin + '/administrator', origin + '/api/admin-login-other']) {
    assert.equal(proxy(new NextRequest(url)).headers.get('location'), null);
    assert.equal(proxy(new NextRequest(url)).headers.get('x-middleware-rewrite'), null);
  }
});


test('host routing uses the served Host even when Next has an internal request URL', () => {
  const request = new NextRequest('http://127.0.0.1:3050/', { headers: { host: 'admin.crowndental.hu' } });
  assert.equal(getRewrittenUrl(proxy(request)), request.nextUrl.origin + '/admin/portal');
});
