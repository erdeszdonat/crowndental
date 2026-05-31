export const BUDAPEST_BOOKING_OPEN_AT = new Date('2026-07-31T00:00:00+02:00');

export const BUDAPEST_BOOKING_OPEN_LABELS = {
  hu: 'Júl. 31-től',
  en: 'From Jul 31',
  sk: 'Od 31. júla',
} as const;

export function isBudapestCity(city: unknown) {
  return typeof city === 'string' && city.trim().toLowerCase() === 'budapest';
}

export function isBudapestBookingAvailable(referenceDate = new Date()) {
  return referenceDate.getTime() >= BUDAPEST_BOOKING_OPEN_AT.getTime();
}
