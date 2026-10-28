// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { currentSection } from './ConsoleShell';
import {
  CONSOLE_NAV, TENANT_NAV, AGENT_NAV, AGENT_APPLY_NAV, isConsolePath, navItemTarget, navItemLabel, REAL_ESTATE_NAV_ITEMS,
  legacyPortalPath, MANAGE_URL, TENANT_URL, AGENT_URL, AGENT_APPLY_URL,
} from '../config/platform';

// vi.mock is hoisted above the imports, so the auth client never loads.
vi.mock('../auth', () => ({ auth: { getSession: () => Promise.resolve(null) } }));

const label = (nav, path) => currentSection(nav, path)?.label;

test('owner sub-pages light the section they belong to', () => {
  expect(label(CONSOLE_NAV, '/portal/landlord/dashboard')).toBe('Overview');
  expect(label(CONSOLE_NAV, '/portal/landlord/journeys')).toBe('Overview');
  expect(label(CONSOLE_NAV, '/portal/landlord/money/finance')).toBe('Money');
  expect(label(CONSOLE_NAV, '/portal/landlord/operations/maintenance')).toBe('Operations');
  expect(label(CONSOLE_NAV, '/portal/landlord/account/support')).toBe('Account');
});

test('the tenant Overview does not claim every /tenant path', () => {
  expect(label(TENANT_NAV, '/portal/tenant')).toBe('Overview');
  expect(label(TENANT_NAV, '/portal/tenant/applications')).toBe('Overview');
  expect(label(TENANT_NAV, '/portal/tenant/rent/paid')).toBe('Rent');
  expect(label(TENANT_NAV, '/portal/tenant/requests/new')).toBe('Requests');
  expect(label(TENANT_NAV, '/portal/tenant/home/documents')).toBe('My home');
});

test('every portal lives under /portal and is chrome-free, and signed in Manage becomes My portal', () => {
  expect(isConsolePath('/portal/landlord/dashboard')).toBe(true);
  expect(isConsolePath('/portal/tenant')).toBe(true);
  expect(isConsolePath('/portal/agent')).toBe(true);
  expect(isConsolePath('/portal/agent/listings')).toBe(true);
  expect(isConsolePath('/portal/agent/apply')).toBe(true);
  expect(isConsolePath('/manage')).toBe(false);
  expect(isConsolePath('/agents')).toBe(false);
  const manage = REAL_ESTATE_NAV_ITEMS.find((i) => i.to === '/manage');
  expect(navItemTarget(manage, true)).toBe('/portal');
  expect(navItemTarget(manage, false)).toBe('/manage');
  expect(navItemLabel(manage, true)).toBe('My portal');
  expect(navItemLabel(manage, false)).toBe('Let');
});

test('the portal switcher tells portals you use from ones you could start', async () => {
  const { portalAccess } = await import('./usePortalAccess');
  expect(portalAccess({ owner: 2, tenant: 0, applicant: 0 }, null)).toEqual({ owner: 'active', tenant: 'none', agent: 'none' });
  expect(portalAccess({ owner: 0, tenant: 0, applicant: 1 }, { membership: { verification_status: 'pending' } }))
    .toEqual({ owner: 'none', tenant: 'applied', agent: 'pending' });
  expect(portalAccess({ tenant: 1 }, { membership: { verification_status: 'verified' } }))
    .toEqual({ owner: 'none', tenant: 'active', agent: 'active' });
  expect(portalAccess(null, { membership: { verification_status: 'suspended' } })).toEqual({ owner: 'none', tenant: 'none', agent: 'none' });
});

test('every portal section has a one-line hint for the sidebar', () => {
  for (const item of [...CONSOLE_NAV, ...TENANT_NAV, ...AGENT_NAV, ...AGENT_APPLY_NAV]) expect(item.hint).toBeTruthy();
});

test('the three portals share one root', () => {
  expect(MANAGE_URL).toBe('/portal/landlord/dashboard');
  expect(TENANT_URL).toBe('/portal/tenant');
  expect(AGENT_URL).toBe('/portal/agent');
  expect(AGENT_APPLY_URL).toBe('/portal/agent/apply');
});

test('old portal addresses map onto /portal, and public pages are left alone', () => {
  expect(legacyPortalPath('/manage/dashboard')).toBe('/portal/landlord/dashboard');
  expect(legacyPortalPath('/manage/operations/maintenance')).toBe('/portal/landlord/operations/maintenance');
  expect(legacyPortalPath('/tenant')).toBe('/portal/tenant');
  expect(legacyPortalPath('/tenant/join/abc')).toBe('/portal/tenant/join/abc');
  expect(legacyPortalPath('/agent')).toBe('/portal/agent');
  expect(legacyPortalPath('/agent/apply')).toBe('/portal/agent/apply');
  expect(legacyPortalPath('/manage')).toBeNull();
  expect(legacyPortalPath('/agents')).toBeNull();
  expect(legacyPortalPath('/agents/acme')).toBeNull();
  expect(legacyPortalPath('/tenants-guide')).toBeNull();
  expect(legacyPortalPath('/portal/tenant')).toBeNull();
});
