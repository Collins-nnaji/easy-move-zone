import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import SignInGate from '../components/SignInGate';
import ConsoleShell from '../components/ConsoleShell';
import { Card, Empty, Notice, Btn, Field, Label, Input, Select, TwoCol } from './manage-sections';
import {
  AGENT_NAV, AGENT_URL, AGENT_APPLY_URL, AGENT_LISTINGS_URL, AGENT_NEW_URL, AGENT_INBOX_URL, AGENT_ACCOUNT_URL,
} from '../config/platform';
import { AGENT_PLANS } from '../config/agentPlans';
import { formatMoneyFull } from '../utils/format';
import { MARKET } from '../config/markets';
import { PROPERTY_TYPES } from '../config/management';

const TYPES = PROPERTY_TYPES || ['Flat / apartment', 'Duplex', 'Bungalow', 'Terrace', 'Detached house', 'Commercial', 'Land', 'Other'];

const PAGE_META = {
  overview: { title: 'Overview', sub: 'Your live stock, what is waiting on review, and new leads.' },
  listings: { title: 'My listings', sub: 'Draft, submit for review, unpublish or mark sold.' },
  new: { title: 'Post a property', sub: 'Sale or rent. It stays a draft until you submit it for review.' },
  edit: { title: 'Edit listing', sub: 'Changes to a live listing stay on the public page once you save.' },
  inbox: { title: 'Inbox', sub: 'Enquiries and viewing requests on your listings.' },
  offices: { title: 'Offices', sub: 'Branches renters see on your public profile.' },
  account: { title: 'Profile & plan', sub: 'How you appear on EasyMoveZone, and how many listings you can keep live.' },
};

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem;
  @media (max-width: 800px) { grid-template-columns: minmax(0, 1fr); }
`;
const Stat = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1.1rem 1.2rem;
  .k { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-faint); }
  .n { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.03em; margin-top: 0.25rem; }
  .s { font-size: 0.85rem; color: var(--color-ink-muted); margin-top: 0.2rem; }
`;
const Row = styled.div`
  display: flex; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--color-line);
  &:last-child { border-bottom: 0; }
  .t { font-weight: 650; }
  .m { font-size: 0.85rem; color: var(--color-ink-muted); }
`;
const Pill = styled.span`
  font-size: 0.72rem; font-weight: 700; text-transform: capitalize; padding: 0.2rem 0.55rem; border-radius: 999px;
  background: var(--color-green-soft); color: var(--color-green-deep);
`;
const Actions = styled.div`display: flex; flex-wrap: wrap; gap: 0.45rem;`;
const Err = styled.p`color: #b91c1c; font-size: 0.88rem;`;

function useAgent(enabled) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      setData(await api.agent.me());
      setError('');
    } catch (err) {
      setError(err?.message || 'Could not load your agency.');
    }
  }, [enabled]);
  useEffect(() => { if (enabled) load(); }, [enabled, load]);
  return { data, error, reload: load };
}

