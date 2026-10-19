const express = require('express');
const router = express.Router();
const { pool, getOrCreateUser } = require('../db');

/* GET /api/profile?sessionId=xxx */
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    const user = await getOrCreateUser(sessionId);

    const profileRes = await pool.query('SELECT * FROM property_profiles WHERE user_id = $1', [user.id]);

    res.json({
      profile: profileRes.rows[0] || null,
      memberSince: user.created_at,
    });
  } catch (err) {
    console.error('GET /profile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

/* POST /api/profile — upsert profile */
router.post('/', async (req, res) => {
  try {
    const { sessionId, ...fields } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    const user = await getOrCreateUser(sessionId);

    const allowed = ['display_name', 'tagline', 'bio', 'location', 'avatar_color'];
    const updates = {};
    for (const k of allowed) {
      if (fields[k] !== undefined) updates[k] = fields[k];
    }

    const cols = Object.keys(updates);
    if (cols.length === 0) return res.json({ ok: true });

    const setClauses = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
    const vals = [user.id, ...Object.values(updates)];

    await pool.query(
      `INSERT INTO property_profiles (user_id, ${cols.join(', ')}, updated_at)
       VALUES ($1, ${cols.map((_, i) => `$${i + 2}`).join(', ')}, NOW())
       ON CONFLICT (user_id) DO UPDATE SET ${setClauses}, updated_at = NOW()`,
      vals
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /profile error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;
