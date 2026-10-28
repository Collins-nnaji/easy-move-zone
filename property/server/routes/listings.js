const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../db');
const { createReadSas, isConfigured: storageConfigured } = require('../services/blobStorage');
const { normalizeTitleDocuments } = require('../titleDocuments');
const { areaForPlace } = require('../areaStore');

/**
 * The marketplace.
 *
 * EasyMoveZone is not only a classifieds site. A property gets here in three
 * ways, and all of them pass through an admin before anything is visible:
 *
 *   1. The owner accepts our offer, we buy it, and we resell it   → company_owned
 *   2. The owner declines the offer and asks us to sell it for them → owner_listed
 *   3. A verified agency posts it from their console              → agent_listed
 *
 * A third way in is assisted intake: an admin types the listing in for the
 * owner (or a developer's whole project), and it waits at `draft` until the
 * owner opens a single-use link and signs the authorization themselves. A
 * draft is never public and cannot be published.
 *
 * `GET /` and `GET /:idOrSlug` are the only routes the public can read from,
 * and both are hard-scoped to `status = 'live'`.
 *
 * Rentals live in the same table (`listing_type = 'rent'`). Each one lets a
 * property we manage, is created by an admin from that management request,
 * and can only go live while the owner's advertise_consent is on. A renter
 * applies through `POST /:id/apply`; an approved applicant becomes a tenancy
 * on the managed property, and the listing ends at `let`.
 */

const { requireAdmin, sessionEmail } = require('../auth');
const { DEFAULT_CURRENCY } = require('../markets');

/**
 * The EasyMoveZone offer: we inspect and verify the title first, then issue a
 * firm offer, and complete within this many days of verification if the owner
 * accepts. Same number as PURCHASE_DAYS in src/config/platform.js.
 */
const PURCHASE_DAYS = 14;


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const clean = (v, max = 255) => (
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
);

function makeRef() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `BVL-${Date.now().toString(36).toUpperCase().slice(-5)}${n}`;
}

/** A readable, unique URL segment: `4-bed-duplex-lekki-bvl-x12`. */
function makeSlug(title, ref) {
  const base = String(title || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'property'}-${ref.toLowerCase()}`;
}

/**
 * What the public is allowed to see. The owner's name, email, phone and the
 * signed authorization never leave the admin side, and neither does what we
 * offered for the property. A rental's street address is withheld too: the
 * home is often empty, and the desk gives it out when it books a viewing.
 */
const PUBLIC_COLUMNS = `
  id, ref, slug, title,
  CASE WHEN listing_type = 'rent' THEN NULL ELSE address END AS address,
  area, city, state, country, property_type,
  beds, baths, size_label, features, description, media, currency,
  COALESCE(list_price, guide_price) AS price,
  valuation_low, valuation_high, condition_score, route, featured,
  listing_type, rent_frequency, service_charge, caution_deposit,
  to_char(available_from, 'YYYY-MM-DD') AS available_from, furnished,
  project_id, units_available, lat, lng,
  (SELECT p.name FROM listing_projects p WHERE p.id = listings.project_id) AS project_name,
  (SELECT a.name FROM agencies a WHERE a.id = listings.agency_id) AS agency_name,
  (SELECT a.slug FROM agencies a WHERE a.id = listings.agency_id) AS agency_slug,
  (SELECT a.phone FROM agencies a WHERE a.id = listings.agency_id) AS agency_phone,
  (SELECT a.logo FROM agencies a WHERE a.id = listings.agency_id) AS agency_logo,
  published_at, created_at
`;

const RENT_FREQUENCIES = ['annual', 'biannual', 'quarterly', 'monthly'];
const LISTING_TYPES = ['sale', 'rent'];

/** `?mode=rent` is the Rent page; anything else is the Buy grid (staff tools only). */
const modeOf = (v) => (v === 'rent' ? 'rent' : 'sale');
/*
 * The public site is rentals only: the grid, its filters and a home's page
 * never show a sale listing, whatever `mode` a client sends.
 */
const PUBLIC_MODE = 'rent';

const dateOrNull = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);

/* ── Public: browse ──────────────────────────────────────────────── */

/* GET /api/listings — the marketplace grid. Only ever returns live rows. */
router.get('/', async (req, res) => {
  const {
    country, currency, state, type, beds, minPrice, maxPrice, route: routeFilter, q, project,
    sort = 'newest', limit = 24, offset = 0,
  } = req.query;

  const where = [`status = 'live'`];
  const params = [];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('$?', `$${params.length}`)); };

  add('listing_type = $?', PUBLIC_MODE);
  if (clean(country)) add('country = $?', clean(country));
  if (/^[A-Z]{3}$/.test(String(currency || '').toUpperCase())) add('currency = $?', String(currency).toUpperCase());
  if (clean(state)) add('state = $?', clean(state));
  if (clean(type)) add('property_type = $?', clean(type));
  if (clean(beds)) add('beds = $?', clean(beds));
  if (num(minPrice) !== null) add('COALESCE(list_price, guide_price) >= $?', num(minPrice));
  if (num(maxPrice) !== null) add('COALESCE(list_price, guide_price) <= $?', num(maxPrice));
  if (routeFilter === 'emz') where.push(`route <> 'agent_listed'`);
  else if (routeFilter === 'company_owned' || routeFilter === 'owner_listed' || routeFilter === 'agent_listed') {
    add('route = $?', routeFilter);
  }
  if (Number.parseInt(project, 10) > 0) add('project_id = $?', Number.parseInt(project, 10));
  if (clean(q)) {
    params.push(`%${clean(q).toLowerCase()}%`);
    where.push(`(LOWER(title) LIKE $${params.length} OR LOWER(area) LIKE $${params.length}
                 OR LOWER(city) LIKE $${params.length} OR LOWER(state) LIKE $${params.length}
                 OR LOWER(country) LIKE $${params.length})`);
  }

  const ORDER = {
    newest: 'featured DESC, published_at DESC NULLS LAST, id DESC',
    price_asc: 'COALESCE(list_price, guide_price) ASC NULLS LAST',
    price_desc: 'COALESCE(list_price, guide_price) DESC NULLS LAST',
    condition: 'condition_score DESC NULLS LAST',
  };
  const orderBy = ORDER[sort] || ORDER.newest;

  const take = Math.min(Math.max(Number.parseInt(limit, 10) || 24, 1), 60);
  const skip = Math.max(Number.parseInt(offset, 10) || 0, 0);

  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM listings
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT ${take} OFFSET ${skip}`,
      params
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM listings WHERE ${where.join(' AND ')}`,
      params
    );
    return res.json({ listings: rows, total: countRows[0]?.total || 0, limit: take, offset: skip });
  } catch (err) {
    console.error('GET /listings error:', err);
    return res.status(500).json({ error: 'Could not load listings.' });
  }
});

/* GET /api/listings/facets — the filter options that actually have stock behind them. */
router.get('/facets', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT country, currency, state, property_type, beds, COALESCE(list_price, guide_price) AS price
         FROM listings WHERE status = 'live' AND listing_type = $1`,
      [PUBLIC_MODE]
    );
    const uniq = (key) => [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort();
    const prices = rows.map((r) => Number(r.price)).filter((n) => Number.isFinite(n) && n > 0);
    return res.json({
      countries: uniq('country'),
      currencies: uniq('currency'),
      states: uniq('state'),
      types: uniq('property_type'),
      beds: uniq('beds'),
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      total: rows.length,
    });
  } catch (err) {
    console.error('GET /listings/facets error:', err);
    return res.status(500).json({ error: 'Could not load filters.' });
  }
});

