const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sessionUser, requireUser, requireAdmin } = require('../auth');
const {
  AREAS, areaFor, areaForPlace, RATING_FACTORS, RATING_IDS, POST_CATEGORIES, POST_CATEGORY_IDS,
  annualRent, displayName,
} = require('../areaCatalog');
const { screen } = require('../services/moderation');
const { notifyStaff } = require('../services/notify');
const { later } = require('../background');

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
  return rows.some((r) => areaForPlace(r)?.slug === area.slug);
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
  const out = {};
  for (const row of rows) {
    const hit = areaForPlace(row);
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
    const name = (slug) => areaFor(slug)?.name || slug;
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
        `UPDATE ${table} SET status = $1, moderation_note = COALESCE($2, moderation_note),
                reviewed_by = $3, reviewed_at = NOW()${status === 'published' ? ', report_count = 0' : ''}
          WHERE id = $4 RETURNING id, status`,
        [status, clip(req.body?.note, 500) || null, req.adminActor, id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found.' });
      if (status === 'published') {
        await pool.query('DELETE FROM area_reports WHERE target_type = $1 AND target_id = $2', [table === 'area_posts' ? 'post' : 'reply', id]);
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error(`PATCH /areas/admin ${table} error:`, err);
      return res.status(500).json({ error: 'Could not update.' });
    }
  };
}
router.patch('/admin/posts/:id', requireAdmin, moderate('area_posts'));
router.patch('/admin/replies/:id', requireAdmin, moderate('area_post_replies'));

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
    const verified = await isVerifiedResident(req.user.email, areaFor(post.area_slug));
    const { rows: [reply] } = await pool.query(
      `INSERT INTO area_post_replies (post_id, body, author_email, author_name, verified_resident, status, moderation_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, post_id, body, author_name, verified_resident, status, created_at`,
      [id, body, req.user.email, displayName(req.user, req.body?.showName !== false), verified, verdict.status, verdict.reasons.join('; ') || null]
    );
    if (verdict.status === 'held') {
      later(() => notifyStaff({ kind: 'area_held', title: 'A neighbourhood reply is waiting for review', body: verdict.reasons.join('; '), link: '/admin?section=community' }));
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
    const [{ rows: posts }, { rows: ratings }, listings] = await Promise.all([
      pool.query(`SELECT area_slug, COUNT(*)::int AS n, MAX(created_at) AS latest FROM area_posts WHERE status = 'published' GROUP BY area_slug`),
      pool.query(`SELECT area_slug, COUNT(*)::int AS count, COUNT(*) FILTER (WHERE verified_resident)::int AS verified, ${RATING_AVERAGES} FROM area_ratings GROUP BY area_slug`),
      listingsByArea(),
    ]);
    const postsBy = Object.fromEntries(posts.map((p) => [p.area_slug, p]));
    const ratingsBy = Object.fromEntries(ratings.map((r) => [r.area_slug, r]));
    return res.json({
      areas: AREAS.map((a) => {
        const rated = summariseRatings(ratingsBy[a.slug]);
        return {
          ...publicArea(a),
          posts: postsBy[a.slug]?.n || 0,
          latestPost: postsBy[a.slug]?.latest || null,
          ratings: rated.count,
          overall: rated.overall,
          rentals: (listings[a.slug] || []).filter((l) => l.listing_type === 'rent').length,
        };
      }),
    });
  } catch (err) {
    console.error('GET /areas error:', err);
    return res.status(500).json({ error: 'Could not load neighbourhoods.' });
  }
});

/* GET /api/areas/:slug — the area, its scores, rents and the viewer's own rating. */
router.get('/:slug', async (req, res) => {
  const area = areaFor(req.params.slug);
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
    return res.json({
      area: { ...publicArea(area), movingCity: area.city },
      factors: RATING_FACTORS,
      categories: POST_CATEGORIES,
      ratings: summariseRatings(ratingRow),
      myRating: mine?.rows[0] || null,
      viewer: user ? { signedIn: true, verifiedResident: verified } : { signedIn: false, verifiedResident: false },
      rents: rentSnapshot(rows),
      rentals: rows.filter((r) => r.listing_type === 'rent').length,
      forSale: rows.filter((r) => r.listing_type !== 'rent').length,
    });
  } catch (err) {
    console.error('GET /areas/:slug error:', err);
    return res.status(500).json({ error: 'Could not load this area.' });
  }
});

/* GET /api/areas/:slug/posts?category=&sort=recent|helpful&offset= — the board. */
router.get('/:slug/posts', async (req, res) => {
  const area = areaFor(req.params.slug);
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
  const area = areaFor(req.params.slug);
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
  const area = areaFor(req.params.slug);
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
