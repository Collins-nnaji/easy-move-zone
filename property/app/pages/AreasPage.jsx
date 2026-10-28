import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import {
  FaCheckCircle, FaChevronLeft, FaSearch, FaMapMarkerAlt, FaStar, FaWhatsapp,
} from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import { useIsMobile } from '../utils/useMediaQuery';
import AreaBoard from '../components/areas/AreaBoard';
import {
  AreaScores, AreaRents, AreaTools, AreaRules, AreaNextSteps,
} from '../components/areas/AreaPanels';
import AreaInsights from '../components/areas/AreaInsights';
import { AREA_FACTORS, matchAreas, matchReason } from '../config/areas';
import { formatMoney } from '../utils/format';
import {
  Pill, Score, stateLabel, whatsappShare,
} from '../components/areas/shared';

/**
 * Neighbourhoods. `/areas` lists the areas we cover; `/areas/:slug` is one
 * area on one page: residents' scores, their board of posts, what renting
 * there costs on our own listings, and tools for checking the location
 * (map, commute, what is nearby, a move quote, a property check).
 * The API is property/server/routes/areas.js.
 */

const Page = styled.div`background: var(--color-bg-panel); min-height: 70vh; overflow-x: clip;`;
const Intro = styled.header`
  max-width: 1180px; margin: 0 auto; padding: 1.35rem 1.5rem 0;
  .k { margin: 0; font-size: 0.75rem; font-weight: 750; letter-spacing: 0.07em; text-transform: uppercase; color: var(--color-green-deep); }
  h1 { margin: 0.3rem 0 0.45rem; max-width: 16ch; font-size: clamp(1.7rem, 2.6vw, 2.35rem); letter-spacing: -0.03em; line-height: 1.08; }
  p { margin: 0; max-width: 62ch; color: var(--color-ink-muted); line-height: 1.55; }
  @media (max-width: 720px) {
    padding: 1.05rem 1rem 0;
    h1 { font-size: 1.55rem; max-width: none; }
    p { font-size: 0.92rem; }
  }
`;
const Body = styled.section`
  max-width: 1180px; margin: 0 auto; padding: 1.1rem 1.5rem 5rem;
  @media (max-width: 880px) { padding: 1rem 1rem 3.5rem; }
`;

/* ── /areas ──────────────────────────────────────────────────────── */

const Toolbar = styled.div`
  display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-bottom: 1.25rem; min-width: 0;
`;
const Search = styled.label`
  flex: 1 1 100%; min-width: 0; display: flex; align-items: center; gap: 0.55rem; min-height: 46px; padding: 0 0.9rem;
  background: #fff; border: 1px solid var(--color-line-strong); border-radius: 12px; color: var(--color-ink-faint);
  input { flex: 1; min-width: 0; width: 100%; border: 0; outline: none; font: inherit; color: var(--color-ink); background: transparent; }
  &:focus-within { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1); }
`;
const Pills = styled.div`
  display: flex; gap: 0.4rem; flex-wrap: wrap; width: 100%; min-width: 0;
  @media (max-width: 720px) {
    flex-wrap: nowrap; overflow-x: auto; max-width: 100%;
    padding-bottom: 0.25rem; -webkit-overflow-scrolling: touch;
  }
`;
const StateHead = styled.h2`
  margin: 1.75rem 0 0.75rem; font-size: 1.05rem; display: flex; align-items: baseline; gap: 0.5rem;
  &:first-of-type { margin-top: 0.5rem; }
  span { font-size: 0.8rem; font-weight: 500; color: var(--color-ink-muted); }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 1rem;
`;
const AreaCard = styled(Link)`
  display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; padding: 1.15rem; border-radius: 18px;
  background: #fff; border: 1px solid var(--color-line); color: var(--color-ink); box-shadow: var(--shadow-soft);
  transition: border-color 0.15s, transform 0.15s;
  h3, p { overflow-wrap: break-word; }
  &:hover { border-color: rgba(47, 93, 80, 0.4); transform: translateY(-2px); }
  @media (max-width: 720px) { &:hover { transform: none; } }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
  h3 { margin: 0; font-size: 1.15rem; }
  .city { font-size: 0.8rem; color: var(--color-ink-muted); display: flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem; }
  .city svg { color: var(--color-green); font-size: 0.7rem; }
  p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--color-ink-soft); }
  .stats { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--color-ink-muted); margin-top: auto; padding-top: 0.4rem; border-top: 1px solid var(--color-line); }
  .stats b { color: var(--color-ink); }
`;
const Suggest = styled.form`
  margin-top: 2rem; padding: 1.4rem; border-radius: 18px; background: #fff; border: 1px dashed var(--color-line-strong);
  h3 { margin: 0 0 0.3rem; font-size: 1.05rem; }
  p { margin: 0 0 0.9rem; color: var(--color-ink-muted); font-size: 0.9rem; }
  .row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  input { flex: 1 1 200px; min-height: 44px; border: 1px solid var(--color-line-strong); border-radius: 11px; padding: 0 0.8rem; font: inherit; }
  button { min-height: 44px; border: 0; border-radius: 11px; padding: 0 1.1rem; background: var(--color-green-deep); color: #fff; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.6; }
  .done { color: var(--color-green-deep); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }
`;
const Muted = styled.p`color: var(--color-ink-muted); text-align: center; padding: 2.5rem 1rem;`;
const Err = styled.p`color: #b91c1c; font-size: 0.88rem;`;

