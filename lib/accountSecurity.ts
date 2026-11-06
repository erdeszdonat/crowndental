import { randomBytes } from 'node:crypto';
import { readStaffCookie, staffPublicClient, staffServiceClient, type StaffContext } from './staffAuth';
import { staffTokenHash } from './staffAccess';

export async function sessionAuth(request: Request, context: StaffContext) {
  const refresh = readStaffCookie(request, 'refresh');
  if (!context.accessToken || !refresh) throw new Error('session_missing');
  const client = staffPublicClient();
  const { data, error } = await client.auth.setSession({ access_token: context.accessToken, refresh_token: refresh });
  if (error || data.user?.id !== context.id || !data.session) throw new Error('session_invalid');
  return { client, session: data.session };
}

export async function generateRecoveryCodes(userId: string) {
  const codes = Array.from({ length: 10 }, () => randomBytes(16).toString('hex').match(/.{4}/g)!.join('-'));
  const { error } = await staffServiceClient().rpc('replace_staff_recovery_codes', {
    p_user_id: userId, p_hashes: codes.map(code => staffTokenHash(code.replaceAll('-', ''))),
  });
  if (error) throw new Error('recovery_write_failed');
  return codes;
}

export function recoveryHash(code: unknown) {
  if (typeof code !== 'string') return null;
  const normalized = code.toLowerCase().replaceAll('-', '').replaceAll(' ', '');
  return /^[a-f0-9]{32}$/.test(normalized) ? staffTokenHash(normalized) : null;
}
