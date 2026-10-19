const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('../markets');
const { quoteFees, computePayout } = require('../managementCatalog');
const { TITLE_DOCUMENTS, TITLE_DOCUMENTS_BY_MARKET } = require('../titleDocuments');

test('Nigeria is the default and only live market', () => {
  assert.equal(m.DEFAULT_MARKET, 'NG');
  assert.equal(m.DEFAULT_CURRENCY, 'NGN');
  assert.deepEqual(m.LIVE_MARKETS.map((x) => x.code), ['NG']);
  assert.equal(m.marketFor('Nigeria').code, 'NG');
  assert.equal(m.marketFor('ng').code, 'NG');
  assert.equal(m.marketFor('').code, 'NG', 'unknown falls back to the default');
  assert.equal(m.knownMarket('United Kingdom'), null, 'but knownMarket does not guess');
});

test('phone numbers go out in +234 form', () => {
  assert.equal(m.normalisePhone('0803 123 4567'), '2348031234567');
  assert.equal(m.normalisePhone('8031234567'), '2348031234567');
  assert.equal(m.normalisePhone('+234 803 123 4567'), '2348031234567');
  assert.equal(m.normalisePhone('2348031234567'), '2348031234567');
  assert.equal(m.normalisePhone('+44 7700 900123'), '447700900123', 'a foreign number keeps its own code');
  assert.equal(m.normalisePhone('12345'), '');
  assert.equal(m.normalisePhone(''), '');
});

test('money, tax and online payment follow the market', () => {
  assert.equal(m.formatMoney(4500000), '₦4,500,000');
  assert.equal(m.taxPercentFor('Nigeria'), 7.5);
  assert.equal(m.canPayOnline('NGN'), true);
  assert.equal(m.canPayOnline('USD'), false);
  assert.equal(m.currencyCode('ngn'), 'NGN');
  assert.equal(m.currencyCode('naira'), 'NGN', 'junk falls back to the default currency');
});

test('fees and payouts use the tax rate they are given (default: Nigerian VAT)', () => {
  const q = quoteFees({ plan: 'full_management', annualRent: 1000000 });
  assert.equal(q.vatPercent, 7.5);
  assert.equal(q.currency, 'NGN');
  const q0 = quoteFees({ plan: 'full_management', annualRent: 1000000, vatPercent: 0 });
  assert.ok(q0.feeAnnual < q.feeAnnual || q0.vatAnnual === 0);
  const p = computePayout({ grossRent: 1000000, feePct: 10 });
  assert.equal(p.vatAmount, 7500);
  assert.equal(computePayout({ grossRent: 1000000, feePct: 10, vatPercent: 0 }).vatAmount, 0);
});

test('title documents are kept per market', () => {
  assert.equal(TITLE_DOCUMENTS, TITLE_DOCUMENTS_BY_MARKET.NG);
  assert.ok(TITLE_DOCUMENTS.c_of_o);
});
