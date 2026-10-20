/** Public adviser form; it works without an account and feeds the admin queue. */
export const BOOK_SESSION_URL = '/consult';

/**
 * EasyMoveZone is one product with four surfaces:
 *
 *   Landing (`/`)       — what the company does, and where to start.
 *   Property (`/listings`) — buy (the grid, and `/listings/:slug`) and sell.
 *   Verify (`/verify`) — Property Passport verification, and `/verify/photo-scan`.
 *   Renovate (`/renovate`) — a public service page that belongs to Manage.
 *   Manage (`/manage`)  — a public service page leading into the signed-in
 *                          console at `/manage/dashboard` and its sub-pages.
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
    paths: ['/', '/listings', '/verify', '/renovate', '/consult', '/contact', '/help'],
  },
  manage: {
    id: 'manage',
    label: 'Manage',
    home: '/manage',
    paths: ['/manage', '/tenant', '/portal'],
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
 * True for any route rendered inside a portal shell — the owner console
 * (`/manage/*`) or the tenant portal (`/tenant`, `/tenant/*`). Signed in,
 * these are separate portals: Layout drops the site navbar, tab bar and
 * footer, and ConsoleShell supplies its own sidebar.
 */
export function isConsolePath(pathname) {
  return pathname.startsWith('/manage/') || pathname === '/tenant' || pathname.startsWith('/tenant/');
}

export const MARKETPLACE_URL = '/listings';
/**
 * Signed in, this opens the portal on the owner or tenant side: the one used
 * last, else the tenant side for an account that only rents. It never asks —
 * the sidebar dropdown switches sides.
 */
export const PORTAL_URL = '/portal';
/** Homes to rent: vacant properties we manage, let through the same grid. */
export const RENT_URL = '/listings/rent';

/**
 * The navbar follows the app's flow, one row: Listings (buy, rent and sell),
 * Verify a property (Property Passport), Moving (the /moving page) and Manage
 * (letting and running a property on the owner's behalf, renovation included
 * — so `/renovate` lights Manage; "My portal" once signed in). The phone tab
 * bar carries the same four, in the same order.
 */
const MANAGE_PATHS = ['/manage', '/renovate', '/consult', '/portal', '/tenant'];

/** Moving logistics is its own Next.js page (/moving), linked from the nav. */
export const MOVING_URL = '/moving';

export const REAL_ESTATE_NAV_ITEMS = [
  { to: MARKETPLACE_URL, label: 'Listings', match: ['/listings'] },
  { to: '/verify', label: 'Verify a property', match: ['/verify'] },
  { to: MOVING_URL, label: 'Moving', match: [MOVING_URL] },
  { to: '/manage', label: 'Manage', signedInLabel: 'My portal', match: MANAGE_PATHS },
];

/**
 * The phone tab bar is the navbar, nothing more: Listings, Verify, Moving, Manage.
 * The logo is home and Sign in sits in the top bar, so there is no Home tab
 * and no Menu tab — every sub-page is linked from the page it belongs to.
 */
export const REAL_ESTATE_BOTTOM_NAV = [
  { to: MARKETPLACE_URL, label: 'Listings', icon: 'buy', match: ['/listings'] },
  { to: '/verify', label: 'Verify', icon: 'shield', match: ['/verify'] },
  { to: MOVING_URL, label: 'Moving', icon: 'truck', match: [MOVING_URL] },
  { to: '/manage', label: 'Manage', signedInLabel: 'Portal', icon: 'manage', match: MANAGE_PATHS },
];

