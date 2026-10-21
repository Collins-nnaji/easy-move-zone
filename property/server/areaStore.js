const { pool } = require('./db');
const { matchPlace } = require('./areaCatalog');

/**
 * The neighbourhoods, read from the `areas` table. Every page view and every
 * listing needs them, and they change only when staff edit one, so each
 * server instance keeps them for CACHE_MS; an edit here clears it at once
 * (other instances catch up within the minute).
 */

const CACHE_MS = 60 * 1000;
let cache = null;
let cachedAt = 0;

function toArea(row) {
  return {
    slug: row.slug,
    name: row.name,
    city: row.city,
    state: row.state,
    center: row.lat != null && row.lng != null ? [Number(row.lat), Number(row.lng)] : null,
    match: row.match || [],
    blurb: row.blurb || '',
    status: row.status,
    created_at: row.created_at,
  };
}

/** Every area, live and hidden. */
async function allAreas() {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;
  const { rows } = await pool.query('SELECT * FROM areas ORDER BY state, city, name');
  cache = rows.map(toArea);
  cachedAt = Date.now();
  return cache;
}

/** The areas with a public page. */
async function liveAreas() {
  return (await allAreas()).filter((a) => a.status === 'live');
}

/** A live area by slug, or null. */
async function getArea(slug) {
  const key = String(slug || '').toLowerCase();
  return (await liveAreas()).find((a) => a.slug === key) || null;
}

/** The live area a listing or managed property sits in, or null. */
async function areaForPlace(place) {
  return matchPlace(await liveAreas(), place);
}

function clearAreaCache() {
  cache = null;
}

module.exports = {
  allAreas, liveAreas, getArea, areaForPlace, clearAreaCache, toArea,
};
