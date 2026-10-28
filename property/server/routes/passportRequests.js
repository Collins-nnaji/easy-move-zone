const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');
const { quoteVerification } = require('../verificationCatalog');

const router = express.Router();
const { requireAdmin, sessionEmail } = require('../auth');
const { DEFAULT_CURRENCY } = require('../markets');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* The steps of a rental check; `passport` is kept as the id of the final report so older requests still read. */
const DEFAULT_CHECKLIST = [
  { id: 'request', label: 'Request received', status: 'complete' },
  { id: 'identity', label: 'Landlord or agent identity', status: 'pending' },
  { id: 'authority', label: 'Right to let the home', status: 'pending' },
  { id: 'inspection', label: 'Visit and condition of the home', status: 'pending' },
  { id: 'agreement', label: 'Tenancy agreement review', status: 'pending' },
  { id: 'rent', label: 'Fair-rent check', status: 'pending' },
  { id: 'risk', label: 'Flooding, security and access', status: 'pending' },
  { id: 'passport', label: 'Rental check report issued', status: 'pending' },
];


function clean(value, max = 500) {
  return value == null ? '' : String(value).trim().slice(0, max);
}

function normalizeDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  return documents
    .filter((d) => d && typeof d.url === 'string' && /^https?:\/\//.test(d.url))
    .map((d) => ({
      url: d.url,
      fileName: clean(d.fileName || 'Document', 200),
      docType: clean(d.docType || 'Property document', 80),
    }))
    .slice(0, 12);
}

function makeReference() {
  const day = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `BV-P-${day}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

/*
 * A rental check is tied to the signed-in account: you sign in before you
 * submit, and every request you make is then listed on the Verify page and in
 * your portal. The contact email is the account's, never a typed one.
 */
const CUSTOMER_COLUMNS = `id, reference, property_label, country, currency, address, property_url, asking_price,
  seller_name, contact_name, contact_email, contact_phone, concerns, documents, status, payment_status,
  checklist, timeline, advisor_note, report_url, verification_type, extras, quoted_fee, created_at, updated_at`;

router.post('/', async (req, res) => {
  const b = req.body || {};
  const accountEmail = await sessionEmail(req);
  if (!accountEmail) {
    return res.status(401).json({ error: 'Sign in to submit your rental check, so you can track it from your account.' });
  }
  const propertyLabel = clean(b.propertyLabel || b.address || b.propertyUrl, 255);
  const country = clean(b.country, 120);
  const currency = (clean(b.currency, 3) || DEFAULT_CURRENCY).toUpperCase(); // verification is priced in the default market's currency
  const contactName = clean(b.contactName, 255);
  const contactEmail = accountEmail;

  if (!propertyLabel || !country || !currency || !contactName || !contactEmail) {
    return res.status(400).json({ error: 'The home, your name and email are required.' });
  }
  if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ error: 'Please choose a valid three-letter currency.' });
  if (!EMAIL_RE.test(contactEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Price the chosen verification type and extras from the server's own list.
  const quote = quoteVerification(clean(b.verificationType, 30), b.extras);
  const checklist = DEFAULT_CHECKLIST.filter((c) => c.id === 'request' || c.id === 'passport' || quote.checks.includes(c.id));

  const now = new Date().toISOString();
  const reference = makeReference();
  const accessToken = crypto.randomBytes(24).toString('hex');
  const timeline = [{
    id: 'submitted',
    title: 'Rental check requested',
    detail: `${quote.type.name} requested — quoted at ₦${quote.total.toLocaleString('en-NG')}.`,
    status: 'complete',
    at: now,
  }];

  try {
    const { rows } = await pool.query(
      `INSERT INTO passport_requests
        (reference, access_token, property_label, country, currency, address, property_url, asking_price, seller_name,
         contact_name, contact_email, contact_phone, concerns, documents, checklist, timeline,
         verification_type, extras, quoted_fee)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING ${CUSTOMER_COLUMNS}`,
      [
        reference,
        accessToken,
        propertyLabel,
        country,
        currency,
        clean(b.address) || null,
        clean(b.propertyUrl, 2000) || null,
        clean(b.askingPrice, 80) || null,
        clean(b.sellerName, 255) || null,
        contactName,
        contactEmail,
        clean(b.contactPhone, 100) || null,
        clean(b.concerns, 5000) || null,
        JSON.stringify(normalizeDocuments(b.documents)),
        JSON.stringify(checklist),
        JSON.stringify(timeline),
        quote.type.id,
        JSON.stringify(quote.extras),
        quote.total,
      ]
    );
    res.json({ success: true, request: rows[0] });
  } catch (err) {
    console.error('POST /passport-requests error:', err);
    res.status(500).json({ error: 'Could not start your rental check. Please try again.' });
  }
});

/* GET /api/passport-requests/mine — every rental check on the signed-in account. */
router.get('/mine', async (req, res) => {
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  try {
    const { rows } = await pool.query(
      `SELECT ${CUSTOMER_COLUMNS} FROM passport_requests WHERE contact_email = $1 ORDER BY created_at DESC`,
      [email]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error('GET /passport-requests/mine error:', err);
    res.status(500).json({ error: 'Could not load your rental checks.' });
  }
});

router.get('/admin', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM passport_requests ORDER BY created_at DESC');
    res.json({ requests: rows });
  } catch (err) {
    console.error('GET /passport-requests/admin error:', err);
    res.status(500).json({ error: 'Could not load rental checks.' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid request id.' });
  const b = req.body || {};
  const allowedStatuses = ['submitted', 'scope_review', 'payment_due', 'in_progress', 'action_required', 'complete', 'cancelled'];
  const status = allowedStatuses.includes(b.status) ? b.status : null;
  const checklist = Array.isArray(b.checklist) ? b.checklist : null;
  try {
    const existingResult = await pool.query('SELECT status, checklist, timeline FROM passport_requests WHERE id = $1', [id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: 'Verification request not found.' });
    const timeline = Array.isArray(b.timeline) ? [...b.timeline] : [...(existing.timeline || [])];
    const previousChecks = new Map((existing.checklist || []).map((c) => [c.id, c.status]));
    (checklist || []).forEach((check) => {
      if (check.status === 'complete' && previousChecks.get(check.id) !== 'complete') {
        timeline.push({
          id: `${check.id}-${Date.now()}`,
          title: check.label,
          detail: 'Independent check completed and added to the case record.',
          status: 'complete',
          at: new Date().toISOString(),
        });
      }
    });
    if (status && status !== existing.status) {
      const statusLabels = {
        scope_review: 'Scope review started', payment_due: 'Scope and payment ready',
        in_progress: 'Checks in progress', action_required: 'Action needed from you',
        complete: 'Rental check report ready', cancelled: 'Rental check cancelled',
      };
      timeline.push({ id: `status-${Date.now()}`, title: statusLabels[status] || 'Case updated', detail: 'Case status updated by your EasyMoveZone adviser.', status: 'complete', at: new Date().toISOString() });
    }
    const { rows } = await pool.query(
      `UPDATE passport_requests SET
         status = COALESCE($2, status),
         payment_status = COALESCE($3, payment_status),
         checklist = COALESCE($4::jsonb, checklist),
         timeline = COALESCE($5::jsonb, timeline),
         advisor_note = COALESCE($6, advisor_note),
         report_url = COALESCE($7, report_url),
         quoted_fee = COALESCE($8, quoted_fee),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id,
        status,
        ['pending', 'paid', 'waived', 'refunded'].includes(b.paymentStatus) ? b.paymentStatus : null,
        checklist ? JSON.stringify(checklist) : null,
        JSON.stringify(timeline),
        b.advisorNote === undefined ? null : clean(b.advisorNote, 5000),
        b.reportUrl === undefined ? null : clean(b.reportUrl, 2000),
        Number(b.quotedFee) > 0 ? Math.round(Number(b.quotedFee)) : null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Verification request not found.' });
    res.json({ request: rows[0] });
  } catch (err) {
    console.error('PATCH /passport-requests/:id error:', err);
    res.status(500).json({ error: 'Could not update the rental check.' });
  }
});

