export const voucherShopNames = { hu: 'Karácsonyi ajándékutalvány', sk: 'Vianočná darčeková poukážka' } as const;
export type VoucherLocale = keyof typeof voucherShopNames;

export function isVoucherLocale(locale: string): locale is VoucherLocale {
  return locale === 'hu' || locale === 'sk';
}

export function voucherShopPath(locale: VoucherLocale) {
  return locale === 'sk' ? '/sk/karacsonyi-utalvanyok' : '/karacsonyi-utalvanyok';
}
