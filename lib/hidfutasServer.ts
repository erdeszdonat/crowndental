import { createClient } from '@supabase/supabase-js';
import { upsertMarketingSubscriber } from './marketingSubscribers';

export function hidfutasDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('hidfutas_database_unavailable');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function normalizeHidfutasPhone(value: string) {
  let phone = value.trim().replace(/[\s().\/-]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.slice(2);
  if (phone.startsWith('06')) phone = '+36' + phone.slice(2);
  if (/^36\d{8,9}$/.test(phone)) phone = '+' + phone;
  return /^\+[1-9]\d{6,14}$/.test(phone) ? phone : null;
}

// Persisted consent + attempt markers allow staff to spot and retry provider
// failures without tying the instant prize to newsletter delivery.
export async function syncHidfutasMarketing(id: string) {
  const db = hidfutasDatabase();
  const cutoff = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: entry, error } = await db.from('hidfutas_entries')
    .update({ marketing_attempted_at: new Date().toISOString(), marketing_error: null })
    .eq('id', id).eq('marketing_consent', true).is('marketing_synced_at', null)
    .or(`marketing_attempted_at.is.null,marketing_attempted_at.lt.${cutoff}`)
    .select('id,name,email,created_at').maybeSingle();
  if (error || !entry) return;
  try {
    const { data: subscriber, error: lookupError } = await db.from('marketing_subscribers')
      .select('consent_status,unsubscribed_at,nickname,phone,clinic,locale').eq('email', entry.email).maybeSingle();
    if (lookupError) throw new Error('subscriber_lookup_failed');
    // An opt-out after this entry always wins over a delayed retry.
    if (subscriber?.consent_status === 'unsubscribed' && subscriber.unsubscribed_at && Date.parse(subscriber.unsubscribed_at) >= Date.parse(entry.created_at)) {
      await db.from('hidfutas_entries').update({ marketing_error: 'consent_withdrawn' }).eq('id', id);
      return;
    }
    const result = await upsertMarketingSubscriber({
      email: entry.email, name: entry.name, nickname: subscriber?.nickname || undefined,
      phone: subscriber?.phone || undefined, clinic: subscriber?.clinic || 'Esztergom',
      source: 'hidfutas-2026', locale: subscriber?.locale || 'hu', explicitConsent: true,
    });
    await db.from('hidfutas_entries').update(result.ok
      ? { marketing_synced_at: new Date().toISOString(), marketing_error: null }
      : { marketing_error: 'provider_sync_failed' }).eq('id', id);
  } catch {
    await db.from('hidfutas_entries').update({ marketing_error: 'provider_sync_failed' }).eq('id', id);
  }
}
