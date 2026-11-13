import { NFC_CARDS } from './nfcCards';
// Shared allowlists: no contact details, full URLs, form values or arbitrary event properties.
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ANALYTICS_EVENTS = ['page_view', 'engagement', 'booking_cta_click', 'phone_click', 'booking_form_view', 'booking_start', 'booking_step_view', 'booking_step_complete', 'booking_submit', 'booking_error', 'booking_validation_error'] as const;
export const PUBLIC_PAGES = new Set([...NFC_CARDS.map(card => `kartya/${card.id}`), 'home', 'booking', 'booking_success', 'blog', 'other', 'kezelesek', 'esztergom', 'primas-sziget', 'budapest', 'kapcsolat', 'rolunk', 'kollegaink', 'utazas-szallas', 'hollywood-mosoly', ...['allapotfelmeres','esztetikai-fogaszat','fogfeherites','foghuzas','fogsor','fogszabalyozas','fogtechnikai-megoldasok','gockutatas','gyerekfogaszat','gyokerkezeles','implantatum','koronak-hidak','szajsebeszet','direkt-hej','indirekt-hej'].map(s => `kezelesek/${s}`)]);
export function safeTag(value: unknown, fallback = ''): string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_.-]{0,79}$/i.test(value) && !/\d{7,}/.test(value) ? value.toLowerCase() : fallback;
}
export function trafficSource(search: string, referrer: string) {
  const params = new URLSearchParams(search);
  const source = safeTag(params.get('utm_source')); const medium = safeTag(params.get('utm_medium'));
  const campaign = safeTag(params.get('utm_campaign'));
  if (source) return { source, medium: medium || 'campaign', campaign };
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) return { source: 'google', medium: 'cpc', campaign };
  let host = ''; try { host = new URL(referrer).hostname.toLowerCase(); } catch {}
  if (/^(www\.)?crowndental\.hu$/.test(host)) host = '';
  const known = ['facebook.com','instagram.com','tiktok.com','youtube.com','bing.com','duckduckgo.com'];
  const match = known.find(s => host === s || host.endsWith('.' + s));
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return { source: 'google', medium: 'organic', campaign };
  if (match) return { source: match.split('.')[0], medium: ['bing.com','duckduckgo.com'].includes(match) ? 'organic' : 'social', campaign };
  if (params.has('fbclid')) return { source: 'facebook', medium: 'social', campaign };
  return { source: host ? 'other-referral' : 'direct', medium: host ? 'referral' : 'none', campaign };
}
export type AnalyticsEvent = { id: string; event: string; page: string; duration: number; step: number; placement: string; at: number };
export function cleanAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || !UUID.test(v.id) || !ANALYTICS_EVENTS.includes(v.event as typeof ANALYTICS_EVENTS[number])) return null;
  const now = Date.now();
  return { id: v.id, event: String(v.event), page: PUBLIC_PAGES.has(String(v.page)) ? String(v.page) : 'other',
    at: typeof v.at === 'number' && v.at >= now - 300000 && v.at <= now ? v.at : now,
    duration: v.event === 'engagement' && Number.isFinite(v.duration) ? Math.max(0, Math.min(30000, Math.round(Number(v.duration)))) : 0,
    step: v.step === 1 || v.step === 2 ? v.step : 0,
    placement: ['navigation','footer','content','home_hero','treatment_hero','mobile_bar','treatment_card','landing_hero','landing_offer','landing_form','quote_result','nfc_card'].includes(String(v.placement)) ? String(v.placement) : '' };
}
