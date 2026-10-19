/**
 * EasyMoveZone Manage — the letting & property management layer.
 *
 * An owner hands us a property; we find and vet the tenant, collect the rent,
 * run maintenance, and pay the owner net of fees. This module is the pricing
 * source of truth (the client mirror lives in src/config/management.js).
 *
 * All fees are a percentage of collected rent, so the owner never pays out of
 * pocket — we deduct and remit the balance. VAT is charged on our fee only.
 */

const { DEFAULT_CURRENCY, DEFAULT_MARKET, MARKETS } = require('./markets');

/** The default market's tax on our fee (Nigeria: VAT 7.5%); per-country rates come from server/markets.js. */
const VAT_PERCENT = MARKETS[DEFAULT_MARKET].tax.percent;

const PLANS = [
  {
    id: 'tenant_find',
    name: 'Tenant Find',
    ratePct: 7.5,
    /** One-off: charged once against the first year's rent, not annually. */
    oneOff: true,
    tagline: 'We fill the property, you run it.',
    blurb: 'Marketing, viewings, tenant vetting and the tenancy agreement — then we hand you a signed tenant.',
    includes: [
      'Rental valuation and listing on EasyMoveZone',
      'Professional photos and a listing write-up',
      'Accompanied viewings with vetted enquirers',
      'Tenant screening — ID, employment and references',
      'Tenancy agreement drafted and signed',
      'First rent and deposit collected and remitted',
    ],
  },
  {
    id: 'rent_collect',
    name: 'Rent Collect',
    ratePct: 8,
    tagline: 'We find the tenant and collect the rent.',
    blurb: 'Everything in Tenant Find, plus rent collection, arrears chasing and monthly owner statements.',
    includes: [
      'Everything in Tenant Find',
      'Rent collected and remitted on a fixed cycle',
      'Arrears chased and escalated on your behalf',
      'Monthly statement and annual income summary',
      'Renewal and rent-review negotiation',
    ],
  },
  {
    id: 'full_management',
    name: 'Full Management',
    ratePct: 12,
    featured: true,
    tagline: 'Hands off. Completely.',
    blurb: 'We run the property end to end — tenants, rent, repairs, inspections and compliance.',
    includes: [
      'Everything in Rent Collect',
      'Dedicated property manager',
      '24/7 tenant reporting line for faults',
      'Repairs and maintenance coordinated with vetted artisans',
      'Quarterly inspections with photo reports',
      'Move-in / move-out inventory and deposit handling',
      'Compliance, levies and utility oversight',
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio & Serviced',
    ratePct: 15,
    bespoke: true,
    tagline: 'Blocks, estates and shortlets.',
    blurb: 'Multi-unit blocks, estates and serviced/shortlet stock — priced on the portfolio, quoted after a visit.',
    includes: [
      'Everything in Full Management, across every unit',
      'Service charge budgeting, collection and reporting',
      'Facilities, security and grounds supervision',
      'Shortlet / serviced operations and guest handling',
      'Consolidated portfolio reporting',
      'Fee negotiated on portfolio size — the rate shown is indicative',
    ],
  },
];

const PLAN_IDS = PLANS.map((p) => p.id);
const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]));

/**
 * Optional extras layered on any plan. `ratePct` is added to the plan rate;
 * `flatAnnual` is a fixed naira amount per property, per year.
 */
const ADDONS = [
  { id: 'service_charge', name: 'Service charge administration', ratePct: 1.5, blurb: 'Budgeting, collection and reporting on estate levies.' },
  { id: 'facilities', name: 'Facilities & grounds', ratePct: 2, blurb: 'Security, cleaning, generators, lifts and common areas.' },
  { id: 'shortlet', name: 'Shortlet / serviced operations', ratePct: 6, blurb: 'Listings, guest turnover, housekeeping and dynamic pricing.' },
  { id: 'refurb', name: 'Void refurbishment', flatAnnual: 0, blurb: 'Between-tenant works run by EasyMoveZone Upgrade, quoted per job.' },
  { id: 'legal', name: 'Legal & recovery support', flatAnnual: 150000, blurb: 'Tenancy disputes, notices and recovery of premises.' },
  { id: 'accounting', name: 'Rental accounting pack', flatAnnual: 90000, blurb: 'Year-end income statement formatted for your tax filing.' },
];

const ADDON_IDS = ADDONS.map((a) => a.id);
const ADDON_BY_ID = Object.fromEntries(ADDONS.map((a) => [a.id, a]));

const LETTING_STATUSES = ['vacant', 'tenanted', 'new_build', 'shortlet', 'unsure'];

const PROPERTY_TYPES = [
  'Detached house', 'Semi-detached house', 'Terrace / townhouse', 'Apartment / flat',
  'Duplex', 'Bungalow', 'Block of flats', 'Serviced apartment', 'Commercial', 'Mixed use', 'Other',
];

function round(n) {
  return Math.round(Number(n) || 0);
}

/**
 * Indicative fee breakdown for a property.
 *
 * @param {object} input
 * @param {string} input.plan          plan id
 * @param {number} input.annualRent    expected annual rent, per unit, in naira
 * @param {number} [input.units]       number of lettable units (default 1)
 * @param {string[]} [input.addons]    addon ids
 * @returns {object} breakdown — annual and monthly fee, VAT, and net to owner
 */
