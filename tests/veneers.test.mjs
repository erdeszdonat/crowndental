import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVeneerOfferSchema, getVeneerOffer, VENEER_CAMPAIGN, VENEERS } from '../lib/veneers.mjs';

test('direct veneer can be booked now for the November–December campaign', () => {
  const offer = getVeneerOffer('direkt-hej', '2026-10-02T12:00:00+02:00');
  assert.equal(offer.price, 47500);
  assert.equal(offer.regularPrice, 55000);
  assert.equal(offer.isPromotion, true);
  assert.equal(offer.bookingFrom, '2026-11-01');
  assert.equal(offer.validThrough, VENEER_CAMPAIGN.validThrough);
  assert.equal(offer.formattedPrice, '47.500 Ft');
});

test('direct discount ends at local Budapest midnight, not at UTC midnight', () => {
  assert.equal(getVeneerOffer('direkt-hej', '2026-12-31T22:59:59.999Z').price, 47500);
  const expired = getVeneerOffer('direkt-hej', '2026-12-31T23:00:00.000Z');
  assert.equal(expired.price, 55000);
  assert.equal(expired.isPromotion, false);
  assert.equal(expired.validThrough, null);
  assert.equal(expired.bookingFrom, null);
  assert.doesNotMatch(expired.availabilityCopy, /2026|november|korlátozott/);
});

test('porcelain 75k price applies now while treatment appointments start in November', () => {
  for (const date of ['2026-10-02', '2026-11-01', '2027-01-01']) {
    const offer = getVeneerOffer('indirekt-hej', date);
    assert.equal(offer.price, 75000);
    assert.equal(offer.regularPrice, 120000);
    assert.equal(offer.isPromotion, true);
    assert.equal(offer.bookingFrom, date < '2026-11-01' ? '2026-11-01' : null);
    assert.equal(offer.validThrough, null);
    assert.equal(offer.formattedPrice, '75.000 Ft');
  }
});

test('offer schema uses the same current price and exposes campaign expiry', () => {
  const siteUrl = 'https://www.crowndental.hu';
  for (const slug of Object.keys(VENEERS)) {
    for (const now of ['2026-10-02', VENEER_CAMPAIGN.endsAt]) {
      const offer = getVeneerOffer(slug, now);
      const schema = buildVeneerOfferSchema(slug, siteUrl, now);
      assert.equal(schema.price, offer.price);
      assert.equal(schema.priceSpecification.price, offer.price);
      assert.equal(schema.priceCurrency, 'HUF');
      assert.equal(schema.priceSpecification.unitText, 'fog');
      assert.equal(schema.url, `${siteUrl}${VENEERS[slug].path}`);
      assert.equal(schema.validThrough ?? null, offer.validThrough);
      assert.equal(schema.priceSpecification.validThrough ?? null, offer.validThrough);
    }
  }
  assert.equal(buildVeneerOfferSchema('direkt-hej', siteUrl, '2026-10-02').availabilityStarts, '2026-11-01T00:00:00+01:00');
  assert.equal(buildVeneerOfferSchema('indirekt-hej', siteUrl, '2026-10-02').availabilityStarts, '2026-11-01T00:00:00+01:00');
});

test('invalid treatment and time input never silently return a promotional price', () => {
  assert.throws(() => getVeneerOffer('unknown'), RangeError);
  assert.throws(() => getVeneerOffer('direkt-hej', 'not-a-date'), RangeError);
});
