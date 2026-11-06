import { authorizeStaff, publicStaffIdentity, readStaffCookie, requireStaffOrigin, staffPublicClient, staffContextForToken, setStaffCookies, clearStaffCookies } from '@/lib/staffAuth';
import { noStoreJson } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const current = await authorizeStaff(request, 'assistant');
  let refreshSoon = false;
  if (current.context?.accessToken) {
    try {
      const payload = JSON.parse(Buffer.from(current.context.accessToken.split('.')[1], 'base64url').toString('utf8'));
      refreshSoon = payload.exp < Math.floor(Date.now() / 1000) + 10 * 60;
    } catch { refreshSoon = true; }
  }
  if (current.context && !refreshSoon) return noStoreJson({ success: true, user: publicStaffIdentity(current.context) });
  try {
    const refreshToken = readStaffCookie(request, 'refresh');
    if (refreshToken) {
      const { data, error } = await staffPublicClient().auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        const context = await staffContextForToken(data.session.access_token);
        if (context) {
          const response = noStoreJson({ success: true, user: publicStaffIdentity(context) });
          setStaffCookies(response, data.session);
          return response;
        }
      }
    }
  } catch {}
  if (current.context) return noStoreJson({ success: true, user: publicStaffIdentity(current.context) });
  const response = noStoreJson({ error: 'Jelentkezzen be újra.' }, { status: 401 });
  clearStaffCookies(response);
  return response;
}