function Overview({ me }) {
  const [listings, setListings] = useState([]);
  const [inbox, setInbox] = useState({ enquiries: [], viewings: [] });
  useEffect(() => {
    api.agent.listings().then((r) => setListings(r.listings || [])).catch(() => {});
    api.agent.inbox().then(setInbox).catch(() => {});
  }, []);
  const live = listings.filter((l) => l.status === 'live').length;
  const pending = listings.filter((l) => l.status === 'pending_review').length;
  const leads = (inbox.enquiries || []).filter((e) => e.status === 'new').length
    + (inbox.viewings || []).filter((v) => v.status === 'requested').length;
  const plan = me.agency?.plan || 'none';
  const verified = me.agency?.verification_status === 'verified';
  const steps = [
    { ok: Boolean(me.application) || verified, title: 'Apply', body: verified ? 'The agency is verified.' : (me.application ? `Application is ${me.application.status.replace('_', ' ')}.` : 'Tell us who the agency is and send the licence.'), to: AGENT_APPLY_URL, cta: 'Application' },
    { ok: plan !== 'none', title: 'Choose a plan', body: plan !== 'none' ? `${plan} · ${me.quota || 0} listings` : 'A plan is what lets a draft leave your account.', to: AGENT_ACCOUNT_URL, cta: 'Plans' },
    { ok: listings.length > 0, title: 'Post a property', body: listings.length ? `${listings.length} in this account.` : 'Sale or rent, with photos and a floorplan. We approve it before it is public.', to: AGENT_NEW_URL, cta: 'Post' },
    { ok: leads > 0 || (inbox.enquiries || []).length > 0, title: 'Answer leads', body: 'Enquiries, applications and viewing requests arrive here. The renter’s details are not published.', to: AGENT_INBOX_URL, cta: 'Inbox' },
  ];
  return (
    <>
      <Grid>
        <Stat><div className="k">Live</div><div className="n">{live}</div><div className="s">of {me.quota || 0} on your plan</div></Stat>
        <Stat><div className="k">In review</div><div className="n">{pending}</div><div className="s">Waiting on EasyMoveZone</div></Stat>
        <Stat><div className="k">New leads</div><div className="n">{leads}</div><div className="s">Enquiries and viewings</div></Stat>
      </Grid>
      <Card style={{ marginTop: '1rem' }}>
        <h3 style={{ margin: '0 0 0.4rem' }}>Your listing suite</h3>
        {steps.map((s) => (
          <Row key={s.title}>
            <div>
              <div className="t">{s.ok ? 'Done' : 'Next'} · {s.title}</div>
              <div className="m">{s.body}</div>
            </div>
            <Link to={s.to} style={{ fontWeight: 700, color: 'var(--color-green-deep)', whiteSpace: 'nowrap' }}>{s.cta}</Link>
          </Row>
        ))}
      </Card>
      {plan === 'none' && verified && (
        <Notice>Choose a plan under Account before you can submit listings for review.</Notice>
      )}
    </>
  );
}

function ListingsList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const load = () => api.agent.listings().then((r) => setRows(r.listings || [])).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const act = async (id, fn) => {
    try { await fn(); load(); } catch (e) { setError(e.message); }
  };

  return (
    <Card>
      {error && <Err>{error}</Err>}
      {!rows.length && <Empty>No listings yet. Post a property to get started.</Empty>}
      {rows.map((l) => (
        <Row key={l.id}>
          <div>
            <div className="t">{l.title}</div>
            <div className="m">{[l.area, l.city, l.state].filter(Boolean).join(', ')} · {l.listing_type === 'rent' ? 'To rent' : 'For sale'} · {formatMoneyFull(l.list_price || l.guide_price, l.currency)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Pill>{l.status.replace('_', ' ')}</Pill>
            <Actions style={{ marginTop: '0.45rem' }}>
              <Btn type="button" onClick={() => navigate(`${AGENT_LISTINGS_URL}/${l.id}`)}>Edit</Btn>
              {['draft', 'rejected', 'withdrawn'].includes(l.status) && (
                <Btn type="button" $primary onClick={() => act(l.id, () => api.agent.submitListing(l.id))}>Submit</Btn>
              )}
              {l.status === 'live' && (
                <>
                  <Btn type="button" onClick={() => act(l.id, () => api.agent.setListingStatus(l.id, 'withdrawn'))}>Unpublish</Btn>
                  <Btn type="button" onClick={() => act(l.id, () => api.agent.setListingStatus(l.id, l.listing_type === 'rent' ? 'let' : 'sold'))}>
                    Mark {l.listing_type === 'rent' ? 'let' : 'sold'}
                  </Btn>
                </>
              )}
              {l.status === 'pending_review' && (
                <Btn type="button" onClick={() => act(l.id, () => api.agent.setListingStatus(l.id, 'draft'))}>Back to draft</Btn>
              )}
            </Actions>
          </div>
        </Row>
      ))}
    </Card>
  );
}

