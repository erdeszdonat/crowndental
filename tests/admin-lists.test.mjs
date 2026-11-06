import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const next = require('next/server');
function load(path, imports = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Date, String, require(name) {
    if (!(name in imports)) throw new Error('Unexpected dependency: ' + name); return imports[name];
  } });
  return module.exports;
}
const { filterAdminRecords } = load('lib/adminLists.ts');
const records = [
  { id: 1, name: 'Kovács Éva', email: 'eva@example.invalid', phone: '+36 (30) 123-4567', status: null, created_at: '2026-10-01' },
  { id: 2, name: 'Nagy Ádám', email: 'adam@example.invalid', phone: '+36 20 000 0000', status: 'processed', created_at: '2026-11-01' },
  { id: 3, name: 'Tóth Éva', status: 'new', created_at: null },
];
const options = { query: '', status: 'all', oldestFirst: false };
const fields = ['name', 'email', 'phone'];

test('admin search finds accented names and differently formatted phones without losing the status filter', () => {
  assert.equal(filterAdminRecords(records, { ...options, query: 'kovacs eva' }, fields)[0].id, 1);
  assert.equal(filterAdminRecords(records, { ...options, query: '30 1234567' }, fields)[0].id, 1);
  assert.equal(filterAdminRecords(records, { ...options, query: 'EVA@EXAMPLE.INVALID' }, fields)[0].id, 1);
  assert.equal(filterAdminRecords(records, { ...options, query: 'éva', status: 'processed' }, fields).length, 0);
  assert.equal(filterAdminRecords(records, { ...options, query: 'éva', status: 'new' }, fields).length, 2);
});

test('sorting and filtering preserve original records, include old records without a status, and support empty results', () => {
  const before = JSON.stringify(records);
  assert.deepEqual(Array.from(filterAdminRecords(records, options, fields), item => item.id), [2, 1, 3]);
  assert.deepEqual(Array.from(filterAdminRecords(records, { ...options, oldestFirst: true }, fields), item => item.id), [3, 1, 2]);
  assert.equal(filterAdminRecords(records, { ...options, query: 'nincs-ilyen-páciens' }, fields).length, 0);
  assert.equal(JSON.stringify(records), before);
});

test('retired Hídfutás admin rejects every operation without reading or modifying stored contacts', async () => {
  const routes = load('app/api/admin/hidfutas/route.ts', {
    '@/lib/staffAuth': { authorizeStaff: async () => ({ context: { db: new Proxy({}, { get() { throw new Error('Historical data must not be accessed'); } }) } }), requireStaffOrigin: () => null },
    '@/lib/serverSecurity': { noStoreJson: (body, init) => next.NextResponse.json(body, init) },
  });
  for (const action of ['draw', 'redeem', 'send_winner_email', 'sync_marketing']) {
    const response = await routes.POST(new Request('https://admin.crowndental.hu/api/admin/hidfutas', { method: 'POST', body: JSON.stringify({ action }) }));
    assert.equal(response.status, 410);
  }
  assert.equal((await routes.GET(new Request('https://admin.crowndental.hu/api/admin/hidfutas'))).status, 410);
});