/* GET /api/listings/mine?email= — an owner's own sale submissions, at any status (rentals show in Manage). */
router.get('/mine', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const { rows } = await pool.query(
      `SELECT id, ref, slug, title, address, state, status, route, intent, listing_type,
              city, country, currency, COALESCE(list_price, guide_price) AS price,
              CASE WHEN status IN ('offer_made', 'bought') THEN offer_amount ELSE NULL END AS offer_amount,
              CASE WHEN status IN ('offer_made', 'bought') THEN purchase_by ELSE NULL END AS purchase_by,
              publish_consent, customer_note, created_at, offer_issued_at, published_at
         FROM listings WHERE owner_email = $1 AND listing_type = 'sale' AND status <> 'draft'
           AND route <> 'agent_listed' ORDER BY created_at DESC`,
      [email]
    );
    return res.json({ listings: rows });
  } catch (err) {
    console.error('GET /listings/mine error:', err);
    return res.status(500).json({ error: 'Could not load your submissions.' });
  }
});

/* ── Admin: the approval pipeline ────────────────────────────────── */

/* GET /api/listings/admin?status=&type=sale|rent — every submission, newest first. */
router.get('/admin', requireAdmin, async (req, res) => {
  const status = clean(req.query.status);
  const project = Number.parseInt(req.query.project, 10) || null;
  const params = [modeOf(req.query.type)];
  const where = ['l.listing_type = $1'];
  if (status) { params.push(status); where.push(`l.status = $${params.length}`); }
  if (project) { params.push(project); where.push(`l.project_id = $${params.length}`); }
  try {
    const { rows } = await pool.query(
      `SELECT l.*, p.name AS project_name, (
         SELECT COUNT(*)::int FROM listing_enquiries e WHERE e.listing_id = l.id
       ) AS enquiry_count, (
         SELECT COUNT(*)::int FROM rental_applications a WHERE a.listing_id = l.id
       ) AS application_count, (
         SELECT COUNT(*)::int FROM rental_applications a WHERE a.listing_id = l.id AND a.status = 'new'
       ) AS new_application_count, (
         SELECT MAX(c.created_at) FROM listing_confirmations c
          WHERE c.listing_id = l.id OR c.project_id = l.project_id
       ) AS link_sent_at, (
         SELECT MAX(c.opened_at) FROM listing_confirmations c
          WHERE c.listing_id = l.id OR c.project_id = l.project_id
       ) AS link_opened_at,
       m.advertise_consent, m.ref AS management_ref, m.status AS management_status
         FROM listings l
         LEFT JOIN listing_projects p ON p.id = l.project_id
         LEFT JOIN management_requests m ON m.id = l.management_request_id
        WHERE ${where.join(' AND ')}
        ORDER BY l.created_at DESC LIMIT 200`,
      params
    );
    return res.json({ listings: rows });
  } catch (err) {
    console.error('GET /listings/admin error:', err);
    return res.status(500).json({ error: 'Could not load submissions.' });
  }
});

