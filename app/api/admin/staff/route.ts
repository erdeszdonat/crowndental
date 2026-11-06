import { randomBytes } from 'node:crypto';
import { authorizeStaff, requireStaffOrigin, staffServiceClient } from '@/lib/staffAuth';
import { auditStaff, issueStaffLink, reauthenticateStaff, STAFF_FIELDS } from '@/lib/staffAccess';
import { enforceRateLimit, noStoreJson, normalizeEmail, isValidEmail } from '@/lib/serverSecurity';
import { OWNER_EMAIL } from '@/lib/ownerSetup';

export async function GET(request: Request) {
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  try {
    const db = staffServiceClient();
    const [members, audit] = await Promise.all([
      db.from('staff_members').select(STAFF_FIELDS).order('invited_at', { ascending: false }),
      db.from('staff_audit_log').select('id,actor,action,target_user_id,target_email,created_at').order('created_at', { ascending: false }).limit(30),
    ]);
    if (members.error || audit.error) throw new Error('staff_read_failed');
    return noStoreJson({ success: true, members: members.data, audit: audit.data });
  } catch {
    return noStoreJson({ error: 'A kollégák adatai nem tölthetők be.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  const limit = await enforceRateLimit(request, 'staff-management', { limit: 12, windowMs: 15 * 60_000 });
  if (limit) return limit;
  try {
    const body = await request.json();
    if (!['invite', 'reset', 'resend', 'role', 'disable', 'delete'].includes(body.action)) return noStoreJson({ error: 'Ismeretlen művelet.' }, { status: 400 });
    if (!await reauthenticateStaff(access.context, body.adminPassword)) {
      return noStoreJson({ error: 'A megerősítéshez adja meg a saját, jelenlegi jelszavát.' }, { status: 403 });
    }
    const renewed = await authorizeStaff(request);
    if (renewed.error) return renewed.error;
    const db = staffServiceClient();
    const actor = access.context.id || `legacy:${access.context.name}`;
    if (body.action === 'invite') {
      const email = normalizeEmail(body.email);
      if (!isValidEmail(email) || !['admin', 'assistant'].includes(body.role)) return noStoreJson({ error: 'Adjon meg érvényes e-mail-címet és jogosultságot.' }, { status: 400 });
      if (email === OWNER_EMAIL) return noStoreJson({ error: 'Ez a cím a tulajdonosi fiók számára van fenntartva.' }, { status: 409 });
      const { data: existing, error: lookupError } = await db.from('staff_members').select('user_id').eq('email', email).maybeSingle();
      if (lookupError) throw new Error('staff_lookup_failed');
      if (existing) return noStoreJson({ error: 'Ehhez az e-mail-címhez már tartozik hozzáférés. Használja az újraküldést vagy a jelszó-visszaállítást.' }, { status: 409 });
      // The random initial password is never displayed, mailed or retained.
      // An invited membership cannot access data until setup is completed.
      const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true, password: randomBytes(48).toString('base64url') });
      if (error || !data.user) throw new Error('staff_user_creation_failed');
      const { error: memberError } = await db.from('staff_members').insert({ user_id: data.user.id, email, role: body.role });
      if (memberError) {
        await db.auth.admin.deleteUser(data.user.id);
        throw new Error('staff_membership_creation_failed');
      }
      await issueStaffLink(data.user.id, 'invite', actor);
    } else {
      if (typeof body.userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.userId)) return noStoreJson({ error: 'Érvénytelen azonosító.' }, { status: 400 });
      if (body.userId === access.context.id) return noStoreJson({ error: 'A saját hozzáférését itt nem módosíthatja.' }, { status: 400 });
      const { data: target, error: targetError } = await db.from('staff_members').select('user_id,email,status,role,is_owner').eq('user_id', body.userId).maybeSingle();
      if (targetError) throw new Error('staff_lookup_failed');
      if (!target) return body.action === 'delete' ? noStoreJson({ success: true, message: 'A kolléga már nem szerepel a hozzáférések között.' }) : noStoreJson({ error: 'Nem található kolléga.' }, { status: 404 });
      if (target.is_owner || target.email === OWNER_EMAIL) return noStoreJson({ error: 'A tulajdonosi fiókot csak a tulajdonos kezelheti a Fiókbiztonság menüben.' }, { status: 403 });
      if (target.status === 'deleting' && body.action !== 'delete') return noStoreJson({ error: 'A kolléga törlése folyamatban van. Próbálja újra a törlést.' }, { status: 409 });
      if (body.action === 'delete') {
        if (normalizeEmail(body.email) !== target.email) return noStoreJson({ error: 'A kiválasztott fiók adatai megváltoztak. Frissítse a listát.' }, { status: 409 });
        const { data: claimed, error: claimError } = await db.rpc('begin_staff_deletion', { p_user_id: target.user_id, p_actor: renewed.context.id, p_email: target.email });
        if (claimError) throw new Error('staff_deletion_claim_failed');
        if (!claimed) return noStoreJson({ success: true, message: 'A kolléga már nem szerepel a hozzáférések között.' });
        // Membership revocation is already durable. Hard Auth deletion then
        // cascades only staff credentials, sessions, invitations and recovery
        // codes; patient and contact records have no FK to these accounts.
        try {
          const { error: deletionError } = await db.auth.admin.deleteUser(target.user_id, false);
          if (deletionError) throw new Error('auth_deletion_failed');
        } catch {
          return noStoreJson({ error: 'A hozzáférést visszavontuk, de a végleges törlés nem sikerült. Használja a Törlés újrapróbálása gombot.', code: 'DELETION_PENDING' }, { status: 503 });
        }
        try { await auditStaff(actor, 'access_deleted', target.user_id, target.email); }
        catch { console.warn('staff_deletion_completion_audit_failed'); } // The mandatory start record remains durable.
        return noStoreJson({ success: true, message: 'A kollégát töröltük. A belépése és a korábbi meghívói megszűntek.' });
      }
      if (body.action === 'reset' || body.action === 'resend') {
        await issueStaffLink(target.user_id, target.status === 'invited' ? 'invite' : 'reset', actor);
      } else {
        if (body.action === 'role' && !['admin', 'assistant'].includes(body.role)) return noStoreJson({ error: 'Érvénytelen jogosultság.' }, { status: 400 });
        const payload = body.action === 'disable'
          ? { status: 'disabled', auth_valid_after: new Date().toISOString(), updated_at: new Date().toISOString() }
          : { role: body.role, updated_at: new Date().toISOString() };
        const { data: changed, error } = await db.from('staff_members').update(payload).eq('user_id', target.user_id).eq('is_owner', false).neq('status', 'deleting').select('user_id').maybeSingle();
        if (error) throw new Error('staff_update_failed');
        if (!changed) return noStoreJson({ error: 'A hozzáférés közben megváltozott. Frissítse a listát.' }, { status: 409 });
        await auditStaff(actor, body.action === 'disable' ? 'access_disabled' : `role_changed_to_${body.role}`, target.user_id);
      }
    }
    return noStoreJson({ success: true });
  } catch (error) {
    const deliveryFailed = error instanceof Error && error.message === 'invitation_delivery_failed';
    return noStoreJson({ error: deliveryFailed
      ? 'A fiók megvan, de a meghívó küldése nem sikerült. A hozzáférés inaktív; használja az újraküldést.'
      : 'A művelet nem fejezhető be. Frissítse a listát, és próbálja újra.' }, { status: 503 });
  }
}
