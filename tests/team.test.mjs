import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const next = require('next/server');
function load(path, imports = {}, globals = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, Uint8Array, Buffer, URL, File, ...globals, require(name) { if (!(name in imports)) throw new Error('Unexpected dependency ' + name); return imports[name]; } });
  return module.exports;
}
const team = load('../lib/team.ts');
const origin = 'https://admin.crowndental.hu';
const photo = { _type: 'image', asset: { _type: 'reference', _ref: 'image-' + 'a'.repeat(40) + '-800x1000-webp' } };
const input = { name: 'Teszt Kolléga', role: 'dentist', title: { hu: 'Fogorvos' }, bio: { hu: 'Első bekezdés.\n\nMásodik bekezdés.' }, isVisible: false, displayOrder: 0, photo };
function setup({ forbidden = false, rateLimited = false, current = null, conflict = false, providerFails = false } = {}) {
  const events = [];
  const reply = (body, init) => next.NextResponse.json(body, init);
  const client = {
    async fetch() { events.push('list'); return current ? [current] : []; },
    async getDocument(id) { events.push(['read', id]); return current; },
    async create(doc, options) { events.push(['create', doc, options]); if (providerFails) throw new Error('provider'); if (conflict) throw { statusCode: 409 }; return { ...doc, _rev: 'new-rev' }; },
    patch(id) { let fields; return { ifRevisionId(rev) { events.push(['revision', id, rev]); return this; }, set(value) { fields = value; return this; }, unset(paths) { events.push(['unset', paths]); return this; }, async commit(options) { events.push(['patch', fields, options]); if (providerFails) throw new Error('provider'); if (conflict) throw { statusCode: 409 }; return { ...current, ...fields, _rev: 'new-rev' }; } }; },
    assets: { async upload(type, bytes, options) { events.push(['upload', type, bytes.length, options]); return { _id: photo.asset._ref, url: 'https://cdn.sanity.io/images/fixture/production/photo.webp' }; } },
  };
  const imports = {
    'node:crypto': { randomUUID: () => '10000000-0000-4000-8000-000000000001' },
    'next/cache': { revalidateTag: (...args) => events.push(['tag', ...args]), revalidatePath: path => events.push(['path', path]) },
    '@/lib/staffAuth': { authorizeStaff: async () => forbidden ? { error: reply({}, { status: 403 }) } : { context: { id: 'admin-id' } }, requireStaffOrigin: request => request.headers.get('origin') === origin ? null : reply({}, { status: 403 }) },
    '@/lib/serverSecurity': { noStoreJson: reply, enforceRateLimit: async () => rateLimited ? reply({}, { status: 429 }) : null },
    '@/lib/team': team,
    '@/lib/teamServer': { TEAM_CACHE_TAG: 'crown-team', TEAM_PROJECTION: '{}', teamClient: write => { assert.equal(write, true); return client; }, withTeamPhoto: value => value },
  };
  const route = load('../app/api/admin/team/route.ts', imports);
  const upload = load('../app/api/admin/team/photo/route.ts', imports);
  return { events, get: () => route.GET(new Request(origin + '/api/admin/team')), post: (body = input, requestOrigin = origin) => route.POST(new Request(origin + '/api/admin/team', { method: 'POST', headers: { origin: requestOrigin, 'content-type': 'application/json' }, body: JSON.stringify(body) })), photo: (file, requestOrigin = origin) => { const form = new FormData(); form.set('photo', file); return upload.POST(new Request(origin + '/api/admin/team/photo', { method: 'POST', headers: { origin: requestOrigin }, body: form })); } };
}
test('team content validates categories, lengths, visibility, ordering and image references', () => {
  for (const overrides of [{ name: '' }, { role: 'admin' }, { isVisible: 'true' }, { displayOrder: -1 }, { displayOrder: 1.2 }, { bio: { hu: 'x'.repeat(5001) } }, { photo: { asset: { _ref: 'file-sensitive-pdf' } } }, { photo: null, isVisible: true }]) assert.throws(() => team.validateTeamInput({ ...input, ...overrides }));
  assert.equal(team.validateTeamInput({ ...input, photo: null }).photo, undefined);
  assert.equal(team.validateTeamInput(input).bio.hu, input.bio.hu);
  assert.equal(team.localizedTeamText({ hu: 'Magyar', de: 'Deutsch' }, 'de'), 'Deutsch');
  assert.equal(team.localizedTeamText({ hu: 'Magyar' }, 'en'), 'Magyar');
  for (const id of ['drafts.someone', 'versions.release.someone', '../document', '*', '']) assert.equal(team.validTeamId(id), false);
});
test('admin, MFA authorization, same origin and rate limit precede all team mutations', async () => {
  for (const config of [{ forbidden: true }, { rateLimited: true }]) {
    const e = setup(config); assert.equal((await e.post()).status, config.forbidden ? 403 : 429); assert.equal(e.events.length, 0);
    assert.equal((await e.photo(new File(['fake'], 'photo.png', { type: 'image/png' }))).status, config.forbidden ? 403 : 429); assert.equal(e.events.length, 0);
  }
  const e = setup(); assert.equal((await e.post(input, 'https://evil.invalid')).status, 403); assert.equal(e.events.length, 0);
  assert.equal((await setup({ forbidden: true }).get()).status, 403);
});
test('new profiles use a server ID and only validated fields; successful saves invalidate localized pages', async () => {
  const e = setup(); const response = await e.post({ ...input, _type: 'post', arbitrary: 'ignored' }); assert.equal(response.status, 200);
  const created = e.events.find(event => event[0] === 'create');
  assert.equal(created[1]._type, 'crownTeamMember'); assert.equal(created[1]._id, 'crownTeam.10000000-0000-4000-8000-000000000001'); assert.equal(created[1].arbitrary, undefined); assert.equal(created[2].visibility, 'sync');
  assert.equal(e.events.filter(event => event[0] === 'tag').length, 1); assert.equal(e.events.filter(event => event[0] === 'path').length, 4);
});
test('professional lead is a singleton and other content types cannot be overwritten', async () => {
  const e = setup(); assert.equal((await e.post({ ...input, role: 'professional_lead' })).status, 200); assert.equal(e.events.find(event => event[0] === 'create')[1]._id, team.TEAM_LEAD_ID);
  const other = setup({ current: { _id: 'another', _type: 'post', _rev: 'old' } }); assert.equal((await other.post({ ...input, _id: 'another', _rev: 'old' })).status, 404); assert.equal(other.events.some(event => event[0] === 'patch'), false);
  assert.equal((await setup().post({ ...input, _id: 'another', _rev: 'old', role: 'professional_lead' })).status, 409);
  assert.equal((await setup().post({ ...input, _id: team.TEAM_LEAD_ID, _rev: 'old' })).status, 409);
  assert.equal((await setup().post({ ...input, _id: 'drafts.another', _rev: 'old' })).status, 400);
});
test('updates retain optimistic revision checks; conflicts and provider failures do not invalidate good cached content', async () => {
  const current = { ...input, _id: 'regular-studio-id', _type: 'crownTeamMember', _rev: 'old' };
  const e = setup({ current }); assert.equal((await e.post({ ...current, photo: null })).status, 200); assert.deepEqual(e.events.find(event => event[0] === 'revision'), ['revision', current._id, 'old']); assert.equal(e.events.some(event => event[0] === 'unset'), true);
  for (const [config, status] of [[{ conflict: true }, 409], [{ providerFails: true }, 503]]) { const failed = setup({ current, ...config }); assert.equal((await failed.post(current)).status, status); assert.equal(failed.events.some(event => event[0] === 'tag'), false); }
});
test('image upload verifies actual file signatures and sizes before the provider receives bytes', async () => {
  const e = setup();
  for (const file of [new File(['<svg>'], 'picture.svg', { type: 'image/svg+xml' }), new File(['<script>'], 'picture.png', { type: 'image/png' }), new File([new Uint8Array(3_000_001)], 'large.png', { type: 'image/png' })]) assert.equal((await e.photo(file)).status, 400);
  assert.equal(e.events.length, 0);
  const png = new File([Uint8Array.from([137,80,78,71,13,10,26,10,0])], 'photo.png', { type: 'image/png' });
  assert.equal((await e.photo(png)).status, 200); assert.equal(e.events.filter(event => event[0] === 'upload').length, 1);
});
test('public fetch includes only visible valid roles and the designated lead, with tagged revalidation', async () => {
  const members = [ { ...input, _id: 'visible', _type: 'crownTeamMember', isVisible: true }, { ...input, _id: 'hidden' }, { ...input, _id: 'unknown-role', role: 'owner', isVisible: true }, { ...input, _id: 'wrong-lead', role: 'professional_lead', isVisible: true }, { ...input, _type: 'crownTeamMember', _id: team.TEAM_LEAD_ID, role: 'professional_lead', isVisible: true } ];
  let requested;
  const server = load('../lib/teamServer.ts', { 'server-only': {}, '@sanity/client': {}, '@sanity/image-url': { default: () => ({ image: () => { const builder = { width: () => builder, height: () => builder, fit: () => builder, auto: () => builder, url: () => 'https://cdn.sanity.io/photo.webp' }; return builder; } }) }, '@/sanity/env': { projectId: 'fixture', dataset: 'production', apiVersion: '2024-03-10' }, './team': team }, { process: { env: {} }, fetch: async (url, options) => { requested = { url, options }; return { ok: true, json: async () => ({ result: members }) }; } });
  assert.deepEqual(Array.from(await server.getPublicTeam(), member => member._id), ['visible', team.TEAM_LEAD_ID]);
  assert.equal(requested.options.next.revalidate, 300); assert.equal(requested.options.next.tags[0], 'crown-team'); assert.match(requested.url.searchParams.get('query'), /isVisible == true/); assert.match(requested.url.searchParams.get('query'), /drafts/);
});

