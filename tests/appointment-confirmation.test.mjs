import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const compiled = new Map();

function load(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) {
    compiled.set(file, ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText);
  }
  const testModule = { exports: {} };
  vm.runInNewContext(compiled.get(file), {
    module: testModule, exports: testModule.exports, Request, Response, Date, URL,
    console: { error() {} }, process: { env: {} }, ...globals,
    require(name) {
      if (!(name in imports)) throw new Error(`Unmocked dependency: ${name}`);
      return imports[name];
    },
  }, { filename: file });
  return testModule.exports;
}

const normalizeLocale = value => ['hu', 'en', 'sk', 'de'].includes(value) ? value : 'hu';

function environment({ appointment = {}, readError = null, missing = false, mailStatus = 200, mailBody = { id: 'test-email-id' }, networkError = false, authError = false, originError = false, finalSaveError = null, beforeMailResponse } = {}) {
  const reads = [];
  const updates = [];
  const mutations = [];
  const emails = [];
  const guards = [];
  const fixture = {
    id: 'test-appointment-id', name: 'Test Patient', nickname: 'Test', email: 'patient@example.invalid', phone: '+36301234567',
    city: 'Esztergom', status: 'new', treatment: 'Általános konzultáció', locale: 'hu',
    confirmed_clinic_id: null, confirmed_appointment_local: null,
    confirmation_email_idempotency_key: null, confirmation_sending_token: null, confirmation_sending_started_at: null, ...appointment,
  };
  const json = (body, options) => Response.json(body, options);
  const clinics = load('lib/appointmentClinics.ts', { '@/lib/serverSecurity': { normalizeLocale } });
  const api = load('app/api/admin-action/route.ts', {
    'next/server': { NextResponse: { json } },
    'node:crypto': { createHash, randomUUID },
    '@supabase/supabase-js': {
      createClient: () => ({
        from(table) {
          return {
            select(columns) {
              return {
                eq(column, value) {
                  reads.push({ table, columns, column, value });
                  return { maybeSingle: async () => ({ data: missing ? null : { ...fixture }, error: readError }) };
                },
              };
            },
            update(payload) {
              const conditions = [];
              let executed;
              const execute = () => {
                if (executed) return executed;
                const mutation = { table, payload: JSON.parse(JSON.stringify(payload)), conditions };
                mutations.push(mutation);
                const matches = !missing && conditions.every(condition => {
                  if (condition.kind === 'eq') return fixture[condition.column] === condition.value;
                  if (condition.kind === 'is') return fixture[condition.column] == null && condition.value === null;
                  const parts = condition.filter.split(',');
                  assert.equal(parts[0], 'confirmation_sending_started_at.is.null');
                  assert.ok(parts[1].startsWith('confirmation_sending_started_at.lt.'));
                  const cutoff = parts[1].slice('confirmation_sending_started_at.lt.'.length);
                  return fixture.confirmation_sending_started_at == null || Date.parse(fixture.confirmation_sending_started_at) < Date.parse(cutoff);
                });
                if (!matches) return (executed = { data: null, error: null });
                if (finalSaveError && payload.status === 'processed') return (executed = { data: null, error: finalSaveError });
                Object.assign(fixture, payload);
                if ('status' in payload) updates.push(mutation);
                return (executed = { data: { id: fixture.id }, error: null });
              };
              const query = {
                eq(column, value) { conditions.push({ kind: 'eq', column, value }); return query; },
                is(column, value) { conditions.push({ kind: 'is', column, value }); return query; },
                or(filter) { conditions.push({ kind: 'or', filter }); return query; },
                select(columns) { assert.equal(columns, 'id'); return query; },
                maybeSingle: async () => execute(),
                then: (resolve, reject) => Promise.resolve().then(execute).then(resolve, reject),
              };
              return query;
            },
          };
        },
      }),
    },
    '@/lib/names': { getPreferredGreetingName: (name, nickname) => nickname || name },
    '@/lib/appointmentClinics': clinics,
    '@/lib/adminAuth': {
      requireAdminSession: () => { guards.push('auth'); return authError ? json({ error: 'unauthorized' }, { status: 401 }) : null; },
    },
    '@/lib/serverSecurity': {
      normalizeLocale, noStoreJson: json,
      rejectUntrustedMutation: () => { guards.push('origin'); return originError ? json({ error: 'untrusted origin' }, { status: 403 }) : null; },
    },
  }, {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only-service-key', RESEND_API_KEY: 'test-only-mail-key' } },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      emails.push({ payload: JSON.parse(options.body), idempotencyKey: new Headers(options.headers).get('Idempotency-Key') });
      if (beforeMailResponse) await beforeMailResponse(fixture);
      if (networkError) throw new Error('Test network failure');
      return Response.json(mailBody, { status: mailStatus });
    },
  });
  const valid = {
    action: 'update_status', table: 'appointments', id: 'test-appointment-id', value: 'processed',
    appointmentDateTime: '2026-11-03T14:30', appointmentClinicId: 'primas-sziget',
  };
  return {
    reads, updates, mutations, emails, guards, state: fixture,
    submit: (changes = {}) => api.POST(new Request('https://www.crowndental.hu/api/admin-action', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...valid, ...changes }),
    })),
  };
}

