import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaChartPie, FaMoneyBillWave, FaTools, FaCog, FaHome, FaRegCompass, FaPlus, FaBars,
  FaArrowLeft, FaSignOutAlt, FaQuestionCircle, FaKey, FaBuilding, FaCheck,
  FaBriefcase, FaInbox,
} from 'react-icons/fa';
import {
  MANAGE_URL, TENANT_URL, AGENT_URL, MARKETPLACE_URL, HELP_URL, rememberPortalRole,
} from '../config/platform';
import { useAuth } from '../AuthContext';
import { Sheet, SheetContent, SheetTitle } from './shadcn/sheet';
import NotificationBell from './NotificationBell';
import { springy } from './ui';

/**
 * The portal chrome, shared by the owner console (`/manage/*`) and the tenant
 * portal (`/tenant/*`).
 *
 * Signed in, a portal leaves the public site behind (Layout drops the navbar,
 * phone tab bar and footer) and this shell takes the screen:
 *
 *   - a left sidebar with the portal's four sections — nothing deeper. Each
 *     section is one page, and its views are tabs in that page's header;
 *   - the three portals listed at the top of the sidebar (My listings /
 *     Managed for me / Tenant), with a tick on the one open now;
 *   - a sticky header with the section, the page title, any page-level
 *     control (the property scope) and the section's tabs.
 *
 * On phones and tablets the sidebar becomes a bottom bar of the same four
 * sections, and the menu button opens the rest (workspace switch, back to the
 * main site, sign out) as a sheet.
 */

const ICONS = {
  overview: FaChartPie,
  money: FaMoneyBillWave,
  operations: FaTools,
  account: FaCog,
  home: FaHome,
  onboarding: FaRegCompass,
  inbox: FaInbox,
  offices: FaBuilding,
};

const WORKSPACES = {
  owner: { label: 'Managed', title: 'Managed for me', to: MANAGE_URL, icon: FaBuilding, blurb: 'We find tenants and run it' },
  tenant: { label: 'Tenant', title: 'Tenant portal', to: TENANT_URL, icon: FaKey, blurb: 'A home you rent from us' },
  agent: { label: 'Listings', title: 'My listings', to: AGENT_URL, icon: FaBriefcase, blurb: 'Homes you advertise yourself' },
};

const SIDEBAR_W = '248px';

/*
 * The sidebar and the header are position: fixed, not sticky. The site sets
 * overflow-x: hidden on html and body, which stops sticky from holding in
 * some browsers (Safari in particular), so both scrolled away with the page.
 * The content column is offset by the sidebar's width and by the header's
 * measured height (--console-head-h), which changes with tabs and screen size.
 */
const Shell = styled.div`
  min-height: 100vh;
  background: var(--color-bg-panel);
`;

/* ── Sidebar ──────────────────────────────────────────────────────── */

const Rail = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 60;
  width: ${SIDEBAR_W};
  border-right: 1px solid var(--color-line);
  background: #fff;

  @media (max-width: 960px) { display: none; }
`;

const RailInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.15rem 0.85rem 0.9rem;
  overflow-y: auto;
  scrollbar-width: thin;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.15rem 0.45rem 1rem;
  padding-right: ${(p) => (p.$inSheet ? '3.25rem' : '0.45rem')};
  img { flex: 0 1 auto; width: 124px; max-width: 100%; height: auto; }
`;

/* The "which hat am I wearing" switch. */
const Workspace = styled.div`
  margin: 0 0.2rem 1rem;
  padding: 0.6rem;
  border-radius: 14px;
  background: var(--color-bg-panel);
  border: 1px solid var(--color-line);

  .cap {
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
    padding: 0 0.2rem 0.45rem;
  }
  .hint {
    margin: 0.45rem 0.2rem 0;
    font-size: 0.74rem;
    line-height: 1.4;
    color: var(--color-ink-muted);
  }
`;

/* Each portal row: icon, title over blurb, a tick on the one you are in. */
const wsRow = `
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  text-align: left;
  font-family: var(--font-sans);

  .ic {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: var(--color-green-soft);
    color: var(--color-green-deep);
    font-size: 0.78rem;
  }
  .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .t { font-size: 0.88rem; font-weight: 600; color: var(--color-ink); line-height: 1.25; }
  .s { font-size: 0.74rem; color: var(--color-ink-muted); line-height: 1.3; }
  .end { flex: 0 0 auto; font-size: 0.7rem; color: var(--color-ink-faint); transition: transform 0.15s ease; }
`;

