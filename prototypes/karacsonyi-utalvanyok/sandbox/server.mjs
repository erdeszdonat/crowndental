import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';
import pdf from '../vendor/pdf-lib.min.js';
import {voucherDocument} from '../../../lib/vouchers/document.mjs';
import { orderStore, checkoutParams, sandboxAccount } from './orders.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const assets = dirname(root);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css',
  '.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
const files = new Set(['site-chrome.css','voucher-shop.css','site-logo.webp','utalvany.css','utalvany.js','voucher.js',
  'crown-dental-emblema.png','teli-mese-a5.webp','teli-mese-a5.pdf','vendor/pdf-lib.min.js','vendor/fontkit.umd.min.js','vendor/recipient-font.js']);
const readCookie = request => /(?:^|; )crown_order=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || '')?.[1];
const fail = (status, message) => Object.assign(new Error(message), {status});

async function body(request, limit) {
  const parts = [];
  let size = 0;
  for await (const part of request) {
    size += part.length;
    if (size > limit) throw fail(413,'Túl nagy kérés.');
    parts.push(part);
  }
  return Buffer.concat(parts);
}

export function sandboxServer({store, stripe, webhookSecret, adminToken, origin}) {
  const checkout = () => {
    if (!stripe) throw fail(503,'A fizetéshez még be kell állítani a Stripe szerveroldali tesztkulcsát.');
    return stripe.checkout.sessions;
  };
  const server = createServer(async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    const json = (status, data) => {
      res.writeHead(status,{'content-type':'application/json; charset=utf-8'});
      res.end(JSON.stringify(data));
    };
    try {
      if (req.headers.host !== new URL(origin).host) throw fail(403,'Ismeretlen cím.');
      const url = new URL(req.url,origin);
      const path = url.pathname;
      if (req.method === 'POST' && path === '/stripe/webhook') {
        if (!webhookSecret) throw fail(503,'A webhook aláírási kulcsa hiányzik.');
        let event;
        const raw = await body(req,1024*1024);
        try { event = Stripe.webhooks.constructEvent(raw,req.headers['stripe-signature'],webhookSecret); }
        catch { throw fail(400,'Érvénytelen Stripe-aláírás.'); }
        if (event.livemode !== false || (event.account && event.account !== sandboxAccount)) {
          throw fail(400,'Eltérő Stripe-környezet.');
        }
        const object = event.data.object;
        if (['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) {
          store.fulfill(object,event.created,origin);
        } else if (event.type === 'charge.refunded' && object.amount_refunded > 0) {
          const payment = object.payment_intent;
          if (typeof payment === 'string') {
            if (store.hasPayment(payment)) store.paymentReversed(payment);
            else {
              const {data} = await checkout().list({payment_intent:payment,limit:1});
              if (data[0] && store.forSession(data[0],origin)) store.paymentReversed(payment);
            }
          }
        }
        return json(200,{received:true});
      }
      if (req.method === 'GET' && path === '/') {
        if (!readCookie(req)) res.setHeader('Set-Cookie',`crown_order=${randomBytes(32).toString('hex')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        const html = readFileSync(join(assets,'index.html'),'utf8')
          .replace('<html lang="hu">','<html lang="hu" data-stripe-sandbox data-site-billing>')
          .replace('Helyi bemutató','Stripe tesztkörnyezet')
          .replace('Próbavásárlás <span','Tovább a Stripe tesztfizetéshez <span')
          .replace('A próba helyben fut. Nincs kártyaterhelés vagy levélküldés.','Használjon Stripe-tesztkártyát. Az e-mail és a számla a helyi tesztfeladatok közé kerül.');
        res.writeHead(200,{'content-type':types['.html']});
        return res.end(html);
      }
      if (req.method === 'GET' && files.has(path.slice(1))) {
        res.writeHead(200,{'content-type':types[extname(path)]});
        return res.end(readFileSync(join(assets,path.slice(1))));
      }
      if (!path.startsWith('/api/')) throw fail(404,'Ismeretlen oldal.');
      if (req.method === 'POST' && req.headers.origin !== origin) throw fail(403,'Ismeretlen eredet.');
      const owner = readCookie(req);
      if (!owner) throw fail(403,'Nyissa meg újra a helyi utalványoldalt.');
      if (req.method === 'GET' && path === '/api/voucher.pdf') {
        const order=store.owned(owner,url.searchParams.get('session_id') || '');
        if (!order?.code || order.reversed) throw fail(404,'Az utalvány nem érhető el.');
        const bytes=await voucherDocument(pdf,readFileSync(join(assets,'teli-mese-a5.pdf')),order,true);
        res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Crown-Dental-minta-A5.pdf"'});
        return res.end(bytes);
      }
      if (req.method === 'POST' && path === '/api/checkout') {
        const sessions = checkout();
        let order;
        try {
          const {attempt,amount,delivery,billing,recipientName} = JSON.parse(await body(req,8192));
          order = store.request(owner,attempt,amount,delivery,billing,recipientName);
        } catch (error) {
          if (error instanceof SyntaxError) throw fail(400,'Hibás rendelési adatok.');
          if (error.code) throw error;
          throw fail(error.message==='A rendelés időközben megváltozott.'?409:400,error.message);
        }
        const session = order.session ? await sessions.retrieve(order.session) :
          await sessions.create(checkoutParams(order,origin),{idempotencyKey:order.id});
        store.attach(order.id,session);
        if (session.status === 'complete') return json(200,{url:origin+'/?session_id='+encodeURIComponent(session.id)});
        if (session.status !== 'open' || !session.url) throw fail(409,'A fizetési oldal lejárt. Indítson új próbát.');
        return json(200,{url:session.url});
      }
      if (req.method === 'GET' && path === '/api/result') {
        const id = url.searchParams.get('session_id') || '';
        const current = store.owned(owner,id);
        if (!current) throw fail(404,'A rendelés itt nem érhető el.');
        if (!current.code && stripe) {
          const session = await checkout().retrieve(id,{expand:['payment_intent.latest_charge']});
          const charge = session.payment_intent?.latest_charge;
          if (charge?.amount_refunded > 0) store.paymentReversed(session.payment_intent.id);
          if (charge?.created && session.payment_status === 'paid') store.fulfill(session,charge.created,origin);
        }
        const order = store.owned(owner,id);
        if (order.reversed) throw fail(409,'A fizetés visszatérítése miatt az utalvány nem használható.');
        return json(order.code ? 200 : 202,order.code ? order : {pending:true});
      }
      if (path.startsWith('/api/staff/') && req.headers.authorization === 'Bearer '+adminToken) {
        if (req.method === 'GET' && path === '/api/staff/orders') return json(200,store.list());
        if (req.method === 'POST') {
          const {code} = JSON.parse(await body(req,2048));
          if (path === '/api/staff/lookup') return json(200,store.lookup(code) ?? null);
          if (['/api/staff/redeem','/api/staff/collect'].includes(path)) {
            return json(200,{changed:store.staffAction(code,path.endsWith('redeem')?'redeem':'collect')});
          }
        }
      }
      throw fail(404,'Ismeretlen kérés.');
    } catch (error) {
      if (!error.status) console.error('Tesztkérés sikertelen.',error.code || error.type || error.name);
      json(error.status || 502,{error:error.status ? error.message : 'A fizetési művelet nem sikerült. Próbálja újra.'});
    }
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.env.TZ = 'Europe/Budapest';
  process.umask(0o077);
  const key = process.env.STRIPE_SECRET_KEY;
  if (key && !/^(sk|rk)_test_/.test(key)) throw new Error('Csak Stripe szerveroldali tesztkulcs használható.');
  const origin = 'http://127.0.0.1:8790';
  const dir = join(root,'.sandbox');
  mkdirSync(dir,{recursive:true});
  const adminFile = join(dir,'admin-url.txt');
  const adminToken = existsSync(adminFile) ? readFileSync(adminFile,'utf8').trim().split('=')[1] : randomBytes(32).toString('hex');
  writeFileSync(adminFile,origin+'/#admin='+adminToken+'\n',{mode:0o600});
  const store = orderStore(join(dir,'orders.sqlite'));
  const stripe = key ? new Stripe(key,{maxNetworkRetries:2}) : null;
  sandboxServer({store,stripe,webhookSecret:process.env.STRIPE_WEBHOOK_SECRET,adminToken,origin})
    .listen(8790,'127.0.0.1',() => console.log('Crown Dental Stripe tesztoldal: '+origin));
}
