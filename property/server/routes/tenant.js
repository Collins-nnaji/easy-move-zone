const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');
const { requireAdmin, requireUser, sessionEmail } = require('../auth');
const { notify, notifyStaff, later, APP_URL } = require('../services/notify');
const { creditCharge, money } = require('../services/rent');
const { canPayOnline, currencyCode, DEFAULT_CURRENCY } = require('../markets');
const { isConfigured: storageConfigured, createReadSas } = require('../services/blobStorage');

/**
 * EasyMoveZone for tenants.
 *
 * A tenant is whoever's email is on a management_tenancies row; an applicant
 * is whoever's email is on a rental_applications row. Every tenant route uses
 * the email of the signed-in session (server/auth.js), never one the browser
 * sends; staff routes use requireAdmin.
 *
 * What a tenant sees is deliberately narrower than what the owner sees: their
 * own tenancy, their own rent schedule, the documents the desk has shared with
 * them, and the requests they raised. Never the owner's identity, payouts,
 * fees or other units. What a tenant raises lands in Admin → Tenants; the
 * owner sees repairs and notices (never the tenant's contact details) in
 * their Maintenance tab.
 */

const CATEGORIES = ['repair', 'payment', 'question', 'notice'];
const URGENCIES = ['low', 'normal', 'urgent'];
const STATUSES = ['new', 'in_progress', 'scheduled', 'resolved', 'closed'];
/** A tenancy a tenant can still act on. Ended ones stay readable. */
const LIVE_TENANCY = ['active', 'notice'];


function str(value, max) {
  const s = String(value == null ? '' : value).trim();
  return s ? s.slice(0, max) : null;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function isoDate(value) {
  const s = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) => (typeof m === 'string' ? { url: m } : m))
    .filter((m) => m && typeof m.url === 'string' && /^https?:\/\//.test(m.url))
    .map((m) => ({ url: m.url.slice(0, 1000), name: str(m.name, 200), kind: m.kind === 'video' ? 'video' : 'image' }))
    .slice(0, 8);
}

/** The tenancies on this email, with the property they are in. */
async function tenanciesFor(email) {
  const { rows } = await pool.query(
    `SELECT t.id, t.request_id, t.unit_label, t.tenant_name, t.rent_amount, t.rent_frequency,
            t.deposit, t.currency, t.start_date, t.end_date, t.status, t.created_at,
            r.title AS property_title, r.address, r.area, r.city, r.state, r.property_type,
            r.bedrooms, r.manager_name
       FROM management_tenancies t
       JOIN management_requests r ON r.id = t.request_id
      WHERE LOWER(t.tenant_email) = $1 AND t.status <> 'void'
      ORDER BY (t.status IN ('active','notice')) DESC, t.start_date DESC NULLS LAST, t.id DESC`,
    [email]
  );
  return rows;
}

/* GET /api/tenant/roles?email= — which portals this person has something in. */
router.get('/roles', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const [owner, tenant, applicant] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM management_requests WHERE contact_email = $1', [email]),
      pool.query(`SELECT COUNT(*)::int AS n FROM management_tenancies WHERE LOWER(tenant_email) = $1 AND status <> 'void'`, [email]),
      pool.query('SELECT COUNT(*)::int AS n FROM rental_applications WHERE LOWER(email) = $1', [email]),
    ]);
    return res.json({ owner: owner.rows[0].n, tenant: tenant.rows[0].n, applicant: applicant.rows[0].n });
  } catch (err) {
    console.error('GET /tenant/roles error:', err);
    return res.status(500).json({ error: 'Could not check your account.' });
  }
});

