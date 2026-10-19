/**
 * EasyMoveZone Upgrade — client-side catalog for the home renovation / upgrade layer.
 * Service ids & size bands mirror server/renovationCatalog.js (server is the source
 * of truth for Nigeria/NGN indicative pricing; this drives the UI). Other
 * markets receive a locally scoped quote after review.
 */

export const RENOVATION_SERVICES = [
  { id: 'solar', name: 'Solar & Inverter', emoji: '☀️', blurb: 'Panels, inverter and battery backup for reliable, lower-cost power.' },
  { id: 'pool', name: 'Swimming Pool', emoji: '🏊', blurb: 'Build a new pool or refurbish an existing one.' },
  { id: 'borehole', name: 'Borehole & Water', emoji: '💧', blurb: 'Drilling, pumps, treatment and overhead storage.' },
  { id: 'roofing', name: 'Roofing', emoji: '🏠', blurb: 'Re-roofing, leak repairs and long-span / stone-coated upgrades.' },
  { id: 'remodel', name: 'Kitchen / Bathroom', emoji: '🛁', blurb: 'Full refit of fittings, tiling, plumbing and finishes.' },
  { id: 'security', name: 'Security & CCTV', emoji: '📹', blurb: 'CCTV, access control, electric fencing and smart security.' },
  { id: 'power', name: 'Generator & Power', emoji: '⚡', blurb: 'Generator install, changeover panels and distribution.' },
  { id: 'painting', name: 'Painting & Finishes', emoji: '🎨', blurb: 'Interior/exterior painting, POP ceilings and screeding.' },
  { id: 'fencing', name: 'Fencing & Landscaping', emoji: '🌳', blurb: 'Perimeter fencing, gates, interlocking and landscaping.' },
  { id: 'extension', name: 'Extension / Renovation', emoji: '🧱', blurb: 'Room additions, BQ builds and whole-property renovations.' },
  { id: 'other', name: 'Other Upgrade', emoji: '✨', blurb: 'Something else in mind? Tell us and we\'ll scope it.' },
];

export const SIZE_BANDS = [
  { id: 'small', label: 'Small (flat, 1–2 bedrooms)' },
  { id: 'medium', label: 'Medium (3–4 bedroom home)' },
  { id: 'large', label: 'Large (duplex, estate or commercial)' },
];

export const INSPECTION_WINDOWS = [
  'Morning (8am–12pm)',
  'Afternoon (12pm–4pm)',
  'Evening (4pm–7pm)',
];

/** Inspections can be booked anywhere in Nigeria (36 states + FCT). */
export { NIGERIAN_STATES } from './nigeria';

export const STATUS_LABEL = {
  new: 'Received',
  reviewing: 'In review',
  inspection_booked: 'Inspection booked',
  inspected: 'Inspected',
  quoted: 'Quote ready',
  accepted: 'Accepted',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Ordered lifecycle for the customer-facing progress tracker. */
export const STATUS_STEPS = [
  { id: 'new', label: 'Request received' },
  { id: 'inspection_booked', label: 'Inspection booked' },
  { id: 'quoted', label: 'Quote issued' },
  { id: 'in_progress', label: 'Work in progress' },
  { id: 'completed', label: 'Completed' },
];

export const SERVICE_BY_ID = Object.fromEntries(RENOVATION_SERVICES.map((s) => [s.id, s]));

export const RENOVATE_URL = '/renovate';