function decodeHtml(text) {
  return text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function visibleText(html) {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
}

function calendarLinks(html) {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => decodeHtml(match[1]));
  return {
    google: new URL(hrefs.find(href => href.startsWith('https://calendar.google.com/'))),
    ics: new URL(hrefs.find(href => href.includes('/api/calendar/appointment.ics?'))),
  };
}

function assertOrthodonticPreparation(html, { locale, treatment }) {
  const requirements = {
    hu: [/nincs CBCT/i, /vagy.*1 hónapnál régebbi/i, /teleröntgen/i, /nyitvatart/i, /időpont.*előtt/i],
    en: [/(?:do not|don't|no|without).*CBCT/i, /or.*(?:1|one) month.*old|or.*older than (?:1|one) month/i, /cephalometric/i, /opening hours/i, /before.*appointment/i],
    de: [/keine.*CBCT/i, /oder.*älter als (?:1|einen) Monat/i, /Fernröntgen/i, /Öffnungszeiten/i, /vor.*Termin/i],
    sk: [/nemáte.*CBCT/i, /alebo.*starši[aeí].*(?:1|jeden) mesiac/i, /tele[-\s]?RTG|teleröntgen|cefalometr/i, /otváracích hodín/i, /pred.*termín/i],
  };
  const links = calendarLinks(html);
  const copies = [
    ['email', visibleText(html)],
    ['Google Calendar', links.google.searchParams.get('details')],
    ['ICS', links.ics.searchParams.get('details')],
  ];
  for (const [surface, text] of copies) {
    const message = `${treatment}: ${surface}`;
    assert.match(text, /\bCBCT\b/, message);
    for (const requirement of requirements[locale]) assert.match(text, requirement, message);
    assert.ok(text.includes('Crown Dental Belváros'), message);
    assert.ok(text.includes('Petőfi Sándor utca 11'), message);
  }
  for (const url of Object.values(links)) {
    assert.ok(url.searchParams.get('location').includes('Crown Dental Prímás Sziget'));
    assert.ok(url.searchParams.get('location').includes('Helischer József út 6'));
  }
}

test('confirming any appointment requires an explicit recognized clinic, including processed legacy records', async () => {
  for (const status of ['new', 'processed']) {
    for (const appointmentClinicId of [undefined, null, '', 'unknown', 'Belváros', 'PRIMAS-SZIGET', 1, {}]) {
      const env = environment({ appointment: { status } });
      assert.equal((await env.submit({ appointmentClinicId })).status, 400, `${status}: ${JSON.stringify(appointmentClinicId)}`);
      assert.equal(env.emails.length, 0);
      assert.equal(env.updates.length, 0);
      assert.equal(env.mutations.length, 0);
    }
  }
});

test('a clinic selection cannot bypass exact appointment date validation', async () => {
  for (const appointmentDateTime of [undefined, '', '2026-02-30T14:30', '2026-11-03T24:00', '2026-11-03', 'not-a-date']) {
    const env = environment();
    assert.equal((await env.submit({ appointmentDateTime })).status, 400);
    assert.equal(env.emails.length, 0);
    assert.equal(env.updates.length, 0);
    assert.equal(env.mutations.length, 0);
  }
});

test('the chosen clinic is saved and used consistently in email, Google Calendar and ICS, regardless of requested city', async () => {
  for (const clinic of [
    { id: 'belvaros', name: 'Crown Dental Belváros', street: 'Petőfi Sándor utca 11' },
    { id: 'primas-sziget', name: 'Crown Dental Prímás Sziget', street: 'Helischer József út 6' },
  ]) {
    const env = environment({ appointment: { city: 'Budapest', treatment: 'Fogkőeltávolítás' } });
    const response = await env.submit({ appointmentClinicId: clinic.id });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.appointmentConfirmationEmailSent, true);
    assert.equal(result.appointmentConfirmationClinicId, clinic.id);
    assert.equal(result.appointmentConfirmationDateTime, '2026.11.03. 14:30');
    assert.equal(env.emails.length, 1);
    assert.equal(env.updates.length, 1);
    const saved = env.updates[0].payload;
    assert.equal(saved.status, 'processed');
    assert.equal(saved.confirmed_clinic_id, clinic.id);
    assert.equal(saved.confirmed_appointment_local, '2026.11.03. 14:30');
    assert.equal(saved.confirmation_email_idempotency_key, env.emails[0].idempotencyKey);
    assert.ok(Date.parse(saved.confirmation_email_sent_at));
    assert.equal(env.state.confirmation_sending_token, null);
    assert.equal(env.state.confirmation_sending_started_at, null);

    const { html } = env.emails[0].payload;
    assert.ok(visibleText(html).includes(clinic.name));
    assert.ok(visibleText(html).includes(clinic.street));
    assert.equal(visibleText(html).includes('Királyok útja'), false);
    const { google, ics } = calendarLinks(html);
    assert.equal(google.searchParams.get('location'), ics.searchParams.get('location'));
    for (const url of [google, ics]) {
      const location = url.searchParams.get('location');
      assert.ok(location.includes(clinic.name));
      assert.ok(location.includes(clinic.street));
      assert.ok(location.includes('Esztergom'));
    }
    assert.equal(google.searchParams.get('ctz'), 'Europe/Budapest');
    assert.equal(google.searchParams.get('dates'), '20261103T143000/20261103T153000');
    assert.equal(ics.searchParams.get('start'), '20261103T143000');
    assert.equal(ics.searchParams.get('end'), '20261103T153000');
  }
});

test('mail retries are stable for the same appointment and clinic, but a different clinic changes the idempotency key', async () => {
  const keys = [];
  for (const appointmentClinicId of ['belvaros', 'belvaros', 'primas-sziget']) {
    const env = environment();
    assert.equal((await env.submit({ appointmentClinicId })).status, 200);
    keys.push(env.emails[0].idempotencyKey);
  }
  assert.ok(keys[0]);
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[0], keys[2]);
});

