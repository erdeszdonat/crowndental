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
const env = { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture-publishable', SUPABASE_SERVICE_ROLE_KEY: 'fixture-service' };
function load(file, imports, extra = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Request, Response, Headers, Buffer, Date, URL, console, process: { env }, ...extra,
    require(name) { if (!(name in imports)) throw new Error('Unexpected import: ' + name); return imports[name]; } });
  return module.exports;
}
const origin = 'https://admin.crowndental.hu';
function request(path, body = {}, headers = {}, method = 'POST') {
  return new Request(origin + path, { method, headers: { host: 'admin.crowndental.hu', origin, 'content-type': 'application/json', ...headers }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
}
function authEnvironment() {
  const calls = [];
  const member = { user_id: 'fixture-user', email: 'fixture@example.invalid', name: 'Fixture', role: 'assistant', status: 'active' };
  let valid = true;
  const auth = load('lib/staffAuth.ts', {
    '@supabase/supabase-js': { createClient(url, key, options) {
      calls.push({ url, key, options });
      return { auth: { getUser: async token => ({ data: { user: valid && token === 'verified-jwt' ? { id: member.user_id, email: member.email, user_metadata: { role: 'admin' } } : null }, error: valid ? null : new Error('invalid') }) },
        from(table) { assert.equal(table, 'staff_members'); return { select() { return { eq() { return { maybeSingle: async () => ({ data: member.status === 'active' ? { ...member } : null, error: null }) }; } }; } }; } };
    } },
    'next/server': next,
    './adminAuth': { hasValidAdminSession: () => false, clearAdminSessionCookie() {} },
    './serverSecurity': { noStoreJson: json },
  });
  return { auth, calls, member, invalidate() { valid = false; } };
}

test('staff authentication verifies identity and queries RLS with a public key and the user JWT', async () => {
  const e = authEnvironment();
  const context = await e.auth.staffContextForToken('verified-jwt');
  assert.equal(context.role, 'assistant');
  assert.equal(e.calls.length, 2);
  assert.equal(e.calls[1].key, 'fixture-publishable');
  assert.equal(e.calls[1].options.global.headers.Authorization, 'Bearer verified-jwt');
  assert.equal(e.calls[1].options.auth.persistSession, false);
  assert.equal(JSON.stringify(e.auth.publicStaffIdentity(context)).includes('verified-jwt'), false);
  assert.equal('db' in e.auth.publicStaffIdentity(context), false);
});

test('invalid JWTs never reach membership reads; role changes and disablement are checked afresh', async () => {
  const e = authEnvironment();
  assert.equal(await e.auth.staffContextForToken('tampered'), null);
  assert.equal(e.calls.length, 1);
  e.member.role = 'admin';
  assert.equal((await e.auth.staffContextForToken('verified-jwt')).role, 'admin');
  e.member.role = 'assistant';
  assert.equal((await e.auth.staffContextForToken('verified-jwt')).role, 'assistant');
  e.member.status = 'disabled';
  assert.equal(await e.auth.staffContextForToken('verified-jwt'), null);
});

test('admin-only endpoints reject an assistant before any service access or side effect', async () => {
  const denied = json({ error: 'forbidden' }, { status: 403 });
  const never = () => { throw new Error('Privileged operation called for assistant'); };
  const imports = {
    'node:crypto': crypto,
    '@/lib/ownerSetup': { OWNER_EMAIL: 'reserved@example.invalid' },
    '@/lib/staffAuth': { authorizeStaff: async () => ({ context: null, error: denied }), requireStaffOrigin: () => null, staffServiceClient: never },
    '@/lib/staffAccess': { auditStaff: never, issueStaffLink: never, reauthenticateStaff: never, STAFF_FIELDS: '' },
    '@/lib/serverSecurity': { enforceRateLimit: never, noStoreJson: json },
    '@/lib/addToAudience': { addToResendAudience: never, sendTransactionalEmail: never },
    '@/lib/marketingTokens': { createUnsubscribeToken: never, getUnsubscribeTokenHash: never },
    '@/lib/hidfutasServer': { syncHidfutasMarketing: never },
    '@/lib/hidfutas': { HIDFUTAS: { id: 'fixture' } },
  };
  for (const [file, methods] of [['app/api/admin/staff/route.ts', ['GET','POST']], ['app/api/admin/import-resend/route.ts', ['POST']], ['app/api/admin/hidfutas/route.ts', ['GET','POST']]]) {
    const route = load(file, imports);
    for (const method of methods) assert.equal((await route[method](request('/api/admin/staff', {}, {}, method))).status, 403, file + ':' + method);
  }
});

test('staff mutations require exact same-origin requests and do not trust forwarded-host spoofing', () => {
  const { auth } = authEnvironment();
  assert.equal(auth.requireStaffOrigin(request('/api/admin/staff')), null);
  for (const headers of [{ origin: '' }, { origin: 'https://www.crowndental.hu' }, { origin: 'https://evil.example', 'x-forwarded-host': 'evil.example' }, { 'sec-fetch-site': 'cross-site' }]) {
    assert.equal(auth.requireStaffOrigin(request('/api/admin/staff', {}, headers)).status, 403);
  }
});

test('access and refresh cookies are HttpOnly, Secure, strict, host-only, and never include a domain', () => {
  const { auth } = authEnvironment();
  const response = json({ success: true });
  auth.setStaffCookies(response, { access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600 });
  for (const cookie of response.headers.getSetCookie()) {
    assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i); assert.match(cookie, /SameSite=strict/i); assert.doesNotMatch(cookie, /Domain=/i);
  }
  assert.equal(JSON.stringify(response.body).includes('fixture-access'), false);
});

function accessEnvironment({ expired = false, invalidatedDuringPassword = false } = {}) {
  const state = { used: false, passwordWrites: 0, activations: 0, cookies: 0, audit: [], profile: { user_id: 'fixture-id', email: 'fixture@example.invalid', name: '', status: 'invited', auth_valid_after: '2026-01-01T00:00:00Z' } };
  const db = { auth: { admin: { async updateUserById(id, payload) {
    assert.equal(id, 'fixture-id'); assert.ok(payload.password.length >= 12); state.passwordWrites++;
    if (invalidatedDuringPassword) state.profile.auth_valid_after = '2027-01-01T00:00:00Z';
    return { error: null };
  } } }, from(table) {
    const query = { filters: [], payload: null,
      select() { return query; }, update(payload) { query.payload = payload; return query; },
      eq(key, value) { query.filters.push([key,value]); return query; }, is() { return query; }, gt() { return query; },
      async maybeSingle() {
        if (table === 'staff_invitations') {
          if (expired || state.used) return { data: null, error: null };
          if (query.payload) state.used = true;
          return { data: { id: 'fixture-invite', user_id: 'fixture-id', kind: 'invite' }, error: null };
        }
        assert.equal(table, 'staff_members');
        if (query.payload) {
          const expected = query.filters.find(([key]) => key === 'auth_valid_after')?.[1];
          if (expected !== state.profile.auth_valid_after || state.profile.status !== 'invited') return { data: null, error: null };
          Object.assign(state.profile, query.payload); state.activations++;
        }
        return { data: { ...state.profile }, error: null };
      },
    }; return query;
  } };
  const route = load('app/api/admin/access/route.ts', {
    '@/lib/staffAuth': { requireStaffOrigin: () => null, staffServiceClient: () => db, staffPublicClient: () => ({ auth: { signInWithPassword: async () => ({ data: { session: { access_token: 'fixture' } }, error: null }) } }), setStaffCookies() { state.cookies++; } },
    '@/lib/staffAccess': { auditStaff: async (...args) => state.audit.push(args), staffTokenHash: token => crypto.createHash('sha256').update(token).digest('hex'), validStaffToken: token => typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token), validStaffPassword: value => typeof value === 'string' && value.length >= 12 && value.length <= 128 },
    '@/lib/serverSecurity': { cleanText: value => typeof value === 'string' ? value.trim().slice(0,120) : '', enforceRateLimit: async () => null, noStoreJson: json },
  });
  const body = { action: 'accept', token: 'a'.repeat(43), name: 'Fixture Staff', password: 'fixture-password-1234', role: 'admin' };
  return { state, submit: override => route.POST(request('/api/admin/access', { ...body, ...override })) };
}

