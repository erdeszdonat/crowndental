// Run against `next start` after a production build. No forms are submitted.
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3005';
let checks = 0;
const assertStatus = async (pathname, expected, init = {}) => {
  const response = await fetch(base + pathname, { redirect: 'manual', ...init });
  assert.equal(response.status, expected, pathname);
  checks++;
  return response;
};

for (const locale of ['hu', 'en', 'sk', 'de']) {
  const prefix = locale === 'hu' ? '' : '/' + locale;
  for (const route of ['', '/esztergom', '/budapest', '/kezelesek', '/blog', '/idopont']) {
    const pathname = prefix + route || '/';
    const response = await assertStatus(pathname, 200);
    const html = await response.text();
    assert.ok(html.includes('<html lang="' + locale + '"'), pathname + ': language');
    assert.ok(!html.includes('MISSING_MESSAGE'), pathname + ': translation');
    assert.ok(!response.headers.get('set-cookie')?.includes('NEXT_LOCALE'), pathname + ': no locale cookie');
    assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"), pathname + ': CSP');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  for (const route of ['/blog', '/idopont', '/kezelesek/implantatum']) {
    const pathname = prefix + route;
    const headers = { RSC: '1', 'Next-Router-Prefetch': '1' };
    let response = await fetch(base + pathname + '?_rsc=route-smoke', { redirect: 'manual', headers });
    if (response.status === 307) {
      // Next 16 normalizes its RSC cache key. Permit exactly one redirect to
      // the same route and keep the request headers; reject arbitrary redirects.
      const destination = new URL(response.headers.get('location'), base);
      assert.equal(destination.origin, new URL(base).origin, pathname + ': RSC origin');
      assert.equal(destination.pathname, pathname, pathname + ': RSC route');
      assert.ok(destination.searchParams.get('_rsc'), pathname + ': canonical RSC key');
      assert.equal([...destination.searchParams.keys()].length, 1, pathname + ': RSC query');
      response = await fetch(destination, { redirect: 'manual', headers });
    }
    assert.equal(response.status, 200, pathname + ': canonical RSC response');
    checks++;
    assert.ok(response.headers.get('content-type')?.includes('text/x-component'), pathname + ': RSC response');
    assert.ok(!(await response.text()).startsWith('<!DOCTYPE'), pathname + ': no HTML in RSC response');
  }
}
for (const [locale, title] of [['hu', 'Az oldal nem található'], ['en', 'Page not found'], ['sk', 'Stránka sa nenašla'], ['de', 'Seite nicht gefunden']]) {
  const pathname = (locale === 'hu' ? '' : '/' + locale) + '/blog/not-a-real-post-crown-test';
  const response = await assertStatus(pathname, 404);
  const html = await response.text();
  // Next may return its __next_error__ shell for a streamed 404; that
  // shell omits lang while the localized error content is in the RSC payload.
  if (!html.includes('id="__next_error__"')) {
    assert.ok(html.includes('<html lang="' + locale + '"'), pathname + ': 404 language');
  }
  assert.ok(html.includes(title), pathname + ': localized 404 title');
  assert.match(html, /name="robots"[^>]*content="[^"]*noindex/, pathname + ': noindex');
}
for (const pathname of ['/not-a-real-page-crown-test', '/cpg/000000/Unknown', '/en/not-a-real-page-crown-test', '/de/blog/not-a-real-post-crown-test', '/sk/kezelesek/not-a-real-treatment-crown-test']) {
  await assertStatus(pathname, 404);
}
for (const [source, target] of [
  ['/hu', '/'],
  ['/hu/kezelesek', '/kezelesek'],
  ['/idopontfoglalas', '/idopont'],
  ['/de/kezelesek/Gyokerkezeles', '/de/kezelesek/gyokerkezeles'],
  ['/de/kezelesek/Gockutatas', '/de/kezelesek/gockutatas'],
  ['/sk/kezelesek/t%C3%B6mesek', '/sk/kezelesek/esztetikai-fogaszat'],
]) {
  const response = await assertStatus(source + '?utm_source=route-smoke', 308);
  const destination = new URL(response.headers.get('location'), base);
  assert.equal(destination.pathname, target, source + ': canonical redirect');
  assert.equal(destination.searchParams.get('utm_source'), 'route-smoke');
  await assertStatus(target, 200);
}
for (const pathname of ['/hidfutas', '/hidfutas/szabalyzat', '/logo.webp', '/sitemap.xml']) await assertStatus(pathname, 200);
await assertStatus('/api/book-appointment', 405);
console.log(JSON.stringify({ checks, locales: 4, status: 'passed' }));
