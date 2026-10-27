// @vitest-environment jsdom
import { vi, test, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Link, Routes, Route, useLocation } from 'react-router-dom';
import PortalEntryPrompt, { isPortalPath } from './PortalEntryPrompt';

let mockUser = { email: 'ada@example.com' };
vi.mock('../AuthContext', () => ({ useAuth: () => ({ user: mockUser }) }));

function Where() {
  return <div data-testid="where">{useLocation().pathname}</div>;
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PortalEntryPrompt />
      <Link to="/portal">My portal</Link>
      <Link to="/listings/rent">Rent</Link>
      <Routes><Route path="*" element={<Where />} /></Routes>
    </MemoryRouter>
  );
}

beforeEach(() => { mockUser = { email: 'ada@example.com' }; });

test('portal paths are the portal, the owner and tenant consoles, but not an invite link', () => {
  expect(isPortalPath('/portal')).toBe(true);
  expect(isPortalPath('/portal/landlord/dashboard')).toBe(true);
  expect(isPortalPath('/portal/tenant/rent')).toBe(true);
  expect(isPortalPath('/portal/agent/apply')).toBe(true);
  expect(isPortalPath('/portal/tenant/join/abc')).toBe(false);
  expect(isPortalPath('/manage')).toBe(false);
  expect(isPortalPath('/listings')).toBe(false);
});

test('signed in, a link into the portal asks first; No stays, Yes goes', () => {
  renderAt('/listings');
  fireEvent.click(screen.getByRole('link', { name: 'My portal' }));
  expect(screen.getByRole('dialog', { name: /open your portal/i })).toBeInTheDocument();
  expect(screen.getByTestId('where')).toHaveTextContent('/listings');

  fireEvent.click(screen.getByRole('button', { name: /no, stay here/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByTestId('where')).toHaveTextContent('/listings');

  fireEvent.click(screen.getByRole('link', { name: 'My portal' }));
  fireEvent.click(screen.getByRole('button', { name: /yes, open my portal/i }));
  expect(screen.getByTestId('where')).toHaveTextContent('/portal');
});

test('other links, signed-out visitors and moves inside the portal never ask', () => {
  const { unmount } = renderAt('/listings');
  fireEvent.click(screen.getByRole('link', { name: 'Rent' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByTestId('where')).toHaveTextContent('/listings/rent');
  unmount();

  mockUser = null;
  const signedOut = renderAt('/listings');
  fireEvent.click(screen.getByRole('link', { name: 'My portal' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByTestId('where')).toHaveTextContent('/portal');
  signedOut.unmount();

  mockUser = { email: 'ada@example.com' };
  renderAt('/portal/landlord/dashboard');
  fireEvent.click(screen.getByRole('link', { name: 'My portal' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