test('general consultations at Prímás Sziget explain the earlier Belváros X-ray or CT visit in all four languages', async () => {
  const fixtures = [
    { locale: 'hu', treatment: 'Állapotfelmérés és Konzultáció', imaging: /röntgen/i },
    { locale: 'en', treatment: 'Assessment & Consultation', imaging: /X-ray/i },
    { locale: 'de', treatment: 'Beurteilung und Beratung', imaging: /Röntgen/i },
    { locale: 'sk', treatment: 'Vyšetrenie a konzultácia', imaging: /RTG|röntgen/i },
  ];
  for (const fixture of fixtures) {
    const env = environment({ appointment: fixture });
    assert.equal((await env.submit()).status, 200);
    const text = visibleText(env.emails[0].payload.html);
    assert.match(text, fixture.imaging, fixture.locale);
    assert.match(text, /\bCT\b/, fixture.locale);
    assert.ok(text.includes('Crown Dental Belváros'), fixture.locale);
    assert.ok(text.includes('Petőfi Sándor utca 11'), fixture.locale);
    assert.ok(text.includes('Crown Dental Prímás Sziget'), fixture.locale);
    assert.doesNotMatch(text, /CBCT|teleröntgen|cephalometric|Fernröntgen|tele[-\s]?RTG/i, fixture.locale);
  }
});

