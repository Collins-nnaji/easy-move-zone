/**
 * EasyMoveZone Manage — client-side catalog for the letting & property management
 * layer. Plan ids, rates and add-ons mirror server/managementCatalog.js (the
 * server stays the source of truth for the fee that gets stored); this drives
 * the UI and the instant fee calculator.
 */

import { MARKET, CURRENCY } from './markets';
export { NIGERIAN_STATES } from './renovations';

/** VAT on our fee in the default market (Nigeria 7.5%) — from src/config/markets.js. */
export const VAT_PERCENT = MARKET.tax.percent;

export const MANAGEMENT_PLANS = [
  {
    id: 'tenant_find',
    name: 'Tenant Find',
    ratePct: 7.5,
    oneOff: true,
    priceNote: 'one-off, from the first year’s rent',
    tagline: 'We fill the property, you run it.',
    blurb: 'Marketing, viewings, tenant vetting and the tenancy agreement, then we hand you a signed tenant.',
    includes: [
      'Rental valuation and listing on EasyMoveZone',
      'Professional photos and a listing write-up',
      'Accompanied viewings with vetted enquirers',
      'Tenant screening for ID, employment and references',
      'Tenancy agreement drafted and signed',
      'First rent and deposit collected and remitted',
    ],
  },
  {
    id: 'rent_collect',
    name: 'Rent Collect',
    ratePct: 8,
    priceNote: 'of rent collected',
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
    priceNote: 'of rent collected',
    tagline: 'Hands off. Completely.',
    blurb: 'We run the property end to end, covering tenants, rent, repairs, inspections and compliance.',
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
    priceNote: 'indicative, quoted per portfolio',
    tagline: 'Blocks, estates and shortlets.',
    blurb: 'Multi-unit blocks, estates and serviced/shortlet stock, priced on the portfolio and quoted after a visit.',
    includes: [
      'Everything in Full Management, across every unit',
      'Service charge budgeting, collection and reporting',
      'Facilities, security and grounds supervision',
      'Shortlet / serviced operations and guest handling',
      'Consolidated portfolio reporting',
      'Fee negotiated on portfolio size, so the rate shown is indicative',
    ],
  },
];

export const PLAN_BY_ID = Object.fromEntries(MANAGEMENT_PLANS.map((p) => [p.id, p]));

export const MANAGEMENT_ADDONS = [
  { id: 'service_charge', name: 'Service charge administration', ratePct: 1.5, blurb: 'Budgeting, collection and reporting on estate levies.' },
  { id: 'facilities', name: 'Facilities & grounds', ratePct: 2, blurb: 'Security, cleaning, generators, lifts and common areas.' },
  { id: 'shortlet', name: 'Shortlet / serviced operations', ratePct: 6, blurb: 'Listings, guest turnover, housekeeping and dynamic pricing.' },
  { id: 'refurb', name: 'Void refurbishment', flatAnnual: 0, blurb: 'Between-tenant works run by EasyMoveZone Upgrade, quoted per job.' },
  { id: 'legal', name: 'Legal & recovery support', flatAnnual: 150000, blurb: 'Tenancy disputes, notices and recovery of premises.' },
  { id: 'accounting', name: 'Rental accounting pack', flatAnnual: 90000, blurb: 'Year-end income statement formatted for your tax filing.' },
];

export const ADDON_BY_ID = Object.fromEntries(MANAGEMENT_ADDONS.map((a) => [a.id, a]));

export const PROPERTY_TYPES = [
  'Detached house', 'Semi-detached house', 'Terrace / townhouse', 'Apartment / flat',
  'Duplex', 'Bungalow', 'Block of flats', 'Serviced apartment', 'Commercial', 'Mixed use', 'Other',
];

export const LETTING_STATUSES = [
  { id: 'vacant', label: 'Vacant and ready to let' },
  { id: 'tenanted', label: 'Already tenanted' },
  { id: 'new_build', label: 'New build / not finished' },
  { id: 'shortlet', label: 'Running as a shortlet' },
  { id: 'unsure', label: 'Not sure yet' },
];

