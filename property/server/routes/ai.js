/**
 * AI surfaces for the property platform:
 *  - POST /api/ai/chat          — EasyAdviser, grounded in the owner's own
 *                                 managed properties, tenancies and arrears
 *  - GET/DELETE /api/ai/history — that owner's advisor conversation
 *
 * Everything degrades: with no AI credentials configured, chat falls back to
 * something computed from the owner's real numbers rather than failing, so
 * the assistant is never empty.
 */
const express = require('express');
const { pool, getOrCreateUser } = require('../db');
const { hasAiCredentials, resolveModel, createChatCompletion } = require('../openai-client');

const router = express.Router();

const NO_DASH_RULE = 'Never use em dashes or en dashes in your writing. Use periods, commas, or colons instead.';

const ADVICE_DISCLAIMER =
  'This is general guidance, not legal or tax advice. Your property manager confirms anything specific to your tenancy.';

const CHAT_SYSTEM = `You are EasyAdviser, the assistant inside EasyMoveZone, a Nigerian property platform. People buy and sell property here, and owners hand their properties to EasyMoveZone Manage to be let and run.

You help owners understand their own properties:
- "Where is my rent?" -> read their rent charges, arrears and next payout from the facts below.
- "Why was this deducted?" -> explain the management fee, VAT and property costs on their statement.
- "Which plan am I on?" -> explain what Tenant Find, Rent Collect, Full Management and Portfolio cover, and what each leaves with the owner.
- "Should I upgrade?" -> reason from how far they live from the property, who handles repairs, and how collection is going.
- "What is a fair rent here?" -> talk in ranges and local comparables, never a promise.

Guidelines:
- Prefer Naira and Nigerian market context. Reference the owner's own numbers when they are given below.
- Never invent properties, tenants, rents or payouts that are not in the facts you are given.
- Never promise a rent, a yield or a letting date. Frame it as what the property should achieve and what would have to be true.
- Do not give legal advice on eviction, notices or recovery of premises. Point those to a property manager.
- Use markdown sparingly (**bold** for key terms). Keep answers under 280 words unless asked for detail.
- Point owners to /manage/match (which plan fits), /manage (hand a property over), /manage/portal (statements and payouts) and /manage/consult (talk to a manager).
- ${NO_DASH_RULE}`;

/**
 * The owner's real position, as plain text for the system prompt: which plan
 * the matcher put them on, what is under management, and whether the rent is
 * actually arriving.
 */
async function buildOwnerContext(email) {
  if (!email) return null;

  const [profileRes, propertiesRes] = await Promise.all([
    pool.query('SELECT * FROM landlord_profiles WHERE email = $1', [email]),
    pool.query(
      `SELECT id, ref, title, plan, status, units, letting_status, state, city, expected_rent, agreed_fee_pct
         FROM management_requests
        WHERE LOWER(contact_email) = $1
        ORDER BY created_at DESC`,
      [email]
    ),
  ]);

  const profile = profileRes.rows[0] || null;
  const properties = propertiesRes.rows;
  if (!profile && properties.length === 0) return null;

  const fmt = (n) => `₦${Math.round(Number(n) || 0).toLocaleString('en-NG')}`;
  const lines = [];

  if (profile) {
    lines.push(`MATCHED PLAN: ${profile.plan_label || profile.plan} (hands-off score ${profile.score}/100)`);
  } else {
    lines.push('MATCHED PLAN: they have not run the plan matcher yet. Encourage them to at /manage/match.');
  }

  if (!properties.length) {
    lines.push('\nUNDER MANAGEMENT: nothing yet. They can hand a property over at /manage.');
    return lines.join('\n');
  }

  const ids = properties.map((p) => p.id);
  const [tenancyRes, arrearsRes, payoutRes] = await Promise.all([
    pool.query(
      `SELECT request_id, status, rent_amount, rent_frequency FROM management_tenancies
        WHERE request_id = ANY($1)`,
      [ids]
    ),
    pool.query(
      `SELECT COALESCE(SUM(GREATEST(0, amount - amount_received)), 0) AS arrears
         FROM management_rent_charges
        WHERE request_id = ANY($1) AND status IN ('due','part','overdue') AND due_date <= NOW()`,
      [ids]
    ),
    pool.query(
      `SELECT amount, status, scheduled_for, paid_on FROM management_payouts
        WHERE request_id = ANY($1)
        ORDER BY COALESCE(paid_on, scheduled_for) DESC NULLS LAST LIMIT 1`,
      [ids]
    ),
  ]);

  const activeTenancies = tenancyRes.rows.filter((t) => t.status === 'active' || t.status === 'notice');

  lines.push(`\nUNDER MANAGEMENT: ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}.`);
  lines.push('PROPERTIES: ' + properties.map((p) => (
    `${p.title} (${p.ref}, ${p.plan.replace(/_/g, ' ')}, status ${p.status}, ${p.units} unit(s)`
    + `${p.city || p.state ? `, ${[p.city, p.state].filter(Boolean).join(' ')}` : ''}`
    + `${p.expected_rent ? `, expected rent ${fmt(p.expected_rent)}` : ''}`
    + `${p.agreed_fee_pct ? `, agreed fee ${p.agreed_fee_pct}%` : ''})`
  )).join('; '));

  lines.push(`TENANCIES: ${activeTenancies.length} active or on notice.`);

  const arrears = Number(arrearsRes.rows[0]?.arrears || 0);
  lines.push(arrears > 0
    ? `ARREARS: ${fmt(arrears)} outstanding and past its due date.`
    : 'ARREARS: none outstanding.');

  const payout = payoutRes.rows[0];
  if (payout) {
    lines.push(`LATEST PAYOUT: ${fmt(payout.amount)}, status ${payout.status}`
      + `${payout.paid_on ? `, paid ${new Date(payout.paid_on).toISOString().slice(0, 10)}` : ''}`
      + `${!payout.paid_on && payout.scheduled_for ? `, scheduled ${new Date(payout.scheduled_for).toISOString().slice(0, 10)}` : ''}.`);
  } else {
    lines.push('LATEST PAYOUT: none yet.');
  }

  return lines.join('\n');
}

