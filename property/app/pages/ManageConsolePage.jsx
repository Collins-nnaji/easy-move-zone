import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FaRegClock } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import SignInGate from '../components/SignInGate';
import ConsoleShell from '../components/ConsoleShell';
import {
  Overview, PortfolioSection, PaymentsOut, Finance, Tenancies, Maintenance, Documents,
  Settings, Card, Empty, Notice, PropertySelect, LettingActivity,
} from './manage-sections';
import { AddPropertySection, MyPropertiesSection } from './manage-add';
import ManageOnboarding from './manage-onboarding';
import ManageConsult from './manage-consult';
import JourneysSection from './manage-journeys';
import { PlanSection, ConsultationsList } from './hub-sections';
import {
  CONSOLE_NAV, MANAGE_URL, MANAGE_ADD_URL, MANAGE_ONBOARDING_URL,
  MANAGE_JOURNEYS_URL, MANAGE_DOCUMENTS_URL,
} from '../config/platform';

/**
 * EasyMoveZone Manage — a portal of its own.
 *
 * Signed in, the console leaves the public site's chrome behind. The sidebar
 * lists the four sections — Overview, Money, Operations, Account — and each
 * section's views are tabs in its page header: Overview (dashboard,
 * properties, journeys), Money (collections,
 * statements), Operations (tenancies, maintenance, documents) and Account
 * (payment details, plan, talk to a manager). The shell owns the sidebar, the
 * header and the property scope; the sections render content only. The
 * tenant portal (TenantConsolePage) uses the same shell.
 *
 * Onboarding is a first-run flow: the sidebar lists it only while the owner
 * has nothing under management, and the dashboard offers to re-run it.
 *
 * Portal data is fetched once here and handed down, so switching pages is
 * instant instead of re-fetching the same roll-up per screen.
 */

/** Top-bar title and intro line per page, keyed by route path. */
const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'EasyMoveZone runs your property for you. Here is what we are doing, the money, and anything waiting on you.' },
  journeys: { title: 'Journeys', sub: 'Your lettings and renovations with us, and the next step on each.' },
  properties: { title: 'Properties', sub: 'Every property under management, and any handover still being onboarded.' },
  add: { title: 'Add a property', sub: 'Hand a property over, with the plan, the details and the management authorization.' },
  money: { title: 'Collections', sub: 'Rent collected, what we paid you, and where the rest of it went.' },
  'money/finance': { title: 'Statements', sub: 'Rent, fees and property costs over time, exportable as a statement.' },
  operations: { title: 'Tenancies', sub: 'Who is in the property and the terms. Your tenants deal only with EasyMoveZone.' },
  'operations/maintenance': { title: 'Maintenance', sub: 'Repairs we are handling, and any cost above your limit that needs your approval.' },
  'operations/documents': { title: 'Documents', sub: 'Agreements, statements and inspection reports.' },
  account: { title: 'Payment details', sub: 'Where your rent lands, and who to call when you need a person.' },
  'account/plan': { title: 'My plan', sub: 'The management plan matched to you, and what it costs.' },
  'account/support': { title: 'Talk to a manager', sub: 'Your EasyMoveZone manager runs your property. A call, a visit, or a full review — whichever you need.' },
  onboarding: { title: 'Onboarding', sub: 'Work out which plan fits your property. Run it now, or again whenever things change.' },
};

/**
 * Sections that need at least one managed property to say anything. The
 * dashboard is deliberately not one of them — it renders zeroed figures
 * instead of an empty page.
 */
const NEEDS_PROPERTY = ['money', 'money/finance', 'operations', 'operations/maintenance', 'operations/documents', 'account'];

