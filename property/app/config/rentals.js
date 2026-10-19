/**
 * Renting. A rental is a vacant property we manage, advertised on the Rent
 * page (`RENT_URL`) once the owner allows it. The server keeps the same lists
 * in `server/routes/listings.js` — change both together.
 */

export const RENT_FREQUENCIES = [
  { id: 'annual', label: 'Yearly', per: 'year' },
  { id: 'biannual', label: 'Every 6 months', per: '6 months' },
  { id: 'quarterly', label: 'Quarterly', per: 'quarter' },
  { id: 'monthly', label: 'Monthly', per: 'month' },
];

const BY_ID = Object.fromEntries(RENT_FREQUENCIES.map((f) => [f.id, f]));

/** "year", "month"… for "₦6,500,000 / year". Rent in Nigeria is usually yearly. */
export const perPeriod = (frequency) => (BY_ID[frequency] || BY_ID.annual).per;

export const INCOME_BANDS = [
  'Under ₦250,000 a month',
  '₦250,000 – ₦500,000 a month',
  '₦500,000 – ₦1m a month',
  '₦1m – ₦2.5m a month',
  'Above ₦2.5m a month',
];

export const ID_TYPES = ['NIN', 'International passport', "Driver's licence", "Voter's card", 'Other'];

export const VIEWING_WINDOWS = ['Any time', 'Morning', 'Afternoon', 'Evening', 'Weekend'];

/** The desk's pipeline for one applicant, in order. `let` is set by creating the tenancy. */
export const APPLICATION_STATUSES = ['new', 'contacted', 'viewing_booked', 'vetting', 'approved', 'declined', 'let', 'withdrawn'];

export const APPLICATION_STATUS_LABEL = {
  new: 'New',
  contacted: 'Contacted',
  viewing_booked: 'Viewing booked',
  vetting: 'Checking references',
  approved: 'Approved',
  declined: 'Declined',
  let: 'Tenant',
  withdrawn: 'Withdrawn',
};

/** What an owner sees about their rental, in plain words. */
export const RENTAL_STATUS_LABEL = {
  reviewing: 'Being prepared',
  live: 'Advertised',
  let: 'Let',
  withdrawn: 'Taken down',
};