/** Deterministic answer when no AI credentials are set — still their real numbers. */
function fallbackReply(context) {
  if (!context) {
    return 'I can answer questions about your properties once you have run the plan matcher at /manage/match or handed a property over at /manage.'
      + '\n\n(Natural-language answers need an OpenAI or Azure key configured on the server.)';
  }
  return `Here is where you stand right now:\n\n${context}\n\n${ADVICE_DISCLAIMER}`
    + '\n\n(Natural-language answers need an OpenAI or Azure key configured on the server.)';
}

/* POST /api/ai/chat — { sessionId, message } */
router.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body || {};
  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required.' });
  }
  const text = String(message).slice(0, 2000);
  const email = String(sessionId).startsWith('auth:') ? String(sessionId).slice(5).toLowerCase() : null;

  try {
    const user = await getOrCreateUser(sessionId);
    const context = await buildOwnerContext(email);

    await pool.query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [user.id, 'user', text]
    );

    let reply;
    if (!hasAiCredentials()) {
      reply = fallbackReply(context);
    } else {
      const { rows: history } = await pool.query(
        'SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [user.id]
      );
      const completion = await createChatCompletion({
        model: resolveModel('chat'),
        messages: [
          {
            role: 'system',
            content: context
              ? `${CHAT_SYSTEM}\n\nTHIS OWNER'S REAL FACTS (use these, do not invent others):\n${context}`
              : `${CHAT_SYSTEM}\n\nThis owner has no property under management yet. Answer generally and encourage them to find their plan at /manage/match.`,
          },
          ...history.reverse().map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 700,
      });
      reply = completion.choices[0]?.message?.content?.trim() || fallbackReply(context);
    }

    await pool.query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [user.id, 'assistant', reply]
    );
    res.json({ reply, grounded: Boolean(context) });
  } catch (err) {
    console.error('POST /ai/chat error:', err.message);
    res.status(500).json({ error: 'Could not reach the advisor.' });
  }
});

/* GET /api/ai/history?sessionId=... */
router.get('/history', async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });
  try {
    const user = await getOrCreateUser(sessionId);
    const { rows } = await pool.query(
      'SELECT role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 100',
      [user.id]
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error('GET /ai/history error:', err.message);
    res.status(500).json({ error: 'Could not load your conversation.' });
  }
});

/* DELETE /api/ai/history?sessionId=... */
router.delete('/history', async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });
  try {
    const user = await getOrCreateUser(sessionId);
    await pool.query('DELETE FROM chat_messages WHERE user_id = $1', [user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /ai/history error:', err.message);
    res.status(500).json({ error: 'Could not clear your conversation.' });
  }
});

module.exports = router;
