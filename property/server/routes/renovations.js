const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const {
  SERVICES, SIZE_BANDS, SERVICE_IDS, getService, estimateCost, defaultMilestones,
} = require('../renovationCatalog');

/**
 * EasyMoveZone Upgrade — home renovation / upgrade layer.
 *
 * Flow: homeowner submits an upgrade request with photos/video → in-house team
 * reviews and books a local inspection → issues a firm quote →
 * homeowner accepts and pays by deposit + progress milestones (escrow-style).
 *
 * Admin actions require the `x-admin-key` header (or `?key=`), matching the same
 * ADMIN_KEY convention used across the platform.
 */
const { requireAdmin, isAdmin, sessionEmail } = require('../auth');
const { DEFAULT_CURRENCY, DEFAULT_MARKET, knownMarket } = require('../markets');

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('Stripe not configured (renovations)');
}


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSPECTION_WINDOWS = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–7pm)'];

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) => (typeof m === 'string' ? { url: m, kind: 'image' } : m))
    .filter((m) => m && typeof m.url === 'string' && /^https?:\/\//.test(m.url))
    .map((m) => ({ url: m.url, kind: m.kind === 'video' ? 'video' : 'image' }))
    .slice(0, 30);
}

/* GET /api/renovations/services — public service catalog + size bands. */
router.get('/services', (req, res) => {
  res.json({
    services: SERVICES.map(({ id, name, blurb }) => ({ id, name, blurb })),
    sizeBands: SIZE_BANDS,
    inspectionWindows: INSPECTION_WINDOWS,
  });
});

/* POST /api/renovations/estimate — instant indicative range (no DB write). */
router.post('/estimate', (req, res) => {
  const { service, sizeBand, conditionSignal } = req.body || {};
  if (!SERVICE_IDS.includes(service)) {
    return res.status(400).json({ error: 'Unknown service.' });
  }
  res.json({ estimate: estimateCost(service, sizeBand, Number(conditionSignal) || 0) });
});

/* POST /api/renovations — homeowner submits an upgrade request. */
router.post('/', async (req, res) => {
  const b = req.body || {};
  const service = SERVICE_IDS.includes(b.service) ? b.service : null;
  const contactName = String(b.contactName || b.name || '').trim();
  const contactEmail = String(b.contactEmail || b.email || '').trim().toLowerCase();
  const country = String(b.country || '').trim();
  const currency = String(b.currency || DEFAULT_CURRENCY).trim().toUpperCase();
  const state = String(b.state || '').trim();

  if (!service) return res.status(400).json({ error: 'Please choose an upgrade service.' });
  if (!contactName || !contactEmail) return res.status(400).json({ error: 'Name and email are required.' });
  if (!EMAIL_RE.test(contactEmail)) return res.status(400).json({ error: 'Please provide a valid email address.' });
  if (!country || !state) return res.status(400).json({ error: 'Please provide the property country and region.' });
  if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ error: 'Please choose a valid quote currency.' });

  const svc = getService(service);
  const title = String(b.title || `${svc.name} — ${state}`).trim().slice(0, 255);
  const media = normalizeMedia(b.media);
  // The cost table is priced for the default market (Nigeria, in naira).
  const estimate = knownMarket(country)?.code === DEFAULT_MARKET && currency === DEFAULT_CURRENCY
    ? estimateCost(service, b.sizeBand, Number(b.conditionSignal) || 0)
    : null;
  const ref = `BV-R-${Date.now().toString(36).toUpperCase()}`;

  // If a date/window was chosen up front, the inspection starts as 'requested'.
  const wantsInspection = Boolean(b.inspectionDate);
  const inspectionWindow = INSPECTION_WINDOWS.includes(b.inspectionWindow) ? b.inspectionWindow : null;

  try {
    const result = await pool.query(
      `INSERT INTO renovation_requests
        (ref, service, title, description, property_type, size_band, budget_band,
         country, state, city, area, address, contact_name, contact_email, contact_phone,
         media, estimate, ai_assessment, inspection_date, inspection_window, inspection_status, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'new')
       RETURNING id, ref, status, created_at`,
      [
        ref, service, title,
        b.description ? String(b.description).slice(0, 4000) : null,
        b.propertyType ? String(b.propertyType).slice(0, 60) : null,
        b.sizeBand ? String(b.sizeBand).slice(0, 60) : null,
        b.budgetBand ? String(b.budgetBand).slice(0, 60) : null,
        country.slice(0, 120),
        state.slice(0, 80),
        b.city ? String(b.city).slice(0, 120) : null,
        b.area ? String(b.area).slice(0, 255) : null,
        b.address ? String(b.address).slice(0, 500) : null,
        contactName.slice(0, 255), contactEmail, b.phone ? String(b.phone).slice(0, 100) : null,
        JSON.stringify(media), JSON.stringify(estimate),
        b.aiAssessment ? JSON.stringify(b.aiAssessment) : null,
        wantsInspection ? b.inspectionDate : null,
        inspectionWindow,
        wantsInspection ? 'requested' : 'unscheduled',
        currency,
      ]
    );
    const row = result.rows[0];
    await pool.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_admin)
       VALUES ($1, 'admin', $2, true)`,
      [row.id, `Thanks ${contactName.split(' ')[0]}! We've received your ${svc.name} request (${ref}). ` +
        `${wantsInspection ? 'We\'ll confirm your inspection slot shortly.' : 'Our team will reach out to book an inspection.'} ` +
        `You can message us here anytime.`]
    );
    res.json({ success: true, id: row.id, ref: row.ref, status: row.status, estimate });
  } catch (err) {
    console.error('POST /renovations error:', err);
    res.status(500).json({ error: 'Could not submit your request. Please try again.' });
  }
});

