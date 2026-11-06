import { requireStaffOrigin, staffServiceClient, staffPublicClient, setStaffCookies } from '@/lib/staffAuth';
import { auditStaff, staffTokenHash, validStaffToken, validStaffPassword } from '@/lib/staffAccess';
import { cleanText, enforceRateLimit, noStoreJson } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const limit = await enforceRateLimit(request, 'staff-access-link', { limit: 12, windowMs: 15 * 60_000 });
  if (limit) return limit;
  try {
    const { action, token, name, password } = await request.json();
    if (!validStaffToken(token) || !['preview', 'accept'].includes(action)) return noStoreJson({ error: 'Érvénytelen hivatkozás.' }, { status: 400 });
    const db = staffServiceClient();
    const hash = staffTokenHash(token);
    const { data: invite, error } = await db.from('staff_invitations').select('id,user_id,kind')
      .eq('token_hash', hash).is('used_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (error) throw new Error('invitation_read_failed');
    if (!invite) return noStoreJson({ error: 'A hivatkozás lejárt vagy már felhasználták. Kérjen új meghívót az adminisztrátortól.' }, { status: 410 });
    const { data: member, error: memberError } = await db.from('staff_members').select('user_id,email,name,status,auth_valid_after')
      .eq('user_id', invite.user_id).eq('status', 'invited').maybeSingle();
    if (memberError) throw new Error('member_read_failed');
    if (!member) return noStoreJson({ error: 'Ez a hozzáférés nem aktiválható.' }, { status: 410 });
    if (action === 'preview') return noStoreJson({ success: true, email: member.email, name: member.name, kind: invite.kind });
    const safeName = cleanText(name, 120);
    if (safeName.length < 2 || !validStaffPassword(password)) return noStoreJson({ error: 'Adja meg a nevét és egy legalább 12, legfeljebb 128 karakteres jelszót.' }, { status: 400 });
    const now = new Date().toISOString();
    const { data: claimed, error: claimError } = await db.from('staff_invitations').update({ used_at: now })
      .eq('id', invite.id).is('used_at', null).gt('expires_at', now).select('id').maybeSingle();
    if (claimError) throw new Error('invitation_claim_failed');
    if (!claimed) return noStoreJson({ error: 'A hivatkozást már felhasználták.' }, { status: 410 });
    const { error: passwordError } = await db.auth.admin.updateUserById(member.user_id, { password });
    if (passwordError) throw new Error('password_update_failed');
    const { data: activated, error: activateError } = await db.from('staff_members')
      .update({ name: safeName, status: 'active', activated_at: now, auth_valid_after: now, updated_at: now })
      .eq('user_id', member.user_id).eq('status', 'invited').eq('auth_valid_after', member.auth_valid_after)
      .select('user_id').maybeSingle();
    if (activateError || !activated) throw new Error('activation_failed');
    await auditStaff(member.user_id, invite.kind === 'reset' ? 'password_reset_completed' : 'invitation_accepted', member.user_id);
    const { data: login, error: loginError } = await staffPublicClient().auth.signInWithPassword({ email: member.email, password });
    if (loginError || !login.session) return noStoreJson({ success: true, loginRequired: true });
    const response = noStoreJson({ success: true });
    setStaffCookies(response, login.session);
    return response;
  } catch {
    return noStoreJson({ error: 'A beállítás nem fejezhető be. Ha a link már nem használható, kérjen új meghívót.' }, { status: 503 });
  }
}
