// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OfferPage from './OfferPage';

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../api', () => ({
  api: {
    engineHealth: () => Promise.resolve({ online: true }),
    getMediaConfig: () => new Promise(() => {}),
  },
}));

function renderEasyCheck(path) {
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/verify/*" element={<OfferPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('renders photo analysis on its own Verify URL', async () => {
  renderEasyCheck('/verify/photo-scan');

  expect(screen.getByText(/upload property photos for a fast read/i)).toBeInTheDocument();
  expect(screen.queryByText(/ready for the full check/i)).not.toBeInTheDocument();
  // One quiet link to the other tool instead of a two-tab switch.
  expect(screen.getByRole('link', { name: /need the full check\? verify the property/i })).toHaveAttribute('href', '/verify');
  expect(screen.queryByRole('link', { name: /get my offer/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /request renovation/i })).not.toBeInTheDocument();
  expect(await screen.findByText(/engine online/i)).toBeInTheDocument();
});

test('renders full verification on its own Verify URL', () => {
  renderEasyCheck('/verify');

  expect(screen.getByText(/ready for the full check/i)).toBeInTheDocument();
  expect(screen.queryByText(/upload property photos for a fast read/i)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /start with a free quick scan/i })).toHaveAttribute('href', '/verify/photo-scan');
});