/* GET /api/renovations/mine?email= — a homeowner's own requests. */
router.get('/mine', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const result = await pool.query(
      `SELECT r.id, r.ref, r.service, r.title, r.country, r.state, r.city, r.area, r.status,
              r.inspection_status, r.inspection_date, r.inspection_window, r.inspector_name,
              r.quote_amount, r.currency, r.estimate, r.created_at,
              (SELECT COUNT(*) FROM renovation_messages m
                WHERE m.request_id = r.id AND m.sender = 'admin' AND m.read_by_customer = false) AS unread
         FROM renovation_requests r
        WHERE r.contact_email = $1
        ORDER BY r.created_at DESC`,
      [email]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('GET /renovations/mine error:', err);
    res.status(500).json({ error: 'Could not load your requests.' });
  }
});

async function loadRequest(id) {
  const { rows } = await pool.query('SELECT * FROM renovation_requests WHERE id = $1', [id]);
  return rows[0];
}
async function loadMilestones(id) {
  const { rows } = await pool.query(
    'SELECT id, seq, label, amount, currency, status, paid_at FROM renovation_milestones WHERE request_id = $1 ORDER BY seq ASC',
    [id]
  );
  return rows;
}

/* GET /api/renovations/:id — full detail. Admin (key) or owner (?email=). */
router.get('/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const admin = await isAdmin(req);
  const email = await sessionEmail(req);
  try {
    const reqRow = await loadRequest(id);
    if (!reqRow) return res.status(404).json({ error: 'Request not found.' });
    if (!admin && (!email || email !== reqRow.contact_email)) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const milestones = await loadMilestones(id);
    // Owners don't need internal admin notes.
    if (!admin) { delete reqRow.admin_note; delete reqRow.inspection_notes; }
    res.json({ request: reqRow, milestones });
  } catch (err) {
    console.error('GET /renovations/:id error:', err);
    res.status(500).json({ error: 'Could not load the request.' });
  }
});

/* ── Messaging (homeowner ↔ EasyMoveZone) ─────────────────────────── */

