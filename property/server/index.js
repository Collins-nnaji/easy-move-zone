/**
 * The property API (listings, verification, management, renovations, admin).
 * In the app it is served by app/api/property/[...path]/route.ts, which hands
 * each request to this Express app with the `/api/property` prefix mapped to
 * `/api`. Sign-in is EasyMoveZone's own Neon Auth at /api/auth — this server
 * has no auth proxy of its own.
 */
const express = require('express');
const { initializeDatabase } = require('./db');
const billingRoutes = require('./routes/billing');
const leadsRoutes    = require('./routes/leads');
const adminRoutes    = require('./routes/admin');
const profileRoutes  = require('./routes/profile');
const consultRoutes = require('./routes/consult');
const landlordRoutes = require('./routes/landlord');
const aiRoutes = require('./routes/ai');
const insightsRoutes = require('./routes/insights');
const renovationsRoutes = require('./routes/renovations');
const managementRoutes = require('./routes/management');
const listingsRoutes = require('./routes/listings');
const mediaRoutes = require('./routes/media');
const passportRequestsRoutes = require('./routes/passportRequests');
const tenantRoutes = require('./routes/tenant');
const notificationsRoutes = require('./routes/notifications');
const { logAiConfigSummary } = require('./openai-client');
const { pool } = require('./db');
const { startRentJobs } = require('./services/rent');
const { later } = require('./background');

const app = express();

// Stripe webhooks need raw body for signature verification - must be BEFORE express.json()
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRoutes.handleStripeWebhook);

// Paystack signs the raw body of its webhook, so keep a copy of it.
app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buf) => { if (req.originalUrl.startsWith('/api/tenant/pay/webhook')) req.rawBody = buf; },
}));

/*
 * Staff audit trail: every non-GET request a staff member makes (by admin key
 * or ADMIN_EMAILS sign-in) is recorded once the response is sent. Owners and
 * tenants never trigger it: adminActor resolves to null for them.
 */
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  res.on('finish', () => later(async () => {
    const actor = req.adminActorPromise ? await req.adminActorPromise : null;
    if (!actor) return;
    await pool.query(
      'INSERT INTO admin_audit (actor, method, path, status) VALUES ($1, $2, $3, $4)',
      [actor, req.method, req.originalUrl.split('?')[0].slice(0, 500), res.statusCode]
    );
  }));
  return next();
});

app.use('/api/billing', billingRoutes);
app.use('/api/leads',    leadsRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/consult', consultRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/renovations', renovationsRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/passport-requests', passportRequestsRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  ensureDb().then(() => {
    logAiConfigSummary();
    startRentJobs();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, ensureDb };
