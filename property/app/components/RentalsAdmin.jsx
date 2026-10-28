import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaCheck, FaExternalLinkAlt, FaHome, FaKey, FaPlus, FaSyncAlt, FaTimes, FaUserCheck,
} from 'react-icons/fa';
import { api } from '../api';
import AdminMedia from './AdminMedia';
import ScreeningChecks from './ScreeningChecks';
import { formatMoneyFull } from '../utils/format';
import {
  RENT_FREQUENCIES, APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, perPeriod,
} from '../config/rentals';
import { LOCALE } from '../config/markets';

/**
 * Admin → Rentals: vacant managed properties, let through the public Rent page.
 *
 *   Ready to list  — managed properties that could be advertised; draft a rental.
 *   Listings       — rental drafts and live ads; publish, edit, take down.
 *   Applications   — renters who applied; book viewings, vet, and create the
 *                    tenancy on the managed property for the one you choose.
 *
 * The server refuses to publish a rental unless the owner has switched on
 * advertising in their console, and re-checks that at the moment of publishing.
 */

const LISTING_FILTERS = ['reviewing', 'live', 'let', 'withdrawn', 'all'];
const LISTING_LABEL = { reviewing: 'Drafts', live: 'Live', let: 'Let', withdrawn: 'Taken down', all: 'All' };
const money = (v, c) => (Number(v) > 0 ? formatMoneyFull(v, c || 'NGN') : '—');
const day = (v) => (v ? new Date(String(v).length === 10 ? `${v}T12:00:00` : v).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const isoDay = (v) => (v ? String(v).slice(0, 10) : '');

const Wrap = styled.div` min-width: 0; `;
const Toolbar = styled.div` display:flex;gap:.55rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem; `;
const Chip = styled.button`
  border:1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background:${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};color:${(p) => (p.$on ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  border-radius:999px;padding:.48rem .75rem;font-size:.76rem;font-weight:700;cursor:pointer;
  display:inline-flex;align-items:center;gap:.4rem;
  b{font-size:.7rem;background:var(--color-green-deep);color:#fff;border-radius:999px;padding:0 .4rem;}
`;
const Views = styled.div` display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.9rem; `;
const View = styled.button`
  border:1px solid ${(p) => (p.$on ? 'var(--color-ink)' : 'var(--color-line-strong)')};
  background:${(p) => (p.$on ? 'var(--color-green-deep)' : '#fff')};color:${(p) => (p.$on ? '#fff' : 'var(--color-ink-muted)')};
  border-radius:11px;padding:.55rem .9rem;font-weight:700;font-size:.86rem;cursor:pointer;display:inline-flex;align-items:center;gap:.45rem;
`;
const Refresh = styled(Chip)` margin-left:auto; `;
const List = styled.div` display:grid;gap:.8rem; `;
const Card = styled.article` background:#fff;border:1px solid var(--color-line);border-radius:16px;padding:1rem 1.1rem;min-width:0; `;
const Head = styled.div`
  display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.75rem;
  .title{font-weight:750;color:var(--color-ink);font-size:1rem}.sub{font-size:.78rem;color:var(--color-ink-muted);margin-top:.25rem;line-height:1.45;overflow-wrap:anywhere}
  @media(max-width:560px){flex-direction:column}
`;
const Status = styled.span`
  display:inline-flex;white-space:nowrap;border-radius:999px;padding:.22rem .55rem;font-size:.65rem;font-weight:750;text-transform:uppercase;letter-spacing:.04em;
  background:${(p) => (p.$bad ? '#fee2e2' : p.$good ? 'var(--color-green-soft)' : 'var(--color-bg-sunken)')};
  color:${(p) => (p.$bad ? '#b91c1c' : p.$good ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
`;
const Consent = styled.span`
  display:inline-flex;align-items:center;gap:.3rem;font-size:.7rem;font-weight:600;border-radius:999px;padding:.2rem .55rem;margin-bottom:.75rem;
  background:${(p) => (p.$ok ? 'var(--color-green-soft)' : 'rgba(180,83,9,0.1)')};color:${(p) => (p.$ok ? 'var(--color-green-deep)' : 'var(--color-warn)')};
`;
const Summary = styled.div` display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem;margin-bottom:.75rem;@media(max-width:800px){grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:430px){grid-template-columns:minmax(0,1fr)} `;
const Metric = styled.div` background:var(--color-bg-sunken);border-radius:10px;padding:.6rem .7rem;min-width:0;.k{font-size:.62rem;color:var(--color-ink-faint);text-transform:uppercase;letter-spacing:.05em}.v{font-size:.84rem;font-weight:700;margin-top:.18rem;overflow-wrap:anywhere} `;
const Fields = styled.div` display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin:.75rem 0;@media(max-width:720px){grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:460px){grid-template-columns:minmax(0,1fr)} `;
const Field = styled.label`
  min-width:0;font-size:.65rem;font-weight:700;letter-spacing:.045em;text-transform:uppercase;color:var(--color-ink-faint);display:grid;gap:.3rem;
  input,select,textarea{min-width:0;width:100%;border:1px solid var(--color-line-strong);border-radius:9px;background:var(--color-bg-sunken);padding:.6rem .65rem;font:400 .85rem var(--font-sans);color:var(--color-ink);text-transform:none;letter-spacing:0;&:focus{outline:none;border-color:var(--color-green);background:#fff}}
  textarea{resize:vertical;min-height:64px}
`;
const Wide = styled(Field)` grid-column:1/-1; `;
const Button = styled.button`
  border:1px solid ${(p) => (p.$danger ? '#fecaca' : 'var(--color-green-deep)')};border-radius:9px;padding:.55rem .8rem;
  background:${(p) => (p.$ghost || p.$danger ? '#fff' : 'var(--color-green-deep)')};color:${(p) => (p.$danger ? '#b91c1c' : p.$ghost ? 'var(--color-green-deep)' : '#fff')};
  font-weight:700;font-size:.78rem;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;text-decoration:none;
  &:disabled{opacity:.45;cursor:not-allowed}
`;
const Actions = styled.div` display:flex;gap:.45rem;flex-wrap:wrap;align-items:center; `;
const Text = styled.p` font-size:.85rem;color:var(--color-ink-muted);line-height:1.55;margin:0 0 .75rem;white-space:pre-wrap; `;
const Note = styled.div` padding:1.5rem;text-align:center;color:var(--color-ink-muted);font-size:.88rem;background:#fff;border:1px dashed var(--color-line-strong);border-radius:14px; `;
const Error = styled.div` color:#b91c1c;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:.65rem .75rem;font-size:.8rem;margin-bottom:.75rem; `;
const Panel = styled.div` border-top:1px solid var(--color-line);margin-top:.85rem;padding-top:.85rem; `;

export default function RentalsAdmin({ adminKey }) {
  const [view, setView] = useState('applications');
  const [appFilter, setAppFilter] = useState('new');
  const [listingFilter, setListingFilter] = useState('reviewing');
  const [listingScope, setListingScope] = useState(null);
  const [applications, setApplications] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (view === 'applications') {
        setApplications(await api.listings.admin.applications(adminKey, {
          status: appFilter === 'all' ? '' : appFilter,
          listingId: listingScope?.id,
        }));
      } else if (view === 'listings') {
        setRentals(await api.listings.admin.list(adminKey, listingFilter === 'all' ? '' : listingFilter, null, 'rent'));
      } else {
        setCandidates(await api.listings.admin.rentalCandidates(adminKey));
      }
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load rentals.');
    } finally {
      setLoading(false);
    }
  }, [adminKey, view, appFilter, listingFilter, listingScope]);

  useEffect(() => { load(); }, [load]);

  /** Every write goes through here, so one failure path covers them all. */
  const run = async (fn) => {
    try {
      await fn();
      setError('');
      await load();
      return true;
    } catch (e) {
      setError(e.message || 'That did not work.');
      return false;
    }
  };

  const openApplicationsFor = (listing) => {
    setListingScope({ id: listing.id, title: listing.title });
    setAppFilter('all');
    setView('applications');
  };

  return (
    <Wrap>
      <Views>
        <View type="button" $on={view === 'applications'} onClick={() => setView('applications')}><FaUserCheck size={12} /> Applications</View>
        <View type="button" $on={view === 'listings'} onClick={() => setView('listings')}><FaHome size={12} /> Rental listings</View>
        <View type="button" $on={view === 'ready'} onClick={() => setView('ready')}><FaPlus size={11} /> Ready to list</View>
      </Views>

      <Toolbar>
        {view === 'applications' && (
          <>
            {[...APPLICATION_STATUSES, 'all'].map((s) => (
              <Chip key={s} type="button" $on={appFilter === s} onClick={() => setAppFilter(s)}>
                {s === 'all' ? 'All' : APPLICATION_STATUS_LABEL[s]}
              </Chip>
            ))}
            {listingScope && (
              <Chip type="button" $on onClick={() => setListingScope(null)}>
                Only {listingScope.title} <FaTimes size={9} />
              </Chip>
            )}
          </>
        )}
        {view === 'listings' && LISTING_FILTERS.map((s) => (
          <Chip key={s} type="button" $on={listingFilter === s} onClick={() => setListingFilter(s)}>{LISTING_LABEL[s]}</Chip>
        ))}
        <Refresh type="button" onClick={load} disabled={loading}><FaSyncAlt size={10} /> {loading ? 'Loading' : 'Refresh'}</Refresh>
      </Toolbar>

      {error && <Error>{error}</Error>}

      {view === 'applications' && (
        applications.length === 0 ? <Note>No applications at this stage.</Note> : (
          <List>
            {applications.map((a) => <ApplicationCard key={a.id} application={a} adminKey={adminKey} run={run} />)}
          </List>
        )
      )}

      {view === 'listings' && (
        rentals.length === 0 ? (
          <Note>
            No rentals here. Draft one from <strong>Ready to list</strong>: it starts from a managed property, and goes
            live once the owner has allowed advertising.
          </Note>
        ) : (
          <List>
            {rentals.map((l) => (
              <RentalCard key={l.id} listing={l} adminKey={adminKey} run={run} onApplications={() => openApplicationsFor(l)} />
            ))}
          </List>
        )
      )}

      {view === 'ready' && (
        candidates.length === 0 ? <Note>No managed properties yet. They appear here once an owner hands one over.</Note> : (
          <List>
            {candidates.map((p) => (
              <CandidateCard
                key={p.id}
                property={p}
                onCreate={async (details) => {
                  const ok = await run(() => api.listings.admin.createRental(adminKey, { managementRequestId: p.id, ...details }));
                  if (ok) { setListingFilter('reviewing'); setView('listings'); }
                  return ok;
                }}
              />
            ))}
          </List>
        )
      )}
    </Wrap>
  );
}

