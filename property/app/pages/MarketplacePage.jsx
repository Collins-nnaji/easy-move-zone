import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Routes, Route, Link, Navigate, useParams, useNavigate, useSearchParams, useLocation,
} from 'react-router-dom';
import {
  FaArrowRight, FaCheck, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaSearch,
  FaChevronLeft, FaChevronDown, FaShieldAlt, FaFilter, FaCalendarAlt,
} from 'react-icons/fa';
import { api, publicMediaUrl } from '../api';
import { useAuth } from '../AuthContext';
import {
  PageShell, Section, Inner, Panel,
} from '../components/page';
import {
  SAVED_URL, RENT_URL, AREAS_URL, LIST_URL,
} from '../config/platform';
import ListingMap from '../components/ListingMap';
import { perPeriod, INCOME_BANDS, ID_TYPES, VIEWING_WINDOWS } from '../config/rentals';
import { SaveButton, ShareButtons } from '../components/ListingActions';
import { shortlist, useSaved, useRecent } from '../utils/shortlist';
import { formatMoney } from '../utils/format';
import OfferRenovate from './offer-renovate';
import { motion } from 'framer-motion';
import { Heart, Bell } from 'lucide-react';
import { Stagger, StaggerItem, staggerItem } from '../components/motion';
import { SpotArt } from '../components/graphics';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import PropertyHeader, { StreetArt } from '../components/PropertyHeader';
import { useIsMobile } from '../utils/useMediaQuery';
import { Skeleton } from '../components/shadcn/skeleton';
import { Badge } from '../components/shadcn/badge';
import { Button } from '../components/shadcn/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '../components/shadcn/drawer';
import { LOCALE } from '../config/markets';

/**
 * The marketplace — the only public, browsable surface on the site.
 *
 * Everything here has already been through EasyOffer: we valued it, and an
 * admin approved it before it appeared. A listing is either a property we
 * bought outright and are reselling, or one we are selling on the owner's
 * behalf — the badge on each card says which, because it changes who the buyer
 * is dealing with.
 *
 * Rent (`/listings/rent`) is the same grid in another mode: vacant homes we
 * manage, advertised with the owner's consent. A renter applies rather than
 * enquires, and the desk vets them before the tenancy is created in Manage.
 */

const money = (v, currency = 'NGN') => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 'Price on application';
  return formatMoney(n, currency);
};

/** A developer's unit type is one listing with a count of units left. */
const unitsLeft = (n) => (Number(n) === 1 ? '1 unit left' : `${n} units available`);

const ROUTE_LABEL = {
  company_owned: 'Owned by EasyMoveZone',
  owner_listed: 'Sold via EasyMoveZone',
  agent_listed: 'Listed by agent',
};

const isRental = (l) => l?.listing_type === 'rent';

/** "₦6,500,000 / year" for a rental, the plain price for a sale. */
const priceOf = (l) => {
  const base = money(l.price, l.currency);
  return isRental(l) && Number(l.price) > 0 ? `${base} / ${perPeriod(l.rent_frequency)}` : base;
};

const flagOf = (l) => {
  if (l.route === 'agent_listed') {
    return l.agency_name ? `Listed by ${l.agency_name}` : 'Listed by agent';
  }
  return isRental(l) ? 'To rent · Managed by EasyMoveZone' : (ROUTE_LABEL[l.route] || 'Verified by EasyMoveZone');
};

/** "1 Nov 2026", or "now" once the date has passed. */
const availableLabel = (date) => {
  if (!date) return '';
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d <= new Date() ? 'now' : d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
};


/* ── Filters ──────────────────────────────────────────────────────── */

/*
 * One filter panel rather than a row of pills: labelled fields side by side
 * in a single bordered card, divided by hairlines, with sort as a quiet
 * control under it. On phones the same fields stack inside the drawer.
 */
const FilterPanel = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1.7fr) repeat(${(p) => p.$cols}, minmax(0, 1fr));
  background: #fff;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  margin-bottom: 1.25rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(${(p) => Math.min(3, p.$cols + 1)}, minmax(0, 1fr)); }
  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
    box-shadow: none;
  }
`;

const FilterCell = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
  min-width: 0;
  min-height: 62px;
  padding: 0.55rem 1rem;
  border-left: 1px solid var(--color-line);
  cursor: pointer;
  transition: background 0.15s ease;

  &:first-child { border-left: 0; }
  &:hover { background: var(--color-bg-panel); }
  &:focus-within { background: var(--color-green-wash); }

  .k {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => (p.$on ? 'var(--color-green-deep)' : 'var(--color-ink-faint)')};
  }
  .k::after {
    content: '';
    display: ${(p) => (p.$on ? 'block' : 'none')};
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: var(--color-green);
  }

  @media (max-width: 1100px) {
    border-top: 1px solid var(--color-line);
  }
  @media (max-width: 720px) {
    border-left: 0;
    &:first-child { border-top: 0; }
  }
`;

const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238a9990' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

const Field = styled.select`
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  border: 0;
  padding: 0 1.2rem 0 0;
  background: transparent ${CHEVRON} right center / 10px 6px no-repeat;
  font-family: var(--font-sans);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
  text-overflow: ellipsis;
  &:focus { outline: none; }
`;

const SearchInput = styled.input`
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink);
  &::placeholder { color: var(--color-ink-faint); font-weight: 500; }
  &:focus { outline: none; }
`;

/* Under the panel: the count on the left, clear and sort on the right. */
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0 0 1.1rem;
  font-size: 0.88rem;
  color: var(--color-ink-muted);

  .right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
`;

const ViewSwitch = styled.div`
  display: inline-flex;
  border: 1px solid var(--color-line-strong);
  border-radius: 999px;
  overflow: hidden;
  background: #fff;

  button {
    border: 0;
    background: transparent;
    padding: 0.35rem 0.8rem;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-ink-muted);
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: var(--color-green-deep); color: #fff; }
`;

const SortSelect = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  color: var(--color-ink-muted);
  && select {
    width: auto;
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    padding: 0.35rem 1.2rem 0.35rem 0.1rem;
    background: transparent ${CHEVRON} right center / 10px 6px no-repeat;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 650;
    color: var(--color-ink);
    cursor: pointer;
    &:focus-visible { outline: 2px solid var(--color-green); outline-offset: 2px; border-radius: 4px; }
  }
`;

