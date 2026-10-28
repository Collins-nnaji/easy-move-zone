/** Public adviser form; it works without an account and feeds the admin queue. */
export const BOOK_SESSION_URL = '/consult';

/**
 * EasyMoveZone is a rental platform (and a moving service) with these surfaces:
 *
 *   Landing (`/`)          — what we do for renters, landlords and agents.
 *   Homes to rent (`/listings`, `/listings/:slug`) — the rental grid.
 *   Check a rental (`/check`) — checks on a landlord, agent or home before you pay.
 *   Neighbourhoods (`/areas`) — what residents say, rents and location tools.
 *   Renovate (`/renovate`) — a landlord service that belongs to Manage.
 *   Manage (`/manage`)  — a public service page leading into the signed-in
 *                          portal. Every signed-in page lives under `/portal`:
 *                          `/portal/landlord/*`, `/portal/tenant/*` and
 *                          `/portal/agent/*` (the agent application included).
 *
 * `SECTIONS` maps a section id to the paths that belong to it, so shared
 * chrome (Navbar, MobileTabBar, Footer, Layout) can tell which one a given
 * route belongs to.
 */
export const SECTIONS = {
  'real-estate': {
    id: 'real-estate',
    label: 'Real Estate',
    home: '/',
    paths: ['/', '/listings', '/list', '/check', '/renovate', '/consult', '/contact', '/help', '/areas', '/agents'],
  },
  manage: {
    id: 'manage',
    label: 'Manage',
    home: '/manage',
    paths: ['/manage', '/portal'],
  },
};

/**
 * `'/'` is a path prefix of everything, so the `startsWith` test below only
 * ever matches it as `'//'` — i.e. never. That is deliberate: the site root
 * matches Real Estate exactly, and nothing else falls through to it.
 */
export function getSection(pathname) {
  if (SECTIONS.manage.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return SECTIONS.manage;
  }
  if (SECTIONS['real-estate'].paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return SECTIONS['real-estate'];
  }
  return null;
}

/**
 * True for any route rendered inside a portal shell — everything under
 * `/portal/`: the landlord, tenant and agent portals, and the agent
 * application. Signed in, Layout drops the site navbar, tab bar and footer,
 * and ConsoleShell supplies its own sidebar. `/portal` itself only redirects.
 */
export function isConsolePath(pathname) {
  return pathname.startsWith('/portal/');
}

/**
 * Where an address from before everything moved under `/portal` lives now:
 * `/manage/…` (not the public `/manage` page), `/tenant…` and `/agent…`
 * (not the public `/agents` directory). Null for anything else. Emails,
 * notifications and bookmarks still carry the old addresses.
 */
export function legacyPortalPath(pathname) {
  const under = (root) => pathname === root || pathname.startsWith(`${root}/`);
  if (pathname.startsWith('/manage/')) return `/portal/landlord/${pathname.slice('/manage/'.length)}`;
  if (under('/tenant')) return `/portal${pathname}`;
  if (under('/agent')) return `/portal${pathname}`;
  return null;
}

export const MARKETPLACE_URL = '/listings';
/**
 * Signed in, this opens the portal on the owner or tenant side: the one used
 * last, else the tenant side for an account that only rents. It never asks —
 * the sidebar dropdown switches sides.
 */
export const PORTAL_URL = '/portal';
/** The landlord portal: we let and run your property. */
export const LANDLORD_URL = `${PORTAL_URL}/landlord`;
/** Homes to rent: the one listings grid. */
export const RENT_URL = MARKETPLACE_URL;
/** Check a rental before you pay: the landlord or agent, the home and the agreement. */
export const RENTAL_CHECK_URL = '/check';
/** Neighbourhood pages: residents' scores and board, rents and location tools. */
export const AREAS_URL = '/areas';

/**
 * The navbar follows a renter's road, one row: Homes to rent, Check a rental
 * (before you pay), Neighbourhoods, Moving and Manage (we let and run it for
 * landlords). Listing a home yourself, and finding an agent, live on `/list`.
 * Renovation is part of Manage. Signed in, Manage is "My portal". The phone
 * tab bar stays at four: Rent, Areas, Moving, Manage; Check is in the menu.
 */
