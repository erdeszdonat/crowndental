import { requireAdminSession } from '@/lib/adminAuth';
import { noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';
import { hidfutasDatabase, syncHidfutasMarketing } from '@/lib/hidfutasServer';
import { sendTransactionalEmail } from '@/lib/addToAudience';
import { HIDFUTAS } from '@/lib/hidfutas';

export const maxDuration = 60;
const FIELDS = 'id,code,name,email,phone,prize,created_at,redeemed_at,marketing_consent,marketing_synced_at,marketing_error';

export async function GET(request: Request) {
  const authError = requireAdminSession(request);
  if (authError) return authError;
  try {
    const db = hidfutasDatabase();
    const search = new URL(request.url).searchParams;
    const page = Math.max(0, Math.min(10000, Number.parseInt(search.get('page') || '0', 10) || 0));
    const query = (search.get('q') || '').trim().slice(0, 120);
    let entriesQuery = db.from('hidfutas_entries').select(FIELDS, { count: 'exact' }).eq('campaign_id', HIDFUTAS.id).order('created_at', { ascending: false });
    // Treat input as a literal substring, never a PostgREST filter expression.
    if (query) entriesQuery = entriesQuery.ilike('code', `%${query.replace(/[%_\\]/g, '\\$&')}%`);
    const [entries, count, pending, draw] = await Promise.all([
      entriesQuery.range(page * 50, page * 50 + 49),
      db.from('hidfutas_entries').select('id', { count: 'exact', head: true }).eq('campaign_id', HIDFUTAS.id),
      db.from('hidfutas_entries').select('id', { count: 'exact', head: true }).eq('campaign_id', HIDFUTAS.id).eq('marketing_consent', true).is('marketing_synced_at', null).or('marketing_error.is.null,marketing_error.neq.consent_withdrawn'),
      db.from('hidfutas_draws').select('*').eq('campaign_id', HIDFUTAS.id).maybeSingle(),
    ]);
    if (entries.error || count.error || pending.error || draw.error) throw new Error('query_failed');
    let winner = null;
    if (draw.data) {
      const winnerQuery = await db.from('hidfutas_entries').select(FIELDS).eq('id', draw.data.winner_id).single();
      if (winnerQuery.error) throw new Error('winner_query_failed');
      winner = winnerQuery.data;
    }
    return noStoreJson({ entries: entries.data, total: count.count, filtered: entries.count, pending: pending.count, draw: draw.data, winner, canDraw: Date.now() >= Date.parse(HIDFUTAS.drawAt) });
  } catch { return noStoreJson({ error: 'A játék adatai most nem tölthetők be.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const originError = rejectUntrustedMutation(request);
  if (originError) return originError;
  const authError = requireAdminSession(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const db = hidfutasDatabase();
    if (body.action === 'redeem') {
      if (typeof body.code !== 'string' || !/^HF-[A-F0-9]{12}$/.test(body.code)) return noStoreJson({ error: 'Érvénytelen kód.' }, { status: 400 });
      if (Date.now() < Date.parse(HIDFUTAS.startsAt) || Date.now() >= Date.parse(HIDFUTAS.closesAt)) return noStoreJson({ error: 'Az ajándékátvételi időszak 2026. szeptember 26., 9:00–13:00.' }, { status: 409 });
      const { data, error } = await db.from('hidfutas_entries').update({ redeemed_at: new Date().toISOString() })
        .eq('campaign_id', HIDFUTAS.id).eq('code', body.code).neq('prize', 'none').is('redeemed_at', null).select('id').maybeSingle();
      if (error) throw error;
      if (!data) return noStoreJson({ error: 'A kód nem található, nem nyert ajándékot, vagy már beváltották.' }, { status: 409 });
      return noStoreJson({ success: true });
    }
    if (body.action === 'draw') {
      const { data, error } = await db.rpc('draw_hidfutas_winner');
      if (error) throw error;
      if (data?.error) return noStoreJson({ error: data.error === 'too_early' ? 'A sorsolás legkorábban szeptember 28-án indítható.' : 'Még nincs sorsolható nevezés.' }, { status: 409 });
      return noStoreJson({ success: true });
    }
    if (body.action === 'sync_marketing') {
      const { data, error } = await db.from('hidfutas_entries').select('id').eq('campaign_id', HIDFUTAS.id)
        .eq('marketing_consent', true).is('marketing_synced_at', null)
        .or('marketing_error.is.null,marketing_error.neq.consent_withdrawn')
        .or(`marketing_attempted_at.is.null,marketing_attempted_at.lt.${new Date(Date.now() - 5 * 60_000).toISOString()}`).limit(10);
      if (error) throw error;
      // Avoid provider bursts and keep the request within the function deadline.
      for (const entry of data || []) await syncHidfutasMarketing(entry.id);
      return noStoreJson({ success: true, attempted: data?.length || 0 });
    }
    if (['send_winner_email', 'mark_phone', 'mark_facebook'].includes(body.action)) {
      const { data: draw, error } = await db.from('hidfutas_draws').select('*').eq('campaign_id', HIDFUTAS.id).single();
      if (error || !draw) return noStoreJson({ error: 'Előbb végezd el a sorsolást.' }, { status: 409 });
      if (body.action === 'send_winner_email') {
        if (draw.email_sent_at) return noStoreJson({ success: true, alreadySent: true });
        // Resend retains idempotency keys for 24h. Freeze a first attempt and
        // require manual provider reconciliation instead of blindly retrying
        // after that window if the response/DB acknowledgement was lost.
        const now = new Date().toISOString();
        if (!draw.email_attempted_at) {
          const claim = await db.from('hidfutas_draws').update({ email_attempted_at: now }).eq('campaign_id', HIDFUTAS.id).is('email_attempted_at', null).select('email_attempted_at').maybeSingle();
          if (claim.error) throw claim.error;
          if (!claim.data) return noStoreJson({ error: 'Az e-mail-küldés már folyamatban van.' }, { status: 409 });
          draw.email_attempted_at = claim.data.email_attempted_at;
        }
        if (Date.now() - Date.parse(draw.email_attempted_at) > 23 * 60 * 60_000) return noStoreJson({ error: 'A korábbi küldés állapotát előbb ellenőrizd a Resendben. Automatikus ismétlés 23 óra után nem indul.' }, { status: 409 });
        const { data: winner, error: winnerError } = await db.from('hidfutas_entries').select('email,code').eq('id', draw.winner_id).single();
        if (winnerError || !winner) throw winnerError;
        const sent = await sendTransactionalEmail({
          from: 'Crown Dental <info@crowndental.hu>', to: winner.email,
          subject: 'Gratulálunk! Te nyerted a Crown Dental Hídfutás főnyereményét!',
          html: `<div style="font-family:Arial,sans-serif;color:#123548;max-width:580px;line-height:1.7"><h1>Most a mosolyodé a főszerep!</h1><p>Gratulálunk! A Crown Dental Hídfutás nyereményjátékában te nyerted az <strong>1 alkalom rendelői fogfehérítést</strong>.</p><p>Nevezési kódod: <strong>${winner.code}</strong></p><p>Kérjük, 7 napon belül jelezd a nyeremény elfogadását erre az e-mailre válaszolva vagy a <a href="tel:+36305892468">+36 30 589 2468</a> számon. A kezelés időpontját személyesen egyeztetjük; beváltási határidő: 2026. december 31.</p><p>A kezelés előtt fogorvosi alkalmassági ellenőrzést végzünk.</p><p><a href="https://www.crowndental.hu/hidfutas/szabalyzat">Játékszabályzat és adatkezelés</a></p><p>Üdvözlettel,<br />a Crown Dental csapata</p><hr /><p style="font-size:12px">Ez a nyereményjáték eredményéről szóló értesítés, nem hírlevél. Crown Dental Praxis és Labor Fogászati Kft. · 2500 Esztergom, Petőfi Sándor utca 11.</p></div>`,
        }, `hidfutas-winner-${draw.winner_id}`);
        if (!sent.ok) return noStoreJson({ error: 'Az e-mail küldése nem sikerült. A nyertes változatlan; a küldést később újra megpróbálhatod.' }, { status: 502 });
        const saved = await db.from('hidfutas_draws').update({ email_sent_at: now, email_provider_id: sent.providerId || null }).eq('campaign_id', HIDFUTAS.id);
        if (saved.error) return noStoreJson({ error: 'A Resend befogadta az e-mailt, de a visszaigazolás mentése nem sikerült. Frissíts és ellenőrizd a küldés állapotát.' }, { status: 503 });
      } else {
        const field = body.action === 'mark_phone' ? 'phone_contacted_at' : 'facebook_published_at';
        const saved = await db.from('hidfutas_draws').update({ [field]: new Date().toISOString() }).eq('campaign_id', HIDFUTAS.id).is(field, null);
        if (saved.error) throw saved.error;
      }
      return noStoreJson({ success: true });
    }
    return noStoreJson({ error: 'Ismeretlen művelet.' }, { status: 400 });
  } catch { return noStoreJson({ error: 'A művelet nem sikerült. Frissítsd az adatokat, majd próbáld újra.' }, { status: 503 }); }
}
