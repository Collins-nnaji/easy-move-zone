import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PROPERTY_MODES, isNavItemActive } from '../config/platform';
import { springy } from './ui';

/**
 * Buy / Rent / Sell inside the one Property section. It sits in the page header (on
 * the grey band), not as a second bar under the navbar, so Property reads as
 * a single page with three modes.
 */
const Wrap = styled.div`
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--color-line-strong);

  @media (max-width: 720px) { display: flex; width: 100%; margin-bottom: 0.8rem; }
`;

const Mode = styled(Link)`
  position: relative;
  z-index: 0;
  min-width: 96px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 650;
  color: var(--color-ink-muted);
  transition: color 0.15s ease;

  &:hover { color: var(--color-ink); }
  &[aria-current='page'] { color: #fff; }

  @media (max-width: 720px) { flex: 1; }
`;

const Pill = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 999px;
  background: var(--color-green-deep);
`;

export default function PropertySwitch() {
  const { pathname } = useLocation();
  return (
    <Wrap role="navigation" aria-label="Buy, rent or sell">
      {PROPERTY_MODES.map((m) => {
        const active = isNavItemActive(m, pathname);
        return (
          <Mode key={m.to} to={m.to} aria-current={active ? 'page' : undefined}>
            {active && <Pill layoutId="property-mode" transition={springy} />}
            {m.label}
          </Mode>
        );
      })}
    </Wrap>
  );
}
