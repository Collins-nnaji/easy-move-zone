const express = require('express');
const { pool } = require('../db');
const { isConfigured: storageConfigured } = require('../services/blobStorage');

const router = express.Router();
const { requireAdmin } = require('../auth');

router.use(requireAdmin);

/* Each count is what is waiting on the team in one admin section. */
const COUNTS = {
  passports_new: `SELECT COUNT(*)::int FROM passport_requests WHERE status IN ('submitted','scope_review')`,
  passports_unpaid: `SELECT COUNT(*)::int FROM passport_requests WHERE status = 'payment_due' AND payment_status = 'pending'`,
  passports_active: `SELECT COUNT(*)::int FROM passport_requests WHERE status IN ('in_progress','action_required')`,
  consultations_new: `SELECT COUNT(*)::int FROM consultations WHERE status = 'requested'`,
  listings_review: `SELECT COUNT(*)::int FROM listings WHERE status IN ('submitted','reviewing') AND listing_type = 'sale'`,
  listings_live: `SELECT COUNT(*)::int FROM listings WHERE status = 'live' AND listing_type = 'sale'`,
  listings_awaiting_owner: `SELECT COUNT(*)::int FROM listings WHERE status = 'draft'`,
  enquiries_new: `SELECT COUNT(*)::int FROM listing_enquiries e JOIN listings l ON l.id = e.listing_id
                   WHERE e.status = 'new' AND l.listing_type = 'sale'`,
  rental_enquiries_new: `SELECT COUNT(*)::int FROM listing_enquiries e JOIN listings l ON l.id = e.listing_id
                          WHERE e.status = 'new' AND l.listing_type = 'rent'`,
  rental_applications_new: `SELECT COUNT(*)::int FROM rental_applications WHERE status = 'new'`,
  rentals_ready: `SELECT COUNT(*)::int FROM management_requests m
                   WHERE m.advertise_consent AND m.status NOT IN ('ended','cancelled')
                     AND m.letting_status <> 'tenanted'
                     AND NOT EXISTS (SELECT 1 FROM listings l WHERE l.management_request_id = m.id
                                       AND l.listing_type = 'rent' AND l.status IN ('submitted','reviewing','live'))`,
  rentals_live: `SELECT COUNT(*)::int FROM listings WHERE status = 'live' AND listing_type = 'rent'`,
  management_new: `SELECT COUNT(*)::int FROM management_requests WHERE status = 'new'`,
  management_messages: `SELECT COUNT(*)::int FROM management_messages WHERE sender = 'customer' AND read_by_admin = false`,
  tenant_requests_new: `SELECT COUNT(*)::int FROM tenant_requests WHERE status = 'new'`,
  rent_overdue: `SELECT COUNT(*)::int FROM management_rent_charges WHERE status = 'overdue'`,
  rent_paid_online_week: `SELECT COUNT(*)::int FROM rent_payments WHERE credited AND paid_at > NOW() - INTERVAL '7 days'`,
  tenant_requests_urgent: `SELECT COUNT(*)::int FROM tenant_requests WHERE status IN ('new','in_progress','scheduled') AND urgency = 'urgent'`,
  expenses_pending: `SELECT COUNT(*)::int FROM management_expenses WHERE status = 'pending'`,
  renovations_new: `SELECT COUNT(*)::int FROM renovation_requests WHERE status = 'new'`,
  renovation_messages: `SELECT COUNT(*)::int FROM renovation_messages WHERE sender = 'customer' AND read_by_admin = false`,
  messages_new: `SELECT COUNT(*)::int FROM leads WHERE status = 'new' AND COALESCE(service, '') <> 'property_alert'`,
  alerts_new: `SELECT COUNT(*)::int FROM leads WHERE status = 'new' AND service = 'property_alert'`,
  plan_matches_week: `SELECT COUNT(*)::int FROM landlord_profiles WHERE created_at > NOW() - INTERVAL '7 days'`,
  // Moving (EasyMoveZone's moving tables, same database).
  moves_new: `SELECT COUNT(*)::int FROM emz_moves WHERE data->>'status' = 'requested'`,
  moves_active: `SELECT COUNT(*)::int FROM emz_moves WHERE data->>'status' IN ('quoted', 'scheduled', 'arriving', 'arrived', 'loaded', 'transit')`,
  moving_enquiries_new: `SELECT COUNT(*)::int FROM contact_submissions c LEFT JOIN emz_enquiry_states s ON s.id = c.id::text
                          WHERE COALESCE(s.status, CASE WHEN c.status = 'new' THEN 'new' ELSE 'seen' END) = 'new'`,
};

/* GET /api/admin/whoami — lets the admin page open on a staff member's own sign-in. */
router.get('/whoami', (req, res) => {
  res.json({ actor: req.adminActor, viaKey: req.adminActor === 'admin-key' });
});

/* GET /api/admin/audit?limit= — the latest staff changes, newest first. */
router.get('/audit', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
  try {
    const { rows } = await pool.query(
      'SELECT id, actor, method, path, status, created_at FROM admin_audit ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json({ entries: rows });
  } catch (err) {
    console.error('GET /admin/audit error:', err);
    res.status(500).json({ error: 'Could not load staff activity.' });
  }
});

/* GET /api/admin/summary — the admin Overview: queues plus service health. */
router.get('/summary', async (req, res) => {
  const counts = {};
  await Promise.all(Object.entries(COUNTS).map(async ([key, sql]) => {
    try { counts[key] = (await pool.query(sql)).rows[0].count; } catch { counts[key] = null; }
  }));
  let database = true;
  try { await pool.query('SELECT 1'); } catch { database = false; }
  res.json({
    counts,
    services: {
      database,
      storage: storageConfigured(),
      auth: Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET),
      payments: Boolean(process.env.STRIPE_SECRET_KEY),
      rent_payments: Boolean(process.env.PAYSTACK_SECRET_KEY),
      email: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM),
      sms: Boolean(process.env.TERMII_API_KEY && process.env.TERMII_SENDER_ID),
      staff_signin: true, // EasyMoveZone admin_users allowlist
      ai: Boolean(process.env.OPENAI_API_KEY || ((process.env.AZURE_OPENAI_ENDPOINT || '').trim() && (process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY))),
    },
  });
});

module.exports = router;