test('production ignores the development provider; development accepts only bare HTTP loopback origins', () => {
  const clientFor = env => load('../lib/teamServer.ts', { 'server-only': {}, '@sanity/client': { createClient: options => options }, '@sanity/image-url': {}, '@/sanity/env': { projectId: 'fixture', dataset: 'production', apiVersion: '2024-03-10' }, './team': team }, { process: { env: { SANITY_WRITE_TOKEN: 'fixture-only', ...env } } }).teamClient(true);
  assert.equal(clientFor({ NODE_ENV: 'production', CROWN_TEAM_DEV_API_ORIGIN: 'https://attacker.invalid' }).apiHost, undefined);
  assert.equal(clientFor({ NODE_ENV: 'development', CROWN_TEAM_DEV_API_ORIGIN: 'http://127.0.0.1:3060' }).apiHost, 'http://127.0.0.1:3060');
  for (const origin of ['http://attacker.invalid', 'https://localhost', 'http://localhost/private', 'http://user:pass@localhost', 'http://localhost?query=value']) assert.throws(() => clientFor({ NODE_ENV: 'development', CROWN_TEAM_DEV_API_ORIGIN: origin }));
});

test('server reads authenticate dotted admin profile IDs while retaining the visible-only query and cache', async () => {
  for (const env of [{ SANITY_WRITE_TOKEN: 'fixture-write' }, { SANITY_WRITE_TOKEN: 'fixture-write', SANITY_READ_TOKEN: 'fixture-read' }]) {
    let request;
    const member = { ...input, _id: 'crownTeam.fixture-admin-profile', _type: 'crownTeamMember', isVisible: true };
    const server = load('../lib/teamServer.ts', { 'server-only': {}, '@sanity/client': {}, '@sanity/image-url': { default: () => ({ image: () => { const builder = { width: () => builder, height: () => builder, fit: () => builder, auto: () => builder, url: () => 'https://cdn.sanity.io/photo.webp' }; return builder; } }) }, '@/sanity/env': { projectId: 'fixture', dataset: 'production', apiVersion: '2024-03-10' }, './team': team }, { process: { env }, fetch: async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ result: options.headers?.Authorization ? [member] : [] }) }; } });
    const result = await server.getPublicTeam();
    assert.equal(result.length, 1);
    assert.equal(result[0]._id, member._id);
    assert.equal(request.options.headers.Authorization, 'Bearer '+(env.SANITY_READ_TOKEN || env.SANITY_WRITE_TOKEN));
    assert.equal(request.options.cache, 'force-cache');
    assert.equal(request.options.next.revalidate, 300);
    assert.match(request.url.searchParams.get('query'), /isVisible == true/);
    assert.match(request.url.searchParams.get('query'), /drafts/);
    assert.ok(!JSON.stringify(result).includes('fixture-write'));
    assert.ok(!JSON.stringify(result).includes('fixture-read'));
  }
});
