import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
function compile(source, imports = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => imports[name] ?? require(name), Request, Response, File, Buffer, console, ...globals });
  return module.exports;
}
const pricing = compile(read('lib/quotePricing.ts'));
const copy = compile(read('lib/quoteCopy.ts'));
// Competitor line prices are synthetic test data; only the supplied final total is a real requirement.
const fixture = JSON.parse(read('tests/fixtures/quote-example.json'));
const result = pricing.validateQuoteResult(fixture);
const home = read('app/[locale]/HomeClient.tsx');
const browser = compile(home.slice(home.indexOf('function isQuoteAnalysisResult'), home.indexOf('function createQuoteIdempotencyKey')).replace('function isQuoteAnalysisResult', 'export function isQuoteAnalysisResult'));
const pdf = compile(home.slice(home.indexOf('function escapePdfHtml'), home.indexOf('// ─── Original three-slide')).replace('function buildPDF', 'export function buildPDF'), {}, copy);
const comparison = compile(read('components/QuoteComparison.tsx'), { '@/lib/quoteCopy': copy }).default;
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

test('supplied example totals 555–570k with 164–179k difference and five free fees', () => {
  assert.equal(result.ourTotalMin, 555000); assert.equal(result.ourTotalMax, 570000);
  assert.equal(result.competitorTotal, 734000); assert.equal(result.savingsMin, 164000); assert.equal(result.savingsMax, 179000);
  assert.equal(result.requiresManualReview, false);
  assert.equal(result.items.filter(item => item.ourPriceMax === 0).length, 5);
  assert.equal(result.items[1].ourPriceMax, 40000);
  assert.ok(browser.isQuoteAnalysisResult(result));
  const restored = pricing.validateStoredQuoteResult(JSON.stringify(result.items));
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), JSON.parse(JSON.stringify(result)));
  assert.ok(browser.isQuoteAnalysisResult(restored));
});

test('sinus lift is included only for the same site, in either line order and with correct quantities', () => {
  const bone = { name: 'Bone graft', competitorPrice: 200000, quantity: 1, priceListKey: 'Csontpótlás', boneGraftGroup: 'left' };
  const sinus = { ...bone, name: 'Sinus lift', priceListKey: 'Arcüregemelés (sinus lift)' };
  const calc = items => pricing.validateQuoteResult({ currency: 'HUF', items });
  for (const items of [[bone,sinus],[sinus,bone]]) {
    const combined = calc(items);
    assert.equal(combined.ourTotalMax, 200000); assert.equal(combined.items[1].includedInPackage, true);
    assert.equal(combined.competitorTotal, 400000);
    assert.equal(pricing.validateStoredQuoteResult(combined.items).items[1].includedInPackage, true);
  }
  assert.equal(calc([bone,{ ...sinus,boneGraftGroup:'right' }]).ourTotalMax,400000);
  assert.equal(calc([bone,{ ...sinus,boneGraftGroup:'' }]).ourTotalMax,400000);
  assert.equal(calc([{...bone,quantity:2},sinus]).ourTotalMax,400000);
  assert.equal(calc([bone,{...sinus,quantity:2},bone]).ourTotalMax,400000);
});

test('unknown items never become free or produce fictitious total savings; DIO retains its own price', () => {
  const unknown = pricing.validateQuoteResult({ currency:'HUF', items:[{name:'Unlisted membrane', competitorPrice:50000,quantity:1,priceListKey:''}] });
  assert.equal(unknown.items[0].ourPriceMin,null); assert.equal(unknown.ourTotalMin,null); assert.equal(unknown.savingsMax,null);
  assert.ok(browser.isQuoteAnalysisResult(unknown));
  const dio = pricing.validateQuoteResult({currency:'HUF',items:[{name:'DIO',competitorPrice:250000,quantity:1,priceListKey:'DIO Implantátum'}]});
  assert.equal(dio.ourTotalMax,240000);
});

test('rejects malformed amounts, document total mismatches, non-HUF and tampered client results', () => {
  for (const patch of [{competitorPrice:null},{competitorPrice:'100'},{competitorPrice:-1},{competitorPrice:1.5},{quantity:1.5},{quantity:0},{quantity:101}]) {
    assert.equal(pricing.validateQuoteResult({currency:'HUF',items:[{...fixture.items[0],...patch}]}),null);
  }
  assert.equal(pricing.validateQuoteResult({...fixture,documentTotal:735000}),null);
  assert.equal(pricing.validateQuoteResult({...fixture,currency:'EUR'}),null);
  assert.equal(browser.isQuoteAnalysisResult({...result,ourTotalMin:1}),false);
  assert.equal(pricing.validateStoredQuoteResult([{...result.items[0],ourPriceMin:-1}]),null);
});

