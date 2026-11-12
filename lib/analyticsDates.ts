export type DateRange = { from: string; to: string };
export const ANALYTICS_TIMEZONE = 'Europe/Budapest';
export function localDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ANALYTICS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function shiftDay(day: string, amount: number): string {
  const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + amount); return d.toISOString().slice(0, 10);
}
export function validDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`); return Number.isFinite(+d) && d.toISOString().slice(0, 10) === value;
}
export function rangeDays(r: DateRange) { return Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86400000) + 1; }
export function previousRange(r: DateRange): DateRange { return { from: shiftDay(r.from, -rangeDays(r)), to: shiftDay(r.from, -1) }; }
export function presetRange(preset: string, today = localDay()): DateRange {
  const year = Number(today.slice(0, 4)); const month = today.slice(0, 7) + '-01';
  const dow = (new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7;
  if (preset === 'today') return { from: today, to: today };
  if (preset === 'yesterday') return { from: shiftDay(today, -1), to: shiftDay(today, -1) };
  if (preset === 'last_week') return { from: shiftDay(today, -dow - 7), to: shiftDay(today, -dow - 1) };
  if (preset === 'this_month') return { from: month, to: today };
  if (preset === 'last_month') { const end = shiftDay(month, -1); return { from: end.slice(0, 7) + '-01', to: end }; }
  if (preset === 'this_year') return { from: `${year}-01-01`, to: today };
  if (preset === 'last_year') return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` };
  return { from: shiftDay(today, preset === '7d' ? -6 : -29), to: today };
}
