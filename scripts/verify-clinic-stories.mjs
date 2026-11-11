import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const stories = JSON.parse(readFileSync(new URL('../lib/clinicStoryContent.json', import.meta.url)));
const opening = JSON.parse(readFileSync(new URL('../lib/openingContent.json', import.meta.url)));
const origin = process.argv[2] || 'http://localhost:3016';
const canonicalOrigin = 'https://www.crowndental.hu';
const clinicImage = 'https://cdn.sanity.io/images/h68mmabs/production/7e67cedf834aaf0c6093e80d54b2ae4a23d54492-1536x1024.webp';
const storyImage = canonicalOrigin + '/images/blog/primas-sziget-epitkezes-fogtechnika.webp';
async function get(path) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  return response.text();
}
const sitemap = await get('/sitemap.xml');
let pages = 0;
for (const [kind, content, image] of [['opening', opening, clinicImage], ['story', stories, storyImage]]) {
  for (const [locale, copy] of Object.entries(content)) {
    const prefix = locale === 'hu' ? '' : '/' + locale;
    const path = prefix + '/blog/' + copy.slug;
    const html = await get(path);
    assert.ok(html.includes(copy.title), path + ': headline');
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path + ': H1');
    assert.ok(html.includes('rel="canonical" href="' + canonicalOrigin + path + '"'), path + ': canonical');
    assert.ok(sitemap.includes(canonicalOrigin + path), path + ': sitemap');
    for (const [other, translation] of Object.entries(content)) {
      const target = canonicalOrigin + (other === 'hu' ? '' : '/' + other) + '/blog/' + translation.slug;
      assert.ok(html.includes('href="' + target + '"'), path + ': alternate ' + other);
    }
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    const article = schemas.find(s => s['@type'] === 'BlogPosting');
    assert.equal(article?.image, image, path + ': article image');
    assert.ok(html.includes('property="og:image" content="' + image + '"'), path + ': sharing image');
    assert.ok(html.includes('tel:+36706042500') && html.includes('tel:+36305892468'), path + ': phone links');
    for (const [heading] of copy.sections) assert.ok(html.includes(heading), path + ': section ' + heading);
    if (kind === 'story') {
      assert.ok(html.includes(copy.imageCaption), path + ': honest editorial caption');
      assert.ok(html.includes('Erdész Zsolt'), path + ': lab leadership');
      assert.ok(html.includes('/_next/image?'), path + ': optimized local image');
      assert.ok(!/\b(?:30 colleagues|30 Kollegen|30 kolegov|harminc kolléga|ten dentists|tíz orvos)\b/.test(html), path + ': no invented headcount');
    }
    assert.ok(!html.includes('MISSING_MESSAGE'), path + ': translations');
    pages++;
  }
}
const imageResponse = await fetch(origin + '/images/blog/primas-sziget-epitkezes-fogtechnika.webp');
assert.equal(imageResponse.status, 200);
assert.ok(imageResponse.headers.get('content-type')?.includes('image/webp'));
console.log(JSON.stringify({status:'passed',pages,locales:4,checks:'canonical, hreflang, sitemap, article and sharing images, article sections, editorial caption, phones'}));
