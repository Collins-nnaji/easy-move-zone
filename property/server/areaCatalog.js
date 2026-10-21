/**
 * Neighbourhoods: the areas that have a page at /areas/:slug, where residents
 * rate the area and post about its buildings, utilities and streets.
 *
 * An area is opened here, not by users, so every page has a real place behind
 * it and the board starts where we already let and move homes (Lagos, Abuja,
 * Port Harcourt). `match` is every spelling a listing's `area` or `city` may
 * use for it (lower case); `center` places the map; `movingCity` is the city
 * the moving booking form opens on.
 */

const AREAS = [
  // Lagos
  { slug: 'yaba-lagos', name: 'Yaba', city: 'Lagos', state: 'Lagos', center: [6.5095, 3.3711], match: ['yaba', 'sabo', 'akoka', 'onike'], blurb: 'Tech hub and university town on the Mainland: busy, young and well connected.' },
  { slug: 'surulere-lagos', name: 'Surulere', city: 'Lagos', state: 'Lagos', center: [6.4969, 3.3534], match: ['surulere', 'aguda', 'ojuelegba', 'adeniran ogunsanya'], blurb: 'Established Mainland district with markets, schools and the National Stadium.' },
  { slug: 'gbagada-lagos', name: 'Gbagada', city: 'Lagos', state: 'Lagos', center: [6.5536, 3.3870], match: ['gbagada', 'ifako gbagada'], blurb: 'Quiet residential estates between the Mainland and the Third Mainland Bridge.' },
  { slug: 'ikeja-gra-lagos', name: 'Ikeja GRA', city: 'Lagos', state: 'Lagos', center: [6.5833, 3.3500], match: ['ikeja gra', 'ikeja', 'gra ikeja', 'allen', 'opebi', 'alausa'], blurb: 'The state capital: offices, the airport and leafy GRA streets.' },
  { slug: 'magodo-lagos', name: 'Magodo', city: 'Lagos', state: 'Lagos', center: [6.6156, 3.3855], match: ['magodo', 'magodo phase 1', 'magodo phase 2'], blurb: 'Gated estate living on the Lagos-Ibadan corridor.' },
  { slug: 'lekki-phase-1-lagos', name: 'Lekki Phase 1', city: 'Lagos', state: 'Lagos', center: [6.4474, 3.4723], match: ['lekki phase 1', 'lekki phase i', 'lekki'], blurb: 'Island living close to Victoria Island, with the traffic to match.' },
  { slug: 'ajah-lagos', name: 'Ajah', city: 'Lagos', state: 'Lagos', center: [6.4698, 3.5852], match: ['ajah', 'abraham adesanya', 'badore', 'sangotedo'], blurb: 'Fast-growing Lekki corridor: newer builds and lower rents further out.' },
  { slug: 'ikoyi-lagos', name: 'Ikoyi', city: 'Lagos', state: 'Lagos', center: [6.4520, 3.4350], match: ['ikoyi', 'old ikoyi', 'banana island'], blurb: 'Prime Island address with high-rise apartments and embassies.' },
  { slug: 'victoria-island-lagos', name: 'Victoria Island', city: 'Lagos', state: 'Lagos', center: [6.4281, 3.4219], match: ['victoria island', 'v.i', 'vi', 'oniru'], blurb: 'The business district: offices, hotels and serviced apartments.' },
  // Abuja
  { slug: 'wuse-2-abuja', name: 'Wuse 2', city: 'Abuja', state: 'FCT - Abuja', center: [9.0800, 7.4700], match: ['wuse 2', 'wuse ii', 'wuse'], blurb: 'Central Abuja: restaurants, offices and apartment blocks.' },
  { slug: 'maitama-abuja', name: 'Maitama', city: 'Abuja', state: 'FCT - Abuja', center: [9.0882, 7.4934], match: ['maitama'], blurb: 'Abuja’s premium district of embassies and large homes.' },
  { slug: 'gwarinpa-abuja', name: 'Gwarinpa', city: 'Abuja', state: 'FCT - Abuja', center: [9.1036, 7.4044], match: ['gwarinpa', 'gwarimpa'], blurb: 'One of Africa’s largest housing estates, popular with families.' },
  { slug: 'lugbe-abuja', name: 'Lugbe', city: 'Abuja', state: 'FCT - Abuja', center: [8.9800, 7.3800], match: ['lugbe'], blurb: 'Airport-road suburb with some of the capital’s more affordable rents.' },
  // Port Harcourt
  { slug: 'gra-port-harcourt', name: 'GRA', city: 'Port Harcourt', state: 'Rivers', center: [4.8240, 7.0060], match: ['gra', 'gra phase 2', 'old gra', 'port harcourt gra'], blurb: 'The established heart of Port Harcourt: offices, hotels and family homes.' },
  { slug: 'rumuola-port-harcourt', name: 'Rumuola', city: 'Port Harcourt', state: 'Rivers', center: [4.8350, 7.0130], match: ['rumuola', 'rumuokwuta', 'rumuibekwe'], blurb: 'Central residential area off the Aba Road.' },
];

const BY_SLUG = Object.fromEntries(AREAS.map((a) => [a.slug, a]));

/** The area for a slug, or null. */
function areaFor(slug) {
  return BY_SLUG[String(slug || '').toLowerCase()] || null;
}

/**
 * The area a place belongs to, from a listing's or property's `area`, `city`
 * and `state`. The city or state must agree (that tells Ikeja GRA from Port
 * Harcourt GRA); a place recorded with the district as its city ("Yaba",
 * Lagos) is matched on the city too. Null when none of our areas match.
 */
function areaForPlace({ area, city, state } = {}) {
  const a = String(area || '').trim().toLowerCase();
  const c = String(city || '').trim().toLowerCase();
  const s = String(state || '').trim().toLowerCase();
  const within = (x, ...places) => {
    const known = places.filter(Boolean);
    return !known.length || known.some((v) => v === x.city.toLowerCase() || v === x.state.toLowerCase());
  };
  return (a && AREAS.find((x) => x.match.includes(a) && within(x, c, s)))
    || (c && AREAS.find((x) => x.match.includes(c) && within(x, s)))
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
  AREAS, areaFor, areaForPlace, RATING_FACTORS, RATING_IDS, POST_CATEGORIES, POST_CATEGORY_IDS,
  annualRent, displayName,
};
