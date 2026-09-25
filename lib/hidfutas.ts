export const HIDFUTAS = {
  id: 'hidfutas-2026',
  rulesVersion: '2026-09-25-v2',
  startsAt: '2026-09-26T09:00:00+02:00',
  closesAt: '2026-09-26T13:00:00+02:00',
  drawAt: '2026-09-28T00:00:00+02:00',
  facebook: 'https://www.facebook.com/koronafogaszatesztergom/',
} as const;

// Five equally likely sectors. Powder occupies two: 20/40/20/20 percent.
export const WHEEL_SECTORS = [
  { prize: 'strip', label: 'Fogfehérítő csík', short: ['Fogfehérítő', 'csík'], color: '#096b8e', ink: '#fff' },
  { prize: 'powder', label: 'Fogfehérítő por', short: ['Fogfehérítő', 'por'], color: '#cdebf3', ink: '#123548' },
  { prize: 'floss', label: 'Fogselyem', short: ['Fog-', 'selyem'], color: '#123548', ink: '#fff' },
  { prize: 'toothbrush', label: 'Szónikus fogkefe', short: ['Szónikus', 'fogkefe'], color: '#f2f6f7', ink: '#123548' },
  { prize: 'powder', label: 'Fogfehérítő por', short: ['Fogfehérítő', 'por'], color: '#58bad3', ink: '#123548' },
] as const;

export type InstantPrize = (typeof WHEEL_SECTORS)[number]['prize'];
export type EntryReceipt = { code: string; sector: number; prize: InstantPrize; marketing: 'no' | 'synced' | 'pending' };

export function campaignPhase(now: number): 'before' | 'open' | 'closed' {
  if (now < Date.parse(HIDFUTAS.startsAt)) return 'before';
  return now < Date.parse(HIDFUTAS.closesAt) ? 'open' : 'closed';
}

export function prizeLabel(prize: string): string {
  return WHEEL_SECTORS.find((sector) => sector.prize === prize)?.label || prize;
}
