import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api';
import AdminMedia from './AdminMedia';
import {
  TENANT_CATEGORY_LABEL, TENANT_URGENCY_LABEL, TENANT_REQUEST_STATUS_LABEL,
} from '../config/tenant';
import { formatMoneyFull } from '../utils/format';
import { LOCALE } from '../config/markets';

/**
 * Admin → Tenants: everything tenants raise from their portal — repairs,
 * "I have paid" notices, questions and notice to leave. The desk moves each
 * one on and replies in the request's thread: the tenant sees the desk's
 * replies (and is notified), the owner sees repairs and notices and can add
 * notes for the desk that the tenant never sees. A payment notice is matched by recording the receipt on
 * the rent charge under Management, then resolving it here.
 */

const FILTERS = ['new', 'in_progress', 'scheduled', 'resolved', 'closed', 'all'];
const NEXT = ['in_progress', 'scheduled', 'resolved', 'closed'];

const Tabs = styled.div`display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;`;
const Tab = styled.button`
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink)')};
  border-radius: 999px; padding: 0.4rem 0.85rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
`;
const List = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const Item = styled.div`
  background: #fff; border: 1px solid ${(p) => (p.$urgent ? 'rgba(180,83,9,0.45)' : 'var(--color-line)')}; border-radius: 14px; padding: 1rem 1.1rem;
  .top { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: baseline; }
  .title { font-weight: 700; }
  .meta { font-size: 0.8rem; color: var(--color-ink-faint); }
  .tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
  .tag { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--color-bg-sunken); color: var(--color-ink-muted); }
  .tag.urgent { background: rgba(180,83,9,0.12); color: #b45309; }
  .tag.cat { background: var(--color-green-wash); color: var(--color-green-deep); }
  .msg { margin: 0.55rem 0 0; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.55; color: var(--color-ink-soft); }
  .who { margin-top: 0.55rem; font-size: 0.85rem; display: flex; gap: 1rem; flex-wrap: wrap; color: var(--color-ink-muted); }
  .who a { color: var(--color-green-deep); font-weight: 600; }
  .pay { margin-top: 0.5rem; font-size: 0.88rem; padding: 0.5rem 0.7rem; border-radius: 10px; background: var(--color-green-wash); }
  .reply { margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
  textarea { flex: 1 1 260px; min-height: 56px; border: 1px solid var(--color-line-strong); border-radius: 10px; padding: 0.55rem 0.7rem; font-family: var(--font-sans); font-size: 0.88rem; }
  select, button { border: 1px solid var(--color-line-strong); background: #fff; border-radius: 9px; padding: 0.45rem 0.75rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
  button.primary { background: var(--color-green-deep); color: #fff; border-color: transparent; }
  .thread { margin-top: 0.65rem; display: grid; gap: 0.4rem; }
  .m { font-size: 0.85rem; padding: 0.45rem 0.65rem; border-radius: 10px; background: var(--color-bg-sunken); }
  .m.admin { background: var(--color-green-wash); }
  .m.owner { background: rgba(3,105,161,0.08); }
  .m .who2 { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 0.15rem; }
`;
const Empty = styled.div`padding: 2.5rem 1rem; text-align: center; color: var(--color-ink-muted);`;

function RequestItem({ r, adminKey, onSaved }) {
  const [status, setStatus] = useState(r.status);
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true); setError('');
    try {
      await api.tenant.admin.update(r.id, adminKey, {
        status,
        ...(response.trim() ? { response: response.trim() } : {}),
      });
      await onSaved();
    } catch (e) {
      setError(e.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const urgent = r.category === 'repair' && r.urgency === 'urgent' && !['resolved', 'closed'].includes(r.status);
  return (
    <Item $urgent={urgent}>
      <div className="top">
        <span className="title">{r.title}</span>
        <span className="meta">{r.ref} · {new Date(r.created_at).toLocaleString()} · {TENANT_REQUEST_STATUS_LABEL[r.status]}</span>
      </div>
      <div className="tags">
        <span className="tag cat">{TENANT_CATEGORY_LABEL[r.category]}</span>
        {r.category === 'repair' && <span className={`tag ${r.urgency === 'urgent' ? 'urgent' : ''}`}>{TENANT_URGENCY_LABEL[r.urgency]}</span>}
        {r.location && <span className="tag">{r.location}</span>}
      </div>
      {r.category === 'payment' && (
        <div className="pay">
          Says they paid <b>{formatMoneyFull(r.amount)}</b>
          {r.paid_on ? ` on ${new Date(r.paid_on).toLocaleDateString(LOCALE)}` : ''}
          {r.payment_ref ? ` · ref ${r.payment_ref}` : ''}. Record the receipt on the rent charge under Management, then resolve this.
        </div>
      )}
      {r.details && <p className="msg">{r.details}</p>}
      {r.access_notes && <p className="msg"><b>Access:</b> {r.access_notes}</p>}
      {Array.isArray(r.media) && r.media.length > 0 && <AdminMedia media={r.media} adminKey={adminKey} label="Tenant's photos" />}
      <div className="who">
        <span>{r.tenant_name || 'Tenant'}{r.unit_label ? ` · ${r.unit_label}` : ''} at <b>{r.property_title}</b> ({r.property_ref})</span>
        <a href={`mailto:${r.tenant_email}`}>{r.tenant_email}</a>
        {r.tenant_phone && <a href={`tel:${r.tenant_phone.replace(/[^+\d]/g, '')}`}>{r.tenant_phone}</a>}
        {r.owner_name && <span>Owner: {r.owner_name}</span>}
      </div>
      {r.messages?.length > 0 && (
        <div className="thread">
          {r.messages.map((m) => (
            <div key={m.id} className={`m ${m.sender}`}>
              <div className="who2">
                {m.sender === 'tenant' ? 'Tenant' : m.sender === 'owner' ? 'Owner (not shown to the tenant)' : `Desk${m.author && m.author !== 'admin-key' ? ` · ${m.author}` : ''}`}
                {' · '}{new Date(m.created_at).toLocaleString()}
              </div>
              {m.body}
            </div>
          ))}
        </div>
      )}
      <div className="reply">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={r.category === 'repair' ? 'Reply to the tenant, e.g. Plumber booked for Tuesday 10am.' : 'Reply the tenant sees in their portal (and gets by email)'}
          aria-label="Reply to the tenant"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          {['new', ...NEXT].map((s) => <option key={s} value={s}>{TENANT_REQUEST_STATUS_LABEL[s]}</option>)}
        </select>
        <button type="button" className="primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
      {error && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.4rem' }}>{error}</div>}
    </Item>
  );
}

export default function TenantsAdmin({ adminKey }) {
  const [filter, setFilter] = useState('new');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRows(await api.tenant.admin.list(adminKey, filter === 'all' ? '' : filter));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load tenant requests.');
    }
  }, [adminKey, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Tabs>
        {FILTERS.map((f) => (
          <Tab key={f} type="button" $active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : TENANT_REQUEST_STATUS_LABEL[f]}
          </Tab>
        ))}
      </Tabs>
      {error && <Empty style={{ color: '#b91c1c' }}>{error}</Empty>}
      {rows.length === 0 ? <Empty>No {filter === 'all' ? '' : TENANT_REQUEST_STATUS_LABEL[filter].toLowerCase()} tenant requests.</Empty> : (
        <List>
          {rows.map((r) => <RequestItem key={`${r.id}-${r.updated_at}`} r={r} adminKey={adminKey} onSaved={load} />)}
        </List>
      )}
    </>
  );
}
