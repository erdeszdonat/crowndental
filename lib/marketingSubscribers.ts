import { createClient } from '@supabase/supabase-js';
import { addToResendAudience, unsubscribeFromResendAudience } from './addToAudience';
import { createUnsubscribeToken, getUnsubscribeTokenHash } from './marketingTokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type MarketingSubscriberInput = {
  email: string;
  name?: string;
  nickname?: string;
  phone?: string;
  clinic?: string;
  source?: string;
  locale?: string;
  explicitConsent?: boolean;
};

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function upsertMarketingSubscriber({
  email,
  name,
  nickname,
  phone,
  clinic,
  source = 'unknown',
  locale = 'hu',
  explicitConsent = false,
}: MarketingSubscriberInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const normalizedEmail = cleanString(email).toLowerCase();

  if (!EMAIL_RE.test(normalizedEmail)) {
    return { ok: false, error: 'invalid_email' };
  }

  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, error: 'missing_supabase_env' };
  }
  if (!explicitConsent) {
    return { ok: false, error: 'explicit_consent_required' };
  }

  const now = new Date().toISOString();
  const supabase = createClient(supabaseUrl, supabaseKey);
  const unsubscribeToken = createUnsubscribeToken(normalizedEmail);
  const unsubscribeTokenHash = getUnsubscribeTokenHash(unsubscribeToken);

  const { data: existing, error: existingError } = await supabase
    .from('marketing_subscribers')
    .select('consent_status,automation_started_at')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (existingError) {
    console.error('Marketing subscriber ellenőrzési hiba:', existingError);
    return { ok: false, error: existingError.message };
  }

  const { error } = await supabase
    .from('marketing_subscribers')
    .upsert(
      {
        email: normalizedEmail,
        name: cleanString(name) || null,
        nickname: cleanString(nickname) || null,
        phone: cleanString(phone) || null,
        clinic: cleanString(clinic) || null,
        source: cleanString(source) || 'unknown',
        locale: cleanString(locale) || 'hu',
        consent_status: 'subscribed',
        consented_at: now,
        unsubscribe_token_hash: unsubscribeTokenHash,
        unsubscribed_at: existing?.consent_status === 'unsubscribed' ? null : undefined,
        ...(existing?.consent_status === 'unsubscribed'
          ? { audience_synced_at: null, automation_started_at: null }
          : {}),
        updated_at: now,
      },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('Marketing subscriber mentési hiba:', error);
    return { ok: false, error: error.message };
  }

  const shouldStartAutomation = existing?.consent_status !== 'subscribed' || !existing?.automation_started_at;
  const audienceResult = await addToResendAudience({
    email: normalizedEmail,
    name: cleanString(name),
    nickname: cleanString(nickname),
    source: cleanString(source) || 'marketing_consent',
    payload: { source: cleanString(source) || 'marketing_consent', locale: cleanString(locale) || 'hu' },
    unsubscribeToken: unsubscribeToken || undefined,
    // A failed first sync leaves the marker empty, so an explicit retry can
    // safely complete the automation instead of being reported as successful.
    skipEvent: !shouldStartAutomation,
  });
  if (!audienceResult.ok) {
    console.warn('Marketing subscriber Resend szinkron figyelmeztetés:', audienceResult.errors);
  }

  if (!audienceResult.ok) {
    return { ok: false, saved: true, audienceSynced: false, error: 'resend_sync_failed' };
  }
  const { error: syncMarkerError } = await supabase
    .from('marketing_subscribers')
    .update({
      audience_synced_at: now,
      ...(shouldStartAutomation ? { automation_started_at: now } : {}),
      updated_at: now,
    })
    .eq('email', normalizedEmail);
  if (syncMarkerError) {
    console.error('Marketing subscriber szinkronjelölési hiba:', syncMarkerError);
    return { ok: false, saved: true, audienceSynced: false, error: 'sync_marker_failed' };
  }
  return { ok: true, saved: true, audienceSynced: true };
}

export async function unsubscribeMarketingSubscriber(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const normalizedEmail = cleanString(email).toLowerCase();
  if (!isValidEmailAddress(normalizedEmail) || !supabaseUrl || !supabaseKey) return { ok: false };

  const { error } = await createClient(supabaseUrl, supabaseKey)
    .from('marketing_subscribers')
    .update({ consent_status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('email', normalizedEmail);
  if (error) return { ok: false, error: error.message };

  const audienceResult = await unsubscribeFromResendAudience(normalizedEmail);
  if (!audienceResult.ok) {
    console.warn('Marketing leiratkozás Resend szinkron figyelmeztetés:', audienceResult.errors);
  }
  if (!audienceResult.ok) {
    return { ok: false, saved: true, audienceSynced: false, error: 'resend_sync_failed' };
  }
  return { ok: true, saved: true, audienceSynced: true };
}

function isValidEmailAddress(value: string) {
  return EMAIL_RE.test(value);
}
