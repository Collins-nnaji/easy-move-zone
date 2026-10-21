import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { api } from '../api';

/**
 * Admin → Community → Areas: open a neighbourhood page, edit one, or hide it.
 * Residents' "suggest an area" requests sit on top; opening an area from one
 * marks it answered. An area's slug (its URL) is fixed once opened.
 */

const Section = styled.section`margin-bottom: 1.5rem;`;
const H = styled.h3`margin: 0 0 0.6rem; font-size: 0.95rem;`;
const Card = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 1rem 1.1rem;
  & + & { margin-top: 0.6rem; }
  .top { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: baseline; }
  .name { font-weight: 700; }
  .name a { color: var(--color-green-deep); }
  .meta { font-size: 0.8rem; color: var(--color-ink-faint); }
  .blurb { margin: 0.35rem 0 0; font-size: 0.88rem; color: var(--color-ink-soft); }
  .tag { display: inline-block; margin-left: 0.4rem; padding: 0.1rem 0.45rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg-sunken); color: var(--color-ink-muted); }
  .tag.warn { background: #fef3c7; color: #92400e; }
  .acts { margin-top: 0.6rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
`;
const Btn = styled.button`
  border: 1px solid ${(p) => (p.$primary ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$primary ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$primary ? '#fff' : p.$danger ? '#b91c1c' : 'var(--color-ink)')};
  border-radius: 9px; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;
const Form = styled.form`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; margin-top: 0.75rem;
  label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; font-weight: 700; color: var(--color-ink-muted); }
  label.wide { grid-column: 1 / -1; }
  input, select, textarea { min-height: 40px; border: 1px solid var(--color-line-strong); border-radius: 9px; padding: 0.45rem 0.6rem; font: inherit; font-size: 0.88rem; font-weight: 400; color: var(--color-ink); background: #fff; }
  textarea { min-height: 64px; resize: vertical; }
  small { font-weight: 400; color: var(--color-ink-faint); }
  .row { grid-column: 1 / -1; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;
const Filter = styled.input`
  width: 100%; max-width: 360px; min-height: 40px; border: 1px solid var(--color-line-strong); border-radius: 9px; padding: 0 0.7rem; font: inherit; margin-bottom: 0.75rem;
`;
const Err = styled.p`color: #b91c1c; font-size: 0.85rem; margin: 0.4rem 0;`;

const EMPTY = { name: '', city: '', state: '', lat: '', lng: '', match: '', blurb: '' };

function fromArea(a) {
  return {
    name: a.name, city: a.city, state: a.state, lat: a.center?.[0] ?? '', lng: a.center?.[1] ?? '',
    match: a.match.filter((m) => m !== a.name.toLowerCase()).join(', '), blurb: a.blurb || '',
  };
}

function AreaForm({ initial, states, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const mapSearch = `https://www.openstreetmap.org/search?query=${encodeURIComponent([form.name, form.city, 'Nigeria'].filter(Boolean).join(', '))}`;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try { await onSubmit(form); } catch (err) { setError(err.message || 'Could not save.'); } finally { setSaving(false); }
  };

  return (
    <Form onSubmit={submit}>
      <label>Area name<input value={form.name} onChange={set('name')} placeholder="e.g. Ogba" required /></label>
      <label>City or town<input value={form.city} onChange={set('city')} placeholder="e.g. Lagos" required /></label>
      <label>State
        <select value={form.state} onChange={set('state')} required>
          <option value="">Choose a state</option>
          {states.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label>Map point <small>(optional; <a href={mapSearch} target="_blank" rel="noopener noreferrer">find it on OpenStreetMap</a>, then copy the numbers from the address bar)</small>
        <span style={{ display: 'flex', gap: '0.4rem' }}>
          <input value={form.lat} onChange={set('lat')} placeholder="Latitude, e.g. 6.62" inputMode="decimal" style={{ flex: 1, minWidth: 0 }} />
          <input value={form.lng} onChange={set('lng')} placeholder="Longitude, e.g. 3.34" inputMode="decimal" style={{ flex: 1, minWidth: 0 }} />
        </span>
      </label>
      <label className="wide">Other spellings and nearby streets <small>(comma separated; listings with these as their area link to this page)</small>
        <input value={form.match} onChange={set('match')} placeholder="e.g. agidingbi, omole phase 1" />
      </label>
      <label className="wide">One-line description<textarea value={form.blurb} onChange={set('blurb')} maxLength={400} placeholder="What the area is like, in a sentence." /></label>
      <div className="row">
        <Btn $primary type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Btn>
        {onCancel && <Btn type="button" onClick={onCancel}>Cancel</Btn>}
        {error && <Err>{error}</Err>}
      </div>
    </Form>
  );
}

export default function AreasAdmin({ adminKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(null); // { initial, requestId }
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await api.areas.admin.areas(adminKey));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load areas.');
    }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.areas || []).filter((a) => !q || `${a.name} ${a.city} ${a.state}`.toLowerCase().includes(q));
  }, [data, query]);

  if (!data) return error ? <Err>{error}</Err> : null;

  const create = async (form, requestId) => {
    await api.areas.admin.createArea(adminKey, { ...form, requestId });
    setCreating(null);
    await load();
  };
  const update = async (slug, patch) => {
    await api.areas.admin.updateArea(adminKey, slug, patch);
    setEditing(null);
    await load();
  };
  const toggle = async (a) => {
    try { await update(a.slug, { status: a.status === 'live' ? 'hidden' : 'live' }); } catch (e) { setError(e.message || 'Could not update.'); }
  };
  const dismiss = async (id) => {
    try { await api.areas.admin.dismissRequest(adminKey, id); await load(); } catch (e) { setError(e.message || 'Could not update.'); }
  };

  return (
    <>
      {error && <Err>{error}</Err>}

      {data.requests.length > 0 && (
        <Section>
          <H>Residents asked for ({data.requests.length})</H>
          {data.requests.map((r) => (
            <Card key={r.id}>
              <div className="top">
                <span className="name">{r.message.replace(/^Please open a neighbourhood page for:\s*/i, '')}</span>
                <span className="meta">{new Date(r.created_at).toLocaleDateString()} · {r.email}</span>
              </div>
              {creating?.requestId === r.id ? (
                <AreaForm initial={creating.initial} states={data.states} submitLabel="Open this area" onSubmit={(f) => create(f, r.id)} onCancel={() => setCreating(null)} />
              ) : (
                <div className="acts">
                  <Btn $primary type="button" onClick={() => {
                    const [name, city] = r.message.replace(/^Please open a neighbourhood page for:\s*/i, '').split(',').map((x) => x.trim());
                    setCreating({ requestId: r.id, initial: { ...EMPTY, name: name || '', city: city || '' } });
                  }}>Open an area for this</Btn>
                  <Btn type="button" onClick={() => dismiss(r.id)}>Dismiss</Btn>
                </div>
              )}
            </Card>
          ))}
        </Section>
      )}

      <Section>
        <H>Open a new area</H>
        {creating && !creating.requestId ? (
          <Card><AreaForm initial={creating.initial} states={data.states} submitLabel="Open area" onSubmit={(f) => create(f)} onCancel={() => setCreating(null)} /></Card>
        ) : (
          <Btn $primary type="button" onClick={() => setCreating({ initial: EMPTY })}>New area</Btn>
        )}
      </Section>

      <Section>
        <H>All areas ({data.areas.length})</H>
        <Filter value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name, city or state" aria-label="Filter areas" />
        {shown.map((a) => (
          <Card key={a.slug}>
            <div className="top">
              <span className="name">
                <Link to={`/areas/${a.slug}`} target="_blank">{a.name}</Link>, {a.city}
                {a.status === 'hidden' && <span className="tag">Hidden</span>}
                {!a.center && <span className="tag warn">No map point</span>}
              </span>
              <span className="meta">{a.state} · {a.posts} posts{a.held ? ` (${a.held} held)` : ''} · {a.ratings} ratings</span>
            </div>
            {a.blurb && <p className="blurb">{a.blurb}</p>}
            {editing === a.slug ? (
              <AreaForm initial={fromArea(a)} states={data.states} submitLabel="Save changes" onSubmit={(f) => update(a.slug, f)} onCancel={() => setEditing(null)} />
            ) : (
              <div className="acts">
                <Btn type="button" onClick={() => setEditing(a.slug)}>Edit</Btn>
                <Btn type="button" $danger={a.status === 'live'} onClick={() => toggle(a)}>{a.status === 'live' ? 'Hide page' : 'Make live'}</Btn>
              </div>
            )}
          </Card>
        ))}
      </Section>
    </>
  );
}
