/**
 * The landlord plan matcher.
 *
 * Owners rarely know which management plan they need — they know what is
 * going wrong. These questions ask about the situation (distance, time,
 * who answers at 11pm, how rent collection is actually going) and score it
 * into a "hands-off" number, which maps to one of the plans in
 * config/management.js.
 *
 * The answers and the derived recommendation are sent to
 * POST /api/landlord/profile, which validates and stores them. Keep the
 * PLAN_RECOMMENDATIONS `key` values in sync with MANAGEMENT_PLANS ids.
 */

export const MATCH_QUESTIONS = [
  {
    id: 'location',
    question: 'How far are you from the property?',
    help: 'Distance decides how much of this you can realistically do yourself.',
    options: [
      { value: 'same_area', label: 'Same city, I can be there within the hour', points: 0 },
      { value: 'same_country', label: 'Elsewhere in Nigeria', points: 8 },
      { value: 'abroad', label: 'Outside Nigeria', points: 16 },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you give the property in a normal month?',
    options: [
      { value: 'plenty', label: 'Several hours, and I do not mind running it', points: 0 },
      { value: 'some', label: 'An evening or two, if nothing goes wrong', points: 6 },
      { value: 'little', label: 'Almost none', points: 12 },
      { value: 'none', label: 'None. That is why I am here.', points: 16 },
    ],
  },
  {
    id: 'emergency',
    question: 'A pipe bursts at 11pm on a Sunday. Who picks up?',
    help: 'Be honest. This is the question that separates the plans.',
    options: [
      { value: 'me', label: 'Me. I have artisans I trust.', points: 0 },
      { value: 'caretaker', label: 'A caretaker or family member on the ground', points: 6 },
      { value: 'unsure', label: 'I would have to start calling around', points: 12 },
      { value: 'nobody', label: 'Nobody. That is exactly the problem.', points: 16 },
    ],
  },
  {
    id: 'rent_trouble',
    question: 'How does rent collection go today?',
    options: [
      { value: 'smooth', label: 'On time, every time', points: 0 },
      { value: 'not_let', label: 'It is not let yet', points: 8 },
      { value: 'late', label: 'Late more often than not', points: 12 },
      { value: 'chasing', label: 'I am always chasing, sometimes for months', points: 16 },
    ],
  },
  {
    id: 'units',
    question: 'How much are we talking about?',
    options: [
      { value: 'one', label: 'One property', points: 0 },
      { value: 'few', label: '2 to 5 units', points: 5 },
      { value: 'block', label: 'A block or small estate, 6 to 20 units', points: 10 },
      { value: 'portfolio', label: 'More than 20 units', points: 12 },
    ],
  },
  {
    id: 'use',
    question: 'What is it, or what will it be?',
    options: [
      { value: 'long_let', label: 'A normal long let', points: 0 },
      { value: 'unsure', label: 'Not decided yet', points: 5 },
      { value: 'commercial', label: 'Commercial or mixed use', points: 8 },
      { value: 'shortlet', label: 'A shortlet or serviced apartment', points: 10 },
    ],
  },
  {
    id: 'want',
    question: 'What do you actually want from us?',
    options: [
      { value: 'find', label: 'Just find me a good tenant. I will run it.', points: 0 },
      { value: 'collect', label: 'Find the tenant and collect the rent', points: 8 },
      { value: 'unsure', label: 'Tell me what I need', points: 10 },
      { value: 'everything', label: 'Everything. I do not want to think about it.', points: 16 },
    ],
  },
];

export const MAX_MATCH_SCORE = MATCH_QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0
);

/**
 * The recommendation each score band maps to. `key` is a plan id from
 * MANAGEMENT_PLANS; `stillYours` is the part the owner keeps, which is the
 * honest half of the pitch and the reason people trade up a plan.
 */
export const PLAN_RECOMMENDATIONS = [
  {
    key: 'tenant_find',
    label: 'Tenant Find',
    max: 22,
    summary: 'You are close by, you have time, and you have people you trust. You do not need a manager. You need a good tenant.',
    weTake: ['Rental valuation and listing', 'Viewings and tenant screening', 'Tenancy agreement and first rent'],
    stillYours: ['Rent collection every cycle', 'Repairs and artisans', 'Inspections and renewals'],
  },
  {
    key: 'rent_collect',
    label: 'Rent Collect',
    max: 48,
    summary: 'The property is not the problem. The chasing is. We let it, then collect and remit the rent so you stop being the one making the calls.',
    weTake: ['Everything in Tenant Find', 'Rent collected and remitted on a cycle', 'Arrears chased and escalated', 'Monthly owner statements'],
    stillYours: ['Repairs and maintenance', 'Inspections and compliance'],
  },
  {
    key: 'full_management',
    label: 'Full Management',
    max: 100,
    summary: 'You are far away, short on time, or nobody is picking up when something breaks. We run it end to end and you read the statement.',
    weTake: ['Everything in Rent Collect', 'A dedicated property manager', '24/7 tenant reporting line', 'Repairs run with vetted artisans', 'Quarterly inspections with photos'],
    stillYours: ['Approving spend above your limit', 'The decisions that are yours to make'],
  },
];

/**
 * Multi-unit and shortlet stock is a different job from a single let, whatever
 * the score says — it is priced per portfolio after a visit.
 */
export const PORTFOLIO_RECOMMENDATION = {
  key: 'portfolio',
  label: 'Portfolio & Serviced',
  summary: 'Blocks, estates and serviced stock are a different job from a single let, with service charges, facilities and guest turnover to run. We quote this one after a visit.',
  weTake: ['Everything in Full Management, across every unit', 'Service charge budgeting and collection', 'Facilities, security and grounds', 'Shortlet operations and guest handling'],
  stillYours: ['Capital works decisions', 'The annual budget sign-off'],
};

/** Answers that make it a portfolio job regardless of the score. */
function needsPortfolioPlan(answers) {
  return ['block', 'portfolio'].includes(answers.units) || answers.use === 'shortlet';
}

/** @param {Record<string,string>} answers question id → option value */
export function scoreAnswers(answers) {
  let points = 0;
  let answered = 0;
  for (const q of MATCH_QUESTIONS) {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (opt) {
      points += opt.points;
      answered += 1;
    }
  }
  return {
    points,
    answered,
    complete: answered === MATCH_QUESTIONS.length,
    score: Math.round((points / MAX_MATCH_SCORE) * 100),
  };
}

/** Look up a recommendation by its stored plan key. */
export function recommendationByKey(key) {
  if (key === PORTFOLIO_RECOMMENDATION.key) return PORTFOLIO_RECOMMENDATION;
  return PLAN_RECOMMENDATIONS.find((r) => r.key === key) || null;
}

export function recommendationForScore(score) {
  return PLAN_RECOMMENDATIONS.find((r) => score <= r.max) || PLAN_RECOMMENDATIONS[PLAN_RECOMMENDATIONS.length - 1];
}

/** Full derived recommendation from a set of answers. */
export function profileFromAnswers(answers) {
  const { score, complete, answered } = scoreAnswers(answers);
  const scored = recommendationForScore(score);
  const upgraded = needsPortfolioPlan(answers);
  const rec = upgraded ? PORTFOLIO_RECOMMENDATION : scored;

  return {
    score,
    complete,
    answered,
    plan: rec.key,
    planLabel: rec.label,
    summary: rec.summary,
    weTake: rec.weTake,
    stillYours: rec.stillYours,
    /* Set when the unit count or use overrode what the score alone suggested. */
    upgradedFrom: upgraded && scored.key !== rec.key ? scored.key : null,
    location: answers.location || null,
    units: answers.units || null,
  };
}
