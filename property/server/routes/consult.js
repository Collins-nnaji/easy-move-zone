/**
 * Consultations: an owner asking a property manager to look at their
 * property, booked against one of the tiers in src/config/management.js
 * (CONSULT_TIERS). Rows live in `consultations`, which the admin console
 * works as a pipeline.
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const SERVICES = ['discovery', 'visit', 'portfolio_review'];
const WINDOWS = ['morning', 'afternoon', 'evening'];
const STATUSES = ['requested', 'scheduled', 'completed', 'cancelled'];
const { requireAdmin, sessionEmail } = require('../auth');

function normalizeEmail(value) {
  return typeof value === 'string' && value.includes('@') ? value.trim().toLowerCase() : null;
}

function makeRef() {
  return `MGT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function shapeBooking(row) {
  return {
    id: row.id,
    ref: row.ref,
    service: row.service,
    name: row.name,
    email: row.email,
    phone: row.phone,
    portfolioBand: row.portfolio_band,
    goals: row.goals,
    preferredDate: row.preferred_date,
    preferredWindow: row.preferred_window,
    status: row.status,
    managerName: row.manager_name,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* POST /api/consult/bookings — request a consultation. */
router.post('/bookings', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const name = String(req.body?.name || '').trim().slice(0, 255);
  if (!email) return res.status(400).json({ error: 'A valid email is required.' });
  if (!name) return res.status(400).json({ error: 'Your name is required.' });

  const service = SERVICES.includes(req.body?.service) ? req.body.service : 'discovery';
  const preferredWindow = WINDOWS.includes(req.body?.preferredWindow) ? req.body.preferredWindow : null;

  // Accept an ISO date only; anything else is stored as "no preference".
  const rawDate = String(req.body?.preferredDate || '').trim();
  const preferredDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO consultations (ref, service, name, email, phone, portfolio_band, goals, preferred_date, preferred_window)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        makeRef(),
        service,
        name,
        email,
        String(req.body?.phone || '').trim().slice(0, 100) || null,
        String(req.body?.portfolioBand || '').trim().slice(0, 60) || null,
        String(req.body?.goals || '').trim().slice(0, 2000) || null,
        preferredDate,
        preferredWindow,
      ]
    );
    res.status(201).json({ booking: shapeBooking(rows[0]) });
  } catch (err) {
    console.error('POST /consult/bookings error:', err.message);
    res.status(500).json({ error: 'Could not submit your request.' });
  }
});

/* GET /api/consult/bookings?email=... — an owner's own requests. */
router.get('/bookings', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM consultations WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json({ bookings: rows.map(shapeBooking) });
  } catch (err) {
    console.error('GET /consult/bookings error:', err.message);
    res.status(500).json({ error: 'Could not load your consultations.' });
  }
});

/* ── Admin ── */


/* GET /api/consult/admin/bookings — the consultation pipeline. */
router.get('/admin/bookings', requireAdmin, async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  try {
    const { rows } = await pool.query(
      status
        ? 'SELECT * FROM consultations WHERE status = $1 ORDER BY created_at DESC LIMIT 200'
        : 'SELECT * FROM consultations ORDER BY created_at DESC LIMIT 200',
      status ? [status] : []
    );
    res.json({ bookings: rows.map(shapeBooking) });
  } catch (err) {
    console.error('GET /consult/admin/bookings error:', err.message);
    res.status(500).json({ error: 'Could not load consultations.' });
  }
});

/* PATCH /api/consult/admin/bookings/:id — move one through the pipeline. */
router.patch('/admin/bookings/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid consultation id.' });
  if (req.body?.status && !STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE consultations
         SET status = COALESCE($1, status),
             manager_name = COALESCE($2, manager_name),
             admin_note = COALESCE($3, admin_note),
             updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [
        req.body?.status || null,
        req.body?.managerName ? String(req.body.managerName).slice(0, 255) : null,
        req.body?.adminNote ? String(req.body.adminNote).slice(0, 2000) : null,
        id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Consultation not found.' });
    res.json({ booking: shapeBooking(rows[0]) });
  } catch (err) {
    console.error('PATCH /consult/admin/bookings error:', err.message);
    res.status(500).json({ error: 'Could not update that consultation.' });
  }
});

module.exports = router;
