import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
function load(file, imports = {}) {
  const testModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module: testModule, exports: testModule.exports, Request, Response, Date, URL, console, process: { env: {} }, require: name => {
    if (!(name in imports)) throw new Error(`Unmocked dependency: ${name}`);
    return imports[name];
  } });
  return testModule.exports;
}
const config = load('lib/hidfutas.ts');
const phone = load('lib/hidfutasServer.ts', { '@supabase/supabase-js': {}, './marketingSubscribers': {} }).normalizeHidfutasPhone;

test('campaign opens at 9 and rejects entries from 13:00 Budapest time', () => {
  assert.equal(config.campaignPhase(Date.parse('2026-09-26T06:59:59Z')), 'before');
  assert.equal(config.campaignPhase(Date.parse('2026-09-26T07:00:00Z')), 'open');
  assert.equal(config.campaignPhase(Date.parse('2026-09-26T10:59:59Z')), 'open');
  assert.equal(config.campaignPhase(Date.parse('2026-09-26T11:00:00Z')), 'closed');
});
test('every spin wins with 25% for each of the four prizes', () => {
  const counts = Object.fromEntries(['strip', 'powder', 'floss', 'toothbrush'].map(prize => [prize, config.WHEEL_SECTORS.filter(s => s.prize === prize).length * 25]));
  assert.deepEqual(counts, { strip: 25, powder: 25, floss: 25, toothbrush: 25 });
});
test('same phone cannot bypass uniqueness with Hungarian or international formatting', () => {
  for (const value of ['+36 30 123 4567', '06-30-123-4567', '0036 30 123 4567', '36301234567']) assert.equal(phone(value), '+36301234567');
  assert.equal(phone('+421 901 234 567'), '+421901234567');
  assert.equal(phone('javascript:123456789'), null);
  assert.equal(phone('123'), null);
});

function environment({ result, dbError = null, originError = false, rateError = false } = {}) {
  const calls = []; const afters = [];
  const json = (data, init) => Response.json(data, init);
  const api = load('app/api/hidfutas/route.ts', {
    'node:crypto': { randomInt: max => { assert.equal(max, 4); return 1; } },
    'next/server': { after: callback => afters.push(callback) },
    '@/lib/hidfutas': config,
    '@/lib/hidfutasServer': {
      normalizeHidfutasPhone: phone,
      hidfutasDatabase: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return { data: result || { created: true, id: 'test-entry', receipt: { code: 'HF-ABCDEF123456', sector: 1, prize: 'powder', marketing: 'no' } }, error: dbError }; } }),
      syncHidfutasMarketing: async id => calls.push({ sync: id }),
    },
    '@/lib/serverSecurity': {
      rejectUntrustedMutation: () => originError ? json({}, { status: 403 }) : null,
      enforceRateLimit: async () => rateError ? json({}, { status: 429 }) : null,
      isValidEmail: email => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254,
      noStoreJson: json,
    },
  });
  const valid = { name: ' Teszt Futó ', email: 'TEST@EXAMPLE.INVALID', phone: '06 30 123 4567', rules: true, marketing: false, website: '', requestId: 'c06b3b73-6b6d-4fef-9e8a-e85e21111111', rulesVersion: config.HIDFUTAS.rulesVersion };
  const submit = (changes = {}) => api.POST(new Request('https://www.crowndental.hu/api/hidfutas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...valid, ...changes }) }));
  return { calls, afters, submit };
}
test('entry works without marketing; draw sector is chosen on the server', async () => {
  const env = environment(); const response = await env.submit({ sector: 0, prize: 'strip' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).receipt.prize, 'powder');
  assert.equal(env.calls[0].args.p_email, 'test@example.invalid');
  assert.equal(env.calls[0].args.p_phone, '+36301234567');
  assert.equal(env.calls[0].args.p_sector, 1);
  assert.equal(env.calls[0].args.p_marketing, false);
  assert.equal(env.afters.length, 0);
});
test('only explicit marketing choice on a new saved entry schedules subscription', async () => {
  const env = environment(); assert.equal((await env.submit({ marketing: true })).status, 200);
  assert.equal(env.afters.length, 1); await env.afters[0](); assert.equal(env.calls[1].sync, 'test-entry');
  const retry = environment({ result: { created: false, id: 'test-entry', receipt: {} } });
  await retry.submit({ marketing: true }); assert.equal(retry.afters.length, 0);
});
test('invalid fields, missing terms and a filled honeypot never reach storage', async () => {
  for (const body of [{ rules: false }, { marketing: 'yes' }, { website: 'spam' }, { email: 'not-an-email' }, { phone: '123' }, { requestId: 'guessable' }, { name: '<script>alert(1)</script>' }, { rulesVersion: 'old' }]) {
    const env = environment(); assert.equal((await env.submit(body)).status, 400); assert.equal(env.calls.length, 0);
  }
});
test('duplicate/deadline errors never return a fake prize or leak another entry', async () => {
  for (const error of ['already_registered', 'closed', 'not_started', 'request_conflict']) {
    const env = environment({ result: { error } }); const response = await env.submit();
    assert.equal(response.status, 409); assert.equal('receipt' in await response.json(), false); assert.equal(env.afters.length, 0);
  }
});
test('database outage, untrusted origins and rate limit fail closed', async () => {
  assert.equal((await environment({ dbError: { message: 'internal' } }).submit()).status, 503);
  const origin = environment({ originError: true }); assert.equal((await origin.submit()).status, 403); assert.equal(origin.calls.length, 0);
  const rate = environment({ rateError: true }); assert.equal((await rate.submit()).status, 429); assert.equal(rate.calls.length, 0);
});

test('legacy fifth-sector receipts retain their prize and code on the four-sector wheel', () => {
  const saved = { code: 'HF-ABCDEF123456', sector: 4, prize: 'powder', marketing: 'no' };
  const restored = config.restoreReceipt(saved);
  assert.equal(restored.code, saved.code);
  assert.equal(restored.prize, 'powder');
  assert.equal(restored.sector, 1);
  assert.equal(config.restoreReceipt({ ...saved, prize: 'toothbrush' }), null);
  assert.equal(config.restoreReceipt(null), null);
});
