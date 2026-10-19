// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

const mockUpdateListing = vi.fn(() => Promise.resolve({}));
const mockWhoami = vi.fn(() => Promise.reject(new Error('Unauthorized')));
let mockUser = null;

vi.mock('../auth', () => ({
  auth: { signOut: vi.fn() },
  siteAuthUrl: ({ from }) => `/auth?redirect=${encodeURIComponent(from)}`,
}));
vi.mock('../components/MovingAdminSections', () => ({
  MOVING_SECTIONS: { moves: { title: 'Moves' }, crews: { title: 'Crew & vehicles' }, 'moving-enquiries': { title: 'Moving enquiries' }, 'moving-ops': { title: 'Moving marketplace operations' }, accounts: { title: 'Accounts' } },
  default: ({ section }) => <div>Moving section: {section}</div>,
}));
vi.mock('../AuthContext', () => ({ useAuth: () => ({ user: mockUser }) }));

vi.mock('../components/PassportAdmin', () => ({ default: () => <div>Passport admin</div> }));
vi.mock('../components/RenovationAdmin', () => ({ default: () => <div>Renovation admin</div> }));
vi.mock('../components/ManagementAdmin', () => ({ default: () => <div>Management admin</div> }));
vi.mock('../api', () => ({
  api: {
    admin: {
      whoami: (...args) => mockWhoami(...args),
      listBookings: () => Promise.resolve([]),
      updateBooking: () => Promise.resolve({}),
    },
    listings: {
      admin: {
        list: () => Promise.resolve([{
          id: 17,
          ref: 'BVL-TEST',
          title: 'Test property',
          owner_email: 'owner@example.com',
          status: 'reviewing',
          intent: 'buyout',
          route: 'private',
          publish_consent: false,
          currency: 'GBP',
          country: 'United Kingdom',
          enquiry_count: 0,
        }]),
        update: (...args) => mockUpdateListing(...args),
        remove: () => Promise.resolve({}),
        enquiries: () => Promise.resolve([]),
        updateEnquiry: () => Promise.resolve({}),
      },
    },
  },
}));

beforeEach(() => {
  mockUpdateListing.mockClear();
});

afterEach(() => {
  mockUser = null;
  mockWhoami.mockReset();
  mockWhoami.mockImplementation(() => Promise.reject(new Error('Unauthorized')));
});

/** Render the admin as a member of EasyMoveZone's admin_users allowlist. */
async function renderAsStaff(path = '/admin') {
  mockUser = { email: 'staff@easymovezone.com' };
  mockWhoami.mockImplementation(() => Promise.resolve({ actor: 'staff@easymovezone.com' }));
  render(<MemoryRouter initialEntries={[path]}><AdminPage /></MemoryRouter>);
  await screen.findByText(/staff@easymovezone\.com/i);
}

test('a signed-in member of the admin list gets straight in — there is no key to type', async () => {
  await renderAsStaff();
  expect(screen.queryByPlaceholderText(/admin key/i)).not.toBeInTheDocument();
});

test('anyone else sees the gate and is sent to sign in with an admin account', async () => {
  mockUser = { email: 'owner@example.com' };
  render(<MemoryRouter><AdminPage /></MemoryRouter>);
  expect(await screen.findByText(/not on the EasyMoveZone admin list/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in with another account/i })).toBeInTheDocument();
  expect(screen.queryByPlaceholderText(/admin key/i)).not.toBeInTheDocument();
});

test('requires an amount before an admin can issue a purchase offer', async () => {
  await renderAsStaff();
  fireEvent.click(screen.getByRole('button', { name: /^marketplace$/i }));

  expect(await screen.findByText('Test property')).toBeInTheDocument();
  const issueButton = screen.getByRole('button', { name: /issue firm offer/i });
  expect(issueButton).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
  fireEvent.change(screen.getByLabelText(/our offer/i), { target: { value: '425000' } });
  expect(issueButton).toBeEnabled();
  // Issuing a firm offer promises completion within PURCHASE_DAYS, so it asks first.
  window.confirm = vi.fn(() => true);
  fireEvent.click(issueButton);
  expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/verification are done/i));

  await waitFor(() => expect(mockUpdateListing).toHaveBeenCalledWith(
    17,
    'session',
    expect.objectContaining({ status: 'offer_made', offer_amount: '425000', currency: 'GBP' }),
  ));
});

test('shows renovation operations instead of an Insights queue', async () => {
  await renderAsStaff();
  fireEvent.click(screen.getByRole('button', { name: /^renovations$/i }));

  expect(screen.getByText('Renovation admin')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /insights/i })).not.toBeInTheDocument();
});

test('exposes managed-property operations in the admin console', async () => {
  await renderAsStaff();
  fireEvent.click(screen.getByRole('button', { name: /^management$/i }));

  expect(screen.getByText('Management admin')).toBeInTheDocument();
});

test('moving is run from the same admin, and a section opens from the URL', async () => {
  await renderAsStaff('/admin?section=crews');
  expect(screen.getByText('Moving section: crews')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^moves$/i }));
  expect(screen.getByText('Moving section: moves')).toBeInTheDocument();
});
