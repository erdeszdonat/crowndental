import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compiled = new Map();
function load(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) compiled.set(file, ts.transpileModule(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
  const module = { exports: {} };
  vm.runInNewContext(compiled.get(file), { module, exports: module.exports, require: n => { if (!(n in imports)) throw Error(n); return imports[n]; }, Request, Response, URL, AbortSignal, Date, console: { error() {} }, process: { env: { RESEND_API_KEY: 'test-key' } }, setTimeout: fn => fn(), ...globals });
  return module.exports;
}
const clinics = load('lib/appointmentClinics.ts');
const builder = load('lib/appointmentReminder.ts', { './appointmentClinics': clinics });
const snapshot = { name: 'Teszt Páciens <script>', email: 'fixture@example.invalid', locale: 'hu', treatment: 'Fogszabályozás', dateTime: '2026.11.14. 10:30', clinicId: 'primas-sziget', includeImagingNotice: false };

test('personalized reminders use the chosen clinic, both contact numbers and escaped full names in all locales', () => {
  for (const locale of ['hu','en','de','sk']) for (const clinicId of ['primas-sziget','belvaros']) {
    const payload = builder.buildAppointmentReminder({ ...snapshot, locale, clinicId });
    assert.ok(payload.html.includes('Teszt Páciens &lt;script&gt;'));
    assert.ok(payload.text.includes('2026.11.14. 10:30'));
    assert.ok(payload.html.includes('href="tel:' + clinics.getAppointmentClinic(clinicId).phone + '"'));
    assert.ok(payload.text.indexOf(clinics.getAppointmentClinic(clinicId).phoneLabel) < payload.text.indexOf(clinics.getAppointmentContacts(clinicId)[1].phoneLabel));
    assert.doesNotMatch(payload.text, /CBCT/);
  }
  assert.match(builder.buildAppointmentReminder({ ...snapshot, includeImagingNotice: true }).text, /CBCT/);
});

function worker({ authorized = true, authError = null, mailStatus = 200, networkError = false, saveError = false, missingKey = false } = {}) {
  let claimed = false; const calls = []; const emails = [];
  const api = load('app/api/appointment-reminders/route.ts', {
    '@/lib/appointmentReminder': builder,
    '@/lib/staffAuth': { staffServiceClient: () => ({ rpc: async (name, args) => {
      calls.push({ name, args });
      if (name === 'crown_reminder_authorized') return { data: authorized, error: authError };
      if (name === 'claim_appointment_reminder') { if (claimed) return { data: null }; claimed = true; return { data: { id: 'fixture-job', token: 'lease', snapshot } }; }
      if (name === 'finish_appointment_reminder') return { data: !saveError, error: saveError ? {} : null };
      throw Error(name);
    } }) },
  }, { process: { env: missingKey ? {} : { RESEND_API_KEY: 'test-key' } }, fetch: async (url, options) => { emails.push({ url, options }); if (networkError) throw Error('network'); return Response.json(mailStatus === 200 ? { id: 'provider-fixture' } : { error: 'failure' }, { status: mailStatus }); } });
  const run = (authorization = 'Bearer ' + 'a'.repeat(64), query = '') => api.POST(new Request('https://www.crowndental.hu/api/appointment-reminders' + query, { method: 'POST', headers: authorization ? { authorization } : {} }));
  return { calls, emails, run };
}

test('scheduler auth and readiness checks never send email or claim appointments', async () => {
  const noToken = worker(); assert.equal((await noToken.run('')).status, 401); assert.equal(noToken.calls.length, 0);
  for (const options of [{ authorized: false }, { authError: {} }, { missingKey: true }]) {
    const w = worker(options); assert.ok((await w.run()).status >= 400); assert.equal(w.emails.length, 0); assert.equal(w.calls.filter(c => c.name === 'claim_appointment_reminder').length, 0);
  }
  const ready = worker(); assert.equal((await ready.run(undefined, '?check=1')).status, 200); assert.equal(ready.emails.length, 0);
});

test('successful worker records provider acceptance and stable per-job idempotency', async () => {
  const w = worker(); const response = await w.run(); assert.equal(response.status, 200); assert.deepEqual(await response.json(), { sent: 1, failed: 0 });
  assert.equal(w.emails[0].options.headers['Idempotency-Key'], 'crown-appointment-reminder-v1-fixture-job');
  const acknowledgement = w.calls.find(c => c.name === 'finish_appointment_reminder').args;
  assert.equal(acknowledgement.provider_message_id, 'provider-fixture'); assert.equal(acknowledgement.token, 'lease');
});

test('provider failure is not marked sent; an acknowledgement failure is surfaced for safe retry', async () => {
  for (const options of [{ mailStatus: 429 }, { networkError: true }]) {
    const w = worker(options); assert.equal((await w.run()).status, 503);
    const ack = w.calls.find(c => c.name === 'finish_appointment_reminder').args;
    assert.equal(ack.provider_message_id, null); assert.ok(ack.error_code);
  }
  const w = worker({ saveError: true }); assert.equal((await w.run()).status, 503); assert.equal(w.emails.length, 1);
});
