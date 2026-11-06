import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { sendTransactionalEmail } from './addToAudience';
import { staffServiceClient, staffPublicClient, type StaffContext } from './staffAuth';

export const STAFF_FIELDS = 'user_id,email,name,role,status,is_owner,invited_at,activated_at,updated_at';
export const staffTokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const validStaffToken = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
export const validStaffPassword = (value: unknown): value is string => typeof value === 'string' && value.length >= 12 && value.length <= 128;

export async function auditStaff(actor: string, action: string, target: string | null) {
  const { error } = await staffServiceClient().from('staff_audit_log').insert({ actor, action, target_user_id: target });
  if (error) throw new Error('audit_write_failed');
}

export async function reauthenticateStaff(context: StaffContext, password: unknown) {
  if (typeof password !== 'string' || password.length > 256) return false;
  if (context.legacy || !context.id || !context.email) return false;
  const { data, error } = await staffPublicClient().auth.signInWithPassword({ email: context.email!, password });
  if (error || data.user?.id !== context.id || !data.session) return false;
  // Reauthentication must not leave an extra authenticated session behind.
  const { error: revokeError } = await staffServiceClient().auth.admin.signOut(data.session.access_token, 'local');
  return !revokeError;
}

export async function issueStaffLink(userId: string, kind: 'invite' | 'reset', actor: string) {
  const db = staffServiceClient();
  const now = new Date().toISOString();
  const { data: member, error } = await db.from('staff_members').select('user_id,email,name,role')
    .eq('user_id', userId).single();
  if (error || !member) throw new Error('member_not_found');
  const token = randomBytes(32).toString('base64url');
  const hash = staffTokenHash(token);
  const { error: issueError } = await db.rpc('issue_staff_invitation', { p_user_id: userId, p_token_hash: hash, p_kind: kind, p_actor: actor });
  if (issueError) throw new Error('invitation_write_failed');
  // Fragment tokens are not sent in HTTP URLs, server logs or Referer headers.
  const link = `https://admin.crowndental.hu/crown-dental/hozzaferes#token=${token}`;
  const title = kind === 'reset' ? 'Új jelszó beállítása' : 'Meghívó a Crown Dental adminfelületére';
  const sent = await sendTransactionalEmail({
    from: 'Crown Dental iroda <iroda@crowndental.hu>', to: member.email, subject: title,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#0f172a"><h1>${title}</h1><p>A hozzáféréshez adja meg nevét és saját jelszavát az alábbi oldalon.</p><p><a href="${link}" style="display:inline-block;background:#0284c7;color:white;padding:16px 24px;border-radius:12px;text-decoration:none">Hozzáférés beállítása</a></p><p>A hivatkozás 24 órán át érvényes, és egyszer használható fel. A jelszót az adminisztrátor sem tudja kiolvasni.</p><p>Ha nem számított erre a meghívóra, jelezze az iroda@crowndental.hu címen.</p></div>`,
  }, `staff-access/${randomUUID()}`);
  if (!sent.ok) {
    await db.from('staff_invitations').update({ used_at: now }).eq('token_hash', hash);
    throw new Error('invitation_delivery_failed');
  }
}
