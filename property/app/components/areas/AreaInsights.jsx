import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  FaArrowUp, FaArrowDown, FaComments, FaHome, FaStar, FaArrowRight, FaInfoCircle,
} from 'react-icons/fa';
import { formatMoney } from '../../utils/format';
import { Panel } from './shared';

/**
 * "At a glance": what the numbers say about an area, in plain words. Every
 * line comes from data we hold — residents' scores against the rest of the
 * city, what the board has talked about lately, our rents against the city's
 * — and says how much it rests on. Nothing here is guessed.
 */

const STRONG = 3.5;
const WEAK = 3;
const CLOSE = 0.3;
/** Fewer ratings than this and the summary says it is an early read. */
const EARLY = 5;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: 1.1rem 1.5rem;
  margin-top: 0.4rem;

  h3 { display: flex; align-items: center; gap: 0.4rem; margin: 0 0 0.5rem; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); }
  h3 svg { font-size: 0.7rem; }
  h3.good svg { color: var(--color-green); }
  h3.bad svg { color: #c2410c; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
  li { font-size: 0.9rem; line-height: 1.4; color: var(--color-ink); }
  li b { font-weight: 700; }
  li span { color: var(--color-ink-muted); }
`;

const Basis = styled.p`
  display: flex; align-items: flex-start; gap: 0.45rem;
  margin: 0 0 0.9rem; font-size: 0.82rem; color: var(--color-ink-muted);
  svg { flex-shrink: 0; margin-top: 0.2rem; font-size: 0.75rem; }
`;

const Alts = styled.div`
  ${(p) => (p.$bare ? '' : 'margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid var(--color-line);')}
  h3 { margin: 0 0 0.6rem; font-size: 0.95rem; }
  .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0.6rem; }
