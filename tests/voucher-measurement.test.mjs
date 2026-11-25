import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const origin = 'https://www.crowndental.hu';
const receipt = 'cs_live_fakeForAnOfflineTest1234';
function load(file, globals) {
  const loaded = { exports: {} };
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(outputText, { module: loaded, exports: loaded.exports, URL, AbortController, ...globals });
  return loaded.exports;
}

test('receipt endpoint releases only an issued, non-refunded voucher amount and a stable, opaque transaction ID', async () => {
  const criteria = [];
  let row = null;
  const table = {
    select(col) { assert.equal(col, 'amount'); return this; },
    eq(...args) { criteria.push(args); return this; },
    not(...args) { criteria.push(args); return this; },
    async maybeSingle() { return { data: row, error: null }; },
  };
  const modules = {
    'node:crypto': { createHash }, '@/lib/vouchers/service': { publicOrigin: origin },
    '@/lib/serverSecurity': { enforceRateLimit: async () => null, noStoreJson: Response.json },
    '@/lib/staffAuth': { staffServiceClient: () => ({ from: name => { assert.equal(name, 'voucher_orders'); return table; } }) },
  };
  const { POST } = load('../app/api/utalvany/meres/route.ts', { require: key => modules[key] });
  const call = (token, from = origin) => POST(new Request(origin + '/api/utalvany/meres', {
    method: 'POST', headers: { host: 'www.crowndental.hu', origin: from }, body: JSON.stringify({ receipt: token }),
  }));
  assert.equal((await call(receipt, 'https://foreign.invalid')).status, 403);
  assert.equal((await call('bad')).status, 400);
  assert.equal((await call(receipt)).status, 202);
  assert.deepEqual(criteria, [['session_id', receipt], ['issued_at', 'is', null], ['refunded', false]]);
  row = { amount: 30000 };
  const result = await (await call(receipt)).json();
  assert.deepEqual(Object.keys(result).sort(), ['transaction', 'value']);
  assert.equal(result.value, 30000);
  assert.match(result.transaction, /^[a-f0-9]{32}$/);
  assert.deepEqual(result, await (await call(receipt)).json());
});

test('return measurement waits for the webhook and records the confirmed purchase once despite a reload', async () => {
  let stored = receipt, hasConsent = false;
  const timers = [], events = [], calls = [];
  const window = {
    setTimeout: callback => timers.push(callback), clearTimeout() {}, addEventListener() {}, removeEventListener() {},
    sessionStorage: { getItem: () => stored, removeItem: () => { stored = null; } },
  };
  const { startVoucherReturnMeasurement: start } = load('../lib/vouchers/returnMeasurement.ts', {
    require: () => ({ canMeasure: () => hasConsent, trackVoucherEvent: (...args) => { events.push(args); return true; } }),
    window, fetch: async (url, options) => {
      calls.push([url, JSON.parse(options.body)]);
      return calls.length === 1 ? new Response(null, { status: 202 }) : Response.json({ value: 30000, transaction: 'a'.repeat(32) });
    },
  });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  start()(); await settle();
  assert.equal(calls.length, 0);
  hasConsent = true;
  const stop = start(); await settle();
  assert.equal(events.length, 0);
  assert.equal(timers.length, 1);
  await timers[0](); stop();
  assert.deepEqual(events, [['purchase', 30000, 'a'.repeat(32)]]);
  start()(); await settle();
  assert.equal(calls.length, 2);
  assert.equal(stored, null);
});