/* GET /api/listings/admin/:id/enquiries — buyer interest on one listing. */
router.get('/admin/:id/enquiries', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM listing_enquiries WHERE listing_id = $1 ORDER BY created_at DESC`,
      [Number.parseInt(req.params.id, 10)]
    );
    return res.json({ enquiries: rows });
  } catch (err) {
    console.error('GET /listings/admin/:id/enquiries error:', err);
    return res.status(500).json({ error: 'Could not load enquiries.' });
  }
});

/** Columns an admin may edit directly, and how to coerce each one. */
const EDITABLE = {
  title: (v) => clean(v),
  address: (v) => clean(v, 500),
  area: (v) => clean(v),
  city: (v) => clean(v, 120),
  state: (v) => clean(v, 80),
  country: (v) => clean(v, 120),
  currency: (v) => (/^[A-Z]{3}$/.test(String(v || '').toUpperCase()) ? String(v).toUpperCase() : null),
  property_type: (v) => clean(v, 80),
  beds: (v) => clean(v, 20),
  baths: (v) => clean(v, 20),
  size_label: (v) => clean(v, 120),
  description: (v) => (typeof v === 'string' ? v.trim() : null),
  list_price: num,
  offer_amount: num,
  valuation_low: num,
  valuation_high: num,
  condition_score: (v) => (num(v) === null ? null : Math.round(num(v))),
  admin_note: (v) => (typeof v === 'string' ? v.trim() : null),
  customer_note: (v) => (typeof v === 'string' ? v.trim() : null),
  reviewed_by: (v) => clean(v),
  units_available: (v) => (num(v) === null ? null : Math.max(0, Math.round(num(v)))),
  featured: (v) => Boolean(v),
  route: (v) => (['private', 'owner_listed', 'company_owned'].includes(v) ? v : null),
  // Rentals.
  unit_label: (v) => clean(v, 80),
  rent_frequency: (v) => (RENT_FREQUENCIES.includes(v) ? v : null),
  service_charge: num,
  caution_deposit: num,
  available_from: dateOrNull,
  furnished: (v) => clean(v, 20),
  features: (v) => JSON.stringify(Array.isArray(v) ? v.map((x) => clean(String(x), 120)).filter(Boolean).slice(0, 30) : []),
};

const STATUSES = ['draft', 'submitted', 'reviewing', 'pending_review', 'offer_made', 'bought', 'live', 'sold', 'let', 'withdrawn', 'rejected'];

/* PATCH /api/listings/admin/:id — edit the listing and/or move it along the pipeline. */
router.patch('/admin/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'A listing id is required.' });

  try {
    const { rows: currentRows } = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (!currentRows.length) return res.status(404).json({ error: 'Listing not found.' });
    const current = currentRows[0];
    const body = req.body || {};
    if ('currency' in body && !/^[A-Z]{3}$/.test(String(body.currency || '').toUpperCase())) {
      return res.status(400).json({ error: 'Choose a valid three-letter currency.' });
    }
    if ('route' in body && !['private', 'owner_listed', 'company_owned', 'agent_listed'].includes(body.route)) {
      return res.status(400).json({ error: 'Choose a valid route to market.' });
    }
    if ('condition_score' in body) {
      const score = num(body.condition_score);
      if (score !== null && (score < 0 || score > 100)) {
        return res.status(400).json({ error: 'Condition score must be between 0 and 100.' });
      }
    }
    const next = 'status' in body ? body.status : null;

    // A draft is ours, not the owner's: only their own confirmation moves it
    // on. We can still edit it, or drop it.
    if (current.status === 'draft' && next && !['draft', 'withdrawn', 'rejected'].includes(next)) {
      return res.status(400).json({ error: 'The owner has not confirmed this listing yet. Send them the confirmation link.' });
    }
    if (next === 'draft' && current.status !== 'draft') {
      return res.status(400).json({ error: 'A listing the owner has signed cannot go back to draft.' });
    }
    // "Owned by EasyMoveZone" is a claim to buyers, so it needs the purchase on
    // record first: only the 'bought' step sets bought_at.
    if (body.route === 'company_owned' && current.route !== 'company_owned' && !current.bought_at && next !== 'bought') {
      return res.status(400).json({ error: 'Mark the property as bought before listing it as owned by EasyMoveZone.' });
    }
    if (next === 'bought' && 'route' in body && body.route !== 'company_owned') {
      return res.status(400).json({ error: 'A property we bought is sold as owned by EasyMoveZone.' });
    }

    const sets = [];
    const params = [];

    for (const [key, coerce] of Object.entries(EDITABLE)) {
      if (!(key in body)) continue;
      params.push(coerce(body[key]));
      sets.push(`${key} = $${params.length}`);
    }

    if (next !== null) {
      if (!STATUSES.includes(next)) return res.status(400).json({ error: 'Unknown status.' });

      if (next === 'offer_made') {
        const offerAmount = 'offer_amount' in body ? num(body.offer_amount) : num(current.offer_amount);
        if (current.intent !== 'buyout') {
          return res.status(400).json({ error: 'Purchase offers can only be issued for a purchase-offer request.' });
        }
        if (!offerAmount || offerAmount <= 0) {
          return res.status(400).json({ error: 'Enter a positive offer amount before issuing the offer.' });
        }
        sets.push('offer_issued_at = NOW()');
        // Issuing the offer is the admin saying inspection and title
        // verification are done; the completion window starts now.
        sets.push(`purchase_by = NOW() + INTERVAL '${PURCHASE_DAYS} days'`);
      }

      if (next === 'bought') {
        const offerAmount = 'offer_amount' in body ? num(body.offer_amount) : num(current.offer_amount);
        if (!['offer_made', 'bought'].includes(current.status)) {
          return res.status(400).json({ error: 'Issue a purchase offer before marking the property as bought.' });
        }
        if (!offerAmount || offerAmount <= 0) {
          return res.status(400).json({ error: 'Record what we paid before marking the property as bought.' });
        }
        if (!('route' in body)) sets.push(`route = 'company_owned'`);
        sets.push('bought_at = COALESCE(bought_at, NOW())');
      }

      const isRent = current.listing_type === 'rent';
      const isAgent = (body.route || current.route) === 'agent_listed';
      if (next === 'sold' && isRent) return res.status(400).json({ error: 'A rental is marked let, not sold.' });
      if (next === 'let' && !isRent) return res.status(400).json({ error: 'Only a rental can be marked let.' });
      if (['offer_made', 'bought'].includes(next) && isRent) {
        return res.status(400).json({ error: 'Purchase offers do not apply to a rental.' });
      }

      if (next === 'live' && isAgent) {
        const listPrice = 'list_price' in body ? num(body.list_price) : num(current.list_price || current.guide_price);
        if (!listPrice || listPrice <= 0) {
          return res.status(400).json({ error: 'Enter a positive list price before publishing.' });
        }
        sets.push('publish_consent = true');
        sets.push('published_at = COALESCE(published_at, NOW())');
      } else if (next === 'live' && isRent) {
        // A rental's consent lives on the managed property, and the owner can
        // switch it off at any time from their console — so read it now.
        // "Owned by EasyMoveZone" needs the purchase on record (bought_at), as for sales.
        const routeNow = body.route || current.route;
        let consented = routeNow === 'company_owned' && Boolean(current.bought_at);
        if (!consented && current.management_request_id) {
          const { rows: mgmt } = await pool.query(
            'SELECT advertise_consent, status FROM management_requests WHERE id = $1',
            [current.management_request_id]
          );
          if (mgmt[0] && ['ended', 'cancelled'].includes(mgmt[0].status)) {
            return res.status(400).json({ error: 'That property is no longer under management.' });
          }
          consented = Boolean(mgmt[0]?.advertise_consent);
        }
        const rent = 'list_price' in body ? num(body.list_price) : num(current.list_price);
        if (!consented) {
          return res.status(400).json({
            error: 'The owner has not allowed us to advertise this property. Ask them to switch it on in their Manage console.',
          });
        }
        if (!rent || rent <= 0) return res.status(400).json({ error: 'Enter a positive rent before publishing.' });
        sets.push('publish_consent = true');
        sets.push('published_at = COALESCE(published_at, NOW())');
      } else if (next === 'live') {
        const routeNow = body.route || current.route;
        const owned = routeNow === 'company_owned' && Boolean(current.bought_at);
        if (routeNow === 'company_owned' && !owned) {
          return res.status(400).json({ error: 'Mark the property as bought before listing it as owned by EasyMoveZone.' });
        }
        const consented = (current.publish_consent && current.owner_confirmed && current.consent) || owned;
        const listPrice = 'list_price' in body ? num(body.list_price) : num(current.list_price || current.guide_price);
        if (!consented) {
          return res.status(400).json({
            error: 'This owner has not agreed to a public listing. Buy the property, or ask them to consent, before publishing.',
          });
        }
        if (routeNow === 'private') {
          return res.status(400).json({ error: 'Choose who is selling the property before publishing.' });
        }
        if (!listPrice || listPrice <= 0) {
          return res.status(400).json({ error: 'Enter a positive list price before publishing.' });
        }
        sets.push('published_at = COALESCE(published_at, NOW())');
      }
      if (next === 'sold') sets.push('sold_at = COALESCE(sold_at, NOW())');
      if (next === 'let') sets.push('let_at = COALESCE(let_at, NOW())');

      params.push(next);
      sets.push(`status = $${params.length}`);
    }

    if (!sets.length) return res.status(400).json({ error: 'Nothing to update.' });

    sets.push('updated_at = NOW()');
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE listings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Listing not found.' });
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('PATCH /listings/admin/:id error:', err);
    return res.status(500).json({ error: 'Could not update the listing.' });
  }
});

/* PATCH /api/listings/admin/enquiries/:id — move a buyer enquiry along. */
router.patch('/admin/enquiries/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { status, admin_note: note } = req.body || {};
  const allowed = ['new', 'contacted', 'viewing_booked', 'offer_made', 'closed'];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  try {
    const { rows } = await pool.query(
      `UPDATE listing_enquiries
          SET status = COALESCE($1, status), admin_note = COALESCE($2, admin_note)
        WHERE id = $3 RETURNING *`,
      [status || null, typeof note === 'string' ? note.trim() : null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Enquiry not found.' });
    return res.json({ enquiry: rows[0] });
  } catch (err) {
    console.error('PATCH /listings/admin/enquiries/:id error:', err);
    return res.status(500).json({ error: 'Could not update the enquiry.' });
  }
});

/* DELETE /api/listings/admin/:id — remove a submission outright. */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM listings WHERE id = $1', [Number.parseInt(req.params.id, 10)]);
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /listings/admin/:id error:', err);
    return res.status(500).json({ error: 'Could not delete the listing.' });
  }
});

/* ── Admin: rentals ──────────────────────────────────────────────── */

/*
 * GET /api/listings/admin/rentals/candidates — managed properties that could
 * be advertised: still under management, not fully tenanted, with the owner's
 * advertise consent and any rental already open against them.
 */
router.get('/admin/rentals/candidates', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.id, m.ref, m.title, m.address, m.area, m.city, m.state, m.country, m.property_type,
              m.units, m.bedrooms, m.furnished, m.letting_status, m.expected_rent, m.currency,
              m.status, m.advertise_consent, m.advertise_consent_at, m.contact_name, m.contact_email,
              m.media, m.description, m.created_at,
              (SELECT COUNT(*)::int FROM management_tenancies t
                WHERE t.request_id = m.id AND t.status IN ('active','notice')) AS active_tenancies,
              (SELECT COUNT(*)::int FROM listings l
                WHERE l.management_request_id = m.id AND l.listing_type = 'rent'
                  AND l.status IN ('submitted','reviewing','live')) AS open_rentals
         FROM management_requests m
        WHERE m.status NOT IN ('ended','cancelled')
        ORDER BY m.advertise_consent DESC, (m.letting_status = 'vacant') DESC, m.created_at DESC
        LIMIT 200`
    );
    return res.json({ properties: rows });
  } catch (err) {
    console.error('GET /listings/admin/rentals/candidates error:', err);
    return res.status(500).json({ error: 'Could not load managed properties.' });
  }
});

/*
 * POST /api/listings/admin/rentals — draft a rental for a managed property.
 * The draft is never public; publishing it goes through PATCH /admin/:id,
 * which checks the owner's advertise consent at that moment.
 */
