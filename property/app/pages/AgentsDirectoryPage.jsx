import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, Navigate, useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { api } from '../api';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem } from '../components/motion';
import { Section, Inner } from '../components/page';
import { ListingCard } from './MarketplacePage';
import ListingMap from '../components/ListingMap';
import { AGENT_APPLY_URL } from '../config/platform';

const Filters = styled.form`
  display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) auto; gap: 0.6rem;
  background: #fff; border: 1px solid var(--color-line-strong); border-radius: var(--radius-md); padding: 0.7rem;
  margin-bottom: 1.25rem;
  input, select { min-height: 46px; border: 1px solid var(--color-line); border-radius: 10px; padding: 0 0.8rem; font: inherit; }
  button {
    min-height: 46px; border: 0; border-radius: 6px; background: var(--color-green-deep); color: #fff; font-weight: 700; padding: 0 1.1rem; cursor: pointer;
  }
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); }
`;
const Card = styled(Link)`
  display: block; background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1.2rem 1.25rem;
  color: inherit;
  h3 { margin: 0 0 0.3rem; font-size: 1.15rem; }
  .m { color: var(--color-ink-muted); font-size: 0.9rem; }
  &:hover { border-color: rgba(184, 90, 48, 0.35); color: inherit; }
`;
const Empty = styled.p`color: var(--color-ink-muted);`;
const Profile = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 1.25rem; margin-bottom: 2rem;
  @media (max-width: 800px) { grid-template-columns: minmax(0, 1fr); }
`;
const Panel = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1.3rem;
  h2 { margin: 0 0 0.5rem; }
  p { color: var(--color-ink-muted); line-height: 1.55; }
`;
const Listings = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem;
  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 620px) { grid-template-columns: minmax(0, 1fr); }
`;

/** The public directory. It lives on the Manage page; agency profiles stay at /agents/:slug. */
export function AgentFinder() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const load = (params) => api.agents.browse(params).then(setData).catch(() => setData({ agencies: [] }));
  useEffect(() => { load({}); }, []);

  return (
    <>
      <Filters onSubmit={(e) => { e.preventDefault(); load({ q, city }); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Agency or area" aria-label="Search agencies" />
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
          <option value="">Any city</option>
          {(data?.cities || []).map((c) => <option key={c}>{c}</option>)}
        </select>
        <button type="submit">Search</button>
      </Filters>
      <p style={{ margin: '0 0 1rem' }}>
        <Link to={AGENT_APPLY_URL}>List as an agent <FaArrowRight size={11} /></Link>
      </p>
      {!data ? null : !(data.agencies || []).length ? (
        <Empty>No verified agencies match that yet.</Empty>
      ) : (
        <Grid>
          {data.agencies.map((a) => (
            <Card key={a.id} to={`/agents/${a.slug}`}>
              <h3>{a.name}</h3>
              <div className="m"><FaMapMarkerAlt /> {[a.area, a.city, a.state].filter(Boolean).join(', ') || 'Nigeria'}</div>
              <div className="m">{a.live_count} live listing{a.live_count === 1 ? '' : 's'}</div>
            </Card>
          ))}
        </Grid>
      )}
    </>
  );
}

function ProfilePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.agents.get(slug).then(setData).catch((e) => setError(e.message));
  }, [slug]);
  if (error) return <Section $sm><Inner><Empty>{error}</Empty></Inner></Section>;
  if (!data) return null;
  const { agency, listings, branches } = data;
  const pin = branches.find((b) => b.lat && b.lng);
  return (
    <>
      <ServiceHero>
        <ServiceHeroInner>
          <StaggerItem><p className="kicker">Agency</p></StaggerItem>
          <motion.h1 variants={staggerItem}>{agency.name}</motion.h1>
          <motion.p variants={staggerItem} className="intro">
            {[agency.city, agency.state, agency.country].filter(Boolean).join(', ')}
          </motion.p>
        </ServiceHeroInner>
      </ServiceHero>
      <Section $sm>
        <Inner>
          <Profile>
            <Panel>
              <h2>About</h2>
              <p>{agency.bio || `${agency.name} lists properties on EasyMoveZone.`}</p>
              {agency.phone && <p><FaPhone /> <a href={`tel:${agency.phone}`}>{agency.phone}</a></p>}
              {agency.website && <p><a href={agency.website} target="_blank" rel="noreferrer">Website</a></p>}
            </Panel>
            <Panel>
              <h2>Offices</h2>
              {(branches || []).length ? branches.map((b) => (
                <p key={b.id}><strong>{b.name}</strong><br />{[b.address, b.city, b.state].filter(Boolean).join(', ')}</p>
              )) : <p>Contact the agency for office details.</p>}
              {pin && <ListingMap lat={pin.lat} lng={pin.lng} title={agency.name} />}
            </Panel>
          </Profile>
          <h2 style={{ margin: '0 0 1rem' }}>Live listings</h2>
          {!(listings || []).length ? <Empty>Nothing live right now.</Empty> : (
            <Listings>{listings.map((l) => <ListingCard key={l.id} listing={l} />)}</Listings>
          )}
        </Inner>
      </Section>
    </>
  );
}

export default function AgentsDirectoryPage() {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/list#agents" replace />;
  return <ProfilePage />;
}