function ListingEditor({ existing }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    title: existing?.title || '',
    // Homes to rent only: the site no longer lists homes for sale.
    listingType: 'rent',
    address: existing?.address || '',
    area: existing?.area || '',
    city: existing?.city || '',
    state: existing?.state || '',
    country: existing?.country || MARKET.name,
    propertyType: existing?.property_type || '',
    beds: existing?.beds || '',
    baths: existing?.baths || '',
    size: existing?.size_label || '',
    price: existing?.list_price || existing?.guide_price || '',
    rentFrequency: existing?.rent_frequency || 'annual',
    description: existing?.description || '',
    lat: existing?.lat || '',
    lng: existing?.lng || '',
    branchId: existing?.branch_id || '',
    furnished: existing?.furnished || '',
    media: existing?.media || [],
  }));
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.agent.branches().then((r) => setBranches(r.branches || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addFiles = async (files, kind = 'photo') => {
    setUploading(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of Array.from(files || [])) {
        const out = await api.uploadMedia(file, { prefix: 'agent' });
        uploaded.push({ url: out.blobUrl, kind: file.type.startsWith('video/') ? 'video' : kind, name: file.name });
      }
      setForm((f) => ({ ...f, media: [...(f.media || []), ...uploaded] }));
    } catch (err) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, branchId: form.branchId || null };
      if (existing) await api.agent.updateListing(existing.id, payload);
      else {
        const { listing } = await api.agent.createListing(payload);
        navigate(`${AGENT_LISTINGS_URL}/${listing.id}`, { replace: true });
        return;
      }
      navigate(AGENT_LISTINGS_URL);
    } catch (err) {
      setError(err?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={save}>
      <Field><Label>Title</Label><Input required value={form.title} onChange={set('title')} placeholder="3-bed flat, Lekki Phase 1" /></Field>
      <Field><Label>Address</Label><Input value={form.address} onChange={set('address')} /></Field>
      <TwoCol>
        <Field><Label>Area</Label><Input value={form.area} onChange={set('area')} /></Field>
        <Field><Label>City</Label><Input value={form.city} onChange={set('city')} /></Field>
      </TwoCol>
      <TwoCol>
        <Field>
          <Label>State</Label>
          <Select value={form.state} onChange={set('state')}>
            <option value="">Select</option>
            {(MARKET.regions || []).map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field>
          <Label>Type</Label>
          <Select value={form.propertyType} onChange={set('propertyType')}>
            <option value="">Select</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
      </TwoCol>
      <TwoCol>
        <Field><Label>Beds</Label><Input value={form.beds} onChange={set('beds')} /></Field>
        <Field><Label>Baths</Label><Input value={form.baths} onChange={set('baths')} /></Field>
      </TwoCol>
      <TwoCol>
        <Field><Label>Rent (₦)</Label><Input required value={form.price} onChange={set('price')} /></Field>
        <Field>
          <Label>Frequency</Label>
          <Select value={form.rentFrequency} onChange={set('rentFrequency')}>
            <option value="annual">Annual</option>
            <option value="biannual">Biannual</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </Field>
      </TwoCol>
      {branches.length > 0 && (
        <Field>
          <Label>Office</Label>
          <Select value={form.branchId} onChange={set('branchId')}>
            <option value="">No office tagged</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
      )}
      <TwoCol>
        <Field><Label>Latitude</Label><Input value={form.lat} onChange={set('lat')} placeholder="6.45" /></Field>
        <Field><Label>Longitude</Label><Input value={form.lng} onChange={set('lng')} placeholder="3.43" /></Field>
      </TwoCol>
      <Field><Label>Description</Label><Input as="textarea" style={{ minHeight: 120 }} value={form.description} onChange={set('description')} /></Field>
      <Field>
        <Label>Photos</Label>
        <Input type="file" accept="image/*,video/mp4,video/quicktime" multiple onChange={(e) => { addFiles(e.target.files, 'photo'); e.target.value = ''; }} />
      </Field>
      <Field>
        <Label>Floorplan</Label>
        <Input type="file" accept="image/*,application/pdf" onChange={(e) => { addFiles(e.target.files, 'floorplan'); e.target.value = ''; }} />
      </Field>
      {uploading && <p>Uploading…</p>}
      {(form.media || []).length > 0 && (
        <p className="m">{form.media.length} file{form.media.length === 1 ? '' : 's'} attached.
          <button type="button" style={{ marginLeft: 8 }} onClick={() => setForm((f) => ({ ...f, media: [] }))}>Clear</button>
        </p>
      )}
      <Btn type="submit" $primary disabled={saving}>{saving ? 'Saving…' : existing ? 'Save changes' : 'Save draft'}</Btn>
      {error && <Err>{error}</Err>}
    </Card>
  );
}

function EditListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.agent.listings().then((r) => {
      const found = (r.listings || []).find((l) => String(l.id) === String(id));
      if (!found) setError('Listing not found.');
      else setListing(found);
    }).catch((e) => setError(e.message));
  }, [id]);
  if (error) return <Notice>{error}</Notice>;
  if (!listing) return null;
  return <ListingEditor existing={listing} />;
}

