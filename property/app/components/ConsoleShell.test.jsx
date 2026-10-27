// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { currentSection } from './ConsoleShell';
import { CONSOLE_NAV, TENANT_NAV, isConsolePath, navItemTarget, navItemLabel, REAL_ESTATE_NAV_ITEMS } from '../config/platform';

// vi.mock is hoisted above the imports, so the auth client never loads.
vi.mock('../auth', () => ({ auth: { getSession: () => Promise.resolve(null) } }));

const label = (nav, path) => currentSection(nav, path)?.label;

test('owner sub-pages light the section they belong to', () => {
  expect(label(CONSOLE_NAV, '/manage/dashboard')).toBe('Overview');
  expect(label(CONSOLE_NAV, '/manage/journeys')).toBe('Overview');
  expect(label(CONSOLE_NAV, '/manage/money/finance')).toBe('Money');
  expect(label(CONSOLE_NAV, '/manage/operations/maintenance')).toBe('Operations');
  expect(label(CONSOLE_NAV, '/manage/account/support')).toBe('Account');
});

test('the tenant Overview does not claim every /tenant path', () => {
  expect(label(TENANT_NAV, '/tenant')).toBe('Overview');
  expect(label(TENANT_NAV, '/tenant/applications')).toBe('Overview');
  expect(label(TENANT_NAV, '/tenant/rent/paid')).toBe('Rent');
  expect(label(TENANT_NAV, '/tenant/requests/new')).toBe('Requests');
  expect(label(TENANT_NAV, '/tenant/home/documents')).toBe('My home');
});

test('both portals are chrome-free, and signed in Manage becomes My portal', () => {
  expect(isConsolePath('/manage/dashboard')).toBe(true);
  expect(isConsolePath('/tenant')).toBe(true);
  expect(isConsolePath('/tenants-guide')).toBe(false);
  expect(isConsolePath('/manage')).toBe(false);
  expect(isConsolePath('/agent')).toBe(true);
  expect(isConsolePath('/agent/listings')).toBe(true);
  expect(isConsolePath('/agent/apply')).toBe(false);
  const manage = REAL_ESTATE_NAV_ITEMS.find((i) => i.to === '/manage');
  expect(navItemTarget(manage, true)).toBe('/portal');
  expect(navItemTarget(manage, false)).toBe('/manage');
  expect(navItemLabel(manage, true)).toBe('My portal');
  expect(navItemLabel(manage, false)).toBe('Manage');
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
  for (const item of [...CONSOLE_NAV, ...TENANT_NAV]) expect(item.hint).toBeTruthy();
});
