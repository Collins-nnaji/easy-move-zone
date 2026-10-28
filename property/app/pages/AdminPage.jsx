import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaLock, FaSignOutAlt, FaRegComments, FaBuilding, FaTools, FaKey,
  FaCheck, FaTimes, FaExternalLinkAlt, FaShieldAlt, FaChartPie, FaEnvelope, FaHome, FaUserFriends,
  FaTruck, FaHardHat, FaUsersCog, FaStore, FaInbox, FaMapMarkedAlt,
} from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { auth, siteAuthUrl } from '../auth';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import PassportAdmin from '../components/PassportAdmin';
import RenovationAdmin from '../components/RenovationAdmin';
import ManagementAdmin from '../components/ManagementAdmin';
import RentalsAdmin from '../components/RentalsAdmin';
import MessagesAdmin from '../components/MessagesAdmin';
import CommunityAdmin from '../components/CommunityAdmin';
import TenantsAdmin from '../components/TenantsAdmin';
import AdminMedia, { AdminDocuments } from '../components/AdminMedia';
import AdminOverview from '../components/AdminOverview';
import MovingAdminSection, { MOVING_SECTIONS } from '../components/MovingAdminSections';
import AdminAgents from './AdminAgents';
import { OwnerLink } from '../components/ListingIntakeAdmin';
import { CURRENCY_OPTIONS, LOCALE } from '../config/markets';
import { formatMoneyFull } from '../utils/format';

/**
 * The one EasyMoveZone admin: property (Passports, consultations, marketplace
 * approvals, rentals, management, tenants, renovations, messages, neighbourhood
 * boards) and moving
 * (moves, crews and vehicles, enquiries, marketplace operations, accounts). Access is EasyMoveZone's admin allowlist (`admin_users`):
 * sign in with an admin account and every admin call is authorised by the
 * server (app/api/property/[...path]/route.ts). Nobody types a key — `key`
 * below is only a marker that asks the server to check the session.
 */

/** Marks admin calls; the server swaps it for the real key after checking the session. */
const ADMIN_SESSION = 'session';

const SECTION_TITLES = {
  overview: 'Overview',
  passports: 'Rental checks',
  bookings: 'Consultation pipeline',
  listings: 'Listing approvals',
  rentals: 'Rentals and applications',
  management: 'Managed property operations',
  renovations: 'Renovation requests',
  messages: 'Messages and alerts',
  community: 'Neighbourhood boards',
  tenants: 'Tenants',
  agents: 'Agents and agencies',
  ...Object.fromEntries(Object.entries(MOVING_SECTIONS).map(([id, v]) => [id, v.title])),
};

/**
 * The marketplace pipeline, in the order a submission moves through it. The
 * server enforces the one rule that matters — nothing reaches `live` unless
 * EasyMoveZone bought it or the owner consented to a public listing. A `draft` is
 * one we typed in for the owner; only their own signed confirmation moves it on.
 */
/*
 * The site lets homes only: agent listings wait in `pending_review`, then go
 * `live`. Older sale records keep their labels below, but only these stages
 * are offered as filters.
 */
const LISTING_FILTERS = ['pending_review', 'live', 'withdrawn', 'rejected'];

const LISTING_STATUS_LABEL = {
  draft: 'Awaiting owner',
  pending_review: 'Agent review',
  submitted: 'New submission',
  reviewing: 'Under review',
  offer_made: 'Offer made',
  bought: 'Bought by us',
  live: 'Live on marketplace',
  sold: 'Sold',
  withdrawn: 'Withdrawn',
  rejected: 'Rejected',
};

const money = (v, currency) => (Number(v) > 0 ? formatMoneyFull(v, currency || 'NGN') : '—');
const daysLeft = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000);

const BOOKING_STATUSES = ['requested', 'scheduled', 'completed', 'cancelled'];
const SERVICE_LABELS = {
  discovery: 'Discovery call',
  visit: 'Management visit',
  portfolio_review: 'Portfolio review',
};

const Page = styled.div` background: var(--color-bg); min-height: 100%; `;

