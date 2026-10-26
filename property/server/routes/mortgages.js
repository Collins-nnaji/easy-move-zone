/**
 * Mortgage broking leads. A visitor asks the desk to introduce a bank
 * mortgage or an NHF (FMBN) route. This stores the request. It does not
 * approve credit.
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAdmin } = require('../auth');
const { rateLimit } = require('../services/rateLimit');

const PRODUCTS = ['bank', 'nhf', 'unsure'];
const STATUSES = ['new', 'contacted', 'closed'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max = 255) {
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, max);
  return v || null;
}

function makeRef() {
  return `MRT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

router.post('/leads', async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  const name = clean(b.name);
  const product = PRODUCTS.includes(b.product) ? b.product : '';
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Your name and a valid email are required.' });
  }
  if (!product) return res.status(400).json({ error: 'Choose a bank mortgage, NHF, or say you are not sure.' });
  if (!b.consent) {
    return res.status(400).json({ error: 'Please agree that we may contact you about this. It is not a loan offer.' });
  }
  const price = Number(String(b.price || '').replace(/[^\d.]/g, ''));
  try {
    await rateLimit('mortgage-lead', email, 4, 24 * 60 * 60 * 1000);
    const ref = makeRef();
    const { rows } = await pool.query(
      `INSERT INTO mortgage_leads (ref, product, name, email, phone, city, price, employment, income_band, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ref, created_at`,
      [
        ref, product, name, email, clean(b.phone, 100), clean(b.city, 120),
        Number.isFinite(price) && price > 0 ? price : null,
        clean(b.employment, 40), clean(b.incomeBand, 60),
        typeof b.notes === 'string' ? b.notes.trim().slice(0, 2000) : null,
      ]
    );
    return res.json({ success: true, ref: rows[0].ref });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('POST /mortgages/leads error:', err);
    return res.status(500).json({ error: 'Could not send that request. Please try again.' });
  }
});

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, ref, product, name, email, phone, city, price, employment, income_band, notes, status, created_at
         FROM mortgage_leads
        ORDER BY created_at DESC
        LIMIT 200`
    );
    return res.json({ leads: rows });
  } catch (err) {
    console.error('GET /mortgages/admin error:', err);
    return res.status(500).json({ error: 'Could not load mortgage leads.' });
  }
});

router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = String(req.body?.status || '');
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  try {
    const { rows } = await pool.query(
      `UPDATE mortgage_leads SET status = $2 WHERE id = $1 RETURNING id, status`,
      [id, status]
    );
    if (!rows.length) return res.status(404).json({ error: 'That request was not found.' });
    return res.json({ lead: rows[0] });
  } catch (err) {
    console.error('PATCH /mortgages/admin error:', err);
    return res.status(500).json({ error: 'Could not update that request.' });
  }
});

module.exports = router;