/* ── Find my area ── */

const Finder = styled.section`
  margin-bottom: 1.5rem; padding: 1.15rem 1.25rem; border-radius: 18px; background: #fff; border: 1px solid var(--color-line);
  h2 { margin: 0 0 0.2rem; font-size: 1.1rem; }
  .sub { margin: 0 0 0.85rem; font-size: 0.88rem; color: var(--color-ink-muted); }
  .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .filters { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.75rem; }
  select { min-height: 40px; border: 1px solid var(--color-line-strong); border-radius: 10px; padding: 0 0.7rem; font: inherit; background: #fff; }
  .empty { margin: 0.9rem 0 0; font-size: 0.88rem; color: var(--color-ink-muted); }
  @media (max-width: 720px) { padding: 1rem; }
`;
const Matches = styled.ol`
  list-style: none; margin: 0.9rem 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 0.6rem;
`;
const Match = styled(Link)`
  display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem 0.85rem; border-radius: 12px;
  border: 1px solid var(--color-line); color: var(--color-ink);
  &:hover { border-color: var(--color-green); }
  .pct { flex-shrink: 0; width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center;
    background: var(--color-green-soft); color: var(--color-green-deep); font-weight: 800; font-size: 0.9rem; }
  .n { font-weight: 700; }
  .w { font-size: 0.8rem; color: var(--color-ink-muted); line-height: 1.4; margin-top: 0.15rem; }
`;

const BUDGETS = [0, 1000000, 2000000, 3000000, 5000000, 10000000];
const MAX_PRIORITIES = 3;

/**
 * Pick what matters (up to three), and a city and budget if you like: areas
 * residents have scored are ranked on just those, with the reason. Areas
 * nobody has scored yet are never offered as a match.
 */
