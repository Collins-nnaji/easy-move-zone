import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api, isStoredMedia } from '../api';

/**
 * The photos and videos a customer uploaded, for admin review. Uploads sit in
 * a private container, so each one is shown through a short-lived signed URL
 * (POST /api/media/read-many); anything else (an external link) is used as is.
 */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.5rem;
  margin: 0.4rem 0 0.9rem;
`;

const Tile = styled.a`
  position: relative;
  display: block;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-band);
  border: 1px solid var(--color-line);
  color: var(--color-ink-muted);
  font-size: 0.7rem;
  font-weight: 700;

  img, video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tag { position: absolute; left: 0.35rem; bottom: 0.35rem; padding: 0.1rem 0.4rem; border-radius: 6px; background: rgba(255,255,255,0.92); color: var(--color-ink); }
  .none { display: grid; place-items: center; height: 100%; text-align: center; padding: 0.4rem; }
`;

const Note = styled.p`font-size: 0.82rem; color: var(--color-ink-muted); margin: 0.3rem 0 0.9rem;`;

export default function AdminMedia({ media, adminKey, label = 'Photos and video' }) {
  const items = Array.isArray(media) ? media.filter((m) => m && m.url) : [];
  const [urls, setUrls] = useState({});
  const [error, setError] = useState('');
  const key = items.map((m) => m.url).join('|');

  useEffect(() => {
    const stored = key ? key.split('|').filter(isStoredMedia) : [];
    if (!stored.length || !adminKey) return undefined;
    let active = true;
    api.admin.readMedia(stored, adminKey)
      .then((u) => { if (active) { setUrls(u); setError(''); } })
      .catch((e) => { if (active) setError(e.message || 'Could not open the uploads.'); });
    return () => { active = false; };
  }, [key, adminKey]);

  if (!items.length) return <Note>No {label.toLowerCase()} uploaded.</Note>;

  return (
    <>
      <Note style={{ margin: '0.6rem 0 0' }}><strong>{label}</strong> · {items.length}</Note>
      {error && <Note style={{ color: '#b91c1c' }}>{error}</Note>}
      <Grid>
        {items.map((m, i) => {
          const src = isStoredMedia(m.url) ? urls[m.url] : m.url;
          const video = m.kind === 'video' || /\.(mp4|mov)(\?|$)/i.test(m.url);
          return (
            <Tile key={m.url} href={src || undefined} target="_blank" rel="noopener noreferrer" title={video ? 'Video' : `Photo ${i + 1}`}>
              {!src ? <span className="none">{error ? 'Unavailable' : 'Loading…'}</span>
                : video ? <video src={src} preload="metadata" muted /> : <img src={src} alt="" loading="lazy" />}
              {video && <span className="tag">VIDEO</span>}
            </Tile>
          );
        })}
      </Grid>
    </>
  );
}

const DocList = styled.ul`
  list-style: none;
  margin: 0.4rem 0 0.9rem;
  padding: 0;
  display: grid;
  gap: 0.35rem;
  li { font-size: 0.85rem; color: var(--color-ink); display: flex; flex-wrap: wrap; gap: 0.35rem 0.6rem; align-items: baseline; }
  .later { font-size: 0.78rem; color: var(--color-warn, #b45309); }
  a { font-size: 0.8rem; font-weight: 600; }
`;

/**
 * The title and land documents an owner ticked on the Sell form, with a
 * signed link for each file they uploaded. Ticked but not uploaded means the
 * adviser has to collect it — that is called out, because verification (and
 * the 14-day purchase clock) cannot start without it.
 */
export function AdminDocuments({ documents, adminKey }) {
  const docs = Array.isArray(documents) ? documents.filter((d) => d && d.name) : [];
  const [urls, setUrls] = useState({});
  const [error, setError] = useState('');
  const key = docs.flatMap((d) => (d.files || []).map((f) => f.url)).join('|');

  useEffect(() => {
    const stored = key ? key.split('|').filter(isStoredMedia) : [];
    if (!stored.length || !adminKey) return undefined;
    let active = true;
    api.admin.readMedia(stored, adminKey)
      .then((u) => { if (active) { setUrls(u); setError(''); } })
      .catch((e) => { if (active) setError(e.message || 'Could not open the documents.'); });
    return () => { active = false; };
  }, [key, adminKey]);

  if (!docs.length) return <Note>No title documents ticked. Ask the owner what they hold.</Note>;
  const missing = docs.filter((d) => !(d.files || []).length).length;

  return (
    <>
      <Note style={{ margin: '0.6rem 0 0' }}>
        <strong>Title documents</strong> · {docs.length} held{missing ? ` · ${missing} still to collect` : ' · all uploaded'}
      </Note>
      {error && <Note style={{ color: '#b91c1c' }}>{error}</Note>}
      <DocList>
        {docs.map((d) => (
          <li key={`${d.id}-${d.name}`}>
            <span>{d.name}</span>
            {(d.files || []).length ? d.files.map((f) => {
              const href = isStoredMedia(f.url) ? urls[f.url] : f.url;
              return href
                ? <a key={f.url} href={href} target="_blank" rel="noopener noreferrer">{f.name || 'Open'}</a>
                : <span key={f.url} className="later">{error ? 'Unavailable' : 'Loading…'}</span>;
            }) : <span className="later">to collect</span>}
          </li>
        ))}
      </DocList>
    </>
  );
}
