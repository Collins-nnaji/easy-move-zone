import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaArrowRight, FaCheckCircle, FaCloudUploadAlt, FaTimes, FaVideo, FaCamera,
  FaMapMarkerAlt, FaRegCalendarAlt, FaSearch,
} from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { fileToDataUrl } from '../utils/imageDataUrl';
import PhotoAnalyzer from '../components/PhotoAnalyzer';
import { FormSections, FormSection } from '../components/FormSection';
import SignInGate from '../components/SignInGate';
import RenovationTracker from '../components/RenovationTracker';
import RenovationIcon from '../components/RenovationIcon';
import {
  RENOVATION_SERVICES, SIZE_BANDS, INSPECTION_WINDOWS,
  SERVICE_BY_ID,
} from '../config/renovations';
import {
  COUNTRY_SUGGESTIONS, CURRENCY, CURRENCY_LABEL, DEFAULT_COUNTRY, regionsFor, LOCALE,
} from '../config/markets';

const MAX_FILES = 30;
const MIN_PHOTOS = 4;

/* ── Layout ── */

const Body = styled.section`
  max-width: var(--container); margin: 0 auto; padding: 2rem 2.5rem 4.5rem; width: 100%;
  @media (max-width: 720px) { padding: 1.5rem 1.25rem 3.5rem; }
`;

const SwitchRow = styled.div` display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap; `;
const SwitchBtn = styled.button`
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green)' : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : 'var(--color-ink-muted)')};
  border-radius: 999px; padding: 0.6rem 1.2rem; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: all 0.13s;
  &:hover { border-color: var(--color-green); }
`;

/* ── Service catalog ── */
const SectionTitle = styled.h2`
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em;
  margin: 0 0 1.25rem;
  @media (max-width: 720px) { font-size: 1.3rem; margin-bottom: 0.85rem; }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.85rem; margin-bottom: 2.5rem;
  /* Phones: two compact tiles a row — the name is enough to choose by. */
  @media (max-width: 720px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; margin-bottom: 1.75rem; }
`;
const ServiceCard = styled.button`
  text-align: left;
  border: 2px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};
  border-radius: 16px; padding: 1.15rem 1.2rem; cursor: pointer; transition: all 0.13s;
  &:hover { border-color: var(--color-green); transform: translateY(-2px); box-shadow: var(--shadow-lift); }
  .icon { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; background: var(--color-green-soft); color: var(--color-green-deep); font-size: 1.05rem; }
  .name { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; margin: 0.5rem 0 0.25rem; color: var(--color-ink); }
  .blurb { font-size: 0.82rem; color: var(--color-ink-muted); line-height: 1.4; }

  @media (max-width: 720px) {
    border-radius: 14px; padding: 0.8rem 0.85rem;
    .icon { width: 34px; height: 34px; border-radius: 10px; font-size: 0.95rem; }
    .name { font-size: 0.9rem; margin: 0.45rem 0 0; line-height: 1.25; }
    .blurb { display: none; }
  }
`;

/* ── Form ── */
const FormCard = styled.div`
  background: #fff; border-radius: 24px; padding: 2.25rem; box-shadow: var(--shadow-lift); width: 100%;
  @media (max-width: 720px) { padding: 1rem; border-radius: 16px; }
`;
const Fields = styled.div`
  display: flex; flex-direction: column; gap: 1.4rem;
  @media (max-width: 720px) { gap: 1rem; }
`;
const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); gap: 0.85rem; }
`;
const Field = styled.div``;
const Label = styled.label`
  display: block; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-ink-soft); margin-bottom: 0.5rem;