function quoteFees({ plan, annualRent, units = 1, addons = [], vatPercent = VAT_PERCENT, currency = DEFAULT_CURRENCY } = {}) {
  const p = PLAN_BY_ID[plan] || PLAN_BY_ID.full_management;
  const unitCount = Math.max(1, Math.min(500, Math.round(Number(units) || 1)));
  const rentPerUnit = Math.max(0, Number(annualRent) || 0);
  const grossAnnual = rentPerUnit * unitCount;

  const chosen = (Array.isArray(addons) ? addons : []).filter((a) => ADDON_IDS.includes(a));
  const addonPct = chosen.reduce((sum, id) => sum + (ADDON_BY_ID[id].ratePct || 0), 0);
  const addonFlat = chosen.reduce((sum, id) => sum + (ADDON_BY_ID[id].flatAnnual || 0), 0);

  const ratePct = p.ratePct + addonPct;
  const feeBeforeVat = (grossAnnual * ratePct) / 100 + addonFlat;
  const vat = (feeBeforeVat * vatPercent) / 100;
  const feeTotal = feeBeforeVat + vat;
  const netAnnual = Math.max(0, grossAnnual - feeTotal);

  return {
    currency,
    plan: p.id,
    planName: p.name,
    oneOff: Boolean(p.oneOff),
    bespoke: Boolean(p.bespoke),
    units: unitCount,
    addons: chosen,
    planRatePct: p.ratePct,
    addonRatePct: addonPct,
    ratePct,
    vatPercent,
    grossAnnual: round(grossAnnual),
    grossMonthly: round(grossAnnual / 12),
    addonFlatAnnual: round(addonFlat),
    feeBeforeVat: round(feeBeforeVat),
    vat: round(vat),
    feeAnnual: round(feeTotal),
    feeMonthly: round(feeTotal / 12),
    netAnnual: round(netAnnual),
    netMonthly: round(netAnnual / 12),
  };
}

/* ── Portal: tenancies, costs and payouts ──────────────────────────── */

const EXPENSE_CATEGORIES = [
  { id: 'repairs', label: 'Repairs' },
  { id: 'maintenance', label: 'Planned maintenance' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'service_charge', label: 'Service charge & levies' },
  { id: 'security', label: 'Security' },
  { id: 'compliance', label: 'Compliance & legal' },
  { id: 'furnishing', label: 'Furnishing' },
  { id: 'void', label: 'Void / turnover works' },
  { id: 'other', label: 'Other' },
];
const EXPENSE_CATEGORY_IDS = EXPENSE_CATEGORIES.map((c) => c.id);

const PAYOUT_CYCLES = ['monthly', 'quarterly', 'on_receipt'];

const RENT_FREQUENCIES = ['annual', 'biannual', 'quarterly', 'monthly'];

/** Payments per year for each rent frequency — used to annualise a tenancy. */
const FREQUENCY_PER_YEAR = { annual: 1, biannual: 2, quarterly: 4, monthly: 12 };

/** A tenancy's rent expressed as an annual figure, whatever the cycle. */
function annualiseRent(amount, frequency) {
  const per = FREQUENCY_PER_YEAR[frequency] || 1;
  return (Number(amount) || 0) * per;
}

/**
 * Build an owner payout from collected rent and the costs to net off.
 *
 * The fee is charged on rent actually collected in the period, VAT applies to
 * the fee alone, and approved costs come off after that. A payout can never be
 * negative — a shortfall is carried as an adjustment on the next one.
 *
 * @param {object} input
 * @param {number} input.grossRent   rent collected in the period
 * @param {number} input.feePct      management fee rate, as a percentage
 * @param {number} [input.expenses]  approved costs to deduct
 * @param {number} [input.adjustment] carried balance (negative reduces the payout)
 * @returns {{grossRent:number, feePct:number, feeAmount:number, vatAmount:number,
 *   expenseAmount:number, adjustment:number, netAmount:number, carried:number, vatPercent:number}}
 */
function computePayout({ grossRent, feePct, expenses = 0, adjustment = 0, vatPercent = VAT_PERCENT } = {}) {
  const gross = Math.max(0, Number(grossRent) || 0);
  const rate = Math.min(100, Math.max(0, Number(feePct) || 0));
  const expenseAmount = Math.max(0, Number(expenses) || 0);
  const adj = Number(adjustment) || 0;

  // Round each line to whole naira first, then derive the net from the rounded
  // lines — so the statement the owner reads always adds up exactly.
  const grossLine = round(gross);
  const feeLine = round((gross * rate) / 100);
  const vatLine = round((((gross * rate) / 100) * vatPercent) / 100);
  const costLine = round(expenseAmount);
  const adjustmentLine = round(adj);
  const withCarry = grossLine - feeLine - vatLine - costLine + adjustmentLine;

  // A negative balance is carried forward rather than billed to the owner.
  return {
    grossRent: grossLine,
    feePct: rate,
    feeAmount: feeLine,
    vatAmount: vatLine,
    expenseAmount: costLine,
    adjustment: adjustmentLine,
    netAmount: Math.max(0, withCarry),
    carried: withCarry < 0 ? withCarry : 0,
    vatPercent,
  };
}

/** The fee rate that actually applies to a property: agreed, else quoted, else plan. */
function effectiveFeePct(row) {
  if (row?.agreed_fee_pct != null) return Number(row.agreed_fee_pct);
  if (row?.quote?.ratePct != null) return Number(row.quote.ratePct);
  return PLAN_BY_ID[row?.plan]?.ratePct ?? 0;
}

module.exports = {
  VAT_PERCENT,
  PLANS,
  PLAN_IDS,
  PLAN_BY_ID,
  ADDONS,
  ADDON_IDS,
  ADDON_BY_ID,
  LETTING_STATUSES,
  PROPERTY_TYPES,
  quoteFees,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_IDS,
  PAYOUT_CYCLES,
  RENT_FREQUENCIES,
  FREQUENCY_PER_YEAR,
  annualiseRent,
  computePayout,
  effectiveFeePct,
};