export const FURNISHING = ['Unfurnished', 'Part-furnished', 'Fully furnished', 'Serviced'];

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5', '6+', 'N/A'];

/** Lifecycle labels for an owner's managed property. */
export const STATUS_LABEL = {
  new: 'Received',
  reviewing: 'In review',
  visit_booked: 'Management visit booked',
  proposal_sent: 'Proposal sent',
  onboarding: 'Onboarding',
  active: 'Under management',
  paused: 'Paused',
  ended: 'Ended',
  cancelled: 'Cancelled',
};

export const STATUS_TONE = {
  new: 'neutral',
  reviewing: 'neutral',
  visit_booked: 'info',
  proposal_sent: 'info',
  onboarding: 'info',
  active: 'good',
  paused: 'warn',
  ended: 'neutral',
  cancelled: 'warn',
};

/** How the service runs, shown as the "how it works" rail. */
export const MANAGEMENT_STEPS = [
  { title: 'You hand it over', body: 'Tell us about the property, pick a plan and sign the management authorization online.' },
  { title: 'We visit and value it', body: 'A property manager inspects it, sets an achievable rent, and flags anything to fix first.' },
  { title: 'We let it', body: 'Listing, viewings, tenant screening and the tenancy agreement, all handled and documented.' },
  { title: 'We run it', body: 'Rent collected, arrears chased, repairs coordinated, inspections done. You get statements.' },
  { title: 'You get paid', body: 'Net rent lands in your account on a fixed cycle, with every deduction itemised.' },
];

/**
 * Instant fee estimate — mirrors quoteFees() on the server so the calculator
 * can respond without a round trip. The server recomputes on submit.
 */
export function estimateFees({ plan, annualRent, units = 1, addons = [], vatPercent = VAT_PERCENT, currency = CURRENCY } = {}) {
  const p = PLAN_BY_ID[plan] || PLAN_BY_ID.full_management;
  const unitCount = Math.max(1, Math.min(500, Math.round(Number(units) || 1)));
  const grossAnnual = Math.max(0, Number(annualRent) || 0) * unitCount;

  const chosen = (addons || []).filter((a) => ADDON_BY_ID[a]);
  const addonPct = chosen.reduce((sum, id) => sum + (ADDON_BY_ID[id].ratePct || 0), 0);
  const addonFlat = chosen.reduce((sum, id) => sum + (ADDON_BY_ID[id].flatAnnual || 0), 0);

  const ratePct = p.ratePct + addonPct;
  const feeBeforeVat = (grossAnnual * ratePct) / 100 + addonFlat;
  const appliedVatPercent = Math.max(0, Number(vatPercent) || 0);
  const vat = (feeBeforeVat * appliedVatPercent) / 100;
  const feeAnnual = feeBeforeVat + vat;
  const netAnnual = Math.max(0, grossAnnual - feeAnnual);

  return {
    currency,
    plan: p.id,
    planName: p.name,
    oneOff: Boolean(p.oneOff),
    bespoke: Boolean(p.bespoke),
    units: unitCount,
    ratePct,
    planRatePct: p.ratePct,
    addonRatePct: addonPct,
    vatPercent: appliedVatPercent,
    grossAnnual: Math.round(grossAnnual),
    grossMonthly: Math.round(grossAnnual / 12),
    addonFlatAnnual: Math.round(addonFlat),
    feeBeforeVat: Math.round(feeBeforeVat),
    vat: Math.round(vat),
    feeAnnual: Math.round(feeAnnual),
    feeMonthly: Math.round(feeAnnual / 12),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
  };
}

/* ── Owner portal ─────────────────────────────────────────────── */

export const EXPENSE_CATEGORIES = [
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

export const EXPENSE_CATEGORY_LABEL = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.label]));

export const EXPENSE_STATUS_LABEL = {
  pending: 'Awaiting your approval',
  approved: 'Approved',
  rejected: 'Declined',
  paid: 'Paid & deducted',
};

export const EXPENSE_STATUS_TONE = {
  pending: 'warn', approved: 'info', rejected: 'neutral', paid: 'good',
};

