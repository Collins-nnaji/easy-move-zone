/**
 * What an area page can say beyond its own scores, worked out from data we
 * hold — residents' ratings, the board and our live rentals — never guessed:
 *
 *   - how each score compares with the rest of the city,
 *   - what residents have been posting about lately,
 *   - other areas in the same city that do better where this one is weak.
 *
 * Pure functions, so they are tested without a database.
 */
const { RATING_IDS, annualRent } = require('./areaCatalog');

function median(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Each factor averaged across the city's rated areas, weighted by how many
 * people rated each area. `ratingsBySlug[slug]` is a row of per-factor
 * averages plus `count`. Null where nobody in the city scored that factor.
 */
function cityAverages(city, areas, ratingsBySlug) {
  const inCity = areas.filter((a) => a.city === city);
  return Object.fromEntries(RATING_IDS.map((id) => {
    let sum = 0;
    let weight = 0;
    for (const a of inCity) {
      const r = ratingsBySlug[a.slug];
      if (r && r[id] != null && r.count > 0) {
        sum += r[id] * r.count;
        weight += r.count;
      }
    }
    return [id, weight ? round1(sum / weight) : null];
  }));
}

/** The middle yearly rent of the live rentals in a list of listing rows. */
function medianYearlyRent(rows) {
  return median((rows || [])
    .filter((r) => r.listing_type === 'rent')
    .map((r) => annualRent(r.price, r.rent_frequency))
    .filter(Boolean));
}

/**
 * Up to `limit` other rated areas in the same city. When this area has
 * scores, the ones that beat it most on its two weakest factors come first,
 * each naming where it is better; otherwise the best rated come first.
 */
function alternatives(area, areas, ratingsBySlug, { rentBySlug = {}, limit = 3 } = {}) {
  const here = ratingsBySlug[area.slug];
  const weakest = here
    ? RATING_IDS.filter((id) => here[id] != null).sort((a, b) => here[a] - here[b]).slice(0, 2)
    : [];

  return areas
    .filter((a) => a.slug !== area.slug && a.city === area.city && ratingsBySlug[a.slug]?.count > 0)
    .map((a) => {
      const r = ratingsBySlug[a.slug];
      const better = weakest
        .filter((id) => r[id] != null && r[id] > here[id])
        .map((id) => ({ id, value: r[id], here: here[id] }));
      const gain = better.reduce((s, b) => s + (b.value - b.here), 0);
      const known = RATING_IDS.map((id) => r[id]).filter((v) => v != null);
      const overall = known.length ? round1(known.reduce((s, v) => s + v, 0) / known.length) : null;
      return {
        slug: a.slug, name: a.name, city: a.city, overall, count: r.count, better,
        medianRent: rentBySlug[a.slug] ?? null, gain,
      };
    })
    .sort((x, y) => (weakest.length ? y.gain - x.gain : 0) || (y.overall ?? 0) - (x.overall ?? 0))
    .slice(0, limit)
    .map(({ gain: _gain, ...rest }) => rest);
}

/** Post counts by category, busiest first, from `{ category, n }` rows. */
function topics(rows) {
  return (rows || [])
    .map((r) => ({ category: r.category, count: Number(r.n) || 0 }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

module.exports = { cityAverages, alternatives, topics, medianYearlyRent, median };
