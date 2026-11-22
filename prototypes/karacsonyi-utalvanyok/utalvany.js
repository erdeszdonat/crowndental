'use strict';

// Local review fixture. This file is outside the deployed application's routes.
const $ = id => document.getElementById(id);
// The offline preview uses the website's rendered navigation without its Next.js runtime.
const header = document.querySelector('header');
const navigationLinks = Array.from(header.querySelectorAll('nav a'), link => [link.textContent.trim(), link.href])
  .filter(([label]) => label);
const languageLinks = [['Magyar', '#shop'], ['English', 'https://www.crowndental.hu/en'],
  ['Slovenčina', 'https://www.crowndental.hu/sk'], ['Deutsch', 'https://www.crowndental.hu/de']];
let activeMenuButton;
function closeMenu() {
  if (!activeMenuButton) return;
  $(activeMenuButton.getAttribute('aria-controls')).hidden = true;
  activeMenuButton.setAttribute('aria-expanded', 'false');
  activeMenuButton = undefined;
}
for (const button of header.querySelectorAll('[data-preview-menu]')) {
  const menu = document.createElement('div');
  menu.id = 'preview-' + button.dataset.previewMenu;
  menu.className = 'preview-menu';
  menu.hidden = true;
  const items = button.dataset.previewMenu === 'navigation' ? [...navigationLinks, ...languageLinks] : languageLinks;
  for (const [label, href] of items) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    menu.append(link);
  }
  header.append(menu);
  button.setAttribute('aria-controls', menu.id);
  button.addEventListener('click', () => {
    const wasOpen = activeMenuButton === button;
    closeMenu();
    if (wasOpen) return;
    activeMenuButton = button;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    menu.querySelector('a').focus();
  });
  menu.addEventListener('click', closeMenu);
}
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && activeMenuButton) { activeMenuButton.focus(); closeMenu(); }
});
const sandbox = document.documentElement.hasAttribute('data-stripe-sandbox');
if (sandbox && /^#admin=[a-f0-9]{64}$/.test(location.hash)) {
  sessionStorage.setItem('crown-staff',location.hash.slice(7));
  history.replaceState(null,'',location.pathname+'#admin-minta');
}
async function api(path, data) {
  const headers = {'Content-Type':'application/json'};
  if (path.startsWith('staff/')) headers.Authorization = 'Bearer '+(sessionStorage.getItem('crown-staff') || '');
  const response = await fetch('/api/'+path,{method:data === undefined ? 'GET' : 'POST',
    headers,body:data === undefined ? undefined : JSON.stringify(data)});
  const value = await response.json();
  if (!response.ok) {
    if (response.status === 409 && path === 'checkout') sessionStorage.removeItem('crown-attempt');
    throw new Error(value.error);
  }
  return value;
}
const exampleCode = 'CDM26H7N4QR8K5BX3P9T';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const formatAmount = value => new Intl.NumberFormat('hu-HU').format(value) + ' Ft';
const formatCode = code => code.match(/.{5}/g).join('-');
const normalizeCode = value => value.toUpperCase().replace(/[\s-]+/g, '');
const localDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit' });
const prettyDay = new Intl.DateTimeFormat('hu-HU', { timeZone: 'UTC', dateStyle: 'long' });
const displayDate = iso => prettyDay.format(new Date(iso + 'T12:00:00Z'));
const today = () => localDay.format(new Date());
function expiresOn(date) {
  const [year, month, day] = date.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  return new Date(Date.UTC(year + 1, month - 1, Math.min(day, lastDay))).toISOString().slice(0, 10);
}
function randomCode() {
  return Array.from(crypto.getRandomValues(new Uint8Array(20)), byte => alphabet[byte % 32]).join('');
}
function validAmount(value) {
  return Number.isInteger(value) && value >= 10000 && value <= 500000 && value % 5000 === 0;
}
function state(order) {
  if (order.reversed) return 'Visszatérítve';
  if (order.redeemedAt) return 'Beváltva';
  return today() <= order.expiry ? 'Érvényes' : 'Lejárt';
}
let connection;
function openStore() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const request = indexedDB.open('crown-dental-karacsony-minta-v1', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('vouchers', { keyPath: 'code' });
      store.add({ code: exampleCode, amount: 60000, delivery: 'email', issuedAt: '2026-11-22T12:00:00Z', expiry: '2027-11-22', redeemedAt: null, collectedAt: null });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { connection = undefined; reject(request.error); };
  });
  return connection;
}
async function withStore(mode, operation) {
  const db = await openStore();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('vouchers', mode);
    operation(transaction.objectStore('vouchers'));
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('A módosítás megszakadt.'));
  });
}
// The eligibility check and write share one serialized read/write transaction.
async function updateVoucher(code, change) {
  let updated = false;
  await withStore('readwrite', store => {
    const read = store.get(code);
    read.onsuccess = () => {
      if (read.result && change(read.result)) {
        store.put(read.result);
        updated = true;
      }
    };
  });
  return updated;
}
async function readVoucher(code) {
  if (sandbox) return api('staff/lookup',{code});
  let order;
  await withStore('readonly', store => {
    const read = store.get(code);
    read.onsuccess = () => { order = read.result; };
  });
  return order;
}
let amount = 60000;
let custom = false;
let submitted = false;
const delivery = () => document.querySelector('input[name="delivery"]:checked').value;
function showRecipient(name) {
  const text = $('ticket-recipient');
  text.textContent = name || '';
  $('summary-recipient').textContent = name ? name + ' részére' : '';
  $('summary-recipient').hidden = !name;
  text.removeAttribute('textLength');
  if (name && text.getComputedTextLength() > 238) {
    text.setAttribute('textLength','238');
    text.setAttribute('lengthAdjust','spacingAndGlyphs');
  }
}
$('recipient-name').addEventListener('input', () => {
  $('recipient-name').setCustomValidity('');
  showRecipient($('recipient-name').value.trim());
});
const examples = JSON.parse($('voucher-examples').textContent);
function refreshSummary() {
  $('selected-example').textContent = validAmount(amount) ? 'Példa a felhasználásra: ' + examples.filter(item => item.treatmentPrice <= amount).at(-1).description : '10 000 és 500 000 Ft közötti összeget adjon meg, 5 000 Ft-os lépésekben.';
  $('summary-amount').textContent = validAmount(amount) ? formatAmount(amount) : 'Válasszon összeget';
  if (!submitted) $('ticket-amount').textContent = validAmount(amount) ? new Intl.NumberFormat('hu-HU').format(amount) : '';
  $('summary-delivery').textContent = delivery() === 'email' ? 'Nyomtatható PDF e-mailben' : 'Nyomtatott utalvány a rendelőben';
  $('form-error').textContent = '';
}
$('amounts').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  for (const item of $('amounts').querySelectorAll('button')) item.setAttribute('aria-pressed', String(item === button));
  custom = button.id === 'custom-button';
  $('custom-box').hidden = !custom;
  $('custom').disabled = !custom;
  $('custom').required = custom;
  if (custom) {
    if (!$('custom').value) $('custom').value = String(amount);
    $('custom').focus();
    $('custom').select();
  }
  amount = Number(custom ? $('custom').value : button.dataset.amount);
  refreshSummary();
});
refreshSummary();
$('custom').disabled = true;
$('custom').addEventListener('input', () => { amount = Number($('custom').value); refreshSummary(); });
$('configure').addEventListener('change', refreshSummary);
$('company-billing').addEventListener('change', () => {
  const company = $('company-billing').checked;
  const taxNumber = $('configure').elements.taxNumber;
  $('company-tax').hidden = !company;
  taxNumber.disabled = !company;
  taxNumber.required = company;
});
function setTicket(order) {
  showRecipient(order.recipientName);
  $('ticket-amount').textContent = new Intl.NumberFormat('hu-HU').format(order.amount);
  $('ticket-code').textContent = formatCode(order.code);
  $('ticket-start').textContent = displayDate(localDay.format(new Date(order.issuedAt)));
  $('ticket-expiry').textContent = displayDate(order.expiry);
}
let purchasedOrder;
function showOrder(order) {
  purchasedOrder = order;
  setTicket(order);
  const fulfillment = order.delivery === 'email' ? 'A választott átvétel e-mailes PDF.' : 'Nyomtatott utalványát ' + CrownVoucher.fromDateLabel(CrownVoucher.pickupFrom(order.issuedAt)) + ' veheti át belvárosi rendelőnkben, nyitvatartási időben (2500 Esztergom, Petőfi Sándor utca 11.).';
  $('receipt').textContent = formatAmount(order.amount) + ' · A lejárat napja: ' + displayDate(order.expiry) + ' ' + fulfillment;
  $('result-code').textContent = formatCode(order.code);
  $('valasztas').hidden = true;
  $('result').hidden = false;
  $('result').focus();
}
$('configure').addEventListener('submit', async event => {
  event.preventDefault();
  if (submitted || !validAmount(amount)) return;
  let recipientName;
  try { recipientName = CrownVoucher.recipientName($('recipient-name').value); }
  catch (error) {
    $('recipient-name').setCustomValidity(error.message);
    $('recipient-name').reportValidity();
    return;
  }
  submitted = true;
  const button = $('configure').querySelector('[type="submit"]');
  button.disabled = true;
  try {
    if (sandbox) {
      if (!document.documentElement.hasAttribute('data-site-billing')) throw new Error('A számlázási űrlap frissült. A Stripe-próbához indítsa újra a helyi tesztszervert.');
      const previous = JSON.parse(sessionStorage.getItem('crown-attempt') || 'null');
      const choice = delivery();
      const form = new FormData($('configure'));
      const billing = Object.fromEntries(['name','email','country','postalCode','city','line1','taxNumber'].map(key => [key,form.get(key)]));
      billing.business = $('company-billing').checked;
      const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(recipientName ? [billing,recipientName] : billing)));
      const billingHash = Array.from(new Uint8Array(digest)).join('.');
      const attempt = previous?.amount === amount && previous.delivery === choice && previous.billingHash === billingHash ? previous.attempt : crypto.randomUUID();
      sessionStorage.setItem('crown-attempt',JSON.stringify({attempt,amount,delivery:choice,billingHash}));
      const session = await api('checkout',{attempt,amount,delivery:choice,billing,recipientName});
      location.assign(session.url);
      return;
    }
    const order = { code: randomCode(), recipientName, amount, delivery: delivery(), issuedAt: new Date().toISOString(), expiry: expiresOn(today()), redeemedAt: null, collectedAt: null };
    await withStore('readwrite', store => store.add(order));
    showOrder(order);
  } catch (error) {
    submitted = false;
    $('form-error').textContent = sandbox ? error.message : 'A böngésző nem tudta menteni a próbát. Engedélyezze a helyi tárhelyet, majd próbálja újra.';
  } finally { button.disabled = false; }
});
$('configure').querySelector('[type="submit"]').disabled = false;
async function makeVoucherPdf() {
  let order = purchasedOrder;
  if (sandbox) {
    const id = new URLSearchParams(location.search).get('session_id');
    const response = await fetch('/api/voucher.pdf?session_id=' + encodeURIComponent(id || ''));
    if (response.ok) return response.arrayBuffer();
    if (response.status !== 404) throw new Error('Az utalvány nem érhető el.');
    // Open preview servers from the previous version only expose the owned
    // purchase record. Recheck it immediately before rendering a marked sample.
    order = await api('result?session_id=' + encodeURIComponent(id || ''));
  }
  const response = await fetch($('pdf-template').href);
  if (!response.ok) throw new Error('Az utalványsablon nem érhető el.');
  return CrownVoucher.render(PDFLib, await response.arrayBuffer(), order, true);
}
$('print').addEventListener('click', async () => {
  const button = $('print');
  button.disabled = true;
  $('pdf-error').textContent = '';
  try {
    const bytes = await makeVoucherPdf();
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Crown-Dental-karacsonyi-mintautalvany.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    $('pdf-error').textContent = 'A PDF letöltése sikertelen. Próbálja újra a letöltést.';
  } finally { button.disabled = false; }
});
$('new-order').addEventListener('click', () => {
  if (sandbox) { location.assign('/'); return; }
  submitted = false;
  $('recipient-name').value = '';
  showRecipient('');
  $('ticket-code').textContent = formatCode(exampleCode);
  $('ticket-start').textContent = displayDate('2026-11-22');
  $('ticket-expiry').textContent = displayDate('2027-11-22');
  refreshSummary();
  $('result').hidden = true;
  $('valasztas').hidden = false;
  $('amounts').querySelector('[aria-pressed="true"]').focus();
});
async function refreshAdmin() {
  let orders = [];
  if (sandbox) orders = await api('staff/orders');
  else await withStore('readonly', store => {
    const read = store.getAll();
    read.onsuccess = () => { orders = read.result; };
  });
  orders.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const rows = orders.map(order => {
    const row = document.createElement('tr');
    const amountCell = row.insertCell();
    amountCell.textContent = formatAmount(order.amount);
    const tail = document.createElement('small');
    tail.textContent = '…' + order.code.slice(-5);
    amountCell.append(tail);
    row.insertCell().textContent = displayDate(order.expiry);
    row.insertCell().textContent = state(order);
    const deliveryCell = row.insertCell();
    if (order.delivery === 'email') deliveryCell.textContent = 'PDF e-mailben (minta)';
    else if (order.collectedAt) deliveryCell.textContent = 'Személyesen átvéve';
    else if (!order.reversed && !order.redeemedAt && today()<CrownVoucher.pickupFrom(order.issuedAt))
      deliveryCell.textContent = 'Belvárosi átvétel kezdete: ' + displayDate(CrownVoucher.pickupFrom(order.issuedAt));
    else if (!CrownVoucher.canCollect(order)) deliveryCell.textContent = 'Átadás lezárva';
    else {
      const collect = document.createElement('button');
      collect.textContent = 'Átadás rögzítése';
      collect.className = 'secondary';
      collect.onclick = async () => {
        try {
          const changed = sandbox ? (await api('staff/collect',{code:order.code})).changed : await updateVoucher(order.code, item => {
            if (!CrownVoucher.canCollect(item)) return false;
            item.collectedAt = new Date().toISOString();
            return true;
          });
          $('list-info').textContent = changed ? 'A nyomtatott példány átadása rögzítve.' : 'Az átadást már rögzítették.';
          await refreshAdmin();
        } catch { $('list-info').textContent = 'Az átadást nem sikerült menteni.'; }
      };
      deliveryCell.append('Átvehető a belvárosi rendelőben. ', collect);
    }
    return row;
  });
  $('orders').replaceChildren(...rows);
}
let checkedCode = null;
function clearCheck() {
  checkedCode = null;
  $('redeem').hidden = true;
  $('lookup-info').textContent = '';
}
$('code-input').addEventListener('input', clearCheck);
$('example').addEventListener('click', () => { clearCheck(); $('code-input').value = formatCode(exampleCode); $('lookup').requestSubmit(); });
$('lookup').addEventListener('submit', async event => {
  event.preventDefault();
  clearCheck();
  const code = normalizeCode($('code-input').value);
  try {
    const order = await readVoucher(code);
    if (code !== normalizeCode($('code-input').value)) return;
    if (!order) { $('lookup-info').textContent = 'Ezzel a kóddal nincs helyi mintautalvány.'; return; }
    $('lookup-info').textContent = [formatAmount(order.amount), state(order), 'Érvényes eddig: ' + displayDate(order.expiry)].join(' · ');
    if (state(order) === 'Érvényes') {
      checkedCode = code;
      $('lookup-info').textContent += ' · Kisebb kezelési díjnál a fennmaradó összeg a beváltással elvész.';
      $('redeem').hidden = false;
    }
  } catch { $('lookup-info').textContent = 'A helyi nyilvántartás nem elérhető.'; }
});
$('redeem').addEventListener('click', async () => {
  if (!checkedCode) return;
  const code = checkedCode;
  clearCheck();
  try {
    const changed = sandbox ? (await api('staff/redeem',{code})).changed : await updateVoucher(code, order => {
      if (state(order) !== 'Érvényes') return false;
      order.redeemedAt = new Date().toISOString();
      return true;
    });
    $('lookup-info').textContent = changed ? 'Sikeres beváltás a teljes összegre.' : 'Az utalvány már nem váltható be.';
    if (!$('admin-list').hidden) await refreshAdmin();
  } catch { $('lookup-info').textContent = 'A beváltás mentése sikertelen. Ellenőrizze újra a kódot.'; }
});
// The local assistant demonstration only operates on this browser's sample orders.
const assistantPreviewEnabled = !sandbox;
function switchView() {
  const admin = location.hash === '#admin-minta' && (!sandbox || !!sessionStorage.getItem('crown-staff'));
  const assistant = assistantPreviewEnabled && location.hash === '#asszisztens-minta';
  $('admin').hidden = !(admin || assistant);
  $('shop').hidden = admin || assistant;
  $('admin-list').hidden = !admin;
  $('example').hidden = !admin || sandbox;
  $('staff-description').hidden = !admin;
  if (admin) refreshAdmin().catch(() => { $('list-info').textContent = 'A helyi nyilvántartás nem elérhető.'; });
}
window.addEventListener('hashchange', switchView);
window.addEventListener('focus', () => { if (!$('admin').hidden) switchView(); });
switchView();
if (sandbox) {
  const params = new URLSearchParams(location.search);
  if (params.has('cancelled')) $('form-error').textContent = 'Megszakította a fizetést. Újra megnyithatja a Stripe fizetőoldalát.';
  const id = params.get('session_id');
  if (id) {
    submitted = true;
    $('configure').querySelector('[type="submit"]').disabled = true;
    const status = $('form-error');
    status.textContent = 'A fizetés ellenőrzése folyamatban.';
    (async () => {
      for (let i = 0; i < 20; i++) {
        const order = await api('result?session_id='+encodeURIComponent(id));
        if (!order.pending) {
          sessionStorage.removeItem('crown-attempt');
          showOrder(order);
          return;
        }
        await new Promise(resolve => setTimeout(resolve,3000));
      }
      status.textContent = 'A fizetés visszaigazolása még nem érkezett meg. Frissítse ezt az oldalt később.';
    })().catch(error => { status.textContent = error.message; });
  }
}
