const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { hasAiCredentials, resolveModel, createChatCompletion } = require('../openai-client');

/**
 * EasyMoveZone Insights — an AI-assisted editorial desk. Posts are drafted from
 * EasyMoveZone's own real data (what each management plan covers, and the
 * anonymised shape of the properties on the platform), then reviewed and
 * published by an admin.
 */
const { requireAdmin } = require('../auth');

function slugify(str) {
  return String(str || 'insight')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'insight';
}

function parseJsonResponse(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : raw;
  return JSON.parse(body);
}

const NO_DASH_RULE = 'Never use em dashes or en dashes in your writing. Use periods, commas, or colons instead.';

const BASE_DRAFT_RULES = `Use ONLY the facts given below. Every number must trace to FACTS. Never invent market returns, yields or prices that are not present here.
Confident, plain, editorial tone. No hype, no emojis, minimal markdown (**bold** for key terms only).
Never promise a rent, a yield or a letting date, and never name a specific development as a buy. Write at the market and process level, and close by noting this is general guidance, not legal, tax or investment advice.
${NO_DASH_RULE}
Respond ONLY with valid JSON (no markdown fences): { "title": "...", "dek": "one-sentence summary, under 160 chars", "body": "2-5 short paragraphs" }`;

/** What each management plan covers. Mirrors MANAGEMENT_PLANS in src/config/management.js. */
const MANAGEMENT_PLANS = [
  { plan: 'Tenant Find', rate: '7.5% of the first year\u2019s rent, one-off', covers: 'valuation, listing, viewings, tenant screening and the tenancy agreement', leaves: 'rent collection, repairs, inspections and renewals with the owner' },
  { plan: 'Rent Collect', rate: '8% of rent collected', covers: 'everything in Tenant Find, plus rent collection, arrears chasing and monthly owner statements', leaves: 'repairs, maintenance and compliance with the owner' },
  { plan: 'Full Management', rate: '12% of rent collected', covers: 'everything in Rent Collect, plus a dedicated manager, a 24/7 fault line, repairs with vetted artisans and quarterly inspections', leaves: 'only spend approvals above the owner\u2019s limit' },
  { plan: 'Portfolio & Serviced', rate: '15% indicative, quoted per portfolio', covers: 'multi-unit blocks and serviced stock, service charge administration, facilities and shortlet operations', leaves: 'capital works decisions and the annual budget sign-off' },
];

/**
 * Story types: different narrative angles over the same real platform data.
 * `needsPlan` means the piece is built around one specific management plan
 * rather than a scan across all of them.
 */
const STORY_TYPES = {
  'market-note': {
    label: 'Market note',
    category: 'market-note',
    needsPlan: false,
    system: 'Write a punchy commentary on the state of the Nigerian lettings market right now: what is letting, what is sitting empty, and what owners are getting wrong. Use the plans in FACTS as the reference point for what a manager actually does.',
  },
  'plan-study': {
    label: 'Management plan study',
    category: 'market-note',
    needsPlan: true,
    system: 'Walk through one management plan in detail: which owner it is built for, what the fee buys, what it deliberately leaves with the owner, and what would justify moving up or down a plan.',
  },
  'landlord-guide': {
    label: 'Landlord guide',
    category: 'planning-guide',
    needsPlan: false,
    system: 'Write an educational, evergreen guide for Nigerian landlords. Teach one thing properly (screening a tenant, what a tenancy agreement must say, handling arrears before they become a court case, budgeting for voids and service charges), using the plans in FACTS as supporting illustration.',
  },
  'buyer-guide': {
    label: 'Buyer guide',
    category: 'planning-guide',
    needsPlan: false,
    system: 'Explain one part of buying property in Nigeria: title and documentation, what a survey actually tells you, service charges and levies, or how to read an asking price against the area. Be concrete about the checks and the order to do them in.',
  },
  'owner-question': {
    label: 'Owner question',
    category: 'market-note',
    needsPlan: false,
    system: 'Answer a question a Nigerian property owner actually asks ("should I shortlet or long let?", "my tenant has not paid since March, what now?", "is it worth furnishing?") at the practical level, grounded in the plans in FACTS.',
  },
};

/**
 * Builds the real-data digest a draft is grounded in: what each plan covers,
 * plus the anonymised distribution of the plans owners are actually on.
 * Aggregate counts only, never an individual owner's property or money.
 */
