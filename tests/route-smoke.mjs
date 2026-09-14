import assert from 'node:assert/strict';
const base = 'http://localhost:3005';
const slugs = ['allapotfelmeres', 'esztetikai-fogaszat', 'fogfeherites', 'foghuzas', 'fogsor', 'fogszabalyozas', 'fogtechnikai-megoldasok', 'gockutatas', 'gyerekfogaszat', 'gyokerkezeles', 'implantatum', 'koronak-hidak', 'szajsebeszet'];
const paths = ['', '/en', '/de', '/sk'].flatMap(prefix =>
  ['', '/kezelesek', '/idopont', '/blog', ...slugs.map(slug => '/kezelesek/' + slug)].map(route => prefix + route || '/'));
let checked = 0;
for (let i = 0; i < paths.length; i += 4) {
  await Promise.all(paths.slice(i, i + 4).map(async route => {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, route + ': exactly one H1');
    if (/\/kezelesek\//.test(route)) {
      const hero = html.match(/<section class="crown-clinical-hero"[\s\S]*?<\/section>/)?.[0];
      assert.ok(hero?.includes('https://cdn.sanity.io/images/'), route + ': treatment image present in server HTML');
      assert.ok(hero?.includes('crown-price-note'), route + ': treatment price present');
    }
    assert.ok(!html.includes('MISSING_MESSAGE'), route + ': translations');
    checked++;
  }));
}
console.log(JSON.stringify({ checked, treatmentPages: slugs.length * 4, locales: 4, status: 'passed' }));
