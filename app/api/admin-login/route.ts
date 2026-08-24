import { NextResponse } from 'next/server';
import { createAdminSessionToken, setAdminSessionCookie, validateAdminCredentials } from '@/lib/adminAuth';
import { enforceRateLimit, noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export async function POST(req: Request) {
  const originError = rejectUntrustedMutation(req);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(req, 'admin-login', { limit: 8, windowMs: 15 * 60_000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { username, password } = await req.json();
    if (!validateAdminCredentials(username, password)) {
      return noStoreJson({ success: false, error: 'Helytelen felhasználónév vagy jelszó!' }, { status: 401 });
    }

    const token = createAdminSessionToken();
    if (!token) {
      return noStoreJson({ success: false, error: 'Az admin hitelesítés nincs biztonságosan beállítva.' }, { status: 503 });
    }

    const response = noStoreJson({ success: true });
    setAdminSessionCookie(response, token);
    return response;
  } catch {
    return noStoreJson({ success: false, error: 'Szerverhiba történt a belépés során.' }, { status: 500 });
  }
}
