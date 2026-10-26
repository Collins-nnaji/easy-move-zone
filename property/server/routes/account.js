const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireUser } = require('../auth');
const { clean } = require('../services/agent');

router.use(requireUser);

const SNAPSHOT = `
  l.id, l.ref, l.slug, l.title,
  CASE WHEN l.listing_type = 'rent' THEN NULL ELSE l.address END AS address,
  l.area, l.city, l.state, l.country, l.property_type,
  l.beds, l.baths, l.size_label, l.media, l.currency,
  COALESCE(l.list_price, l.guide_price) AS price,
  l.route, l.listing_type, l.rent_frequency, l.available_from,
  l.condition_score, l.units_available, l.status
`;

router.get('/saved', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.id AS saved_id, s.created_at AS saved_at, ${SNAPSHOT}
         FROM user_saved_listings s
         JOIN listings l ON l.id = s.listing_id
        WHERE lower(s.email) = $1 AND l.status = 'live'
        ORDER BY s.created_at DESC`,
      [req.user.email]
    );
    return res.json({ listings: rows });
  } catch (err) {
    console.error('GET /account/saved error:', err);
    return res.status(500).json({ error: 'Could not load saved properties.' });
  }
});

router.post('/saved', async (req, res) => {
  const listingId = Number.parseInt(req.body?.listingId, 10);
  if (!listingId) return res.status(400).json({ error: 'Choose a property to save.' });
  try {
    const { rows: live } = await pool.query(`SELECT id FROM listings WHERE id = $1 AND status = 'live'`, [listingId]);
    if (!live.length) return res.status(404).json({ error: 'That property is not available.' });
    await pool.query(
      `INSERT INTO user_saved_listings (user_id, email, listing_id)
       VALUES ($1,$2,$3)
       ON CONFLICT (email, listing_id) DO NOTHING`,
      [req.user.id || req.user.email, req.user.email, listingId]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /account/saved error:', err);
    return res.status(500).json({ error: 'Could not save that property.' });
  }
});

router.delete('/saved/:listingId', async (req, res) => {
  const listingId = Number.parseInt(req.params.listingId, 10);
  try {
    await pool.query(
      'DELETE FROM user_saved_listings WHERE listing_id = $1 AND lower(email) = $2',
      [listingId, req.user.email]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /account/saved error:', err);
    return res.status(500).json({ error: 'Could not remove that property.' });
  }
});

router.get('/searches', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, filters, alert_enabled, last_notified_at, created_at
         FROM user_saved_searches WHERE lower(email) = $1 ORDER BY created_at DESC`,
      [req.user.email]
    );
    return res.json({ searches: rows });
  } catch (err) {
    console.error('GET /account/searches error:', err);
    return res.status(500).json({ error: 'Could not load saved searches.' });
  }
});

router.post('/searches', async (req, res) => {
  const filters = req.body?.filters && typeof req.body.filters === 'object' ? req.body.filters : {};
  const name = clean(req.body?.name) || 'Saved search';
  try {
    const { rows } = await pool.query(
      `INSERT INTO user_saved_searches (user_id, email, name, filters, alert_enabled)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id || req.user.email, req.user.email, name, JSON.stringify(filters), req.body?.alert !== false]
    );
    return res.json({ search: rows[0] });
  } catch (err) {
    console.error('POST /account/searches error:', err);
    return res.status(500).json({ error: 'Could not save that search.' });
  }
});

router.patch('/searches/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query(
      `UPDATE user_saved_searches
          SET alert_enabled = COALESCE($3, alert_enabled), name = COALESCE($4, name)
        WHERE id = $1 AND lower(email) = $2
        RETURNING *`,
      [id, req.user.email, typeof req.body?.alert === 'boolean' ? req.body.alert : null, clean(req.body?.name)]
    );
    if (!rows.length) return res.status(404).json({ error: 'Search not found.' });
    return res.json({ search: rows[0] });
  } catch (err) {
    console.error('PATCH /account/searches error:', err);
    return res.status(500).json({ error: 'Could not update that search.' });
  }
});

router.delete('/searches/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM user_saved_searches WHERE id = $1 AND lower(email) = $2', [id, req.user.email]);
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /account/searches error:', err);
    return res.status(500).json({ error: 'Could not delete that search.' });
  }
});

module.exports = router;