/* GET /api/tenant/portal?email= — everything the tenant portal renders. */
router.get('/portal', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const tenancies = await tenanciesFor(email);
    const ids = tenancies.map((t) => t.id);
    const propertyIds = [...new Set(tenancies.map((t) => t.request_id))];

    const [charges, requests, documents, applications] = await Promise.all([
      ids.length ? pool.query(
        `SELECT id, tenancy_id, period_label, due_date, amount, amount_received, currency, status, received_on
           FROM management_rent_charges
          WHERE tenancy_id = ANY($1) AND status <> 'void'
          ORDER BY due_date DESC`,
        [ids]
      ) : { rows: [] },
      ids.length ? pool.query(
        `SELECT id, ref, tenancy_id, category, title, details, urgency, location, access_notes,
                amount, paid_on, payment_ref, media, status, response, responded_at, created_at, updated_at
           FROM tenant_requests
          WHERE tenancy_id = ANY($1)
          ORDER BY (status IN ('new','in_progress','scheduled')) DESC, created_at DESC`,
        [ids]
      ) : { rows: [] },
      // Only what the desk shared: for this tenancy, or for the whole property.
      ids.length ? pool.query(
        `SELECT id, kind, name, tenancy_id, request_id, created_at
           FROM management_documents
          WHERE share_with_tenant = true
            AND request_id = ANY($1)
            AND (tenancy_id IS NULL OR tenancy_id = ANY($2))
          ORDER BY created_at DESC`,
        [propertyIds, ids]
      ) : { rows: [] },
      pool.query(
        `SELECT a.id, a.ref, a.status, a.viewing_date, a.viewing_window, a.move_in_date, a.created_at, a.updated_at,
                l.title AS listing_title, l.slug AS listing_slug, l.id AS listing_id, l.status AS listing_status,
                l.list_price AS rent, l.rent_frequency, l.currency, l.city, l.state
           FROM rental_applications a
           JOIN listings l ON l.id = a.listing_id
          WHERE LOWER(a.email) = $1
          ORDER BY a.created_at DESC`,
        [email]
      ),
    ]);

    // Inspections on the tenant's own tenancies: when we are visiting, and the
    // move-in and move-out reports the caution deposit depends on.
    const { rows: inspections } = ids.length ? await pool.query(
      `SELECT id, tenancy_id, kind, scheduled_for, status, condition, summary, report_url, completed_at
         FROM management_inspections
        WHERE tenancy_id = ANY($1) AND status <> 'cancelled'
        ORDER BY COALESCE(scheduled_for, created_at::date) DESC`,
      [ids]
    ) : { rows: [] };

    // The conversation on each request — without the owner's notes to the desk.
    const requestIds = requests.rows.map((q) => q.id);
    const { rows: messages } = requestIds.length ? await pool.query(
      `SELECT id, request_id, sender, body, created_at FROM tenant_request_messages
        WHERE request_id = ANY($1) AND sender <> 'owner' ORDER BY created_at ASC`,
      [requestIds]
    ) : { rows: [] };
    requests.rows.forEach((q) => { q.messages = messages.filter((m) => m.request_id === q.id); });

    const today = new Date();
    const live = tenancies.filter((t) => LIVE_TENANCY.includes(t.status));
    const liveIds = new Set(live.map((t) => t.id));
    const liveCharges = charges.rows.filter((c) => liveIds.has(c.tenancy_id));
    const outstanding = (c) => Math.max(0, num(c.amount) - num(c.amount_received));
    const arrears = liveCharges
      .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) <= today)
      .reduce((s, c) => s + outstanding(c), 0);
    const nextDue = liveCharges
      .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) > today)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0] || null;
    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const paid12m = charges.rows
      .filter((c) => num(c.amount_received) > 0 && c.received_on && new Date(c.received_on) >= yearAgo)
      .reduce((s, c) => s + num(c.amount_received), 0);

    return res.json({
      tenancies,
      rentCharges: charges.rows,
      requests: requests.rows,
      documents: documents.rows,
      applications: applications.rows,
      inspections,
      summary: {
        liveTenancies: live.length,
        arrears: Math.round(arrears),
        nextDue,
        paid12m: Math.round(paid12m),
        openRequests: requests.rows.filter((r) => ['new', 'in_progress', 'scheduled'].includes(r.status)).length,
        currency: live[0]?.currency || tenancies[0]?.currency || DEFAULT_CURRENCY,
      },
    });
  } catch (err) {
    console.error('GET /tenant/portal error:', err);
    return res.status(500).json({ error: 'Could not load your tenant portal.' });
  }
});

