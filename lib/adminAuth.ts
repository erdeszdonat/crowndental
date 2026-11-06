import { NextResponse } from 'next/server';
import { safeStringEqual } from './serverSecurity';

// The legacy password can only authorize the one-time owner migration.
// All data access requires a native staff session with verified MFA.
export function adminCredentialsConfigured(): boolean {
  return Boolean(process.env.ADMIN_NAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}
export function validateAdminCredentials(username: unknown, password: unknown): boolean {
  return adminCredentialsConfigured() && safeStringEqual(username, process.env.ADMIN_NAME) && safeStringEqual(password, process.env.ADMIN_PASSWORD);
}
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set('crown_admin_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}
