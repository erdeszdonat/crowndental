import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const SUPPORTED_LOCALES = ['hu', 'en', 'sk', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type RateLimitEntry = { count: number; resetAt: number };
type IdempotencyEntry = { expiresAt: number; response?: unknown };

const globalSecurityState = globalThis as typeof globalThis & {
  __crownRateLimits?: Map<string, RateLimitEntry>;
  __crownIdempotency?: Map<string, IdempotencyEntry>;
};

const rateLimits = globalSecurityState.__crownRateLimits ?? new Map<string, RateLimitEntry>();
const idempotencyEntries = globalSecurityState.__crownIdempotency ?? new Map<string, IdempotencyEntry>();
globalSecurityState.__crownRateLimits = rateLimits;
globalSecurityState.__crownIdempotency = idempotencyEntries;

export function normalizeLocale(value: unknown): SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale) ? (value as SupportedLocale) : 'hu';
}

export function cleanText(value: unknown, maxLength = 500): string {
  return typeof value === 'string'
    ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength)
    : '';
}

export function normalizeEmail(value: unknown): string {
  return cleanText(value, 254).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^[+()\d\s./-]+$/.test(value) && digits.length >= 7 && digits.length <= 16;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export function hashForLog(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function trimMap<T>(map: Map<string, T>, maxSize: number) {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    if (typeof oldestKey !== 'string') break;
    map.delete(oldestKey);
  }
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  options: { limit: number; windowMs: number },
): Promise<NextResponse | null> {
  const now = Date.now();
  const key = `${scope}:${hashForLog(getClientIp(request))}`;
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + options.windowMs });
  } else {
    current.count += 1;
    if (current.count > options.limit) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      return NextResponse.json(
        { error: 'Túl sok kérés érkezett. Kérjük, próbálja újra néhány perc múlva.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } },
      );
    }
  }

  if (rateLimits.size > 5_000) {
    for (const [entryKey, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(entryKey);
    }
    trimMap(rateLimits, 5_000);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    try {
      const { data, error } = await createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
        .rpc('consume_api_rate_limit', {
          p_scope: scope,
          p_key_hash: hashForLog(getClientIp(request)),
          p_limit: options.limit,
          p_window_seconds: Math.max(1, Math.ceil(options.windowMs / 1000)),
        })
        .single();
      if (error) {
        console.error('Tartós rate-limit hiba:', error.message);
        return noStoreJson({ error: 'A szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
      }
      const durableResult = data as { allowed?: boolean; retry_after_seconds?: number } | null;
      if (durableResult?.allowed === false) {
        return noStoreJson(
          { error: 'Túl sok kérés érkezett. Kérjük, próbálja újra néhány perc múlva.' },
          { status: 429, headers: { 'Retry-After': String(Math.max(1, Number(durableResult.retry_after_seconds) || 1)) } },
        );
      }
    } catch (error) {
      console.error('Tartós rate-limit hiba:', error);
      return noStoreJson({ error: 'A szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
    }
  }

  return null;
}

export function getIdempotencyKey(request: Request, bodyValue?: unknown): string {
  const raw = cleanText(request.headers.get('idempotency-key') || bodyValue, 100);
  return /^[A-Za-z0-9._:-]{8,100}$/.test(raw) ? raw : randomUUID();
}

export function claimIdempotency(scope: string, key: string, ttlMs = 15 * 60_000): boolean {
  const now = Date.now();
  const storageKey = `${scope}:${key}`;
  const existing = idempotencyEntries.get(storageKey);
  if (existing && existing.expiresAt > now) return false;
  idempotencyEntries.set(storageKey, { expiresAt: now + ttlMs });

  if (idempotencyEntries.size > 5_000) {
    for (const [entryKey, entry] of idempotencyEntries) {
      if (entry.expiresAt <= now) idempotencyEntries.delete(entryKey);
    }
    trimMap(idempotencyEntries, 5_000);
  }
  return true;
}

export function getIdempotencyResponse<T>(scope: string, key: string): T | null {
  const entry = idempotencyEntries.get(`${scope}:${key}`);
  if (!entry || entry.expiresAt <= Date.now() || entry.response === undefined) return null;
  return entry.response as T;
}

export function completeIdempotency(scope: string, key: string, response: unknown, ttlMs = 30 * 60_000): void {
  idempotencyEntries.set(`${scope}:${key}`, { expiresAt: Date.now() + ttlMs, response });
  trimMap(idempotencyEntries, 5_000);
}

export function releaseIdempotency(scope: string, key: string): void {
  idempotencyEntries.delete(`${scope}:${key}`);
}

export function safeStringEqual(left: unknown, right: unknown): boolean {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isTrustedMutation(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site';

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return Boolean(requestHost) && originUrl.host === requestHost;
  } catch {
    return false;
  }
}

export function rejectUntrustedMutation(request: Request): NextResponse | null {
  return isTrustedMutation(request)
    ? null
    : NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
}

export function noStoreJson(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
