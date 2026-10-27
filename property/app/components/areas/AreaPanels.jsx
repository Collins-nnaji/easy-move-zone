import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaCheckCircle, FaHospital, FaSchool, FaShoppingBasket, FaShieldAlt, FaUniversity,
  FaPrescriptionBottleAlt, FaGasPump, FaBus, FaRoute, FaTruck, FaHome, FaClipboardCheck, FaChevronDown,
} from 'react-icons/fa';
import { api } from '../../api';
import { formatMoney } from '../../utils/format';
import { RENT_URL, OFFER_VERIFY_URL, MOVING_URL } from '../../config/platform';
import {
  Panel, PrimaryBtn, ErrorText, SignInLink,
} from './shared';

/**
 * The panels of an area page: residents' scores (and the form to add yours,
 * folded away until asked for), typical rents on our own listings, next
 * steps, location tools and the board's rules.
 */

/* ── Scores ───────────────────────────────────────────────────────── */

const Bars = styled.ul`
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem;
  li { display: grid; grid-template-columns: minmax(0, 1fr) 2.2rem; gap: 0.3rem 0.6rem; align-items: center; font-size: 0.85rem; }
  .label { grid-column: 1 / -1; display: flex; justify-content: space-between; color: var(--color-ink); font-weight: 600; }
  .track { height: 8px; border-radius: 999px; background: var(--color-bg-sunken); overflow: hidden; }
  .fill { height: 100%; border-radius: inherit; background: var(--color-green); }
  .fill.low { background: #c2410c; }
  .fill.mid { background: #d4a017; }
  .val { font-weight: 700; text-align: right; color: var(--color-ink); }
  .none { color: var(--color-ink-faint); font-weight: 500; }
`;
const RateToggle = styled.button`
  display: inline-flex; align-items: center; gap: 0.45rem; margin-top: 1.1rem; min-height: 40px; padding: 0 1rem;
  border-radius: 10px; border: 1px solid var(--color-green-deep); background: #fff; color: var(--color-green-deep);
  font-weight: 700; font-size: 0.85rem; cursor: pointer;
  &:hover, &[aria-expanded='true'] { background: var(--color-green-soft); }
  svg { font-size: 0.65rem; transition: transform 0.15s ease; }
  &[aria-expanded='true'] svg { transform: rotate(180deg); }
`;
const RateForm = styled.form`
  margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-line);
  h3 { margin: 0 0 0.2rem; font-size: 0.95rem; }
  .hint { margin: 0 0 0.8rem; font-size: 0.8rem; color: var(--color-ink-muted); }
  fieldset { border: 0; padding: 0; margin: 0 0 0.7rem; }
  legend { font-size: 0.82rem; font-weight: 600; margin-bottom: 0.3rem; padding: 0; }
  .scale { display: flex; gap: 0.3rem; align-items: center; flex-wrap: wrap; max-width: 100%; }
  .ends { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-ink-faint); margin-top: 0.2rem; max-width: 222px; }
  .done { display: flex; align-items: center; gap: 0.4rem; color: var(--color-green-deep); font-weight: 600; font-size: 0.85rem; margin-top: 0.6rem; }
`;
const Dot = styled.button`
  flex: 1 1 36px; max-width: 44px; min-width: 32px; height: 36px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.85rem;
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : 'var(--color-ink)')};
`;

const tone = (v) => (v < 2.5 ? 'low' : v < 3.5 ? 'mid' : '');

