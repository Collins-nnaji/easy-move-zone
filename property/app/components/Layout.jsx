import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';
import AdvisorChat from './AdvisorChat';
import Seo from './Seo';
import { useAuth } from '../AuthContext';
import { isConsolePath } from '../config/platform';

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);

  /* Reserve space for the fixed mobile tab bar so nothing hides behind it.
     When the footer is the last thing on screen it carries that space itself
     (in its own colour) — padding here would show as a white band under it
     once the tab bar slides away on scroll. */
  @media (max-width: 960px) {
    padding-bottom: ${(p) => (p.$footerLast ? '0' : 'calc(var(--mobile-tabbar-h) + env(safe-area-inset-bottom, 0px))')};
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [advisorOpen, setAdvisorOpen] = useState(false);

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // EasyAdviser answers from a signed-in owner's own properties, tenancies
  // and payouts, so it stays hidden until there's a session.
  const showAdvisor = Boolean(user) && !location.pathname.startsWith('/auth');

  /**
   * Signed in, the Manage console is a separate portal: it brings its own
   * sidebar and top bar, so the site navbar, tab bar and footer step aside.
   * Signed out it shows a sign-in gate inside the normal site.
   */
  const inConsole = isConsolePath(location.pathname);
  const portal = inConsole && Boolean(user);

  // Every public page ends on the footer on desktop, so no page stops dead
  // without the legal links. On phones the footer itself shows only on the
  // landing page (see Footer). Manage is a working screen, so it ends without one.
  const showFooter = !inConsole;
  // The footer only shows on phones on the landing page (see Footer).
  const footerOnPhone = showFooter && location.pathname === '/';

  return (
    <Wrap $console={inConsole} $footerLast={footerOnPhone || portal}>
      <Seo />
      {!portal && <Navbar />}
      <Main>{children}</Main>
      {showFooter && <Footer />}
      {!portal && <MobileTabBar />}
      {showAdvisor && (
        <AdvisorChat
          open={advisorOpen}
          onOpen={() => setAdvisorOpen(true)}
          onClose={() => setAdvisorOpen(false)}
        />
      )}
    </Wrap>
  );
}