/* ── Ready to list: draft a rental from a managed property ───────── */

function CandidateCard({ property: p, onCreate }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    title: '', unitLabel: '', rent: p.expected_rent ? String(Math.round(p.expected_rent)) : '', rentFrequency: 'annual',
    serviceCharge: '', cautionDeposit: '', availableFrom: '', beds: p.bedrooms || '', baths: '', furnished: p.furnished || '',
    sizeLabel: '', features: '', description: '',
  });
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const tenanted = p.letting_status === 'tenanted' || (p.units <= 1 && p.active_tenancies > 0);

  const submit = async () => {
    setBusy(true);
    const ok = await onCreate({
      ...draft,
      features: draft.features.split(',').map((x) => x.trim()).filter(Boolean),
    });
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <Card>
      <Head>
        <div>
          <div className="title">{p.address}</div>
          <div className="sub">
            {p.ref} · {[p.area, p.city, p.state].filter(Boolean).join(', ')} · {p.contact_name} ({p.contact_email})
          </div>
        </div>
        <Status $good={p.status === 'active'}>{String(p.status).replace(/_/g, ' ')}</Status>
      </Head>
      <Consent $ok={p.advertise_consent}>
        {p.advertise_consent
          ? <><FaCheck size={9} /> Owner allows advertising</>
          : <><FaTimes size={9} /> Owner has not allowed advertising yet. You can draft, not publish</>}
      </Consent>
      <Summary>
        <Metric><div className="k">letting</div><div className="v">{String(p.letting_status).replace(/_/g, ' ')}</div></Metric>
        <Metric><div className="k">units · let</div><div className="v">{p.units} · {p.active_tenancies}</div></Metric>
        <Metric><div className="k">owner expects</div><div className="v">{money(p.expected_rent, p.currency)} / year</div></Metric>
        <Metric><div className="k">open rentals</div><div className="v">{p.open_rentals}</div></Metric>
      </Summary>
      {open && (
        <>
          <Fields>
            <Field>Title<input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Defaults to e.g. 3-bed flat Lekki" /></Field>
            <Field>Unit (blocks)<input value={draft.unitLabel} onChange={(e) => set('unitLabel', e.target.value)} placeholder="e.g. Flat 2" /></Field>
            <Field>Rent<input value={draft.rent} onChange={(e) => set('rent', e.target.value)} placeholder="e.g. 6500000" /></Field>
            <Field>Paid
              <select value={draft.rentFrequency} onChange={(e) => set('rentFrequency', e.target.value)}>
                {RENT_FREQUENCIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            <Field>Service charge / year<input value={draft.serviceCharge} onChange={(e) => set('serviceCharge', e.target.value)} /></Field>
            <Field>Caution deposit<input value={draft.cautionDeposit} onChange={(e) => set('cautionDeposit', e.target.value)} /></Field>
            <Field>Available from<input type="date" value={draft.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} /></Field>
            <Field>Beds<input value={draft.beds} onChange={(e) => set('beds', e.target.value)} /></Field>
            <Field>Baths<input value={draft.baths} onChange={(e) => set('baths', e.target.value)} /></Field>
            <Field>Furnished<input value={draft.furnished} onChange={(e) => set('furnished', e.target.value)} placeholder="Unfurnished / Furnished" /></Field>
            <Field>Size<input value={draft.sizeLabel} onChange={(e) => set('sizeLabel', e.target.value)} placeholder="e.g. 180 sqm" /></Field>
            <Wide>Features (comma separated)<input value={draft.features} onChange={(e) => set('features', e.target.value)} placeholder="Borehole, 24h security, Parking for 2" /></Wide>
            <Wide>Description<textarea rows={3} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Defaults to the owner's description" /></Wide>
          </Fields>
          <Text>Photos default to the ones the owner uploaded with the property.</Text>
        </>
      )}
      <Actions>
        {open ? (
          <>
            <Button type="button" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save draft rental'}</Button>
            <Button type="button" $ghost onClick={() => setOpen(false)}>Cancel</Button>
          </>
        ) : (
          <Button type="button" onClick={() => setOpen(true)} disabled={tenanted && p.units <= 1} title={tenanted ? 'This property already has a tenant.' : ''}>
            <FaPlus size={10} /> Draft a rental
          </Button>
        )}
      </Actions>
    </Card>
  );
}

