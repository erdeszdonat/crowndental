import { CONSENT_STORAGE_KEY, parseStoredConsent, type StoredConsent } from './cookieConsent';

export const GOOGLE_TAG_ID = 'G-9BS3P1DC4T';
export const ANALYTICS_READY_EVENT = 'crown-analytics-ready';
const SOURCE_KEY = 'crown_booking_source_v1';
const TREATMENT_SLUGS = new Set(['allapotfelmeres', 'esztetikai-fogaszat', 'fogfeherites', 'foghuzas', 'fogsor', 'fogszabalyozas', 'fogtechnikai-megoldasok', 'gockutatas', 'gyerekfogaszat', 'gyokerkezeles', 'implantatum', 'koronak-hidak', 'szajsebeszet']);
let currentConsent: StoredConsent | null | undefined;

export function isProductionSite() {
  return typeof window !== 'undefined' && ['crowndental.hu', 'www.crowndental.hu'].includes(window.location.hostname);
}

export function ensureGtag() {
  window.dataLayer = window.dataLayer ?? [];
  // gtag's command protocol requires an Arguments object, NOT a rest-parameter array.
  window.gtag = window.gtag ?? function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  return window.gtag;
}

export function setAnalyticsConsent(consent: StoredConsent | null) {
  currentConsent = consent;
  window['ga-disable-G-9BS3P1DC4T'] = !consent?.analytics;
  if (!consent?.analytics) {
    try { window.sessionStorage.removeItem(SOURCE_KEY); } catch { /* Storage is optional. */ }
  }
}

export function canMeasure() {
  if (!isProductionSite()) return false;
  try {
    const consent = currentConsent === undefined
      ? parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY)).consent
      : currentConsent;
    return consent?.analytics === true;
  } catch { return false; }
}

/** Keep only public route categories; never query strings, tokens or arbitrary slugs. */
export function measurementPage(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/^\/(hu|en|de|sk)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/kezelesek' || (path.startsWith('/kezelesek/') && TREATMENT_SLUGS.has(path.slice(11)))) return path.slice(1);
  if (path === '/idopont') return 'booking';
  if (path === '/idopont/sikeres') return 'booking_success';
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog';
  if (['/esztergom', '/budapest', '/kapcsolat', '/rolunk', '/utazas-szallas'].includes(path)) return path.slice(1);
  return 'other';
}

function bookingSource() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(SOURCE_KEY) ?? 'null');
    if (stored && typeof stored.page === 'string' && typeof stored.at === 'number'
      && Date.now() - stored.at >= 0 && Date.now() - stored.at < 30 * 60 * 1000) {
      return measurementPage(stored.page === 'home' ? '/' : `/${stored.page}`);
    }
  } catch { /* No attribution is better than blocking the form. */ }
  return 'direct';
}

export function rememberBookingSource(pathname: string) {
  if (!canMeasure()) return;
  if (measurementPage(pathname).startsWith('booking')) return;
  try {
    window.sessionStorage.setItem(SOURCE_KEY, JSON.stringify({ page: measurementPage(pathname), at: Date.now() }));
  } catch { /* Attribution storage is optional. */ }
}

export type SiteEvent = 'booking_cta_click' | 'phone_click' | 'booking_form_view'
  | 'booking_start' | 'booking_step_view' | 'booking_step_complete'
  | 'booking_submit' | 'booking_success' | 'booking_error' | 'booking_validation_error';
export type EventOptions = {
  step?: 1 | 2;
  placement?: 'navigation' | 'footer' | 'content' | 'home_hero' | 'treatment_hero' | 'mobile_bar' | 'treatment_card';
  error?: 'validation' | 'rate_limited' | 'service' | 'network' | 'unknown';
};

export function trackSiteEvent(event: SiteEvent, locale: string, options: EventOptions = {}) {
  if (!canMeasure()) return false;
  try {
    ensureGtag()('event', event, {
      send_to: GOOGLE_TAG_ID,
      site_language: ['hu', 'en', 'de', 'sk'].includes(locale) ? locale : 'hu',
      source_page: measurementPage(window.location.pathname),
      booking_source: bookingSource(),
      ...(options.step ? { booking_step: options.step } : {}),
      ...(options.placement ? { cta_location: options.placement } : {}),
      ...(options.error ? { error_type: options.error } : {}),
      // No names, contact details, treatment selections, free text or booking IDs.
    });
    return true;
  } catch { return false; }
}
