import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';
import { siteAuthUrl } from '../auth';
import { MARKETPLACE_URL } from '../config/platform';

/**
 * In-app links to /auth (react-router) land here and hand over to the site's
 * real sign-in page with a full navigation, keeping where to come back to.
 */
export default function SiteAuthRedirect() {
  const location = useLocation();

  useEffect(() => {
    let from = location.state?.from;
    if (!from) {
      try { from = sessionStorage.getItem('auth_return_path') || undefined; } catch { /* private mode */ }
    }
    try { sessionStorage.removeItem('auth_return_path'); } catch { /* private mode */ }
    const signup = new URLSearchParams(location.search).get('mode') === 'signup';
    window.location.replace(siteAuthUrl({ from: from || MARKETPLACE_URL, signup }));
  }, [location]);

  return <Loader />;
}