async function buildDraftFacts({ plan } = {}) {
  const plans = plan
    ? MANAGEMENT_PLANS.filter((m) => m.plan.toLowerCase() === String(plan).toLowerCase())
    : MANAGEMENT_PLANS;
  const chosen = plans.length ? plans : MANAGEMENT_PLANS;

  const planLines = chosen
    .map((m) => `- ${m.plan}: ${m.rate}. Covers ${m.covers}. Leaves ${m.leaves}.`)
    .join('\n');

  let distribution = 'not enough properties under management to report a distribution yet';
  try {
    const { rows } = await pool.query(
      'SELECT plan, COUNT(*)::int AS n FROM management_requests GROUP BY plan ORDER BY n DESC'
    );
    const total = rows.reduce((s, r) => s + r.n, 0);
    if (total >= 5) {
      distribution = rows
        .map((r) => `${r.plan.replace(/_/g, ' ')} ${Math.round((r.n / total) * 100)}%`)
        .join(', ') + ` (across ${total} properties)`;
    }
  } catch (e) {
    console.error('insights distribution query failed:', e.message);
  }

  return {
    plans: chosen.map((m) => m.plan),
    factsBlock: `MANAGEMENT PLANS:\n${planLines}\n\nPLANS CHOSEN ON THE PLATFORM: ${distribution}`,
  };
}

/** Deterministic draft (no AI) built directly from the same real facts. */
function buildFallbackDraft(plans, topic, storyLabel) {
  const models = MANAGEMENT_PLANS.filter((m) => plans.includes(m.plan));
  const chosen = models.length ? models : MANAGEMENT_PLANS;
  const title = topic ? `${storyLabel}: ${topic}` : `${storyLabel} from EasyMoveZone`;
  const dek = `What EasyMoveZone Manage takes on for Nigerian property owners, and what it deliberately leaves with them.`;
  const lines = chosen.map(
    (m) => `**${m.plan}.** ${m.rate}. Covers ${m.covers}. Leaves ${m.leaves}.`
  );
  const body = `Every property we take on starts from the same question: how much of the running of it does the owner actually want to keep. Here is what each plan answers.\n\n${lines.join('\n\n')}\n\nThe rate is the starting point, not the whole answer. Where the property is, how many units it has and whether it is let today all decide what a manager has to do to earn it.\n\nThis is general guidance, not legal, tax or investment advice.`;
  return { title, dek, body };
}

/* POST /api/insights/admin/draft — AI-draft a new post from real platform data, with editor-controlled story type and prompt tweaks. */
router.post('/admin/draft', requireAdmin, async (req, res) => {
  try {
    const topic = req.body?.topic ? String(req.body.topic).slice(0, 200) : '';
    const storyTypeId = STORY_TYPES[req.body?.storyType] ? req.body.storyType : 'market-note';
    const storyType = STORY_TYPES[storyTypeId];
    const category = req.body?.category ? String(req.body.category).slice(0, 40) : storyType.category;
    const customInstructions = req.body?.customInstructions ? String(req.body.customInstructions).slice(0, 800) : '';
    const plan = req.body?.plan ? String(req.body.plan).slice(0, 30) : null;

    const { plans, factsBlock } = await buildDraftFacts({ plan });

    let draft;
    let aiPowered = false;
    if (hasAiCredentials()) {
      try {
        const system = `You are the editorial voice of EasyMoveZone Insights, writing for Nigerian property owners, landlords and buyers.
${storyType.system}
${customInstructions ? `Additional instructions from the editor, follow these closely: ${customInstructions}` : ''}
${BASE_DRAFT_RULES}`;
        const prompt = `${topic ? `Requested topic: ${topic}\n\n` : 'No specific topic given. Pick an angle from the facts below.\n\n'}${factsBlock}`;
        const completion = await createChatCompletion({
          model: resolveModel('default'),
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          temperature: 0.65,
          max_tokens: 1200,
        });
        const parsed = parseJsonResponse(completion.choices[0]?.message?.content || '');
        if (parsed.title && parsed.body) {
          draft = { title: String(parsed.title).slice(0, 255), dek: String(parsed.dek || '').slice(0, 500), body: String(parsed.body) };
          aiPowered = true;
        }
      } catch (e) {
        console.error('insights draft model error:', e.message);
      }
    }
    if (!draft) draft = buildFallbackDraft(plans, topic, storyType.label);

    const slug = `${slugify(draft.title)}-${Date.now().toString(36)}`;
    const { rows } = await pool.query(
      `INSERT INTO blog_posts (slug, title, dek, body, category, source_ref, status, ai_generated, story_type, prompt_notes)
       VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8,$9)
       RETURNING *`,
      [
        slug, draft.title, draft.dek, draft.body, category,
        JSON.stringify(plans.map((p) => ({ type: 'management-plan', plan: p }))),
        aiPowered, storyTypeId, customInstructions || null,
      ]
    );
    res.json({ post: rows[0], aiPowered });
  } catch (err) {
    console.error('POST /insights/admin/draft error:', err);
    res.status(500).json({ error: 'Could not draft a post.' });
  }
});

