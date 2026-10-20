import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import { MANAGE_URL, TENANT_URL, rememberedPortalRole } from '../config/platform';

/**
 * `/portal` — "My portal" in the navbar once signed in.
 *
 * There is one portal with an Owner / Tenant switch in its sidebar, so this
 * never asks: it opens the side this device used last; otherwise the tenant
 * side for an account that only rents (or applied to); otherwise the owner side.
 */
export default function PortalPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [roles, setRoles] = useState(null);
  const remembered = rememberedPortalRole();
  const email = user?.email;

  useEffect(() => {
    if (!email || remembered) return undefined;
    let live = true;
    api.tenant.roles(email)
      .then((r) => { if (live) setRoles(r); })
      .catch(() => { if (live) setRoles({ owner: 0, tenant: 0, applicant: 0 }); });
    return () => { live = false; };
  }, [email, remembered]);

  if (loading) return <Loader />;
  if (!email) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (remembered) return <Navigate to={remembered === 'tenant' ? TENANT_URL : MANAGE_URL} replace />;
  if (!roles) return <Loader />;

  const rentsOnly = !(roles.owner > 0) && (roles.tenant > 0 || roles.applicant > 0);
  return <Navigate to={rentsOnly ? TENANT_URL : MANAGE_URL} replace />;
}
