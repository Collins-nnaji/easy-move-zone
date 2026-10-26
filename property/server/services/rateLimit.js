const { pool } = require('../db');

/**
 * Simple DB-backed rate limit. Counts events for `bucket` + `actor` inside
 * `windowMs`. Throws a 429 Error when the cap is hit.
 */
async function rateLimit(bucket, actor, limit, windowMs = 60 * 60 * 1000) {
  const key = String(actor || '').trim().toLowerCase().slice(0, 255);
  if (!key) {
    const err = new Error('Too many attempts. Please wait and try again.');
    err.status = 429;
    throw err;
  }
  const since = new Date(Date.now() - windowMs);
  try {
    await pool.query(`DELETE FROM rate_limit_events WHERE created_at < NOW() - INTERVAL '2 days'`);
  } catch { /* table may not exist on a first boot before schema */ }
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM rate_limit_events
      WHERE bucket = $1 AND actor = $2 AND created_at > $3`,
    [bucket, key, since]
  );
  if ((rows[0]?.n || 0) >= limit) {
    const err = new Error('Too many attempts. Please wait and try again.');
    err.status = 429;
    throw err;
  }
  await pool.query(
    'INSERT INTO rate_limit_events (bucket, actor) VALUES ($1, $2)',
    [bucket, key]
  );
}

function clientIp(req) {
  const forwarded = String(req.get('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
}

module.exports = { rateLimit, clientIp };
