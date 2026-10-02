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
vm.runInNewContext(source, { module: proxyModule, exports: proxyModule.exports, require });
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
