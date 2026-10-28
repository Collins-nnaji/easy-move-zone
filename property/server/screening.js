/**
 * Tenant screening: the checks run on a rental applicant before a landlord
 * (or an agent) lets them the home, and inspections of a managed home.
 * Mirrored in app/config/rentals.js (same ids) for the labels.
 */

const SCREENING_CHECKS = [
  { id: 'identity', label: 'Identity' },
  { id: 'income', label: 'Income or work' },
  { id: 'reference', label: 'Reference' },
  { id: 'landlord', label: 'Previous landlord' },
];
const SCREENING_IDS = SCREENING_CHECKS.map((c) => c.id);
const SCREENING_RESULTS = ['pending', 'passed', 'failed', 'waived'];

/** Keep only known checks with known results, merged over what was stored. */
function mergeScreening(stored, patch) {
  const next = { ...(stored && typeof stored === 'object' ? stored : {}) };
  if (!patch || typeof patch !== 'object') return next;
  for (const id of SCREENING_IDS) {
    if (SCREENING_RESULTS.includes(patch[id])) next[id] = patch[id];
  }
  return next;
}

/** How far screening has got: every check passed or waived is "done". */
function screeningSummary(screening) {
  const s = screening && typeof screening === 'object' ? screening : {};
  const done = SCREENING_IDS.filter((id) => s[id] === 'passed' || s[id] === 'waived').length;
  const failed = SCREENING_IDS.some((id) => s[id] === 'failed');
  return { done, total: SCREENING_IDS.length, failed };
}

const INSPECTION_KINDS = ['move_in', 'routine', 'move_out'];
const INSPECTION_STATUSES = ['scheduled', 'completed', 'cancelled'];
const INSPECTION_CONDITIONS = ['good', 'fair', 'needs_work'];

module.exports = {
  SCREENING_CHECKS, SCREENING_IDS, SCREENING_RESULTS, mergeScreening, screeningSummary,
  INSPECTION_KINDS, INSPECTION_STATUSES, INSPECTION_CONDITIONS,
};