const FilterToggle = styled.button`
  display: none;

  @media (max-width: 720px) {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin-bottom: 0.75rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--color-line-strong);
    border-radius: 12px;
    background: #fff;
    color: var(--color-ink);
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    .label { display: flex; align-items: center; gap: 0.55rem; }
    .count { color: var(--color-green-deep); font-size: 0.75rem; }
    .chevron { color: var(--color-ink-faint); transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')}); transition: transform .15s ease; }
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  padding: 0.4rem 0.3rem;
  &:hover { color: var(--color-green-deep); }
`;

const ResultCount = styled.div`
  font-size: 0.88rem;
  color: var(--color-ink-muted);
  margin-bottom: 1rem;
`;

/* ── Cards ────────────────────────────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1000px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  color: var(--color-ink);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    color: var(--color-ink);
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: rgba(184, 90, 48, 0.3);
  }
`;

const Shot = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, var(--color-green-wash), var(--color-bg-slate));
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
  .save { position: absolute; right: 0.7rem; bottom: 0.7rem; z-index: 1; }

  .none {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    color: var(--color-ink-faint);
  }
`;

const Flag = styled.span`
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 1;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  border-radius: var(--radius-pill);
  padding: 0.28rem 0.65rem;
  background: ${(p) => (p.$owned ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$owned ? '#fff' : 'var(--color-green-deep)')};
  border: 1px solid ${(p) => (p.$owned ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
`;

const Score = styled.span`
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  padding: 0.28rem 0.6rem;
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-green-deep);
  border: 1px solid var(--color-line-strong);

  b { font-family: var(--font-display); font-size: 0.85rem; }
`;

const CardBody = styled.div`
  padding: 1rem 1.1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
`;

const Price = styled.div`
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
`;

const CardTitle = styled.h3`
  font-size: 0.98rem;
  font-weight: 600;
  margin: 0;
`;

const Where = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  svg { color: var(--color-green); font-size: 0.75rem; flex-shrink: 0; }
`;

const AreaLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-green-deep);
  &:hover { color: var(--color-green-forest); text-decoration: underline; }
`;

const Specs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: auto;
  padding-top: 0.7rem;
  border-top: 1px solid var(--color-line);
  font-size: 0.82rem;
  color: var(--color-ink-muted);

  span { display: inline-flex; align-items: center; gap: 0.35rem; }
  svg { color: var(--color-ink-faint); font-size: 0.75rem; }
`;

const EmptyState = styled(Panel)`
  text-align: center;
  padding: 2.5rem 1.5rem;

  h3 { margin-bottom: 0.5rem; }
  p { max-width: 46ch; margin: 0 auto 1.25rem; }
`;

const QuietArt = styled.div`
  width: 148px;
  margin: 0 auto 0.35rem;
`;

const PageTitle = styled.h1`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const GreenBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--color-green-deep);
  color: #fff;
  border-radius: var(--radius-pill);
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  &:hover { color: #fff; background: var(--color-green-forest); }
`;

const MoreBtn = styled.button`
  display: block;
  margin: 1.75rem auto 0;
  background: #fff;
  border: 1.5px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  padding: 0.75rem 1.6rem;
  font-family: var(--font-sans);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
  &:hover { border-color: var(--color-green-deep); color: var(--color-green-deep); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export function ListingCard({ listing }) {
  const [shotFailed, setShotFailed] = useState(false);
  const cover = (listing.media || []).find((m) => m.kind !== 'video' && m.kind !== 'floorplan');
  const owned = listing.route === 'company_owned' && !isRental(listing);

  return (
    <Card to={`/listings/${listing.slug || listing.id}`}>
      <Shot>
        <Flag $owned={owned}>{flagOf(listing)}</Flag>
        {listing.condition_score ? (
          <Score><b>{listing.condition_score}</b> condition</Score>
        ) : null}
        {/* A dead image URL should read as "no photo", not as sprawling alt text. */}
        {cover && !shotFailed
          ? <img src={publicMediaUrl(cover.url)} alt={listing.title} loading="lazy" onError={() => setShotFailed(true)} />
          : <div className="none">Photos on request</div>}
        <SaveButton listing={listing} round className="save" />
      </Shot>
      <CardBody>
        <Price>{priceOf(listing)}</Price>
        <CardTitle>{listing.title}</CardTitle>
        <Where>
          <FaMapMarkerAlt />
          {[listing.project_name, listing.area, listing.city, listing.state, listing.country].filter(Boolean).join(', ') || 'Location to confirm'}
        </Where>
        <Specs>
          {listing.beds && <span><FaBed /> {listing.beds} bed</span>}
          {listing.baths && <span><FaBath /> {listing.baths} bath</span>}
          {listing.size_label && <span><FaRulerCombined /> {listing.size_label}</span>}
          {isRental(listing) && listing.available_from && <span><FaCalendarAlt /> From {availableLabel(listing.available_from)}</span>}
          {listing.units_available > 0 && <span>{unitsLeft(listing.units_available)}</span>}
        </Specs>
      </CardBody>
    </Card>
  );
}

/* ── Browse ───────────────────────────────────────────────────────── */

const PAGE_SIZE = 12;

