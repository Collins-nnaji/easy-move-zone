import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api';

/**
 * Admin inbox for the contact form, new-listing alert sign-ups and any other
 * general message posted to /api/leads.
 */

const FILTERS = ['new', 'replied', 'closed', 'all'];
const TOPIC_LABEL = { property_alert: 'New-listing alert' };

const Tabs = styled.div`display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;`;
const Tab = styled.button`
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink)')};
  border-radius: 999px; padding: 0.4rem 0.85rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-transform: capitalize;
`;
const List = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const Row = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 1rem 1.1rem;
  .top { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: baseline; }
  .who { font-weight: 700; }
  .meta { font-size: 0.8rem; color: var(--color-ink-faint); }
  .topic { display: inline-block; margin-top: 0.35rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-green-deep); }
  .msg { margin: 0.5rem 0 0; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.55; color: var(--color-ink-soft); }
  .contact { margin-top: 0.5rem; font-size: 0.85rem; display: flex; gap: 1rem; flex-wrap: wrap; }
  .contact a { color: var(--color-green-deep); font-weight: 600; }
  .acts { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
  .acts button { border: 1px solid var(--color-line-strong); background: #fff; border-radius: 9px; padding: 0.4rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
`;
const Empty = styled.div`padding: 2.5rem 1rem; text-align: center; color: var(--color-ink-muted);`;

export default function MessagesAdmin({ adminKey }) {
  const [filter, setFilter] = useState('new');
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLeads(await api.admin.listLeads(adminKey, filter === 'all' ? '' : filter));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load messages.');
    }
  }, [adminKey, filter]);

  useEffect(() => { load(); }, [load]);

  const mark = async (id, status) => {
    try { await api.admin.updateLead(id, adminKey, status); await load(); } catch (e) { setError(e.message || 'Could not update.'); }
  };

  return (
    <>
      <Tabs>
        {FILTERS.map((f) => <Tab key={f} type="button" $active={filter === f} onClick={() => setFilter(f)}>{f}</Tab>)}
      </Tabs>
      {error && <Empty style={{ color: '#b91c1c' }}>{error}</Empty>}
      {leads.length === 0 ? <Empty>No {filter === 'all' ? '' : filter} messages.</Empty> : (
        <List>
          {leads.map((l) => (
            <Row key={l.id}>
              <div className="top">
                <span className="who">{l.name}</span>
                <span className="meta">{new Date(l.created_at).toLocaleString()} · {l.status}</span>
              </div>
              {l.service && <span className="topic">{TOPIC_LABEL[l.service] || l.service}</span>}
              {l.message && <p className="msg">{l.message}</p>}
              <div className="contact">
                <a href={`mailto:${l.email}`}>{l.email}</a>
                {l.phone && <a href={`tel:${l.phone.replace(/[^+\d]/g, '')}`}>{l.phone}</a>}
              </div>
              <div className="acts">
                {l.status !== 'replied' && <button type="button" onClick={() => mark(l.id, 'replied')}>Mark replied</button>}
                {l.status !== 'closed' && <button type="button" onClick={() => mark(l.id, 'closed')}>Close</button>}
                {l.status !== 'new' && <button type="button" onClick={() => mark(l.id, 'new')}>Reopen</button>}
              </div>
            </Row>
          ))}
        </List>
      )}
    </>
  );
}