/* GET /api/insights/admin/story-types — the story-type menu for the admin drafting UI. */
router.get('/admin/story-types', requireAdmin, (req, res) => {
  res.json({
    storyTypes: Object.entries(STORY_TYPES).map(([id, s]) => ({ id, label: s.label, needsPlan: !!s.needsPlan })),
  });
});

/* GET /api/insights/admin — admin: list posts, optionally filtered by status. */
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const clause = status ? 'WHERE status = $1' : '';
    const vals = status ? [status] : [];
    const { rows } = await pool.query(
      `SELECT * FROM blog_posts ${clause} ORDER BY (status = 'draft') DESC, created_at DESC`,
      vals
    );
    res.json({ posts: rows });
  } catch (err) {
    console.error('GET /insights/admin error:', err);
    res.status(500).json({ error: 'Could not load posts.' });
  }
});

/* PATCH /api/insights/admin/:id — admin: edit a draft before publishing. */
router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid post id.' });
  const { title, dek, body, cover_image: coverImage, category } = req.body || {};
  try {
    const { rows } = await pool.query(
      `UPDATE blog_posts
          SET title = COALESCE($2, title),
              dek = COALESCE($3, dek),
              body = COALESCE($4, body),
              cover_image = COALESCE($5, cover_image),
              category = COALESCE($6, category)
        WHERE id = $1 AND status <> 'approved'
        RETURNING *`,
      [id, title || null, dek ?? null, body || null, coverImage || null, category || null]
    );
    if (!rows.length) return res.status(409).json({ error: 'Post not found or already published.' });
    res.json({ post: rows[0] });
  } catch (err) {
    console.error('PATCH /insights/admin/:id error:', err);
    res.status(500).json({ error: 'Could not update post.' });
  }
});

/* POST /api/insights/admin/:id/approve — admin: publish. */
router.post('/admin/:id/approve', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid post id.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM blog_posts WHERE id = $1 FOR UPDATE', [id]);
    const post = rows[0];
    if (!post) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (post.status === 'approved') {
      await client.query('ROLLBACK');
      return res.json({ success: true, post, alreadyApproved: true });
    }
    const updated = await client.query(
      `UPDATE blog_posts SET status = 'approved', reviewed_at = NOW(), published_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    await client.query('COMMIT');
    res.json({ success: true, post: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /insights/admin/:id/approve error:', err);
    res.status(500).json({ error: 'Could not publish this post.' });
  } finally {
    client.release();
  }
});

/* POST /api/insights/admin/:id/reject — admin: decline a draft. */
router.post('/admin/:id/reject', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid post id.' });
  const note = req.body?.note ? String(req.body.note).slice(0, 500) : null;
  try {
    const { rows } = await pool.query(
      `UPDATE blog_posts SET status = 'rejected', reviewed_at = NOW(), admin_note = $2
        WHERE id = $1 AND status <> 'approved'
        RETURNING id, status`,
      [id, note]
    );
    if (!rows.length) return res.status(409).json({ error: 'Post not found or already published.' });
    res.json({ success: true, status: rows[0].status });
  } catch (err) {
    console.error('POST /insights/admin/:id/reject error:', err);
    res.status(500).json({ error: 'Could not reject this post.' });
  }
});

/* DELETE /api/insights/admin/:id — admin: permanently remove a post. */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid post id.' });
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /insights/admin/:id error:', err);
    res.status(500).json({ error: 'Could not delete this post.' });
  }
});

/* GET /api/insights — public: published posts. */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, dek, cover_image, category, published_at
         FROM blog_posts WHERE status = 'approved' ORDER BY published_at DESC`
    );
    res.json({ posts: rows });
  } catch (err) {
    console.error('GET /insights error:', err);
    res.status(500).json({ error: 'Could not load insights.' });
  }
});

/* GET /api/insights/:slug — public: one published post. */
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, title, dek, body, cover_image, category, published_at
         FROM blog_posts WHERE slug = $1 AND status = 'approved'`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found.' });
    res.json({ post: rows[0] });
  } catch (err) {
    console.error('GET /insights/:slug error:', err);
    res.status(500).json({ error: 'Could not load this post.' });
  }
});

module.exports = router;
