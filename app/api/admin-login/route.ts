import { clearAdminSessionCookie, validateAdminCredentials } from '@/lib/adminAuth';
import { findOwner, setOwnerSetupCookie, clearOwnerSetupCookie, ownerSetupIdentity } from '@/lib/ownerSetup';
import { clearStaffCookies, requireStaffOrigin, staffContextForToken, staffPublicClient, setStaffCookies, publicStaffIdentity } from '@/lib/staffAuth';
import { enforceRateLimit, noStoreJson, normalizeEmail, isValidEmail } from '@/lib/serverSecurity';

export async function POST(req: Request) {
  const originError = requireStaffOrigin(req);
  if (originError) return originError;
  const rateLimitError = await enforceRateLimit(req, 'admin-login', { limit: 8, windowMs: 15 * 60_000 });
  if (rateLimitError) return rateLimitError;

  try {
    const { username, password } = await req.json();
    const owner = await findOwner();
    if ((!owner || owner.status === 'invited') && validateAdminCredentials(username, password)) {
      const response = noStoreJson({ success: true, user: ownerSetupIdentity() });
      clearStaffCookies(response);
      clearAdminSessionCookie(response);
      setOwnerSetupCookie(response);
      return response;
    }
    const email = username === process.env.ADMIN_NAME && owner?.status === 'active' ? owner.email : normalizeEmail(username);
    if (isValidEmail(email) && typeof password === 'string' && password.length <= 128) {
      const { data, error } = await staffPublicClient().auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        const context = await staffContextForToken(data.session.access_token);
        if (context) {
          const response = noStoreJson({ success: true, user: publicStaffIdentity(context) });
          setStaffCookies(response, data.session);
          clearOwnerSetupCookie(response);
          return response;
        }
      }
    }
    return noStoreJson({ error: 'Helytelen belépési adatok vagy nem aktív hozzáférés.' }, { status: 401 });
  } catch {
    return noStoreJson({ error: 'A belépési szolgáltatás átmenetileg nem érhető el.' }, { status: 503 });
  }
}