router.post('/:id/checkout', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Online payment is not enabled yet. Your adviser will send a secure payment link after confirming the scope.' });
  }
  const id = Number.parseInt(req.params.id, 10);
  const email = await sessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  if (!id) return res.status(400).json({ error: 'Unknown rental check.' });

  try {
    const { rows } = await pool.query('SELECT * FROM passport_requests WHERE id = $1 AND contact_email = $2', [id, email]);
    const item = rows[0];
    if (!item) return res.status(404).json({ error: 'Verification request not found.' });
    // Verification is priced in naira: charge the quoted fee for this case,
    // falling back to a fixed Stripe price only for older requests without one.
    const currency = DEFAULT_CURRENCY;
    const fee = Number(item.quoted_fee) || 0;
    const priceId = process.env.STRIPE_PASSPORT_PRICE_ID_NGN;
    if (!fee && !priceId) return res.status(503).json({ error: 'Online payment is not enabled yet. Your adviser will send a secure payment link after confirming the scope.' });
    const lineItem = fee
      ? { price_data: { currency: 'ngn', unit_amount: Math.round(fee * 100), product_data: { name: `Rental check ${item.reference}` } }, quantity: 1 }
      : { price: priceId, quantity: 1 };
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [lineItem],
      success_url: `${origin}/check?payment=success#your-verifications`,
      cancel_url: `${origin}/check?payment=cancelled#your-verifications`,
      metadata: { kind: 'property_passport', passport_request_id: String(id), reference: item.reference, currency },
    });
    await pool.query('UPDATE passport_requests SET stripe_session_id = $1, updated_at = NOW() WHERE id = $2', [session.id, id]);
    res.json({ url: session.url });
  } catch (err) {
    console.error('POST /passport-requests/:id/checkout error:', err);
    res.status(500).json({ error: 'Could not open secure checkout.' });
  }
});

module.exports = router;
