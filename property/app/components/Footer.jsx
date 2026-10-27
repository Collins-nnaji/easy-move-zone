import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { AGENT_APPLY_URL } from '../config/platform';

/**
 * A slim, one-row footer: the logo, Contact and Privacy, and the copyright.
 * Every product page is already in the navbar and the phone tab bar, so the
 * footer only carries what people look for at the bottom of a page.
 */
const FooterContainer = styled.footer`
  background: var(--color-bg-panel);
  border-top: 1px solid var(--color-line);
  color: var(--color-ink);
  width: 100%;

  @media (max-width: 960px) {
    display: ${(p) => (p.$showOnMobile ? 'block' : 'none')};
    /* Room for the tab bar, in the footer's own colour (Layout skips its padding here). */
    padding-bottom: calc(var(--mobile-tabbar-h) + env(safe-area-inset-bottom, 0px));
  }
`;

const Row = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;

  @media (max-width: 720px) { padding: 0.9rem 1.125rem; }
`;

const Wordmark = styled(Link)`
  display: inline-flex;
  align-items: center;
  img { height: 22px; width: auto; }
  &:hover { opacity: 0.85; }
`;

const Links = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;

  a { color: var(--color-ink-muted); font-size: 0.85rem; font-weight: 600; }
  a:hover { color: var(--color-green-deep); }
`;

const Copyright = styled.span`
  color: var(--color-ink-faint);
  font-size: 0.8rem;
`;

const Footer = () => {
  const location = useLocation();

  return (
    <FooterContainer $showOnMobile={location.pathname === '/'}>
      <Row>
        <Wordmark to="/" aria-label="EasyMoveZone home"><img src="/emz.svg" alt="EasyMoveZone" /></Wordmark>
        <Links aria-label="Footer">
          <Link to="/list">List a property</Link>
          <Link to="/list#agents">Find an agent</Link>
          <Link to={AGENT_APPLY_URL}>For agents</Link>
          <Link to="/mortgage">Mortgages</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/privacy">Privacy</Link>
          <Copyright>&copy; {new Date().getFullYear()} EasyMoveZone</Copyright>
        </Links>
      </Row>
    </FooterContainer>
  );
};

export default Footer;