export function AreaScores({ data, onRated }) {
  const { area, factors, ratings, myRating, viewer } = data;
  const [scores, setScores] = useState(myRating || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  // The seven-question form is long; it opens on request, not by default.
  const [rating, setRating] = useState(false);

  useEffect(() => { setScores(myRating || {}); }, [myRating]);

  const pick = (id, n) => {
    setSaved(false);
    setScores((s) => ({ ...s, [id]: s[id] === n ? null : n }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      onRated(await api.areas.rate(area.slug, scores));
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save your scores.');
    } finally {
      setSaving(false);
    }
  };

  const any = Object.values(scores).some(Boolean);

  return (
    <Panel>
      <h2>What residents score {area.name}</h2>
      <p className="sub">
        {ratings.count
          ? `From ${ratings.count} ${ratings.count === 1 ? 'person' : 'people'}${ratings.verifiedCount ? `, ${ratings.verifiedCount} verified ${ratings.verifiedCount === 1 ? 'resident' : 'residents'}` : ''}. 5 is the good end.`
          : 'Nobody has scored this area yet. Be the first.'}
      </p>
      <Bars>
        {factors.map((f) => {
          const v = ratings.averages[f.id];
          return (
            <li key={f.id}>
              <span className="label">{f.label}</span>
              <span className="track" aria-hidden><span className={`fill ${v != null ? tone(v) : ''}`} style={{ width: `${v != null ? (v / 5) * 100 : 0}%`, display: 'block' }} /></span>
              <span className="val">{v != null ? v.toFixed(1) : <span className="none">—</span>}</span>
            </li>
          );
        })}
      </Bars>

      {viewer.signedIn && (
        <RateToggle type="button" aria-expanded={rating} aria-controls="area-rate" onClick={() => setRating((v) => !v)}>
          {myRating ? 'Update my scores' : `Live here? Score ${area.name}`} <FaChevronDown aria-hidden />
        </RateToggle>
      )}
      {viewer.signedIn ? rating && (
        <RateForm id="area-rate" onSubmit={save}>
          <h3>{myRating ? 'Your scores' : `Score ${area.name}`}</h3>
          <p className="hint">Score what you know. Leave anything else blank.</p>
          {factors.map((f) => (
            <fieldset key={f.id}>
              <legend>{f.label}</legend>
              <div className="scale">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Dot key={n} type="button" $on={scores[f.id] === n} aria-pressed={scores[f.id] === n} aria-label={`${f.label}: ${n} of 5`} onClick={() => pick(f.id, n)}>{n}</Dot>
                ))}
              </div>
              <div className="ends"><span>{f.low}</span><span>{f.high}</span></div>
            </fieldset>
          ))}
          <PrimaryBtn type="submit" disabled={saving || !any}>{saving ? 'Saving…' : myRating ? 'Update my scores' : 'Save my scores'}</PrimaryBtn>
          {saved && <div className="done"><FaCheckCircle /> Thanks, your scores are in.</div>}
          {error && <ErrorText>{error}</ErrorText>}
        </RateForm>
      ) : (
        <p className="sub" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Live here? <SignInLink>Sign in to add your scores</SignInLink>
        </p>
      )}
    </Panel>
  );
}

/* ── Rents ────────────────────────────────────────────────────────── */

const RentTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.86rem;
  th { text-align: left; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); font-weight: 700; padding: 0 0 0.45rem; }
  td { padding: 0.55rem 0; border-top: 1px solid var(--color-line); vertical-align: top; }
  td small { display: block; color: var(--color-ink-faint); font-size: 0.75rem; }
  td.num { text-align: right; font-weight: 700; }
`;
const TextLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.85rem; font-weight: 700; font-size: 0.86rem; color: var(--color-green-deep);
  &:hover { text-decoration: underline; }
`;

const bedsLabel = (b) => (/^\d+$/.test(b) ? `${b} bed${b === '1' ? '' : 's'}` : b);

