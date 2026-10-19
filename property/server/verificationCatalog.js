/**
 * Verification prices, in naira. The server is the source of truth for the fee
 * that gets stored: the client sends only ids, and `quoteVerification` prices
 * them. Mirror any change in src/config/verification.js (same ids, same
 * numbers) so the form shows what the server will store.
 */

const { DEFAULT_CURRENCY } = require('./markets');

const VERIFICATION_TYPES = [
  {
    id: 'document',
    name: 'Document check',
    price: 150000,
    checks: ['seller', 'title'],
  },
  {
    id: 'land',
    name: 'Land verification',
    price: 250000,
    checks: ['seller', 'title', 'survey', 'inspection'],
  },
  {
    id: 'home',
    name: 'Home verification',
    price: 400000,
    checks: ['seller', 'title', 'survey', 'inspection'],
  },
  {
    id: 'passport',
    name: 'Full Property Passport',
    price: 650000,
    checks: ['seller', 'title', 'survey', 'valuation', 'inspection', 'risk'],
  },
];

const VERIFICATION_EXTRAS = [
  { id: 'litigation', name: 'Court and encumbrance search', price: 100000, includedIn: ['document', 'passport'] },
  { id: 'survey_charting', name: 'Survey charting at the Surveyor-General', price: 75000, includedIn: ['land', 'passport'] },
  { id: 'valuation', name: 'Independent valuation report', price: 150000, includedIn: ['passport'], check: 'valuation' },
  { id: 'neighbourhood', name: 'Flood, access and neighbourhood report', price: 80000, includedIn: ['passport'], check: 'risk' },
  { id: 'structural', name: 'Structural engineer’s inspection', price: 200000, includedIn: [] },
  { id: 'express', name: 'Express turnaround (5 working days)', price: 120000, includedIn: [] },
];

const TYPE_IDS = VERIFICATION_TYPES.map((t) => t.id);

/** Price a type plus extras; extras the type already covers cost nothing. */
function quoteVerification(typeId, extraIds = []) {
  const type = VERIFICATION_TYPES.find((t) => t.id === typeId) || VERIFICATION_TYPES.find((t) => t.id === 'passport');
  const wanted = Array.isArray(extraIds) ? extraIds : [];
  const extras = VERIFICATION_EXTRAS
    .filter((e) => wanted.includes(e.id) && !e.includedIn.includes(type.id))
    .map((e) => ({ id: e.id, name: e.name, price: e.price }));
  const total = type.price + extras.reduce((sum, e) => sum + e.price, 0);
  const checks = new Set(type.checks);
  extras.forEach((e) => { const x = VERIFICATION_EXTRAS.find((v) => v.id === e.id); if (x.check) checks.add(x.check); });
  return { type: { id: type.id, name: type.name, price: type.price }, extras, total, currency: DEFAULT_CURRENCY, checks: [...checks] };
}

module.exports = { VERIFICATION_TYPES, VERIFICATION_EXTRAS, TYPE_IDS, quoteVerification };