/* POST /api/tenant/requests — a repair, a payment made, a question or notice to leave. */
router.post('/requests', async (req, res) => {
  const email = await sessionEmail(req);
  const b = req.body || {};
  const tenancyId = Number.parseInt(b.tenancyId, 10);
  const category = CATEGORIES.includes(b.category) ? b.category : null;
  const title = str(b.title, 255);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  if (!tenancyId) return res.status(400).json({ error: 'Choose the home this is about.' });
  if (!category) return res.status(400).json({ error: 'Choose what this is about.' });
  if (!title) return res.status(400).json({ error: 'Give it a short title.' });

  const amount = b.amount != null && b.amount !== '' ? num(b.amount) : null;
  if (category === 'payment' && !(amount > 0)) {
    return res.status(400).json({ error: 'Enter the amount you paid.' });
  }
  try {
    const { rows: own } = await pool.query(
      `SELECT id, request_id, status FROM management_tenancies WHERE id = $1 AND LOWER(tenant_email) = $2`,
      [tenancyId, email]
    );
    const tenancy = own[0];
    if (!tenancy) return res.status(404).json({ error: 'We could not find that tenancy on your account.' });
    if (!LIVE_TENANCY.includes(tenancy.status)) {
      return res.status(400).json({ error: 'This tenancy has ended. Contact us if you still need something.' });
    }
    const ref = `BV-T-${Date.now().toString(36).toUpperCase()}`;
    const { rows } = await pool.query(
      `INSERT INTO tenant_requests
        (ref, tenancy_id, request_id, tenant_email, category, title, details, urgency, location,
         access_notes, amount, paid_on, payment_ref, media)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        ref, tenancy.id, tenancy.request_id, email, category, title, str(b.details, 4000),
        URGENCIES.includes(b.urgency) ? b.urgency : 'normal', str(b.location, 120), str(b.accessNotes, 500),
        category === 'payment' ? amount : null,
        category === 'payment' ? isoDate(b.paidOn) : null,
        category === 'payment' ? str(b.paymentRef, 120) : null,
        JSON.stringify(normalizeMedia(b.media)),
      ]
    );
    const created = rows[0];
    later(async () => {
      const { rows: ctx } = await pool.query(
        `SELECT r.title, r.contact_email, r.contact_phone, t.unit_label
           FROM management_requests r JOIN management_tenancies t ON t.id = $2
          WHERE r.id = $1`,
        [tenancy.request_id, tenancy.id]
      );
      const p = ctx[0];
      const where = `${p?.title || 'a managed property'}${p?.unit_label ? ` (${p.unit_label})` : ''}`;
      const urgent = category === 'repair' && created.urgency === 'urgent';
      await notifyStaff({
        kind: `tenant_${category}`,
        title: `${urgent ? 'URGENT ' : ''}Tenant ${category === 'payment' ? 'payment notice' : category}: ${title}`,
        body: `${where}. ${created.ref}.${category === 'payment' ? ` Says they paid ${money(amount)}.` : ''}`,
      });
      // The owner hears about repairs and notices to leave — never payments or questions.
      if (p && (category === 'repair' || category === 'notice')) {
        await notify({
          to: { email: p.contact_email, phone: p.contact_phone },
          kind: `tenant_${category}`,
          title: category === 'notice' ? `Your tenant at ${where} plans to move out` : `Repair reported at ${where}: ${title}`,
          body: category === 'notice'
            ? 'Your manager will confirm dates and start finding the next tenant.'
            : `Your manager is handling it. Anything that costs more than your approval limit comes to you first.`,
          link: '/portal/landlord/operations/maintenance',
          sms: urgent || category === 'notice',
        });
      }
    });
    return res.json({ success: true, request: created });
  } catch (err) {
    console.error('POST /tenant/requests error:', err);
    return res.status(500).json({ error: 'Could not send your request.' });
  }
});

/* POST /api/tenant/requests/:id/close — the tenant withdraws or confirms it is done. */
router.post('/requests/:id/close', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  if (!id) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { rows } = await pool.query(
      `UPDATE tenant_requests SET status = 'closed', updated_at = NOW()
        WHERE id = $1 AND tenant_email = $2 AND status <> 'closed'
        RETURNING id, status`,
      [id, email]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    return res.json({ success: true, request: rows[0] });
  } catch (err) {
    console.error('POST /tenant/requests/:id/close error:', err);
    return res.status(500).json({ error: 'Could not update the request.' });
  }
});

/**
 * GET /api/tenant/documents/:id?email= — a link to one shared document. Files
 * in our private container come back as a 15-minute signed URL.
 */
router.get('/documents/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  if (!id) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { rows } = await pool.query(
      `SELECT d.url
         FROM management_documents d
        WHERE d.id = $1 AND d.share_with_tenant = true
          AND EXISTS (
            SELECT 1 FROM management_tenancies t
             WHERE LOWER(t.tenant_email) = $2 AND t.status <> 'void'
               AND t.request_id = d.request_id
               AND (d.tenancy_id IS NULL OR d.tenancy_id = t.id)
          )`,
      [id, email]
    );
    if (!rows.length) return res.status(404).json({ error: 'Document not found.' });
    const { url } = rows[0];
    if (storageConfigured() && /\.blob\.core\.windows\.net\/|127\.0\.0\.1:10000\//.test(url)) {
      const signed = await createReadSas(url);
      return res.json({ url: signed.url });
    }
    return res.json({ url });
  } catch (err) {
    console.error('GET /tenant/documents/:id error:', err);
    return res.status(err.status || 500).json({ error: 'Could not open the document.' });
  }
});

/* ── Admin: the tenant desk ──────────────────────────────────────── */

/* GET /api/tenant/admin/requests?status= — everything tenants raised. */
router.get('/admin/requests', requireAdmin, async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  try {
    const { rows } = await pool.query(
      `SELECT q.*, t.tenant_name, t.tenant_phone, t.unit_label, t.status AS tenancy_status,
              r.title AS property_title, r.address, r.city, r.state, r.ref AS property_ref,
              r.contact_name AS owner_name
         FROM tenant_requests q
         JOIN management_tenancies t ON t.id = q.tenancy_id
         JOIN management_requests r ON r.id = q.request_id
        ${status ? 'WHERE q.status = $1' : ''}
        ORDER BY (q.status = 'new') DESC, (q.urgency = 'urgent') DESC, q.created_at DESC
        LIMIT 300`,
      status ? [status] : []
    );
    const ids = rows.map((q) => q.id);
    const { rows: messages } = ids.length ? await pool.query(
      `SELECT id, request_id, sender, author, body, created_at FROM tenant_request_messages
        WHERE request_id = ANY($1) ORDER BY created_at ASC`,
      [ids]
    ) : { rows: [] };
    rows.forEach((q) => { q.messages = messages.filter((m) => m.request_id === q.id); });
    return res.json({ requests: rows });
  } catch (err) {
    console.error('GET /tenant/admin/requests error:', err);
    return res.status(500).json({ error: 'Could not load tenant requests.' });
  }
});

/* PATCH /api/tenant/admin/requests/:id — move it on, and/or answer the tenant. */
router.patch('/admin/requests/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const b = req.body || {};
  const status = STATUSES.includes(b.status) ? b.status : null;
  const response = b.response != null ? str(b.response, 4000) : undefined;
  if (!status && response === undefined) return res.status(400).json({ error: 'Nothing to update.' });
  try {
    const { rows } = await pool.query(
      `UPDATE tenant_requests
          SET status = COALESCE($2, status),
              response = CASE WHEN $3::boolean THEN $4 ELSE response END,
              responded_at = CASE WHEN $3::boolean THEN NOW() ELSE responded_at END,
              updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [id, status, response !== undefined, response ?? null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    const q = rows[0];
    if (response) {
      await pool.query(
        `INSERT INTO tenant_request_messages (request_id, sender, author, body) VALUES ($1, 'admin', $2, $3)`,
        [id, req.adminActor, response]
      );
    }
    if (response || status) tellTenant(q, response);
    return res.json({ success: true, request: q });
  } catch (err) {
    console.error('PATCH /tenant/admin/requests/:id error:', err);
    return res.status(500).json({ error: 'Could not update the request.' });
  }
});

/** Tell the tenant their request moved on, or that the desk replied. */
const STATUS_WORDS = {
  new: 'received', in_progress: 'being handled', scheduled: 'booked in', resolved: 'resolved', closed: 'closed',
};
function tellTenant(q, reply) {
  later(async () => {
    const { rows } = await pool.query('SELECT tenant_phone FROM management_tenancies WHERE id = $1', [q.tenancy_id]);
    await notify({
      to: { email: q.tenant_email, phone: rows[0]?.tenant_phone },
      audience: 'tenant',
      kind: 'request_update',
      title: reply ? `Reply on "${q.title}"` : `"${q.title}" is ${STATUS_WORDS[q.status] || q.status}`,
      body: reply || '',
      link: '/portal/tenant/requests',
      sms: q.status === 'scheduled',
    });
  });
}

async function postMessage(requestId, sender, author, body) {
  const text = str(body, 4000);
  if (!text) {
    const e = new Error('Write a message first.'); e.status = 400; throw e;
  }
  const { rows } = await pool.query(
    `INSERT INTO tenant_request_messages (request_id, sender, author, body)
     VALUES ($1, $2, $3, $4) RETURNING id, request_id, sender, body, created_at`,
    [requestId, sender, author, text]
  );
  await pool.query('UPDATE tenant_requests SET updated_at = NOW() WHERE id = $1', [requestId]);
  return rows[0];
}

/* POST /api/tenant/requests/:id/messages — the tenant writes on their own request. */
router.post('/requests/:id/messages', requireUser, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { rows } = await pool.query(
      `SELECT q.*, r.title AS property_title FROM tenant_requests q
         JOIN management_requests r ON r.id = q.request_id
        WHERE q.id = $1 AND q.tenant_email = $2`,
      [id, req.user.email]
    );
    const q = rows[0];
    if (!q) return res.status(404).json({ error: 'Request not found.' });
    const message = await postMessage(id, 'tenant', req.user.email, req.body?.body);
    // A tenant writing on a closed request reopens it.
    if (['resolved', 'closed'].includes(q.status)) {
      await pool.query(`UPDATE tenant_requests SET status = 'in_progress' WHERE id = $1`, [id]);
    }
    later(() => notifyStaff({ kind: 'tenant_message', title: `Tenant replied on ${q.ref}: ${q.title}`, body: message.body.slice(0, 500) }));
    return res.json({ success: true, message });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('POST /tenant/requests/:id/messages error:', err);
    return res.status(500).json({ error: 'Could not send your message.' });
  }
});

