const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../db');
const { requireUser, requireVerifiedAgent, requireAdmin } = require('../auth');
const { DEFAULT_CURRENCY } = require('../markets');
const { publicPlans, planOf, PERIOD_DAYS } = require('../agentPlans');
const { rateLimit } = require('../services/rateLimit');
const {
  clean, slugify, makeRef, listingSlug,
  loadMembership, liveAndQueuedCount, assertQuota, applyPlan,
  syncUserProfile, notifyAgency,
} = require('../services/agent');
const { notify, notifyStaff, later } = require('../services/notify');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API = (process.env.PAYSTACK_API_BASE || 'https://api.paystack.co').replace(/\/$/, '');
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://easymovezone.com').replace(/\/$/, '');

const AGENT_LISTING_STATUSES = ['draft', 'pending_review', 'live', 'sold', 'let', 'withdrawn', 'rejected'];
const LISTING_TYPES = ['sale', 'rent'];
const RENT_FREQUENCIES = ['annual', 'biannual', 'quarterly', 'monthly'];

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const dateOrNull = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);

async function paystack(path, body) {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${PAYSTACK_SECRET}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    const e = new Error(data.message || 'The payment provider did not respond.');
    e.status = 502;
    throw e;
  }
  return data.data;
}

async function uniqueSlug(name) {
  const base = slugify(name);
  for (let i = 0; i < 8; i += 1) {
    const slug = i === 0 ? base : `${base}-${Math.floor(Math.random() * 900) + 100}`;
    const { rows } = await pool.query('SELECT 1 FROM agencies WHERE slug = $1', [slug]);
    if (!rows.length) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function listingFields(b) {
  const listingType = LISTING_TYPES.includes(b.listingType || b.listing_type) ? (b.listingType || b.listing_type) : 'sale';
  const title = clean(b.title) || clean(b.address) || 'Untitled property';
  const media = Array.isArray(b.media) ? b.media.filter((m) => m && m.url) : [];
  return {
    title,
    address: clean(b.address, 500),
    area: clean(b.area),
    city: clean(b.city, 120),
    state: clean(b.state, 80),
    country: clean(b.country, 120) || 'Nigeria',
    property_type: clean(b.propertyType || b.property_type || b.type, 80),
    beds: clean(b.beds, 20),
    baths: clean(b.baths, 20),
    size_label: clean(b.size || b.size_label, 120),
    features: JSON.stringify(Array.isArray(b.features) ? b.features : []),
    description: typeof b.description === 'string' ? b.description.trim().slice(0, 8000) : null,
    media: JSON.stringify(media),
    currency: /^[A-Z]{3}$/.test(String(b.currency || '').toUpperCase()) ? String(b.currency).toUpperCase() : DEFAULT_CURRENCY,
    guide_price: num(b.price || b.guide_price || b.list_price),
    list_price: num(b.price || b.list_price || b.guide_price),
    listing_type: listingType,
    rent_frequency: listingType === 'rent' && RENT_FREQUENCIES.includes(b.rentFrequency || b.rent_frequency)
      ? (b.rentFrequency || b.rent_frequency) : (listingType === 'rent' ? 'annual' : null),
    service_charge: num(b.serviceCharge || b.service_charge),
    caution_deposit: num(b.cautionDeposit || b.caution_deposit),
    available_from: dateOrNull(b.availableFrom || b.available_from),
    furnished: clean(b.furnished, 20),
    lat: num(b.lat),
    lng: num(b.lng),
    branch_id: Number.parseInt(b.branchId || b.branch_id, 10) || null,
  };
}

async function ownListing(req, id) {
  const { rows } = await pool.query(
    `SELECT * FROM listings WHERE id = $1 AND agency_id = $2 AND route = 'agent_listed'`,
    [id, req.agent.agency_id]
  );
  return rows[0] || null;
}

/* ── Me / apply ──────────────────────────────────────────────────── */

router.get('/me', requireUser, async (req, res) => {
  try {
    const membership = await loadMembership(req.user);
    const { rows: apps } = await pool.query(
      `SELECT id, company, status, admin_note, created_at, reviewed_at, agency_id
         FROM agent_applications
        WHERE lower(email) = $1
        ORDER BY created_at DESC
        LIMIT 5`,
      [req.user.email]
    );
    let used = 0;
    if (membership) used = await liveAndQueuedCount(membership.agency_id);
    return res.json({
      user: { id: req.user.id, email: req.user.email, name: req.user.name },
      membership,
      agency: membership || null,
      application: apps[0] || null,
      applications: apps,
      used,
      quota: membership?.listing_quota || 0,
      plans: publicPlans(),
    });
  } catch (err) {
    console.error('GET /agent/me error:', err);
    return res.status(500).json({ error: 'Could not load your agency account.' });
  }
});

router.post('/apply', requireUser, async (req, res) => {
  const b = req.body || {};
  const company = clean(b.company);
  const name = clean(b.contactName || b.name) || req.user.name;
  if (!company) return res.status(400).json({ error: 'Your agency name is required.' });
  if (!name) return res.status(400).json({ error: 'Your name is required.' });
  try {
    await rateLimit('agent-apply', req.user.email, 3, 24 * 60 * 60 * 1000);
    const existing = await loadMembership(req.user);
    if (existing && ['verified', 'pending'].includes(existing.verification_status)) {
      return res.status(409).json({ error: 'You already have an agency account.' });
    }
    const { rows: open } = await pool.query(
      `SELECT id FROM agent_applications
        WHERE lower(email) = $1 AND status IN ('pending','needs_more')
        LIMIT 1`,
      [req.user.email]
    );
    if (open.length) {
      return res.status(409).json({ error: 'You already have an application under review.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO agent_applications (
         user_id, email, contact_name, company, phone, website, license_number,
         city, state, country, bio, docs
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.user.id || req.user.email, req.user.email, name, company,
        clean(b.phone, 100), clean(b.website, 500), clean(b.licenseNumber || b.license_number, 120),
        clean(b.city, 120), clean(b.state, 80), clean(b.country, 120) || 'Nigeria',
        typeof b.bio === 'string' ? b.bio.trim().slice(0, 4000) : null,
        JSON.stringify(Array.isArray(b.docs) ? b.docs : []),
      ]
    );
    await syncUserProfile(req.user, { isAgent: true, verified: false, company });
    later(() => notifyStaff({
      kind: 'agent_application',
      title: `${company} applied to list as an agent`,
      body: `${name} (${req.user.email})`,
      link: '/admin?section=agents',
    }));
    return res.json({ application: rows[0] });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('POST /agent/apply error:', err);
    return res.status(500).json({ error: 'Could not submit your application.' });
  }
});

/* ── Listings ────────────────────────────────────────────────────── */

router.get('/listings', requireVerifiedAgent, async (req, res) => {
  const status = AGENT_LISTING_STATUSES.includes(req.query.status) ? req.query.status : null;
  const params = [req.agent.agency_id];
  let where = 'agency_id = $1 AND route = \'agent_listed\'';
  if (status) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, ref, slug, title, address, area, city, state, country, property_type,
              beds, baths, size_label, features, description, media, currency,
              guide_price, list_price, listing_type, rent_frequency, service_charge,
              caution_deposit, available_from, furnished, lat, lng, branch_id,
              status, published_at, sold_at, let_at, created_at, updated_at
         FROM listings WHERE ${where} ORDER BY updated_at DESC LIMIT 200`,
      params
    );
    const used = await liveAndQueuedCount(req.agent.agency_id);
    return res.json({ listings: rows, used, quota: req.agent.listing_quota });
  } catch (err) {
    console.error('GET /agent/listings error:', err);
    return res.status(500).json({ error: 'Could not load your listings.' });
  }
});

router.post('/listings', requireVerifiedAgent, async (req, res) => {
  const f = listingFields(req.body || {});
  if (!f.address && !f.title) return res.status(400).json({ error: 'A title or address is required.' });
  if (f.branch_id) {
    const { rows: br } = await pool.query(
      'SELECT id FROM agency_branches WHERE id = $1 AND agency_id = $2',
      [f.branch_id, req.agent.agency_id]
    );
    if (!br.length) return res.status(400).json({ error: 'That office does not belong to your agency.' });
  }
  try {
    await rateLimit('agent-listing', req.user.email, 20, 60 * 60 * 1000);
    const ref = makeRef('AGL');
    const { rows } = await pool.query(
      `INSERT INTO listings (
         ref, slug, owner_email, owner_name, owner_phone, session_id,
         title, address, area, city, state, country, property_type, beds, baths, size_label,
         features, description, media, currency, guide_price, list_price,
         listing_type, rent_frequency, service_charge, caution_deposit, available_from, furnished,
         lat, lng, branch_id, agency_id, listed_by_user_id,
         intent, route, publish_consent, owner_confirmed, consent, consent_name, consent_via, consent_at,
         status
       ) VALUES (
         $1,$2,$3,$4,$5,$6,
         $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
         $17,$18,$19,$20,$21,$22,
         $23,$24,$25,$26,$27,$28,
         $29,$30,$31,$32,$33,
         'private','agent_listed', true, true, true, $34, 'agent', NOW(),
         'draft'
       ) RETURNING *`,
      [
        ref, listingSlug(f.title, ref), req.agent.email, req.agent.name, req.agent.phone, req.user.id || req.user.email,
        f.title, f.address, f.area, f.city, f.state, f.country, f.property_type, f.beds, f.baths, f.size_label,
        f.features, f.description, f.media, f.currency, f.guide_price, f.list_price,
        f.listing_type, f.rent_frequency, f.service_charge, f.caution_deposit, f.available_from, f.furnished,
        f.lat, f.lng, f.branch_id, req.agent.agency_id, req.user.id || req.user.email,
        clean(req.user.name) || req.user.email,
      ]
    );
    return res.json({ listing: rows[0] });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('POST /agent/listings error:', err);
    return res.status(500).json({ error: 'Could not save that listing.' });
  }
});

router.patch('/listings/:id', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const current = id ? await ownListing(req, id) : null;
  if (!current) return res.status(404).json({ error: 'Listing not found.' });
  if (['sold', 'let'].includes(current.status)) {
    return res.status(400).json({ error: 'A sold or let listing cannot be edited.' });
  }
  const f = listingFields({ ...current, ...req.body, price: req.body?.price ?? current.list_price });
  if (f.branch_id) {
    const { rows: br } = await pool.query(
      'SELECT id FROM agency_branches WHERE id = $1 AND agency_id = $2',
      [f.branch_id, req.agent.agency_id]
    );
    if (!br.length) return res.status(400).json({ error: 'That office does not belong to your agency.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE listings SET
         title = $2, address = $3, area = $4, city = $5, state = $6, country = $7,
         property_type = $8, beds = $9, baths = $10, size_label = $11, features = $12,
         description = $13, media = $14, currency = $15, guide_price = $16, list_price = $17,
         listing_type = $18, rent_frequency = $19, service_charge = $20, caution_deposit = $21,
         available_from = $22, furnished = $23, lat = $24, lng = $25, branch_id = $26,
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id, f.title, f.address, f.area, f.city, f.state, f.country,
        f.property_type, f.beds, f.baths, f.size_label, f.features,
        f.description, f.media, f.currency, f.guide_price, f.list_price,
        f.listing_type, f.rent_frequency, f.service_charge, f.caution_deposit,
        f.available_from, f.furnished, f.lat, f.lng, f.branch_id,
      ]
    );
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/listings/:id error:', err);
    return res.status(500).json({ error: 'Could not update that listing.' });
  }
});

router.post('/listings/:id/submit', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const current = id ? await ownListing(req, id) : null;
  if (!current) return res.status(404).json({ error: 'Listing not found.' });
  if (!['draft', 'rejected', 'withdrawn'].includes(current.status)) {
    return res.status(400).json({ error: 'Only a draft can be submitted for review.' });
  }
  const price = num(current.list_price || current.guide_price);
  if (!price || price <= 0) return res.status(400).json({ error: 'Set a price before submitting.' });
  if (!current.title) return res.status(400).json({ error: 'Give the listing a title before submitting.' });
  try {
    await assertQuota(req.agent);
    const { rows } = await pool.query(
      `UPDATE listings SET status = 'pending_review', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    later(() => notifyStaff({
      kind: 'agent_listing',
      title: `${req.agent.name} submitted ${current.title}`,
      body: 'Waiting for marketplace review.',
      link: '/admin?section=agents',
    }));
    return res.json({ listing: rows[0] });
  } catch (err) {
    if (err.status === 402) return res.status(402).json({ error: err.message });
    console.error('POST /agent/listings/:id/submit error:', err);
    return res.status(500).json({ error: 'Could not submit that listing.' });
  }
});

router.post('/listings/:id/status', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const next = String(req.body?.status || '');
  const current = id ? await ownListing(req, id) : null;
  if (!current) return res.status(404).json({ error: 'Listing not found.' });
  const allowed = {
    live: ['withdrawn', 'sold', 'let'],
    pending_review: ['withdrawn', 'draft'],
    draft: ['withdrawn'],
    rejected: ['draft'],
    withdrawn: ['draft'],
  };
  if (!(allowed[current.status] || []).includes(next)) {
    return res.status(400).json({ error: 'That status change is not allowed.' });
  }
  if (next === 'sold' && current.listing_type === 'rent') {
    return res.status(400).json({ error: 'A rental is marked let, not sold.' });
  }
  if (next === 'let' && current.listing_type !== 'rent') {
    return res.status(400).json({ error: 'Only a rental can be marked let.' });
  }
  try {
    const extras = [];
    if (next === 'sold') extras.push('sold_at = COALESCE(sold_at, NOW())');
    if (next === 'let') extras.push('let_at = COALESCE(let_at, NOW())');
    const { rows } = await pool.query(
      `UPDATE listings SET status = $2, updated_at = NOW()${extras.length ? `, ${extras.join(', ')}` : ''}
        WHERE id = $1 RETURNING *`,
      [id, next]
    );
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('POST /agent/listings/:id/status error:', err);
    return res.status(500).json({ error: 'Could not update that listing.' });
  }
});

/* ── Inbox ───────────────────────────────────────────────────────── */

router.get('/inbox', requireVerifiedAgent, async (req, res) => {
  try {
    const { rows: enquiries } = await pool.query(
      `SELECT e.*, l.title AS listing_title, l.slug AS listing_slug, l.ref AS listing_ref
         FROM listing_enquiries e
         JOIN listings l ON l.id = e.listing_id
        WHERE e.agency_id = $1
        ORDER BY e.created_at DESC
        LIMIT 100`,
      [req.agent.agency_id]
    );
    const { rows: viewings } = await pool.query(
      `SELECT v.*, l.title AS listing_title, l.slug AS listing_slug, l.ref AS listing_ref
         FROM listing_viewings v
         JOIN listings l ON l.id = v.listing_id
        WHERE v.agency_id = $1
        ORDER BY v.created_at DESC
        LIMIT 100`,
      [req.agent.agency_id]
    );
    return res.json({ enquiries, viewings });
  } catch (err) {
    console.error('GET /agent/inbox error:', err);
    return res.status(500).json({ error: 'Could not load your inbox.' });
  }
});

router.patch('/inbox/enquiries/:id', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = String(req.body?.status || '');
  if (!['new', 'contacted', 'viewing_booked', 'offer_made', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Unknown enquiry status.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE listing_enquiries SET status = $2
        WHERE id = $1 AND agency_id = $3
        RETURNING *`,
      [id, status, req.agent.agency_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Enquiry not found.' });
    return res.json({ enquiry: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/inbox/enquiries error:', err);
    return res.status(500).json({ error: 'Could not update that enquiry.' });
  }
});

router.patch('/inbox/viewings/:id', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = String(req.body?.status || '');
  if (!['requested', 'offered', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Unknown viewing status.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE listing_viewings SET status = $2, admin_note = COALESCE($3, admin_note)
        WHERE id = $1 AND agency_id = $4
        RETURNING *`,
      [id, status, clean(req.body?.note, 500), req.agent.agency_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Viewing not found.' });
    return res.json({ viewing: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/inbox/viewings error:', err);
    return res.status(500).json({ error: 'Could not update that viewing.' });
  }
});

/* ── Branches ────────────────────────────────────────────────────── */

router.get('/branches', requireVerifiedAgent, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM agency_branches WHERE agency_id = $1 ORDER BY id',
      [req.agent.agency_id]
    );
    return res.json({ branches: rows });
  } catch (err) {
    console.error('GET /agent/branches error:', err);
    return res.status(500).json({ error: 'Could not load offices.' });
  }
});

router.post('/branches', requireVerifiedAgent, async (req, res) => {
  const name = clean(req.body?.name);
  if (!name) return res.status(400).json({ error: 'Give the office a name.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO agency_branches (agency_id, name, address, city, state, country, phone, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        req.agent.agency_id, name, clean(req.body?.address, 500), clean(req.body?.city, 120),
        clean(req.body?.state, 80), clean(req.body?.country, 120) || req.agent.country,
        clean(req.body?.phone, 100), num(req.body?.lat), num(req.body?.lng),
      ]
    );
    return res.json({ branch: rows[0] });
  } catch (err) {
    console.error('POST /agent/branches error:', err);
    return res.status(500).json({ error: 'Could not add that office.' });
  }
});