for (const locale of ['hu','en','sk','de']) {
  test(locale + ': page, PDF and published tariff include free fees, disclosure and localized consultation CTA', () => {
    const c = copy.quoteResultCopy[locale];
    const markup = renderToStaticMarkup(React.createElement(comparison,{result,locale,heading:'Test',treatmentLabel:'Treatment',originalLabel:'Other'}));
    const printed = pdf.buildPDF(result,'Test <script>','','','',''+locale);
    for (const html of [markup,printed]) {
      assert.ok(html.includes(c.disclaimer)); assert.ok(html.includes(c.free)); assert.ok(html.includes(c.book));
      assert.ok(html.includes((locale==='hu'?'':'/'+locale)+'/idopont'));
      assert.doesNotMatch(html,/Kézi|Manual review|manuálna kontrola|Manuelle Prüfung/);
    }
    assert.ok(markup.indexOf(c.book)<markup.indexOf('<table'));
    assert.ok(printed.includes('&lt;script&gt;'));
    const tariff = JSON.parse(read('messages/'+locale+'.json')).treatments.priceCategories.find(c => c.id==='szajsebeszet').items;
    assert.equal(tariff.filter(item=>item.price===c.free).length,5);
    assert.ok(tariff.some(item=>item.price.replace(/\D/g,'')==='200000'&&/sinus/i.test(item.name)));
  });
}

test('API persists correct ranges and emails the same free fees and CTA, including stored-result retries', async () => {
  let stored, email, calls=0;
  const query = { select:()=>query,eq:()=>query,maybeSingle:async()=>({data:stored?{...stored,id:'fixture'}:null}),insert:row=>{stored=row;return query;},single:async()=>({data:{id:'fixture'}}),update:()=>({eq:async()=>({error:null})}) };
  const security = {
    rejectUntrustedMutation:()=>null,enforceRateLimit:async()=>null,claimIdempotency:()=>true,getIdempotencyKey:()=> 'test-key',completeIdempotency:()=>{},releaseIdempotency:()=>{},
    cleanText:(v,n)=>typeof v==='string'?v.slice(0,n):'',isValidEmail:()=>true,isValidPhone:()=>true,normalizeEmail:v=>v,normalizeLocale:v=>v,noStoreJson:(value,init)=>Response.json(value,init),
  };
  const api = compile(read('app/api/analyze-quote/route.ts'), {
    '@/lib/quotePricing':pricing,'@/lib/quoteCopy':copy,'@/lib/serverSecurity':security,'@/lib/names':{getPreferredGreetingName:n=>n},
    '@supabase/supabase-js':{createClient:()=>({from:()=>query})},
    '@google/generative-ai':{SchemaType:{OBJECT:'OBJECT',ARRAY:'ARRAY',STRING:'STRING',NUMBER:'NUMBER'},GoogleGenerativeAI:class {getGenerativeModel(){return {generateContent:async()=>{calls++;return {response:{text:()=>JSON.stringify(fixture)}}}};}}},
    '@/lib/addToAudience':{sendTransactionalEmail:async(payload)=>{email=payload;return {ok:true};}},
  }, {process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test',GEMINI_API_KEY:'test'}}});
  const request=()=>{const data=new FormData();data.set('file',new File(['%PDF-fixture'], 'quote.pdf',{type:'application/pdf'}));for(const [key,value]of Object.entries({name:'Test <script>',email:'test@example.invalid',locale:'hu',acceptedTerms:'true',aiProcessingConsent:'true'}))data.set(key,value);return new Request('https://example.invalid/api/analyze-quote',{method:'POST',body:data});};
  for(let i=0;i<2;i++) {
    const response=await api.POST(request());assert.equal(response.status,200);const payload=await response.json();
    assert.equal(payload.result.ourTotalMin,555000);assert.equal(payload.result.savingsMax,179000);assert.equal(payload.emailSent,true);
    assert.ok(email.html.includes(copy.quoteResultCopy.hu.disclaimer));assert.ok(email.html.includes('Díjmentes'));assert.ok(email.html.includes('https://www.crowndental.hu/idopont'));assert.ok(email.html.includes('&lt;script&gt;'));
    assert.equal(stored.crown_total_max,570000);assert.equal(stored.new_total,null);assert.equal(stored.requires_manual_review,false);
  }
  assert.equal(calls,1,'retry must reuse the saved zero-price result without rerunning AI');
});
