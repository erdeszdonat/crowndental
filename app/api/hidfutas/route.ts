import { randomInt } from 'node:crypto';
import { after } from 'next/server';
import { HIDFUTAS } from '@/lib/hidfutas';
import { hidfutasDatabase, normalizeHidfutasPhone, syncHidfutasMarketing } from '@/lib/hidfutasServer';
import { enforceRateLimit, isValidEmail, noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  if (!request.headers.get('content-type')?.includes('application/json')) return noStoreJson({ error: 'Érvénytelen kérés.' }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 4096) return noStoreJson({ error: 'Túl hosszú kérés.' }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return noStoreJson({ error: 'Érvénytelen kérés.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return noStoreJson({ error: 'Érvénytelen kérés.' }, { status: 400 });
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' && body.phone.length <= 25 ? normalizeHidfutasPhone(body.phone) : null;
  if (body.website || name.length < 3 || name.length > 120 || /[\u0000-\u001f<>]/.test(name) || !isValidEmail(email) || !phone) {
    return noStoreJson({ error: 'Kérjük, ellenőrizd a neved, az e-mail-címed és a nemzetközi formátumú telefonszámod.' }, { status: 400 });
  }
  if (body.rules !== true || typeof body.marketing !== 'boolean' || body.rulesVersion !== HIDFUTAS.rulesVersion) {
    return noStoreJson({ error: 'A nevezéshez fogadd el a játékszabályzatot és a nagykorúsági nyilatkozatot.' }, { status: 400 });
  }
  if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) {
    return noStoreJson({ error: 'Frissítsd az oldalt, majd próbáld újra.' }, { status: 400 });
  }
  try {
    // Shared event Wi-Fi must still accommodate a group entering together.
    const rateError = await enforceRateLimit(request, 'hidfutas', { limit: 120, windowMs: 60_000 });
    if (rateError) return rateError;
    const db = hidfutasDatabase();
    const { data, error } = await db.rpc('register_hidfutas_entry', {
      p_request_id: body.requestId, p_name: name, p_email: email, p_phone: phone,
      p_rules_version: body.rulesVersion, p_marketing: body.marketing, p_sector: randomInt(5),
    });
    if (error || !data) throw new Error('registration_failed');
    const messages: Record<string, string> = {
      not_started: 'A játék szeptember 26-án, szombaton 9:00-kor indul. Várunk a Hídfutáson!',
      closed: 'A nevezés szeptember 26-án 13:00-kor lezárult. A főnyeremény sorsolása hétfőn lesz.',
      already_registered: 'Ezzel az e-mail-címmel vagy telefonszámmal már történt nevezés. Ha elveszett a kódod, segítünk a Crown Dental sátránál.',
      request_conflict: 'Ehhez a böngészőhöz már tartozik nevezés. Segítségért keresd a Crown Dental munkatársait.',
      rules_changed: 'Frissült a játékszabályzat. Kérjük, frissítsd az oldalt.',
    };
    if (data.error) return noStoreJson({ error: messages[data.error] || 'A nevezés átmenetileg nem érhető el.' }, { status: data.error === 'unavailable' ? 503 : 409 });
    if (data.created && body.marketing) after(async () => { await syncHidfutasMarketing(data.id); });
    return noStoreJson({ receipt: data.receipt });
  } catch {
    return noStoreJson({ error: 'A nevezés átmenetileg nem érhető el. Próbáld újra; csak a sikeresen mentett nevezés után pörgetünk.' }, { status: 503 });
  }
}