function Inbox() {
  const [data, setData] = useState({ enquiries: [], viewings: [] });
  const load = () => api.agent.inbox().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 0.6rem' }}>Enquiries</h3>
        {!(data.enquiries || []).length && <Empty>No enquiries yet.</Empty>}
        {(data.enquiries || []).map((e) => (
          <Row key={`e-${e.id}`}>
            <div>
              <div className="t">{e.kind === 'application' ? 'Application' : e.kind === 'viewing' ? 'Viewing' : 'Enquiry'} · {e.name} · {e.listing_title}</div>
              <div className="m">{e.email} {e.phone ? `· ${e.phone}` : ''}<br />{e.message}</div>
            </div>
            <Actions>
              <Select value={e.status} onChange={(ev) => api.agent.updateEnquiry(e.id, ev.target.value).then(load)}>
                {['new', 'contacted', 'viewing_booked', 'offer_made', 'closed'].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Actions>
          </Row>
        ))}
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 0.6rem' }}>Viewings</h3>
        {!(data.viewings || []).length && <Empty>No viewing requests yet.</Empty>}
        {(data.viewings || []).map((v) => (
          <Row key={`v-${v.id}`}>
            <div>
              <div className="t">{v.name} · {v.listing_title}</div>
              <div className="m">{v.preferred_window || 'Any time'} {v.preferred_at ? `· ${new Date(v.preferred_at).toLocaleDateString()}` : ''}</div>
            </div>
            <Actions>
              <Select value={v.status} onChange={(ev) => api.agent.updateViewing(v.id, { status: ev.target.value }).then(load)}>
                {['requested', 'offered', 'confirmed', 'cancelled'].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Actions>
          </Row>
        ))}
      </Card>
    </>
  );
}

function Offices() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', phone: '', lat: '', lng: '' });
  const load = () => api.agent.branches().then((r) => setRows(r.branches || []));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <>
      <Card as="form" onSubmit={async (e) => { e.preventDefault(); await api.agent.addBranch(form); setForm({ name: '', address: '', city: '', state: '', phone: '', lat: '', lng: '' }); load(); }}>
        <TwoCol>
          <Field><Label>Office name</Label><Input required value={form.name} onChange={set('name')} /></Field>
          <Field><Label>Phone</Label><Input value={form.phone} onChange={set('phone')} /></Field>
        </TwoCol>
        <Field><Label>Address</Label><Input value={form.address} onChange={set('address')} /></Field>
        <TwoCol>
          <Field><Label>City</Label><Input value={form.city} onChange={set('city')} /></Field>
          <Field>
            <Label>State</Label>
            <Select value={form.state} onChange={set('state')}>
              <option value="">Select</option>
              {(MARKET.regions || []).map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </TwoCol>
        <Btn type="submit" $primary>Add office</Btn>
      </Card>
      <Card>
        {!rows.length && <Empty>No offices yet.</Empty>}
        {rows.map((b) => (
          <Row key={b.id}>
            <div>
              <div className="t">{b.name}</div>
              <div className="m">{[b.address, b.city, b.state].filter(Boolean).join(', ')}</div>
            </div>
            <Btn type="button" onClick={() => api.agent.removeBranch(b.id).then(load)}>Remove</Btn>
          </Row>
        ))}
      </Card>
    </>
  );
}

