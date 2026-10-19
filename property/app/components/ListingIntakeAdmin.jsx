import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaCopy, FaWhatsapp, FaEnvelope, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import { api } from '../api';
import { LOCALE } from '../config/markets';

/**
 * Assisted intake: the team (or a vetted agent working through us) types a
 * listing in for the owner, or a developer's whole project, and sends them a
 * link. Nothing here can publish — a draft only moves on when the owner opens
 * the link, checks it and signs the authorization and publish consent
 * themselves. The link is single-use, expires, and a new one revokes the old.
 */

const NAME_STORE = 'emz_admin_name';

const Card = styled.div`
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(25, 28, 31, 0.08);
  margin-bottom: 1rem;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
  h3 { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
  p { font-size: 0.82rem; color: var(--color-ink-muted); margin: 0.15rem 0 0; }
  @media (max-width: 560px) { flex-direction: column; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  grid-column: ${(p) => (p.$wide ? '1 / -1' : 'auto')};

  input, select, textarea {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: normal;
    text-transform: none;
    color: var(--color-ink);
    background: var(--color-bg-sunken);
    border: 1px solid var(--color-line-strong);
    border-radius: 10px;
    padding: 0.6rem 0.7rem;
    outline: none;
    &:focus { border-color: var(--color-green); background: #fff; }
  }
`;

const Legend = styled.h4`
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin: 1.1rem 0 0.2rem;
`;

const Switch = styled.div`
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line);
  margin-bottom: 0.5rem;
`;

const SwitchBtn = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.$active ? '#fff' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  box-shadow: ${(p) => (p.$active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none')};
`;

export const Btn = styled.button`
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$danger ? '#fca5a5' : 'rgba(25,28,31,0.12)')};
  background: ${(p) => (p.$primary ? 'var(--color-ink)' : '#fff')};
  color: ${(p) => (p.$primary ? '#fff' : p.$danger ? '#b91c1c' : 'var(--color-ink-muted)')};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  &:hover { border-color: ${(p) => (p.$danger ? '#b91c1c' : 'var(--color-ink)')}; color: ${(p) => (p.$primary ? '#fff' : p.$danger ? '#b91c1c' : 'var(--color-ink)')}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const Row = styled.div` display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; `;
const Err = styled.div` margin: 0.6rem 0; color: #b91c1c; font-size: 0.88rem; `;
const Note = styled.p` font-size: 0.82rem; color: var(--color-ink-muted); line-height: 1.5; margin: 0.4rem 0 0.75rem; `;

const Unit = styled.div`
  border: 1px solid var(--color-line);
  border-radius: 12px;
  padding: 0.25rem 0.85rem 0.6rem;
  margin-top: 0.6rem;
  position: relative;
  .remove { position: absolute; top: 0.55rem; right: 0.55rem; }
`;

const LinkBox = styled.div`
  border-radius: 12px;
  background: var(--color-green-wash, #f1f8f4);
  border: 1px solid rgba(47, 93, 80, 0.2);
  padding: 0.85rem 1rem;
  margin: 0.75rem 0;
  .url {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    word-break: break-all;
    color: var(--color-ink);
    margin: 0.35rem 0 0.7rem;
  }
  .k { font-size: 0.78rem; color: var(--color-ink-muted); }
`;

const Thumbs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
  span {
    font-size: 0.75rem;
    padding: 0.3rem 0.55rem;
    border-radius: 8px;
    background: var(--color-bg-sunken);
    border: 1px solid var(--color-line);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  button { border: none; background: none; cursor: pointer; color: var(--color-ink-faint); padding: 0; }
`;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** wa.me wants digits with the country code: 0803… becomes 234803…. */
function waDigits(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 11 && d.startsWith('0')) return `234${d.slice(1)}`;
  return d;
}

/**
 * The link the owner signs through, and three ways to send it. There is no
 * email provider wired in, so sending is done from the admin's own WhatsApp or
 * mail app — the message is written for them.
 */
export function OwnerLink({ link, owner = {}, subject }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${link.path}`;
  const first = String(owner.name || '').trim().split(/\s+/)[0];
  const message = `Hello${first ? ` ${first}` : ''}, we have prepared the EasyMoveZone listing for ${subject}. `
    + `Please check the details and, if they are right, sign the authorization here: ${url} `
    + `(the link works once and expires on ${fmtDate(link.expiresAt)}).`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt('Copy the link', url); }
  };
  const wa = waDigits(owner.phone);
  return (
    <LinkBox>
      <div className="k">Owner confirmation link · single use · expires {fmtDate(link.expiresAt)}</div>
      <div className="url">{url}</div>
      <Row>
        <Btn type="button" onClick={copy}>{copied ? <><FaCheck size={11} /> Copied</> : <><FaCopy size={11} /> Copy link</>}</Btn>
        <Btn as="a" href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp size={12} /> {wa ? 'WhatsApp the owner' : 'Share on WhatsApp'}
        </Btn>
        {owner.email && (
          <Btn as="a" href={`mailto:${owner.email}?subject=${encodeURIComponent(`Please confirm your EasyMoveZone listing: ${subject}`)}&body=${encodeURIComponent(message)}`}>
            <FaEnvelope size={11} /> Email the owner
          </Btn>
        )}
      </Row>
    </LinkBox>
  );
}

