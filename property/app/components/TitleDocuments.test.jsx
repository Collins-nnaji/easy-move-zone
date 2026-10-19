// @vitest-environment jsdom
import { vi, test, it, describe, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TitleDocuments, { titleDocumentsPayload } from './TitleDocuments';

const mockUpload = vi.fn();

vi.mock('../api', () => ({
  api: {
    uploadMedia: (...args) => mockUpload(...args),
    deleteMedia: () => Promise.resolve({}),
  },
}));

let latest = [];
function Harness() {
  const [docs, setDocs] = useState([]);
  latest = docs;
  return <TitleDocuments value={docs} onChange={setDocs} uploadEnabled />;
}

test('owners tick what they hold, upload it, and name anything not listed', async () => {
  // CRA resets mocks before each test, so the upload result is set here.
  mockUpload.mockResolvedValue({ blobUrl: 'https://acct.blob.core.windows.net/media/title/coo.pdf' });
  render(<Harness />);

  fireEvent.click(screen.getByLabelText(/certificate of occupancy/i));
  expect(screen.getByText(/you hold a registered title/i)).toBeInTheDocument();

  // Upload against the ticked document; the file is copied before the input is cleared.
  const file = new File(['%PDF'], 'coo.pdf', { type: 'application/pdf' });
  const input = screen.getByText(/^upload it$/i).closest('label').querySelector('input');
  fireEvent.change(input, { target: { files: [file] } });
  await waitFor(() => expect(screen.getByText('coo.pdf')).toBeInTheDocument());
  expect(mockUpload).toHaveBeenCalledWith(file, { prefix: 'title' });

  // A survey plan ticked but not uploaded is still recorded, to collect later.
  fireEvent.click(screen.getByLabelText(/survey plan/i));

  fireEvent.click(screen.getByRole('button', { name: /another document/i }));
  fireEvent.change(screen.getByPlaceholderText(/what is it called/i), { target: { value: 'Estate sub-lease' } });

  expect(titleDocumentsPayload(latest)).toEqual([
    { id: 'c_of_o', name: 'Certificate of Occupancy (C of O)', files: [{ url: 'https://acct.blob.core.windows.net/media/title/coo.pdf', name: 'coo.pdf' }] },
    { id: 'survey_plan', name: 'Survey plan', files: [] },
    { id: 'other', name: 'Estate sub-lease', files: [] },
  ]);

  // Unticking drops it.
  fireEvent.click(screen.getByLabelText(/survey plan/i));
  expect(titleDocumentsPayload(latest).map((d) => d.id)).toEqual(['c_of_o', 'other']);
});
