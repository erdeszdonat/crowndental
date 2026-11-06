import { createAdminSessionToken, setAdminSessionCookie, validateAdminCredentials } from '@/lib/adminAuth';
import { clearStaffCookies, requireStaffOrigin, staffContextForToken, staffPublicClient, setStaffCookies, publicStaffIdentity } from '@/lib/staffAuth';
import { enforceRateLimit, noStoreJson, normalizeEmail, isValidEmail } from '@/lib/serverSecurity';

export async function POST(req: Request) {
  const originError = requireStaffOrigin(req);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(req, 'admin-login', { limit: 8, windowMs: 15 * 60_000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { username, password } = await req.json();
    if (validateAdminCredentials(username, password)) {
      const token = createAdminSessionToken();
      if (!token) return noStoreJson({ error: 'A belépés átmenetileg nem érhető el.' }, { status: 503 });
      const response = noStoreJson({ success: true });
      clearStaffCookies(response);
      setAdminSessionCookie(response, token);
      return response;
    }
    const email = normalizeEmail(username);
    if (isValidEmail(email) && typeof password === 'string' && password.length <= 128) {
      const { data, error } = await staffPublicClient().auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        const context = await staffContextForToken(data.session.access_token);
        if (context) {
          const response = noStoreJson({ success: true, user: publicStaffIdentity(context) });
          setStaffCookies(response, data.session);
          return response;
        }
      }
    }
    return noStoreJson({ error: 'Helytelen belépési adatok vagy nem aktív hozzáférés.' }, { status: 401 });
  } catch {
    return noStoreJson({ error: 'A belépési szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
  }
}