router.post('/admin/rentals', requireAdmin, async (req, res) => {
  const b = req.body || {};
  const requestId = Number.parseInt(b.managementRequestId, 10);
  if (!requestId) return res.status(400).json({ error: 'Choose the managed property to let.' });
  const rent = num(b.rent);
  if (rent !== null && rent <= 0) return res.status(400).json({ error: 'Rent must be a positive amount.' });

  try {
    const { rows: found } = await pool.query('SELECT * FROM management_requests WHERE id = $1', [requestId]);
    const m = found[0];
    if (!m) return res.status(404).json({ error: 'Managed property not found.' });
    if (['ended', 'cancelled'].includes(m.status)) {
      return res.status(400).json({ error: 'That property is no longer under management.' });
    }

    const ref = makeRef();
    const unit = clean(b.unitLabel, 80);
    const title = clean(b.title)
      || [m.bedrooms ? `${m.bedrooms}-bed` : null, (m.property_type || 'home').toLowerCase(), m.area || m.city]
        .filter(Boolean).join(' ').replace(/^./, (c) => c.toUpperCase());
    const media = Array.isArray(b.media) ? b.media : (Array.isArray(m.media) ? m.media : []);
    const features = Array.isArray(b.features) ? b.features.map((x) => clean(String(x), 120)).filter(Boolean).slice(0, 30) : [];

    const { rows } = await pool.query(
      `INSERT INTO listings (
         ref, slug, owner_email, owner_name, owner_phone,
         title, address, area, city, state, country, property_type, beds, baths, size_label,
         features, description, media, currency, list_price,
         intent, route, publish_consent, owner_confirmed, consent, consent_name,
         status, listing_type, management_request_id, unit_label, rent_frequency,
         service_charge, caution_deposit, available_from, furnished
       ) VALUES (
         $1,$2,$3,$4,$5,
         $6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
         $16,$17,$18,$19,$20,
         'private','owner_listed',$21,$22,$23,$24,
         'reviewing','rent',$25,$26,$27,
         $28,$29,$30,$31
       ) RETURNING *`,
      [
        ref, makeSlug(`${title}${unit ? ` ${unit}` : ''} to rent`, ref),
        m.contact_email, m.contact_name, m.contact_phone,
        title, m.address, m.area, m.city, m.state, m.country,
        clean(b.propertyType, 80) || m.property_type, clean(b.beds, 20) || m.bedrooms, clean(b.baths, 20),
        clean(b.sizeLabel, 120),
        JSON.stringify(features),
        typeof b.description === 'string' && b.description.trim() ? b.description.trim() : m.description,
        JSON.stringify(media), m.currency || DEFAULT_CURRENCY, rent || num(m.expected_rent),
        Boolean(m.advertise_consent), Boolean(m.owner_confirmed), Boolean(m.consent), m.consent_name,
        m.id, unit, RENT_FREQUENCIES.includes(b.rentFrequency) ? b.rentFrequency : 'annual',
        num(b.serviceCharge), num(b.cautionDeposit), dateOrNull(b.availableFrom),
        clean(b.furnished, 20) || m.furnished,
      ]
    );
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('POST /listings/admin/rentals error:', err);
    return res.status(500).json({ error: 'Could not create the rental listing.' });
  }
});

const APPLICATION_STATUSES = ['new', 'contacted', 'viewing_booked', 'vetting', 'approved', 'declined', 'let', 'withdrawn'];

/* GET /api/listings/admin/applications?status=&listingId= — renters waiting on the desk. */
router.get('/admin/applications', requireAdmin, async (req, res) => {
  const where = [];
  const params = [];
  const status = clean(req.query.status);
  const listingId = Number.parseInt(req.query.listingId, 10);
  if (status && APPLICATION_STATUSES.includes(status)) { params.push(status); where.push(`a.status = $${params.length}`); }
  if (listingId) { params.push(listingId); where.push(`a.listing_id = $${params.length}`); }
  try {
    const { rows } = await pool.query(
      `SELECT a.*, l.ref AS listing_ref, l.slug AS listing_slug, l.title AS listing_title,
              l.status AS listing_status, l.list_price, l.rent_frequency, l.caution_deposit,
              l.currency, l.unit_label, l.management_request_id, l.area, l.city, l.state
         FROM rental_applications a
         JOIN listings l ON l.id = a.listing_id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY (a.status = 'new') DESC, a.created_at DESC
        LIMIT 300`,
      params
    );
    return res.json({ applications: rows });
  } catch (err) {
    console.error('GET /listings/admin/applications error:', err);
    return res.status(500).json({ error: 'Could not load applications.' });
  }
});

/* PATCH /api/listings/admin/applications/:id — move an application along. */
router.patch('/admin/applications/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { status, admin_note: note } = req.body || {};
  if (status && !APPLICATION_STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  if (status === 'let') return res.status(400).json({ error: 'Use “Create tenancy” to let the property to this applicant.' });
  try {
    const { rows } = await pool.query(
      `UPDATE rental_applications
          SET status = COALESCE($1, status), admin_note = COALESCE($2, admin_note), updated_at = NOW()
        WHERE id = $3 RETURNING *`,
      [status || null, typeof note === 'string' ? note.trim() : null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found.' });
    return res.json({ application: rows[0] });
  } catch (err) {
    console.error('PATCH /listings/admin/applications/:id error:', err);
    return res.status(500).json({ error: 'Could not update the application.' });
  }
});

/*
 * POST /api/listings/admin/applications/:id/tenancy — let the property to this
 * applicant. In one transaction: the tenancy is recorded on the managed
 * property, the application is marked let, the listing comes off the Rent
 * page, and the owner gets a note in their console.
 */
router.post('/admin/applications/:id/tenancy', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const b = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: found } = await client.query(
      `SELECT a.*, to_char(a.move_in_date, 'YYYY-MM-DD') AS move_in, l.id AS l_id, l.listing_type, l.management_request_id, l.list_price, l.rent_frequency,
              l.caution_deposit, l.currency, l.unit_label, l.title AS listing_title, l.status AS listing_status
         FROM rental_applications a JOIN listings l ON l.id = a.listing_id
        WHERE a.id = $1 FOR UPDATE OF a, l`,
      [id]
    );
    const a = found[0];
    if (!a) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Application not found.' }); }
    if (a.listing_type !== 'rent' || !a.management_request_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This listing is not linked to a managed property.' });
    }
    if (a.tenancy_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'A tenancy already exists for this application.' }); }
    if (a.listing_status === 'let') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'This property has already been let.' }); }

    const rent = num(b.rentAmount) || num(a.list_price);
    if (!rent || rent <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'A rent amount is required.' }); }
    const frequency = RENT_FREQUENCIES.includes(b.rentFrequency) ? b.rentFrequency : (a.rent_frequency || 'annual');
    const startDate = dateOrNull(b.startDate) || dateOrNull(a.move_in);
    const endDate = dateOrNull(b.endDate);

    const { rows: tenancyRows } = await client.query(
      `INSERT INTO management_tenancies
        (request_id, unit_label, tenant_name, tenant_email, tenant_phone,
         rent_amount, rent_frequency, deposit, currency, start_date, end_date, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12)
       RETURNING *`,
      [
        a.management_request_id, clean(b.unitLabel, 80) || a.unit_label, a.full_name, a.email, a.phone,
        rent, frequency, num(b.deposit) ?? num(a.caution_deposit), a.currency || DEFAULT_CURRENCY,
        startDate, endDate, `Let through EasyMoveZone Rent, application ${a.ref}.`,
      ]
    );
    const tenancy = tenancyRows[0];

    await client.query(
      `UPDATE rental_applications SET status = 'let', tenancy_id = $2, updated_at = NOW() WHERE id = $1`,
      [id, tenancy.id]
    );
    await client.query(
      `UPDATE listings SET status = 'let', let_at = COALESCE(let_at, NOW()), updated_at = NOW() WHERE id = $1`,
      [a.l_id]
    );
    const { rows: mgmtRows } = await client.query(
      `UPDATE management_requests
          SET status = CASE WHEN status IN ('new','reviewing','visit_booked','proposal_sent','onboarding')
                            THEN 'active' ELSE status END,
              letting_status = CASE WHEN units <= 1 THEN 'tenanted' ELSE letting_status END,
              updated_at = NOW()
        WHERE id = $1 RETURNING address`,
      [a.management_request_id]
    );
    await client.query(
      `INSERT INTO management_messages (request_id, sender, body, read_by_admin)
       VALUES ($1, 'admin', $2, true)`,
      [a.management_request_id,
        `Good news: ${mgmtRows[0]?.address || 'your property'}${tenancy.unit_label ? ` (${tenancy.unit_label})` : ''} has been let ` +
        `to a vetted tenant${startDate ? ` from ${startDate}` : ''}. The tenancy is now under Operations → Tenancies, ` +
        'and rent will show under Money as it is collected.']
    );
    await client.query('COMMIT');
    return res.json({ success: true, tenancy });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /listings/admin/applications/:id/tenancy error:', err);
    return res.status(500).json({ error: 'Could not create the tenancy.' });
  } finally {
    client.release();
  }
});

