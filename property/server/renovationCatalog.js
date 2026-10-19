/**
 * EasyMoveZone Upgrade — service catalog + indicative cost estimator.
 *
 * The estimator returns a *rough, indicative* range only. It is deliberately
 * conservative and clearly labelled in the UI as a pre-inspection guide; the
 * firm number always comes from an in-house inspector after the site visit.
 * Ranges are in NGN and are a starting point — tune from real job data.
 */

const { DEFAULT_CURRENCY } = require('./markets');

const SERVICES = [
  {
    id: 'solar',
    name: 'Solar & Inverter',
    blurb: 'Solar panels, inverter and battery backup for reliable, lower-cost power.',
    // Indicative base ranges keyed by size band (see SIZE_BANDS below).
    ranges: { small: [1500000, 3500000], medium: [3500000, 8000000], large: [8000000, 20000000] },
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    blurb: 'Design and build of a new pool, or refurbishment of an existing one.',
    ranges: { small: [4000000, 8000000], medium: [8000000, 16000000], large: [16000000, 40000000] },
  },
  {
    id: 'borehole',
    name: 'Borehole & Water',
    blurb: 'Borehole drilling, pumps, treatment and overhead storage.',
    ranges: { small: [800000, 1800000], medium: [1800000, 4000000], large: [4000000, 9000000] },
  },
  {
    id: 'roofing',
    name: 'Roofing',
    blurb: 'Re-roofing, leak repairs and upgrades to long-span or stone-coated roofs.',
    ranges: { small: [900000, 2500000], medium: [2500000, 6000000], large: [6000000, 15000000] },
  },
  {
    id: 'remodel',
    name: 'Kitchen / Bathroom Remodel',
    blurb: 'Full refit of kitchens and bathrooms — fittings, tiling, plumbing and finishes.',
    ranges: { small: [1200000, 3000000], medium: [3000000, 7500000], large: [7500000, 18000000] },
  },
  {
    id: 'security',
    name: 'Security & CCTV',
    blurb: 'CCTV, access control, electric fencing and smart-home security.',
    ranges: { small: [600000, 1500000], medium: [1500000, 4000000], large: [4000000, 10000000] },
  },
  {
    id: 'power',
    name: 'Generator & Power',
    blurb: 'Generator supply/install, changeover panels and power distribution.',
    ranges: { small: [800000, 2000000], medium: [2000000, 5000000], large: [5000000, 14000000] },
  },
  {
    id: 'painting',
    name: 'Painting & Finishes',
    blurb: 'Interior and exterior painting, POP ceilings, screeding and finishes.',
    ranges: { small: [500000, 1500000], medium: [1500000, 4000000], large: [4000000, 10000000] },
  },
  {
    id: 'fencing',
    name: 'Fencing & Landscaping',
    blurb: 'Perimeter fencing, gates, interlocking and outdoor landscaping.',
    ranges: { small: [1000000, 3000000], medium: [3000000, 7000000], large: [7000000, 18000000] },
  },
  {
    id: 'extension',
    name: 'Extension / Renovation',
    blurb: 'Room additions, BQ builds and whole-property renovations.',
    ranges: { small: [3000000, 8000000], medium: [8000000, 20000000], large: [20000000, 60000000] },
  },
  {
    id: 'other',
    name: 'Other Upgrade',
    blurb: 'Anything else — tell us what you have in mind and we will scope it.',
    ranges: { small: [500000, 2000000], medium: [2000000, 6000000], large: [6000000, 20000000] },
  },
];

const SIZE_BANDS = [
  { id: 'small', label: 'Small (flat / 1–2 bedrooms)' },
  { id: 'medium', label: 'Medium (3–4 bedroom home)' },
  { id: 'large', label: 'Large (duplex / estate / commercial)' },
];

const SERVICE_IDS = SERVICES.map((s) => s.id);

function getService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

/**
 * Indicative pre-inspection estimate. Optionally nudged by a photo-condition
 * signal (0..1, higher = worse condition → more work) from the vision engine.
 */
function estimateCost(serviceId, sizeBand, conditionSignal) {
  const svc = getService(serviceId) || getService('other');
  const band = SIZE_BANDS.some((b) => b.id === sizeBand) ? sizeBand : 'medium';
  let [low, high] = svc.ranges[band] || svc.ranges.medium;
  if (typeof conditionSignal === 'number' && conditionSignal > 0) {
    // Worse condition shifts the range upward by up to ~25%.
    const bump = 1 + Math.min(0.25, Math.max(0, conditionSignal) * 0.25);
    low = Math.round(low * (1 + (bump - 1) * 0.5));
    high = Math.round(high * bump);
  }
  return {
    currency: DEFAULT_CURRENCY,
    low,
    high,
    band,
    service: svc.id,
    serviceName: svc.name,
    note: 'Indicative pre-inspection range. Your firm quote is confirmed after an on-site inspection.',
  };
}

/** Default milestone split for a confirmed quote (deposit + progress + completion). */
function defaultMilestones(amount, currency = DEFAULT_CURRENCY) {
  const a = Number(amount) || 0;
  const deposit = Math.round(a * 0.4);
  const progress = Math.round(a * 0.4);
  const completion = a - deposit - progress;
  return [
    { seq: 1, label: 'Deposit (mobilisation)', amount: deposit, currency },
    { seq: 2, label: 'Progress payment', amount: progress, currency },
    { seq: 3, label: 'Completion & handover', amount: completion, currency },
  ];
}

module.exports = {
  SERVICES,
  SIZE_BANDS,
  SERVICE_IDS,
  getService,
  estimateCost,
  defaultMilestones,
};
