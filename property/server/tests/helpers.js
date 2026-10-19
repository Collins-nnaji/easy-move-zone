/**
 * Test harness for the API. Runs the real Express app against a real
 * Postgres (TEST_DATABASE_URL — never the production DATABASE_URL) with:
 *   - x-dev-user standing in for a signed-in session (AUTH_DEV_USER_HEADER),
 *   - staff sent the way app/api/property/[...path]/route.ts sends them for
 *     an admin_users member: the internal admin key plus x-emz-admin-email,
 *   - a fake Paystack on a local port,
 *   - email/SMS providers unset, so notices only land in the inbox table.
 * Without TEST_DATABASE_URL every test is skipped.
 */
const http = require('http');
const crypto = require('crypto');

const TEST_DB = process.env.TEST_DATABASE_URL || '';
const enabled = Boolean(TEST_DB);

const PAYSTACK_SECRET = 'sk_test_fake';
/** Transactions the fake Paystack knows about: reference → { amount, status }. */
const paystackTx = new Map();
let paystackServer;
let apiServer;
let base;

function startFakePaystack() {
  return new Promise((resolve) => {
    paystackServer = http.createServer((req, res) => {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        if (req.headers.authorization !== `Bearer ${PAYSTACK_SECRET}`) {
          res.statusCode = 401; return res.end(JSON.stringify({ status: false, message: 'bad key' }));
        }
        if (req.url === '/transaction/initialize') {
          const body = JSON.parse(raw);
          paystackTx.set(body.reference, { amount: body.amount, status: 'pending', currency: body.currency });
          return res.end(JSON.stringify({ status: true, data: { authorization_url: `https://checkout.test/${body.reference}`, reference: body.reference } }));
        }
        const m = req.url.match(/^\/transaction\/verify\/(.+)$/);
        if (m) {
          const ref = decodeURIComponent(m[1]);
          const tx = paystackTx.get(ref);
          if (!tx) { res.statusCode = 404; return res.end(JSON.stringify({ status: false, message: 'not found' })); }
          return res.end(JSON.stringify({ status: true, data: { reference: ref, amount: tx.amount, currency: tx.currency || 'NGN', status: tx.status, paid_at: '2026-10-18T10:00:00.000Z' } }));
        }
        res.statusCode = 404; return res.end('{}');
      });
    }).listen(0, () => resolve(paystackServer.address().port));
  });
}

async function start() {
  const port = await startFakePaystack();
  Object.assign(process.env, {
    DATABASE_URL: TEST_DB,
    AUTH_DEV_USER_HEADER: '1',
    NODE_ENV: 'test',
    PROPERTY_ADMIN_SECRET: 'test-admin-secret',
    NOTIFY_STAFF_EMAIL: 'desk@test.easymovezone',
    PAYSTACK_SECRET_KEY: PAYSTACK_SECRET,
    PAYSTACK_API_BASE: `http://127.0.0.1:${port}`,
    RENT_JOBS: 'off',
    RESEND_API_KEY: '',
    TERMII_API_KEY: '',
  });
  const { app, ensureDb } = require('../index');
  await ensureDb();
  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  base = `http://127.0.0.1:${apiServer.address().port}/api`;
  return base;
}

async function stop() {
  await new Promise((r) => apiServer.close(r));
  await new Promise((r) => paystackServer.close(r));
  await require('../db').pool.end();
}

/** Signed-in users the test treats as being on the admin_users allowlist. */
const STAFF = ['staff@test.easymovezone'];

/** fetch the API as `user` (an email), as staff (`admin: true`), or anonymously. */
async function call(path, { method = 'GET', user, admin, body, headers = {} } = {}) {
  const h = { 'content-type': 'application/json', ...headers };
  const { ADMIN_KEY } = require('../adminKey');
  if (user) h['x-dev-user'] = user;
  if (user && STAFF.includes(user)) { h['x-admin-key'] = ADMIN_KEY; h['x-emz-admin-email'] = user; }
  if (admin) h['x-admin-key'] = ADMIN_KEY;
  const res = await fetch(`${base}${path}`, { method, headers: h, body: body == null ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, body: json, text };
}

const q = (sql, vals) => require('../db').pool.query(sql, vals);
const uid = () => crypto.randomBytes(4).toString('hex');

/** A managed property owned by `owner`, with one tenancy for `tenant`. */
async function seedTenancy({ owner, tenant, rent = 1200000, frequency = 'annual', start = '2026-01-01', end = '2026-12-31' }) {
  const ref = `BV-M-${uid().toUpperCase()}`;
  const { rows: [p] } = await q(
    `INSERT INTO management_requests (ref, plan, title, state, city, contact_name, contact_email, contact_phone, status, manager_name)
     VALUES ($1,'full','Test flat, Yaba','Lagos','Yaba','Owner',$2,'08030000000','active','Desk') RETURNING *`,
    [ref, owner]
  );
  const { rows: [t] } = await q(
    `INSERT INTO management_tenancies (request_id, unit_label, tenant_name, tenant_email, tenant_phone, rent_amount, rent_frequency, start_date, end_date)
     VALUES ($1,'Flat 1','Tolu Ade',$2,'08031111111',$3,$4,$5,$6) RETURNING *`,
    [p.id, tenant, rent, frequency, start, end]
  );
  return { property: p, tenancy: t };
}

function paystackSign(raw) {
  return crypto.createHmac('sha512', PAYSTACK_SECRET).update(raw).digest('hex');
}

module.exports = {
  enabled, start, stop, call, q, uid, seedTenancy, paystackTx, paystackSign,
};