function Browse({ mode = 'sale' }) {
  const rent = mode === 'rent';
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mobile = useIsMobile();

  // The filters live in the query string, so a filtered grid is a shareable URL.
  const filters = useMemo(() => ({
    country: params.get('country') || '',
    currency: params.get('currency') || '',
    state: params.get('state') || '',
    type: params.get('type') || '',
    beds: params.get('beds') || '',
    route: params.get('route') || '',
    sort: params.get('sort') || 'newest',
    q: params.get('q') || '',
  }), [params]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setShown(PAGE_SIZE);
  };

  useEffect(() => {
    api.listings.facets(mode).then(setFacets).catch(() => {});
  }, [mode]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.listings.browse({ ...filters, mode, limit: shown }));
      setError('');
    } catch (err) {
      setError(err?.message || 'Could not load properties.');
    } finally {
      setLoading(false);
    }
  }, [filters, shown, mode, rent]);

  useEffect(() => { load(); }, [load]);

  const listings = data?.listings || [];
  const total = data?.total || 0;
  const filterKeys = ['country', 'currency', 'state', 'type', 'beds', 'q', 'route'];
  const anyFilter = filterKeys.some((k) => filters[k]);
  const activeCount = filterKeys.filter((k) => filters[k]).length;

  const clearFilters = () => { setParams({}, { replace: true }); setShown(PAGE_SIZE); };
  // Nigeria-first: the country field only appears once listings span more than one.
  const manyCountries = (facets?.countries || []).length > 1;
  const filterCols = 4 + (manyCountries ? 1 : 0);
  const mapView = params.get('view') === 'map';
  const mapped = listings.filter((l) => Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lng)));

  const sortField = (
    <Field value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} aria-label="Sort">
      <option value="newest">Newest first</option>
      <option value="price_asc">{rent ? 'Rent' : 'Price'}: low to high</option>
      <option value="price_desc">{rent ? 'Rent' : 'Price'}: high to low</option>
      {!rent && <option value="condition">Best condition</option>}
    </Field>
  );

  const filterPanel = (
    <FilterPanel id="property-filters" $cols={filterCols} role="search">
      <FilterCell $on={Boolean(filters.q)}>
        <span className="k"><FaSearch size={9} /> Where</span>
        <SearchInput
          value={filters.q}
          onChange={(e) => setFilter('q', e.target.value)}
          placeholder="Area, estate or city"
          aria-label="Search by location"
        />
      </FilterCell>
      <FilterCell $on={Boolean(filters.state)}>
        <span className="k">State</span>
        <Field value={filters.state} onChange={(e) => setFilter('state', e.target.value)} aria-label="State">
          <option value="">Any state</option>
          {(facets?.states || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </Field>
      </FilterCell>
      <FilterCell $on={Boolean(filters.type)}>
        <span className="k">Type</span>
        <Field value={filters.type} onChange={(e) => setFilter('type', e.target.value)} aria-label="Property type">
          <option value="">Any type</option>
          {(facets?.types || []).map((x) => <option key={x} value={x}>{x}</option>)}
        </Field>
      </FilterCell>
      <FilterCell $on={Boolean(filters.beds)}>
        <span className="k">Bedrooms</span>
        <Field value={filters.beds} onChange={(e) => setFilter('beds', e.target.value)} aria-label="Bedrooms">
          <option value="">Any</option>
          {(facets?.beds || []).map((x) => <option key={x} value={x}>{x} bed</option>)}
        </Field>
      </FilterCell>
      <FilterCell $on={Boolean(filters.route)}>
        <span className="k">Source</span>
        <Field value={filters.route} onChange={(e) => setFilter('route', e.target.value)} aria-label="Source">
          <option value="">Anyone</option>
          <option value="emz">Managed by EasyMoveZone</option>
          <option value="agent_listed">Listed by an agent</option>
        </Field>
      </FilterCell>
      {manyCountries && (
        <FilterCell $on={Boolean(filters.country)}>
          <span className="k">Country</span>
          <Field value={filters.country} onChange={(e) => setFilter('country', e.target.value)} aria-label="Country">
            <option value="">Any country</option>
            {facets.countries.map((x) => <option key={x} value={x}>{x}</option>)}
          </Field>
        </FilterCell>
      )}
    </FilterPanel>
  );

  return (
    <>
      <PageTitle>Homes to rent</PageTitle>

      <Section $sm id="properties-grid">
        <Inner>
          <SavedLink />
          {mobile ? (
            <>
              <FilterToggle type="button" $open={filtersOpen} aria-expanded={filtersOpen} aria-controls="property-filters" onClick={() => setFiltersOpen(true)}>
                <span className="label"><FaFilter /> Filters {activeCount > 0 && <Badge variant="count">{activeCount}</Badge>}</span>
                <FaChevronDown className="chevron" />
              </FilterToggle>
              <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <DrawerDescription>{total} {rent ? `home${total === 1 ? '' : 's'}` : `propert${total === 1 ? 'y' : 'ies'}`} match</DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-y-auto px-5 pb-2">
                    {filterPanel}
                    <FilterCell as="div" style={{ border: '1px solid var(--color-line-strong)', borderRadius: 'var(--radius-md)', marginTop: '0.75rem' }}>
                      <span className="k">Sort by</span>
                      {sortField}
                    </FilterCell>
                  </div>
                  <DrawerFooter className="flex-row">
                    {anyFilter && (
                      <Button variant="outline" size="lg" className="flex-1" onClick={clearFilters}>Clear</Button>
                    )}
                    <DrawerClose asChild><Button size="lg" className="flex-1">Show {total}</Button></DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          ) : filterPanel}

          {loading && !data ? (
            <Grid aria-busy="true" aria-label="Loading properties">
              {Array.from({ length: mobile ? 2 : 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-white">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </div>
              ))}
            </Grid>
          ) : error ? (
            <EmptyState><h3>Could not load properties</h3><p>{error}</p></EmptyState>
          ) : listings.length === 0 && rent ? (
            <EmptyState>
              {!anyFilter && <QuietArt><StreetArt kind="rent" /></QuietArt>}
              <h3>{anyFilter ? 'Nothing matches those filters' : 'No homes to rent right now'}</h3>
              <p>
                {anyFilter
                  ? 'Try widening the search. Homes come up when an agent lists one, or when a home we manage falls vacant.'
                  : 'Homes appear when a verified agent posts one, or when a home we manage falls vacant. Leave your email below and we will tell you when one does.'}
              </p>
              {anyFilter
                ? <ClearBtn type="button" onClick={() => setParams({}, { replace: true })}>Clear filters</ClearBtn>
                : <GreenBtn to={LIST_URL}>List a property <FaArrowRight size={12} /></GreenBtn>}
            </EmptyState>
          ) : listings.length === 0 ? (
            <EmptyState>
              <h3>{anyFilter ? 'Nothing matches those filters' : 'No properties on the market right now'}</h3>
              <p>
                {anyFilter
                  ? 'Try widening the search. Listings appear after we approve them.'
                  : 'Verified agents post their own stock here, and we approve every listing before it goes live. The grid fills as those homes are submitted.'}
              </p>
              {anyFilter
                ? <ClearBtn type="button" onClick={() => setParams({}, { replace: true })}>Clear filters</ClearBtn>
                : <GreenBtn to={LIST_URL}>List a property <FaArrowRight size={12} /></GreenBtn>}
            </EmptyState>
          ) : (
            <>
              <Toolbar>
                <span>{total} {rent ? `home${total === 1 ? '' : 's'} to rent` : `propert${total === 1 ? 'y' : 'ies'} available`}</span>
                <span className="right">
                  <ViewSwitch role="group" aria-label="List or map">
                    <button type="button" aria-pressed={!mapView} onClick={() => setFilter('view', '')}>List</button>
                    <button type="button" aria-pressed={mapView} onClick={() => setFilter('view', 'map')}>Map</button>
                  </ViewSwitch>
                  {!mobile && (
                    <>
                      {anyFilter && <ClearBtn type="button" onClick={clearFilters}>Clear filters</ClearBtn>}
                      <SortSelect>Sort by {sortField}</SortSelect>
                    </>
                  )}
                </span>
              </Toolbar>
              {mapView && (
                mapped[0]
                  ? <div style={{ marginBottom: '1.25rem' }}><ListingMap lat={mapped[0].lat} lng={mapped[0].lng} title="Listings on the map" /></div>
                  : <EmptyState><h3>No map pins yet</h3><p>None of these listings have a location pin. The list is below.</p></EmptyState>
              )}
              <Stagger>
                <Grid>
                  {(mapView ? mapped : listings).map((l) => <StaggerItem key={l.id}><ListingCard listing={l} /></StaggerItem>)}
                </Grid>
              </Stagger>
              {listings.length < total && (
                <MoreBtn type="button" disabled={loading} onClick={() => setShown((n) => n + PAGE_SIZE)}>
                  {loading ? 'Loading…' : `Show more (${total - listings.length} left)`}
                </MoreBtn>
              )}
            </>
          )}

          {!loading && !error && <AlertSignup filters={filters} rent={rent} />}
          {!anyFilter && <RecentlyViewed />}
        </Inner>
      </Section>
    </>
  );
}

/* ── Saved, recently viewed and new-listing alerts ────────────────── */

const SavedChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-green-deep);
  svg { color: #dc2626; }
`;

/** "Saved (3)" under the Buy header, only once something is saved. */
function SavedLink() {
  const saved = useSaved();
  if (!saved.length) return null;
  return <SavedChip to={SAVED_URL}><Heart size={14} fill="currentColor" /> Saved properties ({saved.length})</SavedChip>;
}

const Strip = styled.div`
  margin-top: 2.5rem;
  h2 { font-size: 1.05rem; margin: 0 0 0.85rem; }
  .row { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.4rem; scroll-snap-type: x proximity; scrollbar-width: none; }
  .row::-webkit-scrollbar { display: none; }
  .row > * { flex: 0 0 min(250px, 72%); scroll-snap-align: start; }
`;

/** The last few properties opened on this device. */
function RecentlyViewed() {
  const recent = useRecent();
  if (!recent.length) return null;
  return (
    <Strip>
      <h2>Recently viewed</h2>
      <div className="row">
        {recent.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </Strip>
  );
}

const AlertBox = styled.form`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem 1.5rem;
  align-items: center;
  background: var(--color-band);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.4rem;

  h3 { font-size: 1.02rem; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.5rem; }
  h3 svg { color: var(--color-green-deep); }
  p { margin: 0; font-size: 0.86rem; color: var(--color-ink-muted); }
  .fields { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  input { min-height: 44px; border: 1px solid var(--color-line-strong); border-radius: 11px; padding: 0 0.8rem; font: inherit; background: #fff; min-width: 0; }
  button { min-height: 44px; border: 0; border-radius: 11px; padding: 0 1rem; background: var(--color-green-deep); color: #fff; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.6; }
  .done { font-weight: 600; color: var(--color-green-deep); }
  .err { grid-column: 1 / -1; color: #b91c1c; font-size: 0.85rem; }

  /* The form column is auto-sized, so below ~1000px it crowded the heading
     into a sliver; stack the two there instead. */
  @media (max-width: 1000px) {
    grid-template-columns: minmax(0, 1fr);
  }
  @media (max-width: 760px) {
    padding: 1.1rem;
    .fields { flex-direction: column; }
    .fields > * { width: 100%; }
  }
`;

const FILTER_WORDS = {
  type: (v) => v, beds: (v) => `${v}+ bed`, state: (v) => v, country: (v) => v, q: (v) => `“${v}”`,
  route: (v) => ROUTE_LABEL[v], currency: (v) => `in ${v}`,
};

/**
 * "Email me new listings" for the current filters. Stock is approved one
 * property at a time, so a buyer is better served by a note when a match
 * goes live than by checking back. Lands in Admin → Messages.
 */
/*
 * Once someone has asked for alerts, the box stays out of their way: we
 * remember it on this device, one entry per grid (Buy, Rent), and show a
 * single line in its place instead of the form.
 */
const ALERTS_KEY = 'bv.alerts.v1';

function readAlerts() {
  try { return JSON.parse(window.localStorage.getItem(ALERTS_KEY) || '{}') || {}; } catch { return {}; }
}

function rememberAlert(mode, email) {
  try {
    window.localStorage.setItem(ALERTS_KEY, JSON.stringify({ ...readAlerts(), [mode]: { email, at: Date.now() } }));
  } catch { /* private mode: they will see the form again next visit */ }
}

const AlertDone = styled.p`
  margin: 2rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  font-size: 0.86rem;
  color: var(--color-ink-muted);
  svg { color: var(--color-green-deep); flex: none; }
  button {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: var(--color-green-deep);
    cursor: pointer;
  }
`;

function AlertSignup({ filters, rent = false }) {
  const { user } = useAuth();
  const mode = rent ? 'rent' : 'sale';
  const [saved, setSaved] = useState(() => readAlerts()[mode] || null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const describe = Object.entries(FILTER_WORDS)
    .filter(([k]) => filters[k] && !(rent && k === 'route'))
    .map(([k, f]) => f(filters[k]))
    .join(', ');

  useEffect(() => {
    if (user) { setName((n) => n || user.name || ''); setEmail((e) => e || user.email || ''); }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      if (user) {
        await api.account.saveSearch({
          name: describe || (rent ? 'Homes to rent' : 'Properties for sale'),
          filters: { ...filters, mode },
          alert: true,
        });
      }
      await api.submitLead({
        type: 'general',
        name: name || email.split('@')[0],
        email,
        service: 'property_alert',
        message: `Email me new ${rent ? 'homes to rent' : 'listings'}${describe ? ` matching: ${describe}` : ''}.\n${window.location.href}`,
      });
      rememberAlert(mode, email);
      setState('done');
    } catch (err) {
      setError(err?.message || 'Could not save your alert.');
      setState('idle');
    }
  };

  // Signed up on an earlier visit: one quiet line, not the form.
  if (saved && state !== 'done') {
    return (
      <AlertDone>
        <Bell size={15} />
        <span>We will email {saved.email} when a new {rent ? 'home to rent comes up' : 'property goes live'}.</span>
        <button type="button" onClick={() => { setEmail(saved.email); setSaved(null); }}>Change</button>
      </AlertDone>
    );
  }

  return (
    <AlertBox onSubmit={submit}>
      <div>
        <h3><Bell size={17} /> {rent ? 'Email me new homes to rent' : 'Email me new listings'}</h3>
        <p>
          {rent
            ? (describe ? `When a home matching ${describe} comes up.` : 'When a new home comes up to rent.')
            : (describe ? `When a property matching ${describe} goes live.` : 'When a new property goes live.')}
        </p>
      </div>
      {state === 'done' ? (
        <span className="done">Done — we will email {email}.</span>
      ) : (
        <div className="fields">
          {!user && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" autoComplete="name" />}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" autoComplete="email" />
          <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Saving…' : 'Notify me'}</button>
        </div>
      )}
      {error && <span className="err">{error}</span>}
    </AlertBox>
  );
}

/** Saved properties, kept on this device (no account needed). */
function Saved() {
  const saved = useSaved();
  return (
    <>
      <PropertyHeader kind="saved">
        <motion.h1 variants={staggerItem}>Saved homes.</motion.h1>
        <motion.p variants={staggerItem} className="intro">Saved on this device, and on your account when you are signed in.</motion.p>
      </PropertyHeader>
      <Section $sm>
        <Inner>
          {saved.length === 0 ? (
            <EmptyState>
              <h3>Nothing saved yet</h3>
              <p>Tap the heart on a home to keep it here while you decide.</p>
              <GreenBtn to={RENT_URL}>Browse homes to rent <FaArrowRight size={12} /></GreenBtn>
            </EmptyState>
          ) : (
            <>
              <ResultCount>{saved.length} saved</ResultCount>
              <Grid>
                {saved.filter(isRental).map((l) => <ListingCard key={l.id} listing={l} />)}
              </Grid>
            </>
          )}
        </Inner>
      </Section>
    </>
  );
}

function Renovate() {
  const mobile = useIsMobile();
  return (
    <>
      <ServiceHero $image="/media/construction.jpg">
        <ServiceHeroInner $spot={mobile}>
          {mobile && <SpotArt className="spot" kind="renovate" />}
          <div>
            <StaggerItem className="eyebrow">EasyMoveZone Manage · Renovation</StaggerItem>
            <motion.h1 variants={staggerItem}>Renovate your property.</motion.h1>
            <motion.p variants={staggerItem}>To let faster, for more, or before you sell. Scope it, approve each stage, see the evidence.</motion.p>
            <StaggerItem className="aside">Letting it out? <Link to="/manage">See how we manage it <FaArrowRight size={10} /></Link></StaggerItem>
          </div>
        </ServiceHeroInner>
      </ServiceHero>
      <OfferRenovate />
    </>
  );
}

/** Old buy, build and `/listings/rent` links land on the rental grid, filters kept. */
function LegacyListingsRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: RENT_URL, search }} replace />;
}

/* ── Detail ───────────────────────────────────────────────────────── */

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  margin-bottom: 1.1rem;
  &:hover { color: var(--color-green-deep); }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: start;

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  img, video {
    width: 100%;
    border-radius: var(--radius-md);
    object-fit: cover;
    aspect-ratio: 4 / 3;
    background: var(--color-bg-slate);
    /* A dead URL should leave a clean tile, not sprawling alt text. */
    color: transparent;
    font-size: 0;
  }
  > :first-child {
    grid-column: span 4;
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-lg);
  }
  > :first-child img, > :first-child video { aspect-ratio: 16 / 9; border-radius: var(--radius-lg); }
`;

const DetailActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
`;

const DetailHead = styled.div`
  margin-bottom: 1.25rem;

  h1 { font-size: clamp(1.5rem, 2.6vw, 2rem); margin-bottom: 0.4rem; }
`;

const DetailPrice = styled.div`
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-green-deep);
  margin-bottom: 0.3rem;
`;

const SpecRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1.1rem 0 1.5rem;
`;

const Spec = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--color-green-wash);
  border: 1px solid rgba(184, 90, 48, 0.18);
  border-radius: var(--radius-pill);
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-ink);
  svg { color: var(--color-green); font-size: 0.78rem; }
`;

const Prose = styled.div`
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--color-ink-muted);
  white-space: pre-wrap;
`;

const FeatureList = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
  margin-top: 1.25rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.92rem;
    color: var(--color-ink);
  }
  svg { color: var(--color-green); font-size: 0.8rem; margin-top: 0.3rem; flex-shrink: 0; }

  @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }
`;

const RentTerms = styled.div`
  display: grid;
  gap: 0.45rem;
  margin: 0 0 1.5rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-band);

  div { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.9rem; }
  span { color: var(--color-ink-muted); }
  b { color: var(--color-ink); font-weight: 650; text-align: right; }
`;

const StickyEnquire = styled.div`
  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(var(--mobile-tabbar-h) + env(safe-area-inset-bottom, 0px) + 0.6rem);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.6rem 0.6rem 1rem;
  border: 1px solid var(--color-black-line-strong);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow-lift);
`;

const Aside = styled.div`
  position: sticky;
  top: calc(var(--nav-h) + 1.25rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 960px) { position: static; }
`;

const DarkNote = styled.div`
  background: var(--color-band);
  color: var(--color-on-black);
  border-radius: var(--radius-lg);
  padding: 1.35rem 1.45rem;

  h3 { color: var(--color-on-black); font-size: 1rem; margin-bottom: 0.5rem; }
  p { color: var(--color-on-black-muted); font-size: 0.9rem; line-height: 1.6; margin: 0; }
`;


const Label = styled.label`
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  margin-bottom: 0.4rem;
`;

const inputCss = `
  width: 100%;
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.9rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--color-ink);
  outline: none;
  &:focus { border-color: var(--color-green); background: #fff; }
`;
const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss}`;
const ViewingBox = styled.div`
  margin-bottom: 0.85rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-green-wash);

  .toggle { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
  .toggle input { accent-color: var(--color-green-deep); width: 17px; height: 17px; }
  .toggle svg { color: var(--color-green-deep); }
  .when { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.5rem; margin-top: 0.65rem; }
`;
const Textarea = styled.textarea`${inputCss} min-height: 90px; resize: vertical; line-height: 1.5;`;

const FormRow = styled.div` margin-bottom: 0.85rem; `;

const SubmitBtn = styled.button`
  width: 100%;
  background: var(--color-green-deep);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  padding: 0.9rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.98rem;
  cursor: pointer;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const Msg = styled.p`
  margin-top: 0.7rem;
  font-size: 0.88rem;
  color: ${(p) => (p.$error ? '#b91c1c' : 'var(--color-green-deep)')};
`;

function EnquiryForm({ listing }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [viewing, setViewing] = useState({ want: true, date: '', time: 'Any time' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }));
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      // A viewing request rides in the message, so the desk sees it first.
      const ask = viewing.want
        ? `Viewing request: ${viewing.date ? new Date(`${viewing.date}T12:00:00`).toDateString() : 'any day'}, ${viewing.time.toLowerCase()}.\n`
        : '';
      const res = await api.listings.enquire(listing.id, {
        ...form,
        message: `${ask}${form.message}`.trim(),
        viewing: viewing.want,
        preferredAt: viewing.date || null,
        preferredWindow: viewing.time,
      });
      setSent(res);
    } catch (err) {
      setError(err?.message || 'Could not send your enquiry.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Panel>
        <h3 style={{ marginBottom: '0.5rem' }}>Enquiry sent{sent.ref ? ` · ${sent.ref}` : ''}</h3>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
          Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. {listing.route === 'agent_listed'
            ? `${listing.agency_name || 'The listing agent'} has this in their inbox`
            : `Someone from the ${isRental(listing) ? 'lettings ' : ''}desk will call you`}
          {' '}about {listing.title}{viewing.want ? ' to confirm a viewing' : ''}, usually within one business day.
          Your name, email and phone are not shown on the listing.
        </p>
      </Panel>
    );
  }

  return (
    <Panel as="form" onSubmit={submit}>
      <h3 style={{ marginBottom: '0.3rem' }}>{isRental(listing) ? 'Ask about this home' : 'Enquire about this property'}</h3>
      <p style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1rem' }}>
        {listing.route === 'agent_listed'
          ? `This goes only to ${listing.agency_name || 'the listing agency'}. It is not published, and you are not given the owner’s private number.`
          : isRental(listing)
            ? 'This goes only to the EasyMoveZone lettings desk. It is not published. You are talking to EasyMoveZone, not an agent chain.'
            : 'This goes only to the EasyMoveZone desk. It is not published. You are talking to EasyMoveZone, not an agent chain.'}
      </p>
      <FormRow>
        <Label>Your name</Label>
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" required />
      </FormRow>
      <FormRow>
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" required />
      </FormRow>
      <FormRow>
        <Label>Phone</Label>
        <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Include country code" />
      </FormRow>
      <ViewingBox>
        <label className="toggle">
          <input type="checkbox" checked={viewing.want} onChange={(e) => setViewing((v) => ({ ...v, want: e.target.checked }))} />
          <FaCalendarAlt /> I’d like to view it
        </label>
        {viewing.want && (
          <div className="when">
            <Input type="date" min={new Date().toISOString().slice(0, 10)} value={viewing.date} onChange={(e) => setViewing((v) => ({ ...v, date: e.target.value }))} aria-label="Preferred viewing day" />
            <Select value={viewing.time} onChange={(e) => setViewing((v) => ({ ...v, time: e.target.value }))} aria-label="Preferred time">
              {['Any time', 'Morning', 'Afternoon', 'Evening', 'Weekend'].map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
        )}
      </ViewingBox>
      <FormRow>
        <Label>Message</Label>
        <Textarea
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder={isRental(listing)
            ? 'Anything you would like to know — power, water, parking, how rent is paid?'
            : 'Anything you would like to know — title, service charge, parking?'}
        />
      </FormRow>
      <SubmitBtn type="submit" disabled={sending}>
        {sending ? 'Sending…' : 'Send enquiry'}
      </SubmitBtn>
      {error && <Msg $error>{error}</Msg>}
    </Panel>
  );
}