/* POST /api/tenant/admin/requests/:id/messages — the desk writes; the tenant sees it. */
router.post('/admin/requests/:id/messages', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { rows } = await pool.query('SELECT * FROM tenant_requests WHERE id = $1', [id]);
    const q = rows[0];
    if (!q) return res.status(404).json({ error: 'Request not found.' });
    const message = await postMessage(id, 'admin', req.adminActor, req.body?.body);
    await pool.query(
      'UPDATE tenant_requests SET response = $2, responded_at = NOW() WHERE id = $1',
      [id, message.body]
    );
    tellTenant(q, message.body);
    return res.json({ success: true, message });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('POST /tenant/admin/requests/:id/messages error:', err);
    return res.status(500).json({ error: 'Could not send the message.' });
  }
});

/* ── Invite links: attach a tenancy to whoever signs in with the link ── */

const INVITE_DAYS = 14;
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

/* POST /api/tenant/admin/tenancies/:id/invite — a new single-use link (revokes the old one). */
router.post('/admin/tenancies/:id/invite', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid tenancy.' });
  try {
    const { rows } = await pool.query(
      `SELECT t.*, r.title AS property_title FROM management_tenancies t
         JOIN management_requests r ON r.id = t.request_id WHERE t.id = $1`,
      [id]
    );
    const t = rows[0];
    if (!t) return res.status(404).json({ error: 'Tenancy not found.' });
    if (!LIVE_TENANCY.includes(t.status)) return res.status(400).json({ error: 'That tenancy has ended.' });
    const token = crypto.randomBytes(24).toString('hex');
    await pool.query(
      `UPDATE tenant_invites SET revoked_at = NOW() WHERE tenancy_id = $1 AND used_at IS NULL AND revoked_at IS NULL`,
      [id]
    );
    const sendTo = str(req.body?.email, 255)?.toLowerCase() || t.tenant_email || null;
    const { rows: inv } = await pool.query(
      `INSERT INTO tenant_invites (tenancy_id, token_hash, sent_to, expires_at)
       VALUES ($1, $2, $3, NOW() + ($4 || ' days')::interval) RETURNING expires_at`,
      [id, hashToken(token), sendTo, String(INVITE_DAYS)]
    );
    const base = (req.get('origin') || APP_URL).replace(/\/$/, '');
    const url = `${base}/portal/tenant/join/${token}`;
    if (sendTo && req.body?.send !== false) {
      later(() => notify({
        to: { email: sendTo, phone: t.tenant_phone },
        audience: 'tenant',
        kind: 'tenant_invite',
        title: `Your tenant portal for ${t.property_title}`,
        body: `Open your EasyMoveZone tenant portal to see your rent, report repairs and read your tenancy agreement. The link works once, for ${INVITE_DAYS} days.`,
        link: `/portal/tenant/join/${token}`,
        sms: true,
      }));
    }
    return res.json({ success: true, url, expiresAt: inv[0].expires_at, sentTo: sendTo });
  } catch (err) {
    console.error('POST /tenant/admin/tenancies/:id/invite error:', err);
    return res.status(500).json({ error: 'Could not create the invite.' });
  }
});

