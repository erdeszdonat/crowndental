import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const next = require('next/server');
const json = (body, init) => next.NextResponse.json(body, init);
function load(file, imports) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Buffer, Request, Response, URL, Date, process: { env: { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public' } }, require(name) {
    if (!(name in imports)) throw new Error('Unexpected import: ' + name); return imports[name];
  } });
  return module.exports;
}
const request = body => new Request('https://admin.crowndental.hu/api/admin/security', { method: 'POST', body: JSON.stringify(body) });

test('AAL1, stale AAL2, and the legacy cookie cannot authorize data or service actions', async () => {
  const state = { aal: 'aal1', factors: [], live: true };
  const jwt = () => 'header.' + Buffer.from(JSON.stringify({ aal: state.aal })).toString('base64url') + '.verified';
  const auth = load('lib/staffAuth.ts', {
    '@supabase/supabase-js': { createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'own', email: 'own@example.invalid', factors: state.factors } } }) },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { email: 'own@example.invalid', role: 'admin', status: 'active' } }) }) }) }),
      rpc: async () => ({ data: state.live }) }) }, 'next/server': next, './adminAuth': { clearAdminSessionCookie() {} }, './serverSecurity': { noStoreJson: json },
  });
  const req = () => new Request('https://admin.crowndental.hu/api/admin-data', { headers: { cookie: `__Host-crown_staff_access=${jwt()}` } });
  assert.equal((await auth.authorizeStaff(req())).error.status, 428);
  assert.equal((await auth.authorizeStaff(req(), 'assistant', true)).context.mfa.satisfied, false);
  state.factors = [{ id: 'own-factor', factor_type: 'totp', status: 'verified' }];
  assert.equal((await auth.authorizeStaff(req())).error.status, 428);
  state.aal = 'aal2'; state.live = false;
  assert.equal((await auth.authorizeStaff(req())).error.status, 428);
  state.live = true;
  const context = (await auth.authorizeStaff(req())).context;
  assert.equal(context.mfa.satisfied, true);
  assert.equal('factors' in auth.publicStaffIdentity(context), false);
  assert.equal((await auth.authorizeStaff(new Request(req().url, { headers: { cookie: 'crown_admin_session=legacy-cookie' } }))).error.status, 401);
});

function environment({ satisfied = true, passwordOk = true, usedCode = false } = {}) {
  const calls = [];
  const context = { id: 'own-id', email: 'own@example.invalid', role: 'admin', accessToken: 'own-jwt', mfa: { enrolled: true, satisfied }, factors: [{ id: 'own-factor', factor_type: 'totp', status: 'verified' }] };
  const db = { from: () => ({ update(payload) { calls.push(['epoch', payload]); return { eq: async (key, id) => { assert.equal(id, 'own-id'); return { error: null }; } }; } }),
    auth: { admin: { updateUserById: async (id, payload) => { calls.push(['password', id, payload.password]); return { error: null }; },
      signOut: async (...args) => { calls.push(['revoke', ...args]); return { error: null }; }, mfa: { deleteFactor: async payload => { calls.push(['deleteFactor', payload]); return { error: null }; } } } },
    rpc: async (name, payload) => { calls.push([name, payload]); if (name === 'consume_staff_recovery_code') { const valid = !usedCode; usedCode = true; return { data: valid }; } return { error: null }; },
  };
  const route = load('app/api/admin/security/route.ts', {
    'node:crypto': crypto,
    '@/lib/staffAuth': { authorizeStaff: async (req, role, incomplete) => !satisfied && !incomplete ? { error: json({}, { status: 428 }) } : { context }, requireStaffOrigin: () => null, staffServiceClient: () => db, staffContextForToken: async () => ({ mfa: { satisfied: true } }), setStaffCookies: () => calls.push(['cookies']), clearStaffCookies: () => calls.push(['clear']) },
    '@/lib/adminAuth': { clearAdminSessionCookie() {}, validateAdminCredentials: () => false },
    '@/lib/staffAccess': { auditStaff: async (...args) => calls.push(['audit', ...args]), issueStaffLink: () => { throw new Error('Unexpected mail'); }, reauthenticateStaff: async () => passwordOk, validStaffPassword: value => typeof value === 'string' && value.length >= 12 && value.length <= 128 },
    '@/lib/ownerSetup': { hasOwnerSetup: async () => false, clearOwnerSetupCookie() {} },
    '@/lib/accountSecurity': { generateRecoveryCodes: async () => ['fixture-recovery'], recoveryHash: () => 'hash', sessionAuth: async () => ({ client: { auth: { mfa: { challengeAndVerify: async payload => { calls.push(['verify', payload]); return { data: { access_token: 'upgraded' } }; } } } } }) },
    '@/lib/serverSecurity': { enforceRateLimit: async () => null, noStoreJson: json },
  });
  return { calls, context, submit: body => route.POST(request(body)) };
}

