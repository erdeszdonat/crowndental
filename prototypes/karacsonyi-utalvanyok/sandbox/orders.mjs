import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID } from 'node:crypto';
import voucher from '../voucher.js';
import { parseVoucherBilling } from '../../../lib/vouchers/billing.mjs';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const localDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest', dateStyle: 'short' });
export const sandboxAccount = 'acct_1UdEG3Px8i4o2rrf';

export function nextYear(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const last = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  return new Date(Date.UTC(year + 1, month - 1, Math.min(day, last))).toISOString().slice(0, 10);
}

export function orderStore(filename) {
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, attempt TEXT NOT NULL,
      amount INTEGER NOT NULL, delivery TEXT NOT NULL, session TEXT UNIQUE,
      payment TEXT UNIQUE, code TEXT UNIQUE, issuedAt TEXT, expiry TEXT,
      redeemedAt TEXT, collectedAt TEXT, billing TEXT, UNIQUE (owner, attempt)
    );
    CREATE TABLE IF NOT EXISTS reversals (payment TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS jobs (
      orderId TEXT NOT NULL, kind TEXT NOT NULL, PRIMARY KEY(orderId, kind)
    );`);
  // Local preview servers may already be open while the prototype is updated.
  // Replace the earlier deadline trigger with the first eligible pickup day.
  if (['Europe/Budapest','Europe/Bratislava'].includes(Intl.DateTimeFormat().resolvedOptions().timeZone)) {
    db.exec(`BEGIN;
      DROP TRIGGER IF EXISTS voucher_pickup_window;
      CREATE TRIGGER IF NOT EXISTS voucher_pickup_from_window
      BEFORE UPDATE OF collectedAt ON orders WHEN NEW.collectedAt IS NOT NULL AND (
        OLD.delivery <> 'pickup' OR OLD.issuedAt IS NULL OR OLD.collectedAt IS NOT NULL OR OLD.redeemedAt IS NOT NULL OR
        date(NEW.collectedAt,'localtime') NOT BETWEEN date(OLD.issuedAt,'localtime','+3 days') AND OLD.expiry)
      BEGIN SELECT RAISE(IGNORE); END;
      COMMIT;`);
  }
  if (!db.prepare('PRAGMA table_info(orders)').all().some(column => column.name === 'recipientName'))
    db.exec('ALTER TABLE orders ADD COLUMN recipientName TEXT');
  function request(owner, attempt, amount, delivery, formBilling, recipient) {
    if (!Number.isInteger(amount) || amount < 10000 || amount > 500000 || amount % 5000 ||
        !['email', 'pickup'].includes(delivery) || typeof attempt !== 'string' ||
        !/^[0-9a-f-]{36}$/.test(attempt)) throw new Error('Érvénytelen rendelés.');
    const billing = JSON.stringify(parseVoucherBilling(formBilling));
    const recipientName = voucher.recipientName(recipient) || null;
    db.prepare('INSERT INTO orders (id,owner,attempt,amount,delivery,billing,recipientName) VALUES (?,?,?,?,?,?,?) ON CONFLICT(owner,attempt) DO NOTHING')
      .run(randomUUID(),owner,attempt,amount,delivery,billing,recipientName);
    const order = db.prepare('SELECT * FROM orders WHERE owner=? AND attempt=?').get(owner,attempt);
    if (order.amount !== amount || order.delivery !== delivery || order.billing !== billing || order.recipientName !== recipientName) throw new Error('A rendelés időközben megváltozott.');
    return order;
  }
  function attach(id, session) {
    if (!session.id?.startsWith('cs_test_') || session.livemode !== false || (session.client_reference_id && session.client_reference_id !== id)) {
      throw new Error('A fizetési munkamenet nem a tesztrendeléshez tartozik.');
    }
    if (!db.prepare('UPDATE orders SET session=? WHERE id=? AND (session IS NULL OR session=?)').run(session.id,id,session.id).changes) {
      throw new Error('Eltérő fizetési munkamenet.');
    }
  }
  function forSession(session, origin) {
    const order = db.prepare('SELECT * FROM orders WHERE session=?').get(session.id);
    if (!order && (session.metadata?.source === 'crown-voucher-sandbox' ||
        (origin && session.success_url === origin+'/?session_id={CHECKOUT_SESSION_ID}'))) throw new Error('A fizetési azonosító mentése még nem fejeződött be.');
    return order;
  }
  function fulfill(session, paidAt, origin) {
    if (session.livemode !== false || session.mode !== 'payment' || session.payment_status !== 'paid') return;
    const order = forSession(session,origin);
    if (!order) return;
    const payment = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!payment || (order.payment && order.payment !== payment) || session.id !== order.session || session.currency !== 'huf' || session.amount_total !== order.amount * 100) {
      throw new Error('A Stripe visszaigazolása és a rendelés eltér.');
    }
    const issuedAt = new Date(paidAt * 1000).toISOString();
    const code = Array.from(randomBytes(20), byte => alphabet[byte % 32]).join('');
    db.exec('BEGIN IMMEDIATE');
    try {
      // Keep the association even if the refund notification arrived first.
      db.prepare('UPDATE orders SET payment=? WHERE id=? AND payment IS NULL').run(payment,order.id);
      const inserted = db.prepare(`UPDATE orders SET payment=?,code=?,issuedAt=?,expiry=?,billing=coalesce(billing,?)
        WHERE id=? AND code IS NULL AND NOT EXISTS (SELECT 1 FROM reversals WHERE payment=?)`)
        .run(payment,code,issuedAt,nextYear(localDay.format(new Date(issuedAt))),
          JSON.stringify(session.customer_details ?? {}),order.id,payment);
      if (inserted.changes) {
        const queue = db.prepare('INSERT INTO jobs(orderId,kind) VALUES (?,?)');
        queue.run(order.id,'invoice');
        queue.run(order.id,order.delivery === 'email' ? 'email_pdf' : 'pickup');
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  const selectVoucher = `SELECT amount,delivery,code,issuedAt,expiry,recipientName,redeemedAt,collectedAt,
    EXISTS(SELECT 1 FROM reversals r WHERE r.payment=orders.payment) AS reversed FROM orders`;
  function paymentReversed(id) {
    if (typeof id === 'string') db.prepare('INSERT OR IGNORE INTO reversals VALUES (?)').run(id);
  }
  function staffAction(code, action, now = new Date()) {
    if (!['redeem','collect'].includes(action)) return false;
    if (action === 'collect') {
      const order=db.prepare(selectVoucher+' WHERE code=?').get(code);
      if (!order || !voucher.canCollect(order,now)) return false;
    }
    const update = action === 'redeem' ? 'redeemedAt=?' : 'collectedAt=?';
    const condition = action === 'redeem' ? 'redeemedAt IS NULL' : "collectedAt IS NULL AND redeemedAt IS NULL AND delivery='pickup'";
    return !!db.prepare(`UPDATE orders SET ${update} WHERE code=? AND expiry>=? AND ${condition}
      AND NOT EXISTS(SELECT 1 FROM reversals r WHERE r.payment=orders.payment)`)
      .run(now.toISOString(),code,localDay.format(now)).changes;
  }
  return { db, request, attach, fulfill, paymentReversed, staffAction, forSession,
    hasPayment: id => !!db.prepare('SELECT 1 FROM orders WHERE payment=?').get(id),
    owned: (owner, session) => db.prepare(selectVoucher+' WHERE owner=? AND session=?').get(owner,session),
    lookup: code => db.prepare(selectVoucher+' WHERE code=?').get(code),
    list: () => db.prepare(selectVoucher+' WHERE code IS NOT NULL ORDER BY issuedAt DESC').all() };
}

export function checkoutParams(order, origin) {
  return {
    mode:'payment', ui_mode:'hosted_page', billing_address_collection:'auto',
    phone_number_collection:{enabled:false}, automatic_tax:{enabled:false}, allow_promotion_codes:false,
    submit_type:'auto', integration_identifier:'hosted_web_0001', origin_context:'web',
    line_items:[{quantity:1,price_data:{currency:'huf',unit_amount:order.amount * 100,
      product_data:{name:'Crown Dental karácsonyi ajándékutalvány'}}}],
    success_url:origin+'/?session_id={CHECKOUT_SESSION_ID}',cancel_url:origin+'/?cancelled=1'
  };
}
