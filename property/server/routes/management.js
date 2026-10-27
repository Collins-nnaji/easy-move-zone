const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const {
  PLANS, PLAN_IDS, PLAN_BY_ID, ADDONS, ADDON_IDS,
  LETTING_STATUSES, PROPERTY_TYPES, quoteFees, VAT_PERCENT,
  EXPENSE_CATEGORIES, EXPENSE_CATEGORY_IDS, PAYOUT_CYCLES, RENT_FREQUENCIES,
  annualiseRent, computePayout, effectiveFeePct,
} = require('../managementCatalog');

/**
 * EasyMoveZone Manage — letting & property management.
 *
 * Flow: owner picks a plan and signs a management authorization → we book a
 * management visit and rental valuation → we issue a proposal → on acceptance
 * the property goes live under management (tenanting, rent collection, repairs).
 *
 * Admin actions use the same `x-admin-key` convention as the rest of the API.
 */
const { requireAdmin, isAdmin, sessionEmail } = require('../auth');
const { notify, notifyStaff, later } = require('../services/notify');
const {
  creditCharge, announceCharge, generateSchedule, runRentReminders,
} = require('../services/rent');
const { createReadSas, isConfigured: storageConfigured } = require('../services/blobStorage');


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = ['new', 'reviewing', 'visit_booked', 'proposal_sent', 'onboarding', 'active', 'paused', 'ended', 'cancelled'];

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) => (typeof m === 'string' ? { url: m, kind: 'image' } : m))
    .filter((m) => m && typeof m.url === 'string' && /^https?:\/\//.test(m.url))
    .map((m) => ({ url: m.url, kind: m.kind === 'video' ? 'video' : 'image' }))
    .slice(0, 20);
}

function str(value, max) {
  const s = String(value == null ? '' : value).trim();
  return s ? s.slice(0, max) : null;
}

const {
  currencyCode, formatMoney, taxPercentFor, DEFAULT_CURRENCY,
} = require('../markets');

function moneyLabel(value, currency = DEFAULT_CURRENCY) {
  return formatMoney(value, currency);
}

/* GET /api/management/plans — public catalog: plans, add-ons, pickers. */
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS,
    addons: ADDONS,
    propertyTypes: PROPERTY_TYPES,
    lettingStatuses: LETTING_STATUSES,
    expenseCategories: EXPENSE_CATEGORIES,
    payoutCycles: PAYOUT_CYCLES,
    rentFrequencies: RENT_FREQUENCIES,
    vatPercent: VAT_PERCENT,
  });
});

/* POST /api/management/quote — indicative fee breakdown (no DB write). */
router.post('/quote', (req, res) => {
  const { plan, annualRent, units } = req.body || {};
  const currency = currencyCode(req.body?.currency);
  const addons = (Array.isArray(req.body?.addons) ? req.body.addons : []).filter((id) => (
    // Flat-fee add-ons are priced in the default market's currency.
    ADDON_IDS.includes(id) && (currency === DEFAULT_CURRENCY || !ADDONS.find((addon) => addon.id === id)?.flatAnnual)
  ));
  if (plan && !PLAN_IDS.includes(plan)) {
    return res.status(400).json({ error: 'Unknown management plan.' });
  }
  res.json({ quote: quoteFees({ plan, annualRent, units, addons, currency, vatPercent: taxPercentFor(req.body?.country) }) });
});

/* POST /api/management/requests — owner hands a property to us. */
router.post('/requests', async (req, res) => {
  const b = req.body || {};
  const plan = PLAN_IDS.includes(b.plan) ? b.plan : null;
  const contactName = str(b.contactName || b.name, 255);
  const contactEmail = String(b.contactEmail || b.email || '').trim().toLowerCase();
  const state = str(b.state, 80);
  const address = str(b.address, 500);
  const country = str(b.country, 120);
  const currency = currencyCode(b.currency);

  if (!plan) return res.status(400).json({ error: 'Please choose a management plan.' });
  if (!address) return res.status(400).json({ error: 'The property address is required.' });
  if (!state) return res.status(400).json({ error: 'Please provide the state or region where the property is located.' });
  if (!contactName || !contactEmail) return res.status(400).json({ error: 'Name and email are required.' });
  if (!EMAIL_RE.test(contactEmail)) return res.status(400).json({ error: 'Please provide a valid email address.' });
  if (!b.ownerConfirmed || !b.consent) {
    return res.status(400).json({ error: 'Please confirm ownership and sign the management authorization.' });
  }

  const svc = PLAN_BY_ID[plan];
  const units = Math.max(1, Math.min(500, Math.round(Number(b.units) || 1)));
  const addons = (Array.isArray(b.addons) ? b.addons : []).filter((a) => ADDON_IDS.includes(a));
  const pricedAddons = currency === DEFAULT_CURRENCY
    ? addons
    : addons.filter((id) => !ADDONS.find((addon) => addon.id === id)?.flatAnnual);
  const lettingStatus = LETTING_STATUSES.includes(b.lettingStatus) ? b.lettingStatus : 'unsure';
  const expectedRent = Number(b.expectedRent) > 0 ? Number(b.expectedRent) : null;
  const quote = quoteFees({ plan, annualRent: expectedRent || 0, units, addons: pricedAddons, currency, vatPercent: taxPercentFor(country) });
  const title = str(b.title, 255) || `${svc.name} — ${address}`.slice(0, 255);
  const ref = `BV-M-${Date.now().toString(36).toUpperCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO management_requests
        (ref, plan, title, description, property_type, units, bedrooms, furnished, letting_status,
         state, city, area, address, country, currency, expected_rent, addons, quote, start_date, media,
         contact_name, contact_email, contact_phone, owner_confirmed, consent, consent_name, status,
         advertise_consent, advertise_consent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,true,true,$24,'new',
               $25, CASE WHEN $25 THEN NOW() END)
       RETURNING id, ref, status, created_at`,
      [
        ref, plan, title,
        b.description ? String(b.description).slice(0, 4000) : null,
        str(b.propertyType, 60), units, str(b.bedrooms, 20), str(b.furnished, 20), lettingStatus,
        state, str(b.city, 120), str(b.area, 255), address, country, currency,
        expectedRent, JSON.stringify(pricedAddons), JSON.stringify(quote),
        b.startDate || null, JSON.stringify(normalizeMedia(b.media)),
        contactName, contactEmail, str(b.phone || b.contactPhone, 100),
        str(b.consentName || contactName, 255),
        // Advertising on the public Rent page is a separate opt-in, never implied.
        b.advertiseConsent === true,
      ]
    );
    const row = result.rows[0];
    await pool.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_admin)
       VALUES ($1, 'admin', $2, true)`,
      [row.id, `Thanks ${contactName.split(' ')[0]}! We've received your ${svc.name} instruction (${ref}). ` +
        'A property manager will call to book a management visit and rental valuation, ' +
        'then send you a proposal with the confirmed fee. You can message us here anytime.']
    );
    res.json({ success: true, id: row.id, ref: row.ref, status: row.status, quote });
  } catch (err) {
    console.error('POST /management/requests error:', err);
    res.status(500).json({ error: 'Could not submit your request. Please try again.' });
  }
});