test('previewing an invitation does not consume it; short passwords and expired links never write credentials', async () => {
  const e = accessEnvironment();
  assert.equal((await e.submit({ action: 'preview' })).status, 200);
  assert.equal(e.state.used, false);
  assert.equal((await e.submit({ password: 'short' })).status, 400);
  assert.equal(e.state.passwordWrites, 0);
  const expired = accessEnvironment({ expired: true });
  assert.equal((await expired.submit()).status, 410);
  assert.equal(expired.state.passwordWrites, 0);
});

test('concurrent invitation acceptance writes the password once, cannot self-assign a role, and cannot replay', async () => {
  const e = accessEnvironment();
  const responses = await Promise.all([e.submit(), e.submit()]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200,410]);
  assert.equal(e.state.passwordWrites, 1); assert.equal(e.state.activations, 1); assert.equal(e.state.cookies, 1);
  assert.equal(e.state.profile.role, undefined);
  assert.equal((await e.submit()).status, 410);
});

test('a concurrent reset or disable prevents an older invitation from activating a membership', async () => {
  const e = accessEnvironment({ invalidatedDuringPassword: true });
  assert.equal((await e.submit()).status, 503);
  assert.equal(e.state.activations, 0); assert.equal(e.state.cookies, 0);
  assert.equal(e.state.profile.status, 'invited');
});

