const { pool } = require('../db');
const { planOf } = require('../agentPlans');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v, max = 255) {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
}

function slugify(text, fallback = 'agency') {
  const base = String(text || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || fallback;
}

function makeRef(prefix = 'AG') {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${n}`;
}

function listingSlug(title, ref) {
  return `${slugify(title, 'property')}-${String(ref).toLowerCase()}`;
}

/** Active membership for a signed-in user, plus the agency row. */
async function loadMembership(user) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return null;
  const { rows } = await pool.query(
    `SELECT m.id AS member_id, m.role AS member_role, m.status AS member_status,
            m.user_id, m.email AS member_email,
            a.id AS agency_id, a.ref, a.slug, a.name, a.legal_name, a.email, a.phone,
            a.website, a.bio, a.logo, a.address, a.area, a.city, a.state, a.country,
            a.license_number, a.verification_status, a.verified_at, a.plan,
            a.listing_quota, a.admin_note, a.created_at
       FROM agency_members m
       JOIN agencies a ON a.id = m.agency_id
      WHERE lower(m.email) = $1 AND m.status = 'active'
      ORDER BY CASE a.verification_status
                 WHEN 'verified' THEN 0
                 WHEN 'pending' THEN 1
                 WHEN 'suspended' THEN 2
                 ELSE 3
               END, m.id
      LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function liveAndQueuedCount(agencyId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM listings
      WHERE agency_id = $1 AND status IN ('live','pending_review')`,
    [agencyId]
  );
  return rows[0]?.n || 0;
}

async function assertQuota(agency, extra = 1) {
  const quota = Number(agency.listing_quota) || 0;
  if (quota <= 0) {
    const err = new Error('Choose an agent plan before submitting a listing.');
    err.status = 402;
    throw err;
  }
  const used = await liveAndQueuedCount(agency.agency_id || agency.id);
  if (used + extra > quota) {
    const err = new Error(`Your ${agency.plan} plan allows ${quota} live listings. Upgrade or withdraw one first.`);
    err.status = 402;
    throw err;
  }
}

async function applyPlan(agencyId, planId, { status = 'active' } = {}) {
  const plan = planOf(planId);
  if (!plan) {
    const err = new Error('Unknown plan.');
    err.status = 400;
    throw err;
  }
  const { rows } = await pool.query(
    `UPDATE agencies
        SET plan = $2, listing_quota = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
    [agencyId, plan.id, plan.quota]
  );
  return { agency: rows[0], plan, status };
}

/** Best-effort sync so Admin → Accounts still shows the agent flags. */
async function syncUserProfile(user, { isAgent = true, verified = false, company = null } = {}) {
  const userId = user?.id && user.id !== 'dev' ? String(user.id) : null;
  const email = String(user?.email || '').trim().toLowerCase();
  if (!userId && !email) return;
  try {
    if (userId) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, is_agent, agent_verified, agent_company)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           is_agent = EXCLUDED.is_agent,
           agent_verified = EXCLUDED.agent_verified,
           agent_company = COALESCE(EXCLUDED.agent_company, user_profiles.agent_company),
           updated_at = NOW()`,
        [userId, isAgent, verified, company]
      );
    }
  } catch (err) {
    console.warn('syncUserProfile:', err.message);
  }
}

async function notifyAgency({ agencyId, kind, title, body, link }) {
  const { notify } = require('./notify');
  const { rows } = await pool.query(
    `SELECT DISTINCT lower(email) AS email FROM (
        SELECT email FROM agencies WHERE id = $1
        UNION
        SELECT email FROM agency_members WHERE agency_id = $1 AND status = 'active'
      ) x WHERE email IS NOT NULL AND email <> ''`,
    [agencyId]
  );
  await Promise.all(rows.map((r) => notify({
    to: { email: r.email },
    audience: 'agent',
    kind,
    title,
    body,
    link,
  })));
}

const PUBLIC_AGENCY_COLUMNS = `
  id, ref, slug, name, phone, website, bio, logo, address, area, city, state, country,
  verification_status, plan, created_at
`;

module.exports = {
  EMAIL_RE,
  clean,
  slugify,
  makeRef,
  listingSlug,
  loadMembership,
  liveAndQueuedCount,
  assertQuota,
  applyPlan,
  syncUserProfile,
  notifyAgency,
  PUBLIC_AGENCY_COLUMNS,
};
