import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import { MANAGE_URL, TENANT_URL, AGENT_URL, rememberedPortalRole } from '../config/platform';

/**
 * `/portal` — "My portal" in the navbar once signed in.
 *
 * One portal, three hats in the sidebar: My listings (homes you post),
 * Managed for me (we let and run it), and Tenant. This opens the hat this
 * device used last; otherwise a verified agency's listings; otherwise the
 * tenant side for an account that only rents; otherwise the managed side.
 */
export default function PortalPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [roles, setRoles] = useState(null);
  const [agent, setAgent] = useState(null);
  const remembered = rememberedPortalRole();
  const email = user?.email;

  useEffect(() => {
    if (!email || remembered) return undefined;
    let live = true;
    Promise.all([
      api.tenant.roles(email).catch(() => ({ owner: 0, tenant: 0, applicant: 0 })),
      api.agent.me().catch(() => null),
    ]).then(([r, a]) => {
      if (!live) return;
      setRoles(r);
      setAgent(a);
    });
    return () => { live = false; };
  }, [email, remembered]);

  if (loading) return <Loader />;
  if (!email) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (remembered === 'agent') return <Navigate to={AGENT_URL} replace />;
  if (remembered === 'tenant') return <Navigate to={TENANT_URL} replace />;
  if (remembered === 'owner') return <Navigate to={MANAGE_URL} replace />;
  if (!roles) return <Loader />;

  if (agent?.membership?.verification_status === 'verified') return <Navigate to={AGENT_URL} replace />;
  const rentsOnly = !(roles.owner > 0) && (roles.tenant > 0 || roles.applicant > 0);
  return <Navigate to={rentsOnly ? TENANT_URL : MANAGE_URL} replace />;
}
