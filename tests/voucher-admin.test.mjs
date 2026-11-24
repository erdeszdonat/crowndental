import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(
    new URL('../app/api/admin/utalvanyok/route.ts', import.meta.url),
    'utf8',
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const id = '00000000-0000-4000-8000-000000000001';
const code = 'ABCDEFGHJKLMNPQRSTUV';

function route(role, rows = []) {
  const queries = [];
  const db = {
    from(table) {
      assert.equal(table, 'voucher_orders');
      const query = { fields: '', filters: [] };
      queries.push(query);
      return {
        select(fields) {
          query.fields = fields;
          return this;
        },
        eq(column, value) {
          query.filters.push([column, 'eq', value]);
          return this;
        },
        not(column, op, value) {
          query.filters.push([column, 'not.' + op, value]);
          return this;
        },
        order() {
          return this;
        },
        range(from, to) {
          query.range = [from, to];
          return { data: rows, error: null };
        },
        maybeSingle() {
          return { data: rows[0] ?? null, error: null };
        },
      };
    },
  };
  const modules = {
    '@/lib/staffAuth': {
      authorizeStaff: async () => ({ context: { role, id: 'staff-fixture' } }),
      requireStaffOrigin: () => null,
      staffServiceClient: () => db,
    },
    '@/lib/serverSecurity': {
      noStoreJson: (body, init) => Response.json(body, init),
    },
    '@/lib/vouchers/service': {},
    '@/prototypes/karacsonyi-utalvanyok/voucher': {
      default: { day: () => '2026-11-24' },
    },
  };
  const loaded = { exports: {} };
  vm.runInNewContext(source, {
    module: loaded,
    exports: loaded.exports,
    require: (name) => modules[name],
  });
  return {
    queries,
    post: (action, fields = {}) =>
      loaded.exports.POST(
        new Request('https://admin.example.invalid/api/admin/utalvanyok', {
          method: 'POST',
          body: JSON.stringify({ action, ...fields }),
        }),
      ),
  };
}

test('admin list pairs buyers with recipients, handles historical billing names and paginates without exposing codes', async () => {
  const rows = [
    {
      name: 'Magán vevő',
      buyer_email: 'buyer@example.invalid',
      recipient_name: 'Másik név',
    },
    { name: 'Régi név', individual_name: 'Számlázási név' },
    {
      name: 'Kapcsolattartó',
      individual_name: 'Kapcsolattartó',
      business_name: 'Minta Kft.',
    },
    ...Array.from({ length: 28 }, () => ({})),
  ];
  const api = route('admin', rows);
  const response = await api.post('list', { page: 1 });
  assert.equal(response.status, 200);
  const { orders, hasMore } = await response.json();
  assert.equal(orders.length, 30);
  assert.equal(hasMore, true);
  assert.deepEqual(orders[0], {
    buyer_name: 'Magán vevő',
    buyer_email: 'buyer@example.invalid',
    recipient_name: 'Másik név',
  });
  assert.equal(orders[1].buyer_name, 'Számlázási név');
  assert.equal(orders[2].buyer_name, 'Minta Kft.');
  assert.equal(orders[3].buyer_name, null);
  assert.deepEqual(api.queries[0].range, [30, 60]);
  assert.deepEqual(api.queries[0].filters, [['payment_id', 'not.is', null]]);
  assert.match(api.queries[0].fields, /buyer_email:billing->>email/);
  assert.doesNotMatch(api.queries[0].fields, /\*|\bcode\b|address|tax_ids/);
  assert.equal(
    (await (await route('admin', rows.slice(0, 30)).post('list')).json())
      .hasMore,
    false,
  );
});

test('code reveal reads just the selected paid order and handles a missing or unissued code', async () => {
  const api = route('admin', [{ code }]);
  assert.deepEqual(await (await api.post('show_code', { id })).json(), {
    code,
  });
  assert.equal(api.queries[0].fields, 'code');
  assert.deepEqual(api.queries[0].filters, [
    ['id', 'eq', id],
    ['payment_id', 'not.is', null],
  ]);
  assert.equal((await route('admin').post('show_code', { id })).status, 404);
  assert.deepEqual(
    await (
      await route('admin', [{ code: null }]).post('show_code', { id })
    ).json(),
    { code: null },
  );
  assert.equal((await api.post('show_code', { id: 'invalid' })).status, 400);
  assert.equal(api.queries.length, 1);
});

test('assistants can check the printed code but cannot list buyers or reveal a code by order ID', async () => {
  const api = route('assistant', [
    {
      id,
      code,
      amount: 30000,
      expiry: '2027-11-24',
      billing: { name: 'Privát' },
    },
  ]);
  for (const action of ['list', 'show_code'])
    assert.equal((await api.post(action, { id })).status, 403);
  assert.equal(api.queries.length, 0);
  const response = await api.post('lookup', {
    code: 'ABCDE-FGHJK-LMNPQ-RSTUV',
  });
  assert.deepEqual(await response.json(), {
    amount: 30000,
    expiry: '2027-11-24',
    usable: true,
  });
  assert.deepEqual(api.queries[0].filters, [['code', 'eq', code]]);
});
