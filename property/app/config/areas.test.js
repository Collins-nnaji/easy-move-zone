import { test, expect } from 'vitest';
import { matchAreas, matchReason } from './areas';

const areas = [
  { slug: 'yaba', name: 'Yaba', city: 'Lagos', ratings: 10, medianRent: 2000000, averages: { power: 2, security: 4, water: 3 } },
  { slug: 'gbagada', name: 'Gbagada', city: 'Lagos', ratings: 30, medianRent: 3500000, averages: { power: 4, security: 4.2, water: 3.8 } },
  { slug: 'lekki', name: 'Lekki', city: 'Lagos', ratings: 0, medianRent: 6000000, averages: {} },
  { slug: 'wuse', name: 'Wuse', city: 'Abuja', ratings: 12, medianRent: null, averages: { power: 4.5, security: 4.5 } },
];

test('nothing to rank until someone says what matters', () => {
  expect(matchAreas(areas, {})).toEqual([]);
});

test('ranks by what matters, and leaves out areas nobody has scored', () => {
  const out = matchAreas(areas, { priorities: ['power', 'security'] });
  expect(out.map((m) => m.area.slug)).toEqual(['wuse', 'gbagada', 'yaba']);
  expect(out[0].match).toBe(90);
  expect(out.find((m) => m.area.slug === 'yaba').weak.map((f) => f.id)).toEqual(['power']);
});

test('city and budget narrow it, and an area with no rent data is kept but flagged', () => {
  expect(matchAreas(areas, { priorities: ['power'], city: 'Lagos', maxRent: 3000000 }).map((m) => m.area.slug)).toEqual(['yaba']);
  const abuja = matchAreas(areas, { priorities: ['power'], city: 'Abuja', maxRent: 3000000 });
  expect(abuja[0].rentUnknown).toBe(true);
});

test('the reason names the strong and weak factors', () => {
  const [, , yaba] = matchAreas(areas, { priorities: ['power', 'security'] });
  expect(matchReason(yaba)).toBe('Strong on safety (4.0), weaker on power supply (2.0)');
});
