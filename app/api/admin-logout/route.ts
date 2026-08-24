import { clearAdminSessionCookie } from '@/lib/adminAuth';
import { noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  const response = noStoreJson({ success: true });
  clearAdminSessionCookie(response);
  return response;
}
