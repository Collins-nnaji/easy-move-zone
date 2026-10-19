/**
 * Labels for the tenant portal. The ids match server/routes/tenant.js
 * (CATEGORIES, URGENCIES, STATUSES) — change both together.
 */
export const TENANT_REQUEST_CATEGORIES = [
  { id: 'repair', label: 'Something needs fixing', short: 'Repair' },
  { id: 'payment', label: 'I have paid rent or a charge', short: 'Payment made' },
  { id: 'question', label: 'A question for my manager', short: 'Question' },
  { id: 'notice', label: 'I plan to move out', short: 'Notice to leave' },
];
export const TENANT_CATEGORY_LABEL = Object.fromEntries(TENANT_REQUEST_CATEGORIES.map((c) => [c.id, c.short]));

export const TENANT_URGENCIES = [
  { id: 'low', label: 'Can wait', hint: 'Cosmetic, or when convenient' },
  { id: 'normal', label: 'Soon', hint: 'Within a few days' },
  { id: 'urgent', label: 'Urgent', hint: 'No water or power, a leak, a security risk' },
];
export const TENANT_URGENCY_LABEL = Object.fromEntries(TENANT_URGENCIES.map((u) => [u.id, u.label]));

export const TENANT_REQUEST_STATUS_LABEL = {
  new: 'Received',
  in_progress: 'Being handled',
  scheduled: 'Visit booked',
  resolved: 'Resolved',
  closed: 'Closed',
};
export const TENANT_REQUEST_STATUS_TONE = {
  new: 'warn', in_progress: 'info', scheduled: 'info', resolved: 'good', closed: undefined,
};
export const OPEN_TENANT_STATUSES = ['new', 'in_progress', 'scheduled'];

/** Where a rental application stands, in the applicant's words. */
export const APPLICATION_STATUS_LABEL = {
  new: 'Received',
  contacted: 'We have been in touch',
  viewing_booked: 'Viewing booked',
  vetting: 'Checking references',
  approved: 'Approved',
  declined: 'Not successful',
  let: 'Tenancy set up',
  withdrawn: 'Withdrawn',
};
export const APPLICATION_STATUS_TONE = {
  new: 'warn', contacted: 'info', viewing_booked: 'info', vetting: 'info', approved: 'good', let: 'good',
};
