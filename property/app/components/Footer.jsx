import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { AGENT_APPLY_URL, AREAS_URL, RENT_URL, RENTAL_CHECK_URL } from '../config/platform';

/**
 * Editorial footer. The wordmark is set in the display face so the orange
 * logo stays in the header only. Product links live in three short columns.
 */
const FooterContainer = styled.footer`
  background: #101218;
  color: #f4f3ef;
  width: 100%;

  a { color: inherit; }
  a:hover { color: #fff; }

  @media (max-width: 960px) {
    display: ${(p) => (p.$showOnMobile ? 'block' : 'none')};
    padding-bottom: calc(var(--mobile-tabbar-h) + env(safe-area-inset-bottom, 0px));
  }
`;

const Inner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 3.25rem 1.5rem 1.5rem;

  @media (max-width: 720px) { padding: 2.25rem 1.125rem 1.25rem; }
`;

const Top = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr);
  gap: 2.5rem 3rem;
  padding-bottom: 2.25rem;
  border-bottom: 1px solid rgba(244, 243, 239, 0.12);

  @media (max-width: 800px) { grid-template-columns: minmax(0, 1fr); gap: 1.75rem; }
`;

const Brand = styled.div`
  max-width: 28rem;
`;

const Wordmark = styled(Link)`
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 2.4vw, 2.15rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  color: #f4f3ef;

  &:hover { color: #fff; }
`;

const Promise = styled.p`
  margin: 0.85rem 0 0;
  max-width: 32ch;
  color: rgba(244, 243, 239, 0.62);
  font-size: 0.95rem;
  line-height: 1.55;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;

  @media (max-width: 560px) { grid-template-columns: 1fr 1fr; }
`;

const Col = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;

  h2 {
    margin: 0 0 0.35rem;
    font-family: var(--font-sans);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #FBB03B;
  }

  a {
    color: rgba(244, 243, 239, 0.78);
    font-size: 0.92rem;
    font-weight: 550;
    letter-spacing: -0.01em;
  }
  a:hover { color: #fff; }
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1.15rem;
  color: rgba(244, 243, 239, 0.45);
  font-size: 0.8rem;
`;

const Legal = styled.nav`
  display: flex;
  gap: 1.1rem;
  a { color: rgba(244, 243, 239, 0.55); font-weight: 600; }
  a:hover { color: #fff; }
`;

const Footer = () => {
  const location = useLocation();

  return (
    <FooterContainer $showOnMobile={location.pathname === '/'}>
      <Inner>
        <Top>
          <Brand>
            <Wordmark to="/">EasyMoveZone</Wordmark>
            <Promise>Verified homes, a clear neighbourhood, and a letting you do not have to run yourself.</Promise>
          </Brand>
          <Cols>
            <Col aria-label="Rent">
              <h2>Rent</h2>
              <Link to={RENT_URL}>Browse homes</Link>
              <Link to={RENTAL_CHECK_URL}>Verify a rental</Link>
              <Link to={AREAS_URL}>Neighbourhoods</Link>
            </Col>
            <Col aria-label="Owners">
              <h2>Owners</h2>
              <Link to="/manage">We run the property</Link>
              <Link to="/manage?let=list">List the home yourself</Link>
              <Link to={AGENT_APPLY_URL}>For agents</Link>
            </Col>
            <Col aria-label="Company">
              <h2>Company</h2>
              <Link to="/moving">Moving</Link>
              <Link to="/help">Help</Link>
              <Link to="/contact">Contact</Link>
            </Col>
          </Cols>
        </Top>
        <Bottom>
          <span>&copy; {new Date().getFullYear()} EasyMoveZone</span>
          <Legal aria-label="Legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </Legal>
        </Bottom>
      </Inner>
    </FooterContainer>
  );
};

export default Footer;