const TwoUp = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0 0.6rem;
  @media (max-width: 420px) { grid-template-columns: minmax(0, 1fr); }
`;

const ConsentRow = styled.label`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  margin-bottom: 0.9rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--color-ink-muted);
  cursor: pointer;
  input { accent-color: var(--color-green-deep); width: 17px; height: 17px; margin-top: 0.15rem; flex: none; }
`;

/**
 * Apply to rent. Enough for the desk to call, book a viewing and start the
 * checks; ID documents and references are collected during vetting, not
 * uploaded here. Lands in Admin → Rentals.
 */
function RentalApplicationForm({ listing }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', occupation: '', employer: '', incomeBand: '',
    householdSize: '', moveInDate: '', idType: '', referenceName: '', referencePhone: '', message: '',
  });
  const [viewing, setViewing] = useState({ want: true, date: '', time: 'Any time' });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, fullName: f.fullName || user.name || '', email: f.email || user.email || '' }));
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!consent) { setError('Please agree to the checks so we can consider your application.'); return; }
    setSending(true);
    setError('');
    try {
      const res = await api.listings.apply(listing.id, {
        ...form,
        viewingDate: viewing.want ? viewing.date : '',
        viewingWindow: viewing.want ? viewing.time : '',
        screeningConsent: true,
      });
      setSent(res);
    } catch (err) {
      setError(err?.message || 'Could not send your application.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Panel>
        <h3 style={{ marginBottom: '0.5rem' }}>Application sent</h3>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
          Thanks{form.fullName ? `, ${form.fullName.split(' ')[0]}` : ''}. Your reference is <strong>{sent.ref}</strong>.
          {' '}{listing.route === 'agent_listed'
            ? `${listing.agency_name || 'The listing agency'} has this in their inbox`
            : 'Someone from the lettings desk will call you'}
          {' '}about {listing.title}
          {viewing.want ? ' to confirm a viewing' : ''}, usually within one business day.
          Your details are not shown on the listing.
        </p>
      </Panel>
    );
  }

  return (
    <Panel as="form" onSubmit={submit}>
      <h3 style={{ marginBottom: '0.3rem' }}>Apply to rent this home</h3>
      <p className="hidden md:block" style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1rem' }}>
        {listing.route === 'agent_listed'
          ? `One short form, sent only to ${listing.agency_name || 'the listing agency'}. They arrange the viewing. EasyMoveZone does not publish what you send.`
          : 'One short form, sent only to the EasyMoveZone lettings desk. We call you, show you round, and check references before anything is signed.'}
      </p>
      <FormRow>
        <Label>Full name</Label>
        <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="As on your ID" autoComplete="name" required />
      </FormRow>
      <TwoUp>
        <FormRow>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" required />
        </FormRow>
        <FormRow>
          <Label>Phone</Label>
          <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="080…" autoComplete="tel" required />
        </FormRow>
      </TwoUp>
      <TwoUp>
        <FormRow>
          <Label>Occupation</Label>
          <Input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="e.g. Accountant" />
        </FormRow>
        <FormRow>
          <Label>Employer</Label>
          <Input value={form.employer} onChange={(e) => set('employer', e.target.value)} placeholder="Or self-employed" />
        </FormRow>
      </TwoUp>
      <TwoUp>
        <FormRow>
          <Label>Income</Label>
          <Select value={form.incomeBand} onChange={(e) => set('incomeBand', e.target.value)} aria-label="Monthly income">
            <option value="">Prefer to discuss</option>
            {INCOME_BANDS.map((b) => <option key={b}>{b}</option>)}
          </Select>
        </FormRow>
        <FormRow>
          <Label>People moving in</Label>
          <Input type="number" min="1" max="30" value={form.householdSize} onChange={(e) => set('householdSize', e.target.value)} placeholder="e.g. 2" />
        </FormRow>
      </TwoUp>
      <TwoUp>
        <FormRow>
          <Label>Move-in date</Label>
          <Input type="date" min={today} value={form.moveInDate} onChange={(e) => set('moveInDate', e.target.value)} />
        </FormRow>
        <FormRow>
          <Label>ID you can show</Label>
          <Select value={form.idType} onChange={(e) => set('idType', e.target.value)} aria-label="ID type">
            <option value="">Choose one</option>
            {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </FormRow>
      </TwoUp>
      <ViewingBox>
        <label className="toggle">
          <input type="checkbox" checked={viewing.want} onChange={(e) => setViewing((v) => ({ ...v, want: e.target.checked }))} />
          <FaCalendarAlt /> I’d like to view it
        </label>
        {viewing.want && (
          <div className="when">
            <Input type="date" min={today} value={viewing.date} onChange={(e) => setViewing((v) => ({ ...v, date: e.target.value }))} aria-label="Preferred viewing day" />
            <Select value={viewing.time} onChange={(e) => setViewing((v) => ({ ...v, time: e.target.value }))} aria-label="Preferred time">
              {VIEWING_WINDOWS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
        )}
      </ViewingBox>
      <TwoUp>
        <FormRow>
          <Label>Reference (optional)</Label>
          <Input value={form.referenceName} onChange={(e) => set('referenceName', e.target.value)} placeholder="Employer or past landlord" />
        </FormRow>
        <FormRow>
          <Label>Their phone</Label>
          <Input type="tel" value={form.referencePhone} onChange={(e) => set('referencePhone', e.target.value)} placeholder="080…" />
        </FormRow>
      </TwoUp>
      <FormRow>
        <Label>Anything else</Label>
        <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Questions about the home, pets, parking, when you can pay…" />
      </FormRow>
      <ConsentRow>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          {listing.route === 'agent_listed'
            ? `I agree to ${listing.agency_name || 'the listing agency'} receiving these details so they can consider my application. EasyMoveZone does not publish them.`
            : 'I agree to EasyMoveZone checking my identity, employment and references for this application. These details are not published.'}
        </span>
      </ConsentRow>
      <SubmitBtn type="submit" disabled={sending || !consent}>
        {sending ? 'Sending…' : 'Send application'}
      </SubmitBtn>
      {error && <Msg $error>{error}</Msg>}
    </Panel>
  );
}

const FormSwitch = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 0.75rem;
  border-radius: 999px;
  background: var(--color-band);
  border: 1px solid var(--color-line);

  button {
    min-height: 38px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 650;
    color: var(--color-ink-muted);
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: var(--color-green-deep); color: #fff; }
`;