const Hero = styled.section`
  border-bottom: 1px solid rgba(25, 28, 31, 0.08);
  background:
    radial-gradient(900px 400px at 85% -20%, rgba(184, 90, 48, 0.14), transparent 70%),
    linear-gradient(180deg, var(--color-green-wash) 0%, var(--color-bg) 100%);
  border-bottom: 1px solid var(--color-line);
  padding: 1.75rem 1.5rem;
  @media (max-width: 720px) { padding: 1rem; }
`;

const HeroInner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Eyebrow = styled.p`
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-green);
  margin: 0 0 0.25rem;
`;

const Title = styled.h1`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  border: 1px solid rgba(25, 28, 31, 0.12);
  background: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  cursor: pointer;
  &:hover { color: var(--color-ink); }
`;

const Content = styled.section`
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
  min-width: 0;
  @media (max-width: 560px) { padding: 1rem 0.75rem 3rem; }
`;

const GateCard = styled.div`
  max-width: 420px;
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(25, 28, 31, 0.08);
  text-align: center;
`;

const GateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-green-soft);
  color: var(--color-green);
`;

const GateTitle = styled.h2` font-size: 1.2rem; font-weight: 700; margin: 0 0 0.4rem; `;
const GateSub = styled.p` font-size: 0.88rem; color: var(--color-ink-muted); margin: 0 0 1.25rem; line-height: 1.5; `;

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 11px;
  background: var(--color-green-deep);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const TabGroupLabel = styled.div`
  margin: 0 0 0.45rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-eyebrow);
`;

const SectionTabs = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  @media (max-width: 620px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const SectionTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  border-radius: 11px;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-ink)' : 'rgba(25,28,31,0.1)')};
  background: ${(p) => (p.$active ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink-muted)')};
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
`;

const Tabs = styled.div` display: flex; gap: 0.4rem; margin-bottom: 1.25rem; flex-wrap: wrap; `;

const Tab = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'rgba(25,28,31,0.1)')};
  background: ${(p) => (p.$active ? 'var(--color-green-soft)' : '#fff')};
  color: ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: capitalize;
  cursor: pointer;
`;

const CardList = styled.div` display: flex; flex-direction: column; gap: 1rem; `;

const Card = styled.div`
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(25, 28, 31, 0.08);
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
  @media (max-width: 560px) { flex-direction: column; }
`;

const CardTitle = styled.div` font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; `;
const CardSub = styled.div` font-size: 0.82rem; color: var(--color-ink-muted); margin-top: 0.15rem; `;

const StatusTag = styled.span`
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 7px;
  background: ${(p) => (p.$good ? 'var(--color-green-chip)' : p.$bad ? '#fee2e2' : 'var(--color-bg-panel)')};
  color: ${(p) => (p.$good ? 'var(--color-green-deep)' : p.$bad ? '#b91c1c' : 'var(--color-ink-muted)')};
  white-space: nowrap;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
  margin-bottom: 0.85rem;
`;

const Meta = styled.div`
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  background: #f7f8f9;
  .k {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-faint);
  }
  .v { font-size: 0.9rem; font-weight: 700; margin-top: 0.15rem; }
`;

const Desc = styled.p`
  font-size: 0.88rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
  margin: 0 0 0.85rem;
  white-space: pre-wrap;