async function loadInvite(token) {
  if (!/^[a-f0-9]{48}$/.test(String(token || ''))) return null;
  const { rows } = await pool.query(
    `SELECT i.*, t.tenant_name, t.unit_label, t.status AS tenancy_status, t.tenant_email,
            r.title AS property_title, r.area, r.city, r.state
       FROM tenant_invites i
       JOIN management_tenancies t ON t.id = i.tenancy_id
       JOIN management_requests r ON r.id = t.request_id
      WHERE i.token_hash = $1`,
    [hashToken(token)]
  );
  return rows[0] || null;
}

function inviteState(inv) {
  if (!inv) return 'invalid';
  if (inv.used_at) return 'used';
  if (inv.revoked_at) return 'revoked';
  if (new Date(inv.expires_at) < new Date()) return 'expired';
  if (!LIVE_TENANCY.includes(inv.tenancy_status)) return 'ended';
  return 'ok';
}

/* GET /api/tenant/invites/:token — enough to show "this is your home" before signing in. */
router.get('/invites/:token', async (req, res) => {
  try {
    const inv = await loadInvite(req.params.token);
    const state = inviteState(inv);
    if (state === 'invalid') return res.status(404).json({ error: 'This invite link is not valid.' });
    return res.json({
      state,
      property: inv.property_title,
      where: [inv.area, inv.city, inv.state].filter(Boolean).join(', '),
      unit: inv.unit_label,
      firstName: String(inv.tenant_name || '').split(' ')[0] || null,
      expiresAt: inv.expires_at,
    });
  } catch (err) {
    console.error('GET /tenant/invites/:token error:', err);
    return res.status(500).json({ error: 'Could not open this invite.' });
  }
});

