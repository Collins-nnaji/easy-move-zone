const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const { requireAdmin } = require('../auth');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = ['advisory_enquiry', 'client_enquiry', 'partner_enquiry', 'general'];
const STATUSES = ['new', 'replied', 'closed'];

const clip = (v, n) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);


/*
 * POST /api/leads — the contact form, new-listing alerts and other general
 * messages. `service` says what it is about (e.g. "Buying", "property_alert").
 */
router.post('/', async (req, res) => {
  const { type, name, email, company, message, service, preferred_time, phone } = req.body || {};

  if (!clip(name, 255) || !email || !type) {
    return res.status(400).json({ error: 'name, email, and type are required' });
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid lead type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (type, name, email, company, message, service, preferred_time, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at`,
      [type, clip(name, 255), String(email).trim().toLowerCase(), clip(company, 255),
        clip(message, 4000), clip(service, 100), clip(preferred_time, 100), clip(phone, 100)]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Lead submission error:', err);
    res.status(500).json({ error: 'Failed to save your request. Please try again.' });
  }
});

/* GET /api/leads/admin — the inbox: newest first, optionally one status. */
router.get('/admin', requireAdmin, async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  try {
    const { rows } = await pool.query(
      `SELECT id, type, name, email, phone, company, message, service, preferred_time, status, created_at
         FROM leads ${status ? 'WHERE status = $1' : ''}
        ORDER BY created_at DESC LIMIT 300`,
      status ? [status] : []
    );
    res.json({ leads: rows });
  } catch (err) {
    console.error('GET /leads/admin error:', err);
    res.status(500).json({ error: 'Could not load messages.' });
  }
});

/* PATCH /api/leads/admin/:id — mark a message replied or closed. */
router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { status } = req.body || {};
  if (!Number.isFinite(id) || !STATUSES.includes(status)) return res.status(400).json({ error: 'A valid status is required.' });
  try {
    const { rows } = await pool.query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING id, status', [status, id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /leads/admin error:', err);
    res.status(500).json({ error: 'Could not update.' });
  }
});

module.exports = router;
