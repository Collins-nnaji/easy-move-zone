const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSchedule, addMonths } = require('../services/rent');

test('an annual tenancy is one charge on the start date', () => {
  const s = buildSchedule({ start_date: '2026-03-01', end_date: '2027-02-28', rent_amount: 4500000, rent_frequency: 'annual' });
  assert.equal(s.length, 1);
  assert.deepEqual(s[0], { due_date: '2026-03-01', amount: 4500000, period_label: 'Rent Mar 2026 – Feb 2027' });
});

test('a monthly tenancy has one charge per month, labelled by month', () => {
  const s = buildSchedule({ start_date: '2026-01-15', end_date: '2026-06-14', rent_amount: 200000, rent_frequency: 'monthly' });
  assert.deepEqual(s.map((c) => c.due_date), ['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15', '2026-05-15']);
  assert.equal(s[0].period_label, 'Rent Jan 2026');
});

test('quarterly and biannual step by 3 and 6 months', () => {
  assert.equal(buildSchedule({ start_date: '2026-01-01', end_date: '2026-12-31', rent_amount: 1, rent_frequency: 'quarterly' }).length, 4);
  assert.equal(buildSchedule({ start_date: '2026-01-01', end_date: '2026-12-31', rent_amount: 1, rent_frequency: 'biannual' }).length, 2);
});

test('no end date means one year; no start or no rent means nothing', () => {
  assert.equal(buildSchedule({ start_date: '2026-01-01', rent_amount: 1, rent_frequency: 'monthly' }).length, 12);
  assert.equal(buildSchedule({ start_date: null, rent_amount: 1, rent_frequency: 'monthly' }).length, 0);
  assert.equal(buildSchedule({ start_date: '2026-01-01', rent_amount: 0, rent_frequency: 'monthly' }).length, 0);
});

test('month arithmetic clamps to the end of short months', () => {
  assert.equal(addMonths(new Date('2026-01-31T00:00:00Z'), 1).toISOString().slice(0, 10), '2026-02-28');
  assert.equal(addMonths(new Date('2028-01-31T00:00:00Z'), 1).toISOString().slice(0, 10), '2028-02-29');
});