/* ── Rental listings ─────────────────────────────────────────────── */

function RentalCard({ listing: l, adminKey, run, onApplications }) {
  const [editing, setEditing] = useState(false);
  const [showEnquiries, setShowEnquiries] = useState(false);
  const blank = () => ({
    title: l.title || '', unit_label: l.unit_label || '', list_price: l.list_price || '', rent_frequency: l.rent_frequency || 'annual',
    service_charge: l.service_charge || '', caution_deposit: l.caution_deposit || '', available_from: isoDay(l.available_from),
    beds: l.beds || '', baths: l.baths || '', furnished: l.furnished || '', size_label: l.size_label || '',
    features: (l.features || []).join(', '), description: l.description || '', admin_note: l.admin_note || '',
  });
  const [draft, setDraft] = useState(blank);
  useEffect(() => { setDraft(blank()); }, [l]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const consented = Boolean(l.advertise_consent) || l.route === 'company_owned';
  const canPublish = consented && Number(draft.list_price) > 0 && l.management_status !== 'ended' && l.management_status !== 'cancelled';
  const payload = () => ({
    ...draft,
    available_from: draft.available_from || null,
    features: draft.features.split(',').map((x) => x.trim()).filter(Boolean),
  });
  const patch = (body) => run(() => api.listings.admin.update(l.id, adminKey, body));

  return (
    <Card>
      <Head>
        <div>
          <div className="title">{l.title}{l.unit_label ? ` · ${l.unit_label}` : ''}</div>
          <div className="sub">
            {l.ref} · managed property {l.management_ref || '—'} · {[l.area, l.city, l.state].filter(Boolean).join(', ')} · owner {l.owner_email}
          </div>
        </div>
        <Status $good={l.status === 'live' || l.status === 'let'} $bad={l.status === 'withdrawn'}>{LISTING_LABEL[l.status] || l.status}</Status>
      </Head>
      <Consent $ok={consented}>
        {consented ? <><FaCheck size={9} /> Owner allows advertising</> : <><FaTimes size={9} /> Owner has not allowed advertising: cannot publish</>}
      </Consent>
      <Summary>
        <Metric><div className="k">rent</div><div className="v">{money(l.list_price, l.currency)} / {perPeriod(l.rent_frequency)}</div></Metric>
        <Metric><div className="k">service · deposit</div><div className="v">{money(l.service_charge, l.currency)} · {money(l.caution_deposit, l.currency)}</div></Metric>
        <Metric><div className="k">available</div><div className="v">{day(l.available_from)}</div></Metric>
        <Metric><div className="k">applications · enquiries</div><div className="v">{l.application_count || 0}{l.new_application_count ? ` (${l.new_application_count} new)` : ''} · {l.enquiry_count || 0}</div></Metric>
      </Summary>
      {l.description && !editing && <Text>{l.description}</Text>}
      <AdminMedia media={l.media} adminKey={adminKey} label="Photos" />
      {l.admin_note && !editing && <Text><strong>Internal note:</strong> {l.admin_note}</Text>}

      {editing && (
        <Fields>
          <Field>Title<input value={draft.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field>Unit<input value={draft.unit_label} onChange={(e) => set('unit_label', e.target.value)} /></Field>
          <Field>Rent<input value={draft.list_price} onChange={(e) => set('list_price', e.target.value)} /></Field>
          <Field>Paid
            <select value={draft.rent_frequency} onChange={(e) => set('rent_frequency', e.target.value)}>
              {RENT_FREQUENCIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </Field>
          <Field>Service charge / year<input value={draft.service_charge} onChange={(e) => set('service_charge', e.target.value)} /></Field>
          <Field>Caution deposit<input value={draft.caution_deposit} onChange={(e) => set('caution_deposit', e.target.value)} /></Field>
          <Field>Available from<input type="date" value={draft.available_from} onChange={(e) => set('available_from', e.target.value)} /></Field>
          <Field>Beds<input value={draft.beds} onChange={(e) => set('beds', e.target.value)} /></Field>
          <Field>Baths<input value={draft.baths} onChange={(e) => set('baths', e.target.value)} /></Field>
          <Field>Furnished<input value={draft.furnished} onChange={(e) => set('furnished', e.target.value)} /></Field>
          <Field>Size<input value={draft.size_label} onChange={(e) => set('size_label', e.target.value)} /></Field>
          <Wide>Features (comma separated)<input value={draft.features} onChange={(e) => set('features', e.target.value)} /></Wide>
          <Wide>Description<textarea rows={3} value={draft.description} onChange={(e) => set('description', e.target.value)} /></Wide>
          <Wide>Internal note (admin only)<textarea rows={2} value={draft.admin_note} onChange={(e) => set('admin_note', e.target.value)} /></Wide>
        </Fields>
      )}

      <Actions>
        {editing ? (
          <>
            <Button type="button" onClick={async () => { if (await patch(payload())) setEditing(false); }}>Save changes</Button>
            <Button type="button" $ghost onClick={() => { setDraft(blank()); setEditing(false); }}>Cancel</Button>
          </>
        ) : (
          <Button type="button" $ghost onClick={() => setEditing(true)}>Edit</Button>
        )}
        {(l.status === 'reviewing' || l.status === 'withdrawn' || l.status === 'submitted') && (
          <Button
            type="button"
            disabled={!canPublish}
            title={canPublish ? '' : 'Needs the owner’s advertising consent and a positive rent.'}
            onClick={() => patch({ ...(editing ? payload() : {}), status: 'live' })}
          >
            Publish to Rent page
          </Button>
        )}
        {l.status === 'live' && (
          <>
            <Button as="a" $ghost href={`/listings/${l.slug || l.id}`} target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt size={10} /> View</Button>
            <Button type="button" $ghost onClick={() => patch({ status: 'withdrawn' })}>Take down</Button>
          </>
        )}
        <Button type="button" $ghost onClick={onApplications}>Applications ({l.application_count || 0})</Button>
        <Button type="button" $ghost onClick={() => setShowEnquiries((v) => !v)}>Enquiries ({l.enquiry_count || 0})</Button>
        {l.status !== 'let' && (
          <Button
            type="button"
            $danger
            onClick={() => {
              if (window.confirm(`Delete ${l.ref}? This removes the rental and its applications.`)) {
                run(() => api.listings.admin.remove(l.id, adminKey));
              }
            }}
          >
            Delete
          </Button>
        )}
      </Actions>
      {showEnquiries && <RentalEnquiries listingId={l.id} adminKey={adminKey} />}
    </Card>
  );
}

const ENQUIRY_STEPS = ['new', 'contacted', 'viewing_booked', 'closed'];
const ENQUIRY_LABEL = { new: 'New', contacted: 'Contacted', viewing_booked: 'Viewing booked', offer_made: 'Offer made', closed: 'Closed' };

/** Questions about one rental from people who have not applied (yet). */
function RentalEnquiries({ listingId, adminKey }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setItems(await api.listings.admin.enquiries(listingId, adminKey)); setError(''); }
    catch (e) { setError(e.message || 'Could not load enquiries.'); }
  }, [listingId, adminKey]);
  useEffect(() => { load(); }, [load]);

  const move = async (id, status) => {
    try { await api.listings.admin.updateEnquiry(id, adminKey, { status }); await load(); }
    catch (e) { setError(e.message || 'Could not update the enquiry.'); }
  };

  return (
    <Panel>
      {error && <Error>{error}</Error>}
      {!items ? <Text>Loading enquiries…</Text> : items.length === 0 ? <Text>No enquiries for this home yet.</Text> : (
        <List>
          {items.map((q) => (
            <Metric key={q.id}>
              <div className="k">{ENQUIRY_LABEL[q.status] || q.status} · {day(q.created_at)}</div>
              <div className="v">{q.name} · {q.email}{q.phone ? ` · ${q.phone}` : ''}</div>
              <Text style={{ margin: '.35rem 0' }}>{q.message || 'No message.'}</Text>
              <Actions>
                {ENQUIRY_STEPS.filter((st) => st !== q.status).map((st) => (
                  <Button key={st} type="button" $ghost onClick={() => move(q.id, st)}>Mark {ENQUIRY_LABEL[st].toLowerCase()}</Button>
                ))}
              </Actions>
            </Metric>
          ))}
        </List>
      )}
    </Panel>
  );
}