function FindMyArea({ areas }) {
  const [priorities, setPriorities] = useState([]);
  const [city, setCity] = useState('');
  const [maxRent, setMaxRent] = useState(0);
  const cities = useMemo(() => [...new Set((areas || []).map((a) => a.city))].sort(), [areas]);
  const matches = useMemo(() => matchAreas(areas, { priorities, city, maxRent }), [areas, priorities, city, maxRent]);

  const toggle = (id) => setPriorities((list) => (list.includes(id)
    ? list.filter((x) => x !== id)
    : list.length < MAX_PRIORITIES ? [...list, id] : list));

  return (
    <Finder aria-labelledby="find-area">
      <h2 id="find-area">Find the right area for you</h2>
      <p className="sub">Pick up to {MAX_PRIORITIES} things that matter most. We rank areas on what residents say about just those.</p>
      <div className="chips" role="group" aria-label="What matters most">
        {AREA_FACTORS.map((f) => (
          <Pill
            key={f.id}
            type="button"
            $active={priorities.includes(f.id)}
            aria-pressed={priorities.includes(f.id)}
            disabled={!priorities.includes(f.id) && priorities.length >= MAX_PRIORITIES}
            onClick={() => toggle(f.id)}
          >
            {f.short}
          </Pill>
        ))}
      </div>
      {priorities.length > 0 && (
        <>
          <div className="filters">
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
              <option value="">Any city</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={maxRent} onChange={(e) => setMaxRent(Number(e.target.value))} aria-label="Budget">
              {BUDGETS.map((b) => <option key={b} value={b}>{b ? `Typical rent up to ${formatMoney(b, 'NGN')} a year` : 'Any budget'}</option>)}
            </select>
          </div>
          {matches.length ? (
            <Matches>
              {matches.map((m) => (
                <li key={m.area.slug}>
                  <Match to={`/areas/${m.area.slug}`}>
                    <span className="pct" aria-label={`${m.match}% match`}>{m.match}%</span>
                    <span>
                      <span className="n">{m.area.name}, {m.area.city}</span>
                      <span className="w" style={{ display: 'block' }}>
                        {matchReason(m)}. {m.area.ratings} {m.area.ratings === 1 ? 'rating' : 'ratings'}
                        {m.area.medianRent ? ` · typical rent ${formatMoney(m.area.medianRent, 'NGN')}/yr` : m.rentUnknown ? ' · no rent data yet' : ''}
                      </span>
                    </span>
                  </Match>
                </li>
              ))}
            </Matches>
          ) : (
            <p className="empty">Not enough residents have scored areas {city ? `in ${city} ` : ''}on that yet{maxRent ? ' within that budget' : ''}. Try fewer filters, or browse the areas below.</p>
          )}
        </>
      )}
    </Finder>
  );
}

function SuggestArea() {
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!area.trim()) return;
    setState('sending');
    setError('');
    try {
      await api.submitLead({
        type: 'general',
        name: user?.name || 'Neighbourhood request',
        email: user?.email || email,
        service: 'Neighbourhood request',
        message: `Please open a neighbourhood page for: ${area.trim()}`,
      });
      setState('sent');
    } catch (err) {
      setError(err.message || 'Could not send that. Please try again.');
      setState('idle');
    }
  };

  return (
    <Suggest onSubmit={submit}>
      <h3>Don&rsquo;t see your area?</h3>
      <p>Tell us where you live or want to live, and we will open its page next.</p>
      {state === 'sent' ? (
        <div className="done"><FaCheckCircle /> Thanks. We will let you know when it opens.</div>
      ) : (
        <div className="row">
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area and city, e.g. Ogba, Lagos" aria-label="Area" required />
          {!user && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" required />}
          <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Suggest it'}</button>
        </div>
      )}
      {error && <Err>{error}</Err>}
    </Suggest>
  );
}

