export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^[+()\d\s./-]+$/.test(value) && digits.length >= 7 && digits.length <= 16;
}
