import { createClient } from '@supabase/supabase-js';
import { unsubscribeMarketingSubscriber } from '@/lib/marketingSubscribers';
import { getUnsubscribeTokenHash, verifyLegacyUnsubscribeToken } from '@/lib/marketingTokens';

const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function html(content: string, status = 200) {
  return new Response(`<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex,nofollow"><title>Crown Dental leiratkozás</title></head><body style="margin:0;background:#f8fafc;font-family:system-ui;color:#0f172a"><main style="max-width:620px;margin:12vh auto;padding:32px;background:white;border:1px solid #e2e8f0;border-radius:20px;text-align:center">${content}<p><a href="https://www.crowndental.hu" style="color:#0284c7;font-weight:700">Vissza a Crown Dental oldalára</a></p></main></body></html>`, {
    status,
    headers: PAGE_HEADERS,
  });
}

async function emailForToken(token: string): Promise<string | null> {
  const tokenHash = getUnsubscribeTokenHash(token);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (tokenHash && supabaseUrl && supabaseKey) {
    const { data } = await createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      .from('marketing_subscribers')
      .select('email')
      .eq('unsubscribe_token_hash', tokenHash)
      .maybeSingle();
    if (typeof data?.email === 'string') return data.email;
  }

  // Previously issued signed links remain functional during the migration.
  return verifyLegacyUnsubscribeToken(token)?.email || null;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const email = token ? await emailForToken(token) : null;
  if (!email) {
    return html('<h1>A hivatkozás érvénytelen vagy lejárt</h1><p>Kérjük, írjon az info@crowndental.hu címre.</p>', 400);
  }

  // GET is deliberately read-only: mail security scanners and link preview
  // bots often open links automatically. Only the explicit POST below mutates.
  return html(`<h1>Leiratkozás megerősítése</h1><p>A megerősítés után nem küldünk további marketing üzeneteket erre a címre.</p><form method="post"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit" style="border:0;border-radius:12px;background:#dc2626;color:white;padding:14px 22px;font-weight:800;cursor:pointer">Leiratkozom</button></form>`);
}

export async function POST(request: Request) {
  const urlToken = new URL(request.url).searchParams.get('token');
  let bodyToken = '';
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      bodyToken = typeof body?.token === 'string' ? body.token : '';
    } else {
      const formData = await request.formData();
      bodyToken = typeof formData.get('token') === 'string' ? String(formData.get('token')) : '';
    }
  } catch {
    // RFC 8058 clients can POST an unrelated one-click marker while the token
    // remains in the URL, so an unreadable body does not invalidate urlToken.
  }

  const token = urlToken || bodyToken;
  const email = token ? await emailForToken(token) : null;
  if (!email) {
    return html('<h1>A leiratkozás nem sikerült</h1><p>A hivatkozás érvénytelen. Kérjük, írjon az info@crowndental.hu címre.</p>', 400);
  }

  const result = await unsubscribeMarketingSubscriber(email);
  return result.ok && result.audienceSynced !== false
    ? html('<h1>Leiratkozás rögzítve</h1><p>A jövőben nem küldünk marketing üzeneteket erre az e-mail címre.</p>')
    : result.ok
      ? html('<h1>A leiratkozási kérését rögzítettük</h1><p>A külső levelezőrendszer visszaigazolása átmenetileg nem érkezett meg. Kérjük, próbálja meg újra, vagy írjon az info@crowndental.hu címre, hogy kézzel is ellenőrizhessük.</p>', 503)
      : html('<h1>A leiratkozás nem sikerült</h1><p>Kérjük, próbálja újra később, vagy írjon az info@crowndental.hu címre.</p>', 503);
}
