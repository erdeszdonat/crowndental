export const BUDAPEST_BOOKING_AVAILABLE = false;

export const BUDAPEST_BOOKING_OPEN_LABELS = {
  hu: 'Coming soon...',
  en: 'Coming soon...',
  sk: 'Coming soon...',
} as const;

export function isBudapestCity(city: unknown) {
  return typeof city === 'string' && city.trim().toLowerCase() === 'budapest';
}

export function isBudapestBookingAvailable() {
  return BUDAPEST_BOOKING_AVAILABLE;
}
