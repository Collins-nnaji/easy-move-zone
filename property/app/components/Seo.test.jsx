// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Seo from './Seo';

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><Seo /></MemoryRouter>);
}

test('publishes route-specific metadata and a canonical URL', async () => {
  renderAt('/check');
  await waitFor(() => expect(document.title).toMatch(/check a rental before you pay/i));
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringMatching(/landlord or agent/i));
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://easymovezone.com/check');
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
});

test('keeps signed-in and admin routes out of search indexes', async () => {
  renderAt('/portal/landlord/dashboard');
  await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow'));
});

test('keeps the tenant portal and the portal chooser out of search indexes', async () => {
  renderAt('/portal/tenant/rent');
  await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow'));
});