/* GET /api/management/requests/mine?email= — an owner's own managed properties. */
router.get('/requests/mine', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const result = await pool.query(
      `SELECT r.id, r.ref, r.plan, r.title, r.address, r.state, r.city, r.country, r.units,
              r.letting_status, r.expected_rent, r.currency, r.quote, r.status,
              r.manager_name, r.agreed_fee_pct, r.start_date, r.created_at,
              (SELECT COUNT(*) FROM management_messages m
                WHERE m.request_id = r.id AND m.sender = 'admin' AND m.read_by_customer = false) AS unread
         FROM management_requests r
        WHERE r.contact_email = $1
        ORDER BY r.created_at DESC`,
      [email]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('GET /management/requests/mine error:', err);
    res.status(500).json({ error: 'Could not load your managed properties.' });
  }
});

/* GET /api/management/requests — admin queue (optional ?status=). */
router.get('/requests', requireAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    const clause = status ? 'WHERE r.status = $1' : '';
    const vals = status ? [status] : [];
    const result = await pool.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM management_messages m
                WHERE m.request_id = r.id AND m.sender = 'customer' AND m.read_by_admin = false) AS unread
         FROM management_requests r
         ${clause}
        ORDER BY (r.status = 'new') DESC, r.created_at DESC`,
      vals
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('GET /management/requests (admin) error:', err);
    res.status(500).json({ error: 'Could not load requests.' });
  }
});

async function loadRequest(id) {
  const { rows } = await pool.query('SELECT * FROM management_requests WHERE id = $1', [id]);
  return rows[0];
}

/** Owner access is by matching email; admins pass the admin key. */
async function authorize(req, res, id) {
  const row = await loadRequest(id);
  if (!row) {
    res.status(404).json({ error: 'Request not found.' });
    return null;
  }
  const admin = await isAdmin(req);
  const email = admin ? '' : await sessionEmail(req);
  if (!admin && (!email || email !== row.contact_email)) {
    res.status(401).json({ error: 'Unauthorized.' });
    return null;
  }
  return { row, admin };
}

/* GET /api/management/requests/:id — full detail. Admin (key) or owner (?email=). */
router.get('/requests/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  try {
    const ok = await authorize(req, res, id);
    if (!ok) return undefined;
    const { row, admin } = ok;
    if (!admin) {
      delete row.admin_note;
      return res.json({ request: row });
    }
    const ledger = await loadLedger([id]);
    return res.json({ request: row, ...ledger });
  } catch (err) {
    console.error('GET /management/requests/:id error:', err);
    return res.status(500).json({ error: 'Could not load the request.' });
  }
});

/* ── Messaging (owner ↔ EasyMoveZone property manager) ──────────────── */

router.get('/requests/:id/messages', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  try {
    const ok = await authorize(req, res, id);
    if (!ok) return undefined;
    const { rows } = await pool.query(
      'SELECT id, sender, body, created_at FROM management_messages WHERE request_id = $1 ORDER BY created_at ASC',
      [id]
    );
    if (ok.admin) {
      await pool.query(`UPDATE management_messages SET read_by_admin = true WHERE request_id = $1 AND sender = 'customer'`, [id]);
    } else {
      await pool.query(`UPDATE management_messages SET read_by_customer = true WHERE request_id = $1 AND sender = 'admin'`, [id]);
    }
    return res.json({ messages: rows });
  } catch (err) {
    console.error('GET /management/requests/:id/messages error:', err);
    return res.status(500).json({ error: 'Could not load messages.' });
  }
});

router.post('/requests/:id/messages', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const body = String(req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Message cannot be empty.' });
  try {
    const ok = await authorize(req, res, id);
    if (!ok) return undefined;
    const sender = ok.admin ? 'admin' : 'customer';
    const { rows } = await pool.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_admin, read_by_customer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sender, body, created_at`,
      [id, sender, body.slice(0, 4000), sender === 'admin', sender === 'customer']
    );
    const { row } = ok;
    later(() => (sender === 'admin'
      ? notify({
        to: { email: row.contact_email, phone: row.contact_phone },
        kind: 'manager_message',
        title: `New message about ${row.title}`,
        body: body.slice(0, 500),
        link: '/portal/landlord/account/support',
      })
      : notifyStaff({ kind: 'owner_message', title: `Owner message on ${row.ref}`, body: body.slice(0, 500) })));
    return res.json({ success: true, message: rows[0] });
  } catch (err) {
    console.error('POST /management/requests/:id/messages error:', err);
    return res.status(500).json({ error: 'Could not send your message.' });
  }
});

/* ── Owner portal: properties, money in, money out ───────────────── */

/** Every property this email owns (optionally narrowed to one). */
async function ownerProperties(email, propertyId) {
  if (!email) return [];
  const vals = [email];
  let clause = 'WHERE contact_email = $1';
  if (propertyId) {
    vals.push(propertyId);
    clause += ` AND id = $${vals.length}`;
  }
  const { rows } = await pool.query(
    `SELECT * FROM management_requests ${clause} ORDER BY created_at DESC`,
    vals
  );
  return rows.map((r) => { delete r.admin_note; return r; });
}

function monthKey(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** The last `months` month keys, oldest first, ending with the current month. */
function monthWindow(months) {
  const out = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }),
      year: d.getUTCFullYear(),
    });
  }
  return out;
}

const num = (v) => Number(v) || 0;

/**
 * Monthly rent-in / fees / costs / net series, plus cost categories and totals.
 *
 * Everything is attributed to the month it actually happened in: rent to the
 * month it cleared, costs to the month they were incurred, and a payout's fee
 * split back across the rent it swept — so a bar reads "the rent that came in
 * this month, and what came out of it" rather than lumping a quarter's fee into
 * whichever month the remittance happened to land.
 */