const MANAGE_PATHS = ['/manage', '/renovate', '/consult', '/portal'];

/** Moving logistics is its own Next.js page (/moving), linked from the nav. */
export const MOVING_URL = '/moving';

export const AGENTS_URL = '/agents';
export const AGENT_URL = `${PORTAL_URL}/agent`;
export const AGENT_APPLY_URL = `${AGENT_URL}/apply`;
/** Listing a home to rent yourself, as an agent or a landlord. Letting that we run is Manage. */
export const LIST_URL = '/list';

export const REAL_ESTATE_NAV_ITEMS = [
  { to: RENT_URL, label: 'Homes to rent', match: ['/listings'] },
  { to: RENTAL_CHECK_URL, label: 'Check a rental', match: [RENTAL_CHECK_URL] },
  { to: AREAS_URL, label: 'Neighbourhoods', match: [AREAS_URL] },
  { to: MOVING_URL, label: 'Moving', match: [MOVING_URL] },
  { to: '/manage', label: 'Manage', signedInLabel: 'My portal', match: MANAGE_PATHS, exclude: [AGENT_APPLY_URL] },
];

/**
 * The phone tab bar is the navbar, nothing more: Rent, Areas, Moving, Manage.
 * The logo is home and Sign in sits in the top bar, so there is no Home tab
 * and no Menu tab — every sub-page is linked from the page it belongs to.
 */
export const REAL_ESTATE_BOTTOM_NAV = [
  { to: RENT_URL, label: 'Rent', icon: 'buy', match: ['/listings', RENTAL_CHECK_URL] },
  { to: AREAS_URL, label: 'Areas', icon: 'area', match: [AREAS_URL] },
  { to: MOVING_URL, label: 'Moving', icon: 'truck', match: [MOVING_URL] },
  { to: '/manage', label: 'Manage', signedInLabel: 'Portal', icon: 'manage', match: MANAGE_PATHS, exclude: [AGENT_APPLY_URL] },
];

/** Where a nav item goes for this visitor: signed in, Manage opens your portal. */
export function navItemTarget(item, signedIn) {
  return signedIn && item.to === '/manage' ? PORTAL_URL : item.to;
}

/**
 * Signed in, "Manage" becomes "My portal": it opens whichever portal is yours —
 * the owner console or the tenant portal — so a tenant is never told to
 * "manage" a home they rent.
 */
export function navItemLabel(item, signedIn) {
  return signedIn && item.signedInLabel ? item.signedInLabel : item.label;
}

