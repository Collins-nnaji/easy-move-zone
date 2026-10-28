/**
 * Area insights: city comparisons, alternatives and board topics, worked
 * out from ratings and rentals (no database needed).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { cityAverages, alternatives, topics, medianYearlyRent } = require('../areaInsights');

const areas = [
  { slug: 'yaba', name: 'Yaba', city: 'Lagos' },
  { slug: 'gbagada', name: 'Gbagada', city: 'Lagos' },
  { slug: 'surulere', name: 'Surulere', city: 'Lagos' },
  { slug: 'wuse', name: 'Wuse', city: 'Abuja' },
];
const ratings = {
  yaba: { count: 10, power: 2, water: 3, flooding: 2.5, security: 3.5, roads: 3, noise: 2, network: 4.5 },
  gbagada: { count: 30, power: 4, water: 3.5, flooding: 3, security: 4, roads: 3, noise: 3, network: 4 },
  surulere: { count: 5, power: 2.5, water: 2, flooding: 2, security: 3, roads: 2.5, noise: 4, network: 3 },
  wuse: { count: 20, power: 5, water: 5, flooding: 5, security: 5, roads: 5, noise: 5, network: 5 },
};

test('city averages are weighted by how many people rated each area, and stay in the city', () => {
  const avg = cityAverages('Lagos', areas, ratings);
  // power: (2*10 + 4*30 + 2.5*5) / 45 = 3.39, shown as 3.4
  assert.equal(avg.power, 3.4);
  assert.ok(avg.network < 5, 'Abuja scores are not mixed in');
  assert.deepEqual(Object.values(cityAverages('Kano', areas, ratings)).filter((v) => v != null), []);
});

test('alternatives beat this area where it is weakest, and say where', () => {
  const alts = alternatives(areas[0], areas, ratings, { rentBySlug: { gbagada: 3000000 } });
  assert.equal(alts[0].slug, 'gbagada', 'best on Yaba\'s weakest factors (power, noise)');
  assert.deepEqual(alts[0].better.map((b) => b.id).sort(), ['noise', 'power']);
  assert.equal(alts[0].medianRent, 3000000);
  assert.ok(alts.every((a) => a.city === 'Lagos' && a.slug !== 'yaba'));
});

test('an unrated area is offered the best rated areas in its city', () => {
  const alts = alternatives({ slug: 'new', city: 'Lagos' }, areas, ratings);
  assert.equal(alts[0].slug, 'gbagada');
  assert.ok(alts.every((a) => a.better.length === 0));
});

test('topics are busiest first and drop empty ones', () => {
  assert.deepEqual(topics([{ category: 'safety', n: 1 }, { category: 'utilities', n: 4 }, { category: 'question', n: 0 }]),
    [{ category: 'utilities', count: 4 }, { category: 'safety', count: 1 }]);
});

test('the middle yearly rent counts rentals only, as yearly figures', () => {
  assert.equal(medianYearlyRent([
    { listing_type: 'rent', price: 100000, rent_frequency: 'monthly' },
    { listing_type: 'rent', price: 2000000, rent_frequency: 'annual' },
    { listing_type: 'rent', price: 3000000, rent_frequency: 'annual' },
    { listing_type: 'sale', price: 90000000 },
  ]), 2000000);
  assert.equal(medianYearlyRent([]), null);
});
