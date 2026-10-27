import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FaRegCalendarAlt, FaKey, FaShieldAlt, FaThLarge,
} from 'react-icons/fa';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import {
  REAL_ESTATE_NAV_ITEMS, MARKETPLACE_URL, PORTAL_URL, isNavItemActive, navItemTarget, navItemLabel,
} from '../config/platform';
import { useAuth } from '../AuthContext';
import AccountMenu from './AccountMenu';
import { springy } from './ui';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  background: rgba(250, 248, 242, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid #e4dfd5;
  box-shadow: ${(p) => (p.$scrolled ? '0 8px 24px -18px rgba(27, 35, 30, 0.35)' : 'none')};
  transition: box-shadow 0.2s ease;

  @media (max-width: 720px) {
    height: 60px;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 720px) { padding: 0 1rem; gap: 0.5rem; }
  @media (max-width: 360px) { padding: 0 0.75rem; }
`;

const Logo = styled(RouterLink)`
  display: flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;

  img { height: 28px; width: auto; }
  @media (max-width: 720px) { img { height: 24px; } }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: auto;
  margin-left: 1.25rem;

  @media (max-width: 960px) { display: none; }
`;

const Link = styled(RouterLink)`
  position: relative;
  z-index: 0;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: #4a5047;
  transition: color 0.15s, background 0.15s;

  &:hover { color: #1b231e; background: rgba(0, 0, 0, 0.05); }
  &.active, &.active:hover {
    color: #fff;
    background: transparent;
  }
`;

/* The active pill slides between links via a shared layoutId. */
const Underline = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: var(--radius-pill);
  background: #1b231e;
`;

const Badge = styled.span`
  margin-left: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-green-deep);
  background: var(--color-green-soft);
  border: 1px solid rgba(47, 93, 80, 0.2);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  vertical-align: middle;

  @media (max-width: 720px) { display: none; }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;

  @media (max-width: 720px) { gap: 0.4rem; }
`;

/* Section CTA — full pill on desktop, compact icon button on mobile. */
const Cta = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: var(--radius-pill);
  background: #fff;
  color: #1b231e;
  border: 1px solid #ded7cb;
  font-size: 13px;
  font-weight: 700;
  padding: 0.45rem 0.9rem;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    color: var(--color-green-deep);
    border-color: rgba(47, 93, 80, 0.5);
  }

  .cta-label { display: inline; }
  .cta-icon { display: inline-flex; color: var(--color-green-deep); font-size: 0.8rem; }

  @media (max-width: 960px) {
    padding: 0;
    width: 36px;
    height: 36px;
    .cta-label { display: none; }
    .cta-icon { display: inline-flex; font-size: 0.95rem; }
  }

  /* The same destination is already in the mobile bottom navigation. Hiding
     it on narrow phones leaves the brand and account action room to breathe. */
  @media (max-width: 420px) { display: none; }
`;

/*
 * Signed in, "My portal" sits beside the avatar instead of in the middle
 * nav: both are about your account, so they read as one group. Below 960px
 * the bottom tab bar has Portal, so this steps aside with the middle nav.
 */
const PortalBtn = styled(RouterLink)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 36px;
  padding: 0 0.95rem;
  border-radius: var(--radius-pill);
  background: #1b231e;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.15s;

  svg { font-size: 0.75rem; }
  &:hover { color: #fff; background: var(--color-green-deep); }

  @media (max-width: 960px) { display: none; }
`;

/* Hamburger — only where the desktop nav is hidden. */
const CTA_ICONS = { calendar: FaRegCalendarAlt, manage: FaKey, shield: FaShieldAlt };

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The same navigation everywhere. Signed out, Manage is part of the site;
  // signed in it becomes "My portal" and moves beside the avatar.
  const signedIn = Boolean(user);
  const portalItem = REAL_ESTATE_NAV_ITEMS.find((i) => navItemTarget(i, true) === PORTAL_URL);
  const navItems = signedIn ? REAL_ESTATE_NAV_ITEMS.filter((i) => i !== portalItem) : REAL_ESTATE_NAV_ITEMS;
  return (
    <Bar $scrolled={scrolled}>
      <Inner>
        {/* The logo is home: the landing page for visitors, the main site (Property) once signed in. */}
        <Logo to={user ? MARKETPLACE_URL : '/'} aria-label="EasyMoveZone home">
          <img src="/emz.svg" alt="EasyMoveZone" width="78" height="28" />
        </Logo>

        <Nav>
          {navItems.filter((i) => !i.cta).map((item) => {
            const active = isNavItemActive(item, location.pathname);
            return (
              <Link key={item.to} to={navItemTarget(item, signedIn)} className={active ? 'active' : ''}>
                {navItemLabel(item, signedIn)}
                {item.badge ? <Badge>{item.badge}</Badge> : null}
                {active && <Underline layoutId="nav-underline" transition={springy} />}
              </Link>
            );
          })}
        </Nav>

        <Right>
          {navItems.filter((i) => i.cta).map((item) => {
            const Icon = CTA_ICONS[item.icon] || FaRegCalendarAlt;
            // An external CTA opens a booking calendar; an internal one routes.
            const linkProps = item.external
              ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
              : { as: RouterLink, to: item.to };
            return (
              <Cta key={item.label} {...linkProps} aria-label={item.label}>
                <span className="cta-label">{item.label}</span>
                <span className="cta-icon"><Icon /></span>
              </Cta>
            );
          })}
          {signedIn && portalItem && (
            <PortalBtn to={PORTAL_URL}>
              <FaThLarge aria-hidden="true" /> {navItemLabel(portalItem, true)}
            </PortalBtn>
          )}
          <AccountMenu />
        </Right>
      </Inner>

    </Bar>
  );
}
