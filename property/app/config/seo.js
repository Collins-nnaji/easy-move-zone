import { PURCHASE_DAYS } from './platform';
import STARTER_AREAS from '../../server/data/areas.json';

/*
 * Page titles and descriptions, by path. Used client-side by Seo.jsx as you
 * navigate, and server-side by app/property-app/page.tsx so the first HTML a
 * crawler gets already carries the right title.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://easymovezone.com').replace(/\/$/, '');
export const DEFAULT_IMAGE = `${SITE_URL}/media/hero-poster.jpg`;

export const PUBLIC_META = [
  { match: (p) => p === '/', title: 'EasyMoveZone | Buy, sell, rent and manage property with ease', description: 'Buy verified property, sell yours, and have it let and managed for you — tenants, rent, repairs and renovation.' },
  { match: (p) => p === '/listings', title: 'Verified properties for sale | EasyMoveZone', description: 'Browse property valued, condition-checked and approved by EasyMoveZone. Every live listing has evidence behind it.' },
  { match: (p) => p === '/listings/sell', title: `Sell your property to EasyMoveZone in ${PURCHASE_DAYS} days | EasyMoveZone`, description: `We inspect your property, verify the title and make a firm offer. Accept it and we complete the purchase within ${PURCHASE_DAYS} days of verification. Or list it with us.` },
  { match: (p) => p === '/list' || p === '/listings/list', title: 'List a property | EasyMoveZone', description: 'Post a home on the EasyMoveZone portal. Agents list their own stock. Owners can sell. Letting that we run for you is a separate page.' },
  { match: (p) => p === '/listings/build', title: 'Manage your building process | EasyMoveZone', description: 'Control contractors, budgets, inspections and stage payments while EasyMoveZone manages your building project.' },
  { match: (p) => p === '/renovate', title: 'Request a managed property renovation | EasyMoveZone', description: 'Request an inspection and manage renovation scope, costs, milestones and progress evidence through EasyMoveZone.' },
  { match: (p) => p === '/listings/rent', title: 'Homes to rent, let and managed by EasyMoveZone', description: 'Rent a home managed by EasyMoveZone. Apply once — we arrange the viewing, check references and handle rent and repairs for the whole tenancy.' },
  { match: (p) => p === '/listings/saved', title: 'Saved properties | EasyMoveZone', description: 'The properties you have saved on EasyMoveZone.' },
  { match: (p) => p === '/areas', title: 'Neighbourhoods: what it is like to live there | EasyMoveZone', description: 'Residents rate power, water, flooding, roads and safety in Lagos, Abuja and Port Harcourt areas. See typical rents, the commute and what is nearby before you rent.' },
  ...STARTER_AREAS.map((a) => ({
    match: (p) => p === `/areas/${a.slug}`,
    title: `Living in ${a.name}, ${a.city}: what residents say | EasyMoveZone`,
    description: `${a.blurb} Residents rate the light, water, flooding, roads and security in ${a.name}, with typical rents and the commute.`,
  })),
  { match: (p) => p.startsWith('/areas/'), title: 'Neighbourhood guide from residents | EasyMoveZone', description: 'What residents say about this area: power, water, flooding, safety and transport, with typical rents and location tools.' },
  { match: (p) => p === '/contact', title: 'Contact EasyMoveZone', description: 'Send EasyMoveZone a message about buying, selling, verifying, letting or renovating property.' },
  { match: (p) => p === '/help', title: 'Help and FAQs | EasyMoveZone', description: 'Answers to common questions about buying, verifying, selling and letting property with EasyMoveZone.' },
  { match: (p) => p === '/agents', title: 'Find an agent | EasyMoveZone', description: 'Browse verified estate agencies listing sale and rental properties on EasyMoveZone.' },
  { match: (p) => p.startsWith('/agents/'), title: 'Estate agency | EasyMoveZone', description: 'Live listings and office details for a verified agency on EasyMoveZone.' },
  { match: (p) => p === '/agent/apply', title: 'List as an agent | EasyMoveZone', description: 'Apply to post sale and rental properties on EasyMoveZone as a verified agency.' },
  { match: (p) => p === '/mortgage' || p.startsWith('/mortgage/'), title: 'Mortgages and the National Housing Fund | EasyMoveZone', description: 'Compare the National Housing Fund, Stanbic IBTC MREIF and an Access Bank mortgage, check what you could pay, then ask EasyMoveZone to make an introduction. Not a loan offer.' },
  { match: (p) => p.startsWith('/listings/confirm/'), title: 'Confirm your listing | EasyMoveZone', description: 'Check the listing EasyMoveZone prepared for you and sign the owner authorization.' },
  { match: (p) => p.startsWith('/listings/'), title: 'Approved property | EasyMoveZone', description: 'View an approved EasyMoveZone property with verified condition, valuation evidence and a clear route to enquire.' },
  { match: (p) => p === '/verify/photo-scan', title: 'Quick property photo scan | EasyMoveZone', description: 'Upload property photos for a fast condition analysis and visible risk flags before arranging a full verification.' },
  { match: (p) => p === '/verify', title: 'Verify a property before you pay | EasyMoveZone', description: 'Order seller, title, document, location, valuation and physical checks in one Property Passport.' },
  { match: (p) => p === '/manage', title: 'Property management and lettings | EasyMoveZone', description: 'We let and manage your property on your behalf — tenants, rent collection, repairs and renovation, with statements you can check.' },
  { match: (p) => p === '/consult', title: 'Talk to a property adviser | EasyMoveZone', description: 'Tell EasyMoveZone whether you need help buying, building, renovating, renting or managing a property and receive a written next-step plan.' },
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
  { match: (p) => p === '/terms', title: 'Terms of service | EasyMoveZone', description: 'Terms governing the use of EasyMoveZone property services and platform.' },
];

export function isPrivatePath(pathname) {
  return pathname.startsWith('/manage/') || pathname === '/tenant' || pathname.startsWith('/tenant/') || pathname === '/agent' || (pathname.startsWith('/agent/') && !pathname.startsWith('/agent/apply')) || pathname === '/portal' || pathname === '/my-hub' || pathname === '/profile' || pathname === '/admin' || pathname.startsWith('/auth') || pathname.startsWith('/listings/confirm/') || pathname === '/moving/checkout';
}

export function metaForPath(pathname) {
  const page = PUBLIC_META.find((item) => item.match(pathname));
  return {
    title: page?.title || 'EasyMoveZone | Property with proof at every step',
    description: page?.description || 'Buy, sell, verify, let and manage property — and move home — with clear evidence and control.',
    noIndex: isPrivatePath(pathname),
    canonicalPath: pathname.replace(/\/+$/, '') || '/',
  };
}
