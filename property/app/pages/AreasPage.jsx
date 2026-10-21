import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaChevronLeft, FaSearch, FaMapMarkerAlt, FaStar, FaWhatsapp,
} from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem } from '../components/motion';
import { SpotArt } from '../components/graphics';
import { useIsMobile } from '../utils/useMediaQuery';
import AreaBoard from '../components/areas/AreaBoard';
import { AreaScores, AreaRents, AreaTools, AreaRules } from '../components/areas/AreaPanels';
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

const Page = styled.div`background: var(--color-bg-panel); min-height: 70vh;`;
const Body = styled.section`
  max-width: 1180px; margin: 0 auto; padding: 1.75rem 1.5rem 5rem;
  @media (max-width: 880px) { padding: 1.25rem 1rem 3.5rem; }
`;

/* ── /areas ──────────────────────────────────────────────────────── */

const Toolbar = styled.div`
  display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-bottom: 1.25rem;
`;
const Search = styled.label`
  flex: 1 1 260px; display: flex; align-items: center; gap: 0.55rem; min-height: 46px; padding: 0 0.9rem;
  background: #fff; border: 1px solid var(--color-line-strong); border-radius: 12px; color: var(--color-ink-faint);
  input { flex: 1; min-width: 0; border: 0; outline: none; font: inherit; color: var(--color-ink); background: transparent; }
  &:focus-within { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1); }
`;
const Pills = styled.div`
  display: flex; gap: 0.4rem; overflow-x: auto; max-width: 100%; padding-bottom: 0.2rem; flex: 1 1 100%;
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
  display: flex; flex-direction: column; gap: 0.6rem; padding: 1.25rem; border-radius: 18px;
  background: #fff; border: 1px solid var(--color-line); color: var(--color-ink); box-shadow: var(--shadow-soft);
  transition: border-color 0.15s, transform 0.15s;
  &:hover { border-color: rgba(47, 93, 80, 0.4); transform: translateY(-2px); }
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
  const mobile = useIsMobile();
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
      <ServiceHero $image="/media/building.jpg">
        <ServiceHeroInner $spot={mobile}>
          {mobile && <SpotArt className="spot" kind="move" />}
          <div>
            <StaggerItem className="eyebrow">Neighbourhoods</StaggerItem>
            <motion.h1 variants={staggerItem}>Know the area before you pay rent</motion.h1>
            <motion.p variants={staggerItem}>
              Residents across Nigeria rate the light, water, flooding, roads and security, and share what living there is really like.
              Check the rents, the commute and what is nearby, all on one page.
            </motion.p>
          </div>
        </ServiceHeroInner>
      </ServiceHero>

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
  display: flex; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; align-items: flex-end; margin-bottom: 1.25rem;
  .eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-eyebrow); }
  h1 { margin: 0.25rem 0 0.4rem; font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.1; }
  p { margin: 0; max-width: 620px; color: var(--color-ink-soft); line-height: 1.55; }
  .badge { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.7rem; padding: 0.3rem 0.7rem; border-radius: 999px; background: var(--color-green-soft); color: var(--color-green-deep); font-size: 0.78rem; font-weight: 700; }
`;
const Share = styled.a`
  display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.7rem; margin-left: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px;
  background: #fff; border: 1px solid var(--color-line); color: var(--color-ink); font-size: 0.78rem; font-weight: 700;
  svg { color: #25d366; }
  &:hover { border-color: #25d366; }
`;
const Headline = styled.div`
  display: flex; gap: 0.6rem; flex-wrap: wrap;
  > div { background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 0.7rem 1rem; min-width: 96px; }
  b { display: flex; align-items: center; gap: 0.3rem; font-size: 1.35rem; }
  b svg { color: #d4a017; font-size: 1rem; }
  span { font-size: 0.75rem; color: var(--color-ink-muted); }
`;
const Jump = styled.nav`
  display: flex; gap: 0.4rem; overflow-x: auto; margin: 0 -1rem 1rem; padding: 0 1rem 0.25rem;
  a { flex-shrink: 0; padding: 0.4rem 0.85rem; border-radius: 999px; background: #fff; border: 1px solid var(--color-line); font-size: 0.82rem; font-weight: 600; color: var(--color-ink); }
  @media (min-width: 981px) { display: none; }
`;
const Layout = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 1.25rem; align-items: start;
  @media (max-width: 980px) { grid-template-columns: minmax(0, 1fr); }
`;
const Rail = styled.aside`display: flex; flex-direction: column; gap: 1rem; min-width: 0;`;
const Stack = styled.div`display: flex; flex-direction: column; gap: 1rem; min-width: 0;`;

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
  // Phones read top to bottom: scores first, then the board, then the rest.
  const scores = <div id="scores"><AreaScores data={data} onRated={(next) => setData((d) => ({ ...d, ...next }))} /></div>;

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
            <a href="#board">Board</a><a href="#scores">Scores</a><a href="#rents">Rents</a><a href="#tools">Location tools</a>
          </Jump>
        )}

        <Layout>
          <Stack>
            {mobile && scores}
            <div id="board"><AreaBoard area={area} categories={data.categories} signedIn={Boolean(user)} /></div>
          </Stack>
          <Rail>
            {!mobile && scores}
            <div id="rents"><AreaRents data={data} /></div>
            <div id="tools"><AreaTools area={area} /></div>
            <AreaRules />
          </Rail>
        </Layout>
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