/** The Buy / Rent / Sell switch at the top of the Property pages. */
export const PROPERTY_MODES = [
  { to: MARKETPLACE_URL, label: 'Buy', match: ['/listings'], exclude: ['/listings/sell', '/listings/build', RENT_URL] },
  { to: RENT_URL, label: 'Rent', match: [RENT_URL] },
  { to: '/listings/sell', label: 'Sell', match: ['/listings/sell'] },
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

/* ── Property check tools ──────────────────────────────────────────────── */

export const PHOTO_SCAN_URL = '/verify/photo-scan';
export const OFFER_URL = '/listings/sell';
/**
 * The EasyMoveZone offer: we inspect the property and verify its title, then make
 * a firm offer; if the owner accepts, we complete within this many days of
 * verification. The server stamps each issued offer with its own deadline
 * (PURCHASE_DAYS in server/routes/listings.js) — change both together.
 */
export const PURCHASE_DAYS = 14;
export const OFFER_ANALYZE_URL = '/verify/photo-scan';
export const OFFER_VERIFY_URL = '/verify';
export const OFFER_RENOVATE_URL = '/renovate';
/** Declared here so SITE_MENU (above the console block) can reference it. */
const MANAGE_ADD_URL_PUBLIC = '/manage/add';


/**
 * The whole public site as groups, for the mobile menu sheet and the
 * navbar drawer. Both menus render this so the two can never disagree.
 */
export const SITE_MENU = [
  {
    id: 'property',
    label: 'Listings',
    blurb: 'Buy, rent or sell, approved by us',
    items: [
      { to: MARKETPLACE_URL, label: 'Properties for sale', icon: 'buy', desc: 'Valued and approved', primary: true },
      { to: RENT_URL, label: 'Homes to rent', icon: 'manage', desc: 'Let and managed by us' },
      { to: OFFER_URL, label: 'Sell a property', icon: 'sell', desc: 'List it or get an offer' },
      { to: OFFER_ANALYZE_URL, label: 'Quick photo scan', icon: 'analyze', desc: 'Free first read' },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    blurb: 'Letting, rent, repairs and renovation',
    items: [
      { to: '/manage', label: 'How we manage', icon: 'manage', desc: 'We run it, you collect' },
      { to: OFFER_RENOVATE_URL, label: 'Renovate a property', icon: 'renovate', desc: 'Scoped and approved' },
      { to: MANAGE_ADD_URL_PUBLIC, label: 'Add a property', icon: 'add', desc: 'Start letting' },
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

export const MANAGE_URL = '/manage/dashboard';
export const MANAGE_PROPERTIES_URL = '/manage/properties';
export const MANAGE_ADD_URL = '/manage/add';
export const MANAGE_ONBOARDING_URL = '/manage/onboarding';
export const MANAGE_JOURNEYS_URL = '/manage/journeys';
export const MANAGE_VERIFICATIONS_URL = '/manage/verifications';
export const MANAGE_OFFERS_URL = '/manage/offers';

export const MANAGE_MONEY_URL = '/manage/money';
export const MANAGE_FINANCE_URL = '/manage/money/finance';

export const MANAGE_OPS_URL = '/manage/operations';
export const MANAGE_MAINTENANCE_URL = '/manage/operations/maintenance';
export const MANAGE_DOCUMENTS_URL = '/manage/operations/documents';

export const MANAGE_ACCOUNT_URL = '/manage/account';
export const MANAGE_PLAN_URL = '/manage/account/plan';
export const MANAGE_CONSULT_URL = '/manage/account/support';

/** Collections is the Money section's default tab. */
export const MANAGE_COLLECTIONS_URL = MANAGE_MONEY_URL;
/** Tenancies is the Operations section's default tab. */
export const MANAGE_TENANCIES_URL = MANAGE_OPS_URL;
/** Payment details is the Account section's default tab. */
export const MANAGE_SETTINGS_URL = MANAGE_ACCOUNT_URL;

/**
 * The owner portal's four sections. The sidebar (and the phone bottom bar)
 * lists only these; each section's `tabs` are the views inside its page,
 * shown in the page header. `icon` keys map to icons in ConsoleShell.
 *
 * `match` lists every path that should light this section up. Overview's
 * tabs do not share a path prefix (the dashboard is the console root), so
 * prefix matching alone cannot decide it.
 */
export const CONSOLE_NAV = [
  {
    to: MANAGE_URL,
    label: 'Overview',
    icon: 'overview',
    match: [MANAGE_URL, MANAGE_PROPERTIES_URL, MANAGE_ADD_URL, MANAGE_ONBOARDING_URL, MANAGE_JOURNEYS_URL, MANAGE_VERIFICATIONS_URL, MANAGE_OFFERS_URL],
    // What used to be My Hub lives here: verifications (buying) and sales &
    // offers (selling) sit beside the properties we manage. Adding a property
    // and onboarding are actions reached from these pages, not tabs.
    tabs: [
      { to: MANAGE_URL, label: 'Dashboard', end: true },
      { to: MANAGE_JOURNEYS_URL, label: 'Journeys' },
      { to: MANAGE_VERIFICATIONS_URL, label: 'Verifications' },
      { to: MANAGE_OFFERS_URL, label: 'Sales & offers' },
      { to: MANAGE_PROPERTIES_URL, label: 'Properties' },
    ],
  },
  {
    to: MANAGE_MONEY_URL,
    label: 'Money',
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
    icon: 'operations',
    badge: 'maintenance',
    match: [MANAGE_OPS_URL],
    tabs: [
      { to: MANAGE_OPS_URL, label: 'Tenancies', end: true },
      { to: MANAGE_MAINTENANCE_URL, label: 'Maintenance', badge: 'maintenance' },
      { to: MANAGE_DOCUMENTS_URL, label: 'Documents' },
    ],
  },
  {
    to: MANAGE_ACCOUNT_URL,
    label: 'Account',
    icon: 'account',
    match: [MANAGE_ACCOUNT_URL],
    tabs: [
      { to: MANAGE_ACCOUNT_URL, label: 'Payment details', end: true },
      { to: MANAGE_PLAN_URL, label: 'My plan' },
      { to: MANAGE_CONSULT_URL, label: 'Talk to a manager' },
    ],
  },
];

/* ── Tenant portal ─────────────────────────────────────────────────── */

/**
 * The same shell as the owner console, for someone renting a home we manage.
 * Four sections again, each a page with tabs. A tenant only ever sees their
 * own tenancy: never the owner, the owner's money or other units.
 */
export const TENANT_URL = '/tenant';
export const TENANT_APPLICATIONS_URL = '/tenant/applications';
export const TENANT_RENT_URL = '/tenant/rent';
export const TENANT_PAID_URL = '/tenant/rent/paid';
export const TENANT_REQUESTS_URL = '/tenant/requests';
export const TENANT_NEW_REQUEST_URL = '/tenant/requests/new';
export const TENANT_HOME_URL = '/tenant/home';
export const TENANT_DOCUMENTS_URL = '/tenant/home/documents';

export const TENANT_NAV = [
  {
    to: TENANT_URL,
    label: 'Overview',
    icon: 'overview',
    match: [TENANT_URL],
    exclude: [TENANT_RENT_URL, TENANT_REQUESTS_URL, TENANT_HOME_URL],
    tabs: [
      { to: TENANT_URL, label: 'Overview', end: true },
      { to: TENANT_APPLICATIONS_URL, label: 'Applications' },
    ],
  },
  {
    to: TENANT_RENT_URL,
    label: 'Rent',
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
    icon: 'home',
    match: [TENANT_HOME_URL],
    tabs: [
      { to: TENANT_HOME_URL, label: 'Tenancy', end: true },
      { to: TENANT_DOCUMENTS_URL, label: 'Documents' },
    ],
  },
];

/** Which portal this device last used — 'owner' or 'tenant'. */
const PORTAL_ROLE_KEY = 'bv.portal.v1';
export function rememberPortalRole(role) {
  try { window.localStorage.setItem(PORTAL_ROLE_KEY, role); } catch { /* private mode */ }
}
export function rememberedPortalRole() {
  try {
    const v = window.localStorage.getItem(PORTAL_ROLE_KEY);
    return v === 'owner' || v === 'tenant' ? v : null;
  } catch {
    return null;
  }
}

export const PRODUCT_TAGLINE = 'Buy, build and manage property with proof at every step.';

export const PRODUCT_MISSION =
  'EasyMoveZone verifies property, sellers, documents, price and physical condition across supported markets, giving buyers a clear Property Passport before they pay.';

export const COMPANY_VALUE = 'Proof at every step, before money moves.';

/** Owner guides: quick checks used while valuing a property. */
export const BUYER_GUIDES = [
  { id: 'affordable', label: 'Can I afford it?' },
  { id: 'fair-value', label: 'Fair value' },
  { id: 'good-area', label: 'Good area' },
  { id: 'family-friendly', label: 'Family-friendly' },
  { id: 'investment-ready', label: 'Investment potential' },
];

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
