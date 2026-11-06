import { clearAdminSessionCookie } from '@/lib/adminAuth';
import { clearStaffCookies, readStaffCookie, requireStaffOrigin, staffServiceClient, staffPublicClient } from '@/lib/staffAuth';
import { noStoreJson } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  let revoked = true;
  const refreshToken = readStaffCookie(request, 'refresh');
  const accessToken = readStaffCookie(request, 'access');
  if (accessToken || refreshToken) {
    try {
      let token = accessToken;
      if (!token && refreshToken) {
        const { data } = await staffPublicClient().auth.refreshSession({ refresh_token: refreshToken });
        token = data.session?.access_token || null;
      }
      if (token) {
        const { error } = await staffServiceClient().auth.admin.signOut(token, 'local');
        if (error) revoked = false;
      }
    } catch { revoked = false; }
  }
  const response = noStoreJson(revoked ? { success: true } : { error: 'A böngészőből kijelentkezett, de a szerveres munkamenet lezárását nem sikerült visszaigazolni.' }, { status: revoked ? 200 : 503 });
  clearAdminSessionCookie(response);
  clearStaffCookies(response);
  return response;
}
