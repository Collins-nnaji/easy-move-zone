const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { PUBLIC_AGENCY_COLUMNS, clean } = require('../services/agent');

const PUBLIC_LISTING = `
  id, ref, slug, title,
  CASE WHEN listing_type = 'rent' THEN NULL ELSE address END AS address,
  area, city, state, country, property_type,
  beds, baths, size_label, features, description, media, currency,
  COALESCE(list_price, guide_price) AS price,
  listing_type, rent_frequency, lat, lng, featured, published_at
`;

/* GET /api/agents — Find an Agent directory. */
router.get('/', async (req, res) => {
  const q = clean(req.query.q);
  const city = clean(req.query.city, 120);
  const state = clean(req.query.state, 80);
  const params = [];
  const where = [`verification_status = 'verified'`];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('$?', `$${params.length}`)); };
  if (city) add('lower(city) = lower($?)', city);
  if (state) add('lower(state) = lower($?)', state);
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(lower(name) LIKE $${params.length} OR lower(city) LIKE $${params.length} OR lower(area) LIKE $${params.length})`);
  }
  const take = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 60);
  const skip = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_AGENCY_COLUMNS},
              (SELECT COUNT(*)::int FROM listings l WHERE l.agency_id = agencies.id AND l.status = 'live') AS live_count
         FROM agencies
        WHERE ${where.join(' AND ')}
        ORDER BY live_count DESC, name ASC
        LIMIT ${take} OFFSET ${skip}`,
      params
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM agencies WHERE ${where.join(' AND ')}`,
      params
    );
    const { rows: cities } = await pool.query(
      `SELECT DISTINCT city FROM agencies
        WHERE verification_status = 'verified' AND city IS NOT NULL
        ORDER BY city`
    );
    return res.json({
      agencies: rows,
      total: countRows[0]?.total || 0,
      cities: cities.map((c) => c.city),
      limit: take,
      offset: skip,
    });
  } catch (err) {
    console.error('GET /agents error:', err);
    return res.status(500).json({ error: 'Could not load agencies.' });
  }
});

/* GET /api/agents/:slug */
router.get('/:slug', async (req, res) => {
  const slug = clean(req.params.slug, 255);
  if (!slug) return res.status(404).json({ error: 'Agency not found.' });
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_AGENCY_COLUMNS} FROM agencies
        WHERE slug = $1 AND verification_status = 'verified' LIMIT 1`,
      [slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'That agency is not listed.' });
    const agency = rows[0];
    const { rows: listings } = await pool.query(
      `SELECT ${PUBLIC_LISTING} FROM listings
        WHERE agency_id = $1 AND status = 'live'
        ORDER BY featured DESC, published_at DESC NULLS LAST
        LIMIT 60`,
      [agency.id]
    );
    const { rows: branches } = await pool.query(
      `SELECT id, name, address, city, state, country, phone, lat, lng
         FROM agency_branches WHERE agency_id = $1 ORDER BY id`,
      [agency.id]
    );
    return res.json({ agency, listings, branches });
  } catch (err) {
    console.error('GET /agents/:slug error:', err);
    return res.status(500).json({ error: 'Could not load that agency.' });
  }
});

module.exports = router;