test('orthodontic consultations explain the missing or older-than-one-month CBCT condition and the earlier cephalometric X-ray visit', async () => {
  for (const fixture of [
    { locale: 'hu', treatment: 'Fogszabályozási konzultáció' },
    { locale: 'hu', treatment: 'Fogszabályozás konzultáció' },
    { locale: 'hu', treatment: 'fogszabi konzultacio' },
    { locale: 'en', treatment: 'Orthodontic consultation' },
    { locale: 'en', treatment: 'Orthodontics Consultation' },
    { locale: 'de', treatment: 'Kieferorthopädische Beratung' },
    { locale: 'sk', treatment: 'Ortodontická konzultácia' },
  ]) {
    const env = environment({ appointment: fixture });
    assert.equal((await env.submit()).status, 200);
    assertOrthodonticPreparation(env.emails[0].payload.html, fixture);
  }
});

test('standalone orthodontic booking labels receive the same conditional preparation instructions in all four languages', async () => {
  for (const fixture of [
    { locale: 'hu', treatment: 'Fogszabályozás' },
    { locale: 'hu', treatment: 'Fogszabalyozas' },
    { locale: 'en', treatment: 'Orthodontics' },
    { locale: 'de', treatment: 'Kieferorthopädie' },
    { locale: 'sk', treatment: 'Ortodontia' },
  ]) {
    const env = environment({ appointment: fixture });
    assert.equal((await env.submit()).status, 200);
    assertOrthodonticPreparation(env.emails[0].payload.html, fixture);
  }
});

test('Belváros appointments, orthodontic follow-ups and unrelated treatments receive no Prímás Sziget imaging instructions', async () => {
  for (const fixture of [
    { clinic: 'belvaros', locale: 'hu', treatment: 'Fogszabályozás' },
    { clinic: 'belvaros', locale: 'en', treatment: 'Orthodontics' },
    { clinic: 'belvaros', locale: 'de', treatment: 'Kieferorthopädie' },
    { clinic: 'belvaros', locale: 'sk', treatment: 'Ortodontia' },
    { clinic: 'belvaros', locale: 'hu', treatment: 'Fogszabályozási konzultáció' },
    { clinic: 'belvaros', locale: 'en', treatment: 'General consultation' },
    { clinic: 'belvaros', locale: 'de', treatment: 'Kieferorthopädische Beratung' },
    { clinic: 'belvaros', locale: 'sk', treatment: 'Ortodontická konzultácia' },
    { clinic: 'primas-sziget', locale: 'hu', treatment: 'Fogkőeltávolítás' },
    { clinic: 'primas-sziget', locale: 'hu', treatment: 'Fogszabályozás kontroll' },
    { clinic: 'primas-sziget', locale: 'en', treatment: 'Orthodontics follow-up' },
    { clinic: 'primas-sziget', locale: 'de', treatment: 'Kieferorthopädie Kontrolle' },
    { clinic: 'primas-sziget', locale: 'sk', treatment: 'Ortodontická kontrola' },
    { clinic: 'primas-sziget', locale: 'en', treatment: 'Teeth whitening' },
  ]) {
    const env = environment({ appointment: fixture });
    assert.equal((await env.submit({ appointmentClinicId: fixture.clinic })).status, 200);
    const html = env.emails[0].payload.html;
    const links = calendarLinks(html);
    for (const text of [visibleText(html), links.google.searchParams.get('details'), links.ics.searchParams.get('details')]) {
      assert.doesNotMatch(text, /\bCBCT\b|\bCT\b|röntgen|X-ray|cephalometric|\bRTG\b/i, fixture.treatment);
    }
  }
});