/** True when `pathname` belongs to a nav item: on a `match` path and not under an `exclude` one. */
export function isNavItemActive(item, pathname) {
  const within = (p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`));
  return (item.match || []).some(within) && !(item.exclude || []).some(within);
}

/* ── Landlord services ─────────────────────────────────────────────── */

export const OFFER_RENOVATE_URL = '/renovate';
/** Declared here so SITE_MENU (above the console block) can reference it. */
const MANAGE_ADD_URL_PUBLIC = `${LANDLORD_URL}/add`;


/**
 * The whole public site as groups, for the mobile menu sheet and the
 * navbar drawer. Both menus render this so the two can never disagree.
 */
export const SITE_MENU = [
  {
    id: 'property',
    label: 'Renting',
    blurb: 'Find a home and check it before you pay',
    items: [
      { to: RENT_URL, label: 'Homes to rent', icon: 'buy', desc: 'Checked and approved by us', primary: true },
      { to: RENTAL_CHECK_URL, label: 'Check a rental', icon: 'verify', desc: 'The landlord, agent and home, before you pay' },
      { to: AREAS_URL, label: 'Neighbourhoods', icon: 'area', desc: 'What residents say, rents and commute' },
      { to: '/list#agents', label: 'Find an agent', icon: 'consult', desc: 'Verified letting agencies' },
    ],
  },
  {
    id: 'manage',
    label: 'Landlords and agents',
    blurb: 'Let a home, or have us run it for you',
    items: [
      { to: '/manage', label: 'How we manage', icon: 'manage', desc: 'Tenants, rent and repairs, run for you' },
      { to: MANAGE_ADD_URL_PUBLIC, label: 'Hand over a property', icon: 'add', desc: 'Start letting with us' },
      { to: '/list', label: 'List a home to rent', icon: 'add', desc: 'Post it yourself, as an agent or landlord' },
      { to: BOOK_SESSION_URL, label: 'Talk to an adviser', icon: 'consult', desc: 'Free, no account needed' },
    ],
  },
];

/* ── Manage console ────────────────────────────────────────────────── */

/**
 * The console is four sections, each of which is one page with tabs inside it.
 * A flat list of fourteen sidebar items read as duplication — "Collections" and
 * "Finance" are two views of the same money, "Dashboard" and "Properties" two
 * views of the same portfolio — so the rail names the four things an owner
 * actually thinks about, and the tabs handle the rest.
 */

export const MANAGE_URL = `${LANDLORD_URL}/dashboard`;
export const MANAGE_PROPERTIES_URL = `${LANDLORD_URL}/properties`;
export const MANAGE_ADD_URL = `${LANDLORD_URL}/add`;
export const MANAGE_ONBOARDING_URL = `${LANDLORD_URL}/onboarding`;
export const MANAGE_JOURNEYS_URL = `${LANDLORD_URL}/journeys`;

export const MANAGE_MONEY_URL = `${LANDLORD_URL}/money`;
export const MANAGE_FINANCE_URL = `${LANDLORD_URL}/money/finance`;

export const MANAGE_OPS_URL = `${LANDLORD_URL}/operations`;
export const MANAGE_MAINTENANCE_URL = `${LANDLORD_URL}/operations/maintenance`;
export const MANAGE_DOCUMENTS_URL = `${LANDLORD_URL}/operations/documents`;
export const MANAGE_APPLICANTS_URL = `${LANDLORD_URL}/operations/applicants`;
export const MANAGE_INSPECTIONS_URL = `${LANDLORD_URL}/operations/inspections`;

export const MANAGE_ACCOUNT_URL = `${LANDLORD_URL}/account`;
export const MANAGE_PLAN_URL = `${LANDLORD_URL}/account/plan`;
export const MANAGE_CONSULT_URL = `${LANDLORD_URL}/account/support`;

/** Collections is the Money section's default tab. */
export const MANAGE_COLLECTIONS_URL = MANAGE_MONEY_URL;
/** Tenancies is the Operations section's default tab. */
export const MANAGE_TENANCIES_URL = MANAGE_OPS_URL;
/** Payment details is the Account section's default tab. */
export const MANAGE_SETTINGS_URL = MANAGE_ACCOUNT_URL;

/**
 * The owner portal's four sections. The sidebar (and the phone bottom bar)
 * lists only these. Each carries a `hint`, the line under its name in the sidebar, so
 * an owner can tell where something lives before clicking. Header tabs stay
 * short on a phone: Home, Properties and Journeys on Overview; documents live under Tenancies; plan and the manager
 * conversation share one Account tab. `icon` keys map to icons in ConsoleShell.
 *
 * `match` lists every path that should light this section up. Overview's
 * tabs do not share a path prefix (the dashboard is the console root), so
 * prefix matching alone cannot decide it.
 */
export const CONSOLE_NAV = [
  {
    to: MANAGE_URL,
    label: 'Overview',
    hint: 'Dashboard, properties, journeys',
    icon: 'overview',
    match: [MANAGE_URL, MANAGE_PROPERTIES_URL, MANAGE_ADD_URL, MANAGE_ONBOARDING_URL, MANAGE_JOURNEYS_URL],
    // Journeys are your lettings and renovations with us. Adding a property
    // and onboarding are actions reached from these pages, not tabs.
    tabs: [
      { to: MANAGE_URL, label: 'Home', end: true },
      { to: MANAGE_PROPERTIES_URL, label: 'Properties' },
      { to: MANAGE_JOURNEYS_URL, label: 'Journeys' },
    ],
  },
  {
    to: MANAGE_MONEY_URL,
    label: 'Money',
    hint: 'Rent collected, statements',
    icon: 'money',
    match: [MANAGE_MONEY_URL],
    tabs: [
      { to: MANAGE_MONEY_URL, label: 'Collections', end: true },
      { to: MANAGE_FINANCE_URL, label: 'Statements' },
    ],
  },
  {
    to: MANAGE_OPS_URL,
    label: 'Operations',
    hint: 'Tenancies, applicants, repairs, inspections',
    icon: 'operations',
    badge: 'maintenance',
    match: [MANAGE_OPS_URL],
    tabs: [
      { to: MANAGE_OPS_URL, label: 'Tenancies', end: true },
      { to: MANAGE_APPLICANTS_URL, label: 'Applicants' },
      { to: MANAGE_MAINTENANCE_URL, label: 'Repairs', badge: 'maintenance' },
      { to: MANAGE_INSPECTIONS_URL, label: 'Inspections' },
    ],
  },
  {
    to: MANAGE_ACCOUNT_URL,
    label: 'Account',
    hint: 'Payout details, plan, help',
    icon: 'account',
    match: [MANAGE_ACCOUNT_URL],
    tabs: [
      { to: MANAGE_ACCOUNT_URL, label: 'Payments', end: true },
      { to: MANAGE_PLAN_URL, label: 'Plan & help', match: [MANAGE_PLAN_URL, MANAGE_CONSULT_URL] },
    ],
  },
];

/* ── Tenant portal ─────────────────────────────────────────────────── */

/**
 * The same shell as the owner console, for someone renting a home we manage.
 * Four sections again, each a page with tabs. A tenant only ever sees their
 * own tenancy: never the owner, the owner's money or other units.
 */
export const TENANT_URL = `${PORTAL_URL}/tenant`;
export const TENANT_APPLICATIONS_URL = `${TENANT_URL}/applications`;
/** Rental checks you ordered before paying for a home (from /check). */
export const TENANT_CHECKS_URL = `${TENANT_URL}/checks`;
export const TENANT_RENT_URL = `${TENANT_URL}/rent`;
export const TENANT_PAID_URL = `${TENANT_URL}/rent/paid`;
export const TENANT_REQUESTS_URL = `${TENANT_URL}/requests`;
export const TENANT_NEW_REQUEST_URL = `${TENANT_URL}/requests/new`;
export const TENANT_HOME_URL = `${TENANT_URL}/home`;
export const TENANT_DOCUMENTS_URL = `${TENANT_URL}/home/documents`;
export const TENANT_INSPECTIONS_URL = `${TENANT_URL}/home/inspections`;

export const TENANT_NAV = [
  {
    to: TENANT_URL,
    label: 'Overview',
    hint: 'Your home, applications, checks',
    icon: 'overview',
    match: [TENANT_URL],
    exclude: [TENANT_RENT_URL, TENANT_REQUESTS_URL, TENANT_HOME_URL],
    tabs: [
      { to: TENANT_URL, label: 'Overview', end: true },
      { to: TENANT_APPLICATIONS_URL, label: 'Applications' },
      { to: TENANT_CHECKS_URL, label: 'Checks' },
    ],
  },
  {
    to: TENANT_RENT_URL,
    label: 'Rent',
    hint: 'What is due, tell us you paid',
    icon: 'money',
    badge: 'arrears',
    match: [TENANT_RENT_URL],
    tabs: [
      { to: TENANT_RENT_URL, label: 'Rent schedule', end: true },
      { to: TENANT_PAID_URL, label: 'Tell us you paid' },
    ],
  },
  {
    to: TENANT_REQUESTS_URL,
    label: 'Requests',
    hint: 'Repairs and questions',
    icon: 'operations',
    badge: 'requests',
    match: [TENANT_REQUESTS_URL],
    tabs: [
      { to: TENANT_REQUESTS_URL, label: 'My requests', end: true },
      { to: TENANT_NEW_REQUEST_URL, label: 'Report a repair' },
    ],
  },
  {
    to: TENANT_HOME_URL,
    label: 'My home',
    hint: 'Tenancy, documents, inspections',
    icon: 'home',
    match: [TENANT_HOME_URL],
    tabs: [
      { to: TENANT_HOME_URL, label: 'Tenancy', end: true },
      { to: TENANT_DOCUMENTS_URL, label: 'Documents' },
      { to: TENANT_INSPECTIONS_URL, label: 'Inspections' },
    ],
  },
];

export const AGENT_LISTINGS_URL = `${AGENT_URL}/listings`;
export const AGENT_NEW_URL = `${AGENT_URL}/listings/new`;
export const AGENT_INBOX_URL = `${AGENT_URL}/inbox`;
export const AGENT_OFFICES_URL = `${AGENT_URL}/offices`;
export const AGENT_ACCOUNT_URL = `${AGENT_URL}/account`;

export const AGENT_NAV = [
  {
    to: AGENT_URL,
    label: 'Overview',
    hint: 'Stock, reviews, next steps',
    icon: 'overview',
    match: [AGENT_URL],
    exclude: [AGENT_LISTINGS_URL, AGENT_INBOX_URL, AGENT_OFFICES_URL, AGENT_ACCOUNT_URL],
    tabs: [{ to: AGENT_URL, label: 'Overview', end: true }],
  },
  {
    to: AGENT_LISTINGS_URL,
    label: 'Listings',
    hint: 'Post and edit homes',
    icon: 'home',
    match: [AGENT_LISTINGS_URL],
    tabs: [
      { to: AGENT_LISTINGS_URL, label: 'My listings', end: true },
      { to: AGENT_NEW_URL, label: 'Post' },
    ],
  },
  {
    to: AGENT_INBOX_URL,
    label: 'Inbox',
    hint: 'Applicants, enquiries, viewings',
    icon: 'inbox',
    badge: 'leads',
    match: [AGENT_INBOX_URL],
    tabs: [{ to: AGENT_INBOX_URL, label: 'Applications, enquiries & viewings', end: true }],
  },
  {
    to: AGENT_ACCOUNT_URL,
    label: 'Account',
    hint: 'Profile, plan, offices',
    icon: 'account',
    match: [AGENT_ACCOUNT_URL, AGENT_OFFICES_URL],
    tabs: [
      { to: AGENT_ACCOUNT_URL, label: 'Profile & plan', end: true },
      { to: AGENT_OFFICES_URL, label: 'Offices' },
    ],
  },
];

/**
 * Before an agency is verified, the agent portal is one page: the
 * application. It still sits in the portal shell, so the switcher and the
 * way back to the other portals stay in reach.
 */
export const AGENT_APPLY_NAV = [
  {
    to: AGENT_APPLY_URL,
    label: 'Apply',
    hint: 'Get verified to list homes',
    icon: 'onboarding',
    match: [AGENT_APPLY_URL],
    tabs: [{ to: AGENT_APPLY_URL, label: 'Application', end: true }],
  },
];

/** Which portal this device last used — 'owner', 'tenant' or 'agent'. */
const PORTAL_ROLE_KEY = 'bv.portal.v1';
export function rememberPortalRole(role) {
  try { window.localStorage.setItem(PORTAL_ROLE_KEY, role); } catch { /* private mode */ }
}
export function rememberedPortalRole() {
  try {
    const v = window.localStorage.getItem(PORTAL_ROLE_KEY);
    return v === 'owner' || v === 'tenant' || v === 'agent' ? v : null;
  } catch {
    return null;
  }
}

export const PRODUCT_TAGLINE = 'Rent a home, and let one, with proof at every step.';

export const PRODUCT_MISSION =
  'EasyMoveZone checks homes, landlords and agents before a renter pays, and lets and manages homes for landlords, with rent, repairs and inspections in one place.';

export const COMPANY_VALUE = 'Proof at every step, before money moves.';


/** Branded product names surfaced in UI copy. */
export const BRAND = {
  passport: 'Property Passport',
  score: 'EasyScore',
  insight: 'EasyInsight',
  manage: 'EasyMoveZone Manage',
  portfolio: 'Portfolio View',
  advisor: 'EasyAdviser',
  value: 'EasyValue',
  offer: 'EasyOffer',
};

/* ── Help and contact ──────────────────────────────────────────────── */

export const CONTACT_URL = '/contact';
export const HELP_URL = '/help';
export const SAVED_URL = '/listings/saved';
export const CONTACT_EMAIL = 'hello@easymovezone.com';
/**
 * WhatsApp is how most people in Nigeria reach a business. Set
 * NEXT_PUBLIC_WHATSAPP_NUMBER (digits with country code, e.g. 2348012345678)
 * and a "Chat on WhatsApp" link appears on the contact page and the account
 * menu; unset, it is simply left out.
 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
export const whatsappLink = (text = '') => (WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
  : '');
