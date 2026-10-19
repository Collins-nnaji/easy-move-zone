// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ConfirmListingPage from './ConfirmListingPage';

const mockSubmit = vi.fn(() => Promise.resolve({ success: true }));

vi.mock('../api', () => ({
  api: {
    listings: {
      confirm: {
        get: () => Promise.resolve({
          kind: 'listing',
          expiresAt: '2026-10-21T00:00:00Z',
          owner: { name: 'Ada Eze', email: 'ada@example.com', phone: '08031234567' },
          listing: {
            id: 7, title: '4-bed duplex', address: '5 Admiralty Way', intent: 'private',
            guide_price: '120000000', media: [],
          },
        }),
        submit: (...args) => mockSubmit(...args),
      },
    },
  },
}));

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/listings/confirm/tok123']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/listings/confirm/:token" element={<ConfirmListingPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('the owner signs in their own name, and publishing needs its own box', async () => {
  renderPage();
  await screen.findByDisplayValue('4-bed duplex');

  // The signature is typed by the owner, never prefilled from what we entered.
  const signature = screen.getByPlaceholderText('Your full name');
  expect(signature).toHaveValue('');

  const send = screen.getByRole('button', { name: /sign and send for review/i });
  const [owner, agree, publish] = screen.getAllByRole('checkbox');
  expect(publish).not.toBeChecked();

  fireEvent.click(owner);
  fireEvent.click(agree);
  fireEvent.change(signature, { target: { value: 'Adaeze Eze' } });
  // "Sell it for me" lists the property publicly, so the publish box is required.
  expect(send).toBeDisabled();

  fireEvent.click(publish);
  expect(send).toBeEnabled();
  fireEvent.click(send);

  expect(await screen.findByText(/it is signed/i)).toBeInTheDocument();
  expect(mockSubmit).toHaveBeenCalledWith('tok123', expect.objectContaining({
    consentName: 'Adaeze Eze', ownerConfirmed: true, consent: true, publishConsent: true, intent: 'private',
  }));
});