export const PAYOUT_STATUS_LABEL = {
  scheduled: 'Scheduled', processing: 'Processing', paid: 'Paid', failed: 'Failed',
};

export const PAYOUT_STATUS_TONE = {
  scheduled: 'info', processing: 'info', paid: 'good', failed: 'warn',
};

export const RENT_STATUS_LABEL = {
  due: 'Due', received: 'Received', part: 'Part paid', overdue: 'Overdue', void: 'Void',
};

export const RENT_STATUS_TONE = {
  due: 'neutral', received: 'good', part: 'warn', overdue: 'warn', void: 'neutral',
};

export const TENANCY_STATUS_LABEL = {
  active: 'Active', notice: 'On notice', ended: 'Ended', void: 'Void',
};

export const TENANCY_STATUS_TONE = {
  active: 'good', notice: 'warn', ended: 'neutral', void: 'neutral',
};

export const PAYOUT_CYCLES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'on_receipt', label: 'As rent clears' },
];

export const RENT_FREQUENCY_LABEL = {
  annual: 'per year', biannual: 'twice a year', quarterly: 'per quarter', monthly: 'per month',
};

/** Payments per year — annualises a tenancy for portfolio totals. */
export const FREQUENCY_PER_YEAR = { annual: 1, biannual: 2, quarterly: 4, monthly: 12 };

export function annualiseRent(amount, frequency) {
  return (Number(amount) || 0) * (FREQUENCY_PER_YEAR[frequency] || 1);
}

/** ₦ formatting for the calculator — compact enough for tight cells. */
export function naira(value) {
  const n = Number(value) || 0;
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${sign}₦${(abs / 1_000_000_000).toFixed(2)}b`;
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}m`;
  if (abs >= 1_000) return `${sign}₦${Math.round(abs / 1_000)}k`;
  return `${sign}₦${Math.round(abs).toLocaleString()}`;
}

/* ── Talking to a manager ─────────────────────────────────────── */

/**
 * The three ways an owner can start a conversation, shown on /manage/consult
 * and in the booking form. `id` is stored as the booking's service.
 */
export const CONSULT_TIERS = [
  {
    id: 'discovery',
    name: 'Discovery call',
    price: 'Free · 20 minutes',
    summary: 'Your property, what is going wrong with it, and whether we are the right people to fix it.',
    includes: [
      'What the property should be earning',
      'An honest read on why it is not',
      'Which plan fits, including "none of them"',
    ],
  },
  {
    id: 'visit',
    name: 'Management visit',
    price: 'Free once you sign · ₦50,000 standalone',
    summary: 'A property manager walks the property, sets an achievable rent, and lists what to fix before it is let.',
    includes: [
      'On-site inspection with a photo report',
      'Rental valuation against real local lettings',
      'Works list, priced, in order of what pays back',
      'Written management proposal with the fee on it',
    ],
    featured: true,
  },
  {
    id: 'portfolio_review',
    name: 'Portfolio review',
    price: 'From ₦150,000',
    summary: 'For owners with several units: what each one should earn, where the money is leaking, and how to close it.',
    includes: [
      'Unit-by-unit rent and occupancy review',
      'Arrears, voids and service-charge leakage',
      'A twelve-month income plan for the portfolio',
      'Two follow-up sessions as it is implemented',
    ],
  },
];

export const CONSULT_TIER_BY_ID = Object.fromEntries(CONSULT_TIERS.map((t) => [t.id, t]));

/** How much property the owner has — asked on the booking form. */
export const PORTFOLIO_BANDS = [
  'One property',
  '2 – 5 units',
  '6 – 20 units',
  'More than 20 units',
];

export const CONSULT_WINDOWS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

/**
 * EasyMoveZone Manage is paid by the owner, out of rent it has actually
 * collected — never by contractors, agents or tenants. Keep in sync with the
 * disclosure copy on /manage/consult.
 */
export const FEE_DISCLOSURE =
  'EasyMoveZone Manage is paid by you, out of rent we have actually collected. We take no commission from contractors, no cut from artisans, and no fee from tenants. So the repair we recommend is the repair the property needs.';