/* ── Assisted intake: drafts we type in, owners confirm ──────────── */

const LINK_DAYS = 7;
const MAX_UNITS = 50;
const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const mediaList = (v) => (Array.isArray(v) ? v : [])
  .filter((m) => m && typeof m.url === 'string')
  .map((m) => ({ url: m.url, kind: m.kind === 'video' ? 'video' : 'image' }))
  .slice(0, 40);
const featureList = (v) => (Array.isArray(v) ? v : [])
  .map((f) => clean(f, 120)).filter(Boolean).slice(0, 30);
const unitCount = (v) => (num(v) === null ? null : Math.max(0, Math.round(num(v))));
const clientIp = (req) => String(req.get('x-forwarded-for') || req.ip || '').split(',')[0].trim().slice(0, 64) || null;

/**
 * Issue a fresh single-use link for one draft listing or one project, revoking
 * any earlier link for it. Only the hash is stored; the raw token is returned
 * once, as a path the admin screen turns into a full URL.
 */
async function issueLink(db, { listingId = null, projectId = null, createdBy = null }) {
  const token = crypto.randomBytes(24).toString('base64url');
  await db.query(
    `UPDATE listing_confirmations SET revoked_at = NOW()
      WHERE used_at IS NULL AND revoked_at IS NULL
        AND (listing_id = $1 OR project_id = $2)`,
    [listingId, projectId]
  );
  const { rows } = await db.query(
    `INSERT INTO listing_confirmations (token_hash, listing_id, project_id, created_by, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::interval)
     RETURNING expires_at`,
    [hashToken(token), listingId, projectId, createdBy, String(LINK_DAYS)]
  );
  return { path: `/listings/confirm/${token}`, expiresAt: rows[0].expires_at };
}

/** The property fields a draft or a unit type is built from. */
function draftFields(b) {
  return {
    title: clean(b.title),
    address: clean(b.address, 500),
    area: clean(b.area),
    city: clean(b.city, 120),
    state: clean(b.state, 80),
    country: clean(b.country, 120) || 'Nigeria',
    property_type: clean(b.type, 80),
    beds: clean(b.beds, 20),
    baths: clean(b.baths, 20),
    size_label: clean(b.size, 120),
    description: typeof b.description === 'string' && b.description.trim() ? b.description.trim() : null,
    guide_price: num(b.price),
  };
}

async function insertDraft(db, f, extra) {
  const ref = makeRef();
  const title = f.title || f.address || 'Property';
  const { rows } = await db.query(
    `INSERT INTO listings (
       ref, slug, owner_email, owner_name, owner_phone,
       title, address, area, city, state, country, property_type, beds, baths, size_label,
       features, description, media, currency, guide_price,
       intent, status, assisted_by, project_id, units_available
     ) VALUES (
       $1,$2,$3,$4,$5,
       $6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
       $16,$17,$18,'${DEFAULT_CURRENCY}',$19,
       $20,'draft',$21,$22,$23
     ) RETURNING *`,
    [
      ref, makeSlug(title, ref), extra.email, extra.ownerName, extra.ownerPhone,
      title, f.address, f.area, f.city, f.state, f.country, f.property_type, f.beds, f.baths, f.size_label,
      JSON.stringify(extra.features || []), f.description, JSON.stringify(extra.media || []), f.guide_price,
      extra.intent, extra.assistedBy, extra.projectId || null, extra.units ?? null,
    ]
  );
  return rows[0];
}

/*
 * POST /api/listings/admin/drafts — type a listing in for an owner. It lands at
 * `draft` with every consent flag false, and the response carries the link the
 * owner signs through.
 */
router.post('/admin/drafts', requireAdmin, async (req, res) => {
  const b = req.body || {};
  const email = String(b.ownerEmail || '').trim().toLowerCase();
  if (!clean(b.ownerName)) return res.status(400).json({ error: "The owner's name is required." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "A valid email for the owner is required." });
  if (!clean(b.address)) return res.status(400).json({ error: 'A property address is required.' });
  if (!clean(b.assistedBy)) return res.status(400).json({ error: 'Say who prepared this listing.' });

  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const listing = await insertDraft(db, draftFields(b), {
      email,
      ownerName: clean(b.ownerName),
      ownerPhone: clean(b.ownerPhone, 100),
      features: featureList(b.features),
      media: mediaList(b.media),
      intent: b.intent === 'buyout' ? 'buyout' : 'private',
      assistedBy: clean(b.assistedBy),
    });
    const link = await issueLink(db, { listingId: listing.id, createdBy: clean(b.assistedBy) });
    await db.query('COMMIT');
    return res.json({ listing, link });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('POST /listings/admin/drafts error:', err);
    return res.status(500).json({ error: 'Could not save the draft.' });
  } finally {
    db.release();
  }
});

/*
 * POST /api/listings/admin/projects — a developer's project: the shared
 * details once, then one draft listing per unit type. One link covers it all.
 */