/** Photos for a draft. Copies the FileList before clearing the input (Chrome's is live). */
function PhotoPicker({ value, onChange, storage }) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');
  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    setError('');
    for (const file of files) {
      setBusy((n) => n + 1);
      try {
        const { blobUrl } = await api.uploadMedia(file, { prefix: 'intake' });
        onChange((list) => [...list, { url: blobUrl, kind: file.type.startsWith('video') ? 'video' : 'image', name: file.name }]);
      } catch (err) {
        setError(err.message || `Could not upload ${file.name}.`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  };
  if (!storage) return <Note>File storage is not configured here, so photos cannot be attached. They can follow once it is.</Note>;
  return (
    <div>
      <input type="file" accept="image/*,video/*" multiple onChange={pick} />
      {busy > 0 && <Note>Uploading {busy}…</Note>}
      {error && <Err>{error}</Err>}
      {value.length > 0 && (
        <Thumbs>
          {value.map((m) => (
            <span key={m.url}>
              {m.name || m.kind}
              <button type="button" aria-label="Remove" onClick={() => onChange((list) => list.filter((x) => x.url !== m.url))}><FaTimes size={10} /></button>
            </span>
          ))}
        </Thumbs>
      )}
    </div>
  );
}

const EMPTY_UNIT = { title: '', type: '', beds: '', baths: '', size: '', price: '', unitsAvailable: '1' };
const featureArray = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/**
 * New draft: one property for an owner, or a developer's project with several
 * unit types. Every field the owner can correct is optional here; what is
 * required is who they are, so the link reaches the right person.
 */
export function IntakeForm({ adminKey, onDone }) {
  const [mode, setMode] = useState('single');
  const [assistedBy, setAssistedBy] = useState(() => { try { return localStorage.getItem(NAME_STORE) || ''; } catch { return ''; } });
  const [f, setF] = useState({ intent: 'private', country: 'Nigeria' });
  const [units, setUnits] = useState([{ ...EMPTY_UNIT }]);
  const [media, setMedia] = useState([]);
  const [storage, setStorage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => { api.getMediaConfig().then((c) => setStorage(Boolean(c?.enabled))); }, []);

  const set = (k) => (e) => setF((d) => ({ ...d, [k]: e.target.value }));
  const setUnit = (i, k) => (e) => setUnits((list) => list.map((u, j) => (j === i ? { ...u, [k]: e.target.value } : u)));

  const save = async () => {
    setSaving(true);
    setError('');
    try { localStorage.setItem(NAME_STORE, assistedBy.trim()); } catch { /* private mode */ }
    try {
      if (mode === 'single') {
        const out = await api.listings.admin.createDraft(adminKey, {
          ...f, features: featureArray(f.features), media, assistedBy,
        });
        setResult({ link: out.link, owner: { name: f.ownerName, email: f.ownerEmail, phone: f.ownerPhone }, subject: out.listing.title });
      } else {
        const out = await api.listings.admin.createProject(adminKey, {
          project: { ...f, features: featureArray(f.features), media },
          units,
          assistedBy,
        });
        setResult({ link: out.link, owner: { name: f.contactName || f.developerName, email: f.contactEmail, phone: f.contactPhone }, subject: out.project.name });
      }
    } catch (e) {
      setError(e.message || 'Could not save the draft.');
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <Card>
        <Head>
          <div>
            <h3>Draft saved. Now send it to the owner.</h3>
            <p>It stays private and unpublishable until they open this link and sign it themselves.</p>
          </div>
        </Head>
        <OwnerLink {...result} />
        <Btn $primary type="button" onClick={onDone}>Done</Btn>
      </Card>
    );
  }

  return (
    <Card>
      <Head>
        <div>
          <h3>New draft listing</h3>
          <p>Fill in what you know. The owner checks it, corrects it and signs before it reaches review.</p>
        </div>
        <Btn type="button" onClick={onDone}><FaTimes size={11} /> Cancel</Btn>
      </Head>

      <Switch>
        <SwitchBtn type="button" $active={mode === 'single'} onClick={() => setMode('single')}>One property</SwitchBtn>
        <SwitchBtn type="button" $active={mode === 'project'} onClick={() => setMode('project')}>Developer project</SwitchBtn>
      </Switch>

      {mode === 'single' ? (
        <>
          <Legend>The owner (they sign, not us)</Legend>
          <Grid>
            <Field>Owner's full name<input value={f.ownerName || ''} onChange={set('ownerName')} /></Field>
            <Field>Owner's email<input type="email" value={f.ownerEmail || ''} onChange={set('ownerEmail')} /></Field>
            <Field>Owner's phone (WhatsApp)<input value={f.ownerPhone || ''} onChange={set('ownerPhone')} placeholder="0803…" /></Field>
            <Field>
              What they want
              <select value={f.intent} onChange={set('intent')}>
                <option value="private">Sell it for them</option>
                <option value="buyout">A purchase offer from us</option>
              </select>
            </Field>
          </Grid>
          <Legend>The property</Legend>
          <Grid>
            <Field $wide>Title<input value={f.title || ''} onChange={set('title')} placeholder="e.g. 4-bed semi-detached duplex" /></Field>
            <Field $wide>Address<input value={f.address || ''} onChange={set('address')} /></Field>
            <Field>Area<input value={f.area || ''} onChange={set('area')} placeholder="e.g. Lekki Phase 1" /></Field>
            <Field>City<input value={f.city || ''} onChange={set('city')} /></Field>
            <Field>State<input value={f.state || ''} onChange={set('state')} /></Field>
            <Field>Property type<input value={f.type || ''} onChange={set('type')} placeholder="e.g. Duplex" /></Field>
            <Field>Beds<input value={f.beds || ''} onChange={set('beds')} /></Field>
            <Field>Baths<input value={f.baths || ''} onChange={set('baths')} /></Field>
            <Field>Size<input value={f.size || ''} onChange={set('size')} placeholder="e.g. 450 sqm" /></Field>
            <Field>Owner's asking price (₦)<input value={f.price || ''} onChange={set('price')} inputMode="numeric" /></Field>
          </Grid>
        </>
      ) : (
        <>
          <Legend>The developer (their contact signs for the whole project)</Legend>
          <Grid>
            <Field>Project name<input value={f.name || ''} onChange={set('name')} placeholder="e.g. Palm Grove Estate" /></Field>
            <Field>Developer company<input value={f.developerName || ''} onChange={set('developerName')} /></Field>
            <Field>Signing contact's name<input value={f.contactName || ''} onChange={set('contactName')} /></Field>
            <Field>Contact email<input type="email" value={f.contactEmail || ''} onChange={set('contactEmail')} /></Field>
            <Field>Contact phone (WhatsApp)<input value={f.contactPhone || ''} onChange={set('contactPhone')} /></Field>
          </Grid>
          <Legend>Where it is</Legend>
          <Grid>
            <Field $wide>Address<input value={f.address || ''} onChange={set('address')} /></Field>
            <Field>Area<input value={f.area || ''} onChange={set('area')} /></Field>
            <Field>City<input value={f.city || ''} onChange={set('city')} /></Field>
            <Field>State<input value={f.state || ''} onChange={set('state')} /></Field>
          </Grid>
          <Legend>Unit types</Legend>
          {units.map((u, i) => (
            <Unit key={i}>
              {units.length > 1 && (
                <Btn className="remove" type="button" onClick={() => setUnits((list) => list.filter((_, j) => j !== i))}><FaTimes size={10} /></Btn>
              )}
              <Grid>
                <Field>Name<input value={u.title} onChange={setUnit(i, 'title')} placeholder="e.g. 3-bed terrace" /></Field>
                <Field>Type<input value={u.type} onChange={setUnit(i, 'type')} placeholder="e.g. Terrace" /></Field>
                <Field>Beds<input value={u.beds} onChange={setUnit(i, 'beds')} /></Field>
                <Field>Baths<input value={u.baths} onChange={setUnit(i, 'baths')} /></Field>
                <Field>Size<input value={u.size} onChange={setUnit(i, 'size')} /></Field>
                <Field>Price per unit (₦)<input value={u.price} onChange={setUnit(i, 'price')} inputMode="numeric" /></Field>
                <Field>Units available<input type="number" min="1" value={u.unitsAvailable} onChange={setUnit(i, 'unitsAvailable')} /></Field>
              </Grid>
            </Unit>
          ))}
          <Row style={{ marginTop: '0.6rem' }}>
            <Btn type="button" onClick={() => setUnits((list) => [...list, { ...EMPTY_UNIT }])}><FaPlus size={10} /> Add a unit type</Btn>
          </Row>
        </>
      )}

      <Grid>
        <Field $wide>Description<textarea rows={3} value={f.description || ''} onChange={set('description')} /></Field>
        <Field $wide>Features (comma separated)<input value={f.features || ''} onChange={set('features')} placeholder="e.g. Borehole, Gated estate, C of O" /></Field>
        <Field $wide>
          {mode === 'single' ? 'Photos and video' : 'Project photos (shared by every unit)'}
          <PhotoPicker value={media} onChange={setMedia} storage={storage} />
        </Field>
        <Field>Prepared by<input value={assistedBy} onChange={(e) => setAssistedBy(e.target.value)} placeholder="Your name" /></Field>
      </Grid>

      {error && <Err>{error}</Err>}
      <Row>
        <Btn $primary type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save draft and get the owner link'}</Btn>
      </Row>
    </Card>
  );
}

/**
 * Developer projects: where each one's units are in the pipeline, a fresh link
 * while it is waiting on the developer, and one button to publish every unit
 * the developer has cleared (the server still checks each one).
 */
export function ProjectsAdmin({ adminKey, onShowUnits }) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [links, setLinks] = useState({});
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try { setProjects(await api.listings.admin.projects(adminKey)); setError(''); }
    catch (e) { setError(e.message || 'Could not load projects.'); }
  }, [adminKey]);
  useEffect(() => { load(); }, [load]);

  const newLink = async (p) => {
    try { setLinks((m) => ({ ...m, [p.id]: null })); const link = await api.listings.admin.newLink(adminKey, { projectId: p.id }); setLinks((m) => ({ ...m, [p.id]: link })); await load(); }
    catch (e) { setError(e.message || 'Could not create a link.'); }
  };

  const publishCleared = async (p) => {
    if (!window.confirm(`Publish every confirmed unit type in ${p.name} at its asking price?`)) return;
    setBusy(p.id);
    setNotice('');
    try {
      const units = await api.listings.admin.list(adminKey, '', p.id);
      const ready = units.filter((u) => ['submitted', 'reviewing'].includes(u.status) && u.publish_consent);
      const failed = [];
      for (const u of ready) {
        try {
          await api.listings.admin.update(u.id, adminKey, {
            status: 'live', route: 'owner_listed', list_price: u.list_price || u.guide_price,
          });
        } catch (e) { failed.push(`${u.title}: ${e.message}`); }
      }
      setNotice(`${ready.length - failed.length} of ${ready.length} unit types published.${failed.length ? ` Not published: ${failed.join('; ')}` : ''}`);
      await load();
    } catch (e) {
      setError(e.message || 'Could not publish the project.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name} and all its unit types? This cannot be undone.`)) return;
    try { await api.listings.admin.removeProject(p.id, adminKey); await load(); }
    catch (e) { setError(e.message || 'Could not delete the project.'); }
  };

  if (!projects.length) return <>{error && <Err>{error}</Err>}<Note>No developer projects yet. Start one with “New draft”.</Note></>;

  return (
    <>
      {error && <Err>{error}</Err>}
      {notice && <Note>{notice}</Note>}
      {projects.map((p) => (
        <Card key={p.id}>
          <Head>
            <div>
              <h3>{p.name}</h3>
              <p>
                {p.ref} · {p.developer_name || 'Developer'} · {p.contact_name ? `${p.contact_name}, ` : ''}{p.contact_email}
                {' · '}{[p.area, p.city, p.state].filter(Boolean).join(', ') || 'Location to confirm'}
              </p>
            </div>
          </Head>
          <Note>
            {p.unit_types} unit type{p.unit_types === 1 ? '' : 's'}, {p.units_available} unit{p.units_available === 1 ? '' : 's'} available ·{' '}
            {p.draft_count} awaiting the developer · {p.review_count} to review · {p.live_count} live · {p.sold_count} sold
            <br />
            {p.consent_at
              ? <>Signed by <strong>{p.consent_name}</strong> on {fmtDate(p.consent_at)} through their own link.</>
              : p.link_sent_at
                ? <>Link sent {fmtDate(p.link_sent_at)}{p.link_opened_at ? `, opened ${fmtDate(p.link_opened_at)}` : ', not opened yet'}.</>
                : 'No link sent yet.'}
            {' '}Prepared by {p.assisted_by || '—'}.
          </Note>
          {links[p.id] && <OwnerLink link={links[p.id]} owner={{ name: p.contact_name || p.developer_name, email: p.contact_email, phone: p.contact_phone }} subject={p.name} />}
          <Row>
            <Btn type="button" onClick={() => onShowUnits(p)}>Show unit types</Btn>
            {p.draft_count > 0 && <Btn type="button" onClick={() => newLink(p)}>New developer link</Btn>}
            {p.review_count > 0 && (
              <Btn $primary type="button" disabled={busy === p.id} onClick={() => publishCleared(p)}>
                {busy === p.id ? 'Publishing…' : 'Publish confirmed units'}
              </Btn>
            )}
            {p.live_count + p.sold_count === 0 && <Btn $danger type="button" onClick={() => remove(p)}>Delete</Btn>}
          </Row>
        </Card>
      ))}
    </>
  );
}

