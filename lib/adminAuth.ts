import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { noStoreJson, safeStringEqual } from './serverSecurity';

const COOKIE_NAME = 'crown_admin_session';
const SESSION_SECONDS = 8 * 60 * 60;

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function readCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie') || '';
  for (const part of cookies.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(valueParts.join('='));
      } catch {
        // A malformed percent-encoded cookie is unauthenticated input, not a
        // server error. Treat it exactly like a missing session cookie.
        return null;
      }
    }
  }
  return null;
}

export function adminCredentialsConfigured(): boolean {
  return Boolean(process.env.ADMIN_NAME && process.env.ADMIN_PASSWORD && getSecret());
}

export function validateAdminCredentials(username: unknown, password: unknown): boolean {
  return adminCredentialsConfigured()
    && safeStringEqual(username, process.env.ADMIN_NAME)
    && safeStringEqual(password, process.env.ADMIN_PASSWORD);
}

export function createAdminSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function hasValidAdminSession(request: Request): boolean {
  const secret = getSecret();
  const token = readCookie(request, COOKIE_NAME);
  if (!secret || !token) return false;
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length || !safeStringEqual(signature, sign(payload, secret))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function requireAdminSession(request: Request): NextResponse | null {
  if (!adminCredentialsConfigured()) {
    return noStoreJson({ error: 'Az admin hitelesítés nincs biztonságosan beállítva.' }, { status: 503 });
  }
  return hasValidAdminSession(request)
    ? null
    : noStoreJson({ error: 'A munkamenet lejárt. Jelentkezzen be újra.' }, { status: 401 });
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