test('password change requires MFA, current password, valid confirmation and modifies only the acting user', async () => {
  const body = { action: 'password', password: 'old-fixture-password', newPassword: 'new-fixture-password', confirmPassword: 'new-fixture-password', userId: 'someone-else' };
  for (const opts of [{ satisfied: false }, { passwordOk: false }]) {
    const e = environment(opts); assert.ok((await e.submit(body)).status >= 400); assert.equal(e.calls.length, 0);
  }
  const e = environment();
  assert.equal((await e.submit({ ...body, confirmPassword: 'mismatch' })).status, 400);
  assert.equal(e.calls.length, 0);
  const response = await e.submit(body);
  assert.equal(response.status, 200); assert.equal((await response.json()).loginRequired, true);
  assert.deepEqual(e.calls.slice(0, 3).map(call => call[0]), ['epoch', 'password', 'revoke']);
  assert.equal(e.calls[1][1], 'own-id'); assert.deepEqual(e.calls[2], ['revoke', 'own-jwt', 'global']);
  assert.ok(e.calls.some(call => call[0] === 'clear'));
});

test('MFA verification ignores foreign factor IDs and uses the authenticated account factor', async () => {
  const e = environment({ satisfied: false });
  const response = await e.submit({ action: 'verify', code: '123456', factorId: 'another-account-factor' });
  assert.equal(response.status, 200);
  assert.equal(e.calls[0][1].factorId, 'own-factor');
  assert.equal((await response.json()).access_token, undefined);
});

test('a recovery code is consumed before factor deletion, cannot replay, and never opens data access', async () => {
  const e = environment({ satisfied: false });
  const response = await e.submit({ action: 'recover', password: 'fixture', recoveryCode: 'fixture' });
  assert.equal(response.status, 200); assert.equal((await response.json()).loginRequired, true);
  assert.equal(e.calls[0][0], 'consume_staff_recovery_code');
  assert.equal(e.calls[1][0], 'deleteFactor'); assert.equal(e.calls[1][1].userId, 'own-id');
  assert.equal(e.calls.some(call => call[0] === 'cookies'), false);
  assert.equal((await e.submit({ action: 'recover', password: 'fixture', recoveryCode: 'fixture' })).status, 403);
  assert.equal(e.calls.filter(call => call[0] === 'deleteFactor').length, 1);
});

test('recovery generation stores ten hashes and returns plaintext only to the active request', async () => {
  let hashes;
  const mod = load('lib/accountSecurity.ts', { 'node:crypto': crypto, './staffAccess': { staffTokenHash: text => crypto.createHash('sha256').update(text).digest('hex') }, './staffAuth': { staffServiceClient: () => ({ rpc: async (name, args) => { assert.equal(name, 'replace_staff_recovery_codes'); hashes = args.p_hashes; return {}; } }) } });
  const codes = await mod.generateRecoveryCodes('own-id');
  assert.equal(codes.length, 10); assert.equal(new Set(codes).size, 10); assert.equal(hashes.length, 10);
  assert.ok(hashes.every(hash => /^[a-f0-9]{64}$/.test(hash)));
  assert.equal(mod.recoveryHash(codes[0].toUpperCase()), hashes[0]);
  assert.equal(mod.recoveryHash('short'), null);
});