router.get('/:id/messages', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const admin = await isAdmin(req);
  const email = await sessionEmail(req);
  try {
    const reqRow = await loadRequest(id);
    if (!reqRow) return res.status(404).json({ error: 'Request not found.' });
    if (!admin && (!email || email !== reqRow.contact_email)) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const { rows } = await pool.query(
      'SELECT id, sender, body, created_at FROM renovation_messages WHERE request_id = $1 ORDER BY created_at ASC',
      [id]
    );
    if (admin) {
      await pool.query(`UPDATE renovation_messages SET read_by_admin = true WHERE request_id = $1 AND sender = 'customer'`, [id]);
    } else {
      await pool.query(`UPDATE renovation_messages SET read_by_customer = true WHERE request_id = $1 AND sender = 'admin'`, [id]);
    }
    res.json({ messages: rows });
  } catch (err) {
    console.error('GET /renovations/:id/messages error:', err);
    res.status(500).json({ error: 'Could not load messages.' });
  }
});

router.post('/:id/messages', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const admin = await isAdmin(req);
  const email = await sessionEmail(req);
  const body = String(req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Message cannot be empty.' });
  try {
    const reqRow = await loadRequest(id);
    if (!reqRow) return res.status(404).json({ error: 'Request not found.' });
    if (!admin && (!email || email !== reqRow.contact_email)) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const sender = admin ? 'admin' : 'customer';
    const { rows } = await pool.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_admin, read_by_customer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sender, body, created_at`,
      [id, sender, body.slice(0, 4000), sender === 'admin', sender === 'customer']
    );
    res.json({ success: true, message: rows[0] });
  } catch (err) {
    console.error('POST /renovations/:id/messages error:', err);
    res.status(500).json({ error: 'Could not send your message.' });
  }
});

/* POST /api/renovations/:id/accept — homeowner accepts the quote (owner-auth by email). */
router.post('/:id/accept', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const email = await sessionEmail(req);
  try {
    const reqRow = await loadRequest(id);
    if (!reqRow) return res.status(404).json({ error: 'Request not found.' });
    if (!email || email !== reqRow.contact_email) return res.status(401).json({ error: 'Unauthorized.' });
    if (reqRow.status !== 'quoted') return res.status(409).json({ error: 'This request is not awaiting acceptance.' });
    await pool.query(`UPDATE renovation_requests SET status = 'accepted', updated_at = NOW() WHERE id = $1`, [id]);
    await pool.query(`UPDATE renovation_milestones SET status = 'due' WHERE request_id = $1 AND seq = 1 AND status = 'pending'`, [id]);
    await pool.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [id, 'Quote accepted — thank you! Your deposit milestone is now due. Once it clears, we mobilise the team.']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /renovations/:id/accept error:', err);
    res.status(500).json({ error: 'Could not accept the quote.' });
  }
});

/* POST /api/renovations/:id/milestones/:mid/checkout — pay a due milestone via Stripe. */
router.post('/:id/milestones/:mid/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured yet.' });
  const id = Number.parseInt(req.params.id, 10);
  const mid = Number.parseInt(req.params.mid, 10);
  const email = await sessionEmail(req);
  if (!id || !mid) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const reqRow = await loadRequest(id);
    if (!reqRow) return res.status(404).json({ error: 'Request not found.' });
    if (!email || email !== reqRow.contact_email) return res.status(401).json({ error: 'Unauthorized.' });

    const { rows } = await pool.query(
      'SELECT * FROM renovation_milestones WHERE id = $1 AND request_id = $2',
      [mid, id]
    );
    const ms = rows[0];
    if (!ms) return res.status(404).json({ error: 'Milestone not found.' });
    if (ms.status === 'paid') return res.status(409).json({ error: 'This milestone is already paid.' });

    const currency = (ms.currency || DEFAULT_CURRENCY).toLowerCase();
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(Number(ms.amount) * 100),
          product_data: { name: `${reqRow.title} — ${ms.label}`, metadata: { ref: reqRow.ref } },
        },
      }],
      metadata: { kind: 'renovation_milestone', requestId: String(id), milestoneId: String(mid) },
      success_url: `${origin}/renovate?view=mine&paid=${reqRow.id}&ref=${encodeURIComponent(reqRow.ref)}`,
      cancel_url: `${origin}/renovate?view=mine&ref=${encodeURIComponent(reqRow.ref)}`,
    });
    await pool.query('UPDATE renovation_milestones SET stripe_session_id = $1 WHERE id = $2', [session.id, mid]);
    res.json({ url: session.url });
  } catch (err) {
    console.error('POST milestone checkout error:', err);
    res.status(500).json({ error: 'Could not start payment.' });
  }
});

/* ── Admin ─────────────────────────────────────────────────────── */

/* GET /api/renovations — admin list (optional ?status=). */
router.get('/', requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    const clause = status ? 'WHERE r.status = $1' : '';
    const vals = status ? [status] : [];
    const result = await pool.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM renovation_messages m
                WHERE m.request_id = r.id AND m.sender = 'customer' AND m.read_by_admin = false) AS unread
         FROM renovation_requests r
         ${clause}
        ORDER BY (r.status = 'new') DESC, r.created_at DESC`,
      vals
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('GET /renovations (admin) error:', err);
    res.status(500).json({ error: 'Could not load requests.' });
  }
});

