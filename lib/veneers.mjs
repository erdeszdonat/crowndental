/** Shared prices and dates for pages, the price list and appointment requests. */
export const VENEER_CAMPAIGN = Object.freeze({
  firstAppointmentDate: '2026-11-01',
  endsAt: '2027-01-01T00:00:00+01:00',
  validThrough: '2026-12-31T23:59:59+01:00',
  periodLabel: '2026. november 1. – december 31.',
});

export const VENEERS = Object.freeze({
  'direkt-hej': Object.freeze({
    slug: 'direkt-hej',
    name: 'Direkt kompozit héj',
    shortName: 'Direkt héj',
    path: '/kezelesek/direkt-hej',
    bookingHref: '/idopont?kezeles=direkt-hej',
    price: 47500,
    regularPrice: 55000,
    material: 'Kompozit',
    description: 'A fogorvos által közvetlenül a fog felszínén kialakított kompozit héj, egyénre tervezett színnel és formával.',
  }),
  'indirekt-hej': Object.freeze({
    slug: 'indirekt-hej',
    name: 'Indirekt porcelán héj',
    shortName: 'Porcelán héj',
    path: '/kezelesek/indirekt-hej',
    bookingHref: '/idopont?kezeles=indirekt-hej',
    price: 99000,
    regularPrice: 120000,
    material: 'Prémium porcelán / kerámia',
    description: 'Saját fogtechnikai laborunkban készülő, egyénre tervezett prémium porcelán héj a fogak látható felszínére.',
  }),
});

/** @param {number} amount */
export function formatVeneerPrice(amount) {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ft`;
}

/**
 * Direct bookings open before November; the discount applies to November–December
 * treatment dates. Evaluate during static generation/ISR, never through cookies
 * or an uncached pricing request. Porcelain has no unconfirmed expiry date.
 * @param {'direkt-hej' | 'indirekt-hej'} slug
 * @param {Date | string | number} [now]
 */
export function getVeneerOffer(slug, now = new Date()) {
  const treatment = VENEERS[slug];
  if (!treatment) throw new RangeError(`Unknown veneer treatment: ${slug}`);
  const timestamp = new Date(now).getTime();
  if (!Number.isFinite(timestamp)) throw new RangeError('Invalid veneer offer date');
  const isDirectCampaign = slug === 'direkt-hej' && timestamp < Date.parse(VENEER_CAMPAIGN.endsAt);
  const isPromotion = slug === 'indirekt-hej' || isDirectCampaign;
  const price = isPromotion ? treatment.price : treatment.regularPrice;
  return {
    price,
    regularPrice: treatment.regularPrice,
    isPromotion,
    formattedPrice: formatVeneerPrice(price),
    formattedRegularPrice: formatVeneerPrice(treatment.regularPrice),
    bookingFrom: isDirectCampaign ? VENEER_CAMPAIGN.firstAppointmentDate : null,
    validThrough: isDirectCampaign ? VENEER_CAMPAIGN.validThrough : null,
    availabilityCopy: isDirectCampaign
      ? 'Már most kérhető időpont a 2026. november–decemberi kezelésekre, korlátozott számban.'
      : slug === 'indirekt-hej'
        ? 'Már most kérhető időpont porcelán héj konzultációra.'
        : 'Kérjen időpontot személyes konzultációra.',
  };
}

/**
 * One source for the visible price and structured offer, including an explicit
 * expiry in cached HTML so crawlers never treat an old discount as indefinite.
 * @param {'direkt-hej' | 'indirekt-hej'} slug
 * @param {string} siteUrl
 * @param {Date | string | number} [now]
 */
export function buildVeneerOfferSchema(slug, siteUrl, now = new Date()) {
  const treatment = VENEERS[slug];
  const offer = getVeneerOffer(slug, now);
  return {
    '@type': 'Offer',
    url: `${siteUrl}${treatment.path}`,
    price: offer.price,
    priceCurrency: 'HUF',
    seller: { '@id': `${siteUrl}/#organization` },
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: offer.price,
      priceCurrency: 'HUF',
      unitText: 'fog',
      ...(offer.validThrough ? { validThrough: offer.validThrough } : {}),
    },
    ...(offer.validThrough ? {
      validThrough: offer.validThrough,
      availabilityStarts: `${VENEER_CAMPAIGN.firstAppointmentDate}T00:00:00+01:00`,
      availabilityEnds: offer.validThrough,
    } : {}),
  };
}
