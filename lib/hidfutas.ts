export const HIDFUTAS = {
  id: 'hidfutas-2026',
  rulesVersion: '2026-09-26-v3',
  startsAt: '2026-09-26T09:00:00+02:00',
  closesAt: '2026-09-26T13:00:00+02:00',
  drawAt: '2026-09-28T00:00:00+02:00',
  facebook: 'https://www.facebook.com/koronafogaszatesztergom/',
} as const;

// Four equally likely prizes, each with a 25% chance.
export const WHEEL_SECTORS = [
  { prize: 'strip', label: 'Fogfehérítő csík', short: ['Fogfehérítő', 'csík'], color: '#096b8e', ink: '#fff' },
  { prize: 'powder', label: 'Fogfehérítő por', short: ['Fogfehérítő', 'por'], color: '#cdebf3', ink: '#123548' },
  { prize: 'floss', label: 'Fogselyem', short: ['Fog-', 'selyem'], color: '#123548', ink: '#fff' },
  { prize: 'toothbrush', label: 'Szónikus fogkefe', short: ['Szónikus', 'fogkefe'], color: '#f2f6f7', ink: '#123548' },
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

// Keep already-issued receipts, including powder on the former fifth sector.
export function restoreReceipt(saved: EntryReceipt | null): EntryReceipt | null {
  const previousPrizes = ['strip', 'powder', 'floss', 'toothbrush', 'powder'];
  if (!saved || !/^HF-[A-F0-9]{12}$/.test(saved.code) || !Number.isInteger(saved.sector)
    || previousPrizes[saved.sector] !== saved.prize) return null;
  const sector = WHEEL_SECTORS.findIndex(item => item.prize === saved.prize);
  return sector < 0 ? null : { ...saved, sector };
}
