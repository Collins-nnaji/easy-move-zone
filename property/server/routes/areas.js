const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sessionUser, requireUser, requireAdmin } = require('../auth');
const {
  MOVING_CITIES, slugify, matchPlace, RATING_FACTORS, RATING_IDS, POST_CATEGORIES, POST_CATEGORY_IDS,
  annualRent, displayName,
} = require('../areaCatalog');
const {
  allAreas, liveAreas, getArea, clearAreaCache, toArea,
} = require('../areaStore');
const { NIGERIAN_STATES } = require('../markets');
const { screen } = require('../services/moderation');
const { notify, notifyStaff } = require('../services/notify');
const { later } = require('../background');
const insights = require('../areaInsights');

/**
 * Neighbourhoods: one page per area (/areas/:slug) with what residents rate
 * it, a board of their posts, and what renting there costs on our own live
 * listings.
 *
 * Reading is public; posting, replying, rating, voting and reporting need a
 * sign-in. Authors are shown by first name and initial (or as "A neighbour"),
 * never by email, and a tenant we manage in the area is marked as a verified
 * resident. Every post and reply goes through services/moderation.js, and
 * REPORTS_TO_HIDE reports from different people take one down for review.
 *
 * Authors hear (by email, audience 'community') when someone replies to them
 * and when staff decide on a post that was held. Staff open, edit and hide
 * areas under /admin/areas; the list is cached in areaStore.js.
 */

const REPORTS_TO_HIDE = 3;
const POSTS_PER_DAY = 5;
const REPLIES_PER_DAY = 20;
const PAGE_SIZE = 20;
const REPORT_REASONS = ['names_person', 'false', 'abusive', 'contact', 'spam', 'other'];
const STATUSES = ['published', 'held', 'removed'];