function AreasIndex() {
  const [areas, setAreas] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All');

  useEffect(() => {
    api.areas.list().then(setAreas).catch((e) => setError(e.message || 'Could not load neighbourhoods.'));
  }, []);

  // States with the most areas first: Lagos, then Abuja, then the rest.
  const states = useMemo(() => {
    const counts = {};
    for (const a of areas || []) counts[a.state] = (counts[a.state] || 0) + 1;
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  }, [areas]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = (areas || []).filter((a) => (state === 'All' || a.state === state)
      && (!q || `${a.name} ${a.city} ${a.state} ${a.blurb}`.toLowerCase().includes(q)));
    return states.map((st) => ({ state: st, areas: hits.filter((a) => a.state === st) })).filter((g) => g.areas.length);
  }, [areas, query, state, states]);

  return (
    <Page>
      <Intro>
        <p className="k">Neighbourhoods</p>
        <h1>Know the area before you pay rent</h1>
        <p>
          Residents across Nigeria rate the light, water, flooding, roads and security, and share what living there is really like.
          Check the rents, the commute and what is nearby, all on one page.
        </p>
      </Intro>

      <Body>
        <Toolbar>
          <Search>
            <FaSearch />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search an area, e.g. Yaba or Gwarinpa" aria-label="Search areas" />
          </Search>
          <Pills role="group" aria-label="State">
            {['All', ...states].map((st) => (
              <Pill key={st} type="button" $active={state === st} onClick={() => setState(st)}>{st === 'All' ? 'All of Nigeria' : stateLabel(st)}</Pill>
            ))}
          </Pills>
        </Toolbar>

        {error && <Err>{error}</Err>}
        {areas && <FindMyArea areas={areas} />}
        {!areas && !error ? <Loader /> : groups.length === 0 ? (
          <Muted>No area matches that yet. Suggest it below.</Muted>
        ) : groups.map((g) => (
          <React.Fragment key={g.state}>
            <StateHead>{stateLabel(g.state)} <span>{g.areas.length} {g.areas.length === 1 ? 'area' : 'areas'}</span></StateHead>
            <Grid>
            {g.areas.map((a) => (
              <AreaCard key={a.slug} to={`/areas/${a.slug}`}>
                <div className="top">
                  <div>
                    <h3>{a.name}</h3>
                    <div className="city"><FaMapMarkerAlt /> {a.city === a.name ? stateLabel(a.state) : a.city}</div>
                  </div>
                  <Score value={a.overall} />
                </div>
                <p>{a.blurb}</p>
                <div className="stats">
                  <span><b>{a.posts}</b> {a.posts === 1 ? 'post' : 'posts'}</span>
                  <span><b>{a.ratings}</b> {a.ratings === 1 ? 'rating' : 'ratings'}</span>
                  {a.rentals > 0 && <span><b>{a.rentals}</b> to rent</span>}
                </div>
              </AreaCard>
            ))}
            </Grid>
          </React.Fragment>
        ))}

        <SuggestArea />
      </Body>
    </Page>
  );
}

/* ── /areas/:slug ────────────────────────────────────────────────── */

const Back = styled(Link)`
  display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600;
  color: var(--color-ink-muted); margin-bottom: 1rem;
  &:hover { color: var(--color-ink); }
`;
const Head = styled.header`
  display: flex; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; align-items: flex-end; margin-bottom: 1.25rem; min-width: 0;
  > div { min-width: 0; }
  .eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-eyebrow); }
  h1 { margin: 0.25rem 0 0.4rem; font-size: clamp(1.7rem, 4vw, 2.6rem); line-height: 1.1; overflow-wrap: break-word; }
  p { margin: 0; max-width: 620px; color: var(--color-ink-soft); line-height: 1.55; }
  .badge { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.7rem; padding: 0.3rem 0.7rem; border-radius: 999px; background: var(--color-green-soft); color: var(--color-green-deep); font-size: 0.78rem; font-weight: 700; }
`;
const Share = styled.a`
  display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.7rem; padding: 0.3rem 0.75rem; border-radius: 999px;
  background: #fff; border: 1px solid var(--color-line); color: var(--color-ink); font-size: 0.78rem; font-weight: 700;
  svg { color: #25d366; }
  &:hover { border-color: #25d366; }
`;
const Headline = styled.div`
  display: flex; gap: 0.6rem; flex-wrap: wrap;
  > div { background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 0.7rem 0.9rem; min-width: 0; flex: 1 1 120px; }
  b { display: flex; align-items: center; gap: 0.3rem; font-size: 1.35rem; }
  b svg { color: #d4a017; font-size: 1rem; }
  span { font-size: 0.75rem; color: var(--color-ink-muted); }
`;
const Jump = styled.nav`
  display: flex; gap: 0.4rem; overflow-x: auto; margin: 0 -1rem 1rem; padding: 0 1rem 0.25rem;
  a { flex-shrink: 0; padding: 0.4rem 0.85rem; border-radius: 999px; background: #fff; border: 1px solid var(--color-line); font-size: 0.82rem; font-weight: 600; color: var(--color-ink); }
  @media (min-width: 981px) { display: none; }
`;
/*
 * The page opens with "at a glance" (what the numbers say, against the rest
 * of the city, and areas that do better where this one is weak), then reads
 * in three bands, each using the full width:
 *   1. residents' scores beside rent and next steps;
 *   2. location tools — the map beside commute and nearby;
 *   3. the board — posts beside its rules, which stay in view while you scroll.
 * Each band stacks to one column on phones and small tablets.
 */