function buildFinance({ rentCharges, expenses, payouts, months = 12 }) {
  const window = monthWindow(months);
  const index = new Map(window.map((m, i) => [m.key, i]));
  const series = window.map((m) => ({
    month: m.label, key: m.key, year: m.year, rent: 0, costs: 0, fees: 0, net: 0, remitted: 0,
  }));

  // Fee rate per payout, so each rent line can carry its share of the fee.
  const payoutFeeShare = new Map();
  for (const p of payouts) {
    const gross = num(p.gross_rent);
    payoutFeeShare.set(p.id, gross > 0 ? (num(p.fee_amount) + num(p.vat_amount)) / gross : 0);
  }

  for (const c of rentCharges) {
    const i = index.get(monthKey(c.received_on));
    if (i == null) continue;
    const received = num(c.amount_received);
    series[i].rent += received;
    series[i].fees += received * (payoutFeeShare.get(c.payout_id) || 0);
  }
  for (const e of expenses) {
    if (e.status === 'rejected' || e.status === 'pending') continue;
    const i = index.get(monthKey(e.incurred_on));
    if (i != null) series[i].costs += num(e.amount);
  }
  for (const p of payouts) {
    if (p.status !== 'paid') continue;
    const i = index.get(monthKey(p.paid_on));
    if (i != null) series[i].remitted += num(p.net_amount);
  }
  for (const row of series) {
    row.rent = Math.round(row.rent);
    row.costs = Math.round(row.costs);
    row.fees = Math.round(row.fees);
    row.remitted = Math.round(row.remitted);
    // What the owner keeps out of that month's rent. Negative in a month with
    // costs but no rent — which is the honest reading, so it is left signed.
    row.net = row.rent - row.fees - row.costs;
  }

  const byCategory = [];
  const catTotals = new Map();
  for (const e of expenses) {
    if (e.status === 'rejected' || e.status === 'pending') continue;
    if (!index.has(monthKey(e.incurred_on))) continue;
    catTotals.set(e.category, (catTotals.get(e.category) || 0) + num(e.amount));
  }
  for (const [id, amount] of catTotals.entries()) {
    byCategory.push({
      id,
      label: EXPENSE_CATEGORIES.find((c) => c.id === id)?.label || id,
      amount: Math.round(amount),
    });
  }
  byCategory.sort((a, b) => b.amount - a.amount);

  const totals = series.reduce((acc, row) => ({
    rent: acc.rent + row.rent,
    costs: acc.costs + row.costs,
    fees: acc.fees + row.fees,
    net: acc.net + row.net,
    remitted: acc.remitted + row.remitted,
  }), { rent: 0, costs: 0, fees: 0, net: 0, remitted: 0 });

  return { series, byCategory, totals, months };
}

/** Loads every money row attached to a set of properties. */
async function loadLedger(ids) {
  if (!ids.length) return { tenancies: [], rentCharges: [], expenses: [], payouts: [], documents: [] };
  const [tenancies, rentCharges, expenses, payouts, documents] = await Promise.all([
    pool.query('SELECT * FROM management_tenancies WHERE request_id = ANY($1) ORDER BY start_date DESC NULLS LAST, id DESC', [ids]),
    pool.query('SELECT * FROM management_rent_charges WHERE request_id = ANY($1) ORDER BY due_date DESC', [ids]),
    pool.query('SELECT * FROM management_expenses WHERE request_id = ANY($1) ORDER BY incurred_on DESC, id DESC', [ids]),
    pool.query('SELECT * FROM management_payouts WHERE request_id = ANY($1) ORDER BY COALESCE(paid_on, scheduled_for) DESC NULLS LAST, id DESC', [ids]),
    pool.query('SELECT * FROM management_documents WHERE request_id = ANY($1) ORDER BY created_at DESC', [ids]),
  ]);
  return {
    tenancies: tenancies.rows,
    rentCharges: rentCharges.rows,
    expenses: expenses.rows,
    payouts: payouts.rows,
    documents: documents.rows,
  };
}

/**
 * EasyMoveZone runs the tenancy end to end, and owners and tenants do not deal
 * with each other: everything goes through the desk. So the owner sees who
 * lives there (first name), the unit, rent and dates — never the tenant's
 * email, phone, surname or the desk's notes.
 */
function forOwner(t) {
  const { tenant_email: _e, tenant_phone: _p, notes: _n, ...rest } = t;
  return { ...rest, tenant_name: t.tenant_name ? String(t.tenant_name).trim().split(/\s+/)[0] : null };
}