const clip = (v, n) => (typeof v === 'string' && v.trim() ? v.trim().replace(/\s+\n/g, '\n').slice(0, n) : '');
const idOf = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** True when `email` rents a home we manage in this area right now. */
async function isVerifiedResident(email, area) {
  if (!area?.slug) return false;
  const { rows } = await pool.query(
    `SELECT r.area, r.city, r.state
       FROM management_tenancies t JOIN management_requests r ON r.id = t.request_id
      WHERE LOWER(t.tenant_email) = $1 AND t.status IN ('active','notice')`,
    [email]
  );
  const areas = await liveAreas();
  return rows.some((r) => matchPlace(areas, r)?.slug === area.slug);
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Live listings that sit in one of our areas: { [slug]: rows }. */
async function listingsByArea(onlyArea) {
  const params = [];
  let where = `status = 'live'`;
  if (onlyArea) {
    params.push(onlyArea.state.toLowerCase(), onlyArea.city.toLowerCase());
    where += ' AND (LOWER(state) = $1 OR LOWER(city) = $2)';
  }
  const { rows } = await pool.query(
    `SELECT id, area, city, state, beds, currency, listing_type, rent_frequency,
            COALESCE(list_price, guide_price) AS price
       FROM listings WHERE ${where}`,
    params
  );
  const areas = await liveAreas();
  const out = {};
  for (const row of rows) {
    const hit = matchPlace(areas, row);
    if (hit) (out[hit.slug] ||= []).push(row);
  }
  return out;
}

/** Typical yearly rent by bedrooms, from our live rentals in the area. */
function rentSnapshot(rows) {
  const rentals = rows.filter((r) => r.listing_type === 'rent');
  const groups = {};
  for (const r of rentals) {
    const yearly = annualRent(r.price, r.rent_frequency);
    if (!yearly) continue;
    const key = String(r.beds || '').trim() || 'Other';
    (groups[key] ||= { beds: key, currency: r.currency || 'NGN', values: [] }).values.push(yearly);
  }
  return Object.values(groups)
    .map((g) => ({
      beds: g.beds, currency: g.currency, count: g.values.length,
      low: Math.min(...g.values), median: median(g.values), high: Math.max(...g.values),
    }))
    .sort((a, b) => (Number.parseInt(a.beds, 10) || 99) - (Number.parseInt(b.beds, 10) || 99));
}

const RATING_AVERAGES = RATING_IDS.map((id) => `ROUND(AVG(${id})::numeric, 1)::float AS ${id}`).join(', ');

/** Averages for an area's ratings, and the overall score across them. */
function summariseRatings(row) {
  const averages = Object.fromEntries(RATING_IDS.map((id) => [id, row?.[id] ?? null]));
  const known = Object.values(averages).filter((v) => v != null);
  return {
    count: row?.count || 0,
    verifiedCount: row?.verified || 0,
    averages,
    overall: known.length ? Math.round((known.reduce((a, b) => a + b, 0) / known.length) * 10) / 10 : null,
  };
}

function publicArea(a) {
  return {
    slug: a.slug, name: a.name, city: a.city, state: a.state, blurb: a.blurb, center: a.center,
  };
}

/** Where a notice about a post sends its reader. */
const postLink = (slug, id) => `/areas/${slug}#post-${id}`;

/** Tell an author something about their post or reply (email + a record in notifications). */
function tellAuthor(email, title, body, link) {
  if (!email) return;
  later(() => notify({ to: { email }, audience: 'community', kind: 'area_post', title, body, link }));
}

/* ── Admin: the moderation queue ─────────────────────────────────── */

/* GET /api/areas/admin/queue?view=held|reported|removed|published — posts and replies to review. */
router.get('/admin/queue', requireAdmin, async (req, res) => {
  const view = ['held', 'reported', 'removed', 'published'].includes(req.query.view) ? req.query.view : 'held';
  const params = view === 'reported' ? [] : [view];
  const where = (t) => (view === 'reported' ? `${t}.status = 'published' AND ${t}.report_count > 0` : `${t}.status = $1`);
  try {
    const [{ rows: posts }, { rows: replies }, { rows: counts }] = await Promise.all([
      pool.query(
        `SELECT p.*,
                (SELECT json_agg(json_build_object('reason', r.reason, 'detail', r.detail, 'created_at', r.created_at) ORDER BY r.created_at DESC)
                   FROM area_reports r WHERE r.target_type = 'post' AND r.target_id = p.id) AS reports
           FROM area_posts p WHERE ${where('p')}
          ORDER BY p.report_count DESC, p.created_at DESC LIMIT 100`,
        params
      ),
      pool.query(
        `SELECT r.*, p.area_slug, p.body AS post_body,
                (SELECT json_agg(json_build_object('reason', x.reason, 'detail', x.detail, 'created_at', x.created_at) ORDER BY x.created_at DESC)
                   FROM area_reports x WHERE x.target_type = 'reply' AND x.target_id = r.id) AS reports
           FROM area_post_replies r JOIN area_posts p ON p.id = r.post_id
          WHERE ${where('r')}
          ORDER BY r.report_count DESC, r.created_at DESC LIMIT 100`,
        params
      ),
      pool.query(
        `SELECT
           (SELECT COUNT(*)::int FROM area_posts WHERE status = 'held')
             + (SELECT COUNT(*)::int FROM area_post_replies WHERE status = 'held') AS held,
           (SELECT COUNT(*)::int FROM area_posts WHERE status = 'published' AND report_count > 0)
             + (SELECT COUNT(*)::int FROM area_post_replies WHERE status = 'published' AND report_count > 0) AS reported`
      ),
    ]);
    const names = Object.fromEntries((await allAreas()).map((a) => [a.slug, a.name]));
    const name = (slug) => names[slug] || slug;
    return res.json({
      posts: posts.map((p) => ({ ...p, area_name: name(p.area_slug) })),
      replies: replies.map((r) => ({ ...r, area_name: name(r.area_slug) })),
      counts: counts[0],
    });
  } catch (err) {
    console.error('GET /areas/admin/queue error:', err);
    return res.status(500).json({ error: 'Could not load the community queue.' });
  }
});

/** PATCH /api/areas/admin/posts/:id and /admin/replies/:id — { status, note }. */
function moderate(table) {
  return async (req, res) => {
    const id = idOf(req.params.id);
    const { status } = req.body || {};
    if (!id || !STATUSES.includes(status)) return res.status(400).json({ error: 'A valid status is required.' });
    try {
      // Publishing clears the reports that hid it, so it is not hidden again by the same people.
      const { rows } = await pool.query(
        `WITH before AS (SELECT status FROM ${table} WHERE id = $4)
         UPDATE ${table} SET status = $1, moderation_note = COALESCE($2, moderation_note),
                reviewed_by = $3, reviewed_at = NOW()${status === 'published' ? ', report_count = 0' : ''}
          WHERE id = $4
          RETURNING id, status, author_email, (SELECT status FROM before) AS was,
                    ${table === 'area_posts' ? 'id AS post_id, area_slug' : 'post_id, (SELECT area_slug FROM area_posts WHERE area_posts.id = post_id) AS area_slug'}`,
        [status, clip(req.body?.note, 500) || null, req.adminActor, id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found.' });
      const done = rows[0];
      const what = table === 'area_posts' ? 'post' : 'reply';
      if (done.was === 'held' && status === 'published') {
        tellAuthor(done.author_email, `Your ${what} is now live`, 'Thanks for helping your neighbours. Our team has read it and it is now public.', postLink(done.area_slug, done.post_id));
      } else if (done.was !== 'removed' && status === 'removed') {
        tellAuthor(done.author_email, `We removed your ${what}`, 'It did not meet the board rules: posts are about places and first-hand experiences, not named people, accusations or contact details. You are welcome to post again.', `/areas/${done.area_slug}`);
      }
      if (status === 'published') {
        await pool.query('DELETE FROM area_reports WHERE target_type = $1 AND target_id = $2', [table === 'area_posts' ? 'post' : 'reply', id]);
      }
      return res.json({ id: done.id, status: done.status });
    } catch (err) {
      console.error(`PATCH /areas/admin ${table} error:`, err);
      return res.status(500).json({ error: 'Could not update.' });
    }
  };
}
router.patch('/admin/posts/:id', requireAdmin, moderate('area_posts'));
router.patch('/admin/replies/:id', requireAdmin, moderate('area_post_replies'));

/* ── Admin: the areas themselves ─────────────────────────────────── */

/** Lower-cased, de-duplicated spellings; the name itself is always one. */
function matchList(name, value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,\n]/);
  return [...new Set([name, ...raw].map((v) => String(v || '').trim().toLowerCase()).filter(Boolean))].slice(0, 30);
}

/** A latitude/longitude pair inside Nigeria's bounding box, or null. */
function centerOf(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (lat === '' || lng === '' || lat == null || lng == null || !Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return la >= 4 && la <= 14 && ln >= 2.6 && ln <= 14.7 ? [la, ln] : undefined;
}

/* GET /api/areas/admin/areas — every area (live and hidden) with activity, and residents' requests for new ones. */
router.get('/admin/areas', requireAdmin, async (req, res) => {
  try {
    const [areas, { rows: posts }, { rows: ratings }, { rows: requests }] = await Promise.all([
      allAreas(),
      pool.query(`SELECT area_slug, COUNT(*) FILTER (WHERE status = 'published')::int AS published, COUNT(*) FILTER (WHERE status = 'held')::int AS held FROM area_posts GROUP BY area_slug`),
      pool.query('SELECT area_slug, COUNT(*)::int AS n FROM area_ratings GROUP BY area_slug'),
      pool.query(
        `SELECT id, name, email, message, created_at FROM leads
          WHERE service = 'Neighbourhood request' AND status = 'new'
          ORDER BY created_at DESC LIMIT 100`
      ),
    ]);
    const postsBy = Object.fromEntries(posts.map((p) => [p.area_slug, p]));
    const ratingsBy = Object.fromEntries(ratings.map((r) => [r.area_slug, r.n]));
    return res.json({
      areas: areas.map((a) => ({
        ...a, posts: postsBy[a.slug]?.published || 0, held: postsBy[a.slug]?.held || 0, ratings: ratingsBy[a.slug] || 0,
      })),
      requests,
      states: NIGERIAN_STATES,
    });
  } catch (err) {
    console.error('GET /areas/admin/areas error:', err);
    return res.status(500).json({ error: 'Could not load areas.' });
  }
});

/* POST /api/areas/admin/areas — open a new area: { name, city, state, lat, lng, match, blurb, requestId? } */
router.post('/admin/areas', requireAdmin, async (req, res) => {
  const name = clip(req.body?.name, 120);
  const city = clip(req.body?.city, 120);
  const state = NIGERIAN_STATES.includes(req.body?.state) ? req.body.state : null;
  const center = centerOf(req.body?.lat, req.body?.lng);
  if (!name || !city || !state) return res.status(400).json({ error: 'Name, city and a Nigerian state are required.' });
  if (center === undefined) return res.status(400).json({ error: 'That map point is not in Nigeria. Check the latitude and longitude.' });
  const slug = slugify(name, city);
  try {
    const { rows } = await pool.query(
      `INSERT INTO areas (slug, name, city, state, lat, lng, match, blurb, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (slug) DO NOTHING RETURNING *`,
      [slug, name, city, state, center?.[0] ?? null, center?.[1] ?? null, matchList(name, req.body?.match), clip(req.body?.blurb, 400) || null, req.adminActor]
    );
    if (!rows.length) return res.status(409).json({ error: `There is already an area at /areas/${slug}.` });
    clearAreaCache();
    // Opening an area answers the request that asked for it.
    const requestId = idOf(req.body?.requestId);
    if (requestId) await pool.query(`UPDATE leads SET status = 'replied' WHERE id = $1 AND service = 'Neighbourhood request'`, [requestId]);
    return res.json({ area: toArea(rows[0]) });
  } catch (err) {
    console.error('POST /areas/admin/areas error:', err);
    return res.status(500).json({ error: 'Could not open that area.' });
  }
});

/* PATCH /api/areas/admin/areas/:slug — edit an area, or hide/show it with { status }. The slug never changes. */
router.patch('/admin/areas/:slug', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const sets = [];
  const params = [];
  const set = (col, value) => { params.push(value); sets.push(`${col} = $${params.length}`); };
  if ('name' in body) { if (!clip(body.name, 120)) return res.status(400).json({ error: 'The name cannot be empty.' }); set('name', clip(body.name, 120)); }
  if ('city' in body) { if (!clip(body.city, 120)) return res.status(400).json({ error: 'The city cannot be empty.' }); set('city', clip(body.city, 120)); }
  if ('state' in body) { if (!NIGERIAN_STATES.includes(body.state)) return res.status(400).json({ error: 'Choose a Nigerian state.' }); set('state', body.state); }
  if ('blurb' in body) set('blurb', clip(body.blurb, 400) || null);
  if ('status' in body) { if (!['live', 'hidden'].includes(body.status)) return res.status(400).json({ error: 'Status is live or hidden.' }); set('status', body.status); }
  if ('lat' in body || 'lng' in body) {
    const center = centerOf(body.lat, body.lng);
    if (center === undefined) return res.status(400).json({ error: 'That map point is not in Nigeria. Check the latitude and longitude.' });
    set('lat', center?.[0] ?? null);
    set('lng', center?.[1] ?? null);
  }
  if (!sets.length && !('match' in body)) return res.status(400).json({ error: 'Nothing to change.' });
  try {
    const { rows: [current] } = await pool.query('SELECT name FROM areas WHERE slug = $1', [req.params.slug]);
    if (!current) return res.status(404).json({ error: 'Area not found.' });
    if ('match' in body) set('match', matchList(clip(body.name, 120) || current.name, body.match));
    params.push(req.params.slug);
    const { rows } = await pool.query(
      `UPDATE areas SET ${sets.join(', ')}, updated_at = NOW() WHERE slug = $${params.length} RETURNING *`,
      params
    );
    clearAreaCache();
    return res.json({ area: toArea(rows[0]) });
  } catch (err) {
    console.error('PATCH /areas/admin/areas error:', err);
    return res.status(500).json({ error: 'Could not update that area.' });
  }
});

/* PATCH /api/areas/admin/requests/:id — dismiss a request without opening an area. */
router.patch('/admin/requests/:id', requireAdmin, async (req, res) => {
  const id = idOf(req.params.id);
  if (!id) return res.status(404).json({ error: 'Not found.' });
  try {
    const { rowCount } = await pool.query(`UPDATE leads SET status = 'closed' WHERE id = $1 AND service = 'Neighbourhood request'`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found.' });
    return res.json({ success: true });
  } catch (err) {
    console.error('PATCH /areas/admin/requests error:', err);
    return res.status(500).json({ error: 'Could not update.' });
  }
});

/* ── Posts and replies by id ─────────────────────────────────────── */

async function loadPost(id) {
  const { rows } = await pool.query('SELECT * FROM area_posts WHERE id = $1', [id]);
  return rows[0] || null;
}

/* POST /api/areas/posts/:id/replies — { body, showName } */
router.post('/posts/:id/replies', requireUser, async (req, res) => {
  const id = idOf(req.params.id);
  const body = clip(req.body?.body, 1000);
  if (!id) return res.status(404).json({ error: 'Post not found.' });
  if (body.length < 2) return res.status(400).json({ error: 'Write a reply first.' });
  try {
    const post = await loadPost(id);
    if (!post || post.status !== 'published') return res.status(404).json({ error: 'Post not found.' });
    const { rows: [recent] } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM area_post_replies WHERE author_email = $1 AND created_at > NOW() - INTERVAL '1 day'`,
      [req.user.email]
    );
    if (recent.n >= REPLIES_PER_DAY) return res.status(429).json({ error: 'You have replied a lot today. Please try again tomorrow.' });
    const verdict = await screen(body);
    if (verdict.refuse) return res.status(400).json({ error: verdict.refuse });
    const verified = await isVerifiedResident(req.user.email, await getArea(post.area_slug));
    const { rows: [reply] } = await pool.query(
      `INSERT INTO area_post_replies (post_id, body, author_email, author_name, verified_resident, status, moderation_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, post_id, body, author_name, verified_resident, status, created_at`,
      [id, body, req.user.email, displayName(req.user, req.body?.showName !== false), verified, verdict.status, verdict.reasons.join('; ') || null]
    );
    if (verdict.status === 'held') {
      later(() => notifyStaff({ kind: 'area_held', title: 'A neighbourhood reply is waiting for review', body: verdict.reasons.join('; '), link: '/admin?section=community' }));
    } else if (post.author_email !== req.user.email) {
      tellAuthor(post.author_email, 'Someone replied to your post', `${reply.author_name || 'A neighbour'} wrote: "${body.slice(0, 200)}"`, postLink(post.area_slug, post.id));
    }
    return res.json({ reply: { ...reply, mine: true, helpful: false } });
  } catch (err) {
    console.error('POST /areas/posts/:id/replies error:', err);
    return res.status(500).json({ error: 'Could not post your reply.' });
  }
});

/* POST /api/areas/posts/:id/helpful — toggles the signed-in user's "helpful". */
router.post('/posts/:id/helpful', requireUser, async (req, res) => {
  const id = idOf(req.params.id);
  if (!id) return res.status(404).json({ error: 'Post not found.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [post] } = await client.query(`SELECT id, author_email FROM area_posts WHERE id = $1 AND status = 'published' FOR UPDATE`, [id]);
    if (!post) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Post not found.' }); }
    if (post.author_email === req.user.email) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'You cannot mark your own post helpful.' }); }
    const removed = await client.query('DELETE FROM area_post_votes WHERE post_id = $1 AND voter_email = $2', [id, req.user.email]);
    if (!removed.rowCount) await client.query('INSERT INTO area_post_votes (post_id, voter_email) VALUES ($1,$2)', [id, req.user.email]);
    const { rows: [after] } = await client.query(
      `UPDATE area_posts SET helpful_count = (SELECT COUNT(*) FROM area_post_votes WHERE post_id = $1)
        WHERE id = $1 RETURNING helpful_count`,
      [id]
    );
    await client.query('COMMIT');
    return res.json({ helpful: !removed.rowCount, helpful_count: after.helpful_count });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /areas/posts/:id/helpful error:', err);
    return res.status(500).json({ error: 'Could not save that.' });
  } finally {
    client.release();
  }
});

/** POST /api/areas/posts/:id/report and /replies/:id/report — { reason, detail } */
function report(type) {
  const table = type === 'post' ? 'area_posts' : 'area_post_replies';
  return async (req, res) => {
    const id = idOf(req.params.id);
    const reason = REPORT_REASONS.includes(req.body?.reason) ? req.body.reason : null;
    if (!id) return res.status(404).json({ error: 'Not found.' });
    if (!reason) return res.status(400).json({ error: 'Choose what is wrong with it.' });
    try {
      const { rows: [target] } = await pool.query(`SELECT id, status, author_email FROM ${table} WHERE id = $1`, [id]);
      if (!target || target.status === 'removed') return res.status(404).json({ error: 'Not found.' });
      if (target.author_email === req.user.email) return res.status(400).json({ error: 'You can delete your own post instead.' });
      const added = await pool.query(
        `INSERT INTO area_reports (target_type, target_id, reporter_email, reason, detail)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (target_type, target_id, reporter_email) DO NOTHING`,
        [type, id, req.user.email, reason, clip(req.body?.detail, 500) || null]
      );
      if (added.rowCount) {
        const { rows: [after] } = await pool.query(
          `UPDATE ${table} SET report_count = report_count + 1,
                  status = CASE WHEN status = 'published' AND report_count + 1 >= $2 THEN 'held' ELSE status END,
                  moderation_note = CASE WHEN status = 'published' AND report_count + 1 >= $2
                                         THEN 'Hidden after ' || $2 || ' reports' ELSE moderation_note END
            WHERE id = $1 RETURNING status, report_count`,
          [id, REPORTS_TO_HIDE]
        );
        if (after.report_count === 1 || after.status === 'held') {
          later(() => notifyStaff({
            kind: 'area_report',
            title: after.status === 'held' ? `A neighbourhood ${type} was hidden after reports` : `A neighbourhood ${type} was reported`,
            body: reason, link: '/admin?section=community',
          }));
        }
      }
      return res.json({ success: true });
    } catch (err) {
      console.error(`POST /areas/${type}s/:id/report error:`, err);
      return res.status(500).json({ error: 'Could not send your report.' });
    }
  };
}
router.post('/posts/:id/report', requireUser, report('post'));
router.post('/replies/:id/report', requireUser, report('reply'));

/** DELETE /api/areas/posts/:id and /replies/:id — the author takes their own down. */
function removeOwn(table) {
  return async (req, res) => {
    const id = idOf(req.params.id);
    if (!id) return res.status(404).json({ error: 'Not found.' });
    try {
      const { rows } = await pool.query(
        `UPDATE ${table} SET status = 'removed', moderation_note = 'Deleted by the author'
          WHERE id = $1 AND author_email = $2 AND status <> 'removed' RETURNING id`,
        [id, req.user.email]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found.' });
      return res.json({ success: true });
    } catch (err) {
      console.error(`DELETE ${table} error:`, err);
      return res.status(500).json({ error: 'Could not delete it.' });
    }
  };
}
router.delete('/posts/:id', requireUser, removeOwn('area_posts'));
router.delete('/replies/:id', requireUser, removeOwn('area_post_replies'));

/* ── Areas ───────────────────────────────────────────────────────── */

/* GET /api/areas — every area with its headline numbers. */
router.get('/', async (req, res) => {
  try {
    const [areas, { rows: posts }, { rows: ratings }, listings] = await Promise.all([
      liveAreas(),
      pool.query(`SELECT area_slug, COUNT(*)::int AS n, MAX(created_at) AS latest FROM area_posts WHERE status = 'published' GROUP BY area_slug`),
      pool.query(`SELECT area_slug, COUNT(*)::int AS count, COUNT(*) FILTER (WHERE verified_resident)::int AS verified, ${RATING_AVERAGES} FROM area_ratings GROUP BY area_slug`),
      listingsByArea(),
    ]);
    const postsBy = Object.fromEntries(posts.map((p) => [p.area_slug, p]));
    const ratingsBy = Object.fromEntries(ratings.map((r) => [r.area_slug, r]));
    return res.json({
      areas: areas.map((a) => {
        const rated = summariseRatings(ratingsBy[a.slug]);
        return {
          ...publicArea(a),
          posts: postsBy[a.slug]?.n || 0,
          latestPost: postsBy[a.slug]?.latest || null,
          ratings: rated.count,
          overall: rated.overall,
          // Per-factor scores and the middle yearly rent, for "Find my area".
          averages: rated.averages,
          medianRent: insights.medianYearlyRent(listings[a.slug]),
          rentals: (listings[a.slug] || []).filter((l) => l.listing_type === 'rent').length,
        };
      }),
    });
  } catch (err) {
    console.error('GET /areas error:', err);
    return res.status(500).json({ error: 'Could not load neighbourhoods.' });
  }
});

/**
 * The numbers behind an area's "what we know" summary: the city's average
 * on each factor, the typical rent by bedrooms across the city, what the
 * board has talked about in the last 90 days, and other areas in the city
 * that do better where this one is weak.
 */
async function areaInsight(area) {
  const [areas, { rows: ratingRows }, all, { rows: topicRows }] = await Promise.all([
    liveAreas(),
    pool.query(`SELECT area_slug, COUNT(*)::int AS count, ${RATING_AVERAGES} FROM area_ratings GROUP BY area_slug`),
    listingsByArea(),
    pool.query(
      `SELECT category, COUNT(*)::int AS n FROM area_posts
        WHERE area_slug = $1 AND status = 'published' AND created_at > NOW() - INTERVAL '90 days'
        GROUP BY category`,
      [area.slug]
    ),
  ]);
  const ratingsBySlug = Object.fromEntries(ratingRows.map((r) => [r.area_slug, r]));
  const inCity = areas.filter((a) => a.city === area.city).map((a) => a.slug);
  const cityRows = inCity.flatMap((slug) => all[slug] || []);
  const rentBySlug = Object.fromEntries(inCity.map((slug) => [slug, insights.medianYearlyRent(all[slug])]));
  return {
    city: area.city,
    // Areas in the city residents have scored: what "compared with" means.
    cityAreas: inCity.filter((slug) => ratingsBySlug[slug]?.count > 0).length,
    cityAverages: insights.cityAverages(area.city, areas, ratingsBySlug),
    cityRents: rentSnapshot(cityRows),
    topics: insights.topics(topicRows),
    alternatives: insights.alternatives(area, areas, ratingsBySlug, { rentBySlug }),
  };
}

/* GET /api/areas/:slug — the area, its scores, rents and the viewer's own rating. */
router.get('/:slug', async (req, res) => {
  const area = await getArea(req.params.slug);
  if (!area) return res.status(404).json({ error: 'We do not cover that area yet.' });
  try {
    const user = await sessionUser(req);
    const [{ rows: [ratingRow] }, mine, listings, verified] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS count, COUNT(*) FILTER (WHERE verified_resident)::int AS verified, ${RATING_AVERAGES}
           FROM area_ratings WHERE area_slug = $1`,
        [area.slug]
      ),
      user ? pool.query(`SELECT ${RATING_IDS.join(', ')} FROM area_ratings WHERE area_slug = $1 AND rater_email = $2`, [area.slug, user.email]) : null,
      listingsByArea(area),
      user ? isVerifiedResident(user.email, area) : false,
    ]);
    const rows = listings[area.slug] || [];
    const insight = await areaInsight(area);
    return res.json({
      area: { ...publicArea(area), movingCity: MOVING_CITIES.includes(area.city) ? area.city : null },
      factors: RATING_FACTORS,
      categories: POST_CATEGORIES,
      ratings: summariseRatings(ratingRow),
      myRating: mine?.rows[0] || null,
      viewer: user ? { signedIn: true, verifiedResident: verified } : { signedIn: false, verifiedResident: false },
      rents: rentSnapshot(rows),
      rentals: rows.filter((r) => r.listing_type === 'rent').length,
      insights: insight,
    });
  } catch (err) {
    console.error('GET /areas/:slug error:', err);
    return res.status(500).json({ error: 'Could not load this area.' });
  }
});

