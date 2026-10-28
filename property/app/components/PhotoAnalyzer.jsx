import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { FaCamera, FaTimes, FaMagic } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api';
import { fileToDataUrl } from '../utils/imageDataUrl';
import { Progress } from './shadcn/progress';
import { Reveal } from './motion';

/**
 * Standalone AI photo analysis, powered by the Python engine's vision
 * endpoint (/api/engine/vision) — no listing or property record required.
 * Reads a photo set for condition, quality, scene coverage and per-image
 * flags (blur, low light, duplicates).
 *
 * Two modes:
 *  - Uncontrolled (default): brings its own photo picker.
 *  - Controlled: pass `images` ([{ id, dataUrl }]) and set `allowUpload={false}`
 *    to analyze photos owned by a parent (e.g. the seller upload flow).
 */

const MAX_PHOTOS = 10;
const WARN = /blur|dark|overexpos|duplicate|low resolution|noisy/i;

const Wrap = styled.div``;

const PhotoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const AddPhoto = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3rem;
  width: 76px;
  height: 76px;
  border: none;
  border-radius: 12px;
  background: var(--color-bg-sunken);
  color: var(--color-ink-faint);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  /* The dashed border is an SVG so it can march on hover. */
  svg.ring { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  svg.ring rect { stroke: var(--color-line-strong); transition: stroke 0.15s; }
  &:hover { color: var(--color-green-deep); background: var(--color-green-wash); }
  &:hover svg.ring rect { stroke: var(--color-green); animation: march 1.2s linear infinite; }
  @keyframes march { to { stroke-dashoffset: -14; } }
  @media (prefers-reduced-motion: reduce) { &:hover svg.ring rect { animation: none; } }
`;

const BusyBar = styled(motion.div)`
  margin-top: 0.8rem;
  .k { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--color-ink-muted); margin-bottom: 0.4rem; }
`;

const BUSY_STEPS = ['Uploading photos', 'Reading each room', 'Checking light and blur', 'Scoring condition'];

/** A determinate-looking bar for an indeterminate wait: it climbs to ~92% and holds. */
function AnalyzingBar({ count }) {
  const [pct, setPct] = useState(6);
  React.useEffect(() => {
    const t = setInterval(() => setPct((p) => (p < 92 ? p + Math.max(1, (92 - p) * 0.12) : p)), 220);
    return () => clearInterval(t);
  }, []);
  const step = BUSY_STEPS[Math.min(BUSY_STEPS.length - 1, Math.floor((pct / 92) * BUSY_STEPS.length))];
  return (
    <BusyBar initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite">
      <div className="k"><span>{step}…</span><span>{count} photo{count === 1 ? '' : 's'}</span></div>
      <Progress value={pct} />
    </BusyBar>
  );
}

const Thumb = styled.div`
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-line-strong);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(16, 18, 24, 0.68);
  color: #fff;
  font-size: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const RunBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  background: var(--color-green);
  color: #06210f;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.02rem;
  cursor: pointer;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  svg { color: #06210f; }
`;

const Err = styled.div`
  margin-top: 0.7rem;
  color: #b91c1c;
  font-size: 0.95rem;
`;

const Result = styled.div`
  margin-top: 1.15rem;
  padding-top: 1.05rem;
  border-top: 1px solid var(--color-line);
`;

const ConsoleOut = styled.div`
  margin-bottom: 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-faint);
  letter-spacing: 0.04em;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.55rem;
  @media (max-width: 620px) { grid-template-columns: 1fr 1fr; }
`;

const Metric = styled.div`
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line);
  border-radius: 11px;
  padding: 0.75rem 0.85rem;
  .k { font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-ink-faint); }
  .v { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; margin-top: 0.2rem; text-transform: capitalize; color: ${(p) => (p.$accent ? 'var(--color-green)' : 'var(--color-ink)')}; }
`;

const SubHead = styled.div`
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin: 1rem 0 0.5rem;
`;

const ReadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.92rem;
  color: var(--color-ink-muted);
  margin-bottom: 0.35rem;
  code { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-ink); }
`;

const Tag = styled.span`
  font-family: var(--font-mono);
  font-size: 0.6rem;
  padding: 0.16rem 0.5rem;
  border-radius: 6px;
  background: ${(p) => (p.$warn ? '#fef2f2' : '#eef2f0')};
  color: ${(p) => (p.$warn ? '#b91c1c' : 'var(--color-ink-muted)')};
`;

const NoteList = styled.ul`
  margin: 0.35rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.92rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
`;