`;

const Actions = styled.div` display: flex; gap: 0.5rem; flex-wrap: wrap; `;

const ActionBtn = styled.button`
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
  &:hover { border-color: ${(p) => (p.$danger ? '#b91c1c' : 'var(--color-ink)')}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const Empty = styled.div`
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
`;

const Err = styled.div` margin: 0.75rem 0; color: #b91c1c; font-size: 0.9rem; `;

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [access, setAccess] = useState('checking'); // checking | admin | denied
  const [staff, setStaff] = useState(null);
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const section = SECTION_TITLES[params.get('section')] ? params.get('section') : 'overview';
  const setSection = useCallback((next) => {
    setParams(next === 'overview' ? {} : { section: next }, { replace: true });
  }, [setParams]);
  const [error, setError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('requested');

  const [listings, setListings] = useState([]);
  const [listingFilter, setListingFilter] = useState('pending_review');
  const [projectFilter, setProjectFilter] = useState(null);
  const [editing, setEditing] = useState(null);

  const loadBookings = useCallback(async () => {
    if (!key) return;
    try {
      setBookings(await api.admin.listBookings(key, bookingFilter === 'all' ? '' : bookingFilter));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load consultations.');
    }
  }, [key, bookingFilter]);

  const loadListings = useCallback(async () => {
    if (!key || listingFilter === 'projects') return;
    try {
      setListings(await api.listings.admin.list(key, listingFilter === 'all' ? '' : listingFilter, projectFilter?.id));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load submissions.');
    }
  }, [key, listingFilter, projectFilter]);

  useEffect(() => {
    if (!key) return;
    if (section === 'passports' || section === 'overview') return;
    if (section === 'bookings') loadBookings();
    else if (section === 'listings') loadListings();
  }, [key, section, loadBookings, loadListings]);

  // Staff are signed-in users on EasyMoveZone's admin_users allowlist.
  useEffect(() => {
    let cancelled = false;
    api.admin.whoami()
      .then((w) => { if (!cancelled) { setStaff(w.actor); setKey(ADMIN_SESSION); setAccess('admin'); } })
      .catch(() => { if (!cancelled) setAccess('denied'); });
    return () => { cancelled = true; };
  }, [user?.email]);

  const signOut = () => {
    setKey('');
    setBookings([]);
    setListings([]);
    auth.signOut();
  };

  /** Every pipeline move goes through here, so one failure path covers them all. */
  const patchListing = async (id, patch) => {
    try {
      await api.listings.admin.update(id, key, patch);
      setEditing(null);
      await loadListings();
      setError('');
    } catch (e) {
      setError(e.message || 'Could not update that submission.');
    }
  };

  const deleteListing = async (listing) => {
    if (!window.confirm(`Delete ${listing.ref}? This permanently removes the submission and its enquiries.`)) return;
    try {
      await api.listings.admin.remove(listing.id, key);
      await loadListings();
      setError('');
    } catch (e) {
      setError(e.message || 'Could not delete that submission.');
    }
  };

  const setBookingStatus = async (id, status) => {
    try {
      await api.admin.updateBooking(id, key, { status });
      await loadBookings();
    } catch (e) {
      setError(e.message || 'Could not update that consultation.');
    }
  };

  if (access === 'checking') return <Loader />;

  if (!key) {
    return (
      <Page>
        <Content>
          <GateCard>
            <GateIcon><FaLock /></GateIcon>
            <GateTitle>Admin access</GateTitle>
            <GateSub>
              {user
                ? 'This account is not on the EasyMoveZone admin list. Sign in with an admin account to open the admin.'
                : 'Sign in with your EasyMoveZone admin account to open the admin.'}
            </GateSub>
            <PrimaryBtn type="button" onClick={() => window.location.assign(siteAuthUrl({ from: '/admin' }))}>
              {user ? 'Sign in with another account' : 'Sign in'}
            </PrimaryBtn>
          </GateCard>
        </Content>
      </Page>
    );
  }

  return (
    <Page>
      <Hero>
        <HeroInner>
          <div>
            <Eyebrow>EasyMoveZone{staff ? ` · ${staff}` : ''}</Eyebrow>
            <Title>{SECTION_TITLES[section]}</Title>
          </div>
          <GhostBtn type="button" onClick={signOut}>
            <FaSignOutAlt size={12} /> Sign out
          </GhostBtn>
        </HeroInner>
      </Hero>

      <Content>
        <TabGroupLabel>Property</TabGroupLabel>
        <SectionTabs>
          <SectionTab type="button" $active={section === 'overview'} onClick={() => setSection('overview')}>
            <FaChartPie size={12} /> Overview
          </SectionTab>
          <SectionTab type="button" $active={section === 'passports'} onClick={() => setSection('passports')}>
            <FaShieldAlt size={12} /> Rental checks
          </SectionTab>
          <SectionTab type="button" $active={section === 'bookings'} onClick={() => setSection('bookings')}>
            <FaRegComments size={12} /> Consultations
          </SectionTab>
          <SectionTab type="button" $active={section === 'listings'} onClick={() => setSection('listings')}>
            <FaBuilding size={12} /> Marketplace
          </SectionTab>
          <SectionTab type="button" $active={section === 'rentals'} onClick={() => setSection('rentals')}>
            <FaHome size={12} /> Rentals
          </SectionTab>
          <SectionTab type="button" $active={section === 'management'} onClick={() => setSection('management')}>
            <FaKey size={12} /> Management
          </SectionTab>
          <SectionTab type="button" $active={section === 'tenants'} onClick={() => setSection('tenants')}>
            <FaUserFriends size={12} /> Tenants
          </SectionTab>
          <SectionTab type="button" $active={section === 'renovations'} onClick={() => setSection('renovations')}>
            <FaTools size={12} /> Renovations
          </SectionTab>
          <SectionTab type="button" $active={section === 'messages'} onClick={() => setSection('messages')}>
            <FaEnvelope size={12} /> Messages
          </SectionTab>
          <SectionTab type="button" $active={section === 'community'} onClick={() => setSection('community')}>
            <FaMapMarkedAlt size={12} /> Community
          </SectionTab>
          <SectionTab type="button" $active={section === 'agents'} onClick={() => setSection('agents')}>
            <FaUserFriends size={12} /> Agents
          </SectionTab>
        </SectionTabs>
        <TabGroupLabel>Moving</TabGroupLabel>
        <SectionTabs>
          <SectionTab type="button" $active={section === 'moves'} onClick={() => setSection('moves')}>
            <FaTruck size={12} /> Moves
          </SectionTab>
          <SectionTab type="button" $active={section === 'crews'} onClick={() => setSection('crews')}>
            <FaHardHat size={12} /> Crew & vehicles
          </SectionTab>
          <SectionTab type="button" $active={section === 'moving-enquiries'} onClick={() => setSection('moving-enquiries')}>
            <FaInbox size={12} /> Enquiries
          </SectionTab>
          <SectionTab type="button" $active={section === 'moving-ops'} onClick={() => setSection('moving-ops')}>
            <FaStore size={12} /> Marketplace ops
          </SectionTab>
          <SectionTab type="button" $active={section === 'accounts'} onClick={() => setSection('accounts')}>
            <FaUsersCog size={12} /> Accounts
          </SectionTab>
        </SectionTabs>

        {error && <Err>{error}</Err>}

        {MOVING_SECTIONS[section] ? (
          <MovingAdminSection section={section} />
        ) : section === 'overview' ? (
          <AdminOverview adminKey={key} onOpen={setSection} />
        ) : section === 'passports' ? (
          <PassportAdmin adminKey={key} />
        ) : section === 'listings' ? (
          <>
            <Tabs>
              {[...LISTING_FILTERS, 'all'].map((st) => (
                <Tab key={st} type="button" $active={listingFilter === st} onClick={() => setListingFilter(st)}>
                  {st === 'all' ? 'all' : LISTING_STATUS_LABEL[st]}
                </Tab>
              ))}
            </Tabs>
            {projectFilter && listingFilter !== 'projects' && (
              <Tabs>
                <Tab type="button" $active onClick={() => setProjectFilter(null)}>
                  Project: {projectFilter.name} <FaTimes size={9} />
                </Tab>
              </Tabs>
            )}
            {listings.length === 0 ? (
              <Empty>Nothing at this stage.</Empty>
            ) : (
              <CardList>
                {listings.map((l) => (
                  <ListingRow
                    key={l.id}
                    listing={l}
                    editing={editing === l.id}
                    onEdit={() => setEditing(editing === l.id ? null : l.id)}
                    onPatch={(patch) => patchListing(l.id, patch)}
                    onDelete={() => deleteListing(l)}
                    adminKey={key}
                  />
                ))}
              </CardList>
            )}
          </>
        ) : section === 'bookings' ? (
          <>
            <Tabs>
              {['requested', 'scheduled', 'completed', 'cancelled', 'all'].map((s) => (
                <Tab key={s} type="button" $active={bookingFilter === s} onClick={() => setBookingFilter(s)}>
                  {s}
                </Tab>
              ))}
            </Tabs>
            {bookings.length === 0 ? (
              <Empty>No {bookingFilter === 'all' ? '' : bookingFilter} consultations.</Empty>
            ) : (
              <CardList>
                {bookings.map((b) => <BookingRow key={b.id} booking={b} onSave={async (patch) => {
                  try { await api.admin.updateBooking(b.id, key, patch); await loadBookings(); setError(''); }
                  catch (e) { setError(e.message || 'Could not update that consultation.'); }
                }} onStatus={(status) => setBookingStatus(b.id, status)} />)}
              </CardList>
            )}
          </>
        ) : section === 'messages' ? (
          <MessagesAdmin adminKey={key} />
        ) : section === 'community' ? (
          <CommunityAdmin adminKey={key} />
        ) : section === 'management' ? (
          <ManagementAdmin adminKey={key} />
        ) : section === 'rentals' ? (
          <RentalsAdmin adminKey={key} />
        ) : section === 'agents' ? (
          <AdminAgents adminKey={key} />
        ) : section === 'tenants' ? (
          <TenantsAdmin adminKey={key} />
        ) : (
          <RenovationAdmin adminKey={key} />
        )}
      </Content>
    </Page>
  );
}

/* ── Marketplace approvals ────────────────────────────────────────── */

const ConsentTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  background: ${(p) => (p.$ok ? 'var(--color-green-soft)' : 'rgba(180,83,9,0.1)')};
  color: ${(p) => (p.$ok ? 'var(--color-green-deep)' : 'var(--color-warn)')};
  border: 1px solid ${(p) => (p.$ok ? 'rgba(184, 90, 48,0.25)' : 'rgba(180,83,9,0.22)')};
`;

const EditGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin: 0.9rem 0;
`;

const EditField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink-soft);

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