test('an already processed appointment cannot silently move to a different clinic without a new confirmation flow', async () => {
  const env = environment({ appointment: {
    status: 'processed', confirmed_clinic_id: 'belvaros', confirmed_appointment_local: '2026.11.03. 14:30',
    confirmation_email_idempotency_key: 'previous-confirmation',
  } });
  assert.equal((await env.submit({ appointmentClinicId: 'primas-sziget' })).status, 409);
  assert.equal(env.emails.length, 0);
  assert.equal(env.updates.length, 0);
});

test('an already confirmed appointment submitted again at the same clinic is rejected without another email', async () => {
  const env = environment({ appointment: {
    status: 'processed', confirmed_clinic_id: 'belvaros', confirmed_appointment_local: '2026.11.03. 14:30',
    confirmation_email_idempotency_key: 'previous-confirmation',
  } });
  assert.equal((await env.submit({ appointmentClinicId: 'belvaros' })).status, 409);
  assert.equal(env.emails.length, 0);
  assert.equal(env.updates.length, 0);
});

test('failed or unacknowledged email delivery leaves the appointment unprocessed', async () => {
  for (const failure of [
    { mailStatus: 503, mailBody: { name: 'service_unavailable' } },
    { mailStatus: 200, mailBody: {} },
    { networkError: true },
    { appointment: { email: null } },
  ]) {
    const env = environment(failure);
    assert.equal((await env.submit()).status, 502);
    assert.equal(env.updates.length, 0);
    assert.equal(env.state.status, 'new');
    assert.equal(env.state.confirmation_sending_token, null);
    assert.equal(env.state.confirmation_sending_started_at, null);
  }
});

test('cancellation removes the confirmed clinic together with its appointment date', async () => {
  const env = environment({ appointment: {
    status: 'processed', confirmed_clinic_id: 'primas-sziget', confirmed_appointment_local: '2026.11.03. 14:30',
  } });
  const response = await env.submit({ value: 'cancelled', appointmentClinicId: undefined, appointmentDateTime: undefined });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).cancellationEmailSent, true);
  assert.equal(env.updates.length, 1);
  assert.equal(env.updates[0].payload.confirmed_clinic_id, null);
  assert.equal(env.updates[0].payload.confirmed_appointment_local, null);
  assert.equal(env.updates[0].payload.confirmation_email_sent_at, null);
});

test('untrusted requests and unauthenticated admins are rejected before appointment reads, email or updates', async () => {
  for (const fixture of [{ originError: true, status: 403 }, { authError: true, status: 401 }]) {
    const env = environment(fixture);
    assert.equal((await env.submit()).status, fixture.status);
    assert.equal(env.reads.length, 0);
    assert.equal(env.emails.length, 0);
    assert.equal(env.updates.length, 0);
    assert.deepEqual(env.guards, fixture.originError ? ['origin'] : ['origin', 'auth']);
  }
});

test('missing records and database read failures cannot produce confirmation emails', async () => {
  for (const fixture of [{ missing: true, status: 404 }, { readError: { message: 'Test database failure' }, status: 500 }]) {
    const env = environment(fixture);
    assert.equal((await env.submit()).status, fixture.status);
    assert.equal(env.emails.length, 0);
    assert.equal(env.updates.length, 0);
  }
});

test('two assistants confirming different clinics concurrently can send exactly one email and save only its clinic', { timeout: 3000 }, async () => {
  let releaseMail;
  let markSending;
  let sends = 0;
  const mailGate = new Promise(resolve => { releaseMail = resolve; });
  const sendingStarted = new Promise(resolve => { markSending = resolve; });
  const env = environment({ beforeMailResponse: async () => { if (++sends === 1) { markSending(); await mailGate; } } });
  const first = env.submit({ appointmentClinicId: 'primas-sziget' });
  await sendingStarted;
  try {
    assert.equal(env.state.status, 'new', 'the first request has not yet saved processed status');
    assert.ok(env.state.confirmation_sending_token);
    const second = await env.submit({ appointmentClinicId: 'belvaros' });
    assert.equal(second.status, 409);
    assert.equal(env.emails.length, 1);
    assert.equal(env.updates.length, 0);
  } finally {
    releaseMail();
  }
  assert.equal((await first).status, 200);
  assert.equal(env.emails.length, 1);
  assert.equal(env.updates.length, 1);
  assert.equal(env.state.confirmed_clinic_id, 'primas-sziget');
  assert.ok(visibleText(env.emails[0].payload.html).includes('Crown Dental Prímás Sziget'));
  assert.equal(env.state.confirmation_sending_token, null);
  assert.equal(env.state.confirmation_sending_started_at, null);
});

