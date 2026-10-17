import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
const require = createRequire(import.meta.url);
const next = require('next/server');

function environment() {
  const env = { ADMIN_NAME: 'test-admin', ADMIN_PASSWORD: 'fixture-password-only', ADMIN_SESSION_SECRET: 'isolated-test-secret', NODE_ENV: 'production' };
  function load(file, imports) {
    const module = { exports: {} };
    const source = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(source, { module, exports: module.exports, Buffer, Request, Response, URL, Date, console, process: { env }, require(name) {
      if (!(name in imports)) throw new Error('Unexpected dependency ' + name);
      return imports[name];
    } });
    return module.exports;
  }
  const security = load('lib/serverSecurity.ts', { 'node:crypto': crypto, 'next/server': next, '@supabase/supabase-js': { createClient() { throw new Error('No real database in auth tests'); } } });
  const auth = load('lib/adminAuth.ts', { 'node:crypto': crypto, 'next/server': next, './serverSecurity': security });
  const imports = { 'next/server': next, '@/lib/adminAuth': auth, '@/lib/serverSecurity': security };
  return { auth, security, login: load('app/api/admin-login/route.ts', imports).POST, logout: load('app/api/admin-logout/route.ts', imports).POST };
}
const adminOrigin = 'https://admin.crowndental.hu';
function request(path, body = {}, headers = {}) {
  return new Request(adminOrigin + path, { method: 'POST', headers: { host: 'admin.crowndental.hu', origin: adminOrigin, 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
}

test('existing credentials create a secure host-only session on the new admin origin', async () => {
  const e = environment();
  const response = await e.login(request('/api/admin-login', { username: 'test-admin', password: 'fixture-password-only' }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=strict/i);
  assert.doesNotMatch(cookie, /Domain=/i);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(e.auth.requireAdminSession(request('/api/admin-data', {}, { cookie: cookie.split(';')[0] })), null);
});

test('Crown public origin and Beauty origin cannot submit admin mutations cross-origin', async () => {
  for (const origin of ['https://www.crowndental.hu', 'https://beautycrown.hu', 'https://admin.crowndental.hu.evil.example']) {
    const e = environment();
    const response = await e.login(request('/api/admin-login', { username: 'test-admin', password: 'fixture-password-only' }, { origin }));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal((await e.logout(request('/api/admin-logout', {}, { origin }))).status, 403);
  }
});

test('missing, malformed and tampered sessions never authorize admin data access', () => {
  const e = environment();
  for (const cookie of ['', 'crown_admin_session=%E0%A4%A', 'crown_admin_session=' + e.auth.createAdminSessionToken() + 'tampered']) {
    assert.equal(e.auth.requireAdminSession(request('/api/admin-data', {}, { cookie })).status, 401);
  }
});

test('wrong credentials fail and logout clears only the host session cookie', async () => {
  const e = environment();
  assert.equal((await e.login(request('/api/admin-login', { username: 'test-admin', password: 'wrong' }))).status, 401);
  const response = await e.logout(request('/api/admin-logout'));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  assert.doesNotMatch(response.headers.get('set-cookie'), /Domain=/i);
});
