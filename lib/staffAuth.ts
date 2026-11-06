import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hasValidAdminSession, clearAdminSessionCookie } from './adminAuth';
import { noStoreJson } from './serverSecurity';

export type StaffRole = 'admin' | 'assistant';
export type StaffIdentity = { id: string | null; name: string; email: string | null; role: StaffRole; legacy: boolean };
export type StaffContext = StaffIdentity & { db: SupabaseClient; accessToken?: string };
const ACCESS_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-crown_staff_access' : 'crown_staff_access';
const REFRESH_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-crown_staff_refresh' : 'crown_staff_refresh';
const IDENTITY_FIELDS = 'user_id,email,name,role,status';
const authOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

export function staffServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('staff_configuration_unavailable');
  return createClient(url, key, { auth: authOptions });
}

export function staffPublicClient(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('staff_configuration_unavailable');
  return createClient(url, key, {
    auth: authOptions,
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  });
}

export function readStaffCookie(request: Request, name: 'access' | 'refresh') {
  const cookieName = name === 'access' ? ACCESS_COOKIE : REFRESH_COOKIE;
  const value = (request.headers.get('cookie') || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  try { return value ? decodeURIComponent(value) : null; } catch { return null; }
}

export function requireStaffOrigin(request: Request): NextResponse | null {
  try {
    const origin = new URL(request.headers.get('origin') || '');
    const host = request.headers.get('host') || new URL(request.url).host;
    if (origin.host === host && request.headers.get('sec-fetch-site') !== 'cross-site'
      && (origin.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(origin.hostname))) return null;
  } catch {}
  return noStoreJson({ error: 'Érvénytelen kérés.' }, { status: 403 });
}

export async function staffContextForToken(accessToken: string): Promise<StaffContext | null> {
  const auth = staffPublicClient();
  const { data: { user }, error } = await auth.auth.getUser(accessToken);
  if (error || !user) return null;
  const db = staffPublicClient(accessToken);
  // The SELECT is evaluated by RLS, including current role, account state,
  // auth.sessions revocation, password resets and absolute session lifetime.
  const { data: member, error: memberError } = await db.from('staff_members')
    .select(IDENTITY_FIELDS).eq('user_id', user.id).maybeSingle();
  if (memberError || !member || member.status !== 'active' || user.email?.toLowerCase() !== member.email
    || !['admin', 'assistant'].includes(member.role)) return null;
  return { id: user.id, email: member.email, name: member.name, role: member.role, legacy: false, db, accessToken };
}

export async function authorizeStaff(request: Request, minimum: StaffRole = 'admin') {
  try {
    let context: StaffContext | null = null;
    if (hasValidAdminSession(request)) {
      context = { id: null, name: process.env.ADMIN_NAME || 'erdeszdonat', email: null, role: 'admin', legacy: true, db: staffServiceClient() };
    } else {
      const token = readStaffCookie(request, 'access');
      if (token) context = await staffContextForToken(token);
    }
    if (!context) return { context: null, error: noStoreJson({ error: 'A munkamenet lejárt. Jelentkezzen be újra.' }, { status: 401 }) };
    if (minimum === 'admin' && context.role !== 'admin') {
      return { context: null, error: noStoreJson({ error: 'Ehhez adminisztrátori jogosultság szükséges.' }, { status: 403 }) };
    }
    return { context, error: null };
  } catch {
    return { context: null, error: noStoreJson({ error: 'A belépési szolgáltatás átmenetileg nem érhető el.' }, { status: 503 }) };
  }
}

export function publicStaffIdentity(context: StaffContext): StaffIdentity {
  return { id: context.id, name: context.name, email: context.email, role: context.role, legacy: context.legacy };
}

export function setStaffCookies(response: NextResponse, session: Session) {
  clearAdminSessionCookie(response);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
  response.cookies.set(ACCESS_COOKIE, session.access_token, { ...options, maxAge: Math.min(session.expires_in, 3600) });
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, { ...options, maxAge: 8 * 60 * 60 });
}

export function clearStaffCookies(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set(name, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  }
}
