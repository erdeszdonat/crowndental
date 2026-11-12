import { canMeasure, measurementPage, ANALYTICS_READY_EVENT } from './siteAnalytics';
import { trafficSource, type AnalyticsEvent } from './analyticsValidation';

const VISITOR_KEY = 'crown_visitor_v1';
const SESSION_KEY = 'crown_visit_v1';
const TTL = 30 * 60_000;
type Visit = { id: string; visitor: string; at: number; source: string; medium: string; campaign: string; landing: string; device: string; language: string };
let visit: Visit | null = null;
let queue: AnalyticsEvent[] = [];
let sending = false;
let lastPath = '';

function context(): Visit | null {
  if (!canMeasure()) return null;
  try {
    const now = Date.now();
    if (!visit) visit = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!visit || now - visit.at > TTL || now < visit.at) {
      queue = [];
      let visitor = JSON.parse(localStorage.getItem(VISITOR_KEY) || 'null');
      if (!visitor || now > visitor.expires) {
        visitor = { id: crypto.randomUUID(), expires: now + 90 * 86400000 };
        localStorage.setItem(VISITOR_KEY, JSON.stringify(visitor));
      }
      visit = { id: crypto.randomUUID(), visitor: visitor.id, at: now,
        ...trafficSource(window.location.search, document.referrer), landing: measurementPage(window.location.pathname),
        language: window.location.pathname.match(/^\/(en|de|sk)(?:\/|$)/)?.[1] || 'hu',
        device: /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop' };
      lastPath = '';
    }
    visit.at = now; sessionStorage.setItem(SESSION_KEY, JSON.stringify(visit));
    return visit;
  } catch { return null; }
}

export function bookingAnalyticsContext() {
  const current = context();
  return current ? { ...current, consent: true } : null;
}

function clear() {
  visit = null; queue = []; lastPath = '';
  try { localStorage.removeItem(VISITOR_KEY); sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function enqueue(event: string, page: string, options: Partial<AnalyticsEvent> = {}) {
  if (!context()) return;
  queue.push({ id: crypto.randomUUID(), event, page, duration: 0, step: 0, placement: '', at: Date.now(), ...options });
  if (queue.length > 80) queue.splice(0, queue.length - 80);
}

async function flush() {
  if (!canMeasure()) { clear(); return; }
  if (sending || !queue.length || !visit) return;
  sending = true;
  const batch = queue.splice(0, 20);
  const sessionId = visit.id;
  try {
    const response = await fetch('/api/site-analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: { ...visit, consent: true }, events: batch }), keepalive: true });
    if (!response.ok && response.status >= 500 && canMeasure() && visit?.id === sessionId) queue.unshift(...batch);
  } catch { if (canMeasure() && visit?.id === sessionId) queue.unshift(...batch); }
  finally { sending = false; if (queue.length > 80) queue.splice(80); }
}

/** Only foreground time with activity in the last minute; hidden tabs never accrue time. */
export function startFirstPartyAnalytics(pathname: string) {
  let lastTick = performance.now(); let lastActivity = Date.now(); let active = false;
  const page = measurementPage(pathname);
  const begin = () => {
    if (!canMeasure()) { clear(); active = false; return; }
    if (!context()) return;
    if (lastPath !== pathname) { enqueue('page_view', page); lastPath = pathname; }
    active = true; lastTick = performance.now(); lastActivity = Date.now(); void flush();
  };
  const tick = () => {
    const now = performance.now();
    if (active && canMeasure() && document.visibilityState === 'visible' && Date.now() - lastActivity < 60_000) {
      if (context() && lastPath !== pathname) { enqueue('page_view', page); lastPath = pathname; }
      // Long background suspension / sleep must not count as active reading.
      const elapsed = now - lastTick;
      if (elapsed > 0 && elapsed <= 30_000) enqueue('engagement', page, { duration: Math.round(elapsed) });
    }
    lastTick = now; void flush();
  };
  const activity = () => { lastActivity = Date.now(); if (!active && canMeasure()) begin(); };
  const visibility = () => { lastTick = performance.now(); if (document.visibilityState === 'visible') activity(); void flush(); };
  const consent = () => { if (canMeasure()) begin(); else { active = false; clear(); } };
  const event = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.event && detail.event !== 'booking_success') {
      enqueue(detail.event, page, { step: detail.step || 0, placement: detail.placement || '' }); void flush();
    }
  };
  begin();
  const interval = window.setInterval(tick, 15_000);
  for (const type of ['pointerdown', 'keydown', 'scroll']) window.addEventListener(type, activity, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', tick);
  window.addEventListener(ANALYTICS_READY_EVENT, begin);
  window.addEventListener('crown-measurement-consent', consent);
  window.addEventListener('crown-site-event', event);
  return () => {
    tick(); window.clearInterval(interval);
    for (const type of ['pointerdown', 'keydown', 'scroll']) window.removeEventListener(type, activity);
    document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', tick);
    window.removeEventListener(ANALYTICS_READY_EVENT, begin); window.removeEventListener('crown-measurement-consent', consent);
    window.removeEventListener('crown-site-event', event);
  };
}