router.post('/admin/projects', requireAdmin, async (req, res) => {
  const p = req.body?.project || {};
  const units = Array.isArray(req.body?.units) ? req.body.units : [];
  const email = String(p.contactEmail || '').trim().toLowerCase();
  const assistedBy = clean(req.body?.assistedBy);
  if (!clean(p.name)) return res.status(400).json({ error: 'The project needs a name.' });
  if (!clean(p.developerName) && !clean(p.contactName)) return res.status(400).json({ error: 'Name the developer or the contact who will sign.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "A valid email for the developer's contact is required." });
  if (!assistedBy) return res.status(400).json({ error: 'Say who prepared this project.' });
  if (!units.length) return res.status(400).json({ error: 'Add at least one unit type.' });
  if (units.length > MAX_UNITS) return res.status(400).json({ error: `A project can have up to ${MAX_UNITS} unit types.` });
  if (units.some((u) => !clean(u?.title) && !clean(u?.type))) {
    return res.status(400).json({ error: 'Give every unit type a name or a property type.' });
  }

  const shared = {
    address: clean(p.address, 500), area: clean(p.area), city: clean(p.city, 120),
    state: clean(p.state, 80), country: clean(p.country, 120) || 'Nigeria',
  };
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { rows: projectRows } = await db.query(
      `INSERT INTO listing_projects (
         ref, name, developer_name, contact_name, contact_email, contact_phone,
         address, area, city, state, country, description, assisted_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        `BVP-${makeRef().slice(4)}`, clean(p.name), clean(p.developerName), clean(p.contactName), email,
        clean(p.contactPhone, 100), shared.address, shared.area, shared.city, shared.state, shared.country,
        typeof p.description === 'string' && p.description.trim() ? p.description.trim() : null, assistedBy,
      ]
    );
    const project = projectRows[0];
    const projectMedia = mediaList(p.media);
    const projectFeatures = featureList(p.features);
    const created = [];
    for (const u of units) {
      const f = draftFields({ ...u, ...shared });
      f.title = clean(u.title) || [clean(u.beds) && `${clean(u.beds)}-bed`, clean(u.type)].filter(Boolean).join(' ');
      f.description = f.description || project.description;
      created.push(await insertDraft(db, f, {
        email,
        ownerName: clean(p.contactName) || clean(p.developerName),
        ownerPhone: clean(p.contactPhone, 100),
        features: [...new Set([...projectFeatures, ...featureList(u.features)])],
        media: [...mediaList(u.media), ...projectMedia].slice(0, 40),
        intent: 'private',
        assistedBy,
        projectId: project.id,
        units: unitCount(u.unitsAvailable) ?? 1,
      }));
    }
    const link = await issueLink(db, { projectId: project.id, createdBy: assistedBy });
    await db.query('COMMIT');
    return res.json({ project, listings: created, link });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('POST /listings/admin/projects error:', err);
    return res.status(500).json({ error: 'Could not save the project.' });
  } finally {
    db.release();
  }
});

/* GET /api/listings/admin/projects — every project, with where its units are. */
router.get('/admin/projects', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
              COUNT(l.id)::int AS unit_types,
              COALESCE(SUM(l.units_available) FILTER (WHERE l.status NOT IN ('withdrawn','rejected','sold')), 0)::int AS units_available,
              COUNT(l.id) FILTER (WHERE l.status = 'draft')::int AS draft_count,
              COUNT(l.id) FILTER (WHERE l.status IN ('submitted','reviewing'))::int AS review_count,
              COUNT(l.id) FILTER (WHERE l.status = 'live')::int AS live_count,
              COUNT(l.id) FILTER (WHERE l.status = 'sold')::int AS sold_count,
              MAX(l.consent_name) AS consent_name,
              MAX(l.consent_at) AS consent_at,
              (SELECT MAX(c.created_at) FROM listing_confirmations c WHERE c.project_id = p.id) AS link_sent_at,
              (SELECT MAX(c.opened_at) FROM listing_confirmations c WHERE c.project_id = p.id) AS link_opened_at
         FROM listing_projects p
         LEFT JOIN listings l ON l.project_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC LIMIT 200`
    );
    return res.json({ projects: rows });
  } catch (err) {
    console.error('GET /listings/admin/projects error:', err);
    return res.status(500).json({ error: 'Could not load projects.' });
  }
});

/* POST /api/listings/admin/projects/:id/link — a new link for a project still awaiting its developer. */
router.post('/admin/projects/:id/link', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM listings WHERE project_id = $1 AND status = 'draft' LIMIT 1`, [id]
    );
    if (!rows.length) return res.status(400).json({ error: 'Nothing in this project is waiting for the developer to confirm.' });
    return res.json({ link: await issueLink(pool, { projectId: id, createdBy: clean(req.body?.createdBy) }) });
  } catch (err) {
    console.error('POST /listings/admin/projects/:id/link error:', err);
    return res.status(500).json({ error: 'Could not create a link.' });
  }
});

/* DELETE /api/listings/admin/projects/:id — only while nothing in it has been published. */
router.delete('/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM listings WHERE project_id = $1 AND status IN ('live','sold','bought') LIMIT 1`, [id]
    );
    if (rows.length) return res.status(400).json({ error: 'Withdraw its live units first; a published project cannot be deleted.' });
    await pool.query('DELETE FROM listings WHERE project_id = $1', [id]);
    await pool.query('DELETE FROM listing_projects WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /listings/admin/projects/:id error:', err);
    return res.status(500).json({ error: 'Could not delete the project.' });
  }
});

/* POST /api/listings/admin/:id/link — a new link for a single draft (a project's units share the project's link). */
router.post('/admin/:id/link', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query('SELECT status, project_id FROM listings WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Listing not found.' });
    if (rows[0].status !== 'draft') return res.status(400).json({ error: 'The owner has already confirmed this listing.' });
    if (rows[0].project_id) return res.status(400).json({ error: 'This unit belongs to a project. Send the project link instead.' });
    return res.json({ link: await issueLink(pool, { listingId: id, createdBy: clean(req.body?.createdBy) }) });
  } catch (err) {
    console.error('POST /listings/admin/:id/link error:', err);
    return res.status(500).json({ error: 'Could not create a link.' });
  }
});

/* ── Owner: confirm a listing we prepared ────────────────────────── */

/** Find a usable link, or say plainly why it is not. */
async function findLink(db, token, { lock = false } = {}) {
  const { rows } = await db.query(
    `SELECT * FROM listing_confirmations WHERE token_hash = $1 ${lock ? 'FOR UPDATE' : ''}`,
    [hashToken(token)]
  );
  const link = rows[0];
  if (!link) return { error: 'This link is not valid. Check you copied all of it, or ask us for a new one.', code: 404 };
  if (link.used_at) return { error: 'This listing has already been confirmed. Thank you, there is nothing more to do.', code: 410 };
  if (link.revoked_at) return { error: 'A newer link was sent for this listing. Please use the most recent one.', code: 410 };
  if (new Date(link.expires_at) < new Date()) return { error: 'This link has expired. Ask us to send a new one.', code: 410 };
  return { link };
}

/** Owners see their own photos through short-lived signed URLs. */
async function withViews(media) {
  if (!storageConfigured()) return media;
  return Promise.all((media || []).map(async (m) => {
    try { return { ...m, view: (await createReadSas(m.url)).url }; } catch { return m; }
  }));
}

const OWNER_VIEW = (l) => ({
  id: l.id, ref: l.ref, title: l.title, address: l.address, area: l.area, city: l.city,
  state: l.state, country: l.country, property_type: l.property_type, beds: l.beds, baths: l.baths,
  size_label: l.size_label, features: l.features, description: l.description, currency: l.currency,
  guide_price: l.guide_price, units_available: l.units_available, intent: l.intent,
});

/* GET /api/listings/confirm/:token — what the owner is being asked to sign. */
router.get('/confirm/:token', async (req, res) => {
  try {
    const { link, error, code } = await findLink(pool, req.params.token);
    if (error) return res.status(code).json({ error });

    if (link.listing_id) {
      const { rows } = await pool.query(`SELECT * FROM listings WHERE id = $1 AND status = 'draft'`, [link.listing_id]);
      if (!rows.length) return res.status(410).json({ error: 'This listing is no longer waiting for you. Contact us if that is a surprise.' });
      const l = rows[0];
      await pool.query('UPDATE listing_confirmations SET opened_at = COALESCE(opened_at, NOW()) WHERE id = $1', [link.id]);
      return res.json({
        kind: 'listing',
        expiresAt: link.expires_at,
        owner: { name: l.owner_name, email: l.owner_email, phone: l.owner_phone },
        listing: { ...OWNER_VIEW(l), media: await withViews(l.media) },
      });
    }

    const { rows: projectRows } = await pool.query('SELECT * FROM listing_projects WHERE id = $1', [link.project_id]);
    const { rows: units } = await pool.query(
      `SELECT * FROM listings WHERE project_id = $1 AND status = 'draft' ORDER BY id`, [link.project_id]
    );
    if (!projectRows.length || !units.length) {
      return res.status(410).json({ error: 'This project is no longer waiting for you. Contact us if that is a surprise.' });
    }
    const p = projectRows[0];
    await pool.query('UPDATE listing_confirmations SET opened_at = COALESCE(opened_at, NOW()) WHERE id = $1', [link.id]);
    return res.json({
      kind: 'project',
      expiresAt: link.expires_at,
      owner: { name: p.contact_name || p.developer_name, email: p.contact_email, phone: p.contact_phone },
      project: {
        ref: p.ref, name: p.name, developer_name: p.developer_name, address: p.address, area: p.area,
        city: p.city, state: p.state, country: p.country, description: p.description,
      },
      units: await Promise.all(units.map(async (u) => ({ ...OWNER_VIEW(u), media: await withViews(u.media) }))),
    });
  } catch (err) {
    console.error('GET /listings/confirm/:token error:', err);
    return res.status(500).json({ error: 'Could not load this listing.' });
  }
});

