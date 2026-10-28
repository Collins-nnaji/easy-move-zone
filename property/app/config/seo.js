import { AGENT_APPLY_URL, legacyPortalPath } from './platform';
import STARTER_AREAS from '../../server/data/areas.json';

/*
 * Page titles and descriptions, by path. Used client-side by Seo.jsx as you
 * navigate, and server-side by app/property-app/page.tsx so the first HTML a
 * crawler gets already carries the right title.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://easymovezone.com').replace(/\/$/, '');
export const DEFAULT_IMAGE = `${SITE_URL}/media/hero-poster.jpg`;

export const PUBLIC_META = [
  { match: (p) => p === '/', title: 'EasyMoveZone | Rent a home with confidence', description: 'Homes to rent, checked before they go live. Check any landlord or rental before you pay, see what residents say about an area, and move in with our movers.' },
  { match: (p) => p === '/listings', title: 'Homes to rent | EasyMoveZone', description: 'Rent a home managed by EasyMoveZone or listed by a verified agent. Apply once: we arrange the viewing, check references and handle the paperwork.' },
  { match: (p) => p === '/check', title: 'Check a rental before you pay | EasyMoveZone', description: 'Check that a landlord or agent is real and allowed to let the home, that the home matches the advert, and that the tenancy agreement and rent are fair, before any money moves.' },
  { match: (p) => p === '/list' || p === '/listings/list', title: 'List a home to rent | EasyMoveZone', description: 'Letting agents post their own homes to rent on EasyMoveZone. Landlords can have us find the tenant, or run the whole tenancy.' },
  { match: (p) => p === '/renovate', title: 'Renovate a rental property | EasyMoveZone', description: 'Between tenants or to let for more: request an inspection and manage renovation scope, costs, milestones and evidence through EasyMoveZone.' },
  { match: (p) => p === '/listings/saved', title: 'Saved homes | EasyMoveZone', description: 'The homes to rent you have saved on EasyMoveZone.' },
  { match: (p) => p === '/areas', title: 'Neighbourhoods: what it is like to live there | EasyMoveZone', description: 'Residents rate power, water, flooding, roads and safety in Lagos, Abuja and Port Harcourt areas. See typical rents, the commute and what is nearby before you rent.' },
  ...STARTER_AREAS.map((a) => ({
    match: (p) => p === `/areas/${a.slug}`,
    title: `Living in ${a.name}, ${a.city}: what residents say | EasyMoveZone`,
    description: `${a.blurb} Residents rate the light, water, flooding, roads and security in ${a.name}, with typical rents and the commute.`,
  })),
  { match: (p) => p.startsWith('/areas/'), title: 'Neighbourhood guide from residents | EasyMoveZone', description: 'What residents say about this area: power, water, flooding, safety and transport, with typical rents and location tools.' },
  { match: (p) => p === '/contact', title: 'Contact EasyMoveZone', description: 'Send EasyMoveZone a message about renting a home, checking a rental, letting or managing a property, or moving.' },
  { match: (p) => p === '/help', title: 'Help and FAQs | EasyMoveZone', description: 'Answers to common questions about renting, checking a rental, and letting and managing property with EasyMoveZone.' },
  { match: (p) => p === '/agents', title: 'Find an agent | EasyMoveZone', description: 'Browse verified letting agencies with homes to rent on EasyMoveZone.' },
  { match: (p) => p.startsWith('/agents/'), title: 'Letting agency | EasyMoveZone', description: 'Live listings and office details for a verified agency on EasyMoveZone.' },
  { match: (p) => p === AGENT_APPLY_URL, title: 'List as an agent | EasyMoveZone', description: 'Apply to post homes to rent on EasyMoveZone as a verified letting agency.' },
  { match: (p) => p.startsWith('/listings/'), title: 'Home to rent | EasyMoveZone', description: 'A home to rent, checked and approved by EasyMoveZone, with the rent, charges and a clear way to apply.' },
  { match: (p) => p === '/manage', title: 'Property management and lettings | EasyMoveZone', description: 'We let and manage your property for you: tenants found and checked, rent collected, repairs and inspections handled, with statements you can check.' },
  { match: (p) => p === '/consult', title: 'Talk to a rental adviser | EasyMoveZone', description: 'Tell EasyMoveZone whether you need help renting, letting, managing or renovating a property, and receive a written next-step plan.' },
  { match: (p) => p === '/moving', title: 'Moving: home, office & heavy items | EasyMoveZone', description: 'Move your home, office or heavy items. Get a price, book a truck, movers and packing help, and track your move in Lagos, Abuja and Port Harcourt.' },
  { match: (p) => p === '/moving/book', title: 'Book a move | EasyMoveZone', description: 'Tell us what is moving, add photos and both addresses, and get a price range now and a reviewed quote before you pay.' },
  { match: (p) => p === '/moving/prices', title: 'Moving prices | EasyMoveZone', description: 'Estimate the cost of a home, office or bulky-item move in Lagos, Abuja or Port Harcourt before sharing your details.' },
  { match: (p) => p === '/moving/track', title: 'Track a move | EasyMoveZone', description: 'Follow your move by reference — crew, arrival and delivery stages — and manage quotes, payments and checklists.' },
  { match: (p) => p === '/moving/crew', title: 'Movers, truck owners and partners | EasyMoveZone', description: 'Join the EasyMoveZone crew hub as a mover or vehicle owner, or arrange repeat deliveries for your shop, agency or office.' },
  { match: (p) => p === '/moving/help', title: 'Moving help, FAQs and checklists | EasyMoveZone', description: 'Answers on pricing, payments, cancellations and cover, plus step-by-step moving checklists.' },
  { match: (p) => p === '/moving/terms', title: 'Moving terms of service | EasyMoveZone', description: 'The terms for booking home moves, office relocations and bulky-item transport with EasyMoveZone.' },
  { match: (p) => p === '/moving/privacy', title: 'Moving privacy policy | EasyMoveZone', description: 'How EasyMoveZone handles personal information for moving bookings.' },
  { match: (p) => p === '/moving/cookies', title: 'Cookie policy | EasyMoveZone', description: 'How EasyMoveZone uses cookies.' },
  { match: (p) => p === '/privacy', title: 'Privacy policy | EasyMoveZone', description: 'How EasyMoveZone collects, uses and protects personal information.' },
  { match: (p) => p === '/terms', title: 'Terms of service | EasyMoveZone', description: 'Terms governing the use of EasyMoveZone rental services and platform.' },
];

export function isPrivatePath(pathname) {
  // The agent application is the one portal page meant to be found by search.
  if (pathname === AGENT_APPLY_URL) return false;
  return pathname === '/portal' || pathname.startsWith('/portal/') || legacyPortalPath(pathname) !== null || pathname === '/my-hub' || pathname === '/profile' || pathname === '/admin' || pathname.startsWith('/auth') || pathname === '/moving/checkout';
}

export function metaForPath(pathname) {
  const page = PUBLIC_META.find((item) => item.match(pathname));
  return {
    title: page?.title || 'EasyMoveZone | Rent a home with confidence',
    description: page?.description || 'Rent a home, check a rental before you pay, let and manage property, and move home, with clear evidence and control.',
    noIndex: isPrivatePath(pathname),
    canonicalPath: pathname.replace(/\/+$/, '') || '/',
  };
}
