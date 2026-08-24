import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/adminAuth';
import { noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

const APPOINTMENT_ADMIN_FIELDS = [
  'id',
  'name',
  'email',
  'phone',
  'city',
  'treatment',
  'status',
  'created_at',
  'confirmed_appointment_local',
  'confirmation_email_sent_at',
  'special_note',
  'special_note_updated_at',
].join(',');

const CAREER_ADMIN_FIELDS = [
  'id',
  'location',
  'position',
  'experience',
  'name',
  'email',
  'phone',
  'message',
  'status',
  'created_at',
].join(',');

const QUOTE_ADMIN_FIELDS = [
  'id',
  'name',
  'email',
  'phone',
  'original_total',
  'new_total',
  'savings',
  'crown_total_min',
  'crown_total_max',
  'savings_min',
  'savings_max',
  'requires_manual_review',
  'locale',
  'items',
  'status',
  'created_at',
].join(',');

export async function POST(req: Request) {
  const originError = rejectUntrustedMutation(req);
  if (originError) return originError;
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // 2. Service Role Key használata: Ez áttöri az RLS-t és 100% biztonságos, mert csak a szerveren fut!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (!supabaseUrl || !supabaseServiceKey) {
      return noStoreJson({ error: 'Hiányzó szerveroldali Supabase kulcsok (Service Role Key)!' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Adatok lekérése, DE csak azokat, amik nincsenek elrejtve (is_hidden = false vagy null)
    const [appointmentsRes, careerRes, quotesRes, marketingSubscribersRes] = await Promise.all([
      supabase.from('appointments').select(APPOINTMENT_ADMIN_FIELDS).is('is_hidden', false).order('created_at', { ascending: false }),
      supabase.from('career_applications').select(CAREER_ADMIN_FIELDS).is('is_hidden', false).order('created_at', { ascending: false }),
      supabase.from('quote_leads').select(QUOTE_ADMIN_FIELDS).is('is_hidden', false).order('created_at', { ascending: false }),
      supabase
        .from('marketing_subscribers')
        .select('id, email, name, nickname, phone, clinic, source, locale, consent_status, consented_at, created_at, updated_at')
        .eq('consent_status', 'subscribed')
        .order('created_at', { ascending: false })
    ]);

    // 4. Sanity cikkek lekérése
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
    const sanityQuery = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt, "language": coalesce(language, "hu"), "category": coalesce(category, "professional") }`);
    const sanityUrl = `https://${sanityProjectId}.api.sanity.io/v2024-03-08/data/query/production?query=${sanityQuery}`;
    const sanityFetch = await fetch(sanityUrl);
    const sanityJson = await sanityFetch.json();

    const databaseErrors = [appointmentsRes.error, careerRes.error, quotesRes.error, marketingSubscribersRes.error].filter(Boolean);
    if (databaseErrors.length) {
      console.error('Admin adatlekérési hiba:', databaseErrors);
      return noStoreJson({ error: 'Az admin adatok egy része nem tölthető be.' }, { status: 503 });
    }

    return noStoreJson({
      success: true,
      appointments: appointmentsRes.data || [],
      applications: careerRes.data || [],
      quotes: quotesRes.data || [],
      marketingSubscribers: marketingSubscribersRes.data || [],
      posts: sanityJson.result || []
    });

  } catch (error: unknown) {
    console.error("Biztonságos API Hiba:", error);
    return noStoreJson({ error: 'Szerverhiba történt az adatok betöltésekor.' }, { status: 500 });
  }
}