test('an in-flight confirmation blocks cancellation and other status changes before their emails or writes', { timeout: 3000 }, async () => {
  let releaseMail;
  let markSending;
  let sends = 0;
  const mailGate = new Promise(resolve => { releaseMail = resolve; });
  const sendingStarted = new Promise(resolve => { markSending = resolve; });
  const env = environment({ beforeMailResponse: async () => { if (++sends === 1) { markSending(); await mailGate; } } });
  const confirmation = env.submit();
  await sendingStarted;
  try {
    for (const value of ['cancelled', 'no_answer', 'new', 'special']) {
      const conflicting = await env.submit({ value, statusNote: 'Test admin note' });
      assert.equal(conflicting.status, 409, value);
      assert.equal(env.emails.length, 1, value);
      assert.equal(env.updates.length, 0, value);
    }
  } finally {
    releaseMail();
  }
  assert.equal((await confirmation).status, 200);
  assert.equal(env.state.status, 'processed');
  assert.equal(env.state.confirmed_clinic_id, 'primas-sziget');
  assert.equal(env.emails.length, 1);
  assert.equal(env.state.confirmation_sending_token, null);
});

test('an in-flight cancellation blocks a confirmation until cancellation is saved', { timeout: 3000 }, async () => {
  let releaseMail;
  let markSending;
  let sends = 0;
  const mailGate = new Promise(resolve => { releaseMail = resolve; });
  const sendingStarted = new Promise(resolve => { markSending = resolve; });
  const env = environment({ beforeMailResponse: async () => { if (++sends === 1) { markSending(); await mailGate; } } });
  const cancellation = env.submit({ value: 'cancelled', appointmentClinicId: undefined, appointmentDateTime: undefined });
  await sendingStarted;
  try {
    const conflicting = await env.submit();
    assert.equal(conflicting.status, 409);
    assert.equal(env.emails.length, 1);
    assert.equal(env.updates.length, 0);
  } finally {
    releaseMail();
  }
  assert.equal((await cancellation).status, 200);
  assert.equal(env.state.status, 'cancelled');
  assert.equal(env.state.confirmed_clinic_id, null);
  assert.equal(env.state.confirmed_appointment_local, null);
  assert.equal(env.state.confirmation_sending_token, null);
  assert.equal(env.state.confirmation_sending_started_at, null);
  assert.equal(env.emails.length, 1);
});

test('active sending claims block mail while an abandoned claim older than 15 minutes can be reclaimed', async () => {
  const active = environment({ appointment: {
    confirmation_sending_token: 'active-worker', confirmation_sending_started_at: new Date(Date.now() - 60_000).toISOString(),
  } });
  assert.equal((await active.submit()).status, 409);
  assert.equal(active.emails.length, 0);
  assert.equal(active.updates.length, 0);
  assert.equal(active.state.confirmation_sending_token, 'active-worker');

  for (const status of ['new', null]) {
    const stale = environment({ appointment: {
      status, confirmation_sending_token: 'abandoned-worker', confirmation_sending_started_at: new Date(Date.now() - 16 * 60_000).toISOString(),
    } });
    assert.equal((await stale.submit()).status, 200);
    assert.equal(stale.emails.length, 1);
    assert.equal(stale.state.status, 'processed');
    assert.equal(stale.state.confirmation_sending_token, null);
  }
});

test('failed email delivery releases its claim so a retry is possible with the same email idempotency key', async () => {
  const env = environment({ mailStatus: 503, mailBody: { name: 'service_unavailable' } });
  assert.equal((await env.submit()).status, 502);
  assert.equal(env.state.confirmation_sending_token, null);
  assert.equal((await env.submit()).status, 502);
  assert.equal(env.emails.length, 2);
  assert.equal(env.emails[0].idempotencyKey, env.emails[1].idempotencyKey);
  assert.equal(env.state.status, 'new');
  assert.equal(env.updates.length, 0);
});