const WsItem = styled(Link)`
  ${wsRow}
  &:hover, &:focus-visible { outline: none; background: var(--color-bg-sunken); }
  &[aria-current='page'] { background: var(--color-green-wash); }
  &[aria-current='page'] .end { color: var(--color-green-deep); }
`;

const Primary = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  margin: 0 0.2rem 1.1rem;
  border-radius: 10px;
  background: var(--color-green-deep);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  svg { font-size: 0.72rem; }
  &:hover { color: #fff; background: var(--color-green-forest); }
`;

const GroupLabel = styled.div`
  padding: 0 0.65rem 0.4rem;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
`;

const Item = styled(Link)`
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 40px;
  padding: 0 0.7rem;
  border-radius: 10px;
  font-size: 0.93rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  transition: color 0.15s ease, background 0.15s ease;

  & + & { margin-top: 0.15rem; }
  svg { flex: 0 0 auto; font-size: 0.9rem; width: 17px; color: var(--color-ink-faint); transition: color 0.15s ease; }
  &:hover { color: var(--color-ink); background: var(--color-bg-sunken); }
  &[aria-current='page'] { color: var(--color-green-deep); font-weight: 600; background: transparent; }
  &[aria-current='page'] svg { color: var(--color-green-deep); }
`;

const ItemPill = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 10px;
  background: var(--color-green-wash);
  box-shadow: inset 3px 0 0 var(--color-green);
`;

const Badge = styled.span`
  margin-left: auto;
  min-width: 20px;
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.5;
  border-radius: 999px;
  padding: 0 0.4rem;
  background: var(--color-warn);
  color: #fff;
`;

const Pinned = styled.div`
  margin-top: 1.1rem;
`;

const RailFoot = styled.div`
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-line);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const FootLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 36px;
  padding: 0 0.7rem;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  background: none;
  border: 0;
  cursor: pointer;
  font-family: var(--font-sans);
  text-align: left;
  svg { font-size: 0.8rem; width: 17px; color: var(--color-ink-faint); }
  &:hover { color: var(--color-ink); background: var(--color-bg-sunken); }
`;

const Who = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.7rem 0.2rem;
  min-width: 0;

  .avatar {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--color-green-soft);
    color: var(--color-green-deep);
    font-size: 0.82rem;
    font-weight: 700;
  }
  .text { min-width: 0; }
  .name { font-size: 0.86rem; font-weight: 600; color: var(--color-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .email { font-size: 0.74rem; color: var(--color-ink-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

/* ── Main column ──────────────────────────────────────────────────── */

const Main = styled.div`
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-left: ${SIDEBAR_W};
  padding-top: var(--console-head-h, 0px);

  @media (max-width: 960px) { margin-left: 0; }
`;

const Head = styled.header`
  position: fixed;
  top: 0;
  left: ${SIDEBAR_W};
  right: 0;
  z-index: 50;

  @media (max-width: 960px) { left: 0; }
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--color-line);
`;

const HeadInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.05rem 2rem 0;

  @media (max-width: 720px) { padding: 0.65rem 1rem 0; }
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const MenuBtn = styled.button`
  display: none;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--color-line-strong);
  background: #fff;
  color: var(--color-ink);
  cursor: pointer;
  align-items: center;
  justify-content: center;

  @media (max-width: 960px) { display: inline-flex; }
`;

const Heading = styled.div`
  flex: 1;
  min-width: 0;
`;

const Crumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  white-space: nowrap;
  overflow: hidden;
  .ws { color: var(--color-green-deep); }
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0.12rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 720px) { font-size: 1.12rem; margin: 0.05rem 0 0; }
`;

const HeadActions = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 720px) { display: none; }
`;

const Tabs = styled.nav`
  display: flex;
  gap: 0.2rem;
  margin: 0.7rem -0.2rem 0;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 720px) { margin: 0.45rem -1rem 0; padding: 0 0.8rem; }
`;

const Tab = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  padding: 0.5rem 0.75rem 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  scroll-snap-align: start;
  transition: color 0.15s ease;

  &:hover { color: var(--color-ink); }
  &[aria-current='page'] { color: var(--color-green-deep); font-weight: 600; }

  @media (max-width: 720px) { padding: 0.45rem 0.65rem 0.65rem; font-size: 0.86rem; }
`;

const TabLine = styled(motion.span)`
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--color-green);
`;

const Sub = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-ink-muted);
  max-width: 70ch;

  @media (max-width: 720px) { display: none; }
`;

const MobileActions = styled.div`
  display: none;
  @media (max-width: 720px) { display: block; select { width: 100%; } }
`;

const Body = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.4rem 2rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  /* Clear the bottom section bar (and the adviser button above it). */
  @media (max-width: 960px) { padding-bottom: calc(var(--mobile-tabbar-h) + 5rem + env(safe-area-inset-bottom, 0px)); }
  @media (max-width: 720px) { padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; }
`;

/* ── Phone bottom bar: the same four sections ─────────────────────── */

const BottomBar = styled.nav`
  display: none;

  @media (max-width: 960px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 900;
    display: grid;
    grid-template-columns: repeat(${(p) => p.$count}, minmax(0, 1fr));
    height: calc(var(--mobile-tabbar-h) + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-top: 1px solid var(--color-line);
  }
`;

const BottomItem = styled(Link)`
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-ink-faint);

  .ic { position: relative; z-index: 0; display: grid; place-items: center; width: 46px; height: 28px; border-radius: 999px; }
  svg { font-size: 1rem; }
  &[aria-current='page'] { color: var(--color-green-deep); }
  .dot {
    position: absolute;
    top: -2px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--color-warn);
    color: #fff;
    font-size: 0.6rem;
    line-height: 16px;
    text-align: center;
  }
`;

const BottomPill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--color-green-soft);
  z-index: -1;
`;

/* ── Section matching ─────────────────────────────────────────────── */

function within(pathname, p) {
  return pathname === p || pathname.startsWith(`${p}/`);
}

/**
 * A section owns several paths that do not all share a prefix, so matching
 * runs off its own `match` list (minus `exclude`). The score is the length of
 * the path that matched, so `/manage/account` is never claimed by Overview.
 */
export function currentSection(nav, pathname) {
  const score = (item) => {
    if ((item.exclude || []).some((p) => within(pathname, p))) return -1;
    return item.match.reduce((best, m) => (within(pathname, m) ? Math.max(best, m.length) : best), -1);
  };
  return nav
    .map((item) => ({ item, s: score(item) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.item)[0];
}

function tabActive(tab, pathname) {
  if (tab.match) return tab.match.some((p) => within(pathname, p));
  return tab.end ? pathname === tab.to : within(pathname, tab.to);
}

/** The three portals, always listed, so the one you are in is not a hidden menu. */
function WorkspaceMenu({ workspace, onNavigate }) {
  return (
    <nav aria-label="Choose a portal">
      {Object.entries(WORKSPACES).map(([key, w]) => {
        const active = key === workspace;
        const ItemIcon = w.icon;
        return (
          <WsItem
            key={key}
            to={w.to}
            aria-current={active ? 'page' : undefined}
            onClick={() => { rememberPortalRole(key); onNavigate?.(); }}
          >
            <span className="ic"><ItemIcon /></span>
            <span className="txt"><span className="t">{w.title}</span><span className="s">{w.blurb}</span></span>
            {active && <FaCheck className="end" />}
          </WsItem>
        );
      })}
    </nav>
  );
}

/** The sidebar's contents — in the rail on desktop, in a sheet on phones. */
function SidebarNav({
  workspace, nav, section, badges, primary, pinned, onNavigate, layoutId, inSheet,
}) {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const name = user?.name || (user?.email || '').split('@')[0];
  const initial = (name || '?').charAt(0).toUpperCase();
  const ws = WORKSPACES[workspace];

  return (
    <RailInner>
      <Brand to={ws.to} onClick={onNavigate} aria-label={`EasyMoveZone ${ws.title}`} $inSheet={inSheet}>
        <img src="/emz.svg" alt="EasyMoveZone" />
      </Brand>

      <Workspace>
        <div className="cap">Three different jobs</div>
        <WorkspaceMenu workspace={workspace} onNavigate={onNavigate} />
        <p className="hint">The tick is the one open now. The other two are different work, not more pages of this one.</p>
      </Workspace>

      {primary && <Primary to={primary.to} onClick={onNavigate}><FaPlus /> {primary.label}</Primary>}

      <nav aria-label={ws.title}>
        <GroupLabel>Pages</GroupLabel>
        {nav.map((item) => {
          const Icon = ICONS[item.icon] || FaChartPie;
          const badge = item.badge ? badges[item.badge] : 0;
          const active = item === section;
          return (
            <Item key={item.to} to={item.to} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
              {active && <ItemPill layoutId={layoutId} transition={springy} />}
              <Icon /> {item.label}
              {badge > 0 && <Badge>{badge}</Badge>}
            </Item>
          );
        })}
      </nav>

      {pinned?.length > 0 && (
        <Pinned>
          <GroupLabel>Get started</GroupLabel>
          {pinned.map((p) => {
            const Icon = ICONS[p.icon] || FaRegCompass;
            return <Item key={p.to} to={p.to} onClick={onNavigate} aria-current={pathname === p.to ? 'page' : undefined}><Icon /> {p.label}</Item>;
          })}
        </Pinned>
      )}

      <RailFoot>
        <FootLink to={HELP_URL} onClick={onNavigate}><FaQuestionCircle /> Help</FootLink>
        <FootLink to={MARKETPLACE_URL} onClick={onNavigate}><FaArrowLeft /> Back to Property hub</FootLink>
        <FootLink as="button" type="button" onClick={() => { onNavigate?.(); signOut(); }}><FaSignOutAlt /> Sign out</FootLink>
        {user && (
          <Who>
            <span className="avatar" aria-hidden="true">{initial}</span>
            <span className="text">
              <div className="name">{name}</div>
              <div className="email">{user.email}</div>
            </span>
          </Who>
        )}
      </RailFoot>
    </RailInner>
  );
}

export default function ConsoleShell({
  workspace = 'owner', nav, title, sub, actions, badges = {}, primary = null, pinned = [], children,
}) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const section = currentSection(nav, pathname);
  const tabs = section?.tabs || [];
  const ws = WORKSPACES[workspace];

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  // Coming back to the portal later should land in the one used last.
  useEffect(() => { rememberPortalRole(workspace); }, [workspace]);

  const shared = { workspace, nav, section, badges, primary, pinned };

  // Keep the content clear of the fixed header, whatever its height.
  const headRef = useRef(null);
  const [headH, setHeadH] = useState(0);
  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el) return undefined;
    const measure = () => setHeadH(el.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Shell>
      <Rail>
        <SidebarNav {...shared} layoutId="console-rail-item" />
      </Rail>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="p-0 w-[min(84vw,300px)]">
          <SheetTitle className="sr-only">{ws.title} menu</SheetTitle>
          <SidebarNav {...shared} inSheet onNavigate={() => setMenuOpen(false)} layoutId="console-sheet-item" />
        </SheetContent>
      </Sheet>

      <Main style={{ '--console-head-h': `${headH}px` }}>
        <Head ref={headRef}>
          <HeadInner>
            <HeadRow>
              <MenuBtn type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><FaBars /></MenuBtn>
              <Heading>
                <Crumb>
                  <span className="ws">{ws.title}</span>
                  {section && <><span aria-hidden="true">/</span><span>{section.label}</span></>}
                </Crumb>
                <Title>{title}</Title>
              </Heading>
              {actions && <HeadActions>{actions}</HeadActions>}
              <NotificationBell audience={workspace} />
            </HeadRow>
            {tabs.length > 1 ? (
              <Tabs aria-label={`${section.label} views`}>
                {tabs.map((t) => {
                  const badge = t.badge ? badges[t.badge] : 0;
                  const active = tabActive(t, pathname);
                  return (
                    <Tab key={t.to} to={t.to} aria-current={active ? 'page' : undefined}>
                      {t.label}
                      {badge > 0 && <Badge>{badge}</Badge>}
                      {active && <TabLine layoutId="console-tab-line" transition={springy} />}
                    </Tab>
                  );
                })}
              </Tabs>
            ) : <div style={{ height: '0.9rem' }} />}
          </HeadInner>
        </Head>
        <Body>
          {sub && <Sub>{sub}</Sub>}
          {actions && <MobileActions>{actions}</MobileActions>}
          {children}
        </Body>
      </Main>

      <BottomBar aria-label={`${ws.title} sections`} $count={nav.length}>
        {nav.map((item) => {
          const Icon = ICONS[item.icon] || FaChartPie;
          const badge = item.badge ? badges[item.badge] : 0;
          const active = item === section;
          return (
            <BottomItem key={item.to} to={item.to} aria-current={active ? 'page' : undefined}>
              <span className="ic">
                {active && <BottomPill layoutId="console-bottom-item" transition={springy} />}
                <Icon />
                {badge > 0 && <span className="dot">{badge}</span>}
              </span>
              {item.label}
            </BottomItem>
          );
        })}
      </BottomBar>
    </Shell>
  );
}