function Console({ email, user }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const propertyId = Number.parseInt(params.get('propertyId'), 10) || null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.management.portal(email, propertyId));
      setError('');
    } catch (err) {
      setError(err?.message || 'Could not load your console.');
    } finally {
      setLoading(false);
    }
  }, [email, propertyId]);

  useEffect(() => { load(); }, [load]);

  const properties = useMemo(() => data?.properties || [], [data]);
  const hasProperties = properties.length > 0;
  const currencies = useMemo(() => [...new Set(properties.map((p) => p.currency).filter(Boolean))], [properties]);
  const pendingCount = data?.summary?.pendingApprovalCount || 0;
  const tenantRepairs = data?.summary?.openTenantRepairs || 0;
  const onboardingCount = properties.filter((p) => p.status !== 'active').length;

  // Financial totals cannot be meaningfully added across currencies. When an
  // owner has a mixed-currency portfolio, begin with one real property scope.
  useEffect(() => {
    if (data && !propertyId && currencies.length > 1 && properties[0]?.id) {
      setParams({ propertyId: String(properties[0].id) }, { replace: true });
    }
  }, [data, propertyId, currencies, properties, setParams]);

  /**
   * The scope switcher only makes sense next to data that is actually scoped,
   * and only once there is more than one property to switch between.
   */
  const scopeSwitcher = properties.length > 1 ? (
    <PropertySelect
      value={propertyId || ''}
      onChange={(e) => setParams(e.target.value ? { propertyId: e.target.value } : {}, { replace: true })}
      aria-label="Choose a property"
    >
      {currencies.length <= 1 && <option value="">All properties ({properties.length})</option>}
      {properties.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
    </PropertySelect>
  ) : null;

  /**
   * One wrapper for every sub-page so the shell renders identically whichever
   * section is in view — `key` is the route path, which is also the meta key.
   */
  const page = (key, node, { scoped = false } = {}) => {
    const meta = PAGE_META[key] || { title: 'Manage' };

    let body = node;
    if (loading && !data) body = <Card><Empty>Loading your console…</Empty></Card>;
    else if (error && !data) body = <Card><Empty>{error}</Empty></Card>;
    else if (NEEDS_PROPERTY.includes(key) && !hasProperties) {
      body = (
        <Card>
          <Empty>
            Nothing under management yet. This fills up once a property is with us. Use Add a
            property to hand one over.
          </Empty>
        </Card>
      );
    }

    return (
      <ConsoleShell
        title={meta.title}
        sub={meta.sub}
        actions={scoped ? scopeSwitcher : null}
        workspace="owner"
        nav={CONSOLE_NAV}
        primary={{ to: MANAGE_ADD_URL, label: 'Add a property' }}
        pinned={hasProperties ? [] : [{ to: MANAGE_ONBOARDING_URL, label: 'Onboarding', icon: 'onboarding' }]}
        badges={{ maintenance: pendingCount + tenantRepairs }}
      >
        {body}
      </ConsoleShell>
    );
  };

  const goOnboarding = () => navigate(MANAGE_ONBOARDING_URL);

  return (
    <Routes>
      {/* ── Overview ── */}
      <Route
        path="dashboard"
        element={page('dashboard', (
          <>
            {onboardingCount > 0 && (
              <Notice>
                <FaRegClock />
                <div>
                  {properties.length === 1
                    ? 'Your property is still being onboarded'
                    : `${onboardingCount} of your ${properties.length} properties ${onboardingCount === 1 ? 'is' : 'are'} still being onboarded`}
                  {'. '}Statements start once the tenancy and rent are in place.
                </div>
              </Notice>
            )}
            <Overview data={data} onGo={(to) => navigate(to)} onStartOnboarding={goOnboarding} />
            {data && <LettingActivity data={data} email={email} onRefresh={load} />}
          </>
        ), { scoped: true })}
      />
      <Route
        path="properties"
        element={page('properties', (
          <>
            <PortfolioSection
              email={email}
              onOpenProperty={(id) => { setParams({ propertyId: id }, { replace: true }); navigate(MANAGE_URL); }}
            />
            <MyPropertiesSection user={user} highlightRef={params.get('ref')} />
          </>
        ))}
      />
      <Route path="journeys" element={page('journeys', <JourneysSection email={email} user={user} />)} />
      {/* Buying and selling are gone; their old tabs land on Journeys. */}
      <Route path="verifications" element={<Navigate to={MANAGE_JOURNEYS_URL} replace />} />
      <Route path="offers" element={<Navigate to={MANAGE_JOURNEYS_URL} replace />} />
      <Route path="add" element={page('add', <AddPropertySection user={user} />)} />

      {/* ── Money ── */}
      <Route path="money" element={page('money', data && <PaymentsOut data={data} email={email} onRefresh={load} />, { scoped: true })} />
      <Route path="money/finance" element={page('money/finance', data && <Finance data={data} email={email} propertyId={propertyId} />, { scoped: true })} />

      {/* ── Operations ── */}
      <Route path="operations" element={page('operations', data && (
        <>
          <Tenancies data={data} />
          <DocLink to={MANAGE_DOCUMENTS_URL}>Property documents</DocLink>
        </>
      ), { scoped: true })} />
      <Route path="operations/maintenance" element={page('operations/maintenance', data && <Maintenance data={data} email={email} onRefresh={load} />, { scoped: true })} />
      <Route path="operations/documents" element={page('operations/documents', data && <Documents data={data} />, { scoped: true })} />

      {/* ── Account ── */}
      <Route path="account" element={page('account', data && <Settings data={data} email={email} propertyId={propertyId} onRefresh={load} />, { scoped: true })} />
      <Route path="account/plan" element={page('account/plan', <><PlanSection email={email} /><ConsultationsList email={email} /><ManageConsult /></>)} />
      <Route path="account/support" element={page('account/support', <><PlanSection email={email} /><ConsultationsList email={email} /><ManageConsult /></>)} />

      {/* ── First-run onboarding ── */}
      <Route path="onboarding" element={page('onboarding', <ManageOnboarding />)} />

      <Route path="*" element={<Navigate to={MANAGE_URL} replace />} />
    </Routes>
  );
}

const DocLink = styled(Link)`
  display: inline-block;
  margin-top: 0.85rem;
  font-weight: 650;
  color: var(--color-green-deep);
`;


/**
 * Signed out, there is no portal yet: the page stays inside the public site
 * (navbar and tab bar included) and shows a plain panel with the sign-in
 * card, rather than an empty sidebar behind SignInGate's dimming `filter`.
 */
const GateWrap = styled.div`
  min-height: calc(100vh - var(--nav-h));
  background: var(--color-bg-panel);
  display: flex;
  justify-content: center;
  padding: 3rem 1.25rem 5rem;
`;

const GateInner = styled.div`
  width: 100%;
  max-width: 720px;
`;

export default function ManageConsolePage() {
  const { user } = useAuth();

  if (!user?.email) {
    return (
      <GateWrap>
        <GateInner>
          <SignInGate title="Sign in to your owner console" action="see your rent, statements and payments">
            <Card>
              <Empty>
                Your dashboard, properties, rent, repairs and statements live here. Sign in to open them.
              </Empty>
            </Card>
          </SignInGate>
        </GateInner>
      </GateWrap>
    );
  }

  return <Console email={user.email} user={user} />;
}
