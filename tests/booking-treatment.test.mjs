import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(read('lib/bookingTreatment.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, URL });
const { bookingHref, contextualArticleLink, bookingTreatmentId, bookingTreatmentIds, articleBookingTreatment } = exports;

test('all locales offer consultation first and orthodontic consultation second, with a distinct later treatment', () => {
  assert.equal(bookingTreatmentIds[0], 'allapotfelmeres');
  assert.equal(bookingTreatmentIds[1], 'fogszabalyozas');
  assert.ok(bookingTreatmentIds.indexOf('fogszabalyozo-kezeles') > 2);
  for (const locale of ['hu', 'en', 'de', 'sk']) {
    const { treatments } = JSON.parse(read('messages/' + locale + '.json')).booking;
    for (const id of bookingTreatmentIds.filter(id => !['direkt-hej','indirekt-hej','hollywood-mosoly'].includes(id))) {
      assert.ok(treatments[id], locale + ': ' + id);
    }
  }
  assert.equal(bookingTreatmentId('unlisted'), undefined);
});

test('context comes from the current page, including localized and new-tab links', () => {
  for (const prefix of ['', '/en', '/de', '/sk']) {
    const base = prefix + '/idopont';
    for (const [slug, treatment] of [['fogszabalyozas','fogszabalyozas'], ['foghuzas','szajsebeszet'], ['implantatum','implantatum'], ['indirekt-hej','indirekt-hej']]) {
      assert.equal(bookingHref(prefix, prefix + '/kezelesek/' + slug + '/'), base + '?kezeles=' + treatment);
    }
    assert.equal(bookingHref(prefix, prefix + '/blog/opaque'), base + '?cikk=opaque');
    assert.equal(bookingHref(prefix, prefix + '/kapcsolat'), base);
    assert.equal(bookingHref(prefix, prefix + '/kezelesek'), base);
    assert.equal(contextualArticleLink('https://www.crowndental.hu/idopont?utm_source=blog#form', prefix, 'opaque', 'fogszabalyozas'), base + '?utm_source=blog&kezeles=fogszabalyozas#form');
    for (const link of ['/idopont?kezeles=direkt-hej','https://elsewhere.example/idopont','/idopont/sikeres','tel:+36305892468']) {
      assert.equal(contextualArticleLink(link, prefix, 'opaque', 'fogszabalyozas'), link);
    }
  }
});

test('article topics use the title even for opaque slugs, with a neutral result for general subjects', () => {
  for (const [slug, title, expected] of [
    ['rogzitett-fogszabalyozo-elso-het-etkezes-fogapolas', '', 'fogszabalyozas'],
    ['retencios-sin-fogszabalyozas-utan-viseles-es-illeszkedes', '', 'fogszabalyozas'],
    ['opaque', 'Clear aligners or fixed braces?', 'fogszabalyozas'],
    ['opaque', 'Kieferorthopädische Beratung', 'fogszabalyozas'],
    ['opaque', 'Strojček na zuby', 'fogszabalyozas'],
    ['ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi', 'Hogyan működik a fogfehérítés?', 'fogfeherites'],
    ['opaque', 'Gyermekfogszabályozás: mikor érdemes szakorvoshoz fordulni?', 'fogszabalyozas'],
    ['opaque', 'Fogkorona árak', 'koronak-hidak'],
    ['opaque', 'All-on-4 fogpótlás: rögzített fogsor négy implantátumon', 'implantatum'],
    ['opaque', 'Pattintós fogsor implantátumokon', 'fogsor'],
    ['opaque', 'Fogászati híd vagy implantátum?', undefined],
    ['opaque', 'Crown Dental – történetünk', undefined],
    ['opaque', 'Implantátum vagy fogsor?', undefined],
    ['opaque', 'Dental crowns at Crown Dental', 'koronak-hidak'],
    ['opaque', 'Composite vs. porcelain veneers', 'esztetikai-fogaszat'],
  ]) assert.equal(articleBookingTreatment(slug, title), expected, slug + ' ' + title);
});
