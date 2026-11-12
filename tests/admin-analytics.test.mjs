import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { randomUUID } from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
function load(file, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), { compilerOptions:{ module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,Date,Intl,URL,URLSearchParams,Request,Response,console,
    require: name => { if (name in mocks) return mocks[name]; if (name.startsWith('./')) return load(path.join(path.dirname(file),name+'.ts'),mocks,globals); throw Error(name); },...globals});
  return module.exports;
}
const dates=load('lib/analyticsDates.ts'); const rules=load('lib/analyticsValidation.ts');
test('calendar presets use full previous week/month/year including leap years',()=>{
  assert.equal(JSON.stringify(dates.presetRange('last_week','2026-11-12')),JSON.stringify({from:'2026-11-02',to:'2026-11-08'}));
  assert.equal(JSON.stringify(dates.presetRange('last_month','2024-03-31')),JSON.stringify({from:'2024-02-01',to:'2024-02-29'}));
  assert.equal(JSON.stringify(dates.presetRange('last_year','2026-01-01')),JSON.stringify({from:'2025-01-01',to:'2025-12-31'}));
  assert.equal(dates.validDay('2026-02-30'),false); assert.equal(dates.validDay('2024-02-29'),true);
});
test('Budapest calendar does not depend on server timezone and comparisons cross DST correctly',()=>{
  assert.equal(dates.localDay(new Date('2026-11-11T23:30:00Z')),'2026-11-12');
  assert.equal(dates.rangeDays({from:'2026-03-28',to:'2026-03-30'}),3);
  assert.equal(JSON.stringify(dates.previousRange({from:'2026-03-28',to:'2026-03-30'})),JSON.stringify({from:'2026-03-25',to:'2026-03-27'}));
});
test('traffic attribution distinguishes paid, organic, social and missing referrers without retaining URLs or click IDs',()=>{
  assert.equal(rules.trafficSource('?gclid=private-id','').source,'google');
  assert.equal(rules.trafficSource('','https://www.google.sk/search?q=private').medium,'organic');
  assert.equal(rules.trafficSource('','https://lm.facebook.com/path?private=secret').source,'facebook');
  assert.equal(rules.trafficSource('','https://www.crowndental.hu/idopont').source,'direct');
  assert.equal(rules.trafficSource('','https://unknown.example/private').source,'other-referral');
  const r=rules.trafficSource('?utm_source=facebook&utm_medium=paid_social&utm_campaign=primas-nyitas&email=secret@example.com','');
  assert.equal(r.campaign,'primas-nyitas'); assert.equal(JSON.stringify(r).includes('secret'),false);
  assert.equal(rules.safeTag('email@example.com'),''); assert.equal(rules.safeTag('36706042500'),'');
});
test('ingestion allowlist rejects client-created successful bookings and strips arbitrary properties',()=>{
  assert.equal(rules.cleanAnalyticsEvent({id:randomUUID(),event:'booking_success'}),null);
  const r=rules.cleanAnalyticsEvent({id:randomUUID(),event:'engagement',page:'/admin/private',duration:99999999,name:'PRIVATE',email:'PRIVATE',step:99,placement:'PRIVATE',at:1});
  assert.equal(r.page,'other'); assert.equal(r.duration,30000); assert.equal(r.step,0);
  assert.equal(JSON.stringify(r).includes('PRIVATE'),false); assert.ok(r.at>Date.now()-1000);
  assert.equal(rules.cleanAnalyticsEvent({id:'bad',event:'page_view'}),null);
});
test('admin report cannot invoke service queries without a live authorized admin session',async()=>{
  let calls=0;
  const route=load('app/api/admin/analytics/route.ts',{
    '@/lib/staffAuth':{requireStaffOrigin:()=>null,authorizeStaff:async(req,role)=>{assert.equal(role,'admin');return {error:new Response('{}',{status:403})};},staffServiceClient:()=>{calls++;throw Error('unexpected');}},
    '@/lib/serverSecurity':{noStoreJson:(body,init)=>Response.json(body,init)},'@/lib/analyticsDates':dates,
  });
  assert.equal((await route.POST(new Request('https://www.crowndental.hu/api/admin/analytics',{method:'POST'}))).status,403); assert.equal(calls,0);
});
test('admin report rejects impossible and future ranges before database calls',async()=>{
  const route=load('app/api/admin/analytics/route.ts',{
    '@/lib/staffAuth':{requireStaffOrigin:()=>null,authorizeStaff:async()=>({context:{role:'admin'}}),staffServiceClient:()=>{throw Error('must not query');}},
    '@/lib/serverSecurity':{noStoreJson:(body,init)=>Response.json(body,init)},'@/lib/analyticsDates':dates,
  });
  for(const body of [{from:'2026-02-30',to:'2026-03-01'},{from:'2026-03-01',to:'2026-02-01'},{from:'2099-01-01',to:'2099-02-01'},{from:'2000-01-01',to:'2026-01-01'}]) {
    assert.equal((await route.POST(new Request('https://www.crowndental.hu/api/admin/analytics',{method:'POST',body:JSON.stringify(body)}))).status,400);
  }
});
test('session persistence only accepts explicit consent and safe dimensions',async()=>{
  let saved;const db={from:()=>({upsert:async data=>{saved=data;return {error:null};}})};
  const server=load('lib/analyticsServer.ts'); const input={id:randomUUID(),visitor:randomUUID(),consent:false,source:'facebook',landing:'home',device:'mobile',language:'hu'};
  assert.equal(await server.captureAnalyticsSession(db,input),null);assert.equal(saved,undefined);
  const id=await server.captureAnalyticsSession(db,{...input,consent:true,email:'PRIVATE',campaign:'private@example.com'});
  assert.equal(id,input.id);assert.equal(saved.campaign,'');assert.equal(JSON.stringify(saved).includes('PRIVATE'),false);
});
test('zero denominators return no rate rather than invented zero or infinity',()=>{
  const r=load('lib/analyticsReport.ts');assert.equal(r.percent(0,0),null);assert.equal(r.percent(2,8),25);assert.equal(r.change(10,0),null);
});

