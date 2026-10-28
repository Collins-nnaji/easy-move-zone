import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { api } from '../api';
import { siteAuthUrl } from '../auth';
import { MARKET } from '../config/markets';
import { MANAGE_LISTINGS_URL } from '../config/platform';

const DRAFT_KEY = 'emz-list-draft';

export function saveListDraft(payload) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch { /* private mode */ }
}

export function takeListDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(16, 18, 24, 0.46);
  display: grid;
  place-items: end center;
  padding: 0;

  @media (min-width: 720px) {
    place-items: center;
    padding: 1.5rem;
  }
`;

const Sheet = styled.div`
  width: min(100%, 560px);
  max-height: min(100dvh, 920px);
  overflow: auto;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 24px 60px rgba(16, 18, 24, 0.22);

  @media (min-width: 720px) { border-radius: 22px; }
`;

const Head = styled.header`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.15rem 0.85rem;
  background: #fff;
  h2 { margin: 0; font-size: 1.35rem; font-weight: 550; letter-spacing: -0.02em; }
  p { margin: 0.3rem 0 0; color: var(--color-ink-muted); font-size: 0.92rem; line-height: 1.45; }
`;

const Close = styled.button`
  flex: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-ink);
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const Form = styled.form`
  padding: 0.4rem 1.15rem 1.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Field = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  span { display: block; margin-bottom: 0.35rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); }
  input, select, textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 46px;
    border: 1px solid var(--color-line-strong);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    color: var(--color-ink);
    background: #fff;
  }
  textarea { min-height: 88px; resize: vertical; }
`;

const Note = styled.p`
  margin: 0 0 0.9rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  background: var(--color-green-wash, #fdf8f1);
  color: var(--color-ink-muted);
  font-size: 0.88rem;
  line-height: 1.45;
`;

const Submit = styled.button`
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: var(--gradient-brand);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: default; }
`;

const Err = styled.p`color: #b91c1c; font-size: 0.88rem; margin: 0.7rem 0 0;`;

const empty = {
  address: '', city: '', state: '', beds: '', rent: '', phone: '', description: '',
};

/**
 * One screen to list a home. Signed out, the answers wait in this browser
 * and sign-in returns them to the portal, which creates the listing.
 */
export default function ListHomeDialog({ open, onClose, user, onListed }) {
  const [form, setForm] = useState(empty);
  const [storageOn, setStorageOn] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    api.getMediaConfig().then((c) => setStorageOn(Boolean(c?.enabled))).catch(() => setStorageOn(false));
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addPhotos = async (fileList) => {
    setError('');
    setSending(true);
    try {
      const next = [...photos];
      for (const file of Array.from(fileList || []).slice(0, 6 - next.length)) {
        const out = await api.uploadMedia(file, { prefix: 'list' });
        next.push({ url: out.blobUrl, kind: 'photo', name: file.name });
      }
      setPhotos(next);
    } catch (err) {
      setError(err?.message || 'Those photos could not be uploaded.');
    } finally {
      setSending(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const payload = {
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      beds: form.beds,
      rent: form.rent,
      phone: form.phone.trim(),
      description: form.description.trim(),
      country: MARKET.name,
      contactName: user?.name || '',
      media: photos,
    };
    if (!user) {
      saveListDraft(payload);
      window.location.assign(siteAuthUrl({ from: MANAGE_LISTINGS_URL, signup: true }));
      return;
    }
    setSending(true);
    setError('');
    try {
      const out = await api.listings.createSelf(payload);
      setForm(empty);
      setPhotos([]);
      onListed?.(out.listing);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not list this home.');
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Sheet role="dialog" aria-modal="true" aria-labelledby="list-home-title">
        <Head>
          <div>
            <h2 id="list-home-title">List this home</h2>
            <p>It stays off the public site until we have checked it. You manage it from your portal.</p>
          </div>
          <Close type="button" onClick={onClose} aria-label="Close"><X size={18} /></Close>
        </Head>
        <Form onSubmit={submit}>
          <Field>
            <span>Address</span>
            <input required value={form.address} onChange={set('address')} placeholder="12 Marina Close" />
          </Field>
          <Grid>
            <Field>
              <span>City</span>
              <input required value={form.city} onChange={set('city')} placeholder="Lagos" />
            </Field>
            <Field>
              <span>State</span>
              <select required value={form.state} onChange={set('state')}>
                <option value="">Select</option>
                {(MARKET.regions || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </Grid>
          <Grid>
            <Field>
              <span>Bedrooms</span>
              <input value={form.beds} onChange={set('beds')} inputMode="numeric" placeholder="3" />
            </Field>
            <Field>
              <span>Annual rent (₦)</span>
              <input required value={form.rent} onChange={set('rent')} inputMode="numeric" placeholder="2500000" />
            </Field>
          </Grid>
          <Field>
            <span>Phone</span>
            <input value={form.phone} onChange={set('phone')} placeholder={MARKET.phone?.example || '0803 123 4567'} />
          </Field>
          <Field>
            <span>A short note</span>
            <textarea value={form.description} onChange={set('description')} placeholder="What a renter should know." />
          </Field>
          {storageOn ? (
            <Field>
              <span>Photos</span>
              <input type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} />
              {photos.length > 0 && <Note>{photos.length} photo{photos.length === 1 ? '' : 's'} attached.</Note>}
            </Field>
          ) : (
            <Note>Photo storage is not connected, so this listing is saved without photos. You can add them from your portal once it is.</Note>
          )}
          <Submit type="submit" disabled={sending}>
            {sending ? 'Saving…' : user ? 'Save to my portal' : 'Continue to sign in'}
          </Submit>
          {error && <Err>{error}</Err>}
        </Form>
      </Sheet>
    </Overlay>,
    document.body,
  );
}
