/**
 * Verification prices, in naira. The server is the source of truth for the fee
 * that gets stored: the client sends only ids, and `quoteVerification` prices
 * them. Mirror any change in src/config/verification.js (same ids, same
 * numbers) so the form shows what the server will store.
 */

const { DEFAULT_CURRENCY } = require('./markets');

/*
 * Rental checks: what a renter can ask us to check before they pay rent.
 * Rental scams (fake landlords, homes that are not for let, agents taking
 * money for someone else's flat) are the risk, so every type starts with
 * the person and their right to let. Older requests keep their own stored
 * type and checklist; only new requests are priced from this list.
 */
const VERIFICATION_TYPES = [
  {
    id: 'landlord',
    name: 'Landlord and agent check',
    price: 25000,
    checks: ['identity', 'authority'],
  },
  {
    id: 'home',
    name: 'Home and landlord check',
    price: 50000,
    checks: ['identity', 'authority', 'inspection'],
  },
  {
    id: 'full',
    name: 'Full rental check',
    price: 80000,
    checks: ['identity', 'authority', 'inspection', 'agreement', 'rent', 'risk'],
  },
];

const VERIFICATION_EXTRAS = [
  { id: 'agreement', name: 'Tenancy agreement review', price: 20000, includedIn: ['full'], check: 'agreement' },
  { id: 'fair_rent', name: 'Fair-rent check', price: 10000, includedIn: ['full'], check: 'rent' },
  { id: 'neighbourhood', name: 'Flooding, security and access report', price: 15000, includedIn: ['full'], check: 'risk' },
  { id: 'express', name: 'Express turnaround (48 hours)', price: 15000, includedIn: [] },
];

const TYPE_IDS = VERIFICATION_TYPES.map((t) => t.id);

/** Price a type plus extras; extras the type already covers cost nothing. */
function quoteVerification(typeId, extraIds = []) {
  const type = VERIFICATION_TYPES.find((t) => t.id === typeId) || VERIFICATION_TYPES.find((t) => t.id === 'home');
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
