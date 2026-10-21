import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { api } from '../api';
import AreasAdmin from './AreasAdmin';

/**
 * Admin → Community: the neighbourhood boards' moderation queue. "Held" is
 * what the automatic checks or several reports took down and nobody has read
 * yet; "Reported" is still public but someone flagged it. Publishing clears a
 * post's reports; removing takes it down for good, and either way the author
 * is told. The Areas tab (AreasAdmin.jsx) opens, edits and hides area pages.
 */

const VIEWS = [
  { id: 'held', label: 'Waiting for review' },
  { id: 'reported', label: 'Reported' },
  { id: 'removed', label: 'Removed' },
  { id: 'published', label: 'Published' },
];
const REASON_LABEL = {
  names_person: 'Names a person', false: 'Untrue', abusive: 'Abusive', contact: 'Contact details', spam: 'Spam', other: 'Other',
};

const Tabs = styled.div`display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;`;
const Modes = styled.div`
  display: inline-flex; gap: 0.25rem; padding: 0.25rem; margin-bottom: 1rem; border-radius: 12px; background: var(--color-bg-sunken);
  button { border: 0; background: transparent; border-radius: 9px; padding: 0.45rem 0.9rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; color: var(--color-ink-muted); }
  button[aria-pressed='true'] { background: #fff; color: var(--color-ink); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
`;
const Tab = styled.button`
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink)')};
  border-radius: 999px; padding: 0.4rem 0.85rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
`;
const List = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const Row = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 1rem 1.1rem;
  .top { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: baseline; }
  .where { font-weight: 700; }
  .where a { color: var(--color-green-deep); }
  .meta { font-size: 0.8rem; color: var(--color-ink-faint); }
  .kind { display: inline-block; margin-top: 0.35rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-green-deep); }
  .msg { margin: 0.5rem 0 0; white-space: pre-wrap; font-size: 0.92rem; line-height: 1.55; color: var(--color-ink); }
  .ctx { margin: 0.4rem 0 0; font-size: 0.82rem; color: var(--color-ink-muted); font-style: italic; }
  .why { margin-top: 0.5rem; font-size: 0.82rem; color: #92400e; }
  .reports { margin: 0.4rem 0 0; padding-left: 1rem; font-size: 0.82rem; color: var(--color-ink-soft); }
  .acts { margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .acts button { border: 1px solid var(--color-line-strong); background: #fff; border-radius: 9px; padding: 0.4rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
  .acts button.pub { border-color: var(--color-green-deep); color: var(--color-green-deep); }
  .acts button.del { border-color: #b91c1c; color: #b91c1c; }
`;
const Empty = styled.div`padding: 2.5rem 1rem; text-align: center; color: var(--color-ink-muted);`;

function Item({ item, type, onModerate }) {
  return (
    <Row>
      <div className="top">
        <span className="where"><Link to={`/areas/${item.area_slug}`} target="_blank">{item.area_name}</Link>{item.place ? ` · ${item.place}` : ''}</span>
        <span className="meta">
          {new Date(item.created_at).toLocaleString()} · {item.author_name || 'A neighbour'} ({item.author_email})
          {item.verified_resident ? ' · verified resident' : ''}
        </span>
      </div>
      <span className="kind">{type === 'reply' ? 'Reply' : item.category}</span>
      {type === 'reply' && <p className="ctx">On: {item.post_body.slice(0, 160)}{item.post_body.length > 160 ? '…' : ''}</p>}
      <p className="msg">{item.body}</p>
      {item.moderation_note && <div className="why">Note: {item.moderation_note}</div>}
      {item.reports?.length > 0 && (
        <ul className="reports">
          {item.reports.map((r, i) => <li key={i}>{REASON_LABEL[r.reason] || r.reason}{r.detail ? `: ${r.detail}` : ''}</li>)}
        </ul>
      )}
      <div className="acts">
        {item.status !== 'published' && <button type="button" className="pub" onClick={() => onModerate(type, item.id, 'published')}>Publish</button>}
        {item.status === 'published' && item.report_count > 0 && <button type="button" className="pub" onClick={() => onModerate(type, item.id, 'published')}>Keep and clear reports</button>}
        {item.status === 'published' && <button type="button" onClick={() => onModerate(type, item.id, 'held')}>Hide for review</button>}
        {item.status !== 'removed' && <button type="button" className="del" onClick={() => onModerate(type, item.id, 'removed')}>Remove</button>}
      </div>
    </Row>
  );
}

export default function CommunityAdmin({ adminKey }) {
  const [mode, setMode] = useState('posts');
  const switcher = (
    <Modes role="group" aria-label="Community">
      <button type="button" aria-pressed={mode === 'posts'} onClick={() => setMode('posts')}>Posts to review</button>
      <button type="button" aria-pressed={mode === 'areas'} onClick={() => setMode('areas')}>Areas</button>
    </Modes>
  );
  return (
    <>
      {switcher}
      {mode === 'areas' ? <AreasAdmin adminKey={adminKey} /> : <ModerationQueue adminKey={adminKey} />}
    </>
  );
}

function ModerationQueue({ adminKey }) {
  const [view, setView] = useState('held');
  const [data, setData] = useState({ posts: [], replies: [], counts: {} });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await api.areas.admin.queue(adminKey, view));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load the community queue.');
    }
  }, [adminKey, view]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (type, id, status) => {
    let note;
    if (status === 'removed') {
      note = window.prompt('Why is it being removed? (kept on the record, not shown publicly)', '');
      if (note === null) return;
    }
    try { await api.areas.admin.moderate(adminKey, type, id, status, note); await load(); } catch (e) { setError(e.message || 'Could not update.'); }
  };

  const items = [
    ...data.posts.map((p) => ({ type: 'post', item: p })),
    ...data.replies.map((r) => ({ type: 'reply', item: r })),
  ].sort((a, b) => new Date(b.item.created_at) - new Date(a.item.created_at));

  return (
    <>
      <Tabs>
        {VIEWS.map((v) => {
          const n = data.counts?.[v.id];
          return <Tab key={v.id} type="button" $active={view === v.id} onClick={() => setView(v.id)}>{v.label}{n ? ` (${n})` : ''}</Tab>;
        })}
      </Tabs>
      {error && <Empty style={{ color: '#b91c1c' }}>{error}</Empty>}
      {items.length === 0 ? <Empty>Nothing here.</Empty> : (
        <List>
          {items.map(({ type, item }) => <Item key={`${type}-${item.id}`} type={type} item={item} onModerate={moderate} />)}
        </List>
      )}
    </>
  );
}
