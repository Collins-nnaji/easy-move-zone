import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Card, Empty, Btn } from './manage-sections';
import ListHomeDialog, { takeListDraft } from '../components/ListHomeDialog';

const STATUS = {
  submitted: 'Waiting for a check',
  reviewing: 'Being checked',
  pending_review: 'Waiting for a check',
  live: 'On the site',
  let: 'Let',
  withdrawn: 'Taken down',
  rejected: 'Not accepted',
};

const Row = styled.article`
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-line);
  h3 { margin: 0; font-size: 1.05rem; }
  p { margin: 0; color: var(--color-ink-muted); font-size: 0.9rem; line-height: 1.45; }
  .top { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .status { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-green-deep); }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.45rem;
`;

function money(listing) {
  const n = Number(listing.price);
  if (!n) return '';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: listing.currency || 'NGN', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₦${n.toLocaleString('en-NG')}`;
  }
}

export default function MyListings({ user }) {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState(null);
  const [storageOn, setStorageOn] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(params.get('list') === '1');

  const load = useCallback(async () => {
    const out = await api.listings.self();
    setRows(out.listings || []);
    setStorageOn(Boolean(out.storageEnabled));
  }, []);

  useEffect(() => {
    let live = true;
    const draft = takeListDraft();
    (async () => {
      try {
        if (draft?.address) await api.listings.createSelf(draft);
      } catch (err) {
        if (live) setError(err?.message || 'Could not save that listing.');
      }
      try {
        if (live) await load();
      } catch (err) {
        if (live) {
          setRows([]);
          setError(err?.message || 'Could not load your listings.');
        }
      }
    })();
    return () => { live = false; };
  }, [load]);

  const withdraw = async (id) => {
    setError('');
    try {
      await api.listings.withdrawSelf(id);
      await load();
    } catch (err) {
      setError(err?.message || 'Could not take that listing down.');
    }
  };

  const addPhotos = async (id, fileList) => {
    setError('');
    try {
      const media = [];
      for (const file of Array.from(fileList || []).slice(0, 6)) {
        const out = await api.uploadMedia(file, { prefix: 'list' });
        media.push({ url: out.blobUrl, kind: 'photo', name: file.name });
      }
      if (media.length) {
        await api.listings.addSelfPhotos(id, media);
        await load();
      }
    } catch (err) {
      setError(err?.message || 'Those photos could not be added.');
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Homes you listed</h2>
        <Btn type="button" onClick={() => setOpen(true)}>List a home</Btn>
      </div>
      <p style={{ margin: '0 0 0.6rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
        These are on your account. Nothing goes live until we have checked it. Enquiries show here once renters write in.
      </p>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {rows === null && <Empty>Loading your listings…</Empty>}
      {rows && rows.length === 0 && <Empty>You have not listed a home yet.</Empty>}
      {rows && rows.map((row) => (
        <Row key={row.id}>
          <div className="top">
            <h3>{row.title || row.address}</h3>
            <span className="status">{STATUS[row.status] || row.status}</span>
          </div>
          <p>{[row.address, row.city, row.state].filter(Boolean).join(', ')}</p>
          <p>
            {[money(row) && `${money(row)} a year`, row.beds && `${row.beds} bed`, `${row.enquiries || 0} enquir${row.enquiries === 1 ? 'y' : 'ies'}`].filter(Boolean).join(' · ')}
          </p>
          {row.photos_pending && (
            <p>{storageOn ? 'Photos are still missing.' : 'Photo storage is not connected, so this listing has no photos yet.'}</p>
          )}
          <Actions>
            {['submitted', 'reviewing', 'pending_review', 'live'].includes(row.status) && (
              <Btn type="button" onClick={() => withdraw(row.id)}>Take it down</Btn>
            )}
            {row.photos_pending && storageOn && (
              <label>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(row.id, e.target.files)} />
                <Btn as="span">Add photos</Btn>
              </label>
            )}
          </Actions>
        </Row>
      ))}
      <ListHomeDialog
        open={open}
        user={user}
        onClose={() => { setOpen(false); if (params.get('list')) setParams({}, { replace: true }); }}
        onListed={() => load()}
      />
    </Card>
  );
}