/* GET /api/management/portal?email=&propertyId= — everything the portal renders. */
router.get('/portal', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  const propertyId = Number.parseInt(req.query.propertyId, 10) || null;

  try {
    // The property switcher always lists everything; the data below can be scoped.
    const allProperties = await ownerProperties(email);
    if (!allProperties.length) {
      return res.json({ properties: [], summary: null, tenancies: [], payouts: [], expenses: [], rentCharges: [], documents: [], lettings: [], tenantRequests: [], finance: buildFinance({ rentCharges: [], expenses: [], payouts: [] }) });
    }
    const scoped = propertyId ? allProperties.filter((p) => p.id === propertyId) : allProperties;
    const ids = scoped.map((p) => p.id);
    const ledger = await loadLedger(ids);

    const today = new Date();
    const activeTenancies = ledger.tenancies.filter((t) => t.status === 'active' || t.status === 'notice');
    const contractedRent = activeTenancies.reduce((sum, t) => sum + annualiseRent(t.rent_amount, t.rent_frequency), 0);
    const totalUnits = scoped.reduce((sum, p) => sum + (Number(p.units) || 1), 0);

    const arrears = ledger.rentCharges
      .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) <= today)
      .reduce((sum, c) => sum + Math.max(0, num(c.amount) - num(c.amount_received)), 0);

    const upcomingRent = ledger.rentCharges
      .filter((c) => ['due', 'part'].includes(c.status) && new Date(c.due_date) > today)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 6);

    const nextPayout = ledger.payouts
      .filter((p) => p.status === 'scheduled' || p.status === 'processing')
      .sort((a, b) => new Date(a.scheduled_for || 0) - new Date(b.scheduled_for || 0))[0] || null;

    const paidPayouts = ledger.payouts.filter((p) => p.status === 'paid');
    const lastPayout = paidPayouts[0] || null;
    const pendingApprovals = ledger.expenses.filter((e) => e.status === 'pending');

    const finance = buildFinance({ ...ledger, months: 12 });

    const { rows: unreadRows } = await pool.query(
      `SELECT COUNT(*)::int AS unread FROM management_messages
        WHERE request_id = ANY($1) AND sender = 'admin' AND read_by_customer = false`,
      [ids]
    );

    // Rentals advertising these properties, with interest counts only — an
    // applicant's details stay with the desk until they become the tenant.
    const { rows: lettings } = await pool.query(
      `SELECT l.id, l.ref, l.slug, l.title, l.status, l.unit_label, l.list_price AS rent,
              l.rent_frequency, l.currency, l.published_at, l.let_at, l.created_at,
              l.management_request_id AS property_id,
              COUNT(a.id)::int AS applications,
              COUNT(a.id) FILTER (WHERE a.status = 'viewing_booked')::int AS viewings,
              COUNT(a.id) FILTER (WHERE a.status IN ('vetting','approved'))::int AS shortlisted,
              (SELECT COUNT(*)::int FROM listing_enquiries e WHERE e.listing_id = l.id) AS enquiries
         FROM listings l
         LEFT JOIN rental_applications a ON a.listing_id = l.id
        WHERE l.listing_type = 'rent' AND l.management_request_id = ANY($1)
          AND l.status IN ('reviewing','live','let','withdrawn')
        GROUP BY l.id
        ORDER BY l.created_at DESC`,
      [ids]
    );

    // What tenants reported that the owner should know about: repairs and
    // notices to leave. Never the tenant's contact details or payment notes.
    const { rows: tenantRequests } = await pool.query(
      `SELECT q.id, q.ref, q.category, q.title, q.urgency, q.location, q.status, q.response,
              q.created_at, q.updated_at, q.request_id AS property_id, t.unit_label
         FROM tenant_requests q
         JOIN management_tenancies t ON t.id = q.tenancy_id
        WHERE q.request_id = ANY($1) AND q.category IN ('repair','notice')
        ORDER BY (q.status IN ('new','in_progress','scheduled')) DESC, q.created_at DESC
        LIMIT 40`,
      [ids]
    );
    // The conversation on each: the tenant's words, the desk's replies and the
    // owner's own notes — without who the tenant is.
    const reportIds = tenantRequests.map((q) => q.id);
    const { rows: reportMessages } = reportIds.length ? await pool.query(
      `SELECT id, request_id, sender, body, created_at FROM tenant_request_messages
        WHERE request_id = ANY($1) ORDER BY created_at ASC`,
      [reportIds]
    ) : { rows: [] };
    tenantRequests.forEach((q) => { q.messages = reportMessages.filter((m) => m.request_id === q.id); });

    return res.json({
      properties: allProperties,
      scopedTo: propertyId,
      summary: {
        propertyCount: scoped.length,
        totalUnits,
        letUnits: activeTenancies.length,
        occupancyPct: totalUnits ? Math.round((activeTenancies.length / totalUnits) * 100) : 0,
        contractedRentAnnual: Math.round(contractedRent),
        rentCollected12m: finance.totals.rent,
        feesCharged12m: finance.totals.fees,
        costs12m: finance.totals.costs,
        paidOut12m: finance.totals.remitted,
        arrears: Math.round(arrears),
        pendingApprovalCount: pendingApprovals.length,
        pendingApprovalValue: Math.round(pendingApprovals.reduce((s, e) => s + num(e.amount), 0)),
        unreadMessages: unreadRows[0]?.unread || 0,
        openTenantRepairs: tenantRequests.filter((q) => q.category === 'repair' && ['new', 'in_progress', 'scheduled'].includes(q.status)).length,
        nextPayout,
        lastPayout,
      },
      tenancies: ledger.tenancies.map(forOwner),
      rentCharges: ledger.rentCharges.slice(0, 60),
      upcomingRent,
      expenses: ledger.expenses.slice(0, 60),
      payouts: ledger.payouts.slice(0, 24),
      documents: ledger.documents,
      lettings,
      tenantRequests,
      finance,
    });
  } catch (err) {
    console.error('GET /management/portal error:', err);
    return res.status(500).json({ error: 'Could not load your portal.' });
  }
});

/*
 * GET /api/management/portfolio?email= — the roll-up across every property an
 * owner has with us.
 *
 * The portal answers "how is this property doing"; this answers "how is the
 * whole lot doing". Per-property rows are computed here rather than in the
 * browser because the portal response truncates its ledger lists, which would
 * silently understate arrears once an owner has more than a few properties.
 */
router.get('/portfolio', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });

  try {
    const properties = await ownerProperties(email);
    if (!properties.length) {
      return res.json({
        properties: [],
        totals: null,
        finance: buildFinance({ rentCharges: [], expenses: [], payouts: [] }),
      });
    }

    const ids = properties.map((p) => p.id);
    const ledger = await loadLedger(ids);
    const today = new Date();

    /** Group a ledger list by the property it belongs to. */
    const groupBy = (rows) => {
      const map = new Map(ids.map((id) => [id, []]));
      for (const row of rows) {
        const bucket = map.get(row.request_id);
        if (bucket) bucket.push(row);
      }
      return map;
    };

    const tenanciesBy = groupBy(ledger.tenancies);
    const rentBy = groupBy(ledger.rentCharges);
    const expensesBy = groupBy(ledger.expenses);
    const payoutsBy = groupBy(ledger.payouts);

    const rows = properties.map((p) => {
      const tenancies = tenanciesBy.get(p.id) || [];
      const rentCharges = rentBy.get(p.id) || [];
      const expenses = expensesBy.get(p.id) || [];
      const payouts = payoutsBy.get(p.id) || [];

      const active = tenancies.filter((t) => t.status === 'active' || t.status === 'notice');
      const units = Math.max(1, Number(p.units) || 1);
      const finance = buildFinance({ rentCharges, expenses, payouts, months: 12 });

      const arrears = rentCharges
        .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) <= today)
        .reduce((sum, c) => sum + Math.max(0, num(c.amount) - num(c.amount_received)), 0);

      const pending = expenses.filter((e) => e.status === 'pending');
      const lastPaid = payouts.find((x) => x.status === 'paid') || null;

      return {
        id: p.id,
        ref: p.ref,
        title: p.title,
        address: p.address,
        city: p.city,
        state: p.state,
        country: p.country,
        currency: currencyCode(p.currency),
        plan: p.plan,
        status: p.status,
        units,
        letUnits: active.length,
        occupancyPct: Math.round((Math.min(active.length, units) / units) * 100),
        contractedRentAnnual: Math.round(
          active.reduce((sum, t) => sum + annualiseRent(t.rent_amount, t.rent_frequency), 0)
        ),
        rentCollected12m: finance.totals.rent,
        feesCharged12m: finance.totals.fees,
        costs12m: finance.totals.costs,
        paidOut12m: finance.totals.remitted,
        arrears: Math.round(arrears),
        pendingApprovalCount: pending.length,
        lastPayout: lastPaid ? { amount: num(lastPaid.net_amount), paidOn: lastPaid.paid_on } : null,
      };
    });

    const sum = (key) => rows.reduce((acc, r) => acc + r[key], 0);
    const totalUnits = sum('units');
    const letUnits = sum('letUnits');
    const finance = buildFinance({ ...ledger, months: 12 });

    return res.json({
      properties: rows,
      totals: {
        propertyCount: rows.length,
        activeCount: rows.filter((r) => r.status === 'active').length,
        totalUnits,
        letUnits,
        occupancyPct: totalUnits ? Math.round((letUnits / totalUnits) * 100) : 0,
        contractedRentAnnual: sum('contractedRentAnnual'),
        rentCollected12m: finance.totals.rent,
        feesCharged12m: finance.totals.fees,
        costs12m: finance.totals.costs,
        netKept12m: finance.totals.net,
        paidOut12m: finance.totals.remitted,
        arrears: sum('arrears'),
        pendingApprovalCount: sum('pendingApprovalCount'),
      },
      finance,
    });
  } catch (err) {
    console.error('GET /management/portfolio error:', err);
    return res.status(500).json({ error: 'Could not load your portfolio.' });
  }
});

