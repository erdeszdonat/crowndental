import { createClient } from '@supabase/supabase-js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type MarketingSubscriberInput = {
  email: string;
  name?: string;
  nickname?: string;
  phone?: string;
  clinic?: string;
  source?: string;
  locale?: string;
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
}: MarketingSubscriberInput) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const normalizedEmail = cleanString(email).toLowerCase();

  if (!EMAIL_RE.test(normalizedEmail)) {
    return { ok: false, error: 'invalid_email' };
  }

  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, error: 'missing_supabase_env' };
  }

  const now = new Date().toISOString();
  const supabase = createClient(supabaseUrl, supabaseKey);

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
        updated_at: now,
      },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('Marketing subscriber mentési hiba:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
