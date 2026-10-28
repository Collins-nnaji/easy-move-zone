/**
 * Rental checks, in naira: what a renter can ask us to check before paying
 * rent. One price per check type, and extra services on top. Mirrors
 * server/verificationCatalog.js (same ids and numbers); the server re-prices
 * every request, so this file only drives what the form shows.
 */

export const VERIFICATION_TYPES = [
  {
    id: 'landlord',
    name: 'Landlord and agent check',
    price: 25000,
    blurb: 'Is the person you are paying real, and allowed to let this home? No site visit.',
    covers: ['Landlord or agent identity', 'Proof they own the home or may let it', 'Agent registration, if an agent', 'Search for scam and fraud reports'],
  },
  {
    id: 'home',
    name: 'Home and landlord check',
    price: 50000,
    featured: true,
    blurb: 'Everything above, and we visit: the home exists, matches the photos and is as described.',
    covers: ['Landlord or agent identity', 'Proof they own the home or may let it', 'A visit, with photos of the home', 'Water, power and condition on the day'],
  },
  {
    id: 'full',
    name: 'Full rental check',
    price: 80000,
    blurb: 'Everything above, plus the tenancy agreement, a fair-rent check and an area report.',
    covers: ['Landlord or agent identity', 'Proof they own the home or may let it', 'A visit, with photos of the home', 'Tenancy agreement review', 'Fair-rent check', 'Flooding, security and access report'],
  },
];

export const VERIFICATION_EXTRAS = [
  { id: 'agreement', name: 'Tenancy agreement review', price: 20000, includedIn: ['full'], blurb: 'Rent, caution deposit, service charge, notice and who fixes what, read before you sign.' },
  { id: 'fair_rent', name: 'Fair-rent check', price: 10000, includedIn: ['full'], blurb: 'Is the rent in line with similar homes nearby?' },
  { id: 'neighbourhood', name: 'Flooding, security and access report', price: 15000, includedIn: ['full'], blurb: 'Flood history, road access and what residents say about the area.' },
  { id: 'express', name: 'Express turnaround (48 hours)', price: 15000, includedIn: [], blurb: 'When the landlord wants an answer this week.' },
];

export const DEFAULT_VERIFICATION_TYPE = 'home';

/** The same arithmetic the server does: extras the type covers are free. */
export function quoteVerification(typeId, extraIds = []) {
  const type = VERIFICATION_TYPES.find((t) => t.id === typeId) || VERIFICATION_TYPES.find((t) => t.id === DEFAULT_VERIFICATION_TYPE);
  const extras = VERIFICATION_EXTRAS.filter((e) => extraIds.includes(e.id) && !e.includedIn.includes(type.id));
  return { type, extras, total: type.price + extras.reduce((sum, e) => sum + e.price, 0) };
}
