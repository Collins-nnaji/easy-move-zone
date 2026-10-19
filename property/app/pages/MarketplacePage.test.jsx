// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MarketplacePage from './MarketplacePage';

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const mockBrowse = vi.fn(() => Promise.resolve({ listings: [], total: 0 }));
const mockGet = vi.fn();

vi.mock('../api', () => ({
  publicMediaUrl: (u) => u,
  api: {
    engineHealth: () => Promise.resolve({ online: true }),
    getMediaConfig: () => new Promise(() => {}),
    listings: {
      browse: (...args) => mockBrowse(...args),
      get: (...args) => mockGet(...args),
      facets: () => Promise.resolve({ countries: [], currencies: [], states: [], types: [], beds: [] }),
    },
    renovations: {
      mine: () => Promise.resolve([]),
      estimate: () => Promise.resolve(null),
    },
  },
}));

/**
 * jsdom has no matchMedia. The filter control only exists on phones (desktop
 * shows the filters inline), so this test runs as a 390px-wide viewport.
 */
function mockViewport(mobile) {
  window.matchMedia = (query) => ({
    matches: mobile && /max-width:\s*(720|960)px/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

function renderProperties(path) {
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/listings/*" element={<MarketplacePage />} />
        <Route path="/renovate" element={<MarketplacePage page="renovate" />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('service pages carry no second tab row under the navbar', () => {
  renderProperties('/listings/build');

  expect(screen.getByText(/manage your building process/i)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /^for sale$/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /^renovate$/i })).not.toBeInTheDocument();
});

test('keeps the for-sale page concise and puts filters behind one control', async () => {
  mockViewport(true);
  renderProperties('/listings');

  expect(screen.getByRole('heading', { name: /^properties for sale\.$/i })).toBeInTheDocument();
  await screen.findByRole('heading', { name: /no properties on the market/i });
  const filterToggle = document.querySelector('button[aria-controls="property-filters"]');
  expect(filterToggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(filterToggle);
  expect(filterToggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.queryByRole('link', { name: /browse approved properties/i })).not.toBeInTheDocument();
  mockViewport(false);
});

test('puts both seller routes on the Sell page', () => {
  renderProperties('/listings/sell');

  expect(screen.getByText(/^sell your property\.$/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /list it for sale/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sell it to easymovezone/i })).toBeInTheDocument();
});

test('Buy, Rent and Sell are three modes of one Property page', () => {
  renderProperties('/listings/sell');

  const modes = screen.getByRole('navigation', { name: /buy, rent or sell/i });
  expect(within(modes).getByRole('link', { name: /^sell$/i })).toHaveAttribute('aria-current', 'page');
  expect(within(modes).getByRole('link', { name: /^buy$/i })).toHaveAttribute('href', '/listings');
  expect(within(modes).getByRole('link', { name: /^rent$/i })).toHaveAttribute('href', '/listings/rent');
});

const RENTAL = {
  id: 7, slug: '3-bed-flat-lekki-to-rent-bvl-1', title: '3-bed flat Lekki', listing_type: 'rent',
  price: '6500000', currency: 'NGN', rent_frequency: 'annual', route: 'owner_listed',
  area: 'Lekki Phase 1', state: 'Lagos', beds: '3', baths: '3', media: [], features: [],
  service_charge: '500000', caution_deposit: '650000', available_from: '2030-01-01',
  valuation_low: '1', valuation_high: '2',
};

test('the Rent page asks the API for rentals and prices them per year', async () => {
  mockBrowse.mockImplementationOnce(() => Promise.resolve({ listings: [RENTAL], total: 1 }));
  renderProperties('/listings/rent');

  expect(screen.getByRole('heading', { name: /^homes to rent\.$/i })).toBeInTheDocument();
  expect(await screen.findByText('3-bed flat Lekki')).toBeInTheDocument();
  expect(mockBrowse).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'rent' }));
  expect(screen.getByText(/to rent · managed by easymovezone/i)).toBeInTheDocument();
  expect(screen.getByText(/\/ year$/)).toBeInTheDocument();
  const modes = screen.getByRole('navigation', { name: /buy, rent or sell/i });
  expect(within(modes).getByRole('link', { name: /^rent$/i })).toHaveAttribute('aria-current', 'page');
  expect(within(modes).getByRole('link', { name: /^buy$/i })).not.toHaveAttribute('aria-current');
});

test('a rental opens with an application form, not a buyer enquiry', async () => {
  mockGet.mockImplementationOnce(() => Promise.resolve(RENTAL));
  renderProperties(`/listings/${RENTAL.slug}`);

  expect(await screen.findByRole('heading', { name: /apply to rent this home/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /enquire about this property/i })).not.toBeInTheDocument();
  expect(screen.getByText(/caution deposit/i)).toBeInTheDocument();
  expect(screen.queryByText(/our valuation range/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send application/i })).toBeDisabled();
});

test('a rental also takes a plain enquiry', async () => {
  mockGet.mockImplementationOnce(() => Promise.resolve(RENTAL));
  renderProperties(`/listings/${RENTAL.slug}`);

  fireEvent.click(await screen.findByRole('button', { name: /ask a question/i }));
  expect(screen.getByRole('heading', { name: /ask about this home/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send enquiry/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /send application/i })).not.toBeInTheDocument();
});

test('the new-listing alert form is not shown again once someone has signed up', async () => {
  window.localStorage.setItem('bv.alerts.v1', JSON.stringify({ sale: { email: 'ada@example.com', at: 1 } }));
  renderProperties('/listings');

  expect(await screen.findByText(/we will email ada@example.com/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /notify me/i })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^change$/i }));
  expect(screen.getByRole('button', { name: /notify me/i })).toBeInTheDocument();
  window.localStorage.removeItem('bv.alerts.v1');
});

test('signing up for Buy alerts still offers Rent alerts', async () => {
  window.localStorage.setItem('bv.alerts.v1', JSON.stringify({ sale: { email: 'ada@example.com', at: 1 } }));
  renderProperties('/listings/rent');

  expect(await screen.findByRole('button', { name: /notify me/i })).toBeInTheDocument();
  window.localStorage.removeItem('bv.alerts.v1');
});

test('keeps the new renovation request public', () => {
  renderProperties('/renovate');

  expect(screen.getByText(/choose the work you need/i)).toBeInTheDocument();
  expect(screen.queryByText(/sign in to start/i)).not.toBeInTheDocument();
});