/**
 * A rental takes either a full application or a plain enquiry: plenty of
 * renters want to ask a question or see the place before they apply.
 */
function RentalActions({ listing }) {
  const [mode, setMode] = useState('apply');
  return (
    <div>
      <FormSwitch role="group" aria-label="Apply or ask a question">
        <button type="button" aria-pressed={mode === 'apply'} onClick={() => setMode('apply')}>Apply to rent</button>
        <button type="button" aria-pressed={mode === 'ask'} onClick={() => setMode('ask')}>Ask a question</button>
      </FormSwitch>
      {mode === 'apply' ? <RentalApplicationForm listing={listing} /> : <EnquiryForm listing={listing} />}
    </div>
  );
}

function Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.listings.get(slug)
      .then((l) => { if (active) { setListing(l); setError(''); shortlist.viewed(l); } })
      .catch((err) => { if (active) setError(err?.message || 'That property is not available.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <Section>
        <Inner>
          <Skeleton className="mb-5 h-4 w-32" />
          <DetailGrid>
            <div className="flex flex-col gap-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-72 w-full rounded-xl" />
          </DetailGrid>
        </Inner>
      </Section>
    );
  }

  // A sale listing from before the site was rentals-only reads as gone.
  if (error || !listing || !isRental(listing)) {
    return (
      <Section>
        <Inner>
          <EmptyState>
            <h3>That home is not available</h3>
            <p>It may have been let or withdrawn. Every home available to rent now is one click away.</p>
            <GreenBtn to={RENT_URL}>Browse homes to rent <FaArrowRight size={12} /></GreenBtn>
          </EmptyState>
        </Inner>
      </Section>
    );
  }

  const media = (listing.media || []).filter((m) => m.kind !== 'floorplan');
  const floorplans = (listing.media || []).filter((m) => m.kind === 'floorplan');
  const agentListed = listing.route === 'agent_listed';
  const where = [listing.area, listing.city, listing.state, listing.country].filter(Boolean).join(', ');
  const ActionForm = RentalActions;
  const actionTitle = 'Apply or ask about this home';
  const backTo = RENT_URL;

  return (
    <>
      {/* Phone: the enquiry form lives in a bottom sheet behind a pinned
          button, so the price and the way to act on it are always in view. */}
      {mobile && (
        <StickyEnquire>
          <div className="min-w-0">
            <div className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-on-black-muted)]">{agentListed ? (listing.agency_name || 'Listed by agent') : 'To rent'}</div>
            <div className="truncate font-display text-[1.05rem] font-bold text-brand-ink">{priceOf(listing)}</div>
          </div>
          <Button variant="bright" size="lg" className="shrink-0" onClick={() => setEnquireOpen(true)}>Apply <FaArrowRight size={12} /></Button>
          <Drawer open={enquireOpen} onOpenChange={setEnquireOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{actionTitle}</DrawerTitle>
                <DrawerDescription>{listing.title}</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-5 pb-8 pb-safe">
                <ActionForm listing={listing} />
              </div>
            </DrawerContent>
          </Drawer>
        </StickyEnquire>
      )}
      <Section $sm>
        <Inner>
          <Back to={backTo} onClick={(e) => { if (location.key !== 'default') { e.preventDefault(); navigate(-1); } }}>
            <FaChevronLeft size={11} /> Back to homes to rent
          </Back>

          {media.length > 0 && (
            <Gallery>
              {media.slice(0, 5).map((m, i) => (
                <div key={m.url || i}>
                  {m.kind === 'video'
                    ? <video src={publicMediaUrl(m.url)} controls preload="metadata" />
                    : <img src={publicMediaUrl(m.url)} alt={`${listing.title}, photo ${i + 1}`} loading={i ? 'lazy' : 'eager'} />}
                </div>
              ))}
            </Gallery>
          )}

          <DetailGrid>
            <div>
              <DetailHead>
                <DetailPrice>{priceOf(listing)}</DetailPrice>
                <h1>{listing.title}</h1>
                <Where><FaMapMarkerAlt /> {where || listing.country || 'Location to confirm'}</Where>
                {listing.area_slug && (
                  <AreaLink to={`${AREAS_URL}/${listing.area_slug}`}>What residents say about {listing.area || 'this area'} <FaArrowRight size={10} /></AreaLink>
                )}
                <DetailActions>
                  <SaveButton listing={listing} />
                  <ShareButtons listing={listing} />
                </DetailActions>
              </DetailHead>

              <SpecRow>
                {listing.property_type && <Spec>{listing.property_type}</Spec>}
                {listing.beds && <Spec><FaBed /> {listing.beds} bedrooms</Spec>}
                {listing.baths && <Spec><FaBath /> {listing.baths} bathrooms</Spec>}
                {listing.size_label && <Spec><FaRulerCombined /> {listing.size_label}</Spec>}
                {listing.condition_score ? <Spec><FaShieldAlt /> Condition {listing.condition_score}/100</Spec> : null}
                {listing.furnished && <Spec>{listing.furnished}</Spec>}
                {listing.available_from && <Spec><FaCalendarAlt /> Available {availableLabel(listing.available_from)}</Spec>}
                {listing.units_available > 0 && <Spec>{unitsLeft(listing.units_available)}</Spec>}
              </SpecRow>

              {(Number(listing.service_charge) > 0 || Number(listing.caution_deposit) > 0) && (
                <RentTerms>
                  <div><span>Rent</span><b>{priceOf(listing)}</b></div>
                  {Number(listing.service_charge) > 0 && <div><span>Service charge</span><b>{money(listing.service_charge, listing.currency)} / year</b></div>}
                  {Number(listing.caution_deposit) > 0 && <div><span>Caution deposit</span><b>{money(listing.caution_deposit, listing.currency)}, refundable</b></div>}
                </RentTerms>
              )}

              {listing.description && <Prose>{listing.description}</Prose>}

              {(listing.features || []).length > 0 && (
                <FeatureList>
                  {listing.features.map((f) => <li key={f}><FaCheck /> {f}</li>)}
                </FeatureList>
              )}

              {floorplans.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.7rem' }}>Floorplan</h2>
                  {floorplans.map((m, i) => (
                    <img key={m.url || i} src={publicMediaUrl(m.url)} alt={`Floorplan ${i + 1}`} style={{ width: '100%', borderRadius: 12, marginBottom: 8 }} />
                  ))}
                </div>
              )}

              {listing.lat && listing.lng && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.7rem' }}>On the map</h2>
                  <ListingMap lat={listing.lat} lng={listing.lng} title={listing.title} />
                </div>
              )}

              {listing.project_id && <ProjectSiblings listing={listing} />}
            </div>

            <Aside>
              {!mobile && <ActionForm listing={listing} />}

              {agentListed ? (
                <Panel>
                  <Label>Listed by</Label>
                  <h3 style={{ margin: '0.2rem 0 0.4rem' }}>{listing.agency_name || 'Verified agency'}</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
                    Enquiries go to this agency. EasyMoveZone verified them before the listing went live.
                  </p>
                  {listing.agency_slug && <p style={{ marginTop: '0.6rem' }}><Link to={`/agents/${listing.agency_slug}`}>View agency profile</Link></p>}
                  {listing.agency_phone && (
                    showPhone
                      ? <p style={{ marginTop: '0.55rem' }}><a href={`tel:${listing.agency_phone}`}>{listing.agency_phone}</a><br /><span style={{ fontSize: '0.82rem' }}>Office line. This is not the owner’s private number.</span></p>
                      : <p style={{ marginTop: '0.55rem' }}><button type="button" onClick={() => setShowPhone(true)} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontWeight: 650, color: 'var(--color-green-deep)', cursor: 'pointer', textDecoration: 'underline' }}>Show office number</button></p>
                  )}
                </Panel>
              ) : (
                <DarkNote>
                  <h3>Let and managed by EasyMoveZone</h3>
                  <p>
                    You deal with EasyMoveZone from the viewing to the keys. We manage the home for its owner, so rent, repairs and questions all come to one place.
                  </p>
                </DarkNote>
              )}

            </Aside>
          </DetailGrid>
        </Inner>
      </Section>
    </>
  );
}