/* POST /api/renovations/:id/schedule — admin books/updates the inspection. */
router.post('/:id/schedule', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const { date, window, inspector, notes } = req.body || {};
  if (!date) return res.status(400).json({ error: 'An inspection date is required.' });
  const win = INSPECTION_WINDOWS.includes(window) ? window : null;
  try {
    const { rows } = await pool.query(
      `UPDATE renovation_requests
          SET inspection_date = $2, inspection_window = $3, inspector_name = $4,
              inspection_notes = COALESCE($5, inspection_notes),
              inspection_status = 'scheduled',
              status = CASE WHEN status IN ('new','reviewing') THEN 'inspection_booked' ELSE status END,
              reviewed_at = COALESCE(reviewed_at, NOW()), updated_at = NOW()
        WHERE id = $1
        RETURNING id`,
      [id, date, win, inspector ? String(inspector).slice(0, 255) : null, notes ? String(notes).slice(0, 2000) : null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    const when = win ? `${date}, ${win}` : date;
    await pool.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [id, `Your inspection is booked for ${when}${inspector ? ` with ${inspector}` : ''}. We'll be in touch to confirm access.`]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /renovations/:id/schedule error:', err);
    res.status(500).json({ error: 'Could not schedule the inspection.' });
  }
});

/* POST /api/renovations/:id/quote — admin issues a firm quote + milestone split. */
router.post('/:id/quote', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const amount = Number(req.body?.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'A valid quote amount is required.' });
  const note = req.body?.note ? String(req.body.note).slice(0, 2000) : null;
  const breakdown = Array.isArray(req.body?.breakdown) ? req.body.breakdown.slice(0, 30) : null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqRow = await loadRequest(id);
    if (!reqRow) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Request not found.' }); }
    const currency = reqRow.currency || DEFAULT_CURRENCY;
    await client.query(
      `UPDATE renovation_requests
          SET quote_amount = $2, quote_breakdown = $3, quote_note = $4,
              currency = $5, status = 'quoted', inspection_status = 'completed', updated_at = NOW()
        WHERE id = $1`,
      [id, amount, breakdown ? JSON.stringify(breakdown) : null, note, currency]
    );
    // Rebuild the milestone plan (custom split if provided, else default 40/40/20).
    await client.query('DELETE FROM renovation_milestones WHERE request_id = $1', [id]);
    const milestones = Array.isArray(req.body?.milestones) && req.body.milestones.length
      ? req.body.milestones.slice(0, 8).map((m, i) => ({
          seq: i + 1,
          label: String(m.label || `Milestone ${i + 1}`).slice(0, 120),
          amount: Math.max(0, Number(m.amount) || 0),
          currency,
        }))
      : defaultMilestones(amount, currency);
    for (const m of milestones) {
      await client.query(
        `INSERT INTO renovation_milestones (request_id, seq, label, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [id, m.seq, m.label, m.amount, m.currency]
      );
    }
    await client.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [id, `Your quote is ready: ${currency} ${Number(amount).toLocaleString()}.${note ? ` ${note}` : ''} ` +
        `Review the milestone plan and accept to get started.`]
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /renovations/:id/quote error:', err);
    res.status(500).json({ error: 'Could not save the quote.' });
  } finally {
    client.release();
  }
});

/* POST /api/renovations/:id/status — admin updates lifecycle status / marks milestone paid manually. */
router.post('/:id/status', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const VALID = ['new','reviewing','inspection_booked','inspected','quoted','accepted','in_progress','completed','cancelled'];
  const status = VALID.includes(req.body?.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const { rows } = await pool.query(
      `UPDATE renovation_requests SET status = $2, admin_note = COALESCE($3, admin_note), updated_at = NOW()
        WHERE id = $1 RETURNING id`,
      [id, status, req.body?.note ? String(req.body.note).slice(0, 2000) : null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('POST /renovations/:id/status error:', err);
    res.status(500).json({ error: 'Could not update status.' });
  }
});

/* POST /api/renovations/:id/milestones/:mid/mark-paid — admin records an off-platform payment. */
router.post('/:id/milestones/:mid/mark-paid', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const mid = Number.parseInt(req.params.mid, 10);
  if (!id || !mid) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { rows } = await pool.query(
      `UPDATE renovation_milestones SET status = 'paid', paid_at = NOW()
        WHERE id = $1 AND request_id = $2 RETURNING id`,
      [mid, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Milestone not found.' });
    await advanceAfterPayment(id);
    res.json({ success: true });
  } catch (err) {
    console.error('POST mark-paid error:', err);
    res.status(500).json({ error: 'Could not update milestone.' });
  }
});

/* DELETE /api/renovations/:id — admin removes a request. */
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  try {
    const { rows } = await pool.query('DELETE FROM renovation_requests WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /renovations/:id error:', err);
    res.status(500).json({ error: 'Could not delete the request.' });
  }
});

/**
 * After a milestone is paid: mark the next pending milestone 'due', move the
 * project into 'in_progress' on first payment, and 'completed' when all are paid.
 * Exported so the Stripe webhook can call it too.
 */
async function advanceAfterPayment(requestId) {
  const { rows: all } = await pool.query(
    'SELECT id, seq, status FROM renovation_milestones WHERE request_id = $1 ORDER BY seq ASC',
    [requestId]
  );
  if (!all.length) return;
  const allPaid = all.every((m) => m.status === 'paid');
  const anyPaid = all.some((m) => m.status === 'paid');
  const nextPending = all.find((m) => m.status === 'pending');
  if (nextPending && !allPaid) {
    await pool.query(`UPDATE renovation_milestones SET status = 'due' WHERE id = $1 AND status = 'pending'`, [nextPending.id]);
  }
  const newStatus = allPaid ? 'completed' : anyPaid ? 'in_progress' : null;
  if (newStatus) {
    await pool.query(`UPDATE renovation_requests SET status = $2, updated_at = NOW() WHERE id = $1`, [requestId, newStatus]);
  }
}

/** Called from the Stripe webhook when a renovation-milestone checkout completes. */
async function markMilestonePaidBySession(session) {
  const meta = session.metadata || {};
  if (meta.kind !== 'renovation_milestone') return false;
  const milestoneId = Number.parseInt(meta.milestoneId, 10);
  const requestId = Number.parseInt(meta.requestId, 10);
  if (!milestoneId || !requestId) return false;
  const { rows } = await pool.query(
    `UPDATE renovation_milestones SET status = 'paid', paid_at = NOW()
      WHERE id = $1 AND request_id = $2 AND status <> 'paid' RETURNING id`,
    [milestoneId, requestId]
  );
  if (rows.length) {
    await advanceAfterPayment(requestId);
    await pool.query(
      `INSERT INTO renovation_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [requestId, 'Payment received — thank you! Your project has moved to the next stage.']
    );
  }
  return true;
}

module.exports = router;
module.exports.markMilestonePaidBySession = markMilestonePaidBySession;
