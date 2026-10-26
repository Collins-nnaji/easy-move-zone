const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireUser } = require('../auth');

/**
 * The in-app inbox behind the bell in both portals. Always the signed-in
 * user's own notices; `audience` keeps the owner and tenant portals apart for
 * someone who is both.
 */
const AUDIENCES = ['owner', 'tenant', 'agent'];

router.use(requireUser);

/* GET /api/notifications?audience=owner|tenant */
router.get('/', async (req, res) => {
  const audience = AUDIENCES.includes(req.query.audience) ? req.query.audience : 'owner';
  try {
    const { rows } = await pool.query(
      `SELECT id, kind, title, body, link, read_at, created_at
         FROM notifications
        WHERE recipient_email = $1 AND audience = $2
        ORDER BY created_at DESC
        LIMIT 40`,
      [req.user.email, audience]
    );
    return res.json({ notifications: rows, unread: rows.filter((n) => !n.read_at).length });
  } catch (err) {
    console.error('GET /notifications error:', err);
    return res.status(500).json({ error: 'Could not load your notifications.' });
  }
});

/* POST /api/notifications/read — { audience } marks all read, { ids } just those. */
router.post('/read', async (req, res) => {
  const audience = AUDIENCES.includes(req.body?.audience) ? req.body.audience : 'owner';
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((n) => Number.parseInt(n, 10)).filter(Boolean) : null;
  try {
    await pool.query(
      `UPDATE notifications SET read_at = NOW()
        WHERE recipient_email = $1 AND audience = $2 AND read_at IS NULL
          ${ids ? 'AND id = ANY($3)' : ''}`,
      ids ? [req.user.email, audience, ids] : [req.user.email, audience]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /notifications/read error:', err);
    return res.status(500).json({ error: 'Could not update your notifications.' });
  }
});

module.exports = router;