/* GET /api/management/finance?email=&propertyId=&months= — the finance tab. */
router.get('/finance', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  const propertyId = Number.parseInt(req.query.propertyId, 10) || null;
  const months = Math.min(36, Math.max(3, Number.parseInt(req.query.months, 10) || 12));
  try {
    const properties = await ownerProperties(email, propertyId);
    const ids = properties.map((p) => p.id);
    const ledger = await loadLedger(ids);
    return res.json({ finance: buildFinance({ ...ledger, months }) });
  } catch (err) {
    console.error('GET /management/finance error:', err);
    return res.status(500).json({ error: 'Could not load your finances.' });
  }
});

/* GET /api/management/payouts?email=&propertyId= — payments out. */
router.get('/payouts', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  const propertyId = Number.parseInt(req.query.propertyId, 10) || null;
  try {
    const properties = await ownerProperties(email, propertyId);
    const ids = properties.map((p) => p.id);
    if (!ids.length) return res.json({ payouts: [] });
    const { rows } = await pool.query(
      `SELECT p.*, r.address FROM management_payouts p
         JOIN management_requests r ON r.id = p.request_id
        WHERE p.request_id = ANY($1)
        ORDER BY COALESCE(p.paid_on, p.scheduled_for) DESC NULLS LAST, p.id DESC`,
      [ids]
    );
    return res.json({ payouts: rows });
  } catch (err) {
    console.error('GET /management/payouts error:', err);
    return res.status(500).json({ error: 'Could not load your payments.' });
  }
});

/* GET /api/management/payouts/:id?email= — one remittance statement, with lines. */
router.get('/payouts/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid payout id.' });
  const email = await sessionEmail(req);
  try {
    const { rows } = await pool.query(
      `SELECT p.*, r.address, r.contact_email, r.payout_bank, r.payout_account_name, r.payout_account_last4
         FROM management_payouts p JOIN management_requests r ON r.id = p.request_id
        WHERE p.id = $1`,
      [id]
    );
    const payout = rows[0];
    if (!payout) return res.status(404).json({ error: 'Payout not found.' });
    if (!(await isAdmin(req)) && (!email || email !== payout.contact_email)) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    delete payout.contact_email;
    const [rent, costs] = await Promise.all([
      pool.query('SELECT * FROM management_rent_charges WHERE payout_id = $1 ORDER BY due_date ASC', [id]),
      pool.query('SELECT * FROM management_expenses WHERE payout_id = $1 ORDER BY incurred_on ASC', [id]),
    ]);
    return res.json({ payout, rentLines: rent.rows, expenseLines: costs.rows });
  } catch (err) {
    console.error('GET /management/payouts/:id error:', err);
    return res.status(500).json({ error: 'Could not load the statement.' });
  }
});

