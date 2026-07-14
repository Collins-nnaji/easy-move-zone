/**
 * The only capability rateLimit needs from the DB client — a parameterized
 * query. Kept structural so it works with the Neon client and is trivial to
 * fake in tests, without coupling to Neon's exact generic signature.
 */
export interface QueryableSql {
  query(text: string, params?: unknown[]): Promise<Record<string, unknown>[]>
}

export interface RateLimitResult {
  ok: boolean
  /** How many actions of this kind remain in the current window. */
  remaining: number
  /** Seconds until the window frees up (0 when ok). */
  retryAfter: number
}

/**
 * Sliding-window rate limit backed by the rate_limit_events table.
 *
 * Counts the caller's recent actions; if under the limit, records this one and
 * allows it. Old rows for the caller+action are pruned opportunistically so the
 * table doesn't grow unbounded. Returns { ok: false } (without recording) when
 * the limit is hit.
 */
export async function rateLimit(
  sql: QueryableSql,
  userId: string,
  action: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

  // Prune anything older than the window for this caller+action (cheap, keeps
  // the table small) then count what remains.
  await sql.query(
    `delete from rate_limit_events where auth_user_id = $1 and action = $2 and created_at < $3`,
    [userId, action, windowStart],
  )
  const rows = await sql.query(
    `select count(*)::int as count, min(created_at) as oldest
     from rate_limit_events where auth_user_id = $1 and action = $2`,
    [userId, action],
  )
  const count = Number((rows[0] as { count: number }).count ?? 0)

  if (count >= max) {
    const oldest = (rows[0] as { oldest: string | null }).oldest
    const retryAfter = oldest
      ? Math.max(1, Math.ceil((new Date(oldest).getTime() + windowSeconds * 1000 - Date.now()) / 1000))
      : windowSeconds
    return { ok: false, remaining: 0, retryAfter }
  }

  await sql.query(
    `insert into rate_limit_events (auth_user_id, action) values ($1, $2)`,
    [userId, action],
  )
  return { ok: true, remaining: max - count - 1, retryAfter: 0 }
}
