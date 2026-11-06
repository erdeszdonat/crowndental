import { randomBytes } from 'node:crypto';
import { authorizeStaff, clearStaffCookies, requireStaffOrigin, setStaffCookies, staffContextForToken, staffServiceClient } from '@/lib/staffAuth';
import { clearAdminSessionCookie, validateAdminCredentials } from '@/lib/adminAuth';
import { auditStaff, issueStaffLink, reauthenticateStaff, validStaffPassword } from '@/lib/staffAccess';
import { findOwner, hasOwnerSetup, OWNER_EMAIL, clearOwnerSetupCookie } from '@/lib/ownerSetup';
import { generateRecoveryCodes, recoveryHash, sessionAuth } from '@/lib/accountSecurity';
import { enforceRateLimit, noStoreJson } from '@/lib/serverSecurity';

export async function POST(request: Request) {
  const origin = requireStaffOrigin(request);
  if (origin) return origin;
  const limit = await enforceRateLimit(request, 'account-security', { limit: 40, windowMs: 15 * 60_000 });
  if (limit) return limit;
  try {
    const body = await request.json();
    if (body.action === 'owner_activate') {
      if (!await hasOwnerSetup(request) || !validateAdminCredentials(process.env.ADMIN_NAME, body.password)) {
        return noStoreJson({ error: 'Jelentkezzen be újra a meglévő adminnévvel és jelszóval.' }, { status: 401 });
      }
      const db = staffServiceClient();
      let owner = await findOwner();
      if (!owner) {
        const { data, error } = await db.auth.admin.createUser({ email: OWNER_EMAIL, email_confirm: true, password: randomBytes(48).toString('base64url') });
        if (error || !data.user) throw new Error('owner_creation_failed');
        const { error: insertError } = await db.from('staff_members').insert({ user_id: data.user.id, email: OWNER_EMAIL, name: process.env.ADMIN_NAME || 'erdeszdonat', role: 'admin', is_owner: true });
        if (insertError) { await db.auth.admin.deleteUser(data.user.id); throw new Error('owner_profile_failed'); }
        owner = { user_id: data.user.id, email: OWNER_EMAIL, status: 'invited' };
      }
      if (owner.status !== 'invited' || owner.email !== OWNER_EMAIL) return noStoreJson({ error: 'A fiók már aktiválva van. Lépjen be az új jelszavával.' }, { status: 409 });
      await issueStaffLink(owner.user_id, 'invite', 'owner_setup');
      return noStoreJson({ success: true, message: 'Az aktiváló linket elküldtük az erdeszdonatcd@gmail.com címre. A linken állítsa be az új jelszavát, majd kapcsolja be a Google Authenticatort.' });
    }

    const access = await authorizeStaff(request, 'assistant', true);
    if (access.error) return access.error;
    const context = access.context;
    const userLimit = await enforceRateLimit(request, 'account-security-user', { key: context.id!, limit: 10, windowMs: 15 * 60_000 });
    if (userLimit) return userLimit;
    const db = staffServiceClient();
    const known = context.factors || [];
    const verified = known.filter(factor => factor.status === 'verified');

    if (body.action === 'verify') {
      if (typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) return noStoreJson({ error: 'Adja meg a hatjegyű Authenticator-kódot.' }, { status: 400 });
      // Never accept a factor belonging to another account, or add a new
      // factor as an AAL1 replacement for an already verified authenticator.
      const factor = verified[0] || known.find(f => f.id === body.factorId && f.status === 'unverified');
      if (!factor) return noStoreJson({ error: 'Előbb indítsa el az Authenticator beállítását.' }, { status: 400 });
      const { client } = await sessionAuth(request, context);
      const { data, error } = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code: body.code });
      if (error || !data) return noStoreJson({ error: 'Helytelen vagy lejárt kód. Próbálja a telefonon megjelenő következőt.' }, { status: 400 });
      const upgraded = await staffContextForToken(data.access_token);
      if (!upgraded?.mfa?.satisfied) throw new Error('mfa_upgrade_failed');
      const codes = factor.status === 'unverified' ? await generateRecoveryCodes(context.id!) : undefined;
      await auditStaff(context.id!, factor.status === 'unverified' ? 'mfa_enabled' : 'mfa_verified', context.id);
      const response = noStoreJson({ success: true, recoveryCodes: codes });
      setStaffCookies(response, data);
      return response;
    }

    if (!['enroll', 'password', 'recovery_codes', 'recover'].includes(body.action)) return noStoreJson({ error: 'Ismeretlen művelet.' }, { status: 400 });
    if (['password', 'recovery_codes'].includes(body.action) && !context.mfa?.satisfied) return noStoreJson({ error: 'Előbb adja meg az Authenticator-kódot.' }, { status: 428 });
    if (!await reauthenticateStaff(context, body.password)) return noStoreJson({ error: 'A jelenlegi jelszó nem megfelelő.' }, { status: 403 });
    // Recheck account disablement, reset and role/session state after password verification.
    const renewed = await authorizeStaff(request, 'assistant', !['password', 'recovery_codes'].includes(body.action));
    if (renewed.error) return renewed.error;

    if (body.action === 'enroll') {
      if (verified.length) return noStoreJson({ error: 'Az Authenticator már aktív. Belépéshez adja meg a telefonos kódot.' }, { status: 409 });
      const { client, session } = await sessionAuth(request, context);
      for (const factor of known) {
        const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw new Error('factor_cleanup_failed');
      }
      const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', issuer: 'Crown Dental', friendlyName: 'Google Authenticator' });
      if (error || !data) throw new Error('factor_enroll_failed');
      const response = noStoreJson({ success: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setStaffCookies(response, session);
      return response;
    }
    if (body.action === 'recovery_codes') return noStoreJson({ success: true, recoveryCodes: await generateRecoveryCodes(context.id!) });

    if (body.action === 'recover') {
      const hash = recoveryHash(body.recoveryCode);
      if (!hash) return noStoreJson({ error: 'Érvénytelen helyreállító kód.' }, { status: 400 });
      const { data, error } = await db.rpc('consume_staff_recovery_code', { p_user_id: context.id, p_hash: hash });
      if (error) throw new Error('recovery_failed');
      if (data !== true) return noStoreJson({ error: 'A helyreállító kód nem megfelelő vagy már felhasználták.' }, { status: 403 });
      // Consuming the code revokes data access before touching Auth factors.
      for (const factor of known) {
        const { error: factorError } = await db.auth.admin.mfa.deleteFactor({ userId: context.id!, id: factor.id });
        if (factorError) throw new Error('factor_reset_failed');
      }
      await db.auth.admin.signOut(context.accessToken!, 'global');
      const response = noStoreJson({ success: true, loginRequired: true, message: 'A helyreállító kódot felhasználtuk. Lépjen be újra, és állítsa be az Authenticatort az új telefonon.' });
      clearStaffCookies(response); clearOwnerSetupCookie(response); clearAdminSessionCookie(response);
      return response;
    }

    if (!validStaffPassword(body.newPassword) || body.newPassword !== body.confirmPassword || body.newPassword === body.password) return noStoreJson({ error: 'Adjon meg egy új, egyező, 12–128 karakteres jelszót mindkét mezőben.' }, { status: 400 });
    // Advance the revocation epoch first: failures cannot leave old data
    // sessions usable. Auth global sign-out also removes intervening sessions.
    const { error: epochError } = await db.from('staff_members').update({ auth_valid_after: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', context.id);
    if (epochError) throw new Error('session_revoke_failed');
    const { error: passwordError } = await db.auth.admin.updateUserById(context.id!, { password: body.newPassword });
    const { error: revokeError } = await db.auth.admin.signOut(context.accessToken!, 'global');
    const response = noStoreJson(passwordError ? { error: 'A jelszócsere nem sikerült. Lépjen be újra a korábbi jelszavával.' }
      : { success: true, loginRequired: true, message: revokeError ? 'A jelszót módosítottuk és az adathozzáférést visszavontuk. Lépjen be az új jelszavával.' : 'A jelszót módosítottuk. Minden eszközön újra be kell lépni az új jelszóval és az Authenticator-kóddal.' }, { status: passwordError ? 503 : 200 });
    clearStaffCookies(response); clearOwnerSetupCookie(response); clearAdminSessionCookie(response);
    if (!passwordError) await auditStaff(context.id!, 'own_password_changed', context.id);
    return response;
  } catch {
    return noStoreJson({ error: 'A biztonsági művelet nem fejezhető be. Frissítse az oldalt, és próbálja újra; jelszócsere után szükség lehet új belépésre.' }, { status: 503 });
  }
}
