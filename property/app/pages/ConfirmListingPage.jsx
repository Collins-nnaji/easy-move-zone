import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { api } from '../api';
import { Section, Inner, Panel } from '../components/page';
import { BRAND, MARKETPLACE_URL, PURCHASE_DAYS } from '../config/platform';
import { formatMoneyFull } from '../utils/format';

/**
 * The owner's side of assisted intake (`/listings/confirm/:token`).
 *
 * Someone at EasyMoveZone typed this listing in. The owner checks it, corrects
 * what is wrong and signs the same authorization the Sell form asks for — in
 * their own name, typed by them (the signature is never prefilled). The public
 * listing consent is a separate box, unticked by default. Signing sends it to
 * review; nothing is published from here.
 */

const Head = styled.div`
  margin-bottom: 1.5rem;
  h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); margin: 0 0 0.4rem; }
  p { color: var(--color-ink-muted); margin: 0; max-width: 60ch; }
`;

const Card = styled(Panel)`
  margin-bottom: 1.25rem;
  h2 { font-size: 1.15rem; margin: 0 0 0.9rem; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-ink-soft);
  grid-column: ${(p) => (p.$wide ? '1 / -1' : 'auto')};
  min-width: 0;

  input, textarea {
    width: 100%;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 400;
    color: var(--color-ink);
    background: var(--color-bg-sunken);
    border: 1px solid var(--color-line-strong);
    border-radius: 12px;
    padding: 0.75rem 0.9rem;
    outline: none;
    &:focus { border-color: var(--color-green); background: #fff; }
  }
  textarea { min-height: 96px; resize: vertical; line-height: 1.5; }
  small { font-weight: 400; color: var(--color-ink-faint); }
`;

const Photos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  img, video { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 10px; background: var(--color-bg-sunken); }
`;

const UnitRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  align-items: end;
  padding: 0.85rem 0;
  border-top: 1px solid var(--color-line);
  &:first-of-type { border-top: none; padding-top: 0; }
  .name { font-weight: 600; }
  .specs { font-size: 0.82rem; color: var(--color-ink-muted); margin-top: 0.15rem; }
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); .who { grid-column: 1 / -1; } }
`;

const Choice = styled.label`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.8rem 0.9rem;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};
  cursor: pointer;
  font-size: 0.92rem;
  input { margin-top: 0.2rem; accent-color: var(--color-green); }
  span small { display: block; color: var(--color-ink-muted); font-size: 0.82rem; margin-top: 0.15rem; }
`;

const Agreement = styled.div`
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin-bottom: 1.1rem;
  ul { margin: 0.5rem 0 0.5rem 1.1rem; padding: 0; }
  strong { color: var(--color-ink); }
`;

const Check = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.9rem;
  line-height: 1.45;
  margin-bottom: 0.9rem;
  cursor: pointer;
  input { width: 18px; height: 18px; margin-top: 0.1rem; accent-color: var(--color-green); flex-shrink: 0; }
`;

const Submit = styled.button`
  width: 100%;
  margin-top: 0.5rem;
  background: var(--color-green-deep);
  color: #fff;
  border: none;
  padding: 1rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const ErrorMsg = styled.p` color: #b91c1c; font-size: 0.88rem; margin: 0.6rem 0 0; text-align: center; `;

const Done = styled(Panel)`
  text-align: center;
  padding: 2.5rem 1.5rem;
  svg { color: var(--color-green); font-size: 2.2rem; margin-bottom: 0.75rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  p { color: var(--color-ink-muted); max-width: 52ch; margin: 0 auto 1.25rem; }
  a { font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; }
`;

const money = (v) => (Number(v) > 0 ? formatMoneyFull(v, 'NGN') : '');
const specs = (u) => [u.property_type, u.beds && `${u.beds} bed`, u.baths && `${u.baths} bath`, u.size_label].filter(Boolean).join(' · ');

function Media({ items }) {
  const shown = (items || []).filter((m) => m.view);
  if (!shown.length) return null;
  return (
    <Photos>
      {shown.map((m) => (m.kind === 'video'
        ? <video key={m.url} src={m.view} controls preload="metadata" />
        : <img key={m.url} src={m.view} alt="" loading="lazy" />))}
    </Photos>
  );
}

