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
  const manage = REAL_ESTATE_NAV_ITEMS.find((i) => i.to === '/manage');
  expect(navItemTarget(manage, true)).toBe('/portal');
  expect(navItemTarget(manage, false)).toBe('/manage');
  expect(navItemLabel(manage, true)).toBe('My portal');
  expect(navItemLabel(manage, false)).toBe('Manage');
});
