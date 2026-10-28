import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Building2, ShieldCheck, KeyRound, LayoutGrid, Truck, MapPinned } from 'lucide-react';
import {
  REAL_ESTATE_BOTTOM_NAV, isNavItemActive, navItemTarget, navItemLabel,
} from '../config/platform';
import { useAuth } from '../AuthContext';
import { useScrollDirection } from '../utils/useScrollDirection';
import { useIsCompact } from '../utils/useMediaQuery';
import { springy } from './ui';
import SiteMenu from './SiteMenu';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './shadcn/drawer';

const ICONS = {
  home: Home,
  buy: Building2,
  shield: ShieldCheck,
  manage: KeyRound,
  menu: LayoutGrid,
  truck: Truck,
  area: MapPinned,
};

/**
 * Fixed bottom navigation for the public site on mobile / small tablets.
 * Four destinations plus a Menu tab that opens the full site map as a bottom
 * sheet. It slides away on scroll-down and back on scroll-up so a long page
 * gets its screen back. The console is excluded (Layout does not render this
 * inside it) — it has its own section switcher.
 */
const Bar = styled(motion.nav)`
  display: none;

  @media (max-width: 960px) {
    display: grid;
    grid-template-columns: repeat(${(p) => p.$count}, 1fr);
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    z-index: 1150;
    height: 64px;
    padding-bottom: 0;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(18px) saturate(1.3);
    -webkit-backdrop-filter: blur(18px) saturate(1.3);
    border: 1px solid rgba(16, 18, 24, 0.08);
    border-radius: 22px;
    box-shadow: 0 16px 40px -18px rgba(16, 18, 24, 0.45);
  }
`;

const tabStyles = `
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.3rem 0;
  border: none;
  background: transparent;
  color: var(--color-ink-faint);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s ease;

  &.active { color: var(--color-green-deep); }
`;

const Tab = styled(NavLink)`${tabStyles}`;
const TabButton = styled.button`${tabStyles}`;

const IconWrap = styled(motion.span)`
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  z-index: 1;

  svg { position: relative; z-index: 1; }
`;

/* The green pill that slides between tabs. */
const Pill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--color-green-chip);
`;

export default function MobileTabBar() {
  const location = useLocation();
  const { user } = useAuth();
  const direction = useScrollDirection();
  const reduce = useReducedMotion();
  const compact = useIsCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomNav = REAL_ESTATE_BOTTOM_NAV;

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Not mounted at all on desktop: the CSS hides it too, but a bar that is
  // absent cannot end up under the footer whatever the stylesheet does.
  if (!bottomNav.length || !compact) return null;

  const hidden = direction === 'down' && !menuOpen;

  return (
    <>
      <Bar
        $count={bottomNav.length}
        aria-label="Primary"
        animate={reduce ? undefined : { y: hidden ? 'calc(100% + 8px)' : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        {bottomNav.map((item) => {
          const Icon = ICONS[item.icon] || Home;
          const active = item.menu ? menuOpen : isNavItemActive(item, location.pathname);
          const label = navItemLabel(item, Boolean(user));
          const inner = (
            <>
              <IconWrap whileTap={{ scale: 0.88 }}>
                {active && <Pill layoutId="tabbar-pill" transition={springy} />}
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </IconWrap>
              {label}
            </>
          );
          if (item.menu) {
            return (
              <TabButton
                key="menu"
                type="button"
                className={active ? 'active' : ''}
                aria-label={item.label}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {inner}
              </TabButton>
            );
          }
          return (
            <Tab
              key={item.to}
              to={navItemTarget(item, Boolean(user))}
              /* NavLink adds an 'active' class of its own on a prefix match, and
                 styled-components flattens a function className to a string before
                 NavLink sees it, so `end` is the only way to stop a parent tab
                 lighting up alongside the sub-page actually in view. */
              end={Boolean(item.exact)}
              className={active ? 'active' : ''}
              aria-label={label}
            >
              {inner}
            </Tab>
          );
        })}
      </Bar>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerDescription>Everything on EasyMoveZone, one tap away.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-safe">
            <div className="pb-6">
              <SiteMenu onNavigate={() => setMenuOpen(false)} compact />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