/**
 * One submission in the pipeline.
 *
 * The publish button is deliberately not always available: a property can only
 * go public if we bought it or the owner ticked the public-listing consent, so
 * showing an enabled "Publish" on a private submission would promise something
 * the server will refuse.
 */
function ListingRow({ listing: l, editing, onEdit, onPatch, onDelete, adminKey }) {
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [draft, setDraft] = useState({
    list_price: l.list_price || '',
    offer_amount: l.offer_amount || '',
    valuation_low: l.valuation_low || '',
    valuation_high: l.valuation_high || '',
    condition_score: l.condition_score || '',
    country: l.country || '',
    currency: l.currency || '',
    route: l.route,
    units_available: l.units_available ?? '',
    admin_note: l.admin_note || '',
    customer_note: l.customer_note || '',
  });

  useEffect(() => {
    setDraft({
      list_price: l.list_price || '',
      offer_amount: l.offer_amount || '',
      valuation_low: l.valuation_low || '',
      valuation_high: l.valuation_high || '',
      condition_score: l.condition_score || '',
      country: l.country || '',
      currency: l.currency || '',
      route: l.route,
      units_available: l.units_available ?? '',
      admin_note: l.admin_note || '',
      customer_note: l.customer_note || '',
    });
  }, [l]);

  // "Owned by EasyMoveZone" needs the purchase on record (bought_at), and an
  // owner listing needs the owner's own signed consent; the server checks both.
  const isDraft = l.status === 'draft';
  const owned = draft.route === 'company_owned' && Boolean(l.bought_at);
  const routeCanPublish = !isDraft && (
    draft.route === 'owner_listed' ? Boolean(l.publish_consent) : owned
  );
  const canPublish = routeCanPublish && Number(draft.list_price || l.guide_price) > 0;
  const [link, setLink] = useState(null);
  const [linkError, setLinkError] = useState('');
  const newLink = async () => {
    setLinkError('');
    try { setLink(await api.listings.admin.newLink(adminKey, { listingId: l.id })); }
    catch (e) { setLinkError(e.message || 'Could not create a link.'); }
  };
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const openEnquiries = async () => {
    const next = !showEnquiries;
    setShowEnquiries(next);
    if (!next) return;
    setLoadingEnquiries(true);
    setEnquiryError('');
    try { setEnquiries(await api.listings.admin.enquiries(l.id, adminKey)); }
    catch (e) { setEnquiryError(e.message || 'Could not load enquiries.'); }
    finally { setLoadingEnquiries(false); }
  };
  const setEnquiryStatus = async (id, status) => {
    try {
      await api.listings.admin.updateEnquiry(id, adminKey, { status });
      setEnquiries(await api.listings.admin.enquiries(l.id, adminKey));
      setEnquiryError('');
    } catch (e) { setEnquiryError(e.message || 'Could not update the enquiry.'); }
  };

  return (
    <Card>
      <CardHead>
        <div>
          <CardTitle>{l.title}</CardTitle>
          <CardSub>
            {l.ref}{l.project_name ? ` · ${l.project_name}` : ''} · {[l.area, l.city, l.state, l.country].filter(Boolean).join(', ') || 'Location to confirm'} · {l.owner_email}
          </CardSub>
        </div>
        <StatusTag $good={l.status === 'live' || l.status === 'sold'} $bad={l.status === 'rejected' || l.status === 'withdrawn'}>
          {LISTING_STATUS_LABEL[l.status] || l.status}
        </StatusTag>
      </CardHead>

      <MetaGrid>
        <Meta>
          <div className="k">owner asked</div>
          <div className="v">{money(l.guide_price, l.currency)}</div>
        </Meta>
        <Meta>
          <div className="k">we offered</div>
          <div className="v">{money(l.offer_amount, l.currency)}</div>
        </Meta>
        <Meta>
          <div className="k">our valuation</div>
          <div className="v">{money(l.valuation_low, l.currency)} – {money(l.valuation_high, l.currency)}</div>
        </Meta>
        <Meta>
          <div className="k">listed at</div>
          <div className="v">{money(l.list_price, l.currency)}</div>
        </Meta>
        <Meta>
          <div className="k">owner wants</div>
          <div className="v">{l.intent === 'buyout' ? 'Purchase offer' : 'List for sale'}</div>
        </Meta>
        <Meta>
          <div className="k">enquiries</div>
          <div className="v">{l.enquiry_count || 0}</div>
        </Meta>
        {l.purchase_by && ['offer_made', 'bought'].includes(l.status) && (
          <Meta>
            <div className="k">we complete by</div>
            <div className="v" style={{ color: l.status === 'offer_made' && daysLeft(l.purchase_by) < 0 ? '#b91c1c' : undefined }}>
              {new Date(l.purchase_by).toLocaleDateString(LOCALE)}
              {l.status === 'offer_made' && ` · ${daysLeft(l.purchase_by) < 0 ? `${-daysLeft(l.purchase_by)}d overdue` : `${daysLeft(l.purchase_by)}d left`}`}
            </div>
          </Meta>
        )}
        {l.units_available !== null && l.units_available !== undefined && (
          <Meta>
            <div className="k">units available</div>
            <div className="v">{l.units_available}</div>
          </Meta>
        )}
      </MetaGrid>

      <div style={{ margin: '0.6rem 0 0.9rem' }}>
        {isDraft
          ? <ConsentTag><FaTimes size={9} /> Waiting for the owner to check and sign{l.link_sent_at ? ` · link sent ${new Date(l.link_sent_at).toLocaleDateString(LOCALE)}${l.link_opened_at ? ', opened' : ', not opened yet'}` : ''}</ConsentTag>
          : canPublish
            ? <ConsentTag $ok><FaCheck size={9} /> Cleared to publish</ConsentTag>
            : <ConsentTag><FaTimes size={9} /> {draft.route === 'company_owned' && !l.bought_at ? 'Not bought yet. Mark it bought before listing it as ours' : 'No public-listing consent. Buy it, or ask the owner'}</ConsentTag>}
      </div>
      {(l.consent_name || l.assisted_by) && (
        <CardSub style={{ margin: '-0.4rem 0 0.9rem' }}>
          {l.consent_name && <>Signed by <strong>{l.consent_name}</strong>{l.consent_via === 'owner_link' ? ' through their own confirmation link' : l.consent_via === 'self' ? ' on the Sell form' : ''}{l.consent_at ? ` on ${new Date(l.consent_at).toLocaleDateString(LOCALE)}` : ''}. </>}
          {l.assisted_by && <>Prepared by {l.assisted_by}.</>}
        </CardSub>
      )}

      {l.description && <Desc>{l.description}</Desc>}
      <AdminMedia media={l.media} adminKey={adminKey} label="Seller's photos and video" />
      <AdminDocuments documents={l.title_documents} adminKey={adminKey} />
      {l.owner_note && <Desc><strong>Owner's note when signing:</strong> {l.owner_note}</Desc>}
      {l.customer_note && <Desc><strong>Message to owner:</strong> {l.customer_note}</Desc>}
      {l.admin_note && <Desc><strong>Internal note:</strong> {l.admin_note}</Desc>}

      {editing && (
        <>
          <EditGrid>
            <EditField>
              List price
              <input value={draft.list_price} onChange={(e) => set('list_price', e.target.value)} placeholder="e.g. 199000000" />
            </EditField>
            <EditField>
              Our offer
              <input value={draft.offer_amount} onChange={(e) => set('offer_amount', e.target.value)} placeholder="e.g. 168000000" />
            </EditField>
            <EditField>
              Valuation low
              <input value={draft.valuation_low} onChange={(e) => set('valuation_low', e.target.value)} placeholder="Lower evidence-based value" />
            </EditField>
            <EditField>
              Valuation high
              <input value={draft.valuation_high} onChange={(e) => set('valuation_high', e.target.value)} placeholder="Upper evidence-based value" />
            </EditField>
            <EditField>
              Condition score
              <input type="number" min="0" max="100" value={draft.condition_score} onChange={(e) => set('condition_score', e.target.value)} placeholder="0–100" />
            </EditField>
            <EditField>
              Property country
              <input value={draft.country} onChange={(e) => set('country', e.target.value)} placeholder="e.g. United Kingdom" />
            </EditField>
            <EditField>
              Currency
              <select value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
                <option value="">Choose currency</option>
                {CURRENCY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </EditField>
            <EditField>
              Route to market
              <select value={draft.route} onChange={(e) => set('route', e.target.value)}>
                <option value="private">Private (not for the marketplace)</option>
                <option value="owner_listed">Sell for the owner</option>
                <option value="company_owned" disabled={!l.bought_at}>We bought it{l.bought_at ? '' : ' (mark it bought first)'}</option>
              </select>
            </EditField>
            {l.project_id && (
              <EditField>
                Units available
                <input type="number" min="0" value={draft.units_available} onChange={(e) => set('units_available', e.target.value)} />
              </EditField>
            )}
            <EditField style={{ gridColumn: '1 / -1' }}>
              Message visible to owner
              <textarea rows={2} value={draft.customer_note} onChange={(e) => set('customer_note', e.target.value)} placeholder="Explain the review or issued offer." />
            </EditField>
            <EditField style={{ gridColumn: '1 / -1' }}>
              Internal note (admin only)
              <textarea rows={2} value={draft.admin_note} onChange={(e) => set('admin_note', e.target.value)} />
            </EditField>
          </EditGrid>
          <Actions style={{ marginBottom: '0.75rem' }}>
            <ActionBtn $primary type="button" onClick={() => onPatch(draft)}>Save changes</ActionBtn>
          </Actions>
        </>
      )}

      {link && <OwnerLink link={link} owner={{ name: l.owner_name, email: l.owner_email, phone: l.owner_phone }} subject={l.title} />}
      {linkError && <Err>{linkError}</Err>}

      <Actions>
        <ActionBtn type="button" onClick={onEdit}>{editing ? 'Close' : 'Edit'}</ActionBtn>
        {isDraft && !l.project_id && (
          <ActionBtn $primary type="button" onClick={newLink}>New owner link</ActionBtn>
        )}
        {l.status === 'submitted' && (
          <ActionBtn type="button" onClick={() => onPatch({ status: 'reviewing' })}>Start review</ActionBtn>
        )}
        {!isDraft && l.status !== 'live' && l.status !== 'sold' && (
          <ActionBtn
            $primary
            type="button"
            disabled={!canPublish}
            title={canPublish ? '' : 'Either the owner signed a public-listing consent (sell for the owner), or we bought it — plus a positive list price.'}
            onClick={() => onPatch({ status: 'live', ...draft })}
          >
            Publish to marketplace
          </ActionBtn>
        )}
        {l.status === 'live' && (
          <>
            <ActionBtn as="a" href={`/listings/${l.slug || l.id}`} target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt size={10} /> View listing
            </ActionBtn>
            <ActionBtn type="button" onClick={() => onPatch({ status: 'sold' })}>Mark sold</ActionBtn>
            <ActionBtn type="button" onClick={() => onPatch({ status: 'withdrawn' })}>Withdraw</ActionBtn>
          </>
        )}
        {l.status !== 'rejected' && l.status !== 'live' && (
          <ActionBtn type="button" onClick={() => onPatch({ status: 'rejected' })}>Reject</ActionBtn>
        )}
        <ActionBtn type="button" onClick={openEnquiries}>Enquiries ({l.enquiry_count || 0})</ActionBtn>
        <ActionBtn $danger type="button" onClick={onDelete}>Delete</ActionBtn>
      </Actions>
      {showEnquiries && (
        <div style={{ marginTop: '0.9rem' }}>
          {enquiryError && <Err>{enquiryError}</Err>}
          {loadingEnquiries ? <Desc>Loading enquiries…</Desc> : enquiries.length ? (
            <CardList>{enquiries.map((enquiry) => (
              <Meta key={enquiry.id}>
                <div className="v">{enquiry.name} · {enquiry.email}{enquiry.phone ? ` · ${enquiry.phone}` : ''}</div>
                <div style={{ margin: '.35rem 0', fontSize: '.82rem' }}>{enquiry.message || 'No message supplied.'}</div>
                <Actions>{['new', 'contacted', 'viewing_booked', 'offer_made', 'closed'].filter((s) => s !== enquiry.status).map((status) => (
                  <ActionBtn key={status} type="button" onClick={() => setEnquiryStatus(enquiry.id, status)}>Mark {status.replaceAll('_', ' ')}</ActionBtn>
                ))}</Actions>
              </Meta>
            ))}</CardList>
          ) : <Desc>No enquiries for this property.</Desc>}
        </div>
      )}
    </Card>
  );
}

function BookingRow({ booking: b, onSave, onStatus }) {
  const [managerName, setManagerName] = useState(b.managerName || '');
  const [adminNote, setAdminNote] = useState(b.adminNote || '');
  useEffect(() => { setManagerName(b.managerName || ''); setAdminNote(b.adminNote || ''); }, [b]);
  return (
    <Card>
      <CardHead><div><CardTitle>{b.name}</CardTitle><CardSub>{SERVICE_LABELS[b.service] || b.service} · {b.email}{b.phone ? ` · ${b.phone}` : ''}</CardSub></div><StatusTag $good={b.status === 'scheduled' || b.status === 'completed'} $bad={b.status === 'cancelled'}>{b.status}</StatusTag></CardHead>
      <MetaGrid>
        <Meta><div className="k">reference</div><div className="v">{b.ref}</div></Meta>
        <Meta><div className="k">property held</div><div className="v">{b.portfolioBand || 'Not stated'}</div></Meta>
        <Meta><div className="k">preferred</div><div className="v">{b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : 'Any'}{b.preferredWindow ? `, ${b.preferredWindow}` : ''}</div></Meta>
        <Meta><div className="k">requested</div><div className="v">{new Date(b.createdAt).toLocaleDateString()}</div></Meta>
      </MetaGrid>
      {b.goals && <Desc>{b.goals}</Desc>}
      <EditGrid>
        <EditField>Assigned manager<input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Manager name" /></EditField>
        <EditField style={{ gridColumn: '1 / -1' }}>Internal note<textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} /></EditField>
      </EditGrid>
      <Actions>
        <ActionBtn $primary type="button" onClick={() => onSave({ managerName, adminNote })}>Save assignment</ActionBtn>
        {BOOKING_STATUSES.filter((s) => s !== b.status).map((s) => <ActionBtn key={s} type="button" $danger={s === 'cancelled'} onClick={() => onStatus(s)}>Mark {s}</ActionBtn>)}
      </Actions>
    </Card>
  );
}
