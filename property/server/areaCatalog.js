/**
 * Neighbourhoods: what every area page shares. The areas themselves live in
 * the `areas` table (see areaStore.js), seeded from data/areas.json and
 * opened, edited or hidden by staff in Admin → Community. This module holds
 * what does not change per area: how a listing's address finds its area,
 * what residents score, and what a post can be about.
 *
 * An area row is { slug, name, city, state, center: [lat, lng] | null,
 * match: [...], blurb, status }. `match` is every spelling a listing's
 * `area` or `city` may use for it (lower case).
 */

/** Nigerian cities the moving service covers (lib/marketplace/model.ts CITIES). */
const MOVING_CITIES = ['Lagos', 'Abuja', 'Port Harcourt'];

/** A URL slug from a name and city: "Wuse 2", "Abuja" → "wuse-2-abuja". */
function slugify(...parts) {
  return parts.join(' ').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

/**
 * The area a place belongs to, from a listing's or property's `area`, `city`
 * and `state`, among `areas`. The city or state must agree (that tells Ikeja
 * GRA from Port Harcourt GRA); a place recorded with the district as its city
 * ("Yaba", Lagos) is matched on the city too. Null when none match.
 */
function matchPlace(areas, { area, city, state } = {}) {
  const a = String(area || '').trim().toLowerCase();
  const c = String(city || '').trim().toLowerCase();
  const s = String(state || '').trim().toLowerCase();
  const within = (x, ...places) => {
    const known = places.filter(Boolean);
    return !known.length || known.some((v) => v === x.city.toLowerCase() || v === x.state.toLowerCase());
  };
  return (a && areas.find((x) => x.match.includes(a) && within(x, c, s)))
    || (c && areas.find((x) => x.match.includes(c) && within(x, s)))
    || null;
}

/** The scores residents give an area. 5 is always the good end. */
const RATING_FACTORS = [
  { id: 'power', label: 'Power supply', low: 'Rarely on', high: 'Nearly always on' },
  { id: 'water', label: 'Water', low: 'Unreliable', high: 'Steady supply' },
  { id: 'flooding', label: 'Stays dry', low: 'Floods often', high: 'Never floods' },
  { id: 'security', label: 'Safety', low: 'Feels unsafe', high: 'Feels safe' },
  { id: 'roads', label: 'Roads and access', low: 'Bad roads', high: 'Good roads' },
  { id: 'noise', label: 'Quiet', low: 'Very noisy', high: 'Very quiet' },
  { id: 'network', label: 'Mobile and internet', low: 'Poor signal', high: 'Strong signal' },
];
const RATING_IDS = RATING_FACTORS.map((f) => f.id);

/**
 * What a post is about. Posts are about places and experiences (a building,
 * a street, the water supply), never about a named person: the board is for
 * what it is like to live somewhere.
 */
const POST_CATEGORIES = [
  { id: 'building', label: 'Building or property' },
  { id: 'utilities', label: 'Power and water' },
  { id: 'flooding', label: 'Flooding and roads' },
  { id: 'safety', label: 'Safety' },
  { id: 'transport', label: 'Getting around' },
  { id: 'amenities', label: 'Shops, schools and services' },
  { id: 'question', label: 'Question' },
];
const POST_CATEGORY_IDS = POST_CATEGORIES.map((c) => c.id);

/** A rent as a yearly figure, the way Nigerian rents are quoted. */
function annualRent(price, frequency) {
  const n = Number(price);
  if (!(n > 0)) return null;
  return n * ({ monthly: 12, quarterly: 4, biannual: 2 }[frequency] || 1);
}

/** "Ada Okafor" → "Ada O."; null when the author would rather not be named. */
function displayName(user, showName) {
  if (!showName) return null;
  const parts = String(user?.name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const first = parts[0].slice(0, 40);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1][0].toUpperCase()}.` : first;
}

module.exports = {
  MOVING_CITIES, slugify, matchPlace, RATING_FACTORS, RATING_IDS, POST_CATEGORIES, POST_CATEGORY_IDS,
  annualRent, displayName,
};
