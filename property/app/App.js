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
  MARKETPLACE_URL, MANAGE_URL, MANAGE_PLAN_URL, MANAGE_CONSULT_URL,
  legacyPortalPath,
} from './config/platform';

const SiteAuthRedirect = lazy(() => import('./components/SiteAuthRedirect'));
const MovingRoutes = lazy(() => import('./pages/MovingRoutes'));
const RealEstateLandingPage = lazy(() => import('./pages/RealEstateLandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RentalCheckPage = lazy(() => import('./pages/RentalCheckPage'));
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
const AreasPage = lazy(() => import('./pages/AreasPage'));
const AgentsDirectoryPage = lazy(() => import('./pages/AgentsDirectoryPage'));
const AgentApplyPage = lazy(() => import('./pages/AgentApplyPage'));
const AgentConsolePage = lazy(() => import('./pages/AgentConsolePage'));

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
  plan: MANAGE_PLAN_URL,
  bookings: MANAGE_CONSULT_URL,
};

function LegacyMyHubRedirect() {
  const { search } = useLocation();
  const tab = new URLSearchParams(search).get('tab');
  return <Navigate to={HUB_TABS[tab] || MANAGE_URL} replace />;
}

/**
 * Every signed-in page moved under `/portal`. Old `/manage/…`, `/tenant…` and
 * `/agent…` links (emails, notifications, bookmarks) land on the same page.
 * The middleware does this on a full page load; this covers in-app clicks.
 */
function LegacyPortalRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`${legacyPortalPath(pathname) || '/portal'}${search}${hash}`} replace />;
}

function ListRedirect() {
  const { hash } = useLocation();
  return <Navigate to={`/manage?let=list${hash || ''}`} replace />;
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
                <Route path="/check" element={<RentalCheckPage />} />
                <Route path="/renovate" element={<MarketplacePage page="renovate" />} />

                {/* Manage has a public service page before the signed-in console. */}
                <Route path="/manage" element={<VisitorOnly signedIn={MANAGE_URL}><ManageLandingPage /></VisitorOnly>} />
                <Route path="/list" element={<ListRedirect />} />
                <Route path="/consult" element={<PublicConsultPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/areas/*" element={<AreasPage />} />
                <Route path="/agents/:slug" element={<AgentsDirectoryPage />} />
                <Route path="/agents" element={<AgentsDirectoryPage />} />
                <Route path="/faq" element={<Navigate to="/help" replace />} />
                <Route path="/saved" element={<Navigate to="/listings/saved" replace />} />
                {/* Signed in, "My portal" picks the owner console or the tenant portal. */}
                {/* The portal: one address for everything signed in. */}
                <Route path="/portal" element={<PortalPage />} />
                <Route path="/portal/landlord/*" element={<ManageConsolePage />} />
                <Route path="/portal/tenant/join/:token" element={<TenantJoinPage />} />
                <Route path="/portal/tenant/*" element={<TenantConsolePage />} />
                <Route path="/portal/agent/apply" element={<AgentApplyPage />} />
                <Route path="/portal/agent/*" element={<AgentConsolePage />} />
                <Route path="/portal/*" element={<Navigate to="/portal" replace />} />
                <Route path="/manage/*" element={<LegacyPortalRedirect />} />
                <Route path="/tenant/*" element={<LegacyPortalRedirect />} />
                <Route path="/agent/*" element={<LegacyPortalRedirect />} />

                <Route path="/my-hub" element={<LegacyMyHubRedirect />} />
                <Route path="/profile" element={<LegacyMyHubRedirect />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/auth/*" element={<SiteAuthRedirect />} />
                {/* Moving logistics: one page, checkout and its legal pages. */}
                <Route path="/moving/*" element={<MovingRoutes />} />

                {/* A rental platform now: buying, selling and mortgages are gone. */}
                <Route path="/verify/*" element={<Navigate to="/check" replace />} />
                <Route path="/mortgage/*" element={<Navigate to="/listings" replace />} />
                <Route path="/buy" element={<Navigate to="/listings" replace />} />
                <Route path="/sell" element={<Navigate to="/list" replace />} />

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
