import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaPaperclip, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { api } from '../api';
import {
  TITLE_DOC_GROUPS, TITLE_DOCUMENTS, OTHER_DOCUMENT, REGISTERED_TITLE_IDS,
} from '../config/titleDocuments';

/**
 * "Which documents do you have?" on the Sell form. The owner ticks each paper
 * they hold and, if they can, uploads it there and then; anything ticked but
 * not uploaded is collected by their adviser. Files go to the private
 * container and are only ever opened by our team through signed links.
 *
 * `value` is [{ id, name, files: [{ key, url, name, status }] }], and
 * `onChange` takes an updater, because uploads finish one at a time.
 */

const Intro = styled.p`
  font-size: 0.88rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
  margin: 0 0 1rem;
`;

const Signal = styled.div`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  font-size: 0.85rem;
  line-height: 1.45;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  margin-bottom: 1rem;
  background: ${(p) => (p.$good ? 'var(--color-green-soft)' : 'var(--color-bg-sunken)')};
  color: ${(p) => (p.$good ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  border: 1px solid ${(p) => (p.$good ? 'rgba(47, 93, 80,0.22)' : 'var(--color-line)')};
  svg { flex-shrink: 0; margin-top: 0.15rem; }
`;

const Group = styled.div`
  margin-bottom: 1.1rem;
  h4 {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-ink);
    margin: 0 0 0.15rem;
  }
  .ghint { font-size: 0.78rem; color: var(--color-ink-faint); margin: 0 0 0.5rem; }
`;

const Doc = styled.div`
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? '#fff' : 'var(--color-bg-sunken)')};
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  margin-bottom: 0.45rem;
  transition: border-color 0.15s, background 0.15s;

  label.row {
    display: flex;
    gap: 0.65rem;
    align-items: flex-start;
    cursor: pointer;
    font-size: 0.92rem;
    color: var(--color-ink);
  }
  label.row input { width: 18px; height: 18px; margin-top: 0.1rem; accent-color: var(--color-green); flex-shrink: 0; cursor: pointer; }
  .hint { display: block; font-size: 0.78rem; color: var(--color-ink-faint); margin-top: 0.1rem; }
  @media (max-width: 640px) { .hint { display: none; } }

  .files { margin: 0.55rem 0 0 1.75rem; display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.55rem;
  border-radius: 8px;
  background: ${(p) => (p.$err ? '#fee2e2' : 'var(--color-bg-sunken)')};
  color: ${(p) => (p.$err ? '#b91c1c' : 'var(--color-ink)')};
  border: 1px solid var(--color-line);
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
  button { border: none; background: none; padding: 0; cursor: pointer; color: var(--color-ink-faint); display: inline-flex; }
`;

const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-green-deep);
  cursor: pointer;
  padding: 0.3rem 0.1rem;
  input { display: none; }