const Sections = styled.div`display: flex; flex-direction: column; gap: 1.25rem; min-width: 0;`;
const Band = styled.div`
  display: grid; grid-template-columns: ${(p) => p.$cols || 'minmax(0, 1fr) minmax(0, 1fr)'}; gap: 1.25rem; align-items: start;
  @media (max-width: 980px) { grid-template-columns: minmax(0, 1fr); }
`;
const Stack = styled.div`display: flex; flex-direction: column; gap: 1.25rem; min-width: 0;`;
const Sticky = styled.div`
  min-width: 0;
  @media (min-width: 981px) { position: sticky; top: calc(var(--nav-h) + 1rem); }
`;
const BandTitle = styled.h2`
  margin: 0.5rem 0 -0.35rem; font-size: 1.2rem;
  span { display: block; margin-top: 0.2rem; font-size: 0.86rem; font-weight: 400; color: var(--color-ink-muted); }
`;

function AreaDetail() {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const mobile = useIsMobile();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await api.areas.get(slug));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load this area.');
    }
  }, [slug]);

  // Reload once sign-in is known, so the viewer's own scores and badge show.
  useEffect(() => { if (!authLoading) load(); }, [load, authLoading, user?.email]);

  if (error) {
    return (
      <Page><Body>
        <Back to="/areas"><FaChevronLeft size={11} /> All neighbourhoods</Back>
        <Muted>{error}</Muted>
      </Body></Page>
    );
  }
  if (!data) return <Loader />;

  const { area, ratings, viewer } = data;

  return (
    <Page>
      <Body>
        <Back to="/areas"><FaChevronLeft size={11} /> All neighbourhoods</Back>
        <Head>
          <div>
            <div className="eyebrow">{area.city === area.state ? area.city : `${area.city} · ${stateLabel(area.state)}`}</div>
            <h1>{area.name}</h1>
            <p>{area.blurb}</p>
            {viewer.verifiedResident && <span className="badge"><FaCheckCircle /> You are a verified resident here</span>}
            <Share href={whatsappShare(`What is it like to live in ${area.name}, ${area.city}? See what residents say about light, water, flooding and rent:`, `/areas/${area.slug}`)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Share on WhatsApp
            </Share>
          </div>
          <Headline>
            <div><b><FaStar />{ratings.overall != null ? ratings.overall.toFixed(1) : '—'}</b><span>{ratings.count} {ratings.count === 1 ? 'rating' : 'ratings'}</span></div>
            <div><b>{data.rentals}</b><span>homes to rent</span></div>
          </Headline>
        </Head>

        {mobile && (
          <Jump aria-label="On this page">
            <a href="#scores">Scores</a><a href="#rents">Rents</a><a href="#tools">Location tools</a><a href="#board">Board</a>
          </Jump>
        )}

        <Sections>
          <AreaInsights data={data} />
          <Band>
            <div id="scores"><AreaScores data={data} onRated={(next) => setData((d) => ({ ...d, ...next }))} /></div>
            <Stack>
              <div id="rents"><AreaRents data={data} /></div>
              <AreaNextSteps area={area} />
            </Stack>
          </Band>

          <div id="tools"><AreaTools area={area} /></div>

          <BandTitle id="board">
            Residents&rsquo; board
            <span>What people who live in {area.name} say about light, water, roads and the streets they know.</span>
          </BandTitle>
          <Band $cols="minmax(0, 2fr) minmax(0, 1fr)">
            <Stack><AreaBoard area={area} categories={data.categories} signedIn={Boolean(user)} /></Stack>
            <Sticky><AreaRules /></Sticky>
          </Band>
        </Sections>
      </Body>
    </Page>
  );
}

export default function AreasPage() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return (
    <Routes>
      <Route index element={<AreasIndex />} />
      <Route path=":slug" element={<AreaDetail />} />
    </Routes>
  );
}
