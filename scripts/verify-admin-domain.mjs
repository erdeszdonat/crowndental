import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
const base = process.env.ADMIN_VERIFY_BASE || 'http://127.0.0.1:3050';
async function read(path, host = 'admin.crowndental.hu', method = 'GET') {
  // Node fetch normalizes Host; raw HTTP is needed to exercise domain routing locally.
  return new Promise((resolve, reject) => {
    const url = new URL(base + path);
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.request(url, { method, headers: { Host: host } }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(new Response(Buffer.concat(chunks), { status: response.statusCode, headers: response.headers })));
    });
    req.on('error', reject);
    req.end();
  });
}
const chooser = await read('/');
assert.equal(chooser.status, 200);
assert.match(chooser.headers.get('x-robots-tag'), /noindex/);
const html = await chooser.text();
assert.match(html, /Melyik felületet nyitja meg/);
assert.match(html, /href="\/crown-dental"/);
assert.match(html, /href="\/beauty-crown"/);
assert.doesNotMatch(html, /type="password"/);
const login = await read('/crown-dental');
assert.equal(login.status, 200);
assert.match(await login.text(), /autoComplete="current-password"/i);
const beauty = await read('/beauty-crown');
assert.equal(beauty.status, 200);
const beautyHtml = await beauty.text();
assert.match(beautyHtml, /Hamarosan itt is találkozunk/);
assert.doesNotMatch(beautyHtml, /type="password"/);
for (const [path, destination] of [['/admin','/'], ['/admin/hidfutas','/crown-dental/hidfutas']]) {
  const response = await read(path, 'www.crowndental.hu');
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://admin.crowndental.hu' + destination);
}
assert.equal((await read('/api/admin-data', 'www.crowndental.hu', 'POST')).status, 421);
assert.ok([401,503].includes((await read('/api/admin-data', 'admin.crowndental.hu', 'POST')).status));
assert.equal((await read('/api/book-appointment', 'admin.crowndental.hu', 'POST')).status, 404);
assert.match(await (await read('/robots.txt')).text(), /Disallow: \//);
assert.equal((await read('/', 'www.crowndental.hu')).status, 200);
console.log('PASS: built server host routing, brand chooser, login, Beauty placeholder, old redirects, private APIs, robots and public homepage. No credentials, email or patient data used.');