/* POST /api/management/expenses/:id/decision — owner approves or declines a cost. */
router.post('/expenses/:id/decision', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid expense id.' });
  const email = await sessionEmail(req);
  const decision = req.body?.decision === 'reject' ? 'rejected' : req.body?.decision === 'approve' ? 'approved' : null;
  if (!decision) return res.status(400).json({ error: 'Decision must be approve or reject.' });
  try {
    const { rows } = await pool.query(
      `SELECT e.*, r.contact_email, r.address FROM management_expenses e
         JOIN management_requests r ON r.id = e.request_id
        WHERE e.id = $1`,
      [id]
    );
    const expense = rows[0];
    if (!expense) return res.status(404).json({ error: 'Cost not found.' });
    if (!email || email !== expense.contact_email) return res.status(401).json({ error: 'Unauthorized.' });
    if (expense.status !== 'pending') return res.status(409).json({ error: 'This cost has already been decided.' });

    const note = req.body?.note ? String(req.body.note).slice(0, 1000) : null;
    await pool.query(
      `UPDATE management_expenses SET status = $2, decided_at = NOW(), decision_note = $3 WHERE id = $1`,
      [id, decision, note]
    );
    await pool.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'customer', $2, true)`,
      [expense.request_id,
        `${decision === 'approved' ? 'Approved' : 'Declined'} the ${expense.category} cost of ` +
        `${moneyLabel(expense.amount, expense.currency)}${expense.vendor ? ` (${expense.vendor})` : ''}.` +
        `${note ? ` Note: ${note}` : ''}`]
    );
    return res.json({ success: true, status: decision });
  } catch (err) {
    console.error('POST /management/expenses/:id/decision error:', err);
    return res.status(500).json({ error: 'Could not record your decision.' });
  }
});

/* PATCH /api/management/requests/:id/payout-method — where net rent is sent. */
router.patch('/requests/:id/payout-method', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  try {
    const ok = await authorize(req, res, id);
    if (!ok) return undefined;
    const bank = str(req.body?.bank, 120);
    const accountName = str(req.body?.accountName, 255);
    const digits = String(req.body?.accountNumber || '').replace(/\D/g, '');
    const cycle = PAYOUT_CYCLES.includes(req.body?.cycle) ? req.body.cycle : null;
    if (digits && digits.length < 4) return res.status(400).json({ error: 'That account number looks too short.' });

    const { rows } = await pool.query(
      `UPDATE management_requests
          SET payout_bank = COALESCE($2, payout_bank),
              payout_account_name = COALESCE($3, payout_account_name),
              payout_account_last4 = COALESCE($4, payout_account_last4),
              payout_cycle = COALESCE($5, payout_cycle),
              updated_at = NOW()
        WHERE id = $1
        RETURNING id, payout_bank, payout_account_name, payout_account_last4, payout_cycle`,
      [id, bank, accountName, digits ? digits.slice(-4) : null, cycle]
    );
    return res.json({ success: true, payoutMethod: rows[0] });
  } catch (err) {
    console.error('PATCH /management/requests/:id/payout-method error:', err);
    return res.status(500).json({ error: 'Could not save your payment details.' });
  }
});

/*
 * PATCH /api/management/requests/:id/advertise — the owner allows (or stops)
 * advertising this property on the public Rent page. Switching it off takes
 * any live rental down at once; switching it on lets the desk publish one.
 */
router.patch('/requests/:id/advertise', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  if (typeof req.body?.consent !== 'boolean') return res.status(400).json({ error: 'Say whether we may advertise the property.' });
  const consent = req.body.consent;
  try {
    const ok = await authorize(req, res, id);
    if (!ok) return undefined;
    const { rows } = await pool.query(
      `UPDATE management_requests
          SET advertise_consent = $2,
              advertise_consent_at = CASE WHEN $2 THEN NOW() ELSE advertise_consent_at END,
              updated_at = NOW()
        WHERE id = $1
        RETURNING id, advertise_consent, advertise_consent_at`,
      [id, consent]
    );
    await pool.query(
      `UPDATE listings
          SET publish_consent = $2,
              status = CASE WHEN NOT $2 AND status = 'live' THEN 'withdrawn' ELSE status END,
              updated_at = NOW()
        WHERE management_request_id = $1 AND listing_type = 'rent' AND status <> 'let'`,
      [id, consent]
    );
    if (!ok.admin) {
      await pool.query(
        `INSERT INTO management_messages (request_id, sender, body, read_by_customer)
         VALUES ($1, 'customer', $2, true)`,
        [id, consent
          ? 'I allow EasyMoveZone to advertise this property for rent on the EasyMoveZone Rent page.'
          : 'Please stop advertising this property for rent. Take any public listing down.']
      );
    }
    return res.json({ success: true, property: rows[0] });
  } catch (err) {
    console.error('PATCH /management/requests/:id/advertise error:', err);
    return res.status(500).json({ error: 'Could not save that choice.' });
  }
});

/* ── Admin ───────────────────────────────────────────────────────── */

/* POST /api/management/requests/:id/status — move through the lifecycle. */
router.post('/requests/:id/status', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const status = STATUSES.includes(req.body?.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const { rows } = await pool.query(
      `UPDATE management_requests
          SET status = $2, admin_note = COALESCE($3, admin_note),
              reviewed_at = COALESCE(reviewed_at, NOW()), updated_at = NOW()
        WHERE id = $1 RETURNING id`,
      [id, status, req.body?.note ? String(req.body.note).slice(0, 2000) : null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /management/requests/:id/status error:', err);
    return res.status(500).json({ error: 'Could not update status.' });
  }
});

/* POST /api/management/requests/:id/assign — name the manager and confirm the fee. */
router.post('/requests/:id/assign', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const manager = str(req.body?.manager, 255);
  const feePct = req.body?.feePct == null || req.body.feePct === '' ? null : Number(req.body.feePct);
  if (feePct != null && (Number.isNaN(feePct) || feePct < 0 || feePct > 100)) {
    return res.status(400).json({ error: 'Fee percentage must be between 0 and 100.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE management_requests
          SET manager_name = COALESCE($2, manager_name),
              agreed_fee_pct = COALESCE($3, agreed_fee_pct),
              start_date = COALESCE($4, start_date),
              updated_at = NOW()
        WHERE id = $1 RETURNING id, manager_name, agreed_fee_pct`,
      [id, manager, feePct, req.body?.startDate || null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    const row = rows[0];
    await pool.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [id, `${row.manager_name || 'Your property manager'} is now looking after this property` +
        `${row.agreed_fee_pct != null ? ` at an agreed management fee of ${Number(row.agreed_fee_pct)}% of collected rent` : ''}.`]
    );
    return res.json({ success: true, request: row });
  } catch (err) {
    console.error('POST /management/requests/:id/assign error:', err);
    return res.status(500).json({ error: 'Could not update the request.' });
  }
});

/* DELETE /api/management/requests/:id — admin removes a request. */
router.delete('/requests/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  try {
    const { rows } = await pool.query('DELETE FROM management_requests WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /management/requests/:id error:', err);
    return res.status(500).json({ error: 'Could not delete the request.' });
  }
});

/* ── Admin: tenancies, rent, costs and remittances ───────────────── */

/* POST /api/management/requests/:id/tenancies — record a letting. */
router.post('/requests/:id/tenancies', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const b = req.body || {};
  const amount = Number(b.rentAmount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'A rent amount is required.' });
  const frequency = RENT_FREQUENCIES.includes(b.rentFrequency) ? b.rentFrequency : 'annual';
  try {
    const property = await loadRequest(id);
    if (!property) return res.status(404).json({ error: 'Request not found.' });
    const { rows } = await pool.query(
      `INSERT INTO management_tenancies
        (request_id, unit_label, tenant_name, tenant_email, tenant_phone,
         rent_amount, rent_frequency, deposit, currency, start_date, end_date, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        id, str(b.unitLabel, 80), str(b.tenantName, 255),
        b.tenantEmail ? String(b.tenantEmail).trim().toLowerCase().slice(0, 255) : null,
        str(b.tenantPhone, 100), amount, frequency,
        b.deposit != null ? Number(b.deposit) || 0 : null, currencyCode(property.currency),
        b.startDate || null, b.endDate || null,
        ['active', 'notice', 'ended', 'void'].includes(b.status) ? b.status : 'active',
        b.notes ? String(b.notes).slice(0, 2000) : null,
      ]
    );
    await pool.query(
      `UPDATE management_requests
          SET status = CASE WHEN status IN ('new','reviewing','visit_booked','proposal_sent','onboarding')
                            THEN 'active' ELSE status END,
              updated_at = NOW() WHERE id = $1`,
      [id]
    );
    return res.json({ success: true, tenancy: rows[0] });
  } catch (err) {
    console.error('POST /management/requests/:id/tenancies error:', err);
    return res.status(500).json({ error: 'Could not save the tenancy.' });
  }
});

/* PATCH /api/management/tenancies/:id — update a letting. */
router.patch('/tenancies/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid tenancy id.' });
  const b = req.body || {};
  const status = ['active', 'notice', 'ended', 'void'].includes(b.status) ? b.status : null;
  try {
    const { rows } = await pool.query(
      `UPDATE management_tenancies
          SET status = COALESCE($2, status),
              rent_amount = COALESCE($3, rent_amount),
              end_date = COALESCE($4, end_date),
              notes = COALESCE($5, notes),
              updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [id, status, b.rentAmount != null ? Number(b.rentAmount) : null, b.endDate || null,
        b.notes ? String(b.notes).slice(0, 2000) : null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tenancy not found.' });
    return res.json({ success: true, tenancy: rows[0] });
  } catch (err) {
    console.error('PATCH /management/tenancies/:id error:', err);
    return res.status(500).json({ error: 'Could not update the tenancy.' });
  }
});

