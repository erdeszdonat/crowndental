export function isVoucherAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) &&
    value >= 10_000 && value <= 500_000 && value % 5_000 === 0;
}

export function suggestedVoucherAmount(query: string | string[] | undefined): number {
  const amount = typeof query === 'string' && /^\d{5,6}$/.test(query) ? Number(query) : undefined;
  return isVoucherAmount(amount) ? amount : 10_000;
}
