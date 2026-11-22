const eu = new Set(
  'AT BE BG CY CZ DE DK EE ES FI FR GR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK'.split(
    ' ',
  ),
);
const regions = new Intl.DisplayNames(['hu'], {
  type: 'region',
  fallback: 'none',
});

function field(value, limit, message) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > limit ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new Error(message);
  return value.trim();
}

// Accept only the buyer fields from the order form. Payment data stays with Stripe.
export function parseVoucherBilling(input) {
  const name = field(
    input?.name,
    180,
    'Adja meg a számlázási nevet vagy cégnevet.',
  );
  const email = field(input?.email, 254, 'Adjon meg érvényes e-mail-címet.');
  if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email))
    throw new Error('Adjon meg érvényes e-mail-címet.');
  const country = field(
    input?.country,
    2,
    'Adja meg a kétbetűs országkódot.',
  ).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || !regions.of(country) || country === 'ZZ')
    throw new Error('Érvénytelen országkód.');
  const postal_code = field(
    input.postalCode,
    20,
    'Adja meg az irányítószámot.',
  );
  if (country === 'HU' && !/^\d{4}$/.test(postal_code))
    throw new Error('Magyar címhez négyjegyű irányítószám szükséges.');
  const city = field(input.city, 100, 'Adja meg a települést.');
  const line1 = field(input.line1, 240, 'Adja meg az utcát és a házszámot.');
  const tax_ids = [];
  if (input.business === true && !input.taxNumber)
    throw new Error('Céges számlához adja meg az adószámot.');
  if (input.taxNumber) {
    let value = field(
      input.taxNumber,
      40,
      'Adjon meg érvényes adószámot.',
    ).toUpperCase();
    let type = 'foreign_tax_id';
    if (country === 'HU') {
      value = value.replace(/^(\d{8})(\d)(\d{2})$/, '$1-$2-$3');
      if (!/^\d{8}-\d-\d{2}$/.test(value))
        throw new Error('A magyar adószám formátuma 12345678-1-12.');
      type = 'hu_tin';
    } else if (eu.has(country)) {
      value = value.replace(/\s/g, '');
      if (
        !value.startsWith(country === 'GR' ? 'EL' : country) ||
        !/^[A-Z]{2}[A-Z0-9]{2,14}$/.test(value)
      )
        throw new Error(
          'Adja meg az országkóddal kezdődő közösségi adószámot.',
        );
      type = 'eu_vat';
    }
    tax_ids.push({ type, value });
  }
  return {
    name,
    email,
    ...(tax_ids.length ? { business_name: name } : {}),
    address: { country, postal_code, city, line1 },
    tax_ids,
  };
}

const slovakValidationMessages = {
  "Adja meg a számlázási nevet vagy cégnevet.": "Zadajte meno na faktúru alebo obchodné meno firmy.",
  "Adjon meg érvényes e-mail-címet.": "Zadajte platnú e-mailovú adresu.",
  "Adja meg a kétbetűs országkódot.": "Zadajte dvojpísmenový kód krajiny.",
  "Érvénytelen országkód.": "Neplatný kód krajiny.",
  "Adja meg az irányítószámot.": "Zadajte PSČ.",
  "Magyar címhez négyjegyű irányítószám szükséges.": "Pri maďarskej adrese zadajte štvormiestne PSČ.",
  "Adja meg a települést.": "Zadajte obec alebo mesto.",
  "Adja meg az utcát és a házszámot.": "Zadajte ulicu a číslo domu.",
  "Céges számlához adja meg az adószámot.": "Pri faktúre na firmu zadajte daňové číslo.",
  "Adjon meg érvényes adószámot.": "Zadajte platné daňové číslo.",
  "A magyar adószám formátuma 12345678-1-12.": "Maďarské daňové číslo má formát 12345678-1-12.",
  "Adja meg az országkóddal kezdődő közösségi adószámot.": "Zadajte IČ DPH začínajúce kódom krajiny, napríklad SK.",
  "A megajándékozott nevét egy sorban adja meg.": "Meno obdarovaného zadajte v jednom riadku.",
  "A név legfeljebb 60 karakter lehet.": "Meno môže mať najviac 60 znakov.",
  "A megadott névben nem nyomtatható karakter van. Kérjük, írja át a nevet.": "Meno obsahuje znak, ktorý sa nedá vytlačiť. Upravte ho, prosím."
};

export function voucherValidationMessage(error, locale) {
  const message = error instanceof Error ? error.message : '';
  if (locale === 'sk') return slovakValidationMessages[message] || 'Skontrolujte zadané fakturačné údaje.';
  return message || 'Hibás számlázási adatok.';
}
