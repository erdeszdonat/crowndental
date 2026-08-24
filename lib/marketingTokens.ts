import { createHash, createHmac } from 'node:crypto';
import { safeStringEqual } from './serverSecurity';

type SignedPayload = { appointmentId: string; exp: number } | { email: string; exp: number };

function getSecret(): string | null {
  return process.env.MARKETING_CONSENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

function createToken(payload: SignedPayload): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken<T extends SignedPayload>(token: unknown): T | null {
  const secret = getSecret();
  if (!secret || typeof token !== 'string' || token.length > 2_000) return null;
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (!safeStringEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T;
    return typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000) ? parsed : null;
  } catch {
    return null;
  }
}

export function createAppointmentConsentToken(appointmentId: string): string | null {
  return createToken({ appointmentId, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 });
}

export function verifyAppointmentConsentToken(token: unknown): { appointmentId: string; exp: number } | null {
  const payload = verifyToken<{ appointmentId: string; exp: number }>(token);
  return payload && typeof payload.appointmentId === 'string' ? payload : null;
}

export function createUnsubscribeToken(email: string): string | null {
  const secret = getSecret();
  const normalizedEmail = email.trim().toLowerCase();
  if (!secret || !normalizedEmail) return null;
  // Opaque and stable: the URL contains no reversible contact data and does
  // not expire, so legally required unsubscribe links remain usable.
  return createHmac('sha256', secret).update(`unsubscribe:${normalizedEmail}`).digest('base64url');
}

export function getUnsubscribeTokenHash(token: unknown): string | null {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,128}$/.test(token)) return null;
  return createHash('sha256').update(token).digest('hex');
}

// Compatibility for links that were sent before unsubscribe tokens became
// opaque. New links never call this encoder and therefore contain no email.
export function verifyLegacyUnsubscribeToken(token: unknown): { email: string; exp: number } | null {
  const payload = verifyToken<{ email: string; exp: number }>(token);
  return payload && typeof payload.email === 'string' ? payload : null;
}
