import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import layout from '../prototypes/karacsonyi-utalvanyok/voucher.js';
import pdf from '../prototypes/karacsonyi-utalvanyok/vendor/pdf-lib.min.js';
import { voucherDocument } from '../lib/vouchers/document.mjs';
import { parseVoucherBilling } from '../lib/vouchers/billing.mjs';
import {
  invoiceXml,
  issueInvoice,
  voucherEmail,
} from '../lib/vouchers/fulfillment.mjs';

const template = readFileSync(
  new URL(
    '../prototypes/karacsonyi-utalvanyok/teli-mese-a5.pdf',
    import.meta.url,
  ),
);
const order = {
  id: '12345678-1234-4123-8123-123456789abc',
  amount: 60000,
  delivery: 'email',
  issued_at: '2026-12-20T23:20:00Z',
  code: 'ABCDEFGHJKLMNPQRSTUV',
  expiry: '2027-12-21',
  refunded: false,
  billing: {
    name: 'Teszt & Minta',
    email: 'buyer@example.invalid',
    tax_ids: [],
    address: {
      country: 'HU',
      city: 'Esztergom',
      postal_code: '2500',
      line1: 'Teszt tér 1.',
    },
  },
};
const render = (order) =>
  voucherDocument(
    pdf,
    template,
    { ...order, issuedAt: order.issued_at },
    false,
  );

test('billing entered on the site can produce an invoice before accepting payment', () => {
  const fields = {
    name: 'Minta & Társ',
    email: 'buyer@example.invalid',
    country: 'hu',
    city: 'Esztergom',
    postalCode: '2500',
    line1: 'Minta tér 2.',
  };
  for (const [extra, expected] of [
    [{}, '<adoalany>-1</adoalany>'],
    [{ taxNumber: '12345678112' }, '<adoszam>12345678-1-12</adoszam>'],
    [
      { country: 'SK', taxNumber: 'SK 1234567890' },
      '<adoszamEU>SK1234567890</adoszamEU>',
    ],
    [{ country: 'CH', taxNumber: 'CHE-123.456.789' }, '<adoalany>7</adoalany>'],
  ]) {
    const billing = parseVoucherBilling({ ...fields, ...extra });
    const xml = invoiceXml(
      { ...order, billing, paymentMethod: 'paypal' },
      'fixture',
      'TAM',
    );
    assert.ok(xml.includes(expected));
    assert.ok(xml.includes('<fizmod>Online fizetés (Stripe)</fizmod>'));
    assert.ok(xml.includes('<email>buyer@example.invalid</email>'));
  }
  for (const invalid of [
    { email: 'bad' },
    { line1: '' },
    { postalCode: '25a0' },
    { country: 'XX' },
    { country: 'XYZ' },
    { taxNumber: '123' },
  ])
    assert.throws(() => parseVoucherBilling({ ...fields, ...invalid }));
});

test('the buyer receives the immutable PDF or a letter with the first pickup date', async () => {
  const bytes = await render(order);
  const mail = await voucherEmail(order, render);
  assert.deepEqual(Buffer.from(mail.attachments[0].content, 'base64'), bytes);
  assert.equal(mail.to, order.billing.email);
  const a5 = await pdf.PDFDocument.load(bytes);
  assert.equal(a5.getPageCount(), 1);
  assert.ok(Math.abs(a5.getPage(0).getWidth() - 595.276) < 0.01);
  const pickup = await voucherEmail(
    { ...order, delivery: 'pickup', pickup_from: '2026-12-24' },
    () => assert.fail('pickup attachment'),
  );
  assert.equal(pickup.attachments, undefined);
  for (const text of [
    '2026. december 24-től',
    '2027. december 21.',
    'Petőfi Sándor',
    'nyitvatartási időben',
  ])
    assert.ok(pickup.html.includes(text));
  for (const message of [mail.html, pickup.html]) {
    assert.ok(message.includes('(ez rendelőinkben minden fogászati kezelést jelent)'));
    assert.ok(message.includes('Boldog karácsonyt kívánunk!'));
  }
  await assert.rejects(voucherEmail({ ...order, refunded: true }, render));
  await assert.rejects(
    voucherEmail({ ...order, billing: { email: 'a@b.hu,other@b.hu' } }, render),
  );
  await assert.rejects(
    voucherDocument(pdf, Buffer.from('wrong template'), order, false),
  );
  await assert.rejects(render({ ...order, code: 'INVALID' }));
  await assert.rejects(render({ ...order, expiry: '2028-12-21' }));
});

