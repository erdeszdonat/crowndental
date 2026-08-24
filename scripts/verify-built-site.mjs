import process from 'node:process';

const baseUrl = new URL(process.argv[2] || 'http://localhost:3010');
const canonicalOrigin = 'https://www.crowndental.hu';
const concurrency = 16;

function pageUrl(canonicalUrl) {
  const source = new URL(canonicalUrl);
  return new URL(`${source.pathname}${source.search}`, baseUrl).href;
}

function matches(html, pattern) {
  return [...html.matchAll(pattern)];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return (match?.[1] || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

function localeForPath(pathname) {
  const locale = pathname.match(/^\/(en|sk|de)(?:\/|$)/)?.[1];
  return locale || 'hu';
}

async function pooled(values, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index], index);
    }
  }));
  return results;
}

const sitemapResponse = await fetch(new URL('/sitemap.xml', baseUrl));
if (!sitemapResponse.ok) throw new Error(`Sitemap HTTP ${sitemapResponse.status}`);
const sitemapXml = await sitemapResponse.text();
const canonicalUrls = matches(sitemapXml, /<loc>([^<]+)<\/loc>/g).map((match) => match[1].trim());
if (!canonicalUrls.length) throw new Error('A sitemap nem tartalmaz URL-t.');

const pageFailures = [];
const internalLinks = new Set();
const assets = new Set();

await pooled(canonicalUrls, async (canonicalUrl) => {
  const response = await fetch(pageUrl(canonicalUrl), { redirect: 'manual' });
  const pathname = new URL(canonicalUrl).pathname;
  if (response.status !== 200) {
    pageFailures.push({ url: canonicalUrl, issue: `HTTP ${response.status}` });
    return;
  }
  const html = await response.text();
  const titleCount = matches(html, /<title\b[^>]*>/gi).length;
  const descriptionCount = matches(html, /<meta\b[^>]*name=["']description["'][^>]*>/gi).length;
  const h1Count = matches(html, /<h1\b[^>]*>/gi).length;
  const htmlLang = matches(html, /<html\b[^>]*\blang=["']([^"']+)["']/gi)[0]?.[1] || '';
  const canonicalTags = matches(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi);
  const canonicalHref = canonicalTags.length === 1 ? attribute(canonicalTags[0][0], 'href') : '';
  const alternateTags = matches(html, /<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi);

  if (titleCount !== 1) pageFailures.push({ url: canonicalUrl, issue: `${titleCount} title` });
  if (descriptionCount !== 1) pageFailures.push({ url: canonicalUrl, issue: `${descriptionCount} meta description` });
  if (h1Count !== 1) pageFailures.push({ url: canonicalUrl, issue: `${h1Count} H1` });
  if (htmlLang !== localeForPath(pathname)) pageFailures.push({ url: canonicalUrl, issue: `lang=${htmlLang}` });
  if (canonicalTags.length !== 1 || normalizePath(new URL(canonicalHref || canonicalOrigin).pathname) !== normalizePath(pathname)) {
    pageFailures.push({ url: canonicalUrl, issue: `canonical=${canonicalHref || 'missing'}` });
  }
  if (alternateTags.length < 4) pageFailures.push({ url: canonicalUrl, issue: `${alternateTags.length} hreflang` });

  for (const match of matches(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch {
      pageFailures.push({ url: canonicalUrl, issue: 'érvénytelen JSON-LD' });
    }
  }

  for (const match of matches(html, /<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (/^(?:mailto:|tel:|#|javascript:)/i.test(raw)) continue;
    try {
      const target = new URL(raw, canonicalUrl);
      if (target.origin === canonicalOrigin) internalLinks.add(pageUrl(target.href));
    } catch {}
  }

  for (const match of matches(html, /<(?:img|script|source|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (!raw || raw.startsWith('data:')) continue;
    try {
      const target = new URL(raw, pageUrl(canonicalUrl));
      if (target.origin === baseUrl.origin && target.pathname.startsWith('/_next/')) assets.add(target.href);
    } catch {}
  }
});

const linkFailures = [];
await pooled([...internalLinks], async (url) => {
  const response = await fetch(url, { redirect: 'manual' });
  if (response.status !== 200) linkFailures.push({ url, status: response.status, location: response.headers.get('location') });
});

const assetFailures = [];
await pooled([...assets], async (url) => {
  const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  if (response.status !== 200) assetFailures.push({ url, status: response.status });
});

const securityResponse = await fetch(baseUrl, { redirect: 'manual' });
const requiredHeaders = ['content-security-policy', 'referrer-policy', 'x-content-type-options', 'x-frame-options', 'permissions-policy'];
const missingSecurityHeaders = requiredHeaders.filter((header) => !securityResponse.headers.get(header));

const report = {
  baseUrl: baseUrl.href,
  sitemapUrls: canonicalUrls.length,
  internalLinks: internalLinks.size,
  assets: assets.size,
  pageFailures,
  linkFailures,
  assetFailures,
  missingSecurityHeaders,
};

console.log(JSON.stringify(report, null, 2));
if (pageFailures.length || linkFailures.length || assetFailures.length || missingSecurityHeaders.length) {
  process.exitCode = 1;
}
