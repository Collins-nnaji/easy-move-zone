const crypto = require('crypto');

/**
 * The admin routes check `x-admin-key` against this value. Nobody types it:
 * the Next.js route in app/api/property/[...path]/route.ts strips any
 * `x-admin-key` the browser sends and adds this one only for a signed-in
 * user whose email is in `admin_users` (EasyMoveZone's admin allowlist).
 *
 * It is derived from the auth cookie secret so every server instance agrees
 * on it (media delete tokens are signed with it too). PROPERTY_ADMIN_SECRET
 * overrides it; without either, a per-process random value keeps admin closed.
 */
const seed = process.env.PROPERTY_ADMIN_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || '';

const ADMIN_KEY = seed
  ? crypto.createHmac('sha256', seed).update('emz-property-admin').digest('hex')
  : crypto.randomBytes(32).toString('hex');

module.exports = { ADMIN_KEY };