/* POST /api/tenant/invites/:token/accept — the signed-in user becomes the tenant on this tenancy. */
router.post('/invites/:token/accept', requireUser, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inv = await loadInvite(req.params.token);
    const state = inviteState(inv);
    if (state !== 'ok') {
      await client.query('ROLLBACK');
      return res.status(state === 'invalid' ? 404 : 410).json({ error: `This invite link is ${state === 'invalid' ? 'not valid' : state}. Ask your manager for a new one.`, state });
    }
    const used = await client.query(
      `UPDATE tenant_invites SET used_at = NOW(), used_by = $2 WHERE id = $1 AND used_at IS NULL RETURNING id`,
      [inv.id, req.user.email]
    );
    if (!used.rowCount) {
      await client.query('ROLLBACK');
      return res.status(410).json({ error: 'This invite link has already been used.', state: 'used' });
    }
    await client.query(
      'UPDATE management_tenancies SET tenant_email = $2, updated_at = NOW() WHERE id = $1',
      [inv.tenancy_id, req.user.email]
    );
    await client.query('COMMIT');
    return res.json({ success: true, tenancyId: inv.tenancy_id });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /tenant/invites/:token/accept error:', err);
    return res.status(500).json({ error: 'Could not link your tenancy.' });
  } finally {
    client.release();
  }
});

