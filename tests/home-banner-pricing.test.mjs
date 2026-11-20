import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const price = text => Number(text.replace(/\D/g, ''));
const crownNames = {
  hu: 'Fémkerámia korona',
  en: 'Metal-ceramic crown',
  de: 'Metallkeramikkrone',
  sk: 'Kovo-keramická korunka',
};

for (const [locale, crownName] of Object.entries(crownNames)) {
  const messages = JSON.parse(read('messages/' + locale + '.json'));
  test(locale + ': metal-ceramic crown costs 55000 in every visible price location', () => {
    const items = messages.treatments.priceCategories.flatMap(category => category.items);
    assert.equal(price(items.find(item => item.name === crownName).price), 55000);
    assert.equal(price(messages.home.services.cards.find(card => card.slug === 'koronak-hidak').price), 55000);
    assert.equal(price(messages.treatmentPages['koronak-hidak'].heroPriceValue), 55000);
  });
  test(locale + ': all three original banner messages remain available', () => {
    assert.equal(messages.home.hero.slides.length, 3);
    for (const slide of messages.home.hero.slides) {
      for (const key of ['tag', 'titleTop', 'titleBottom', 'subtitle', 'primaryText']) {
        assert.ok(slide[key]?.trim(), locale + ': ' + key);
      }
    }
  });
}

test('quote comparison uses the same metal-ceramic crown price', () => {
  assert.match(read('lib/quotePricing.ts'), /'Fémkerámia korona': '55 000 Ft'/);
});

test('homepage restores original banner sources while retaining CTA attribution', () => {
  const source = read('app/[locale]/HomeClient.tsx');
  assert.match(source, /<HeroSlider images=\{sanityImages\.hero\} \/>/);
  for (const key of ['fokep', 'fokep1', 'fokep2']) assert.ok(source.includes('image: images.' + key));
  assert.ok(source.includes('data-cta-location="home_hero"'));
  assert.ok(source.includes('const carouselPaused = Boolean(prefersReducedMotion)'));
  assert.ok(!source.includes('images.locations.esztergom?.imageUrl || images.hero.fokep1'));
});

for (const locale of Object.keys(crownNames)) {
  test(locale + ': orthodontic links and fees stay aligned with the public fee schedule', () => {
    const { home, treatments, treatmentPages } = JSON.parse(read('messages/' + locale + '.json'));
    assert.equal(home.services.cards[0].slug, 'fogszabalyozas');
    assert.ok(home.services.cards.some(card => card.slug === 'gyerekfogaszat'));
    assert.equal(treatments.cards[0].id, 'fogszabalyozas');
    const fees = treatments.priceCategories.flatMap(group => group.items).filter(item => item.slug === 'fogszabalyozas');
    assert.equal(fees.length, 4);
    const amounts = value => value.match(/[0-9][\d., ]*/g).map(amount => price(amount));
    const removable = fees.find(item => amounts(item.price)[0] === 65000);
    assert.deepEqual(amounts(treatmentPages.fogszabalyozas.heroPriceValue), amounts(removable.price));
    assert.ok(treatmentPages.fogszabalyozas.faqs.some(({ a }) => a.includes('Petőfi Sándor utca 11')));
  });
}
