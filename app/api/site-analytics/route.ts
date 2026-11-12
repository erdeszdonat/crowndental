import { staffServiceClient, requireStaffOrigin } from '@/lib/staffAuth';
import { enforceRateLimit, noStoreJson } from '@/lib/serverSecurity';
import { captureAnalyticsSession } from '@/lib/analyticsServer';
import { cleanAnalyticsEvent } from '@/lib/analyticsValidation';

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request); if (originError) return originError;
  // Preview, local and admin traffic do not enter production analytics.
  if (!['www.crowndental.hu','crowndental.hu'].includes(new URL(request.url).hostname)) return noStoreJson({ ignored: true });
  if (/bot|crawler|spider|headless|lighthouse/i.test(request.headers.get('user-agent') || '')) return noStoreJson({ ignored: true });
  const limited = await enforceRateLimit(request, 'site-analytics', { limit: 240, windowMs: 60_000 }); if (limited) return limited;
  try {
    const text = await request.text(); if (text.length > 16000) return noStoreJson({ error: 'invalid' }, { status: 413 });
    const body = JSON.parse(text);
    if (!Array.isArray(body.events) || body.events.length < 1 || body.events.length > 20) return noStoreJson({ error: 'invalid' }, { status: 400 });
    const events = body.events.map(cleanAnalyticsEvent);
    if (events.some((e: unknown) => !e)) return noStoreJson({ error: 'invalid' }, { status: 400 });
    const db = staffServiceClient(); const session = await captureAnalyticsSession(db, body.session);
    if (!session) return noStoreJson({ error: 'invalid' }, { status: 400 });
    const { error } = await db.from('site_analytics_events').upsert(events.map((e: NonNullable<ReturnType<typeof cleanAnalyticsEvent>>) => ({
      id: e.id, session_id: session, event: e.event, page: e.page, engagement_ms: e.duration, step: e.step, placement: e.placement, created_at: new Date(e.at).toISOString(),
    })), { onConflict: 'id', ignoreDuplicates: true });
    if (error) return noStoreJson({ error: 'unavailable' }, { status: 503 });
    return noStoreJson({ ok: true });
  } catch { return noStoreJson({ error: 'unavailable' }, { status: 503 }); }
}
