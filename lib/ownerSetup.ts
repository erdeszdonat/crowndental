import { createHmac, randomBytes } from 'node:crypto';
import type { NextResponse } from 'next/server';
import { safeStringEqual } from './serverSecurity';
import { staffServiceClient, type StaffIdentity } from './staffAuth';

// This cookie authorizes only migration of the original account. It never
// authorizes patient reads, colleague management, or any other admin API.
const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-crown_owner_setup' : 'crown_owner_setup';
export const OWNER_EMAIL = 'erdeszdonatcd@gmail.com';
export const ownerSetupIdentity = (): StaffIdentity => ({ id: null, name: process.env.ADMIN_NAME || 'erdeszdonat', email: OWNER_EMAIL, role: 'admin', legacy: false, ownerSetup: true });
export async function findOwner() {
  const { data, error } = await staffServiceClient().from('staff_members').select('user_id,email,status').eq('is_owner', true).maybeSingle();
  if (error) throw new Error('owner_lookup_failed');
  return data;
}
export function setOwnerSetupCookie(response: NextResponse) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('owner_setup_unavailable');
  const body = Buffer.from(JSON.stringify({ purpose: 'owner_setup', exp: Math.floor(Date.now() / 1000) + 600, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  response.cookies.set(COOKIE, `${body}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 600 });
}
export function clearOwnerSetupCookie(response: NextResponse) {
  response.cookies.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}
export async function hasOwnerSetup(request: Request) {
  const token = (request.headers.get('cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  const [body, signature, ...rest] = token.split('.');
  if (!body || !signature || rest.length || !safeStringEqual(signature, createHmac('sha256', secret).update(body).digest('base64url'))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.purpose !== 'owner_setup' || typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) return false;
  } catch { return false; }
  const owner = await findOwner();
  return !owner || owner.status === 'invited';
}