const OfflineNote = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  line-height: 1.5;
`;

export default function PhotoAnalyzer({ images: controlled, allowUpload = true, ctaLabel }) {
  const fileRef = useRef(null);
  const [own, setOwn] = useState([]); // [{ id, dataUrl }] when uncontrolled
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [vision, setVision] = useState(null);

  const photos = controlled || own;

  const addPhotos = async (files) => {
    setError('');
    const room = MAX_PHOTOS - own.length;
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/')).slice(0, room);
    const next = [];
    for (const file of list) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const dataUrl = await fileToDataUrl(file);
        next.push({ id: `photo_${Date.now()}_${next.length}`, dataUrl });
      } catch {
        setError('One of the photos could not be read.');
      }
    }
    if (next.length) setOwn((p) => [...p, ...next]);
  };

  const run = async () => {
    if (!photos.length) { setError('Add at least one photo to analyze.'); return; }
    setRunning(true);
    setError('');
    setOffline(false);
    const payload = photos.map((p) => ({ id: p.id, data: p.dataUrl }));
    try {
      // Prefer Azure OpenAI vision; fall back to the Python pixel engine.
      let result;
      try {
        result = await api.analyzePhotos(payload);
      } catch {
        result = await api.engineVision(payload);
      }
      setVision(result);
    } catch (e) {
      const msg = e.message || 'Photo scan failed.';
      if (/offline|engine/i.test(msg)) setOffline(true);
      else setError(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Wrap>
      <PhotoRow>
        {photos.map((p) => (
          <Thumb key={p.id}>
            <img src={p.dataUrl} alt="Upload" />
            {allowUpload && (
              <RemoveBtn
                type="button"
                aria-label="Remove photo"
                onClick={() => setOwn((prev) => prev.filter((x) => x.id !== p.id))}
              >
                <FaTimes />
              </RemoveBtn>
            )}
          </Thumb>
        ))}
        {allowUpload && own.length < MAX_PHOTOS && (
          <AddPhoto type="button" onClick={() => fileRef.current?.click()}>
            <svg className="ring" viewBox="0 0 76 76" aria-hidden="true"><rect x="1" y="1" width="74" height="74" rx="11" fill="none" strokeWidth="2" strokeDasharray="6 8" strokeLinecap="round" /></svg>
            <FaCamera size={15} />
            add photos
          </AddPhoto>
        )}
        {allowUpload && (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
          />
        )}
      </PhotoRow>

      <RunBtn type="button" onClick={run} disabled={running || photos.length === 0}>
        <FaMagic size={12} />
        {running ? 'Scanning photos…' : (ctaLabel || `Scan ${photos.length || ''} photo${photos.length === 1 ? '' : 's'}`.trim())}
      </RunBtn>
      <AnimatePresence>{running && <AnalyzingBar count={photos.length} />}</AnimatePresence>
      {error && <Err>{error}</Err>}
      {offline && (
        <OfflineNote style={{ marginTop: '0.7rem' }}>
          The photo scan is temporarily unavailable. Please try again in a few minutes.
        </OfflineNote>
      )}

      {vision && vision.imageCount > 0 && (
        <Result as={Reveal} amount={0.1}>
          <ConsoleOut>
            $ vision --done · {vision.imageCount} photo(s) · condition {vision.conditionLabel || '—'}
          </ConsoleOut>
          <MetricGrid>
            <Metric $accent>
              <div className="k">condition</div>
              <div className="v">{vision.conditionLabel || '—'}</div>
            </Metric>
            <Metric>
              <div className="k">avg_quality</div>
              <div className="v">{vision.avgQuality != null ? `${vision.avgQuality}/100` : '—'}</div>
            </Metric>
            <Metric>
              <div className="k">usable</div>
              <div className="v">{vision.usableCount}/{vision.imageCount}</div>
            </Metric>
            <Metric>
              <div className="k">confidence</div>
              <div className="v">{vision.confidence || '—'}</div>
            </Metric>
          </MetricGrid>

          <SubHead>
            Read per photo · {vision.imageCount} photo(s)
            {vision.duplicateCount ? ` · ${vision.duplicateCount} duplicate(s)` : ''}
          </SubHead>
          {vision.images.map((img) => (
            <ReadRow key={img.id}>
              <code>{img.id}</code>
              {img.scene && <span>{img.scene}</span>}
              <span>q{img.quality}</span>
              {(img.tags || []).map((t) => (
                <Tag key={t} $warn={WARN.test(t)}>{t}</Tag>
              ))}
            </ReadRow>
          ))}

          {vision.notes?.length > 0 && (
            <NoteList>
              {vision.notes.map((n) => <li key={n}>{n}</li>)}
            </NoteList>
          )}
        </Result>
      )}
    </Wrap>
  );
}