/*
 * POST /api/listings/confirm/:token — the owner corrects anything wrong and
 * signs. The same three things the Sell form asks for are required here; the
 * draft then joins the normal pipeline at `submitted`.
 */
router.post('/confirm/:token', async (req, res) => {
  const b = req.body || {};
  if (!b.ownerConfirmed || !b.consent || !clean(b.consentName)) {
    return res.status(400).json({ error: 'Please confirm you own the property, agree to the authorization and type your full name.' });
  }
  const note = typeof b.note === 'string' && b.note.trim() ? b.note.trim().slice(0, 4000) : null;
  const signed = [clean(b.consentName), Boolean(b.publishConsent), clientIp(req), note];

  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { link, error, code } = await findLink(db, req.params.token, { lock: true });
    if (error) { await db.query('ROLLBACK'); return res.status(code).json({ error }); }

    if (link.listing_id) {
      const intent = b.intent === 'buyout' ? 'buyout' : 'private';
      if (intent === 'private' && !b.publishConsent) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'To have us sell it for you, tick the box that lets us list it publicly.' });
      }
      const d = b.details || {};
      const { rowCount } = await db.query(
        `UPDATE listings SET
           title = COALESCE($5, title), address = COALESCE($6, address), area = COALESCE($7, area),
           city = COALESCE($8, city), state = COALESCE($9, state), beds = COALESCE($10, beds),
           baths = COALESCE($11, baths), size_label = COALESCE($12, size_label),
           guide_price = COALESCE($13, guide_price), description = COALESCE($14, description),
           owner_phone = COALESCE($15, owner_phone), intent = $16,
           owner_confirmed = true, consent = true, consent_name = $1, publish_consent = $2,
           consent_via = 'owner_link', consent_at = NOW(), consent_ip = $3, owner_note = $4,
           status = 'submitted', updated_at = NOW()
         WHERE id = $17 AND status = 'draft'`,
        [
          ...signed,
          clean(d.title), clean(d.address, 500), clean(d.area), clean(d.city, 120), clean(d.state, 80),
          clean(d.beds, 20), clean(d.baths, 20), clean(d.size, 120), num(d.price),
          typeof d.description === 'string' && d.description.trim() ? d.description.trim() : null,
          clean(b.phone, 100), intent, link.listing_id,
        ]
      );
      if (!rowCount) {
        await db.query('ROLLBACK');
        return res.status(410).json({ error: 'This listing is no longer waiting for you. Contact us if that is a surprise.' });
      }
    } else {
      if (!b.publishConsent) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'To have us sell these units, tick the box that lets us list them publicly.' });
      }
      const edits = new Map((Array.isArray(b.units) ? b.units : []).map((u) => [Number(u.id), u]));
      const { rows: units } = await db.query(
        `SELECT id FROM listings WHERE project_id = $1 AND status = 'draft' FOR UPDATE`, [link.project_id]
      );
      if (!units.length) {
        await db.query('ROLLBACK');
        return res.status(410).json({ error: 'This project is no longer waiting for you. Contact us if that is a surprise.' });
      }
      for (const { id } of units) {
        const e = edits.get(id) || {};
        const available = unitCount(e.unitsAvailable);
        await db.query(
          `UPDATE listings SET
             guide_price = COALESCE($5, guide_price), units_available = COALESCE($6, units_available),
             owner_phone = COALESCE($7, owner_phone),
             owner_confirmed = true, consent = true, consent_name = $1, publish_consent = $2,
             consent_via = 'owner_link', consent_at = NOW(), consent_ip = $3, owner_note = $4,
             status = CASE WHEN $6::int = 0 THEN 'withdrawn' ELSE 'submitted' END, updated_at = NOW()
           WHERE id = $8`,
          [...signed, num(e.price), available, clean(b.phone, 100), id]
        );
      }
    }

    await db.query('UPDATE listing_confirmations SET used_at = NOW() WHERE id = $1', [link.id]);
    await db.query('COMMIT');
    return res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('POST /listings/confirm/:token error:', err);
    return res.status(500).json({ error: 'Could not record your confirmation. Please try again.' });
  } finally {
    db.release();
  }
});

/* ── Public: one listing, and buyer enquiries ────────────────────── */

/* GET /api/listings/:idOrSlug — a single live listing. */
router.get('/:idOrSlug', async (req, res) => {
  const key = String(req.params.idOrSlug || '');
  // Only an all-digit key is an id: slugs often start with a number
  // ("3-bed-flat-…"), and parseInt would read that as listing 3.
  const asId = /^\d+$/.test(key) ? Number(key) : null;
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM listings
        WHERE status = 'live' AND listing_type = '${PUBLIC_MODE}' AND (slug = $1 ${asId ? 'OR id = $2' : ''})
        LIMIT 1`,
      asId ? [key, asId] : [key]
    );
    if (!rows.length) return res.status(404).json({ error: 'That property is not available.' });
    // The neighbourhood page for where it is, when we have one (/areas/:slug).
    return res.json({ listing: { ...rows[0], area_slug: (await areaForPlace(rows[0]))?.slug || null } });
  } catch (err) {
    console.error('GET /listings/:idOrSlug error:', err);
    return res.status(500).json({ error: 'Could not load that property.' });
  }
});

/* POST /api/listings/:id/enquiry — a buyer asks about a live listing. */
router.post('/:id/enquiry', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { name, email, phone, message, viewing, preferredAt, preferredWindow } = req.body || {};
  if (!clean(name) || !EMAIL_RE.test(String(email || '').trim())) {
    return res.status(400).json({ error: 'Your name and a valid email are required.' });
  }
  try {
    const { rateLimit } = require('../services/rateLimit');
    await rateLimit('listing-enquiry', String(email).trim().toLowerCase(), 8, 60 * 60 * 1000);
    const { rows: live } = await pool.query(
      `SELECT id, title, slug, route, agency_id FROM listings WHERE id = $1 AND status = 'live'`, [id]
    );
    if (!live.length) return res.status(404).json({ error: 'That property is not available.' });
    const listing = live[0];
    const agencyId = listing.route === 'agent_listed' ? listing.agency_id : null;
    const kind = viewing ? 'viewing' : 'enquiry';

    const { rows } = await pool.query(
      `INSERT INTO listing_enquiries (listing_id, name, email, phone, message, kind, agency_id, preferred_at, preferred_window)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, created_at`,
      [
        id, clean(name), String(email).trim().toLowerCase(), clean(phone, 100),
        typeof message === 'string' ? message.trim().slice(0, 4000) : null,
        kind, agencyId, preferredAt ? new Date(preferredAt) : null, clean(preferredWindow, 40),
      ]
    );

    if (viewing && agencyId) {
      await pool.query(
        `INSERT INTO listing_viewings (listing_id, agency_id, name, email, phone, preferred_at, preferred_window, message)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          id, agencyId, clean(name), String(email).trim().toLowerCase(), clean(phone, 100),
          preferredAt ? new Date(preferredAt) : null, clean(preferredWindow, 40),
          typeof message === 'string' ? message.trim().slice(0, 4000) : null,
        ]
      );
    }

    if (agencyId) {
      const { later } = require('../services/notify');
      const { notifyAgency } = require('../services/agent');
      later(() => notifyAgency({
        agencyId,
        kind: viewing ? 'viewing' : 'enquiry',
        title: viewing ? `Viewing request: ${listing.title}` : `New enquiry: ${listing.title}`,
        body: `${clean(name)} asked about ${listing.title}.`,
        link: '/portal/agent/inbox',
      }));
    }

    const ref = `ENQ-${String(rows[0].id).padStart(5, '0')}`;
    return res.json({ success: true, id: rows[0].id, ref });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('POST /listings/:id/enquiry error:', err);
    return res.status(500).json({ error: 'Could not send your enquiry. Please try again.' });
  }
});

