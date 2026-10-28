import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaKey, FaCheckCircle } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Loader from '../components/Loader';
import { TENANT_URL, CONTACT_URL, rememberPortalRole } from '../config/platform';

/**
 * `/portal/tenant/join/:token` — the link the desk sends a tenant (Admin →
 * Management → Invite tenant). It shows which home it is for, asks the tenant
 * to sign in (or create an account), then attaches the tenancy to that
 * account. Single use, 14 days; a newer link replaces an older one.
 */

const Wrap = styled.div`
  min-height: 100vh;
  background: var(--color-bg-panel);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem 3rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 460px;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.6rem;
  text-align: center;

  img.logo { width: 132px; height: auto; margin-bottom: 1.25rem; }
  .ic { width: 52px; height: 52px; margin: 0 auto 0.9rem; border-radius: 16px; display: grid; place-items: center; background: var(--color-green-soft); color: var(--color-green-deep); font-size: 1.2rem; }
  h1 { font-size: 1.35rem; font-weight: 650; letter-spacing: -0.02em; margin: 0; }
  .home { margin: 0.9rem 0 0.2rem; font-weight: 650; }
  .where { color: var(--color-ink-muted); font-size: 0.9rem; }
  p { color: var(--color-ink-muted); font-size: 0.92rem; line-height: 1.55; margin: 0.9rem 0 0; }
  .err { color: #b91c1c; }
`;

const Primary = styled.button`
  display: block;
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.85rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-green-deep);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 650;
  cursor: pointer;
  text-align: center;
  &:hover { background: var(--color-green-forest); color: #fff; }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const Secondary = styled(Link)`
  display: inline-block;
  margin-top: 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-green-deep);
`;

const STATE_TEXT = {
  used: 'This link has already been used. If that was you, open your tenant portal; if not, ask your manager for a new link.',
  revoked: 'A newer link was sent for this home, so this one no longer works. Use the latest message from your manager.',
  expired: 'This link has expired. Ask your manager for a new one.',
  ended: 'This tenancy has ended, so the link no longer works.',
};

export default function TenantJoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.tenant.invite(token).then(setInvite).catch((err) => setError(err?.message || 'This invite link is not valid.'));
  }, [token]);

  const accept = async () => {
    setBusy(true); setError('');
    try {
      await api.tenant.acceptInvite(token);
      rememberPortalRole('tenant');
      setDone(true);
      setTimeout(() => navigate(TENANT_URL, { replace: true }), 900);
    } catch (err) {
      setError(err?.message || 'Could not link your tenancy.');
      setBusy(false);
    }
  };

  if (loading || (!invite && !error)) return <Loader />;

  const here = `${TENANT_URL}/join/${token}`;
  return (
    <Wrap>
      <Card>
        <img className="logo" src="/emz.svg" alt="EasyMoveZone" />
        <div className="ic">{done ? <FaCheckCircle /> : <FaKey />}</div>
        {invite ? (
          <>
            <h1>{done ? 'You are all set' : `${invite.firstName ? `${invite.firstName}, your` : 'Your'} tenant portal`}</h1>
            <div className="home">{invite.property}{invite.unit ? ` · ${invite.unit}` : ''}</div>
            {invite.where && <div className="where">{invite.where}</div>}
            {invite.state !== 'ok' ? (
              <>
                <p>{STATE_TEXT[invite.state]}</p>
                {invite.state === 'used' && user && <Primary as={Link} to={TENANT_URL}>Open my tenant portal</Primary>}
                <Secondary to={CONTACT_URL}>Contact us</Secondary>
              </>
            ) : done ? (
              <p>Opening your tenant portal…</p>
            ) : user ? (
              <>
                <p>Link this home to <b>{user.email}</b>? You will see your rent, report repairs and read your tenancy agreement here.</p>
                <Primary type="button" onClick={accept} disabled={busy}>{busy ? 'Linking…' : 'Yes, open my tenant portal'}</Primary>
                <p style={{ fontSize: '0.8rem' }}>Not you? Sign out first, then open the link again.</p>
              </>
            ) : (
              <>
                <p>Sign in, or create a free account, to open your tenant portal. Use any email you like — the link connects it to this home.</p>
                <Primary as={Link} to={{ pathname: '/auth', search: '?mode=signup' }} state={{ from: { pathname: here } }}>Create my account</Primary>
                <Secondary to="/auth" state={{ from: { pathname: here } }}>I already have an account</Secondary>
              </>
            )}
          </>
        ) : null}
        {error && <p className="err">{error}</p>}
      </Card>
    </Wrap>
  );
}
