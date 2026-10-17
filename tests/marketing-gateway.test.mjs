import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup(env, fetch) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL('../lib/addToAudience.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const imports = {
    './names': { getContactNameParts: () => ({ firstName: 'Test', lastName: 'Contact' }) },
    './marketingTokens': { createUnsubscribeToken: () => 'a'.repeat(43) },
  };
  vm.runInNewContext(source, { module, exports: module.exports, process: { env }, fetch, AbortSignal, console, require: name => imports[name] });
  return module.exports;
}

test('Crown marketing uses the isolated gateway and never forwards caller-selected brands, provider secrets or resources', async () => {
  const calls = [];
  const api = setup({ CROWN_MARKETING_GATEWAY_TOKEN: 'gateway-test-token', RESEND_API_KEY: 'sending-test-token' }, async (url, options) => {
    calls.push({ url, ...options, body: JSON.parse(options.body) });
    return Response.json({ ok: true });
  });
  assert.equal((await api.addToResendAudience({ email: 'test@example.invalid', payload: { brand: 'beautycrown', audienceId: 'other', url: 'https://other.invalid', locale: 'sk' } })).ok, true);
  assert.equal(calls[0].url, 'https://crown-mail-gateway-erdeszdonats-projects.vercel.app/api/marketing');
  assert.equal(calls[0].headers.Authorization, 'Bearer gateway-test-token');
  assert.equal(calls[0].body.brand, 'crowndental');
  assert.equal(calls[0].body.locale, 'sk');
  assert.equal(calls[0].body.audienceId, undefined);
  assert.equal(calls[0].body.url, undefined);
  assert.ok(!JSON.stringify(calls).includes('sending-test-token'));
  assert.equal((await api.unsubscribeFromResendAudience('test@example.invalid')).ok, true);
  assert.equal(calls[1].body.action, 'unsubscribe');
});

test('missing gateway configuration and provider failures never fall back to broader credentials or report success', async () => {
  const missing = setup({ RESEND_API_KEY: 'sending-test-token' }, async () => { throw new Error('must not call provider'); });
  assert.equal((await missing.unsubscribeFromResendAudience('test@example.invalid')).ok, false);
  const failed = setup({ CROWN_MARKETING_GATEWAY_TOKEN: 'gateway-test-token' }, async () => Response.json({ ok: true }, { status: 502 }));
  assert.equal((await failed.unsubscribeFromResendAudience('test@example.invalid')).ok, false);
});
