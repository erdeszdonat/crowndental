import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const testDirectory = fileURLToPath(new URL('.', import.meta.url));

// Isolated, network-free browser model: tests cannot send GA events or bookings.
function environment({ hostname = 'www.crowndental.hu', brokenStorage = false } = {}) {
  const data = new Map();
  const storage = {
    getItem(key) { if (brokenStorage) throw Error('blocked'); return data.get(key) ?? null; },
    setItem(key, value) { if (brokenStorage) throw Error('blocked'); data.set(key, value); },
    removeItem(key) { if (brokenStorage) throw Error('blocked'); data.delete(key); },
  };
  const window = { location: { hostname, pathname: '/en/idopont' }, localStorage: storage, sessionStorage: storage };
  const cache = new Map();
  function load(name) {
    const filename = path.resolve(testDirectory, '..', 'lib', name + '.ts');
    if (cache.has(filename)) return cache.get(filename);
    const testModule = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(code, { module: testModule, exports: testModule.exports, window, Date, URL, require: name => load(name.replace('./', '')) });
    cache.set(filename, testModule.exports);
    return testModule.exports;
  }
  const consent = load('cookieConsent');
  const analytics = load('siteAnalytics');
  const grant = () => analytics.setAnalyticsConsent(consent.createConsentRecord({ analytics: true, marketing: false }));
  return { window, storage, consent, analytics, grant, data, load };
}

test('no consent means no events and no attribution storage', () => {
  const { analytics, data, window } = environment();
  assert.equal(analytics.trackSiteEvent('booking_start', 'hu'), false);
  analytics.rememberBookingSource('/kezelesek/implantatum');
  assert.equal(data.size, 0);
  assert.equal(window.dataLayer, undefined);
});

test('preview and localhost never collect analytics, even with consent', () => {
  for (const hostname of ['localhost', '127.0.0.1', 'crowndental-preview.vercel.app', 'crowndental.hu.example.com']) {
    const e = environment({ hostname }); e.grant();
    assert.equal(e.analytics.trackSiteEvent('booking_success', 'hu'), false);
    assert.equal(e.window.dataLayer, undefined);
  }
});

test('gtag receives the documented Arguments protocol, not an Array', () => {
  const e = environment(); e.grant();
  assert.equal(e.analytics.trackSiteEvent('booking_step_view', 'de', { step: 2 }), true);
  const command = e.window.dataLayer[0];
  assert.equal(Array.isArray(command), false);
  assert.equal(Object.prototype.toString.call(command), '[object Arguments]');
  assert.equal(command[0], 'event');
  assert.equal(command[1], 'booking_step_view');
  assert.equal(command[2].site_language, 'de');
  assert.equal(command[2].send_to, 'G-9BS3P1DC4T');
});

test('old consent policy does not authorize tracking', () => {
  const e = environment();
  e.storage.setItem(e.consent.CONSENT_STORAGE_KEY, JSON.stringify({ necessary: true, analytics: true, marketing: true, policyVersion: 'old', decidedAt: new Date().toISOString() }));
  assert.equal(e.analytics.canMeasure(), false);
});

test('revocation stops events, disables GA and clears attribution', () => {
  const e = environment(); e.grant();
  e.analytics.rememberBookingSource('/en/kezelesek/implantatum');
  e.analytics.trackSiteEvent('booking_start', 'en');
  e.analytics.setAnalyticsConsent(e.consent.createConsentRecord({ analytics: false, marketing: false }));
  assert.equal(e.window['ga-disable-G-9BS3P1DC4T'], true);
  assert.equal(e.analytics.trackSiteEvent('booking_submit', 'en'), false);
  assert.equal(e.window.dataLayer.length, 1);
  assert.equal(e.data.has('crown_booking_source_v1'), false);
});

test('storage failure is safe; explicit in-memory consent still works', () => {
  const e = environment({ brokenStorage: true });
  assert.equal(e.analytics.canMeasure(), false);
  e.grant();
  assert.doesNotThrow(() => e.analytics.rememberBookingSource('/'));
  assert.equal(e.analytics.trackSiteEvent('booking_form_view', 'sk'), true);
  assert.equal(e.window.dataLayer[0][2].booking_source, 'direct');
});

test('public source is preserved without queries, personal data or form content', () => {
  const e = environment(); e.grant();
  e.analytics.rememberBookingSource('/de/kezelesek/implantatum?email=private@example.com#private');
  e.analytics.rememberBookingSource('/de/idopont'); // A redundant nav CTA must not overwrite origin.
  e.analytics.trackSiteEvent('booking_success', 'de', { step: 2, email: 'private@example.com', treatment: 'private concern' });
  const parameters = e.window.dataLayer[0][2];
  assert.equal(parameters.booking_source, 'kezelesek/implantatum');
  const allData = JSON.stringify([...e.data.values()]) + JSON.stringify(parameters);
  assert.equal(allData.includes('private'), false);
  assert.equal(parameters.source_page, 'booking');
});

test('unknown paths and IDs cannot leak through route parameters', () => {
  const { analytics } = environment();
  for (const route of ['/admin/private', '/kezelesek/john-smith', '/patient/123', '/?token=secret']) {
    assert.ok(['other', 'home'].includes(analytics.measurementPage(route)));
  }
  assert.equal(analytics.measurementPage('/sk/blog/anything-sensitive?x=private'), 'blog');
});

test('attribution expires after thirty minutes', () => {
  const e = environment(); e.grant();
  e.storage.setItem('crown_booking_source_v1', JSON.stringify({ page: 'home', at: Date.now() - 1800001 }));
  e.analytics.trackSiteEvent('booking_start', 'hu');
  assert.equal(e.window.dataLayer[0][2].booking_source, 'direct');
});

test('all four locales receive their own site language', () => {
  const e = environment(); e.grant();
  for (const locale of ['hu', 'en', 'de', 'sk']) {
    e.analytics.trackSiteEvent('phone_click', locale);
    assert.equal(e.window.dataLayer.at(-1)[2].site_language, locale);
  }
});

test('Sanity image transformations preserve existing crop parameters', () => {
  const { sanityImageUrl } = environment().load('sanityImage');
  const transformed = sanityImageUrl('https://cdn.sanity.io/images/project/production/photo.jpg?w=600&h=400&auto=format', 720);
  const url = new URL(transformed);
  assert.equal(url.searchParams.get('w'), '720');
  assert.equal(url.searchParams.get('h'), '400');
  assert.equal(url.searchParams.get('auto'), 'format');
  assert.equal(transformed.split('?').length, 2);
  assert.equal(sanityImageUrl('', 720), '');
});
