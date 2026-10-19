/**
 * What a verification costs, in naira — one price per verification type, and
 * extra services on top. Mirrors server/verificationCatalog.js (same ids and
 * numbers); the server re-prices every request, so this file only drives
 * what the form shows.
 */

export const VERIFICATION_TYPES = [
  {
    id: 'document',
    name: 'Document check',
    price: 150000,
    blurb: 'Title documents and seller checked at the registry. No site visit.',
    covers: ['Seller identity and ownership', 'Title and document authenticity', 'Court and encumbrance search'],
  },
  {
    id: 'land',
    name: 'Land verification',
    price: 250000,
    blurb: 'For a plot: title, survey plan and a visit to walk the boundaries.',
    covers: ['Seller identity and ownership', 'Title and document authenticity', 'Survey plan charted at the Surveyor-General', 'Site visit and boundary check'],
  },
  {
    id: 'home',
    name: 'Home verification',
    price: 400000,
    blurb: 'For a built property: documents, location and a physical inspection.',
    covers: ['Seller identity and ownership', 'Title and document authenticity', 'Survey and location', 'Physical inspection with photos'],
  },
  {
    id: 'passport',
    name: 'Full Property Passport',
    price: 650000,
    featured: true,
    blurb: 'Everything we check, with an independent valuation and risk report.',
    covers: ['Seller identity and ownership', 'Title and document authenticity', 'Court and encumbrance search', 'Survey charting', 'Independent valuation', 'Physical inspection', 'Flood, access and neighbourhood report'],
  },
];

export const VERIFICATION_EXTRAS = [
  { id: 'litigation', name: 'Court and encumbrance search', price: 100000, includedIn: ['document', 'passport'], blurb: 'Is the property in a court case, mortgaged or under a government acquisition?' },
  { id: 'survey_charting', name: 'Survey charting at the Surveyor-General', price: 75000, includedIn: ['land', 'passport'], blurb: 'Confirms the survey plan and that the land is free of acquisition.' },
  { id: 'valuation', name: 'Independent valuation report', price: 150000, includedIn: ['passport'], blurb: 'A registered estate surveyor’s view of what it is worth.' },
  { id: 'neighbourhood', name: 'Flood, access and neighbourhood report', price: 80000, includedIn: ['passport'], blurb: 'Flood history, road access and what the area is like.' },
  { id: 'structural', name: 'Structural engineer’s inspection', price: 200000, includedIn: [], blurb: 'Cracks, foundations and build quality, by a qualified engineer.' },
  { id: 'express', name: 'Express turnaround (5 working days)', price: 120000, includedIn: [], blurb: 'Your report in five working days instead of the usual ten to fifteen.' },
];

export const DEFAULT_VERIFICATION_TYPE = 'passport';

/** The same arithmetic the server does: extras the type covers are free. */
export function quoteVerification(typeId, extraIds = []) {
  const type = VERIFICATION_TYPES.find((t) => t.id === typeId) || VERIFICATION_TYPES.find((t) => t.id === DEFAULT_VERIFICATION_TYPE);
  const extras = VERIFICATION_EXTRAS.filter((e) => extraIds.includes(e.id) && !e.includedIn.includes(type.id));
  return { type, extras, total: type.price + extras.reduce((sum, e) => sum + e.price, 0) };
}
