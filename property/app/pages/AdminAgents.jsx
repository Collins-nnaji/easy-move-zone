import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api';
import { AGENT_PLANS } from '../config/agentPlans';

const Tabs = styled.div`display: flex; gap: 0.4rem; margin-bottom: 1rem; flex-wrap: wrap;`;
const Tab = styled.button`
  padding: 0.5rem 0.9rem; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 0.82rem;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'rgba(25,28,31,0.1)')};
  background: ${(p) => (p.$active ? 'var(--color-green-soft)' : '#fff')};
  color: ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
`;
const Card = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 1rem 1.1rem; margin-bottom: 0.75rem;
  h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
  .m { color: var(--color-ink-muted); font-size: 0.88rem; line-height: 1.5; }
`;
const Actions = styled.div`display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.7rem;`;
const Btn = styled.button`
  border: 0; border-radius: 8px; padding: 0.45rem 0.75rem; font-weight: 700; font-size: 0.82rem; cursor: pointer;
  background: ${(p) => (p.$danger ? '#fee2e2' : 'var(--color-green-deep)')};
  color: ${(p) => (p.$danger ? '#991b1b' : '#fff')};
`;
const Note = styled.input`
  min-height: 36px; border: 1px solid var(--color-line); border-radius: 8px; padding: 0.35rem 0.6rem; font: inherit; min-width: 180px;
`;
const Err = styled.p`color: #b91c1c;`;

export default function AdminAgents({ adminKey }) {
  const [tab, setTab] = useState('applications');
  const [apps, setApps] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    try {
      const [a, g, l] = await Promise.all([
        api.agent.admin.applications(adminKey),
        api.agent.admin.agencies(adminKey),
        api.agent.admin.listings(adminKey, 'pending_review'),
      ]);
      setApps(a.applications || []);
      setAgencies(g.agencies || []);
      setListings(l.listings || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const note = (id) => notes[id] || '';

  return (
    <div>
      <Tabs>
        <Tab type="button" $active={tab === 'applications'} onClick={() => setTab('applications')}>Applications ({apps.filter((a) => a.status === 'pending').length})</Tab>
        <Tab type="button" $active={tab === 'listings'} onClick={() => setTab('listings')}>Listings in review ({listings.length})</Tab>
        <Tab type="button" $active={tab === 'agencies'} onClick={() => setTab('agencies')}>Agencies ({agencies.length})</Tab>
      </Tabs>
      {error && <Err>{error}</Err>}

      {tab === 'applications' && apps.map((a) => (
        <Card key={a.id}>
          <h3>{a.company} · {a.status}</h3>
          <div className="m">{a.contact_name} · {a.email} · {a.phone}<br />Licence {a.license_number || '—'} · {[a.city, a.state].filter(Boolean).join(', ')}</div>
          {a.bio && <div className="m">{a.bio}</div>}
          {a.status === 'pending' || a.status === 'needs_more' ? (
            <Actions>
              <Note placeholder="Note to the applicant" value={note(a.id)} onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))} />
              <Btn type="button" onClick={() => api.agent.admin.reviewApplication(a.id, adminKey, { status: 'approved' }).then(load)}>Verify</Btn>
              <Btn type="button" onClick={() => api.agent.admin.reviewApplication(a.id, adminKey, { status: 'needs_more', note: note(a.id) }).then(load)}>Need more</Btn>
              <Btn type="button" $danger onClick={() => api.agent.admin.reviewApplication(a.id, adminKey, { status: 'rejected', note: note(a.id) }).then(load)}>Reject</Btn>
            </Actions>
          ) : null}
        </Card>
      ))}

      {tab === 'listings' && (listings.length ? listings.map((l) => (
        <Card key={l.id}>
          <h3>{l.title}</h3>
          <div className="m">{l.agency_name} · {l.listing_type} · {l.city} · {l.currency} {l.list_price || l.guide_price}</div>
          <Actions>
            <Note placeholder="Reject reason" value={note(`l${l.id}`)} onChange={(e) => setNotes((n) => ({ ...n, [`l${l.id}`]: e.target.value }))} />
            <Btn type="button" onClick={() => api.agent.admin.reviewListing(l.id, adminKey, { decision: 'approve' }).then(load)}>Approve</Btn>
            <Btn type="button" $danger onClick={() => api.agent.admin.reviewListing(l.id, adminKey, { decision: 'reject', note: note(`l${l.id}`) }).then(load)}>Reject</Btn>
          </Actions>
        </Card>
      )) : <p>Nothing waiting on review.</p>)}

      {tab === 'agencies' && agencies.map((a) => (
        <Card key={a.id}>
          <h3>{a.name} · {a.verification_status}</h3>
          <div className="m">{a.email} · {a.plan} · {a.live_count} live · {a.pending_count} in review</div>
          <Actions>
            {AGENT_PLANS.map((p) => (
              <Btn key={p.id} type="button" onClick={() => api.agent.admin.updateAgency(a.id, adminKey, { plan: p.id, comped: true }).then(load)}>
                Grant {p.label}
              </Btn>
            ))}
            {a.verification_status !== 'suspended' && (
              <Btn type="button" $danger onClick={() => api.agent.admin.updateAgency(a.id, adminKey, { suspend: true }).then(load)}>Suspend</Btn>
            )}
            {a.verification_status === 'suspended' && (
              <Btn type="button" onClick={() => api.agent.admin.updateAgency(a.id, adminKey, { verification_status: 'verified' }).then(load)}>Re-verify</Btn>
            )}
          </Actions>
        </Card>
      ))}
    </div>
  );
}
