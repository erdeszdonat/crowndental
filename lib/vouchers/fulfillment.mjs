import layout from '../../prototypes/karacsonyi-utalvanyok/voucher.js';

function required(value) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new Error('voucher_field_missing');
  return value.trim();
}
const escape = (value) =>
  required(String(value))
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
function buyerEmail(order) {
  const email = required(order.billing?.email);
  if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email))
    throw new Error('voucher_email_invalid');
  return email;
}
function validateOrder(order) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      order.id,
    ) ||
    !Number.isInteger(order.amount) ||
    order.amount < 10000 ||
    order.amount > 500000 ||
    order.amount % 5000 ||
    !/^[A-HJ-NP-Z2-9]{20}$/.test(order.code) ||
    order.refunded ||
    !['pickup', 'email'].includes(order.delivery) ||
    order.expiry !== layout.expiry(order.issued_at) ||
    (order.delivery === 'pickup' &&
      order.pickup_from !== layout.pickupFrom(order.issued_at))
  )
    throw new Error('voucher_order_invalid');
}

export function invoiceXml(order, key, exemption) {
  validateOrder(order);
  const buyer = order.billing,
    address = buyer?.address;
  const tags = (fields) =>
    Object.entries(fields)
      .map(
        ([name, value]) => '<' + name + '>' + escape(value) + '</' + name + '>',
      )
      .join('');
  const country = required(address?.country);
  const taxIds = buyer.tax_ids ?? [];
  const hu = taxIds.find((t) => t.type === 'hu_tin'),
    eu = taxIds.find((t) => t.type === 'eu_vat'),
    foreign = taxIds.find((t) => t.type === 'foreign_tax_id');
  if (
    taxIds.length >
      Number(Boolean(hu)) + Number(Boolean(eu)) + Number(Boolean(foreign)) ||
    (buyer.business_name && !taxIds.length) ||
    (!hu && eu && country === 'HU')
  )
    throw new Error('voucher_buyer_tax_review');
  const vat = required(exemption);
  if (!['TAM', 'AAM'].includes(vat))
    throw new Error('voucher_vat_configuration');
  const paidOn = layout.day(order.issued_at);
  return (
    '<?xml version="1.0" encoding="UTF-8"?><xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla">' +
    '<beallitasok>' +
    tags({
      szamlaagentkulcs: required(key),
      eszamla: true,
      szamlaLetoltes: false,
      valaszVerzio: 1,
    }) +
    '</beallitasok>' +
    '<fejlec>' +
    tags({
      teljesitesDatum: paidOn,
      fizetesiHataridoDatum: paidOn,
      fizmod:
        !order.paymentMethod || order.paymentMethod === 'card'
          ? 'Bankkártya'
          : 'Online fizetés (Stripe)',
      penznem: 'HUF',
      szamlaNyelve: 'hu',
      rendelesSzam: 'CD-' + order.id,
      fizetve: true,
    }) +
    '</fejlec><elado/>' +
    '<vevo>' +
    tags({
      nev: required(buyer.business_name || buyer.individual_name || buyer.name),
      orszag: country,
      irsz: required(address.postal_code),
      telepules: required(address.city),
      cim: [required(address.line1), address.line2].filter(Boolean).join(' '),
      email: buyerEmail(order),
      sendEmail: true,
      adoalany: hu ? 1 : eu ? 6 : foreign ? 7 : -1,
      ...(hu ? { adoszam: required(hu.value) } : {}),
      ...(foreign ? { adoszam: required(foreign.value) } : {}),
      ...(eu ? { adoszamEU: required(eu.value) } : {}),
    }) +
    '</vevo>' +
    '<tetelek><tetel>' +
    tags({
      megnevezes: 'Crown Dental fogászati ajándékutalvány',
      mennyiseg: 1,
      mennyisegiEgyseg: 'db',
      nettoEgysegar: order.amount,
      afakulcs: vat,
      nettoErtek: order.amount,
      afaErtek: 0,
      bruttoErtek: order.amount,
    }) +
    '</tetel></tetelek></xmlszamla>'
  );
}

export async function issueInvoice(order, key, vat, transport = fetch) {
  const body = new FormData();
  body.set(
    'action-xmlagentxmlfile',
    new Blob([invoiceXml(order, key, vat)], { type: 'text/xml' }),
    'invoice.xml',
  );
  const response = await transport('https://www.szamlazz.hu/szamla/', {
    method: 'POST',
    body,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  const number = decodeURIComponent(
    response.headers.get('szlahu_szamlaszam') || '',
  );
  const gross = response.headers.get('szlahu_bruttovegosszeg');
  const [result, confirmedNumber] = (await response.text()).trim().split(';');
  if (
    !response.ok ||
    response.headers.get('szlahu_error_code') ||
    !number ||
    gross === null ||
    Number(gross) !== order.amount ||
    result !== 'xmlagentresponse=DONE' ||
    confirmedNumber !== number
  )
    throw new Error('voucher_invoice_verify');
  return number;
}

export async function voucherEmail(order, renderPdf) {
  validateOrder(order);
  const to = buyerEmail(order);
  const amount = new Intl.NumberFormat('hu-HU').format(order.amount) + ' Ft';
  const digital = order.delivery === 'email';
  const details = digital
    ? 'A nyomtatható A5-ös ajándékutalványt csatoltuk.'
    : 'Nyomtatott utalványát ' +
      layout.fromDateLabel(order.pickup_from) +
      ' veheti át belvárosi rendelőnkben, nyitvatartási időben.<br>Címünk: 2500 Esztergom, Petőfi Sándor utca 11.<br>Átvételkor kérjük, mutassa be ezt az e-mailt.';
  const html =
    '<p>Köszönjük a vásárlást!</p><p>' +
    details +
    '</p><p>Érték: ' +
    amount +
    '<br>Beváltás utolsó napja: ' +
    layout.dateLabel(order.expiry) +
    '</p>' +
    '<p>Az utalvány adómentes fogászati kezelésre használható fel (ez rendelőinkben minden fogászati kezelést jelent). Bármelyik Crown Dental rendelőben egyszer váltható be.</p><p>Rendelésszám: CD-' +
    order.id +
    '<br>A számlát külön levélben a Számlázz.hu küldi.</p><p>Boldog karácsonyt kívánunk!<br>A Crown Dental csapata</p>';
  return {
    from: 'Crown Dental <info@crowndental.hu>',
    to,
    subject: digital
      ? 'Crown Dental ajándékutalványa'
      : 'A Crown Dental ajándékutalvány személyes átvétele',
    html,
    ...(digital
      ? {
          attachments: [
            {
              filename: 'Crown-Dental-ajandekutalvany-A5.pdf',
              content: Buffer.from(await renderPdf(order)).toString('base64'),
            },
          ],
        }
      : {}),
  };
}
