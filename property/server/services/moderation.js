const { hasAiCredentials, resolveModel, createChatCompletion } = require('../openai-client');

/**
 * Screening for neighbourhood posts and replies. The board is about places
 * (a building, a street, the water supply), so three things never go up on
 * their own:
 *
 *   - contact details (a phone number or email): refused outright, so nobody
 *     is doxxed and nobody touts on the board;
 *   - anything that may name a private person or accuse someone of a crime
 *     or fraud: held for a person on the desk to read first;
 *   - abuse: held the same way.
 *
 * Everything else is published at once. With AI credentials configured, a
 * model reads the text as a second check and can hold it too; without them
 * the rules below decide alone.
 */

const PHONE_RE = /(?:\+?234[\s-]?|\b0)[789][01]\d(?:[\s-]?\d){7}\b/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

/** Words that turn a post about a place into a claim about someone. */
const ACCUSATION_RE = /\b(scam(?:mer|med|s)?|fraud(?:ster|ulent)?|thie(?:f|ves)|stole|419|criminal|dupe[ds]?|con ?m[ae]n|swindl\w*|fake agent|crook|liar|cultist|kidnap\w*|rapist|witch)\b/i;

/** An honorific (any case) and a capitalised name: "Mr Okafor", "alhaji Musa", "Chief Bello". */
const HONORIFICS = ['mr', 'mrs', 'ms', 'miss', 'madam', 'chief', 'alhaji', 'alhaja', 'dr', 'barr', 'engr', 'pastor', 'prophet'];
const NAMED_PERSON_RE = new RegExp(
  `\\b(?:${HONORIFICS.map((w) => `[${w[0]}${w[0].toUpperCase()}]${w.slice(1)}`).join('|')})\\.?\\s+[A-Z][a-z]{2,}`
);

const ABUSE_RE = /\b(fuck\w*|shit\w*|bastard|idiot|stupid|ashawo|olodo|mumu)\b/i;

/** Rules only: { refuse?: string } for contact details, else { status, reasons }. */
function screenText(text) {
  const body = String(text || '');
  if (PHONE_RE.test(body) || EMAIL_RE.test(body)) {
    return { refuse: 'Please remove phone numbers and email addresses. Posts are public, and contact details are never shared on the board.' };
  }
  const reasons = [];
  if (ACCUSATION_RE.test(body)) reasons.push('Accuses someone of wrongdoing');
  if (NAMED_PERSON_RE.test(body)) reasons.push('May name a private person');
  if (ABUSE_RE.test(body)) reasons.push('Abusive language');
  return { status: reasons.length ? 'held' : 'published', reasons };
}

const AI_SYSTEM = `You moderate a neighbourhood board on a Nigerian property site. Residents post about areas, streets, buildings, power, water, flooding, safety and transport.
Allowed: honest first-hand experiences of a place or building, including negative ones ("the compound floods every July", "the caretaker took two weeks to fix the pump"), questions and tips.
Not allowed: naming or identifying a private individual, accusing a specific person or business of a crime or fraud, hate, harassment, threats, sexual content, advertising or touting.
Respond ONLY with JSON: {"allow": true|false, "reason": "short reason when not allowed"}`;

/** The model's verdict, or null when it is not configured or does not answer. */
async function aiVerdict(text) {
  if (!hasAiCredentials()) return null;
  try {
    const completion = await Promise.race([
      createChatCompletion({
        model: resolveModel('default'),
        messages: [{ role: 'system', content: AI_SYSTEM }, { role: 'user', content: String(text).slice(0, 2000) }],
        temperature: 0,
        max_tokens: 80,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('moderation timeout')), 6000)),
    ]);
    const raw = completion.choices[0]?.message?.content || '';
    const json = JSON.parse(raw.replace(/```(?:json)?|```/g, '').trim());
    return { allow: json.allow !== false, reason: String(json.reason || '').slice(0, 200) };
  } catch (err) {
    console.warn('Area moderation AI check skipped:', err.message);
    return null;
  }
}

/** Rules, then the model when the rules let it through. */
async function screen(text) {
  const ruled = screenText(text);
  if (ruled.refuse || ruled.status === 'held') return ruled;
  const ai = await aiVerdict(text);
  if (ai && !ai.allow) return { status: 'held', reasons: [ai.reason || 'Flagged by automatic review'] };
  return ruled;
}

module.exports = { screen, screenText };