/* ── Paying rent online (Paystack) ───────────────────────────────── */

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
/* Overridable for the server tests, which stand up a fake Paystack. */
const PAYSTACK_API = (process.env.PAYSTACK_API_BASE || 'https://api.paystack.co').replace(/\/$/, '');

async function paystack(path, body) {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${PAYSTACK_SECRET}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    const e = new Error(data.message || 'The payment provider did not respond.'); e.status = 502; throw e;
  }
  return data.data;
}

/**
 * Credit a Paystack transaction exactly once. Called from the browser's
 * return (verify) and from the webhook — whichever lands first wins; the row
 * lock and `credited` flag make the other a no-op.
 */
async function settlePayment(reference, tx) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM rent_payments WHERE reference = $1 FOR UPDATE', [reference]);
    const pay = rows[0];
    if (!pay) {
      await client.query('ROLLBACK');
      return { state: 'unknown' };
    }
    if (pay.credited) {
      await client.query('COMMIT');
      return { state: 'success', payment: pay };
    }
    const paidKobo = Number(tx?.amount) || 0;
    const ok = tx?.status === 'success'
      && currencyCode(tx.currency) === currencyCode(pay.currency)
      && paidKobo >= Math.round(Number(pay.amount) * 100);
    if (!ok) {
      const next = ['failed', 'abandoned'].includes(tx?.status) ? tx.status : pay.status;
      await client.query('UPDATE rent_payments SET status = $2 WHERE id = $1', [pay.id, next]);
      await client.query('COMMIT');
      return { state: next, payment: { ...pay, status: next } };
    }
    await creditCharge({ chargeId: pay.charge_id, amount: paidKobo / 100, receivedOn: (tx.paid_at || '').slice(0, 10) || null, source: 'paystack' }, client);
    const { rows: done } = await client.query(
      `UPDATE rent_payments SET status = 'success', credited = true, paid_at = COALESCE($2::timestamptz, NOW())
        WHERE id = $1 RETURNING *`,
      [pay.id, tx.paid_at || null]
    );
    await client.query('COMMIT');
    return { state: 'success', payment: done[0] };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* GET /api/tenant/pay/config — whether the Pay now button shows. */
router.get('/pay/config', (req, res) => res.json({ enabled: Boolean(PAYSTACK_SECRET), provider: 'paystack' }));