const ID_TYPES = ['NIN', 'International passport', "Driver's licence", "Voter's card", 'Other'];

/* POST /api/listings/:id/apply — a renter applies for a live rental. */
router.post('/:id/apply', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!clean(b.fullName) || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Your full name and a valid email are required.' });
  }
  if (!clean(b.phone, 100)) return res.status(400).json({ error: 'A phone number is required so we can arrange a viewing.' });
  if (!b.screeningConsent) {
    return res.status(400).json({ error: 'Please agree to the identity, employment and reference checks.' });
  }
  const household = Number.parseInt(b.householdSize, 10);
  try {
    const { rateLimit } = require('../services/rateLimit');
    await rateLimit('listing-apply', email, 6, 60 * 60 * 1000);
    const { rows: live } = await pool.query(
      `SELECT id, title, route, agency_id FROM listings WHERE id = $1 AND status = 'live' AND listing_type = 'rent'`, [id]
    );
    if (!live.length) return res.status(404).json({ error: 'That home is no longer available to rent.' });
    const listing = live[0];

    const ref = `BVR-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 900) + 100}`;
    const { rows } = await pool.query(
      `INSERT INTO rental_applications (
         ref, listing_id, full_name, email, phone, occupation, employer, income_band, household_size,
         move_in_date, current_address, id_type, reference_name, reference_phone,
         viewing_date, viewing_window, message, screening_consent
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,true)
       RETURNING id, ref, created_at`,
      [
        ref, id, clean(b.fullName), email, clean(b.phone, 100), clean(b.occupation), clean(b.employer),
        clean(b.incomeBand, 40), Number.isFinite(household) && household > 0 ? Math.min(household, 30) : null,
        dateOrNull(b.moveInDate), clean(b.currentAddress, 500),
        ID_TYPES.includes(b.idType) ? b.idType : null, clean(b.referenceName), clean(b.referencePhone, 100),
        dateOrNull(b.viewingDate), clean(b.viewingWindow, 40),
        typeof b.message === 'string' ? b.message.trim().slice(0, 4000) : null,
      ]
    );

    if (listing.route === 'agent_listed' && listing.agency_id) {
      const summary = [
        `Rental application ${ref}.`,
        clean(b.occupation) ? `Occupation: ${clean(b.occupation)}.` : '',
        clean(b.incomeBand, 40) ? `Income: ${clean(b.incomeBand, 40)}.` : '',
        dateOrNull(b.moveInDate) ? `Move-in: ${dateOrNull(b.moveInDate)}.` : '',
        typeof b.message === 'string' && b.message.trim() ? b.message.trim().slice(0, 1500) : '',
      ].filter(Boolean).join(' ');
      await pool.query(
        `INSERT INTO listing_enquiries (listing_id, name, email, phone, message, kind, agency_id, preferred_at, preferred_window)
         VALUES ($1,$2,$3,$4,$5,'application',$6,$7,$8)`,
        [
          id, clean(b.fullName), email, clean(b.phone, 100), summary, listing.agency_id,
          dateOrNull(b.viewingDate) ? new Date(`${dateOrNull(b.viewingDate)}T12:00:00Z`) : null,
          clean(b.viewingWindow, 40),
        ]
      );
      const { later } = require('../services/notify');
      const { notifyAgency } = require('../services/agent');
      later(() => notifyAgency({
        agencyId: listing.agency_id,
        kind: 'application',
        title: `Rental application: ${listing.title}`,
        body: `${clean(b.fullName)} applied for ${listing.title}.`,
        link: '/portal/agent/inbox',
      }));
    }

    return res.json({ success: true, ...rows[0] });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('POST /listings/:id/apply error:', err);
    return res.status(500).json({ error: 'Could not send your application. Please try again.' });
  }
});

/* ── Owner: submit a property through EasyOffer ─────────────────── */

/*
 * POST /api/listings — the EasyOffer form posts here. Nothing is public: the
 * row lands at `submitted` and waits for an admin, whatever the owner ticked.
 */
router.post('/', async (req, res) => {
  const b = req.body || {};
  const email = String(b.contactEmail || '').trim().toLowerCase();

  if (!clean(b.address)) return res.status(400).json({ error: 'A property address is required.' });
  if (!clean(b.country)) return res.status(400).json({ error: 'The property country is required.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email address is required.' });
  if (!b.currency) b.currency = DEFAULT_CURRENCY; // Nigeria-first: naira unless a market says otherwise
  if (!/^[A-Z]{3}$/.test(String(b.currency || '').toUpperCase())) return res.status(400).json({ error: 'A valid three-letter currency is required.' });
  if (!b.ownerConfirmed || !b.consent || !clean(b.consentName)) {
    return res.status(400).json({ error: 'The owner authorization must be confirmed and signed.' });
  }

  const intent = ['renovate', 'private', 'buyout'].includes(b.intent) ? b.intent : 'private';
  if (intent === 'private' && !b.publishConsent) {
    return res.status(400).json({ error: 'Permission to publish is required when asking EasyMoveZone to list the property.' });
  }
  const currency = String(b.currency).toUpperCase();
  const ref = makeRef();
  const title = clean(b.title) || clean(b.address);
  const insight = b.insight && typeof b.insight === 'object' ? b.insight : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO listings (
         ref, slug, owner_email, owner_name, owner_phone, session_id,
         title, address, area, city, state, country, property_type, beds, baths, size_label,
         features, description, media, currency, guide_price, valuation_low, valuation_high,
         condition_score, insight, intent, publish_consent,
         owner_confirmed, consent, consent_name, consent_via, consent_at, consent_ip,
         title_documents
       ) VALUES (
         $1,$2,$3,$4,$5,$6,
         $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
         $17,$18,$19,$20,$21,$22,$23,
         $24,$25,$26,$27,
         true, true, $28, 'self', NOW(), $29,
         $30
       ) RETURNING id, ref, slug, status, created_at`,
      [
        ref, makeSlug(title, ref), email, clean(b.contactName), clean(b.phone, 100), clean(b.sessionId),
        title, clean(b.address, 500), clean(b.area), clean(b.city, 120), clean(b.state, 80), clean(b.country, 120),
        clean(b.type, 80), clean(b.beds, 20), clean(b.baths, 20), clean(b.size, 120),
        JSON.stringify(Array.isArray(b.features) ? b.features : []),
        typeof b.description === 'string' ? b.description.trim() : null,
        JSON.stringify(Array.isArray(b.media) ? b.media : []),
        currency, num(b.price), num(insight?.valuationLow), num(insight?.valuationHigh),
        insight?.conditionScore === undefined ? null : num(insight.conditionScore),
        insight ? JSON.stringify(insight) : null,
        intent, Boolean(b.publishConsent),
        clean(b.consentName), clientIp(req),
        JSON.stringify(normalizeTitleDocuments(b.titleDocuments)),
      ]
    );
    return res.json({ success: true, ...rows[0] });
  } catch (err) {
    console.error('POST /listings error:', err);
    return res.status(500).json({ error: 'Could not submit your property. Please try again.' });
  }
});

module.exports = router;
