import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const next = require('next/server');
const actorId = '10000000-0000-4000-8000-000000000001';
const targetId = '10000000-0000-4000-8000-000000000002';
const origin = 'https://admin.crowndental.hu';
function environment({ password = true, owner = false, status = 'active', providerFails = false, completedWithTimeout = false, claimFails = false, forbidden = false, auditFails = false } = {}) {
  const events = [];
  let member = { user_id: targetId, email: 'colleague@example.invalid', status, role: 'assistant', is_owner: owner };
  const db = { from(table) {
    assert.equal(table, 'staff_members');
    return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: member }) };
  }, rpc: async (name, params) => {
    assert.equal(name, 'begin_staff_deletion'); assert.equal(params.p_user_id, targetId); assert.equal(params.p_actor, actorId);
    if (claimFails) return { error: new Error('audit unavailable') };
    member.status = 'deleting'; events.push('revoked-and-audited'); return { data: member.email };
  }, auth: { admin: { async deleteUser(id, softDelete) {
    assert.equal(id, targetId); assert.equal(softDelete, false); assert.equal(member.status, 'deleting');
    events.push('auth-delete');
    if (completedWithTimeout) { member = null; return { error: new Error('response timed out') }; }
    if (providerFails) return { error: new Error('provider unavailable') };
    member = null; return { error: null };
  } } } };
  const imports = {
    'node:crypto': {}, '@/lib/ownerSetup': { OWNER_EMAIL: 'owner@example.invalid' },
    '@/lib/staffAuth': { authorizeStaff: async () => forbidden ? { error: next.NextResponse.json({}, { status: 403 }) } : { context: { id: actorId, role: 'admin' } }, requireStaffOrigin: request => request.headers.get('origin') === origin ? null : next.NextResponse.json({}, { status: 403 }), staffServiceClient: () => db },
    '@/lib/staffAccess': { reauthenticateStaff: async () => password, auditStaff: async (actor, action, target, email) => { assert.equal(actor, actorId); assert.equal(action, 'access_deleted'); assert.equal(target, targetId); assert.equal(email, 'colleague@example.invalid'); if (auditFails) throw new Error('audit unavailable'); events.push('completed-audit'); } },
    '@/lib/serverSecurity': { enforceRateLimit: async () => null, noStoreJson: (body, init) => next.NextResponse.json(body, init), normalizeEmail: value => typeof value === 'string' ? value.trim().toLowerCase() : '' },
  };
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../app/api/admin/staff/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Date, console: { warn() {} }, require(name) { if (!(name in imports)) throw new Error('Unexpected dependency ' + name); return imports[name]; } });
  return { events, member: () => member, submit: (overrides = {}, requestOrigin = origin) => module.exports.POST(new Request(origin + '/api/admin/staff', { method: 'POST', headers: { origin: requestOrigin }, body: JSON.stringify({ action: 'delete', userId: targetId, email: 'colleague@example.invalid', adminPassword: 'fixture-password', ...overrides }) })) };
}

test('deletion requires admin, origin, current password, correct target email and a non-owner target', async () => {
  for (const config of [{ forbidden: true }, { password: false }, { owner: true }]) {
    const e = environment(config); assert.equal((await e.submit()).status, 403); assert.equal(e.events.length, 0);
  }
  const e = environment();
  assert.equal((await e.submit({}, 'https://evil.invalid')).status, 403);
  assert.equal((await e.submit({ userId: actorId })).status, 400);
  assert.equal((await e.submit({ email: 'someone-else@example.invalid' })).status, 409);
  assert.equal(e.events.length, 0);
});

test('access is revoked and audited before hard Auth deletion; repeated requests are harmless', async () => {
  const e = environment();
  assert.equal((await e.submit()).status, 200);
  assert.deepEqual(e.events, ['revoked-and-audited', 'auth-delete', 'completed-audit']);
  assert.equal(e.member(), null);
  assert.equal((await e.submit()).status, 200);
  assert.equal(e.events.filter(event => event === 'auth-delete').length, 1);
});

test('provider failure leaves access revoked and permits only deletion retry', async () => {
  const e = environment({ providerFails: true });
  const response = await e.submit();
  assert.equal(response.status, 503); assert.equal((await response.json()).code, 'DELETION_PENDING');
  assert.equal(e.member().status, 'deleting');
  for (const action of ['role', 'disable', 'reset', 'resend']) assert.equal((await e.submit({ action, role: 'admin' })).status, 409);
  assert.equal(e.events.filter(event => event === 'auth-delete').length, 1);
  assert.equal((await e.submit()).status, 503);
  assert.equal(e.events.filter(event => event === 'auth-delete').length, 2);
});

test('failed revocation/audit prevents Auth deletion; a completed deletion stays successful if its final audit write fails', async () => {
  const blocked = environment({ claimFails: true });
  assert.equal((await blocked.submit()).status, 503); assert.equal(blocked.events.length, 0); assert.equal(blocked.member().status, 'active');
  const completed = environment({ auditFails: true });
  assert.equal((await completed.submit()).status, 200); assert.equal(completed.member(), null);
  assert.deepEqual(completed.events, ['revoked-and-audited', 'auth-delete']);
});

test('a concurrent completed deletion or provider timeout after success is reported as successful', async () => {
  const e = environment({ completedWithTimeout: true });
  assert.equal((await e.submit()).status, 200);
  assert.equal(e.member(), null);
  assert.deepEqual(e.events, ['revoked-and-audited', 'auth-delete', 'completed-audit']);
});