/* POST /api/tenant/pay — start paying one charge's outstanding balance. */
router.post('/pay', requireUser, async (req, res) => {
  if (!PAYSTACK_SECRET) return res.status(503).json({ error: 'Online payment is not switched on yet. Pay by transfer and tell us.' });
  const chargeId = Number.parseInt(req.body?.chargeId, 10);
  if (!chargeId) return res.status(400).json({ error: 'Choose what to pay.' });
  try {
    const { rows } = await pool.query(
      `SELECT c.*, t.tenant_email, r.title AS property_title
         FROM management_rent_charges c
         JOIN management_tenancies t ON t.id = c.tenancy_id
         JOIN management_requests r ON r.id = c.request_id
        WHERE c.id = $1 AND LOWER(t.tenant_email) = $2 AND t.status <> 'void'`,
      [chargeId, req.user.email]
    );
    const c = rows[0];
    if (!c) return res.status(404).json({ error: 'We could not find that charge on your tenancy.' });
    const owing = Math.max(0, num(c.amount) - num(c.amount_received));
    if (!(owing > 0)) return res.status(409).json({ error: 'That charge is already paid.' });
    const currency = currencyCode(c.currency);
    if (!canPayOnline(currency)) return res.status(400).json({ error: 'This charge cannot be paid online yet. Pay by transfer and tell us.' });
    const reference = `EMZRENT-${c.id}-${crypto.randomBytes(6).toString('hex')}`;
    await pool.query(
      `INSERT INTO rent_payments (reference, charge_id, tenancy_id, payer_email, amount, currency)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [reference, c.id, c.tenancy_id, req.user.email, owing, currency]
    );
    const base = (req.get('origin') || APP_URL).replace(/\/$/, '');
    const tx = await paystack('/transaction/initialize', {
      email: req.user.email,
      amount: Math.round(owing * 100), // kobo (or the currency's minor unit)
      currency,
      reference,
      callback_url: `${base}/portal/tenant/rent?paid=${encodeURIComponent(reference)}`,
      metadata: { charge_id: c.id, tenancy_id: c.tenancy_id, period: c.period_label, property: c.property_title },
    });
    return res.json({ url: tx.authorization_url, reference });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('POST /tenant/pay error:', err);
    return res.status(500).json({ error: 'Could not start the payment.' });
  }
});

/* GET /api/tenant/pay/verify?reference= — after Paystack sends the tenant back. */
router.get('/pay/verify', requireUser, async (req, res) => {
  const reference = String(req.query.reference || '');
  if (!/^EMZRENT-\d+-[a-f0-9]{12}$/.test(reference)) return res.status(400).json({ error: 'Unknown payment.' });
  try {
    const { rows } = await pool.query('SELECT payer_email FROM rent_payments WHERE reference = $1', [reference]);
    if (!rows[0] || rows[0].payer_email !== req.user.email) return res.status(404).json({ error: 'Unknown payment.' });
    const tx = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
    const out = await settlePayment(reference, tx);
    return res.json({ state: out.state, amount: out.payment?.amount });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('GET /tenant/pay/verify error:', err);
    return res.status(500).json({ error: 'Could not confirm the payment.' });
  }
});

/* POST /api/tenant/pay/webhook — Paystack's server-to-server confirmation. */
router.post('/pay/webhook', async (req, res) => {
  if (!PAYSTACK_SECRET || !req.rawBody) return res.sendStatus(400);
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.rawBody).digest('hex');
  const got = String(req.get('x-paystack-signature') || '');
  if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
    return res.sendStatus(401);
  }
  try {
    const { event, data } = req.body || {};
    if (event === 'charge.success' && data?.reference) {
      // Re-verify with Paystack rather than trusting the payload's amount alone.
      const tx = await paystack(`/transaction/verify/${encodeURIComponent(data.reference)}`);
      await settlePayment(data.reference, tx);
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error('POST /tenant/pay/webhook error:', err);
    return res.sendStatus(500);
  }
});

module.exports = router;