`;

const Alt = styled(Link)`
  display: flex; flex-direction: column; gap: 0.2rem; padding: 0.75rem 0.85rem; border-radius: 12px;
  border: 1px solid var(--color-line); color: var(--color-ink);
  .n { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
  .n span { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; }
  .n svg { color: #d4a017; font-size: 0.75rem; }
  .w { font-size: 0.8rem; color: var(--color-ink-muted); line-height: 1.4; }
  .w b { color: var(--color-green-deep); font-weight: 650; }
  &:hover { border-color: var(--color-green); }
`;

const Start = styled.a`
  display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; color: var(--color-green-deep);
`;

function compare(value, avg, city) {
  if (avg == null) return null;
  if (value - avg >= CLOSE) return `better than most of ${city} (${avg.toFixed(1)})`;
  if (avg - value >= CLOSE) return `below the ${city} average (${avg.toFixed(1)})`;
  return `about the ${city} average`;
}

const bedsWord = (b) => (/^\d+$/.test(b) ? `${b}-bed` : String(b).toLowerCase());

/** The bedroom size with the most homes here, compared with the same size across the city. */
function rentLine(rents, cityRents, city) {
  const here = [...(rents || [])].sort((a, b) => b.count - a.count)[0];
  if (!here) return null;
  const there = (cityRents || []).find((r) => r.beds === here.beds);
  const typical = formatMoney(here.median, here.currency);
  if (!there || there.count <= here.count || !there.median) {
    return <>A {bedsWord(here.beds)} is about <b>{typical}</b> a year here, from {here.count} {here.count === 1 ? 'home' : 'homes'} we let.</>;
  }
  const pct = Math.round(((here.median - there.median) / there.median) * 100);
  const vs = Math.abs(pct) < 5 ? `in line with ${city}` : `${Math.abs(pct)}% ${pct < 0 ? 'below' : 'above'} the ${city} typical (${formatMoney(there.median, there.currency)})`;
  return <>A {bedsWord(here.beds)} is about <b>{typical}</b> a year here, {vs}.</>;
}

/** Up to three factors residents score highest (3.5+) and lowest (under 3). */
export function strongAndWeak(factors, ratings) {
  const scored = factors
    .map((f) => ({ id: f.id, value: ratings.averages[f.id] }))
    .filter((f) => f.value != null);
  return {
    strengths: scored.filter((f) => f.value >= STRONG).sort((a, b) => b.value - a.value).slice(0, 3),
    weak: scored.filter((f) => f.value < WEAK).sort((a, b) => a.value - b.value).slice(0, 3),
  };
}

/** Areas in the same city that score better where this one is weak. */
export function AreaAlternatives({ data, bare = false }) {
  const { area, factors, ratings, insights } = data;
  const alternatives = insights?.alternatives || [];
  if (!alternatives.length) return null;
  const label = Object.fromEntries(factors.map((f) => [f.id, f.label]));
  const { weak } = strongAndWeak(factors, ratings);
  return (
    <Alts $bare={bare}>
      {!bare && <h3>{weak.length ? `Weighing up ${area.name}? Areas in ${insights.city} that score better where it is weak` : `Other areas residents rate in ${insights.city}`}</h3>}
      <div className="row">
        {alternatives.map((a) => (
          <Alt key={a.slug} to={`/areas/${a.slug}`}>
            <span className="n">{a.name}{a.overall != null && <span><FaStar aria-hidden="true" /> {a.overall.toFixed(1)}</span>}</span>
            <span className="w">
              {a.better.length
                ? <>Better for {a.better.map((b, i) => <React.Fragment key={b.id}>{i ? ' and ' : ''}<b>{label[b.id].toLowerCase()}</b> ({b.value.toFixed(1)} vs {b.here.toFixed(1)})</React.Fragment>)}</>
                : <>{a.count} {a.count === 1 ? 'rating' : 'ratings'}</>}
              {a.medianRent ? ` · typical rent ${formatMoney(a.medianRent, 'NGN')}/yr` : ''}
            </span>
          </Alt>
        ))}
      </div>
    </Alts>
  );
}

export default function AreaInsights({ data }) {
  const { area, factors, ratings, rents, categories, insights } = data;
  if (!insights) return null;
  const { city, cityAverages = {}, cityRents, topics = [], cityAreas } = insights;
  const label = Object.fromEntries(factors.map((f) => [f.id, f.label]));
  const catLabel = Object.fromEntries((categories || []).map((c) => [c.id, c.label]));
  const { strengths, weak } = strongAndWeak(factors, ratings);
  const compareCity = cityAreas > 1;
  const rent = rentLine(rents, compareCity ? cityRents : null, city);

  return (
    <Panel aria-labelledby="area-glance">
      <h2 id="area-glance">{area.name} at a glance</h2>
      <Basis>
        <FaInfoCircle aria-hidden="true" />
        <span>
          {ratings.count === 0
            ? 'No resident has scored this area yet, so there is no summary of the light, water or safety here.'
            : `From ${ratings.count} ${ratings.count === 1 ? 'resident' : 'residents'}${ratings.verifiedCount ? ` (${ratings.verifiedCount} verified)` : ''}${ratings.count < EARLY ? ': an early read, so treat it as a starting point' : ''}${compareCity ? `, compared with ${cityAreas} areas across ${city}` : ''}.`}
        </span>
      </Basis>

      <Grid>
        {ratings.count > 0 && (
          <div>
            <h3 className="good"><FaArrowUp /> What residents like</h3>
            {strengths.length ? (
              <ul>{strengths.map((f) => <li key={f.id}><b>{label[f.id]} {f.value.toFixed(1)}</b>{compareCity && <span> · {compare(f.value, cityAverages[f.id], city)}</span>}</li>)}</ul>
            ) : <ul><li><span>Nothing stands out yet: no score is above {STRONG}.</span></li></ul>}
          </div>
        )}
        {ratings.count > 0 && (
          <div>
            <h3 className="bad"><FaArrowDown /> Worth checking before you move</h3>
            {weak.length ? (
              <ul>{weak.map((f) => <li key={f.id}><b>{label[f.id]} {f.value.toFixed(1)}</b>{compareCity && <span> · {compare(f.value, cityAverages[f.id], city)}</span>}</li>)}</ul>
            ) : <ul><li><span>No weak spots: every score is {WEAK} or more.</span></li></ul>}
          </div>
        )}
        {(topics.length > 0 || rent) && (
          <div>
            {topics.length > 0 && (
              <>
                <h3><FaComments /> On the board lately</h3>
                <ul style={{ marginBottom: rent ? '0.9rem' : 0 }}>
                  <li><span>In the last 3 months: </span>{topics.slice(0, 3).map((t, i) => <React.Fragment key={t.category}>{i ? ', ' : ''}<b>{catLabel[t.category] || t.category}</b> ({t.count})</React.Fragment>)}</li>
                </ul>
              </>
            )}
            {rent && (
              <>
                <h3><FaHome /> Rent</h3>
                <ul><li>{rent}</li></ul>
              </>
            )}
          </div>
        )}
        {ratings.count === 0 && (
          <div>
            <h3>Live here?</h3>
            <ul><li><Start href="#scores">Be the first to score {area.name} <FaArrowRight size={10} /></Start></li></ul>
          </div>
        )}
      </Grid>

      <AreaAlternatives data={data} />
    </Panel>
  );
}