export default function ConfirmListingPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [details, setDetails] = useState({});
  const [units, setUnits] = useState({});
  const [intent, setIntent] = useState('private');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [publishConsent, setPublishConsent] = useState(false);
  const [signature, setSignature] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    api.listings.confirm.get(token)
      .then((d) => {
        if (!active) return;
        setData(d);
        if (d.kind === 'listing') {
          const l = d.listing;
          setIntent(l.intent === 'buyout' ? 'buyout' : 'private');
          setDetails({
            title: l.title || '', address: l.address || '', area: l.area || '', city: l.city || '', state: l.state || '',
            beds: l.beds || '', baths: l.baths || '', size: l.size_label || '',
            price: l.guide_price ? String(Math.round(Number(l.guide_price))) : '', description: l.description || '',
          });
        } else {
          setUnits(Object.fromEntries(d.units.map((u) => [u.id, {
            price: u.guide_price ? String(Math.round(Number(u.guide_price))) : '',
            unitsAvailable: u.units_available ?? 1,
          }])));
        }
        setPhone(d.owner?.phone || '');
      })
      .catch((e) => { if (active) setLoadError(e.message || 'This link could not be opened.'); });
    return () => { active = false; };
  }, [token]);

  if (done) {
    return (
      <Section><Inner>
        <Done>
          <FaCheckCircle />
          <h1>Thank you. It is signed.</h1>
          <p>
            Your authorization is recorded and the listing has gone to our review team. Nothing is published until a
            reviewer approves it, and you can withdraw it in writing at any time.
          </p>
          <Link to={MARKETPLACE_URL}>See the marketplace <FaArrowRight size={11} /></Link>
        </Done>
      </Inner></Section>
    );
  }

  if (loadError || !data) {
    return (
      <Section><Inner>
        <Done>
          <h1>{loadError ? 'This link cannot be used' : 'Opening your listing…'}</h1>
          {loadError && <p>{loadError}</p>}
          {loadError && <Link to="/contact">Contact us <FaArrowRight size={11} /></Link>}
        </Done>
      </Inner></Section>
    );
  }

  const isProject = data.kind === 'project';
  const subject = isProject ? data.project.name : (details.address || data.listing.address || 'this property');
  const listsPublicly = isProject || intent === 'private';
  const canSubmit = ownerConfirmed && consent && signature.trim().length > 2 && (!listsPublicly || publishConsent);
  const setD = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));
  const setU = (id, k) => (e) => setUnits((m) => ({ ...m, [id]: { ...m[id], [k]: e.target.value } }));

  const submit = async () => {
    setSending(true);
    setError('');
    try {
      await api.listings.confirm.submit(token, {
        ownerConfirmed, consent, publishConsent, consentName: signature.trim(), phone, note,
        ...(isProject
          ? { units: Object.entries(units).map(([id, u]) => ({ id: Number(id), ...u })) }
          : { intent, details }),
      });
      setDone(true);
    } catch (e) {
      setError(e.message || 'Could not record your confirmation.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Section>
      <Inner style={{ maxWidth: 820 }}>
        <Head>
          <h1>{isProject ? 'Check your project listing' : 'Check your property listing'}</h1>
          <p>
            EasyMoveZone prepared this for {data.owner?.name || 'you'}. Correct anything that is wrong, then sign at the
            bottom. Nothing is published until you sign and a reviewer approves it.
          </p>
        </Head>

        {isProject ? (
          <>
            <Card>
              <h2>{data.project.name}</h2>
              <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
                {[data.project.developer_name, data.project.address, data.project.area, data.project.city, data.project.state].filter(Boolean).join(' · ')}
              </p>
              {data.project.description && <p style={{ marginTop: '0.75rem' }}>{data.project.description}</p>}
            </Card>
            <Card>
              <h2>Unit types</h2>
              {data.units.map((u) => (
                <UnitRow key={u.id}>
                  <div className="who">
                    <div className="name">{u.title}</div>
                    <div className="specs">{specs(u)}</div>
                    <Media items={u.media} />
                  </div>
                  <Field>
                    Price per unit (₦)
                    <input inputMode="numeric" value={units[u.id]?.price ?? ''} onChange={setU(u.id, 'price')} />
                    <small>{money(units[u.id]?.price)}</small>
                  </Field>
                  <Field>
                    Units available
                    <input type="number" min="0" value={units[u.id]?.unitsAvailable ?? ''} onChange={setU(u.id, 'unitsAvailable')} />
                    <small>0 if none are left</small>
                  </Field>
                </UnitRow>
              ))}
            </Card>
          </>
        ) : (
          <Card>
            <h2>Your property</h2>
            <Media items={data.listing.media} />
            <Grid>
              <Field $wide>Title<input value={details.title} onChange={setD('title')} /></Field>
              <Field $wide>Address<input value={details.address} onChange={setD('address')} /></Field>
              <Field>Area<input value={details.area} onChange={setD('area')} /></Field>
              <Field>City<input value={details.city} onChange={setD('city')} /></Field>
              <Field>State<input value={details.state} onChange={setD('state')} /></Field>
              <Field>Size<input value={details.size} onChange={setD('size')} /></Field>
              <Field>Bedrooms<input value={details.beds} onChange={setD('beds')} /></Field>
              <Field>Bathrooms<input value={details.baths} onChange={setD('baths')} /></Field>
              <Field $wide>
                Your asking price (₦)
                <input inputMode="numeric" value={details.price} onChange={setD('price')} />
                <small>{money(details.price)}</small>
              </Field>
              <Field $wide>Description<textarea value={details.description} onChange={setD('description')} /></Field>
            </Grid>
            <h2 style={{ marginTop: '1.25rem' }}>What would you like us to do?</h2>
            <Grid>
              <Choice $on={intent === 'private'}>
                <input type="radio" name="intent" checked={intent === 'private'} onChange={() => setIntent('private')} />
                <span>Sell it for me<small>We market it and handle the sale on your behalf.</small></span>
              </Choice>
              <Choice $on={intent === 'buyout'}>
                <input type="radio" name="intent" checked={intent === 'buyout'} onChange={() => setIntent('buyout')} />
                <span>Sell it to EasyMoveZone<small>We inspect it, verify the title and make a firm offer. Accept it and we complete within {PURCHASE_DAYS} days.</small></span>
              </Choice>
            </Grid>
          </Card>
        )}

        <Card>
          <h2>Anything else?</h2>
          <Grid>
            <Field>Your phone (WhatsApp)<input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field $wide>
              Note to the EasyMoveZone team
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Wrong photos, a better time to view, anything we should know." />
            </Field>
          </Grid>
        </Card>

        <Card>
          <h2>Sign</h2>
          <Agreement>
            <p>
              This agreement is between <strong>{signature.trim() || '[your name]'}</strong> (the &ldquo;Owner&rdquo;) and{' '}
              <strong>EasyMoveZone Ltd</strong>. I confirm that I am the legal owner
              {isProject ? ', or the developer, ' : ' '}(or an authorized representative of the owner) of{' '}
              <strong>{subject}</strong>, that the details above are accurate, and I authorize EasyMoveZone Ltd to:
            </p>
            <ul>
              <li>value the {isProject ? 'units' : 'property'} and prepare a {BRAND.passport}™ for internal and buyer review;</li>
              {!isProject && intent === 'buyout'
                ? <li>inspect the property and verify its title and, once that is done, issue a firm EasyMoveZone purchase offer. If I accept it, EasyMoveZone completes the purchase within {PURCHASE_DAYS} days of verification, under a sale agreement signed separately;</li>
                : <li>prepare, market and sell the {isProject ? 'units listed above' : 'property'} on my behalf after the evidence and listing are approved.</li>}
            </ul>
            <p>
              <strong>Nothing is published anywhere unless I tick the public listing box below.</strong> Even with it, a
              EasyMoveZone reviewer must approve the listing before it appears, and I may withdraw it in writing at any time.
              This is a non-exclusive authorization. There is no fee to sign, and no fee is due unless a sale or purchase
              completes.
            </p>
          </Agreement>
          <Check>
            <input type="checkbox" checked={ownerConfirmed} onChange={(e) => setOwnerConfirmed(e.target.checked)} />
            <span>I confirm I am the <strong>owner</strong>{isProject ? ' or developer' : ''} (or an authorized representative), and the details above are correct.</span>
          </Check>
          <Check>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I have read and agree to the authorization above.</span>
          </Check>
          <Check>
            <input type="checkbox" checked={publishConsent} onChange={(e) => setPublishConsent(e.target.checked)} />
            <span>
              <strong>{listsPublicly ? 'Required to list.' : 'Optional.'}</strong>{' '}
              EasyMoveZone may list {isProject ? 'these units' : 'this property'} publicly, only after its evidence has been reviewed and a reviewer approves it.
            </span>
          </Check>
          <Field $wide>
            Signature · type your full name
            <input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your full name" autoComplete="name" />
          </Field>
          <Submit type="button" onClick={submit} disabled={sending || !canSubmit}>
            {sending ? 'Signing…' : <>Sign and send for review <FaArrowRight size={12} /></>}
          </Submit>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </Card>
      </Inner>
    </Section>
  );
}