function collector({consent=true}={}) {
  let now=1_800_000_000_000, perf=0, allowed=consent;
  const requests=[], intervals=new Set();
  const target=()=>{const listeners=new Map();return {addEventListener:(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener:(name,fn)=>listeners.get(name)?.delete(fn),emit:(name,detail)=>{for(const fn of listeners.get(name)||[])fn({detail});}};};
  const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,v)=>data.set(key,v),removeItem:key=>data.delete(key),data};};
  const localStorage=storage(),sessionStorage=storage();
  const window={...target(),location:{pathname:'/idopont',search:'?utm_source=facebook&utm_medium=paid_social&utm_campaign=nyitas'},setInterval:fn=>{intervals.add(fn);return fn;},clearInterval:fn=>intervals.delete(fn)};
  const document={...target(),referrer:'',visibilityState:'visible'};
  const api=load('lib/firstPartyAnalytics.ts',{'./siteAnalytics':{canMeasure:()=>allowed,measurementPage:p=>p.slice(1)||'home',ANALYTICS_READY_EVENT:'ready'}},{window,document,localStorage,sessionStorage,navigator:{userAgent:'Desktop'},crypto:{randomUUID},performance:{now:()=>perf},Date:class extends Date {static now(){return now;}},fetch:async(url,init)=>{requests.push(JSON.parse(init.body));return {ok:true,status:200};}});
  return {api,requests,localStorage,sessionStorage,window,document,
    consent:v=>{allowed=v;window.emit('crown-measurement-consent');},
    tick:async(ms=15000)=>{now+=ms;perf+=ms;for(const fn of intervals)fn();await new Promise(resolve=>setImmediate(resolve));},
    drain:async()=>{await new Promise(resolve=>setImmediate(resolve));}};
}
test('client collector never stores or sends analytics without consent and clears identifiers on revocation',async()=>{
  const c=collector({consent:false});const stop=c.api.startFirstPartyAnalytics('/idopont');
  await c.tick();assert.equal(c.requests.length,0);assert.equal(c.localStorage.data.size,0);assert.equal(c.api.bookingAnalyticsContext(),null);
  c.consent(true);await c.drain();assert.equal(c.requests.length,1);assert.equal(c.requests[0].events[0].event,'page_view');assert.equal(c.localStorage.data.size,1);
  c.consent(false);const count=c.requests.length;await c.tick();assert.equal(c.requests.length,count);assert.equal(c.localStorage.data.size,0);assert.equal(c.sessionStorage.data.size,0);stop();
});
test('active time excludes hidden tabs, idle time and long suspension',async()=>{
  const c=collector();const stop=c.api.startFirstPartyAnalytics('/idopont');await c.drain();await c.tick();
  const total=()=>c.requests.flatMap(r=>r.events).filter(e=>e.event==='engagement').reduce((n,e)=>n+e.duration,0);
  assert.equal(total(),15000);c.document.visibilityState='hidden';c.document.emit('visibilitychange');await c.tick();assert.equal(total(),15000);
  c.document.visibilityState='visible';c.document.emit('visibilitychange');await c.tick(60000);assert.equal(total(),15000);
  c.window.emit('pointerdown');await c.tick(45000);assert.equal(total(),15000);
  c.window.emit('pointerdown');await c.tick();assert.equal(total(),30000);stop();
});
test('remounts deduplicate page views, a new session preserves visitor but refreshes source after inactivity',async()=>{
  const c=collector();let stop=c.api.startFirstPartyAnalytics('/idopont');await c.drain();const first=c.api.bookingAnalyticsContext();
  stop();await c.drain();stop=c.api.startFirstPartyAnalytics('/idopont');await c.drain();
  assert.equal(c.requests.flatMap(r=>r.events).filter(e=>e.event==='page_view').length,1);
  await c.tick(31*60000);c.window.location.search='?utm_source=google&utm_medium=cpc';c.window.emit('pointerdown');await c.tick();
  const next=c.api.bookingAnalyticsContext();assert.notEqual(first.id,next.id);assert.equal(first.visitor,next.visitor);assert.equal(next.source,'google');
  assert.equal(c.requests.flatMap(r=>r.events).filter(e=>e.event==='page_view').length,2);stop();
});
test('client success events cannot manufacture bookings and form events keep safe dimensions',async()=>{
  const c=collector();const stop=c.api.startFirstPartyAnalytics('/idopont');await c.drain();
  c.window.emit('crown-site-event',{event:'booking_success',name:'PRIVATE'});await c.drain();
  c.window.emit('crown-site-event',{event:'booking_start',step:1,email:'PRIVATE'});await c.drain();
  const events=c.requests.flatMap(r=>r.events);assert.equal(events.some(e=>e.event==='booking_success'),false);assert.equal(events.some(e=>e.event==='booking_start'),true);assert.equal(JSON.stringify(events).includes('PRIVATE'),false);stop();
});
