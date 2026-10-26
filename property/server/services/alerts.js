const { pool } = require('../db');
const { notify } = require('./notify');

function matches(listing, filters = {}) {
  const f = filters || {};
  if (f.mode && listing.listing_type !== (f.mode === 'rent' ? 'rent' : 'sale')) return false;
  if (f.state && String(listing.state || '').toLowerCase() !== String(f.state).toLowerCase()) return false;
  if (f.city && String(listing.city || '').toLowerCase() !== String(f.city).toLowerCase()) return false;
  if (f.country && String(listing.country || '').toLowerCase() !== String(f.country).toLowerCase()) return false;
  if (f.type && String(listing.property_type || '').toLowerCase() !== String(f.type).toLowerCase()) return false;
  if (f.beds && String(listing.beds) !== String(f.beds)) return false;
  if (f.route && listing.route !== f.route) return false;
  if (f.q) {
    const hay = [listing.title, listing.area, listing.city, listing.state].join(' ').toLowerCase();
    if (!hay.includes(String(f.q).toLowerCase())) return false;
  }
  const price = Number(listing.price || listing.list_price || listing.guide_price) || 0;
  if (f.minPrice && price < Number(f.minPrice)) return false;
  if (f.maxPrice && price > Number(f.maxPrice)) return false;
  return true;
}

/**
 * Email people who saved a search when a matching listing went live since
 * their last notice (or in the last day on the first run).
 */
async function runListingAlerts() {
  const { rows: searches } = await pool.query(
    `SELECT * FROM user_saved_searches WHERE alert_enabled = true`
  );
  if (!searches.length) return { searches: 0, sent: 0 };

  const { rows: listings } = await pool.query(
    `SELECT id, slug, title, area, city, state, country, property_type, beds,
            listing_type, route, COALESCE(list_price, guide_price) AS price,
            published_at
       FROM listings
      WHERE status = 'live' AND published_at > NOW() - INTERVAL '2 days'`
  );

  let sent = 0;
  for (const search of searches) {
    const since = search.last_notified_at ? new Date(search.last_notified_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hits = listings.filter((l) => new Date(l.published_at) > since && matches(l, search.filters));
    if (!hits.length) continue;
    const first = hits[0];
    const extra = hits.length > 1 ? ` and ${hits.length - 1} more` : '';
    await notify({
      to: { email: search.email },
      audience: 'owner',
      kind: 'listing_alert',
      title: `New match: ${first.title}${extra}`,
      body: search.name
        ? `${hits.length} new propert${hits.length === 1 ? 'y' : 'ies'} match “${search.name}”.`
        : `${hits.length} new propert${hits.length === 1 ? 'y' : 'ies'} match a search you saved.`,
      link: `/listings/${first.slug || first.id}`,
    });
    await pool.query('UPDATE user_saved_searches SET last_notified_at = NOW() WHERE id = $1', [search.id]);
    sent += 1;
  }
  return { searches: searches.length, sent };
}

module.exports = { runListingAlerts, matches };
