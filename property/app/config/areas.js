/**
 * The factors residents score an area on. Ids mirror RATING_FACTORS in
 * server/areaCatalog.js; the area page gets the full list from the API, this
 * copy is for the Neighbourhoods index, which lists areas without it.
 */
export const AREA_FACTORS = [
  { id: 'power', label: 'Power supply', short: 'Power' },
  { id: 'water', label: 'Water', short: 'Water' },
  { id: 'flooding', label: 'Stays dry', short: 'No flooding' },
  { id: 'security', label: 'Safety', short: 'Safety' },
  { id: 'roads', label: 'Roads and access', short: 'Roads' },
  { id: 'noise', label: 'Quiet', short: 'Quiet' },
  { id: 'network', label: 'Mobile and internet', short: 'Internet' },
];

const LABEL = Object.fromEntries(AREA_FACTORS.map((f) => [f.id, f.label.toLowerCase()]));

/**
 * "Find my area": rank rated areas by the average of the factors someone
 * cares about, optionally in one city and under a yearly rent. Areas with no
 * scores on those factors are left out — a match is only shown when
 * residents have actually said something about it. An area with no rent
 * data is kept (we cannot say it is over budget) and flagged.
 *
 * Returns up to `limit` of { area, score, match (0–100), strong, weak, rentUnknown }.
 */
export function matchAreas(areas, { priorities = [], city = '', maxRent = 0, limit = 6 } = {}) {
  if (!priorities.length) return [];
  return (areas || [])
    .filter((a) => !city || a.city === city)
    .filter((a) => !(maxRent > 0 && a.medianRent > maxRent))
    .map((a) => {
      const known = priorities
        .map((id) => ({ id, value: a.averages?.[id] }))
        .filter((f) => f.value != null);
      if (!known.length || !(a.ratings > 0)) return null;
      const score = known.reduce((s, f) => s + f.value, 0) / known.length;
      const sorted = [...known].sort((x, y) => y.value - x.value);
      return {
        area: a,
        score: Math.round(score * 10) / 10,
        match: Math.round((score / 5) * 100),
        strong: sorted.filter((f) => f.value >= 3.5),
        weak: sorted.filter((f) => f.value < 3).reverse(),
        missing: priorities.filter((id) => a.averages?.[id] == null),
        rentUnknown: maxRent > 0 && !a.medianRent,
      };
    })
    .filter(Boolean)
    .sort((x, y) => y.score - x.score || (y.area.ratings || 0) - (x.area.ratings || 0))
    .slice(0, limit);
}

/** "Strong on safety (4.2) and water (3.9)" — the reason a match ranks where it does. */
export function matchReason(m) {
  const say = (list) => list.map((f) => `${LABEL[f.id]} (${f.value.toFixed(1)})`).join(' and ');
  const parts = [];
  if (m.strong.length) parts.push(`Strong on ${say(m.strong.slice(0, 2))}`);
  if (m.weak.length) parts.push(`${parts.length ? 'weaker' : 'Weaker'} on ${say(m.weak.slice(0, 1))}`);
  if (!parts.length) parts.push('Middling on what you picked');
  return parts.join(', ');
}
