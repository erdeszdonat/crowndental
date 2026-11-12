import type { DateRange } from './analyticsDates';
export type Breakdown = { name: string; sessions: number; visitors: number; requests: number; confirmed: number; booked_sessions: number };
export type Summary = { requests: number; confirmed: number; special: number; cancelled: number; noAnswer: number; pending: number; attributed: number; sessions: number; visitors: number; bookedSessions: number; bookedVisitors: number; views: number; engagementMs: number; phoneClicks: number; ctaClicks: number; errors: number };
export type PeriodReport = {
  summary: Summary;
  series: { day: string; requests: number; confirmed: number; sessions: number; views: number }[];
  breakdowns: Record<string, Breakdown[]>;
  treatments: { name: string; requests: number; confirmed: number }[];
  clinics: { name: string; requests: number; confirmed: number }[];
  pages: { name: string; views: number; sessions: number; engagement_ms: number; cta_clicks: number }[];
  hours: { weekday: number; hour: number; requests: number }[];
  funnel: { views: number; starts: number; submits: number; saved: number };
  ga: { sessions: number; views: number; engagementSeconds: number; bookingEvents: number;
    series: { day: string; sessions: number; views: number; booking_events: number }[];
    sources: { name: string; sessions: number; booking_events: number }[] };
};
export type AnalyticsReport = { range: DateRange; previousRange: DateRange; current: PeriodReport; previous: PeriodReport;
  meta: { installed_at: string; ga_imported_at: string | null; ga_through: string | null; firstBooking: string | null; generatedAt: string } };
export function percent(numerator: number, denominator: number): number | null { return denominator > 0 ? numerator / denominator * 100 : null; }
export function change(current: number, previous: number): number | null { return previous > 0 ? (current - previous) / previous * 100 : null; }
export const PAGE_NAMES: Record<string, string> = { home: 'Főoldal', booking: 'Időpontkérés', booking_success: 'Sikeres időpontkérés', blog: 'Cikkek és magazin', other: 'Egyéb nyilvános oldal', 'primas-sziget': 'Prímás Sziget', esztergom: 'Belvárosi rendelő', 'hollywood-mosoly': 'Hollywood Smile', mobile: 'Mobil', desktop: 'Asztali gép', tablet: 'Tablet', hu: 'Magyar', en: 'Angol', de: 'Német', sk: 'Szlovák', 'petofi-utca': 'Petőfi utca' };
