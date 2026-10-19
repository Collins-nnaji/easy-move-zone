/**
 * The stored result of the plan matcher: one profile per owner, keyed by
 * email. src/config/landlord.js scores the answers client-side and posts
 * both the raw answers and the plan they map to; this validates and stores
 * them so a returning owner sees their match instead of a blank form.
 */
const express = require('express');
const router = express.Router();
const { sessionEmail } = require('../auth');
const { pool } = require('../db');

/** Keep in sync with MANAGEMENT_PLANS in src/config/management.js. */
const PLANS = ['tenant_find', 'rent_collect', 'full_management', 'portfolio'];

function normalizeEmail(value) {
  return typeof value === 'string' && value.includes('@') ? value.trim().toLowerCase() : null;
}

function shapeProfile(row) {
  if (!row) return null;
  return {
    email: row.email,
    score: row.score,
    plan: row.plan,
    planLabel: row.plan_label,
    location: row.location,
    units: row.units,
    answers: row.answers || {},
    updatedAt: row.updated_at,
  };
}

/* GET /api/landlord/profile?email=... */
router.get('/profile', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const { rows } = await pool.query('SELECT * FROM landlord_profiles WHERE email = $1', [email]);
    res.json({ profile: shapeProfile(rows[0]) });
  } catch (err) {
    console.error('GET /landlord/profile error:', err.message);
    res.status(500).json({ error: 'Could not load your match.' });
  }
});

/* POST /api/landlord/profile — upsert. Body: { email, score, plan, planLabel, location, units, answers } */
router.post('/profile', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });

  const plan = String(req.body?.plan || '').trim();
  if (!PLANS.includes(plan)) {
    return res.status(400).json({ error: `plan must be one of: ${PLANS.join(', ')}` });
  }
  const score = Math.max(0, Math.min(100, Math.round(Number(req.body?.score) || 0)));
  const answers = req.body?.answers && typeof req.body.answers === 'object' && !Array.isArray(req.body.answers)
    ? req.body.answers
    : {};

  try {
    const { rows } = await pool.query(
      `INSERT INTO landlord_profiles (email, score, plan, plan_label, location, units, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO UPDATE SET
         score = EXCLUDED.score, plan = EXCLUDED.plan, plan_label = EXCLUDED.plan_label,
         location = EXCLUDED.location, units = EXCLUDED.units, answers = EXCLUDED.answers,
         updated_at = NOW()
       RETURNING *`,
      [
        email,
        score,
        plan,
        String(req.body?.planLabel || plan).slice(0, 40),
        String(req.body?.location || '').slice(0, 20) || null,
        String(req.body?.units || '').slice(0, 20) || null,
        JSON.stringify(answers),
      ]
    );
    res.json({ profile: shapeProfile(rows[0]) });
  } catch (err) {
    console.error('POST /landlord/profile error:', err.message);
    res.status(500).json({ error: 'Could not save your match.' });
  }
});

module.exports = router;