const SiblingsHead = styled.h2`
  font-size: 1.15rem;
  margin: 2rem 0 0.9rem;
`;

/** The other unit types a developer is selling in the same project. */
function ProjectSiblings({ listing }) {
  const [others, setOthers] = useState([]);
  useEffect(() => {
    let active = true;
    api.listings.browse({ project: listing.project_id, limit: 12 })
      .then((r) => { if (active) setOthers((r.listings || []).filter((l) => l.id !== listing.id)); })
      .catch(() => {});
    return () => { active = false; };
  }, [listing.project_id, listing.id]);
  if (!others.length) return null;
  return (
    <>
      <SiblingsHead>More homes in {listing.project_name || 'this development'}</SiblingsHead>
      <Grid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
        {others.map((l) => <ListingCard key={l.id} listing={l} />)}
      </Grid>
    </>
  );
}

/**
 * Homes to rent, a home's page, the saved list, and the Renovate service page
 * (a landlord service in Manage that shares this shell). Buying and selling
 * are gone: their old addresses land on the rental grid.
 */
export default function MarketplacePage({ page }) {
  // `/renovate` is its own URL (it belongs to Manage) but shares this page's shell.
  if (page === 'renovate') return <PageShell><Renovate /></PageShell>;
  return (
    <PageShell>
      <Routes>
        <Route index element={<Browse mode="rent" />} />
        <Route path="rent" element={<LegacyListingsRedirect />} />
        <Route path="for-sale" element={<LegacyListingsRedirect />} />
        <Route path="buy" element={<LegacyListingsRedirect />} />
        <Route path="build" element={<LegacyListingsRedirect />} />
        <Route path="sell" element={<Navigate to={LIST_URL} replace />} />
        <Route path="list" element={<Navigate to={LIST_URL} replace />} />
        <Route path="saved" element={<Saved />} />
        <Route path="renovate" element={<Navigate to="/renovate" replace />} />
        <Route path=":slug" element={<Detail />} />
      </Routes>
    </PageShell>
  );
}
