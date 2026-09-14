export const BUDAPEST_BOOKING_AVAILABLE = false;

export const BUDAPEST_BOOKING_OPEN_LABELS = {
  hu: 'Hamarosan nyitunk',
  en: 'Coming soon...',
  sk: 'Čoskoro otvárame',
  de: 'Demnächst verfügbar...',
} as const;

export function isBudapestCity(city: unknown) {
  return typeof city === 'string' && city.trim().toLowerCase() === 'budapest';
}

export function isBudapestBookingAvailable() {
  return BUDAPEST_BOOKING_AVAILABLE;
}