/* POST /api/management/requests/:id/rent-charges — raise rent due from a tenant. */
router.post('/requests/:id/rent-charges', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const b = req.body || {};
  const amount = Number(b.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'A rent amount is required.' });
  if (!b.dueDate) return res.status(400).json({ error: 'A due date is required.' });
  try {
    const property = await loadRequest(id);
    if (!property) return res.status(404).json({ error: 'Request not found.' });
    const { rows } = await pool.query(
      `INSERT INTO management_rent_charges
        (request_id, tenancy_id, period_label, due_date, amount, currency)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, Number.parseInt(b.tenancyId, 10) || null, str(b.periodLabel, 80), b.dueDate, amount, currencyCode(property.currency)]
    );
    announceCharge(rows[0]);
    return res.json({ success: true, charge: rows[0] });
  } catch (err) {
    console.error('POST /management/requests/:id/rent-charges error:', err);
    return res.status(500).json({ error: 'Could not raise the rent charge.' });
  }
});

/* POST /api/management/rent-charges/:id/receipt — record rent received. */
router.post('/rent-charges/:id/receipt', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid charge id.' });
  try {
    const out = await creditCharge({ chargeId: id, amount: req.body?.amount, receivedOn: req.body?.receivedOn || null });
    return res.json({ success: true, ...out });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('POST /management/rent-charges/:id/receipt error:', err);
    return res.status(500).json({ error: 'Could not record the receipt.' });
  }
});

/* POST /api/management/tenancies/:id/schedule — raise every rent period from the tenancy's terms. */
router.post('/tenancies/:id/schedule', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid tenancy id.' });
  try {
    const created = await generateSchedule(id);
    created.forEach(announceCharge);
    return res.json({ success: true, created });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('POST /management/tenancies/:id/schedule error:', err);
    return res.status(500).json({ error: 'Could not build the rent schedule.' });
  }
});

/* POST /api/management/rent-reminders/run — run the overdue/reminder job now. */
router.post('/rent-reminders/run', requireAdmin, async (req, res) => {
  try {
    return res.json({ success: true, ...(await runRentReminders()) });
  } catch (err) {
    console.error('POST /management/rent-reminders/run error:', err);
    return res.status(500).json({ error: 'Could not run the rent reminders.' });
  }
});

/* POST /api/management/requests/:id/expenses — log a cost against the property. */
router.post('/requests/:id/expenses', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const b = req.body || {};
  const amount = Number(b.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'A cost amount is required.' });
  const category = EXPENSE_CATEGORY_IDS.includes(b.category) ? b.category : 'other';
  try {
    const property = await loadRequest(id);
    if (!property) return res.status(404).json({ error: 'Request not found.' });
    // Anything above the agreed repair limit waits for the owner in the portal.
    const limit = property.repair_limit != null ? Number(property.repair_limit) : null;
    const needsApproval = b.needsApproval != null ? Boolean(b.needsApproval) : (limit != null && amount > limit);
    const { rows } = await pool.query(
      `INSERT INTO management_expenses
        (request_id, category, vendor, description, amount, currency, incurred_on, needs_approval, status, receipt_url)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, CURRENT_DATE),$8,$9,$10) RETURNING *`,
      [
        id, category, str(b.vendor, 255),
        b.description ? String(b.description).slice(0, 2000) : null,
        amount, currencyCode(property.currency), b.incurredOn || null, needsApproval,
        needsApproval ? 'pending' : 'approved', str(b.receiptUrl, 1000),
      ]
    );
    if (needsApproval) {
      await pool.query(
        `INSERT INTO management_messages (request_id, sender, body, read_by_admin)
         VALUES ($1, 'admin', $2, true)`,
        [id, `A ${category} cost of ${moneyLabel(amount, property.currency)}` +
          `${b.vendor ? ` from ${b.vendor}` : ''} needs your approval — review it under Maintenance in your portal.`]
      );
      later(() => notify({
        to: { email: property.contact_email, phone: property.contact_phone },
        kind: 'approval_needed',
        title: `Approval needed: ${moneyLabel(amount, property.currency)} for ${property.title}`,
        body: `${category}${b.vendor ? ` · ${b.vendor}` : ''}${b.description ? ` — ${String(b.description).slice(0, 300)}` : ''}`,
        link: '/portal/landlord/operations/maintenance',
        sms: true,
      }));
    }
    return res.json({ success: true, expense: rows[0] });
  } catch (err) {
    console.error('POST /management/requests/:id/expenses error:', err);
    return res.status(500).json({ error: 'Could not log the cost.' });
  }
});

/**
 * POST /api/management/requests/:id/payouts — raise a remittance.
 *
 * Sweeps rent received in the period that has not been paid out, nets off the
 * management fee, VAT and any approved costs, and locks those rows to the new
 * payout so nothing is remitted twice.
 */
router.post('/requests/:id/payouts', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const { periodStart, periodEnd, scheduledFor, adjustment, note } = req.body || {};
  if (!periodStart || !periodEnd) return res.status(400).json({ error: 'A period start and end are required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: propRows } = await client.query('SELECT * FROM management_requests WHERE id = $1', [id]);
    const property = propRows[0];
    if (!property) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found.' });
    }

    const { rows: rentRows } = await client.query(
      `SELECT * FROM management_rent_charges
        WHERE request_id = $1 AND payout_id IS NULL
          AND status IN ('received','part') AND amount_received > 0
          AND received_on BETWEEN $2 AND $3`,
      [id, periodStart, periodEnd]
    );
    const { rows: costRows } = await client.query(
      `SELECT * FROM management_expenses
        WHERE request_id = $1 AND payout_id IS NULL
          AND status IN ('approved','paid') AND incurred_on <= $2`,
      [id, periodEnd]
    );

    const grossRent = rentRows.reduce((sum, r) => sum + num(r.amount_received), 0);
    const expenseTotal = costRows.reduce((sum, e) => sum + num(e.amount), 0);

    // Nothing to sweep means nothing to remit — raising an empty statement here
    // only puts a ₦0 payment in front of the owner.
    if (!rentRows.length && !costRows.length && !Number(adjustment)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Nothing to pay out for that period — no unremitted rent or costs.' });
    }
    const feePct = effectiveFeePct(property);
    const calc = computePayout({ grossRent, feePct, expenses: expenseTotal, adjustment, vatPercent: taxPercentFor(property.country) });

    const ref = `BV-P-${Date.now().toString(36).toUpperCase()}`;
    const { rows: payoutRows } = await client.query(
      `INSERT INTO management_payouts
        (request_id, ref, period_start, period_end, gross_rent, fee_amount, vat_amount,
         expense_amount, adjustment, net_amount, fee_pct, currency, status, scheduled_for, statement, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'scheduled',$13,$14,$15)
       RETURNING *`,
      [
        id, ref, periodStart, periodEnd, calc.grossRent, calc.feeAmount, calc.vatAmount,
        calc.expenseAmount, calc.adjustment, calc.netAmount, calc.feePct, currencyCode(property.currency),
        scheduledFor || periodEnd,
        JSON.stringify({
          ...calc,
          rentLineCount: rentRows.length,
          expenseLineCount: costRows.length,
          planName: PLAN_BY_ID[property.plan]?.name || property.plan,
        }),
        note ? String(note).slice(0, 2000) : null,
      ]
    );
    const payout = payoutRows[0];

    if (rentRows.length) {
      await client.query('UPDATE management_rent_charges SET payout_id = $2 WHERE id = ANY($1)',
        [rentRows.map((r) => r.id), payout.id]);
    }
    if (costRows.length) {
      await client.query('UPDATE management_expenses SET payout_id = $2, status = \'paid\' WHERE id = ANY($1)',
        [costRows.map((e) => e.id), payout.id]);
    }
    await client.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_customer)
       VALUES ($1, 'admin', $2, true)`,
      [id, `Your statement for ${periodStart} to ${periodEnd} is ready (${ref}). ` +
        `Net to you: ${moneyLabel(calc.netAmount, property.currency)}. See Payments out in your portal for the breakdown.`]
    );
    await client.query('COMMIT');
    return res.json({ success: true, payout });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /management/requests/:id/payouts error:', err);
    return res.status(500).json({ error: 'Could not raise the payout.' });
  } finally {
    client.release();
  }
});

