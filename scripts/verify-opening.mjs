import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const content = JSON.parse(readFileSync(new URL('../lib/openingContent.json', import.meta.url)));
const origin = process.argv[2] || 'http://localhost:3016';
const canonicalOrigin = 'https://www.crowndental.hu';
const checked = [];
async function get(path) {
  const res = await fetch(origin + path);
  assert.equal(res.status, 200, path);
  const html = await res.text();
  assert.ok(!html.includes('MISSING_MESSAGE'), path);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path + ': H1');
  checked.push(path);
  return html;
}
const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
for (const [locale, copy] of Object.entries(content)) {
  const prefix = locale === 'hu' ? '' : '/' + locale;
  const path = prefix + '/blog/' + copy.slug;
  const html = await get(path);
  assert.ok(html.includes(copy.title), path + ': article');
  assert.ok(html.includes('rel="canonical" href="' + canonicalOrigin + path + '"'), path + ': canonical');
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), path + ': indexable');
  for (const [other, translation] of Object.entries(content)) {
    const target = canonicalOrigin + (other === 'hu' ? '' : '/' + other) + '/blog/' + translation.slug;
    assert.ok(html.includes('href="' + target + '"'), path + ': alternate ' + other);
  }
  assert.ok(sitemap.includes(canonicalOrigin + path), path + ': sitemap');
  assert.ok(html.includes('"@type":"BlogPosting"'), path + ': article schema');
  assert.ok(html.includes('tel:+36706042500') && html.includes('tel:+36305892468'), path + ': both phone links');
  for (const [heading] of copy.sections) assert.ok(html.includes(heading), path + ': section ' + heading);
  const index = await get(prefix + '/blog');
  assert.ok(index.includes(copy.slug), path + ': blog index');
  for (const page of ['', '/primas-sziget', '/kapcsolat']) {
    const result = await get(prefix + page || '/');
    assert.ok(result.includes(copy.bannerTitle), page + ': opening announcement');
    assert.ok(result.includes('tel:+36706042500'), page + ': clinic phone');
    if (page === '/primas-sziget') assert.ok(result.includes('"telephone":"+36706042500"'), page + ': local schema');
  }
  for (const [target] of copy.links) {
    const res = await fetch(origin + prefix + '/' + target);
    assert.equal(res.status, 200, target + ': internal link');
  }
}
console.log(JSON.stringify({status:'passed', pages: checked.length, locales:4, checks:'article content, canonical, alternates, sitemap, indexing, BlogPosting, clinic schema, phone links, announcements, internal link destinations'}, null, 2));