/* ── Applications ────────────────────────────────────────────────── */

function ApplicationCard({ application: a, adminKey, run }) {
  const [note, setNote] = useState(a.admin_note || '');
  const [letting, setLetting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tenancy, setTenancy] = useState({
    rentAmount: a.list_price ? String(Math.round(a.list_price)) : '',
    rentFrequency: a.rent_frequency || 'annual',
    deposit: a.caution_deposit ? String(Math.round(a.caution_deposit)) : '',
    startDate: isoDay(a.move_in_date),
    endDate: '',
    unitLabel: a.unit_label || '',
  });
  useEffect(() => { setNote(a.admin_note || ''); }, [a]);
  const set = (k, v) => setTenancy((t) => ({ ...t, [k]: v }));

  const closed = ['let', 'declined', 'withdrawn'].includes(a.status);
  const canLet = !closed && a.listing_status !== 'let' && Boolean(a.management_request_id);
  const move = (status) => run(() => api.listings.admin.updateApplication(a.id, adminKey, { status }));
  const NEXT = {
    new: ['contacted', 'viewing_booked'],
    contacted: ['viewing_booked', 'vetting'],
    viewing_booked: ['vetting'],
    vetting: ['approved'],
    approved: [],
  };

  const createTenancy = async () => {
    setBusy(true);
    const ok = await run(() => api.listings.admin.createTenancy(a.id, adminKey, tenancy));
    setBusy(false);
    if (ok) setLetting(false);
  };

  return (
    <Card>
      <Head>
        <div>
          <div className="title">{a.full_name}</div>
          <div className="sub">
            {a.ref} · {a.email} · {a.phone} · for{' '}
            <a href={`/listings/${a.listing_slug}`} target="_blank" rel="noopener noreferrer">{a.listing_title}{a.unit_label ? ` (${a.unit_label})` : ''}</a>
            {' '}· applied {day(a.created_at)}
          </div>
        </div>
        <Status $good={a.status === 'approved' || a.status === 'let'} $bad={a.status === 'declined' || a.status === 'withdrawn'}>
          {APPLICATION_STATUS_LABEL[a.status] || a.status}
        </Status>
      </Head>
      <Summary>
        <Metric><div className="k">work</div><div className="v">{[a.occupation, a.employer].filter(Boolean).join(' at ') || '—'}</div></Metric>
        <Metric><div className="k">income</div><div className="v">{a.income_band || 'To discuss'}</div></Metric>
        <Metric><div className="k">household · move in</div><div className="v">{a.household_size || '—'} · {day(a.move_in_date)}</div></Metric>
        <Metric><div className="k">viewing</div><div className="v">{a.viewing_date || a.viewing_window ? `${day(a.viewing_date)}${a.viewing_window ? `, ${a.viewing_window}` : ''}` : 'Not asked'}</div></Metric>
        <Metric><div className="k">ID</div><div className="v">{a.id_type || '—'}</div></Metric>
        <Metric><div className="k">reference</div><div className="v">{a.reference_name ? `${a.reference_name}${a.reference_phone ? ` · ${a.reference_phone}` : ''}` : '—'}</div></Metric>
        <Metric><div className="k">rent asked</div><div className="v">{money(a.list_price, a.currency)} / {perPeriod(a.rent_frequency)}</div></Metric>
        <Metric><div className="k">checks</div><div className="v">{a.screening_consent ? 'Agreed' : 'Not agreed'}</div></Metric>
      </Summary>
      <ScreeningChecks
        screening={a.screening}
        disabled={closed}
        onChange={(patch) => run(() => api.listings.admin.updateApplication(a.id, adminKey, { screening: patch }))}
      />
      {a.message && <Text>{a.message}</Text>}
      {a.listing_status === 'let' && a.status !== 'let' && <Text><strong>This home has been let to someone else.</strong> Decline or withdraw this application.</Text>}

      <Fields>
        <Wide>Internal note
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Viewing feedback, reference checks…" />
        </Wide>
      </Fields>
      <Actions>
        <Button type="button" $ghost onClick={() => run(() => api.listings.admin.updateApplication(a.id, adminKey, { admin_note: note }))}>Save note</Button>
        {(a.listing_status === 'let' ? [] : NEXT[a.status] || []).map((s) => (
          <Button key={s} type="button" $ghost onClick={() => move(s)}>Mark {APPLICATION_STATUS_LABEL[s].toLowerCase()}</Button>
        ))}
        {canLet && !letting && (
          <Button type="button" onClick={() => setLetting(true)}><FaKey size={10} /> Let to this applicant</Button>
        )}
        {!closed && <Button type="button" $danger onClick={() => move('declined')}>Decline</Button>}
        {!closed && <Button type="button" $ghost onClick={() => move('withdrawn')}>Withdrawn</Button>}
      </Actions>

      {letting && (
        <Panel>
          <Text>
            This records the tenancy on the managed property (Admin → Management, and the owner’s Operations → Tenancies),
            takes the home off the Rent page, and tells the owner. Raise the first rent charge from the Management tab.
          </Text>
          <Fields>
            <Field>Rent<input value={tenancy.rentAmount} onChange={(e) => set('rentAmount', e.target.value)} /></Field>
            <Field>Paid
              <select value={tenancy.rentFrequency} onChange={(e) => set('rentFrequency', e.target.value)}>
                {RENT_FREQUENCIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            <Field>Deposit<input value={tenancy.deposit} onChange={(e) => set('deposit', e.target.value)} /></Field>
            <Field>Start<input type="date" value={tenancy.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
            <Field>End<input type="date" value={tenancy.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
            <Field>Unit<input value={tenancy.unitLabel} onChange={(e) => set('unitLabel', e.target.value)} /></Field>
          </Fields>
          <Actions>
            <Button type="button" onClick={createTenancy} disabled={busy || !(Number(tenancy.rentAmount) > 0)}>
              {busy ? 'Creating…' : 'Create tenancy'}
            </Button>
            <Button type="button" $ghost onClick={() => setLetting(false)}>Cancel</Button>
          </Actions>
        </Panel>
      )}
    </Card>
  );
}