`;

const Later = styled.span` font-size: 0.78rem; color: var(--color-ink-faint); `;

const OtherName = styled.input`
  flex: 1;
  min-width: 0;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--color-ink);
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: 10px;
  padding: 0.5rem 0.65rem;
  outline: none;
  &:focus { border-color: var(--color-green); background: #fff; }
`;

const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px dashed var(--color-line-strong);
  background: #fff;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  cursor: pointer;
  &:hover { border-color: var(--color-green); color: var(--color-green-deep); }
`;

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*';
const MAX_FILES = 6;
let seq = 0;
const nextKey = () => `d${Date.now().toString(36)}${(seq += 1)}`;

export default function TitleDocuments({ value, onChange, uploadEnabled }) {
  const ticked = (id) => value.some((d) => d.id === id);
  const patchDoc = (match, fn) => onChange((list) => list.map((d) => (match(d) ? fn(d) : d)));

  const toggle = (doc) => onChange((list) => (list.some((d) => d.id === doc.id)
    ? list.filter((d) => d.id !== doc.id)
    : [...list, { id: doc.id, name: doc.name, key: doc.id, files: [] }]));

  const upload = async (docKey, e) => {
    // Copy first: in Chrome the FileList is live, and clearing the input empties it.
    const room = MAX_FILES - (value.find((d) => d.key === docKey)?.files.length || 0);
    const files = Array.from(e.target.files || []).slice(0, Math.max(room, 0));
    e.target.value = '';
    for (const file of files) {
      const key = nextKey();
      patchDoc((d) => d.key === docKey, (d) => ({ ...d, files: [...d.files, { key, name: file.name, status: 'uploading' }] }));
      const setFile = (next) => patchDoc((d) => d.key === docKey, (d) => ({
        ...d, files: d.files.map((f) => (f.key === key ? { ...f, ...next } : f)),
      }));
      try {
        const { blobUrl } = await api.uploadMedia(file, { prefix: 'title' });
        setFile({ url: blobUrl, status: 'done' });
      } catch {
        setFile({ status: 'error' });
      }
    }
  };

  const removeFile = async (docKey, file) => {
    patchDoc((d) => d.key === docKey, (d) => ({ ...d, files: d.files.filter((f) => f.key !== file.key) }));
    if (file.url) api.deleteMedia(file.url).catch(() => {});
  };

  const others = value.filter((d) => d.id === 'other');
  const addOther = () => onChange((list) => [...list, { id: 'other', name: '', key: nextKey(), files: [] }]);
  const removeOther = (doc) => {
    doc.files.forEach((f) => f.url && api.deleteMedia(f.url).catch(() => {}));
    onChange((list) => list.filter((d) => d.key !== doc.key));
  };

  const hasRegistered = value.some((d) => REGISTERED_TITLE_IDS.includes(d.id));

  const fileRow = (doc) => (
    <div className="files">
      {doc.files.map((f) => (
        <Chip key={f.key} $err={f.status === 'error'}>
          {f.status === 'done' ? <FaCheckCircle size={10} color="var(--color-green)" /> : <FaPaperclip size={10} />}
          <span>{f.status === 'uploading' ? `Uploading ${f.name}…` : f.status === 'error' ? `${f.name} failed` : f.name}</span>
          <button type="button" aria-label={`Remove ${f.name}`} onClick={() => removeFile(doc.key, f)}><FaTimes size={10} /></button>
        </Chip>
      ))}
      {uploadEnabled && doc.files.length < MAX_FILES && (
        <UploadLabel>
          <FaPaperclip size={10} /> {doc.files.length ? 'Add a page' : 'Upload it'}
          <input type="file" accept={ACCEPT} multiple onChange={(e) => upload(doc.key, e)} />
        </UploadLabel>
      )}
      {!doc.files.length && <Later>{uploadEnabled ? 'or send it to your adviser later' : 'Your adviser will collect it'}</Later>}
    </div>
  );

  return (
    <div>
      <Intro>
        Tick each document you hold. Upload it now if you can: it stays private, and only our verification team sees
        it. The more you send, the faster we can verify the title and make you an offer.
      </Intro>

      {value.length > 0 && (
        <Signal $good={hasRegistered}>
          {hasRegistered ? <FaCheckCircle /> : <FaInfoCircle />}
          <span>
            {hasRegistered
              ? 'You hold a registered title. That is the quickest kind to verify.'
              : 'No registered title ticked yet. We can still help, and we will tell you what the property needs before any offer.'}
          </span>
        </Signal>
      )}

      {TITLE_DOC_GROUPS.map((g) => (
        <Group key={g.id}>
          <h4>{g.label}</h4>
          <p className="ghint">{g.hint}</p>
          {TITLE_DOCUMENTS.filter((d) => d.group === g.id).map((doc) => {
            const held = value.find((d) => d.id === doc.id);
            return (
              <Doc key={doc.id} $on={Boolean(held)}>
                <label className="row">
                  <input type="checkbox" checked={ticked(doc.id)} onChange={() => toggle(doc)} />
                  <span>{doc.name}<span className="hint">{doc.hint}</span></span>
                </label>
                {held && fileRow(held)}
              </Doc>
            );
          })}
        </Group>
      ))}

      <Group>
        <h4>Other</h4>
        <p className="ghint">Anything not listed above</p>
        {others.map((doc) => (
          <Doc key={doc.key} $on>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <OtherName
                value={doc.name}
                placeholder="What is it called? e.g. Estate deed of sub-lease"
                onChange={(e) => patchDoc((d) => d.key === doc.key, (d) => ({ ...d, name: e.target.value }))}
              />
              <Chip as="button" type="button" aria-label="Remove this document" onClick={() => removeOther(doc)} style={{ cursor: 'pointer' }}>
                <FaTimes size={10} />
              </Chip>
            </div>
            {fileRow(doc)}
          </Doc>
        ))}
        <AddBtn type="button" onClick={addOther}><FaPlus size={10} /> {OTHER_DOCUMENT.name}</AddBtn>
      </Group>
    </div>
  );
}

/** What the server stores: no upload state, and only files that finished. */
export function titleDocumentsPayload(value) {
  return value
    .filter((d) => d.id !== 'other' || d.name.trim())
    .map((d) => ({
      id: d.id,
      name: d.name.trim(),
      files: d.files.filter((f) => f.status === 'done' && f.url).map((f) => ({ url: f.url, name: f.name })),
    }));
}
