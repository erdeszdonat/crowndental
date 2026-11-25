export const voucherShopNames = { hu: 'Karácsonyi ajándékutalvány', sk: 'Vianočná darčeková poukážka' } as const;
export type VoucherLocale = keyof typeof voucherShopNames;

export function isVoucherLocale(locale: string): locale is VoucherLocale {
  return locale === 'hu' || locale === 'sk';
}

export function voucherShopPath(locale: VoucherLocale) {
  return locale === 'sk' ? '/sk/karacsonyi-utalvanyok' : '/karacsonyi-utalvanyok';
}

// Both boundaries are local midnights in Budapest.
export const voucherSeasonStarts = Date.parse('2026-11-22T00:00:00+01:00');
export const voucherSeasonEnds = Date.parse('2026-12-25T00:00:00+01:00');

export function isVoucherSeasonOpen(at: Date = new Date()) {
  const time = at.getTime();
  return time >= voucherSeasonStarts && time < voucherSeasonEnds;
}