/* GET /api/areas/:slug/posts?category=&sort=recent|helpful&offset= — the board. */
router.get('/:slug/posts', async (req, res) => {
  const area = await getArea(req.params.slug);
  if (!area) return res.status(404).json({ error: 'We do not cover that area yet.' });
  const category = POST_CATEGORY_IDS.includes(req.query.category) ? req.query.category : null;
  const order = req.query.sort === 'helpful' ? 'p.helpful_count DESC, p.created_at DESC' : 'p.created_at DESC';
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  try {
    const user = await sessionUser(req);
    const me = user?.email || '';
    // The author also sees their own posts while they wait for review.
    const params = [area.slug, me];
    let where = `p.area_slug = $1 AND (p.status = 'published' OR (p.status = 'held' AND p.author_email = $2))`;
    if (category) { params.push(category); where += ` AND p.category = $${params.length}`; }
    const [{ rows: posts }, { rows: [count] }] = await Promise.all([
      pool.query(
        `SELECT p.id, p.category, p.place, p.body, p.author_name, p.verified_resident, p.status,
                p.helpful_count, p.created_at, (p.author_email = $2) AS mine,
                EXISTS (SELECT 1 FROM area_post_votes v WHERE v.post_id = p.id AND v.voter_email = $2) AS helpful
           FROM area_posts p WHERE ${where}
          ORDER BY ${order} LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
        params
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM area_posts p WHERE ${where}`, params),
    ]);
    const ids = posts.map((p) => p.id);
    const { rows: replies } = ids.length ? await pool.query(
      `SELECT id, post_id, body, author_name, verified_resident, status, created_at, (author_email = $2) AS mine
         FROM area_post_replies
        WHERE post_id = ANY($1) AND (status = 'published' OR (status = 'held' AND author_email = $2))
        ORDER BY created_at`,
      [ids, me]
    ) : { rows: [] };
    const byPost = {};
    for (const r of replies) (byPost[r.post_id] ||= []).push(r);
    return res.json({
      posts: posts.map((p) => ({ ...p, replies: byPost[p.id] || [] })),
      total: count.total,
      offset,
      limit: PAGE_SIZE,
    });
  } catch (err) {
    console.error('GET /areas/:slug/posts error:', err);
    return res.status(500).json({ error: 'Could not load the board.' });
  }
});