test('a successful email followed by a failed database save reports the partial failure and retains the claim against immediate resend', async () => {
  const env = environment({ finalSaveError: { message: 'Test save failure' } });
  const response = await env.submit();
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /elküldtük.*mentése nem sikerült/i);
  assert.equal(env.emails.length, 1);
  assert.equal(env.updates.length, 0);
  assert.equal(env.state.status, 'new');
  assert.equal(env.state.confirmed_clinic_id, null);
  assert.ok(env.state.confirmation_sending_token);
  assert.equal((await env.submit()).status, 409);
  assert.equal(env.emails.length, 1);
});

test('a worker that has lost claim ownership cannot save a confirmation or clear the new owner’s claim', async () => {
  for (const mailStatus of [200, 503]) {
    const env = environment({
      mailStatus,
      beforeMailResponse: state => { state.confirmation_sending_token = 'replacement-worker'; },
    });
    assert.equal((await env.submit()).status, mailStatus === 200 ? 500 : 502);
    assert.equal(env.state.confirmation_sending_token, 'replacement-worker');
    assert.equal(env.state.status, 'new');
    assert.equal(env.state.confirmed_clinic_id, null);
    assert.equal(env.updates.length, 0);
  }
});

function adminDataEnvironment({ failedTable } = {}) {
  const queries = [];
  const fixtures = {
    appointments: [
      { id: 'confirmed-appointment', status: 'processed', confirmed_clinic_id: 'primas-sziget', confirmed_appointment_local: '2026.11.03. 14:30' },
      { id: 'legacy-appointment', status: 'processed', confirmed_clinic_id: null, confirmed_appointment_local: '2026.10.01. 09:00' },
    ],
    career_applications: [], quote_leads: [], marketing_subscribers: [],
  };
  const json = (body, options) => Response.json(body, options);
  const api = load('app/api/admin-data/route.ts', {
    '@supabase/supabase-js': {
      createClient: () => ({
        from(table) {
          return {
            select(columns) {
              const selected = columns.split(',').map(value => value.trim());
              const filtered = {
                order: async () => {
                  queries.push({ table, selected });
                  return {
                    data: fixtures[table].map(row => Object.fromEntries(selected.filter(key => key in row).map(key => [key, row[key]]))),
                    error: table === failedTable ? { message: 'Test read failure' } : null,
                  };
                },
              };
              return { is: () => filtered, eq: () => filtered };
            },
          };
        },
      }),
    },
    '@/lib/adminAuth': { requireAdminSession: () => null },
    '@/lib/serverSecurity': { noStoreJson: json, rejectUntrustedMutation: () => null },
  }, {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only-service-key' } },
    fetch: async url => {
      assert.match(url, /^https:\/\/h68mmabs\.api\.sanity\.io\//);
      return Response.json({ result: [] });
    },
  });
  return {
    queries,
    submit: () => api.POST(new Request('https://www.crowndental.hu/api/admin-data', { method: 'POST' })),
  };
}

test('admin reload returns the saved clinic while preserving unassigned legacy appointments', async () => {
  const env = adminDataEnvironment();
  const response = await env.submit();
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.equal(result.appointments[0].confirmed_clinic_id, 'primas-sziget');
  assert.equal(result.appointments[0].confirmed_appointment_local, '2026.11.03. 14:30');
  assert.equal(result.appointments[1].confirmed_clinic_id, null);
  assert.ok(env.queries.find(query => query.table === 'appointments').selected.includes('confirmed_clinic_id'));
});

test('admin data read failure returns an error rather than presenting an incomplete empty appointment list', async () => {
  for (const failedTable of ['appointments', 'career_applications', 'quote_leads', 'marketing_subscribers']) {
    const env = adminDataEnvironment({ failedTable });
    const response = await env.submit();
    assert.equal(response.status, 503, failedTable);
    const result = await response.json();
    assert.ok(result.error);
    assert.equal('appointments' in result, false);
    assert.notEqual(result.success, true);
  }
});
