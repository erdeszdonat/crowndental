import { SITE_URL } from '@/lib/seo';

export async function submitToIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    return { submitted: false, reason: 'missing-key' as const };
  }

  const siteOrigin = new URL(SITE_URL);
  const urlList = [...new Set(urls)]
    .map((url) => new URL(url, SITE_URL))
    .filter((url) => url.origin === siteOrigin.origin)
    .map((url) => url.toString())
    .slice(0, 10_000);

  if (!urlList.length) return { submitted: false, reason: 'empty-list' as const };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: siteOrigin.host,
      key,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList,
    }),
  });

  if (!response.ok && response.status !== 202) {
    throw new Error(`IndexNow submission failed with status ${response.status}`);
  }

  return { submitted: true, status: response.status };
}