router.patch('/branches/:id', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const name = clean(req.body?.name);
  if (!id || !name) return res.status(400).json({ error: 'Give the office a name.' });
  try {
    const { rows } = await pool.query(
      `UPDATE agency_branches SET name = $3, address = $4, city = $5, state = $6, country = $7,
              phone = $8, lat = $9, lng = $10
        WHERE id = $1 AND agency_id = $2 RETURNING *`,
      [
        id, req.agent.agency_id, name, clean(req.body?.address, 500), clean(req.body?.city, 120),
        clean(req.body?.state, 80), clean(req.body?.country, 120), clean(req.body?.phone, 100),
        num(req.body?.lat), num(req.body?.lng),
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Office not found.' });
    return res.json({ branch: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/branches error:', err);
    return res.status(500).json({ error: 'Could not update that office.' });
  }
});

router.delete('/branches/:id', requireVerifiedAgent, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    await pool.query('UPDATE listings SET branch_id = NULL WHERE branch_id = $1 AND agency_id = $2', [id, req.agent.agency_id]);
    const { rowCount } = await pool.query(
      'DELETE FROM agency_branches WHERE id = $1 AND agency_id = $2',
      [id, req.agent.agency_id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Office not found.' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /agent/branches error:', err);
    return res.status(500).json({ error: 'Could not remove that office.' });
  }
});

router.patch('/profile', requireVerifiedAgent, async (req, res) => {
  const b = req.body || {};
  try {
    const { rows } = await pool.query(
      `UPDATE agencies SET
         name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         website = COALESCE($4, website),
         bio = COALESCE($5, bio),
         logo = COALESCE($6, logo),
         address = COALESCE($7, address),
         area = COALESCE($8, area),
         city = COALESCE($9, city),
         state = COALESCE($10, state),
         country = COALESCE($11, country),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        req.agent.agency_id,
        clean(b.name), clean(b.phone, 100), clean(b.website, 500),
        typeof b.bio === 'string' ? b.bio.trim().slice(0, 4000) : null,
        clean(b.logo, 500), clean(b.address, 500), clean(b.area),
        clean(b.city, 120), clean(b.state, 80), clean(b.country, 120),
      ]
    );
    await syncUserProfile(req.user, { isAgent: true, verified: true, company: rows[0].name });
    return res.json({ agency: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/profile error:', err);
    return res.status(500).json({ error: 'Could not update your agency profile.' });
  }
});

/* ── Billing ─────────────────────────────────────────────────────── */

router.get('/plans', (_req, res) => res.json({ plans: publicPlans(), enabled: Boolean(PAYSTACK_SECRET) }));

router.get('/billing', requireVerifiedAgent, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, plan, quota, amount, currency, reference, status, period_start, period_end, paid_at, created_at
         FROM agency_subscriptions WHERE agency_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.agent.agency_id]
    );
    return res.json({
      subscriptions: rows,
      plan: req.agent.plan,
      quota: req.agent.listing_quota,
      used: await liveAndQueuedCount(req.agent.agency_id),
      enabled: Boolean(PAYSTACK_SECRET),
    });
  } catch (err) {
    console.error('GET /agent/billing error:', err);
    return res.status(500).json({ error: 'Could not load billing.' });
  }
});

router.post('/billing/checkout', requireVerifiedAgent, async (req, res) => {
  if (!PAYSTACK_SECRET) return res.status(503).json({ error: 'Online payment is not switched on yet.' });
  const plan = planOf(req.body?.plan);
  if (!plan) return res.status(400).json({ error: 'Choose a plan.' });
  const reference = `EMZAGENT-${req.agent.agency_id}-${Date.now().toString(36).toUpperCase()}`;
  try {
    await pool.query(
      `INSERT INTO agency_subscriptions (agency_id, plan, quota, amount, currency, reference, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')`,
      [req.agent.agency_id, plan.id, plan.quota, plan.amount, plan.currency, reference]
    );
    const tx = await paystack('/transaction/initialize', {
      email: req.user.email,
      amount: Math.round(plan.amount * 100),
      currency: plan.currency,
      reference,
      callback_url: `${APP_URL}/agent/account?paid=${encodeURIComponent(reference)}`,
      metadata: { agency_id: req.agent.agency_id, plan: plan.id },
    });
    return res.json({ authorization_url: tx.authorization_url, reference });
  } catch (err) {
    console.error('POST /agent/billing/checkout error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Could not start checkout.' });
  }
});

async function settleSubscription(reference, tx) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM agency_subscriptions WHERE reference = $1 FOR UPDATE', [reference]);
    const sub = rows[0];
    if (!sub) {
      await client.query('ROLLBACK');
      return { state: 'unknown' };
    }
    if (sub.credited) {
      await client.query('COMMIT');
      return { state: 'success', subscription: sub };
    }
    const paidKobo = Number(tx?.amount) || 0;
    const ok = tx?.status === 'success'
      && String(tx.currency || '').toUpperCase() === String(sub.currency).toUpperCase()
      && paidKobo >= Math.round(Number(sub.amount) * 100);
    if (!ok) {
      const next = ['failed', 'abandoned'].includes(tx?.status) ? tx.status : sub.status;
      await client.query('UPDATE agency_subscriptions SET status = $2 WHERE id = $1', [sub.id, next]);
      await client.query('COMMIT');
      return { state: next, subscription: { ...sub, status: next } };
    }
    const { rows: done } = await client.query(
      `UPDATE agency_subscriptions
          SET status = 'active', credited = true, paid_at = COALESCE($2::timestamptz, NOW()),
              period_start = NOW(), period_end = NOW() + ($3 || ' days')::interval
        WHERE id = $1 RETURNING *`,
      [sub.id, tx.paid_at || null, String(PERIOD_DAYS)]
    );
    await client.query(
      `UPDATE agencies SET plan = $2, listing_quota = $3, updated_at = NOW() WHERE id = $1`,
      [sub.agency_id, sub.plan, sub.quota]
    );
    await client.query('COMMIT');
    return { state: 'success', subscription: done[0] };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

router.get('/billing/verify', requireVerifiedAgent, async (req, res) => {
  const reference = String(req.query.reference || '');
  if (!reference.startsWith('EMZAGENT-')) return res.status(400).json({ error: 'Unknown reference.' });
  try {
    const tx = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
    const result = await settleSubscription(reference, tx);
    return res.json(result);
  } catch (err) {
    console.error('GET /agent/billing/verify error:', err);
    return res.status(500).json({ error: 'Could not confirm that payment.' });
  }
});

router.post('/billing/webhook', async (req, res) => {
  if (!PAYSTACK_SECRET || !req.rawBody) return res.sendStatus(400);
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.rawBody).digest('hex');
  const got = String(req.get('x-paystack-signature') || '');
  if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
    return res.sendStatus(401);
  }
  try {
    const { event, data } = req.body || {};
    if (event === 'charge.success' && data?.reference) {
      const tx = await paystack(`/transaction/verify/${encodeURIComponent(data.reference)}`);
      await settleSubscription(data.reference, tx);
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error('POST /agent/billing/webhook error:', err);
    return res.sendStatus(500);
  }
});

/* ── Admin ───────────────────────────────────────────────────────── */

router.get('/admin/applications', requireAdmin, async (req, res) => {
  const status = req.query.status;
  const params = [];
  let where = '1=1';
  if (status) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM agent_applications WHERE ${where} ORDER BY created_at DESC LIMIT 200`,
      params
    );
    return res.json({ applications: rows });
  } catch (err) {
    console.error('GET /agent/admin/applications error:', err);
    return res.status(500).json({ error: 'Could not load applications.' });
  }
});

router.patch('/admin/applications/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const next = String(req.body?.status || '');
  if (!['approved', 'rejected', 'needs_more', 'pending'].includes(next)) {
    return res.status(400).json({ error: 'Unknown application status.' });
  }
  try {
    const { rows: currentRows } = await pool.query('SELECT * FROM agent_applications WHERE id = $1', [id]);
    if (!currentRows.length) return res.status(404).json({ error: 'Application not found.' });
    const app = currentRows[0];
    let agencyId = app.agency_id;

    if (next === 'approved' && !agencyId) {
      const slug = await uniqueSlug(app.company);
      const { rows: ag } = await pool.query(
        `INSERT INTO agencies (
           ref, slug, name, email, phone, website, bio, city, state, country,
           license_number, license_docs, verification_status, verified_at, verified_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'verified', NOW(), $13)
         RETURNING *`,
        [
          makeRef('AG'), slug, app.company, app.email, app.phone, app.website, app.bio,
          app.city, app.state, app.country, app.license_number, JSON.stringify(app.docs || []),
          req.adminActor,
        ]
      );
      agencyId = ag[0].id;
      await pool.query(
        `INSERT INTO agency_members (agency_id, user_id, email, role, status)
         VALUES ($1,$2,$3,'owner','active')
         ON CONFLICT (agency_id, email) DO UPDATE SET status = 'active', role = 'owner'`,
        [agencyId, app.user_id, app.email]
      );
      await syncUserProfile({ id: app.user_id, email: app.email }, { isAgent: true, verified: true, company: app.company });
      later(() => notify({
        to: { email: app.email, phone: app.phone },
        audience: 'agent',
        kind: 'agent_verified',
        title: `${app.company} is verified`,
        body: 'You can now choose a plan and post listings on EasyMoveZone.',
        link: '/agent',
        sms: Boolean(app.phone),
      }));
    } else if (next === 'rejected' || next === 'needs_more') {
      later(() => notify({
        to: { email: app.email },
        audience: 'agent',
        kind: 'agent_application',
        title: next === 'rejected' ? 'Your agent application was not approved' : 'We need a bit more from you',
        body: clean(req.body?.note, 500) || (next === 'rejected'
          ? 'Staff reviewed your application and could not verify the agency.'
          : 'Please update your licence or contact details and we will look again.'),
        link: '/agent/apply',
      }));
    }

    const { rows } = await pool.query(
      `UPDATE agent_applications
          SET status = $2, agency_id = COALESCE($3, agency_id), admin_note = COALESCE($4, admin_note),
              reviewed_by = $5, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [id, next, agencyId, clean(req.body?.note, 1000), req.adminActor]
    );
    return res.json({ application: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/admin/applications error:', err);
    return res.status(500).json({ error: 'Could not update that application.' });
  }
});

router.get('/admin/agencies', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
              (SELECT COUNT(*)::int FROM listings l WHERE l.agency_id = a.id AND l.status = 'live') AS live_count,
              (SELECT COUNT(*)::int FROM listings l WHERE l.agency_id = a.id AND l.status = 'pending_review') AS pending_count,
              (SELECT COUNT(*)::int FROM agency_members m WHERE m.agency_id = a.id AND m.status = 'active') AS member_count
         FROM agencies a
        ORDER BY a.created_at DESC
        LIMIT 200`
    );
    return res.json({ agencies: rows });
  } catch (err) {
    console.error('GET /agent/admin/agencies error:', err);
    return res.status(500).json({ error: 'Could not load agencies.' });
  }
});

router.patch('/admin/agencies/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const b = req.body || {};
  try {
    const { rows: currentRows } = await pool.query('SELECT * FROM agencies WHERE id = $1', [id]);
    if (!currentRows.length) return res.status(404).json({ error: 'Agency not found.' });
    const current = currentRows[0];

    if (b.verification_status === 'suspended' || b.suspend) {
      await pool.query(
        `UPDATE listings SET status = 'withdrawn', updated_at = NOW()
          WHERE agency_id = $1 AND status IN ('live','pending_review')`,
        [id]
      );
      await pool.query(
        `UPDATE agencies SET verification_status = 'suspended', admin_note = COALESCE($2, admin_note), updated_at = NOW()
          WHERE id = $1`,
        [id, clean(b.note, 1000)]
      );
      later(() => notifyAgency({
        agencyId: id,
        kind: 'agent_suspended',
        title: `${current.name} has been suspended`,
        body: 'Your live listings have been taken down. Contact EasyMoveZone if this is a mistake.',
        link: '/agent',
      }));
    } else if (b.verification_status === 'verified') {
      await pool.query(
        `UPDATE agencies SET verification_status = 'verified', verified_at = COALESCE(verified_at, NOW()),
                verified_by = $2, updated_at = NOW() WHERE id = $1`,
        [id, req.adminActor]
      );
    }

    if (b.plan) {
      await applyPlan(id, b.plan);
      if (b.comped) {
        await pool.query(
          `INSERT INTO agency_subscriptions (agency_id, plan, quota, amount, currency, reference, status, credited, period_start, period_end)
           VALUES ($1,$2,$3,0,'NGN',$4,'comped', true, NOW(), NOW() + INTERVAL '365 days')`,
          [id, b.plan, planOf(b.plan)?.quota || 0, `EMZAGENT-COMP-${id}-${Date.now().toString(36).toUpperCase()}`]
        );
      }
    }

    if ('note' in b && !b.suspend) {
      await pool.query('UPDATE agencies SET admin_note = $2, updated_at = NOW() WHERE id = $1', [id, clean(b.note, 1000)]);
    }

    const { rows } = await pool.query('SELECT * FROM agencies WHERE id = $1', [id]);
    return res.json({ agency: rows[0] });
  } catch (err) {
    console.error('PATCH /agent/admin/agencies error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Could not update that agency.' });
  }
});

router.get('/admin/listings', requireAdmin, async (req, res) => {
  const status = req.query.status || 'pending_review';
  try {
    const { rows } = await pool.query(
      `SELECT l.*, a.name AS agency_name, a.slug AS agency_slug, a.email AS agency_email
         FROM listings l
         JOIN agencies a ON a.id = l.agency_id
        WHERE l.route = 'agent_listed' AND ($1 = 'all' OR l.status = $1)
        ORDER BY l.updated_at DESC
        LIMIT 200`,
      [status]
    );
    return res.json({ listings: rows });
  } catch (err) {
    console.error('GET /agent/admin/listings error:', err);
    return res.status(500).json({ error: 'Could not load agent listings.' });
  }
});

router.post('/admin/listings/:id/review', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const decision = String(req.body?.decision || '');
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Approve or reject the listing.' });
  }
  try {
    const { rows: currentRows } = await pool.query(
      `SELECT l.*, a.email AS agency_email, a.name AS agency_name, a.listing_quota, a.plan, a.id AS agency_id
         FROM listings l JOIN agencies a ON a.id = l.agency_id
        WHERE l.id = $1 AND l.route = 'agent_listed'`,
      [id]
    );
    if (!currentRows.length) return res.status(404).json({ error: 'Listing not found.' });
    const current = currentRows[0];
    if (decision === 'approve') {
      const price = num(current.list_price || current.guide_price);
      if (!price) return res.status(400).json({ error: 'This listing needs a price before it can go live.' });
      await assertQuota({ agency_id: current.agency_id, listing_quota: current.listing_quota, plan: current.plan }, 0);
      const { rows } = await pool.query(
        `UPDATE listings SET status = 'live', published_at = COALESCE(published_at, NOW()),
                reviewed_by = $2, updated_at = NOW()
          WHERE id = $1 RETURNING *`,
        [id, req.adminActor]
      );
      later(() => notify({
        to: { email: current.agency_email },
        audience: 'agent',
        kind: 'listing_live',
        title: `${current.title} is live`,
        body: 'Buyers can see it on EasyMoveZone now.',
        link: `/listings/${current.slug || current.id}`,
      }));
      return res.json({ listing: rows[0] });
    }
    const { rows } = await pool.query(
      `UPDATE listings SET status = 'rejected', admin_note = COALESCE($2, admin_note),
              reviewed_by = $3, updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [id, clean(req.body?.note, 1000), req.adminActor]
    );
    later(() => notify({
      to: { email: current.agency_email },
      audience: 'agent',
      kind: 'listing_rejected',
      title: `${current.title} was not approved`,
      body: clean(req.body?.note, 500) || 'Please edit and submit it again.',
      link: '/agent/listings',
    }));
    return res.json({ listing: rows[0] });
  } catch (err) {
    if (err.status === 402) return res.status(402).json({ error: err.message });
    console.error('POST /agent/admin/listings review error:', err);
    return res.status(500).json({ error: 'Could not review that listing.' });
  }
});

module.exports = router;
module.exports.settleSubscription = settleSubscription;
