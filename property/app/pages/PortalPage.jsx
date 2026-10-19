import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FaBuilding, FaKey, FaArrowRight } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import SignInGate from '../components/SignInGate';
import Loader from '../components/Loader';
import {
  MANAGE_URL, TENANT_URL, rememberPortalRole, rememberedPortalRole,
} from '../config/platform';

/**
 * `/portal` — "My portal" in the navbar once signed in.
 *
 * One account can own property, rent a home, or both, so this decides which
 * portal to open: the one this device used last; otherwise the only one the
 * account has anything in; otherwise it asks. `?choose=1` always asks.
 */

const Wrap = styled.div`
  min-height: calc(100vh - var(--nav-h));
  background: var(--color-bg-panel);
  display: flex;
  justify-content: center;
  padding: 3.5rem 1.25rem 5rem;

  @media (max-width: 720px) { padding: 1.75rem 1rem 3rem; }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 760px;

  h1 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 600; letter-spacing: -0.025em; margin: 0; }
  .lead { color: var(--color-ink-muted); margin: 0.5rem 0 1.6rem; font-size: 0.98rem; }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

const Option = styled.button`
  text-align: left;
  cursor: pointer;
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.4rem;
  border-radius: var(--radius-lg);
  background: #fff;
  border: 1.5px solid var(--color-line);
  color: var(--color-ink);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

  .ic { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; background: var(--color-green-soft); color: var(--color-green-deep); font-size: 1.1rem; }
  .t { font-size: 1.15rem; font-weight: 650; letter-spacing: -0.015em; }
  .s { font-size: 0.9rem; color: var(--color-ink-muted); line-height: 1.5; }
  ul { margin: 0.2rem 0 0; padding-left: 1.1rem; font-size: 0.86rem; color: var(--color-ink-muted); line-height: 1.6; }
  .tag { align-self: flex-start; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 999px; background: var(--color-green-wash); color: var(--color-green-deep); border: 1px solid var(--color-line); }
  .go { margin-top: auto; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; color: var(--color-green-deep); }

  &:hover { border-color: var(--color-green); transform: translateY(-2px); box-shadow: var(--shadow-lift); }
`;

const Hint = styled.p`
  margin: 1.4rem 0 0;
  font-size: 0.86rem;
  color: var(--color-ink-muted);
`;

function Chooser({ roles }) {
  const navigate = useNavigate();
  const go = (role) => {
    rememberPortalRole(role);
    navigate(role === 'tenant' ? TENANT_URL : MANAGE_URL);
  };
  const ownerCount = roles?.owner || 0;
  const tenantCount = (roles?.tenant || 0) + (roles?.applicant || 0);

  return (
    <Inner>
      <h1>Which portal do you need?</h1>
      <p className="lead">Pick the one that fits. You can switch at any time from the top of the sidebar.</p>
      <Cards>
        <Option type="button" onClick={() => go('owner')}>
          <span className="ic"><FaBuilding /></span>
          {ownerCount > 0 && <span className="tag">{ownerCount} propert{ownerCount === 1 ? 'y' : 'ies'} on your account</span>}
          <span className="t">I own property</span>
          <span className="s">For landlords and owners whose property EasyMoveZone lets, manages, sells or verifies.</span>
          <ul>
            <li>Rent collected and paid out to you</li>
            <li>Tenants, repairs and approvals</li>
            <li>Statements and documents</li>
          </ul>
          <span className="go">Open the owner portal <FaArrowRight size={11} /></span>
        </Option>
        <Option type="button" onClick={() => go('tenant')}>
          <span className="ic"><FaKey /></span>
          {tenantCount > 0 && <span className="tag">{roles.tenant > 0 ? 'Tenancy on your account' : 'Application on your account'}</span>}
          <span className="t">I rent a home</span>
          <span className="s">For tenants living in a home EasyMoveZone manages, and anyone who applied to rent one.</span>
          <ul>
            <li>Your rent schedule, and tell us you paid</li>
            <li>Report repairs and track them</li>
            <li>Your tenancy agreement and documents</li>
          </ul>
          <span className="go">Open the tenant portal <FaArrowRight size={11} /></span>
        </Option>
      </Cards>
      <Hint>Own one home and rent another? Both portals use the same sign-in.</Hint>
    </Inner>
  );
}

export default function PortalPage() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const choose = params.get('choose') === '1';
  const [roles, setRoles] = useState(null);
  const remembered = rememberedPortalRole();
  const email = user?.email;

  useEffect(() => {
    if (!email) return;
    let live = true;
    api.tenant.roles(email)
      .then((r) => { if (live) setRoles(r); })
      .catch(() => { if (live) setRoles({ owner: 0, tenant: 0, applicant: 0 }); });
    return () => { live = false; };
  }, [email]);

  if (loading) return <Loader />;
  if (!email) {
    return (
      <Wrap>
        <Inner>
          <SignInGate title="Sign in to your portal" action="open your owner or tenant portal">
            <Chooser roles={null} />
          </SignInGate>
        </Inner>
      </Wrap>
    );
  }

  if (!choose && remembered) return <Navigate to={remembered === 'tenant' ? TENANT_URL : MANAGE_URL} replace />;
  if (!roles) return <Loader />;
  if (!choose) {
    const owner = roles.owner > 0;
    const tenant = roles.tenant > 0 || roles.applicant > 0;
    if (owner && !tenant) return <Navigate to={MANAGE_URL} replace />;
    if (tenant && !owner) return <Navigate to={TENANT_URL} replace />;
  }

  return <Wrap><Chooser roles={roles} /></Wrap>;
}