test('an admin session alone cannot change access without the acting admin password', async () => {
  let privilegedCalls = 0;
  const route = load('app/api/admin/staff/route.ts', {
    'node:crypto': crypto,
    '@/lib/ownerSetup': { OWNER_EMAIL: 'reserved@example.invalid' },
    '@/lib/staffAuth': { authorizeStaff: async () => ({ error: null, context: { id: 'actor', role: 'admin' } }), requireStaffOrigin: () => null, staffServiceClient: () => { privilegedCalls++; throw new Error('Unexpected service access'); } },
    '@/lib/staffAccess': { reauthenticateStaff: async () => false },
    '@/lib/serverSecurity': { enforceRateLimit: async () => null, noStoreJson: json },
  });
  const response = await route.POST(request('/api/admin/staff', { action: 'invite', email: 'fixture@example.invalid', role: 'admin', adminPassword: 'wrong' }));
  assert.equal(response.status, 403); assert.equal(privilegedCalls, 0);
});

test('administrators cannot demote, disable or reset themselves', async () => {
  const id = '10000000-0000-4000-8000-000000000001';
  const route = load('app/api/admin/staff/route.ts', {
    'node:crypto': crypto,
    '@/lib/ownerSetup': { OWNER_EMAIL: 'reserved@example.invalid' },
    '@/lib/staffAuth': { authorizeStaff: async () => ({ error: null, context: { id, role: 'admin' } }), requireStaffOrigin: () => null, staffServiceClient: () => ({ from() { throw new Error('Unexpected write'); } }) },
    '@/lib/staffAccess': { reauthenticateStaff: async () => true },
    '@/lib/serverSecurity': { enforceRateLimit: async () => null, noStoreJson: json },
  });
  for (const action of ['role','disable','reset','resend']) {
    assert.equal((await route.POST(request('/api/admin/staff', { action, userId: id, role: 'assistant', adminPassword: 'fixture' }))).status, 400);
  }
});
