/**
 * Agent listing packages. Amounts are NGN per month. Change here (and the
 * client copy in property/app/config/agentPlans.js) together.
 */
const PLANS = {
  starter: {
    id: 'starter',
    label: 'Starter',
    quota: 5,
    amount: 25000,
    currency: 'NGN',
    blurb: 'Five live listings. For a single office just getting on the market.',
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    quota: 25,
    amount: 75000,
    currency: 'NGN',
    blurb: 'Twenty-five live listings. For a busy branch.',
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    quota: 100,
    amount: 180000,
    currency: 'NGN',
    blurb: 'A hundred live listings. For a multi-office agency.',
  },
};

const PERIOD_DAYS = 30;

function planOf(id) {
  return PLANS[id] || null;
}

function publicPlans() {
  return Object.values(PLANS);
}

module.exports = { PLANS, PERIOD_DAYS, planOf, publicPlans };