`;
const inputCss = `
  width: 100%; background: var(--color-bg-sunken); border: 1px solid var(--color-line-strong);
  border-radius: 12px; padding: 0.9rem 1.1rem; font-family: var(--font-sans); font-size: 1rem; color: var(--color-ink);
  outline: none; transition: border-color 0.15s, background 0.15s;
  &:focus { border-color: var(--color-green); background: #fff; }
  @media (max-width: 720px) { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.95rem; }
`;
const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss} cursor: pointer;`;
const Textarea = styled.textarea`
  ${inputCss} min-height: 100px; resize: vertical; line-height: 1.5;
  @media (max-width: 720px) { min-height: 82px; }
`;

const EstimateCard = styled.div`
  border: 1px solid rgba(184, 90, 48,0.22); background: linear-gradient(180deg, #f3f6f1 0%, #fff 72%);
  border-radius: 14px; padding: 1.1rem 1.2rem;
  .k { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-green-ink); margin-bottom: 0.35rem; }
  .v { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--color-ink); }
  .note { font-size: 0.8rem; color: var(--color-ink-muted); line-height: 1.45; margin-top: 0.5rem; }
`;

const Dropzone = styled.button`
  width: 100%; border: 2px dashed ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  border-radius: 16px; background: ${(p) => (p.$active ? '#f3f6f1' : 'var(--color-bg-sunken)')};
  padding: 1.6rem; text-align: center; cursor: pointer; transition: all 0.15s;
  &:hover { border-color: var(--color-green); background: #f3f6f1; }
  @media (max-width: 720px) { padding: 1rem 0.75rem; border-radius: 12px; }
`;
const DropIcon = styled.div`
  width: 46px; height: 46px; margin: 0 auto 0.6rem; border-radius: 13px;
  background: var(--color-green-chip); color: var(--color-green-deep);
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  @media (max-width: 720px) { width: 38px; height: 38px; margin-bottom: 0.45rem; font-size: 1.1rem; }
`;
const DropTitle = styled.div` font-size: 0.98rem; font-weight: 700; margin-bottom: 0.2rem; color: var(--color-ink); `;
const DropHint = styled.div` font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); `;
const Thumbs = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.6rem; margin-top: 0.8rem; `;
const Thumb = styled.div`
  position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-slate), var(--color-green-wash)); border: 1px solid var(--color-line-strong);
  display: flex; align-items: center; justify-content: center; color: var(--color-ink-faint); font-size: 1.2rem;
  img { width: 100%; height: 100%; object-fit: cover; }
  .kind { position: absolute; bottom: 4px; left: 5px; font-family: var(--font-mono); font-size: 0.52rem; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.6); }
  .overlay { position: absolute; inset: 0; background: rgba(16, 18, 24, 0.62); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 0.7rem; color: #fff; }
  .err { background: rgba(185,28,28,0.65); }
  .rm { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%; border: none; background: rgba(16, 18, 24, 0.75); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; cursor: pointer; &:hover { background: var(--color-green); } }
`;
const AssistPanel = styled.div`
  border: 1px solid rgba(184, 90, 48, 0.22); background: linear-gradient(180deg, #f3f6f1 0%, #fff 72%);
  border-radius: 16px; padding: 1.1rem 1.2rem; margin-top: 0.9rem;
  .head { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display); font-weight: 700; margin-bottom: 0.3rem; svg { color: var(--color-green); } }
  .sub { font-size: 0.82rem; color: var(--color-ink-muted); line-height: 1.45; margin-bottom: 0.9rem; }
`;

const SubmitBtn = styled.button`
  width: 100%; margin-top: 0.5rem; background: var(--color-green); color: #fff; border: none;
  padding: 1.1rem; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: background 0.15s;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const ErrorMsg = styled.p` color: #b91c1c; font-size: 0.88rem; margin: 0.5rem 0 0; text-align: center; `;
const FootNote = styled.div` font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); text-align: center; margin-top: 0.85rem; `;

/* ── Success ── */
const Success = styled(motion.div)` text-align: center; padding: 1.5rem 1rem 2rem; `;
const SuccessIcon = styled.div`
  width: 60px; height: 60px; border-radius: 50%; background: var(--color-green-soft); color: var(--color-green);
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1.1rem;
`;

/* ── My upgrades ── */
const Lookup = styled.div` display: flex; gap: 0.5rem; max-width: 460px; margin-bottom: 1.75rem; `;
const RequestList = styled.div` display: flex; flex-direction: column; gap: 1.5rem; max-width: 780px; `;
const Empty = styled.div` color: var(--color-ink-faint); font-family: var(--font-mono); font-size: 0.85rem; padding: 2rem 0; `;

const money = (v, ccy = 'NGN') => {
  const n = Number(v) || 0;
  try { return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: ccy, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n); }
  catch { return `${ccy} ${n.toLocaleString()}`; }
};