test('invoice request is paid, in HUF, linked to the order, sent by Számlázz.hu, and escapes buyer data', async () => {
  const xml = invoiceXml(order, 'dummy-agent', 'TAM');
  for (const fragment of [
    '<nev>Teszt &amp; Minta</nev>',
    '<sendEmail>true</sendEmail>',
    '<afakulcs>TAM</afakulcs>',
    '<email>buyer@example.invalid</email>',
    '<bruttoErtek>60000</bruttoErtek>',
    '<teljesitesDatum>2026-12-21</teljesitesDatum>',
    '<fizetve>true</fizetve>',
    '<penznem>HUF</penznem>',
    '<rendelesSzam>CD-' + order.id + '</rendelesSzam>',
  ])
    assert.ok(xml.includes(fragment));
  assert.ok(!xml.includes(order.code));
  const response = () =>
    new Response('xmlagentresponse=DONE;TEST-1', {
      headers: {
        szlahu_szamlaszam: 'TEST-1',
        szlahu_bruttovegosszeg: '60000.00',
      },
    });
  assert.equal(
    await issueInvoice(order, 'dummy-agent', 'TAM', async (url, options) => {
      assert.equal(url, 'https://www.szamlazz.hu/szamla/');
      assert.equal(options.redirect, 'error');
      assert.equal(
        await options.body.get('action-xmlagentxmlfile').text(),
        xml,
      );
      return response();
    }),
    'TEST-1',
  );
  await assert.rejects(
    issueInvoice(order, 'dummy', 'TAM', async () => new Response('[ERR]')),
  );
  await assert.rejects(
    issueInvoice(order, 'dummy', 'TAM', async () => {
      throw new Error('timeout');
    }),
  );
  assert.throws(() =>
    invoiceXml(
      { ...order, billing: { ...order.billing, address: {} } },
      'dummy',
      'TAM',
    ),
  );
  assert.throws(() => invoiceXml(order, 'dummy', '27'));
  assert.throws(() =>
    invoiceXml(
      {
        ...order,
        billing: {
          ...order.billing,
          tax_ids: [{ type: 'unknown_tax_id', value: 'test' }],
        },
      },
      'dummy',
      'TAM',
    ),
  );
});

test('pickup and redemption use Budapest calendar dates across DST, midnight, year-end and leap day', () => {
  for (const [issued, firstDay, expiry] of [
    ['2026-12-30T23:01:00Z', '2027-01-03', '2027-12-31'],
    ['2026-03-27T22:30:00Z', '2026-03-30', '2027-03-27'],
    ['2026-10-23T22:30:00Z', '2026-10-27', '2027-10-24'],
    ['2028-02-28T23:01:00Z', '2028-03-03', '2029-02-28'],
  ]) {
    assert.equal(layout.pickupFrom(issued), firstDay);
    assert.equal(layout.expiry(issued), expiry);
    const o = { delivery: 'pickup', issuedAt: issued, expiry };
    assert.equal(layout.canCollect(o, issued), false);
    assert.equal(layout.canCollect(o, firstDay + 'T12:00:00Z'), true);
    assert.equal(layout.canCollect(o, firstDay + 'T23:59:00Z'), true);
    assert.equal(layout.canCollect(o, expiry + 'T12:00:00Z'), true);
    assert.equal(layout.canCollect(o, expiry + 'T23:59:00Z'), false);
    for (const flags of [
      { reversed: true },
      { redeemedAt: issued },
      { collectedAt: issued },
      { delivery: 'email' },
    ])
      assert.equal(layout.canCollect({ ...o, ...flags }, firstDay + 'T12:00:00Z'), false);
  }
});
