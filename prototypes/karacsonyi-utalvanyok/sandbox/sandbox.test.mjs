import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { checkoutParams, nextYear, orderStore } from './orders.mjs';
import { sandboxServer } from './server.mjs';

const billing = {name:'Teszt Vásárló',email:'buyer@example.invalid',country:'HU',postalCode:'2500',city:'Esztergom',line1:'Minta utca 1.'};
const origin = 'http://127.0.0.1:8790';
function fixture(delivery='email') {
  const store = orderStore(':memory:');
  const attempt = randomUUID();
  const order = store.request('owner',attempt,60000,delivery,billing);
  const session = {id:'cs_test_example',livemode:false,mode:'payment',currency:'huf',amount_total:6000000,
    payment_status:'paid',payment_intent:'pi_test',metadata:{},client_reference_id:null,success_url:origin+'/?session_id={CHECKOUT_SESSION_ID}',
    customer_details:{email:'other@example.invalid',address:null}};
  store.attach(order.id,session);
  return {store,attempt,order,session,now:Math.floor(Date.now()/1000)};
}

test('HUF conversion, per-browser ownership, amount and retry validation',()=>{
  const {store,attempt,order,session} = fixture();
  const {line_items,success_url,cancel_url,...settings}=checkoutParams(order,origin);
  assert.deepEqual(settings,{mode:'payment',ui_mode:'hosted_page',billing_address_collection:'auto',
    phone_number_collection:{enabled:false},automatic_tax:{enabled:false},allow_promotion_codes:false,
    submit_type:'auto',integration_identifier:'hosted_web_0001',origin_context:'web'});
  assert.equal(success_url,origin+'/?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(cancel_url,origin+'/?cancelled=1');
  assert.equal(line_items[0].price_data.unit_amount,6000000);
  assert.equal(store.request('owner',attempt,60000,'email',billing).id,order.id);
  assert.throws(()=>store.request('owner',attempt,60000,'email',{...billing,email:'another@example.invalid'}));
  assert.throws(()=>store.request('owner',randomUUID(),60000,'email',{...billing,city:''}));
  assert.equal(store.owned('other',session.id),undefined);
  assert.throws(()=>store.request('owner',attempt,90000,'email',billing));
  for(const amount of [5000,9999,10001,29999,30001,500001,60000.5,'60000']) assert.throws(()=>store.request('owner',randomUUID(),amount,'email',billing));
  for(const amount of [10000,15000,30000,60000,90000,120000,500000]) assert.equal(store.request('owner',randomUUID(),amount,'pickup',billing).amount,amount);
  assert.equal(nextYear('2028-02-29'),'2029-02-28');
});

test('paid amount, verified session, single issue and single separate collection/redemption',()=>{
  const {store,session,now} = fixture('pickup');
  store.fulfill({...session,payment_status:'unpaid'},now);
  store.fulfill({...session,livemode:true},now);
  assert.throws(()=>store.fulfill({...session,amount_total:60000},now));
  assert.throws(()=>store.fulfill({...session,currency:'eur'},now));
  assert.throws(()=>store.fulfill({...session,id:'cs_test_wrong'},now,origin));
  store.fulfill({...session,id:'cs_test_other',success_url:'https://example.invalid/'},now,origin);
  assert.equal(store.list().length,0);
  store.fulfill(session,now);
  assert.equal(JSON.parse(store.db.prepare('select billing from orders where session=?').get(session.id).billing).email,billing.email);
  const {code}=store.list()[0];
  store.fulfill(session,now+10);
  assert.match(code,/^[A-Z2-9]{20}$/);
  assert.equal(store.list()[0].code,code);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM jobs').get().n,2);
  assert.equal(store.staffAction(code,'collect'),false);
  const pickup = new Date((now + 4 * 86400) * 1000);
  assert.equal(store.staffAction(code,'collect',pickup),true);
  assert.equal(store.staffAction(code,'collect',pickup),false);
  assert.equal(store.staffAction(code,'redeem',pickup),true);
  assert.equal(store.staffAction(code,'redeem',pickup),false);
  const late=fixture('pickup');
  const issued=new Date('2026-12-21T11:00:00Z');
  late.store.fulfill(late.session,issued.getTime()/1000);
  const [record]=late.store.list();
  assert.equal(late.store.staffAction(record.code,'collect',new Date('2026-12-23T22:59:00Z')),false);
  if (late.store.db.prepare("SELECT name FROM sqlite_master WHERE name='voucher_pickup_from_window'").get())
    assert.equal(late.store.db.prepare("UPDATE orders SET collectedAt='2026-12-23T22:59:00Z' WHERE code=?").run(record.code).changes,0);
  assert.equal(late.store.staffAction(record.code,'collect',new Date('2026-12-23T23:00:00Z')),true);
  assert.equal(late.store.staffAction(record.code,'redeem',new Date('2026-12-25T12:00:00Z')),true);
});

test('refunds before or after payment disable voucher use',()=>{
  for(const before of [true,false]){
    const {store,session,now}=fixture();
    if(before) store.paymentReversed(session.payment_intent);
    store.fulfill(session,now);
    if(before) {
      assert.equal(store.list().length,0);
      assert.equal(store.owned('owner',session.id).reversed,1);
    }
    else {
      store.paymentReversed(session.payment_intent);
      const [voucher]=store.list();
      assert.equal(voucher.reversed,1);
      assert.equal(store.staffAction(voucher.code,'redeem'),false);
    }
  }
});

test('Stripe SDK verifies webhook signatures and replayed paid events create only one voucher',async t=>{
  const {store,session,now}=fixture();
  const secret='whsec_local_fixture';
  const origin='http://127.0.0.1:8790';
  const server=sandboxServer({store,stripe:null,webhookSecret:secret,adminToken:'fixture',origin});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const target='http://127.0.0.1:'+server.address().port+'/stripe/webhook';
  const {request}=await import('node:http');
  const post=(body,signature)=>new Promise((resolve,reject)=>{
    const req=request(target,{method:'POST',headers:{host:'127.0.0.1:8790','stripe-signature':signature}},r=>{
      r.resume();r.on('end',()=>resolve(r.statusCode));
    });
    req.on('error',reject);req.end(body);
  });
  const payload=JSON.stringify({type:'checkout.session.completed',created:now,livemode:false,data:{object:session}});
  assert.equal(await post(payload,'invalid'),400);
  const signature=Stripe.webhooks.generateTestHeaderString({payload,secret});
  assert.deepEqual(await Promise.all([post(payload,signature),post(payload,signature)]),[200,200]);
  assert.equal(store.list().length,1);
  const call=(path,method,headers={},body)=>new Promise((resolve,reject)=>{
    const req=request(new URL(path,target),{method,headers:{host:'127.0.0.1:8790',...headers}},r=>{
      const parts=[];r.on('data',b=>parts.push(b));r.on('end',()=>resolve({status:r.statusCode,body:Buffer.concat(parts)}));
    });req.on('error',reject);req.end(body);
  });
  const cookie='crown_order='+'a'.repeat(64);
  store.db.prepare('UPDATE orders SET owner=?').run('a'.repeat(64));
  const download='/api/voucher.pdf?session_id='+session.id;
  const owned=await call(download,'GET',{cookie});
  assert.equal(owned.status,200);assert.equal(owned.body.subarray(0,5).toString(),'%PDF-');
  assert.equal((await call(download,'GET',{cookie:'crown_order='+'b'.repeat(64)})).status,404);
  const staff={cookie,origin,authorization:'Bearer fixture'};
  const redeem=()=>call('/api/staff/redeem','POST',staff,JSON.stringify({code:store.list()[0].code}));
  const concurrent=await Promise.all([redeem(),redeem()]);
  assert.deepEqual(concurrent.map(r=>JSON.parse(r.body).changed).sort(),[false,true]);
  store.paymentReversed(session.payment_intent);
  assert.equal((await call(download,'GET',{cookie})).status,404);
});
