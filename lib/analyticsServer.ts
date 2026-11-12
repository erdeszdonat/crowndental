import type { SupabaseClient } from '@supabase/supabase-js';
import { UUID, PUBLIC_PAGES, safeTag } from './analyticsValidation';

export async function captureAnalyticsSession(db: SupabaseClient, input: unknown): Promise<string | null> {
  if (!input || typeof input !== 'object') return null;
  const v = input as Record<string, unknown>;
  if (v.consent !== true || typeof v.id !== 'string' || !UUID.test(v.id) || typeof v.visitor !== 'string' || !UUID.test(v.visitor)) return null;
  const { error } = await db.from('site_analytics_sessions').upsert({
    id: v.id, visitor_id: v.visitor, source: safeTag(v.source, 'unknown'), medium: safeTag(v.medium, 'unknown'),
    campaign: safeTag(v.campaign), landing_page: PUBLIC_PAGES.has(String(v.landing)) ? String(v.landing) : 'other',
    device: ['mobile','tablet','desktop'].includes(String(v.device)) ? v.device : 'unknown',
    language: ['hu','en','sk','de'].includes(String(v.language)) ? v.language : 'hu',
  }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw new Error('analytics_session_unavailable');
  return v.id;
}
