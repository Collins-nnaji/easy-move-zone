import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Navigate, useLocation,
} from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/Layout';
import Loader from './components/Loader';
import { AuthProvider, useAuth } from './AuthContext';
import {
  MARKETPLACE_URL, MANAGE_URL, MANAGE_VERIFICATIONS_URL, MANAGE_OFFERS_URL, MANAGE_PLAN_URL, MANAGE_CONSULT_URL,
} from './config/platform';

const SiteAuthRedirect = lazy(() => import('./components/SiteAuthRedirect'));
const MovingRoutes = lazy(() => import('./pages/MovingRoutes'));
const RealEstateLandingPage = lazy(() => import('./pages/RealEstateLandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const OfferPage = lazy(() => import('./pages/OfferPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const ManageConsolePage = lazy(() => import('./pages/ManageConsolePage'));
const TenantConsolePage = lazy(() => import('./pages/TenantConsolePage'));
const PortalPage = lazy(() => import('./pages/PortalPage'));
const TenantJoinPage = lazy(() => import('./pages/TenantJoinPage'));
const ManageLandingPage = lazy(() => import('./pages/ManageLandingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PublicConsultPage = lazy(() => import('./pages/PublicConsultPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

/**
 * The landing page and the Manage sales page are for visitors. Signed in,
 * the landing page gives way to the main site (Property), and the Manage
 * sales page gives way to the Manage suite itself, which only opens once you
 * are signed in.
 */
function VisitorOnly({ children, signedIn }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to={signedIn} replace /> : children;
}

/** My Hub merged into the console; old links land on the matching tab. */
const HUB_TABS = {
  verifications: MANAGE_VERIFICATIONS_URL,
  deals: MANAGE_OFFERS_URL,
  plan: MANAGE_PLAN_URL,
  bookings: MANAGE_CONSULT_URL,
};

function LegacyMyHubRedirect() {
  const { search } = useLocation();
  const tab = new URLSearchParams(search).get('tab');
  return <Navigate to={HUB_TABS[tab] || MANAGE_URL} replace />;
}

function App() {
  return (
    // reducedMotion="user": every animation in the app honours the OS setting.
    <MotionConfig reducedMotion="user">
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <Suspense fallback={<Loader />}>
            <Layout>
              <Routes>
                {/* Public site: landing, EasyCheck and the property hub. */}
                <Route path="/" element={<VisitorOnly signedIn={MARKETPLACE_URL}><RealEstateLandingPage /></VisitorOnly>} />
                <Route path="/listings/*" element={<MarketplacePage />} />
                <Route path="/verify/*" element={<OfferPage />} />
                <Route path="/renovate" element={<MarketplacePage page="renovate" />} />

                {/* Manage has a public service page before the signed-in console. */}
                <Route path="/manage" element={<VisitorOnly signedIn={MANAGE_URL}><ManageLandingPage /></VisitorOnly>} />
                <Route path="/consult" element={<PublicConsultPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/faq" element={<Navigate to="/help" replace />} />
                <Route path="/saved" element={<Navigate to="/listings/saved" replace />} />
                <Route path="/manage/*" element={<ManageConsolePage />} />
                {/* Signed in, "My portal" picks the owner console or the tenant portal. */}
                <Route path="/portal" element={<PortalPage />} />
                <Route path="/tenant/join/:token" element={<TenantJoinPage />} />
                <Route path="/tenant/*" element={<TenantConsolePage />} />

                <Route path="/my-hub" element={<LegacyMyHubRedirect />} />
                <Route path="/profile" element={<LegacyMyHubRedirect />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/auth/*" element={<SiteAuthRedirect />} />
                {/* Moving logistics: one page, checkout and its legal pages. */}
                <Route path="/moving/*" element={<MovingRoutes />} />

                <Route path="/buy" element={<Navigate to="/listings" replace />} />
                <Route path="/sell" element={<Navigate to="/listings/sell" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Suspense>
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}

export default App;