export function AreaRents({ data }) {
  const { area, rents, rentals } = data;
  return (
    <Panel>
      <h2>Rent in {area.name}</h2>
      <p className="sub">Yearly rents on the homes we let here now, as owners ask them. Each listing also shows any service charge and refundable caution deposit, and the tenancy agreement sets the final figures.</p>
      {rents.length ? (
        <RentTable>
          <thead><tr><th>Home</th><th style={{ textAlign: 'right' }}>Typical per year</th></tr></thead>
          <tbody>
            {rents.map((r) => (
              <tr key={r.beds}>
                <td>{bedsLabel(r.beds)}<small>{r.count} {r.count === 1 ? 'home' : 'homes'}</small></td>
                <td className="num">
                  {formatMoney(r.median, r.currency)}
                  {r.count > 1 && <small>{formatMoney(r.low, r.currency)} to {formatMoney(r.high, r.currency)}</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </RentTable>
      ) : (
        <p className="sub" style={{ margin: 0 }}>We have no homes to rent here right now, so there is no rent guide yet.</p>
      )}
      <TextLink to={`${RENT_URL}?q=${encodeURIComponent(area.name)}`}>
        {rentals ? `See ${rentals} ${rentals === 1 ? 'home' : 'homes'} to rent` : 'Browse homes to rent'} <FaArrowRight size={10} />
      </TextLink>
    </Panel>
  );
}

/* ── Location tools ───────────────────────────────────────────────── */

const MapFrame = styled.iframe`
  display: block; width: 100%; height: 100%; min-height: 240px; border: 0; border-radius: 12px; background: var(--color-bg-sunken);
`;
/* Map on the left, commute and nearby on the right; stacked on narrow screens. */
const ToolsGrid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 1.25rem; align-items: stretch;
  > div > h3:first-child { margin-top: 0; }
  @media (max-width: 860px) { grid-template-columns: minmax(0, 1fr); gap: 0; > div > h3:first-child { margin-top: 1.1rem; } }
`;
const ToolHead = styled.h3`margin: 1.1rem 0 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; svg { color: var(--color-green); }`;
const Commute = styled.form`
  display: flex; flex-direction: column; gap: 0.5rem;
  input { min-height: 44px; border: 1px solid var(--color-line-strong); border-radius: 11px; padding: 0 0.8rem; font: inherit; }
  input:focus { outline: none; border-color: var(--color-green); }
  .modes { display: flex; gap: 0.4rem; }
  .modes button { flex: 1; }
`;
const Nearby = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem;
  @media (min-width: 861px) and (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 380px) { grid-template-columns: minmax(0, 1fr); }
  a { display: flex; align-items: center; gap: 0.45rem; padding: 0.55rem 0.65rem; border-radius: 10px; border: 1px solid var(--color-line); font-size: 0.82rem; font-weight: 600; color: var(--color-ink); }
  a:hover { border-color: rgba(47, 93, 80, 0.4); color: var(--color-green-deep); }
  svg { color: var(--color-green); flex-shrink: 0; }
`;
const Next = styled(Link)`
  display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 0.9rem; border-radius: 12px; margin-top: 0.5rem;
  background: var(--color-green-soft); color: var(--color-ink); font-weight: 700; font-size: 0.88rem;
  .ic { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: #fff; color: var(--color-green-deep); flex-shrink: 0; }
  small { display: block; font-weight: 400; color: var(--color-ink-muted); font-size: 0.78rem; }
  > svg { margin-left: auto; color: var(--color-green-deep); flex-shrink: 0; }
  &:hover { background: var(--color-green-chip); }
`;
const SmallBtn = styled.button`
  min-height: 40px; border-radius: 10px; font-weight: 700; font-size: 0.82rem; cursor: pointer;
  border: 1px solid ${(p) => (p.$primary ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$primary ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$primary ? '#fff' : 'var(--color-ink)')};
  &:disabled { opacity: 0.5; cursor: default; }
`;

const NEARBY = [
  { label: 'Hospitals', q: 'hospitals', icon: FaHospital },
  { label: 'Pharmacies', q: 'pharmacies', icon: FaPrescriptionBottleAlt },
  { label: 'Schools', q: 'schools', icon: FaSchool },
  { label: 'Markets', q: 'markets and supermarkets', icon: FaShoppingBasket },
  { label: 'Police', q: 'police stations', icon: FaShieldAlt },
  { label: 'Banks', q: 'banks', icon: FaUniversity },
  { label: 'Fuel stations', q: 'petrol stations', icon: FaGasPump },
  { label: 'Bus stops', q: 'bus stops', icon: FaBus },
];

/**
 * No maps key needed: the map is an OpenStreetMap embed (or, for an area
 * staff opened without a map point, a Google Maps search embed), and the
 * commute and "nearby" tools open Google Maps on the visitor's device, which
 * uses live traffic.
 */
function mapSrc(area, where) {
  if (!area.center) return `https://maps.google.com/maps?q=${encodeURIComponent(where)}&z=14&output=embed`;
  const [lat, lng] = area.center;
  const bbox = [lng - 0.025, lat - 0.018, lng + 0.025, lat + 0.018].map((n) => n.toFixed(4)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function AreaTools({ area }) {
  const [work, setWork] = useState('');
  const where = `${area.name}, ${area.city}, Nigeria`;
  const directions = (mode) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(where)}&destination=${encodeURIComponent(`${work}, ${area.city}, Nigeria`)}&travelmode=${mode}`;
  const open = (mode) => window.open(directions(mode), '_blank', 'noopener,noreferrer');

  return (
    <Panel>
      <h2>Location tools</h2>
      <p className="sub">Check the area from where you are.</p>
      <ToolsGrid>
        <MapFrame
          title={`Map of ${area.name}`}
          loading="lazy"
          src={mapSrc(area, where)}
        />
        <div>
          <ToolHead><FaRoute /> Commute check</ToolHead>
          <Commute onSubmit={(e) => { e.preventDefault(); if (work.trim()) open('driving'); }}>
            <input value={work} onChange={(e) => setWork(e.target.value)} placeholder="Where do you work or study?" aria-label="Where do you work or study" />
            <div className="modes">
              <SmallBtn type="submit" $primary disabled={!work.trim()}>By car</SmallBtn>
              <SmallBtn type="button" disabled={!work.trim()} onClick={() => open('transit')}>By bus</SmallBtn>
            </div>
          </Commute>

          <ToolHead><FaHospital /> What&rsquo;s nearby</ToolHead>
          <Nearby>
            {NEARBY.map(({ label, q, icon: Icon }) => (
              <a key={label} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${q} near ${where}`)}`} target="_blank" rel="noopener noreferrer">
                <Icon /> {label}
              </a>
            ))}
          </Nearby>
        </div>
      </ToolsGrid>
    </Panel>
  );
}

/* ── Next steps ───────────────────────────────────────────────────── */

export function AreaNextSteps({ area }) {
  return (
    <Panel>
      <h2>Thinking of moving to {area.name}?</h2>
      <p className="sub">Where to go from here.</p>
      <Next to={`${RENT_URL}?q=${encodeURIComponent(area.name)}`}>
        <span className="ic"><FaHome /></span><span>Homes to rent here<small>Let and managed by us</small></span><FaArrowRight size={11} />
      </Next>
      <Next to={OFFER_VERIFY_URL}>
        <span className="ic"><FaClipboardCheck /></span><span>Verify a property before you pay<small>Title, owner and condition checks</small></span><FaArrowRight size={11} />
      </Next>
      {area.movingCity ? (
        <Next to={`${MOVING_URL}/book?area=${encodeURIComponent(area.movingCity)}`}>
          <span className="ic"><FaTruck /></span><span>Plan your move to {area.name}<small>Get a moving price in minutes</small></span><FaArrowRight size={11} />
        </Next>
      ) : (
        <Next to={MOVING_URL}>
          <span className="ic"><FaTruck /></span><span>Moving here from Lagos, Abuja or Port Harcourt?<small>See where our movers go</small></span><FaArrowRight size={11} />
        </Next>
      )}
    </Panel>
  );
}

/* ── Rules ────────────────────────────────────────────────────────── */

const Rules = styled.ul`
  margin: 0; padding-left: 1.1rem; font-size: 0.84rem; line-height: 1.55; color: var(--color-ink-soft);
  li + li { margin-top: 0.3rem; }
`;

export function AreaRules() {
  return (
    <Panel as="section" aria-labelledby="area-rules">
      <h2 id="area-rules">Board rules</h2>
      <Rules>
        <li>Talk about places: buildings, streets, utilities, flooding and safety. Not about named people.</li>
        <li>Share what you saw yourself. Do not accuse anyone of a crime: in an emergency call 112, and report crime to the police.</li>
        <li>No phone numbers, emails or adverts. We remove them.</li>
        <li>Posts that may name or accuse someone wait for a person on our team to read them first.</li>
        <li>See something wrong? Use Report. Posts with several reports are hidden until we review them.</li>
      </Rules>
    </Panel>
  );
}
