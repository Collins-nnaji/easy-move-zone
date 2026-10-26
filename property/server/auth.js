const crypto = require('crypto');
const { ADMIN_KEY } = require('./adminKey');

/**
 * Who is calling: the signed-in user, and whether they are staff.
 *
 * Sign-in is EasyMoveZone's own Neon Auth. The Next.js route that runs this
 * app (app/api/property/[...path]/route.ts) verifies the session cookie and
 * passes the result in headers it controls — whatever a browser sends under
 * these names is dropped first:
 *
 *   x-emz-user-id / x-emz-user-email / x-emz-user-name — the signed-in user;
 *   x-admin-key + x-emz-admin-email — only when that user is on the
 *     `admin_users` allowlist (EasyMoveZone's admin list).
 *
 * Every route that reads or changes someone's own data uses the session email
 * from here — never an email the browser sent in a query string or body.
 */

/**
 * Local development and the server tests only: with AUTH_DEV_USER_HEADER=1
 * and NODE_ENV not 'production', an `x-dev-user: email` header stands in for
 * a session. Never set it on a deployed server.
 */
const DEV_HEADER = process.env.AUTH_DEV_USER_HEADER === '1' && process.env.NODE_ENV !== 'production';
if (DEV_HEADER) console.warn('AUTH_DEV_USER_HEADER is on: x-dev-user is trusted. Development only.');

/** The signed-in user ({ id, email, name }) or null. Memoised per request. */
async function sessionUser(req) {
  if (req.sessionUserPromise) return req.sessionUserPromise;
  req.sessionUserPromise = (async () => {
    if (DEV_HEADER && req.get('x-dev-user')) {
      return { id: 'dev', email: String(req.get('x-dev-user')).trim().toLowerCase(), name: null };
    }
    const email = String(req.get('x-emz-user-email') || '').trim().toLowerCase();
    if (!email) return null;
    return { id: req.get('x-emz-user-id') || null, email, name: req.get('x-emz-user-name') || null };
  })();
  return req.sessionUserPromise;
}

/** The signed-in email, or '' when nobody is signed in. */
async function sessionEmail(req) {
  return (await sessionUser(req))?.email || '';
}

/** Route guard: 401 unless signed in. Sets req.user. */
async function requireUser(req, res, next) {
  const user = await sessionUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  req.user = user;
  return next();
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Who the staff member is (their email), or null when the caller is not staff. */
async function adminActor(req) {
  if (req.adminActorPromise) return req.adminActorPromise;
  req.adminActorPromise = (async () => {
    const key = req.get('x-admin-key');
    if (key && safeEqual(key, ADMIN_KEY)) {
      return String(req.get('x-emz-admin-email') || 'admin').toLowerCase();
    }
    return null;
  })();
  return req.adminActorPromise;
}

async function isAdmin(req) {
  return Boolean(await adminActor(req));
}

async function requireAdmin(req, res, next) {
  const actor = await adminActor(req);
  if (!actor) return res.status(401).json({ error: 'Unauthorized. Staff sign-in required.' });
  req.adminActor = actor;
  return next();
}

/**
 * Signed in and a member of a verified agency. Sets req.user and req.agent
 * (membership + agency). Pending / suspended agencies get 403 with a reason.
 */
async function requireVerifiedAgent(req, res, next) {
  const user = await sessionUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Please sign in again to continue.' });
  req.user = user;
  try {
    const { loadMembership } = require('./services/agent');
    const membership = await loadMembership(user);
    if (!membership) {
      return res.status(403).json({ error: 'Apply for an agency account first.', code: 'no_agency' });
    }
    if (membership.verification_status === 'suspended') {
      return res.status(403).json({ error: 'This agency is suspended. Contact EasyMoveZone.', code: 'suspended' });
    }
    if (membership.verification_status !== 'verified') {
      return res.status(403).json({
        error: 'Your agency is still being reviewed. You can post listings once it is verified.',
        code: 'unverified',
      });
    }
    req.agent = membership;
    return next();
  } catch (err) {
    console.error('requireVerifiedAgent:', err);
    return res.status(500).json({ error: 'Could not check your agency account.' });
  }
}

module.exports = {
  sessionUser, sessionEmail, requireUser, adminActor, isAdmin, requireAdmin, requireVerifiedAgent, safeEqual,
  ADMIN_KEY, ADMIN_EMAILS: [], authConfigured: Boolean(process.env.NEON_AUTH_BASE_URL),
};