function Account({ me, reload }) {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: me.agency?.name || '', phone: me.agency?.phone || '', website: me.agency?.website || '',
    bio: me.agency?.bio || '', city: me.agency?.city || '', state: me.agency?.state || '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const paid = params.get('paid');
    if (!paid) return;
    api.agent.verifyPayment(paid).then(() => { setMsg('Plan is active.'); reload(); }).catch((e) => setError(e.message));
  }, [params, reload]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const buy = async (plan) => {
    try {
      const { authorization_url: url } = await api.agent.checkout(plan);
      window.location.assign(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Card as="form" onSubmit={async (e) => { e.preventDefault(); await api.agent.updateProfile(form); setMsg('Profile saved.'); reload(); }}>
        <Field><Label>Agency name</Label><Input value={form.name} onChange={set('name')} /></Field>
        <TwoCol>
          <Field><Label>Phone</Label><Input value={form.phone} onChange={set('phone')} /></Field>
          <Field><Label>Website</Label><Input value={form.website} onChange={set('website')} /></Field>
        </TwoCol>
        <Field><Label>About</Label><Input as="textarea" style={{ minHeight: 100 }} value={form.bio} onChange={set('bio')} /></Field>
        <Btn type="submit" $primary>Save profile</Btn>
      </Card>
      <Card>
        <h3 style={{ margin: '0 0 0.6rem' }}>Listing plan</h3>
        <p style={{ color: 'var(--color-ink-muted)', marginTop: 0 }}>
          Current: <strong>{me.agency?.plan || 'none'}</strong> · {me.used || 0} / {me.quota || 0} live or in review.
        </p>
        <Grid>
          {AGENT_PLANS.map((p) => (
            <Stat key={p.id}>
              <div className="k">{p.label}</div>
              <div className="n">{formatMoneyFull(p.amount, p.currency)}</div>
              <div className="s">{p.quota} live listings · {p.blurb}</div>
              <Btn type="button" $primary style={{ marginTop: '0.7rem' }} onClick={() => buy(p.id)}>Choose {p.label}</Btn>
            </Stat>
          ))}
        </Grid>
      </Card>
      {msg && <Notice>{msg}</Notice>}
      {error && <Err>{error}</Err>}
    </>
  );
}

function Console() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { data, error, reload } = useAgent(Boolean(user));
  const pageKey = pathname.includes('/listings/new') ? 'new'
    : /\/listings\/\d+/.test(pathname) ? 'edit'
      : pathname.includes('/listings') ? 'listings'
        : pathname.includes('/inbox') ? 'inbox'
          : pathname.includes('/offices') ? 'offices'
            : pathname.includes('/account') ? 'account'
              : 'overview';
  const meta = PAGE_META[pageKey];
  if (!user) return null;
  if (error && !data) return <Notice>{error}</Notice>;
  if (!data) return null;
  if (!data.membership || data.membership.verification_status !== 'verified') {
    return <Navigate to={AGENT_APPLY_URL} replace />;
  }

  return (
    <ConsoleShell
      workspace="agent"
      nav={AGENT_NAV}
      title={meta.title}
      sub={meta.sub}
      badges={{ leads: 0 }}
      primary={{ to: AGENT_NEW_URL, label: 'Post a property' }}
    >
      <Routes>
        <Route index element={<Page title="overview"><Overview me={data} /></Page>} />
        <Route path="listings" element={<Page title="listings"><ListingsList /></Page>} />
        <Route path="listings/new" element={<Page title="new"><ListingEditor /></Page>} />
        <Route path="listings/:id" element={<Page title="edit"><EditListing /></Page>} />
        <Route path="inbox" element={<Page title="inbox"><Inbox /></Page>} />
        <Route path="offices" element={<Page title="offices"><Offices /></Page>} />
        <Route path="account" element={<Page title="account"><Account me={data} reload={reload} /></Page>} />
        <Route path="*" element={<Navigate to={AGENT_URL} replace />} />
      </Routes>
    </ConsoleShell>
  );
}

function Page({ title, children }) {
  const meta = PAGE_META[title] || PAGE_META.overview;
  return (
    <>
      <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>{meta.title}</h1>
      {children}
    </>
  );
}

export default function AgentConsolePage() {
  const { user } = useAuth();
  return (
    <SignInGate>
      <Console />
    </SignInGate>
  );
}