/* Tomorrow, as yyyy-mm-dd, for the inspection date minimum. */
const minDate = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Public renovation request tool inside the EasyCheck shell. Starting a new
 * request does not require an account; existing project records stay private.
 */
export default function OfferRenovate() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState(params.get('view') === 'mine' ? 'mine' : 'new');

  return (
    <Body>
      <SwitchRow>
        <SwitchBtn $on={mode === 'new'} onClick={() => { setMode('new'); setParams({}); }}>Request renovation</SwitchBtn>
        <SwitchBtn $on={mode === 'mine'} onClick={() => { setMode('mine'); setParams({ view: 'mine' }); }}>My renovations</SwitchBtn>
      </SwitchRow>

      {mode === 'new'
        ? <NewRequest user={user} />
        : <MyUpgrades user={user} highlightRef={params.get('ref')} />}
    </Body>
  );
}

/* ─────────────────────────── New request wizard ─────────────────────────── */
function NewRequest({ user }) {
  const [params] = useSearchParams();
  const fileInputRef = useRef(null);

  const [service, setService] = useState(params.get('service') && SERVICE_BY_ID[params.get('service')] ? params.get('service') : '');
  const [media, setMedia] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [estimate, setEstimate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const [f, setF] = useState({
    title: '', description: '', propertyType: '', sizeBand: '', budgetBand: '',
    country: DEFAULT_COUNTRY, currency: CURRENCY, state: '', city: '', area: '', address: '',
    inspectionDate: '', inspectionWindow: '',
    name: user?.name || '', email: user?.email || '', phone: '',
  });
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    let active = true;
    api.getMediaConfig().then((c) => active && setUploadEnabled(!!c.enabled)).catch(() => {});
    return () => { active = false; };
  }, []);

  // Refresh the indicative estimate whenever service or size band changes.
  useEffect(() => {
    if (!service || !f.sizeBand || f.country !== 'Nigeria' || f.currency !== 'NGN') { setEstimate(null); return; }
    let active = true;
    api.renovations.estimate({ service, sizeBand: f.sizeBand })
      .then((e) => active && setEstimate(e)).catch(() => {});
    return () => { active = false; };
  }, [service, f.sizeBand, f.country, f.currency]);

  const photoCount = media.filter((x) => x.status === 'done' && x.kind === 'image').length;
  const analyzableImages = media
    .filter((x) => x.kind === 'image' && x.analysisDataUrl)
    .map((x) => ({ id: x.id, dataUrl: x.analysisDataUrl }));

  const pickFiles = () => fileInputRef.current && fileInputRef.current.click();

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, MAX_FILES);
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isVideo = file.type.startsWith('video/');
      const previewUrl = isVideo ? null : URL.createObjectURL(file);
      setMedia((m) => [...m, { id, name: file.name, kind: isVideo ? 'video' : 'image', previewUrl, status: 'uploading', pct: 0 }]);
      if (!isVideo) {
        fileToDataUrl(file)
          .then((analysisDataUrl) => setMedia((m) => m.map((x) => (x.id === id ? { ...x, analysisDataUrl } : x))))
          .catch(() => {});
      }
      try {
        const { blobUrl } = await api.uploadMedia(file, {
          prefix: 'renov',
          onProgress: (pct) => setMedia((m) => m.map((x) => (x.id === id ? { ...x, pct } : x))),
        });
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'done', url: blobUrl, pct: 100 } : x)));
      } catch {
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'error' } : x)));
      }
    }
  };

  const onFiles = async (e) => { const list = Array.from(e.target.files || []); e.target.value = ''; await uploadFiles(list); };
  const onDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files); };
  const removeMedia = async (id) => {
    const item = media.find((x) => x.id === id);
    if (!item) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.status !== 'done' || !item.url) { setMedia((m) => m.filter((x) => x.id !== id)); return; }
    try { await api.deleteMedia(item.url); } catch { /* leave it — backend keeps orphan */ }
    setMedia((m) => m.filter((x) => x.id !== id));
  };

  const mediaReady = !uploadEnabled || photoCount >= MIN_PHOTOS;
  const canSubmit = service && f.name.trim() && f.email.trim() && f.country && f.currency && f.state && mediaReady && !submitting;

  const submit = async () => {
    if (!service) { setError('Please choose an upgrade service above.'); return; }
    if (!mediaReady) { setError(`Please upload at least ${MIN_PHOTOS} photos of the space (you have ${photoCount}).`); return; }
    if (!f.name.trim() || !f.email.trim() || !f.country || !f.currency || !f.state) { setError('Please add your contact details, country, region and currency.'); return; }
    setSubmitting(true); setError('');
    try {
      const uploaded = media.filter((x) => x.status === 'done' && x.url).map((x) => ({ url: x.url, kind: x.kind }));
      const res = await api.renovations.submit({
        service,
        title: f.title || `${SERVICE_BY_ID[service]?.name} · ${f.city || f.state}, ${f.country}`,
        description: f.description,
        propertyType: f.propertyType,
        sizeBand: f.sizeBand,
        budgetBand: f.budgetBand,
        country: f.country, currency: f.currency,
        state: f.state, city: f.city, area: f.area, address: f.address,
        inspectionDate: f.inspectionDate || null,
        inspectionWindow: f.inspectionWindow || null,
        media: uploaded,
        contactName: f.name, contactEmail: f.email, phone: f.phone,
      });
      setDone({ id: res.id, ref: res.ref, email: f.email });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Could not submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <FormCard>
        <Success initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SuccessIcon><FaCheckCircle /></SuccessIcon>
          <SectionTitle style={{ marginBottom: '0.4rem' }}>Request received</SectionTitle>
          <p style={{ color: 'var(--color-ink-muted)', margin: '0 auto', maxWidth: '46ch', lineHeight: 1.55 }}>
            Thanks{f.name ? `, ${f.name.split(' ')[0]}` : ''}! Reference <strong>{done.ref}</strong>.
            Our team will confirm your inspection and follow up here.
          </p>
        </Success>
        <RenovationTracker id={done.id} email={done.email} />
      </FormCard>
    );
  }

  return (
    <>
      <SectionTitle>1. Choose the work you need</SectionTitle>
      <Grid>
        {RENOVATION_SERVICES.map((s) => (
          <ServiceCard key={s.id} type="button" $on={service === s.id} onClick={() => setService(s.id)}>
            <div className="icon"><RenovationIcon service={s.id} /></div>
            <div className="name">{s.name}</div>
            <div className="blurb">{s.blurb}</div>
          </ServiceCard>
        ))}
      </Grid>

      <SectionTitle>2. Tell us about the project</SectionTitle>
      <FormCard>
        <Fields>
          <Field>
            <Label>Short title (optional)</Label>
            <Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder={service ? `e.g. ${SERVICE_BY_ID[service]?.name} for a 4-bed duplex` : 'e.g. Solar for a 4-bed duplex'} />
          </Field>

          <TwoCol>
            <Field>
              <Label>Property type</Label>
              <Select value={f.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                <option value="">Select…</option>
                {['Flat / apartment', 'Bungalow', 'Duplex', 'Terrace / townhouse', 'Detached house', 'Commercial', 'Land / new build', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field>
              <Label>Project size</Label>
              <Select value={f.sizeBand} onChange={(e) => set('sizeBand', e.target.value)}>
                <option value="">Select…</option>
                {SIZE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </Select>
            </Field>
          </TwoCol>

          {estimate && (
            <EstimateCard>
              <div className="k">Instant indicative estimate</div>
              <div className="v">{money(estimate.low, estimate.currency)} – {money(estimate.high, estimate.currency)}</div>
              <div className="note">{estimate.note}</div>
            </EstimateCard>
          )}
          {service && f.sizeBand && f.country && f.currency && !(f.country === 'Nigeria' && f.currency === 'NGN') && (
            <EstimateCard>
              <div className="k">Local quote after review</div>
              <div className="note">We will price this project in {f.currency} after reviewing the property location, photos and requested scope.</div>
            </EstimateCard>
          )}

          <Field>
            <Label>Working budget {f.currency ? `(${f.currency})` : ''} · optional</Label>
            <Input value={f.budgetBand} onChange={(e) => set('budgetBand', e.target.value)} inputMode="decimal" placeholder="e.g. 25,000" />
          </Field>

          <Field>
            <Label>Describe what you want done</Label>
            <Textarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Tell us the scope, any brands or specs you prefer, timing, and anything the inspector should know." />
          </Field>

        </Fields>

        <FormSections defaultOpen={['media']}>
          <FormSection
            id="media"
            step={2}
            title="Photos & walkthrough video"
            required={uploadEnabled}
            done={mediaReady && media.length > 0}
            summary={uploadEnabled ? `${photoCount}/${MIN_PHOTOS} photos added` : 'Media can follow after submission'}
          >
          <Fields>
          {/* Media */}
          <Field>
            <Dropzone
              type="button" $active={dragActive} onClick={pickFiles}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={onDrop}
            >
              <DropIcon><FaCloudUploadAlt /></DropIcon>
              <DropTitle>{uploadEnabled ? (dragActive ? 'Drop files to upload' : 'Drag photos & video here, or click to browse') : 'Photos & video'}</DropTitle>
              <DropHint>{uploadEnabled ? 'jpg, png, mp4, mov. Clear shots of the space help us scope accurately' : 'Uploads unavailable. An advisor will collect media directly'}</DropHint>
            </Dropzone>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
            {media.length > 0 && (
              <Thumbs>
                {media.map((m) => (
                  <Thumb key={m.id}>
                    {m.kind === 'image' && m.previewUrl ? <img src={m.previewUrl} alt={m.name} /> : <FaVideo />}
                    <span className="kind">{m.kind === 'video' ? 'VIDEO' : 'IMG'}</span>
                    {m.status === 'uploading' && <div className="overlay">{m.pct}%</div>}
                    {m.status === 'error' && <div className="overlay err">failed</div>}
                    {m.status !== 'uploading' && <button type="button" className="rm" onClick={() => removeMedia(m.id)}><FaTimes /></button>}
                  </Thumb>
                ))}
              </Thumbs>
            )}
            {analyzableImages.length > 0 && (
              <AssistPanel>
                <div className="head"><FaCamera /> AI photo check</div>
                <div className="sub">Get an instant read on your photos for condition, quality and any shots that are blurry or dark. Analyzed on-device; these copies are never uploaded.</div>
                <PhotoAnalyzer images={analyzableImages} allowUpload={false} ctaLabel={`Check ${analyzableImages.length} photo${analyzableImages.length === 1 ? '' : 's'}`} />
              </AssistPanel>
            )}
          </Field>

          </Fields>
          </FormSection>

          {/* Location */}
          <FormSection
            id="location"
            step={3}
            title="Where is the property?"
            icon={FaMapMarkerAlt}
            required
            done={Boolean(f.country && f.currency && f.state)}
            summary={[f.city, f.state, f.country].filter(Boolean).join(', ') || 'Country, region and city'}
          >
          <Fields>
          <TwoCol>
            <Field>
              <Label>Country</Label>
              <Input value={f.country} onChange={(e) => { set('country', e.target.value); set('state', ''); }} list="renovation-country-options" placeholder="Start typing a country" />
              <datalist id="renovation-country-options">{COUNTRY_SUGGESTIONS.map((country) => <option key={country} value={country} />)}</datalist>
            </Field>
            <Field>
              <Label>Quote currency</Label>
              <Input value={CURRENCY_LABEL} readOnly aria-readonly="true" tabIndex={-1} />
            </Field>
          </TwoCol>
          <TwoCol>
            <Field>
              <Label>State / region</Label>
              {regionsFor(f.country) ? (
                <Select value={f.state} onChange={(e) => set('state', e.target.value)}>
                  <option value="">Select state…</option>
                  {regionsFor(f.country).map((s) => <option key={s}>{s}</option>)}
                </Select>
              ) : <Input value={f.state} onChange={(e) => set('state', e.target.value)} placeholder="State, county or region" />}
            </Field>
            <Field>
              <Label>City / town</Label>
              <Input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="City or town" />
            </Field>
          </TwoCol>
          <Field>
            <Label>Area / address (optional)</Label>
            <Input value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, estate or landmark for the inspector" />
          </Field>

          </Fields>
          </FormSection>

          {/* Inspection */}
          <FormSection
            id="inspection"
            step={4}
            title="Preferred inspection slot"
            icon={FaRegCalendarAlt}
            done={Boolean(f.inspectionDate)}
            summary={f.inspectionDate ? `${f.inspectionDate}${f.inspectionWindow ? ` · ${f.inspectionWindow}` : ''}` : 'Pick a date, or leave it to us'}
          >
          <Fields>
          <TwoCol>
            <Field>
              <Label>Preferred date (optional)</Label>
              <Input type="date" min={minDate()} value={f.inspectionDate} onChange={(e) => set('inspectionDate', e.target.value)} />
            </Field>
            <Field>
              <Label>Time window</Label>
              <Select value={f.inspectionWindow} onChange={(e) => set('inspectionWindow', e.target.value)}>
                <option value="">No preference</option>
                {INSPECTION_WINDOWS.map((w) => <option key={w}>{w}</option>)}
              </Select>
            </Field>
          </TwoCol>

          </Fields>
          </FormSection>

          {/* Contact */}
          <FormSection
            id="contact"
            step={5}
            title="Your contact details"
            required
            done={Boolean(f.name.trim() && f.email.trim())}
            summary={f.name.trim() ? [f.name.trim(), f.email.trim()].filter(Boolean).join(' · ') : 'Name, phone and email'}
          >
          <Fields>
          <TwoCol>
            <Field>
              <Label>Full name</Label>
              <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field>
              <Label>Phone</Label>
              <Input value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="080…" inputMode="tel" />
            </Field>
          </TwoCol>
          <Field>
            <Label>Email</Label>
            <Input value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@email.com" inputMode="email" />
          </Field>

          </Fields>
          </FormSection>
        </FormSections>

        <Fields style={{ marginTop: '1.25rem' }}>
          <SubmitBtn type="button" onClick={submit} disabled={!canSubmit}>
            {submitting ? 'Submitting…' : 'Submit request & book inspection'} <FaArrowRight />
          </SubmitBtn>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <FootNote>No payment now. You only pay a deposit once you accept a firm quote after inspection.</FootNote>
        </Fields>
      </FormCard>
    </>
  );
}

/* ─────────────────────────── My upgrades ─────────────────────────── */
function MyUpgrades({ user, highlightRef }) {
  const [email, setEmail] = useState(user?.email || '');
  const [submittedEmail, setSubmittedEmail] = useState(user?.email || '');
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null);

  const load = useMemo(() => async (e) => {
    if (!e) return;
    setLoading(true);
    try {
      const list = await api.renovations.mine(e);
      setRequests(list);
      const match = highlightRef ? list.find((r) => r.ref === highlightRef) : null;
      setOpenId(match ? match.id : (list[0]?.id ?? null));
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }, [highlightRef]);

  useEffect(() => { if (user?.email) load(user.email); }, [user?.email, load]);

  return (
    <SignInGate title="Sign in to see your renovations" action="view your renovation requests and payments">
      {!user?.email && (
        <Lookup>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email you used to request" />
          <SwitchBtn $on onClick={() => { setSubmittedEmail(email); load(email); }}><FaSearch /></SwitchBtn>
        </Lookup>
      )}
      {loading ? (
        <Empty>Loading your renovations…</Empty>
      ) : requests == null ? (
        <Empty>Enter your email to see your renovation requests.</Empty>
      ) : requests.length === 0 ? (
        <Empty>No upgrade requests found for {submittedEmail || 'this email'} yet.</Empty>
      ) : (
        <RequestList>
          {requests.map((r) => (
            <div key={r.id}>
              {openId === r.id
                ? <RenovationTracker id={r.id} email={submittedEmail || user?.email} />
                : (
                  <ServiceCard type="button" style={{ width: '100%' }} onClick={() => setOpenId(r.id)}>
                    <div className="name">{SERVICE_BY_ID[r.service]?.name || r.title}</div>
                    <div className="blurb">{r.ref} · {r.city ? `${r.city}, ` : ''}{r.state} · {r.status}{Number(r.unread) > 0 ? ` · ${r.unread} new` : ''}</div>
                  </ServiceCard>
                )}
            </div>
          ))}
        </RequestList>
      )}
    </SignInGate>
  );
}