/* POST /api/areas/:slug/posts — { category, place, body, showName } */
router.post('/:slug/posts', requireUser, async (req, res) => {
  const area = await getArea(req.params.slug);
  if (!area) return res.status(404).json({ error: 'We do not cover that area yet.' });
  const category = POST_CATEGORY_IDS.includes(req.body?.category) ? req.body.category : null;
  const body = clip(req.body?.body, 1500);
  const place = clip(req.body?.place, 160);
  if (!category) return res.status(400).json({ error: 'Choose what your post is about.' });
  if (body.length < 10) return res.status(400).json({ error: 'Tell your neighbours a little more (at least 10 characters).' });
  try {
    const { rows: [recent] } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM area_posts WHERE author_email = $1 AND created_at > NOW() - INTERVAL '1 day'`,
      [req.user.email]
    );
    if (recent.n >= POSTS_PER_DAY) return res.status(429).json({ error: 'You have posted a lot today. Please try again tomorrow.' });
    const verdict = await screen(`${place}\n${body}`);
    if (verdict.refuse) return res.status(400).json({ error: verdict.refuse });
    const verified = await isVerifiedResident(req.user.email, area);
    const { rows: [post] } = await pool.query(
      `INSERT INTO area_posts (area_slug, category, place, body, author_email, author_name, verified_resident, status, moderation_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, category, place, body, author_name, verified_resident, status, helpful_count, created_at`,
      [area.slug, category, place || null, body, req.user.email, displayName(req.user, req.body?.showName !== false),
        verified, verdict.status, verdict.reasons.join('; ') || null]
    );
    if (verdict.status === 'held') {
      later(() => notifyStaff({ kind: 'area_held', title: `A ${area.name} post is waiting for review`, body: verdict.reasons.join('; '), link: '/admin?section=community' }));
    }
    return res.json({ post: { ...post, mine: true, helpful: false, replies: [] } });
  } catch (err) {
    console.error('POST /areas/:slug/posts error:', err);
    return res.status(500).json({ error: 'Could not post. Please try again.' });
  }
});

/* PUT /api/areas/:slug/rating — { power: 1-5, water: 1-5, ... }; any factor may be left out. */
router.put('/:slug/rating', requireUser, async (req, res) => {
  const area = await getArea(req.params.slug);
  if (!area) return res.status(404).json({ error: 'We do not cover that area yet.' });
  const scores = RATING_IDS.map((id) => {
    const n = Number.parseInt(req.body?.[id], 10);
    return n >= 1 && n <= 5 ? n : null;
  });
  if (scores.every((s) => s == null)) return res.status(400).json({ error: 'Score at least one thing about the area.' });
  try {
    const verified = await isVerifiedResident(req.user.email, area);
    const cols = RATING_IDS.join(', ');
    const vals = RATING_IDS.map((_, i) => `$${i + 3}`).join(', ');
    const sets = RATING_IDS.map((id) => `${id} = EXCLUDED.${id}`).join(', ');
    await pool.query(
      `INSERT INTO area_ratings (area_slug, rater_email, ${cols}, verified_resident)
       VALUES ($1, $2, ${vals}, $${RATING_IDS.length + 3})
       ON CONFLICT (area_slug, rater_email) DO UPDATE SET ${sets}, verified_resident = EXCLUDED.verified_resident, updated_at = NOW()`,
      [area.slug, req.user.email, ...scores, verified]
    );
    const { rows: [row] } = await pool.query(
      `SELECT COUNT(*)::int AS count, COUNT(*) FILTER (WHERE verified_resident)::int AS verified, ${RATING_AVERAGES}
         FROM area_ratings WHERE area_slug = $1`,
      [area.slug]
    );
    return res.json({ ratings: summariseRatings(row), myRating: Object.fromEntries(RATING_IDS.map((id, i) => [id, scores[i]])) });
  } catch (err) {
    console.error('PUT /areas/:slug/rating error:', err);
    return res.status(500).json({ error: 'Could not save your scores.' });
  }
});

module.exports = router;