/* POST /api/management/payouts/:id/status — mark a remittance sent or failed. */
router.post('/payouts/:id/status', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid payout id.' });
  const status = ['scheduled', 'processing', 'paid', 'failed'].includes(req.body?.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Invalid payout status.' });
  try {
    const { rows } = await pool.query(
      `UPDATE management_payouts
          SET status = $2::varchar,
              bank_ref = COALESCE($3::varchar, bank_ref),
              paid_on = CASE WHEN $2::varchar = 'paid' THEN COALESCE($4::date, CURRENT_DATE) ELSE paid_on END,
              updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [id, status, str(req.body?.bankRef, 120), req.body?.paidOn || null]
    );
    if (!rows.length) return res.status(404).json({ error: 'Payout not found.' });
    const payout = rows[0];
    if (status === 'paid') {
      await pool.query(
        `INSERT INTO management_messages (request_id, sender, body, read_by_customer)
         VALUES ($1, 'admin', $2, true)`,
        [payout.request_id, `${moneyLabel(payout.net_amount, payout.currency)} has been sent to your account ` +
          `(${payout.ref})${payout.bank_ref ? ` — bank reference ${payout.bank_ref}` : ''}.`]
      );
      later(async () => {
        const property = await loadRequest(payout.request_id);
        if (!property) return;
        await notify({
          to: { email: property.contact_email, phone: property.contact_phone },
          kind: 'payout_paid',
          title: `${moneyLabel(payout.net_amount, payout.currency)} paid to you`,
          body: `Remittance ${payout.ref} for ${property.title}${payout.bank_ref ? `, bank reference ${payout.bank_ref}` : ''}.`,
          link: '/portal/landlord/money',
          sms: true,
        });
      });
    }
    return res.json({ success: true, payout });
  } catch (err) {
    console.error('POST /management/payouts/:id/status error:', err);
    return res.status(500).json({ error: 'Could not update the payout.' });
  }
});

/**
 * GET /api/management/documents/:id — a link the owner (or staff) can open.
 * Files in our private container come back as a 15-minute signed URL; the
 * raw blob URL would not load.
 */
router.get('/documents/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid document id.' });
  try {
    const { rows } = await pool.query(
      `SELECT d.url, r.contact_email FROM management_documents d
         JOIN management_requests r ON r.id = d.request_id WHERE d.id = $1`,
      [id]
    );
    const doc = rows[0];
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (!(await isAdmin(req))) {
      const email = await sessionEmail(req);
      if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
      if (email !== doc.contact_email) return res.status(404).json({ error: 'Document not found.' });
    }
    if (storageConfigured() && /\.blob\.core\.windows\.net\/|127\.0\.0\.1:10000\//.test(doc.url)) {
      return res.json({ url: (await createReadSas(doc.url)).url });
    }
    return res.json({ url: doc.url });
  } catch (err) {
    console.error('GET /management/documents/:id error:', err);
    return res.status(err.status || 500).json({ error: 'Could not open the document.' });
  }
});

/**
 * POST /api/management/tenant-requests/:id/messages — the owner adds a note to
 * a repair or notice their tenant raised. It goes to the desk, not the tenant.
 */
router.post('/tenant-requests/:id/messages', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request.' });
  const body = str(req.body?.body, 4000);
  if (!body) return res.status(400).json({ error: 'Write a note first.' });
  try {
    const email = await sessionEmail(req);
    if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
    const { rows } = await pool.query(
      `SELECT q.id, q.ref, q.title FROM tenant_requests q
         JOIN management_requests r ON r.id = q.request_id
        WHERE q.id = $1 AND r.contact_email = $2 AND q.category IN ('repair','notice')`,
      [id, email]
    );
    const q = rows[0];
    if (!q) return res.status(404).json({ error: 'Request not found.' });
    const { rows: ins } = await pool.query(
      `INSERT INTO tenant_request_messages (request_id, sender, author, body)
       VALUES ($1, 'owner', $2, $3) RETURNING id, request_id, sender, body, created_at`,
      [id, email, body]
    );
    later(() => notifyStaff({ kind: 'owner_note', title: `Owner note on ${q.ref}: ${q.title}`, body: body.slice(0, 500) }));
    return res.json({ success: true, message: ins[0] });
  } catch (err) {
    console.error('POST /management/tenant-requests/:id/messages error:', err);
    return res.status(500).json({ error: 'Could not send your note.' });
  }
});

/* POST /api/management/requests/:id/documents — attach a document to a property. */
router.post('/requests/:id/documents', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const name = str(req.body?.name, 255);
  const url = str(req.body?.url, 1000);
  if (!name || !url) return res.status(400).json({ error: 'A document name and url are required.' });
  if (!/^https?:\/\//.test(url)) return res.status(400).json({ error: 'The document url must be http(s).' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO management_documents (request_id, kind, name, url, share_with_tenant, tenancy_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, str(req.body?.kind, 40) || 'other', name, url, req.body?.shareWithTenant === true,
        Number.parseInt(req.body?.tenancyId, 10) || null]
    );
    return res.json({ success: true, document: rows[0] });
  } catch (err) {
    console.error('POST /management/requests/:id/documents error:', err);
    return res.status(500).json({ error: 'Could not attach the document.' });
  }
});

module.exports = router;
