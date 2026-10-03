export type VeneerLocale = 'hu' | 'en' | 'sk' | 'de';

export function normalizeVeneerLocale(locale: string): VeneerLocale {
  return locale === 'en' || locale === 'sk' || locale === 'de' ? locale : 'hu';
}

/** Localized public paths retain the site's existing Hungarian route slugs. */
export function veneerPath(locale: string, path: string): string {
  const language = normalizeVeneerLocale(locale);
  const suffix = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${language === 'hu' ? '' : `/${language}`}${suffix}` || '/';
}

const labels = {
  hu: {
    directName: 'Direkt héj', indirectName: 'Indirekt porcelán héj', hollywoodName: 'Hollywood smile konzultáció',
    directShortName: 'Direkt héj', indirectShortName: 'Porcelán héj',
    perTooth: 'fog', promotionalPrice: 'Kedvezményes ár / fog', price: 'Ár / fog',
    insteadPrefix: '', insteadSuffix: ' helyett', periodLabel: 'Akciós kezelési időszak:',
    period: '2026. november 1. – december 31.',
    directAvailability: 'Már most kérhető időpont a 2026. november–decemberi kezelésekre, korlátozott számban.',
    indirectOpening: 'Már most kérhető időpont a 2026 novemberétől induló porcelánhéj-kezelésekre, korlátozott számban.',
    indirectAvailability: 'Kérjen időpontot porcelán héj konzultációra.',
    standardAvailability: 'Kérjen időpontot személyes konzultációra.',
  },
  en: {
    directName: 'Direct composite veneer', indirectName: 'Indirect porcelain veneer', hollywoodName: 'Hollywood smile consultation',
    directShortName: 'Composite veneer', indirectShortName: 'Porcelain veneer',
    perTooth: 'tooth', promotionalPrice: 'Special price per tooth', price: 'Price per tooth',
    insteadPrefix: 'Instead of ', insteadSuffix: '', periodLabel: 'Promotional treatment period:',
    period: '1 November – 31 December 2026',
    directAvailability: 'Request an appointment now for treatment in November–December 2026. Appointment availability is limited.',
    indirectOpening: 'Request an appointment now for porcelain veneer treatment starting in November 2026. Appointment availability is limited.',
    indirectAvailability: 'Request a porcelain veneer consultation.',
    standardAvailability: 'Request a personal consultation.',
  },
  de: {
    directName: 'Direkte Komposit-Veneers', indirectName: 'Indirekte Keramik-Veneers', hollywoodName: 'Hollywood-Smile-Beratung',
    directShortName: 'Komposit-Veneers', indirectShortName: 'Keramik-Veneers',
    perTooth: 'Zahn', promotionalPrice: 'Aktionspreis pro Zahn', price: 'Preis pro Zahn',
    insteadPrefix: 'Statt ', insteadSuffix: '', periodLabel: 'Aktionszeitraum für die Behandlung:',
    period: '1. November – 31. Dezember 2026',
    directAvailability: 'Termine für Behandlungen im November und Dezember 2026 können bereits angefragt werden. Die Anzahl der Termine ist begrenzt.',
    indirectOpening: 'Termine für Keramik-Veneers ab November 2026 können bereits angefragt werden. Die Anzahl der Termine ist begrenzt.',
    indirectAvailability: 'Fragen Sie einen Beratungstermin für Keramik-Veneers an.',
    standardAvailability: 'Fragen Sie einen persönlichen Beratungstermin an.',
  },
  sk: {
    directName: 'Priame kompozitné fazety', indirectName: 'Nepriame keramické fazety', hollywoodName: 'Konzultácia Hollywood smile',
    directShortName: 'Kompozitné fazety', indirectShortName: 'Keramické fazety',
    perTooth: 'zub', promotionalPrice: 'Akciová cena za zub', price: 'Cena za zub',
    insteadPrefix: 'Namiesto ', insteadSuffix: '', periodLabel: 'Akciové obdobie ošetrenia:',
    period: '1. november – 31. december 2026',
    directAvailability: 'Už teraz môžete požiadať o termín ošetrenia na november až december 2026. Počet termínov je obmedzený.',
    indirectOpening: 'Už teraz môžete požiadať o termín keramických faziet od novembra 2026. Počet termínov je obmedzený.',
    indirectAvailability: 'Požiadajte o konzultáciu ku keramickým fazetám.',
    standardAvailability: 'Požiadajte o osobnú konzultáciu.',
  },
} satisfies Record<VeneerLocale, Record<string, string>>;

export function getVeneerLabels(locale: string) {
  return labels[normalizeVeneerLocale(locale)];
}

export function formatLocalizedVeneerPrice(amount: number, locale: string): string {
  const language = normalizeVeneerLocale(locale);
  if (language === 'hu') return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ft`;
  const numberLocale = { en: 'en-GB', de: 'de-DE', sk: 'sk-SK' }[language];
  return `${new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(amount)} HUF`;
}

export function getVeneerOfferCopy(
  locale: string,
  slug: 'direkt-hej' | 'indirekt-hej',
  offer: ReturnType<typeof import('./veneers.mjs').getVeneerOffer>,
) {
  const copy = getVeneerLabels(locale);
  return {
    formattedPrice: formatLocalizedVeneerPrice(offer.price, locale),
    formattedRegularPrice: formatLocalizedVeneerPrice(offer.regularPrice, locale),
    perTooth: copy.perTooth,
    priceLabel: offer.isPromotion ? copy.promotionalPrice : copy.price,
    insteadPrefix: copy.insteadPrefix,
    insteadSuffix: copy.insteadSuffix,
    periodLabel: copy.periodLabel,
    period: copy.period,
    availabilityCopy: slug === 'direkt-hej'
      ? offer.validThrough ? copy.directAvailability : copy.standardAvailability
      : offer.bookingFrom ? copy.indirectOpening : copy.indirectAvailability,
  };
}
