/**
 * Client copy of agent listing packages. Amounts must match
 * property/server/agentPlans.js.
 */
export const AGENT_PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    quota: 5,
    amount: 25000,
    currency: 'NGN',
    blurb: 'Five live listings. For a single office just getting on the market.',
  },
  {
    id: 'pro',
    label: 'Pro',
    quota: 25,
    amount: 75000,
    currency: 'NGN',
    blurb: 'Twenty-five live listings. For a busy branch.',
  },
  {
    id: 'premium',
    label: 'Premium',
    quota: 100,
    amount: 180000,
    currency: 'NGN',
    blurb: 'A hundred live listings. For a multi-office agency.',
  },
];

export function agentPlanOf(id) {
  return AGENT_PLANS.find((p) => p.id === id) || null;
}
