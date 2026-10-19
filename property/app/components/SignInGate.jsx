import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../AuthContext';

/**
 * Lets visitors view content, but requires sign-in before interacting.
 * Wrap the interactive section (form / console) — keep marketing/hero outside.
 */

const Wrap = styled.div`
  position: relative;
`;

const Dimmed = styled.div`
  pointer-events: none;
  user-select: none;
  filter: saturate(0.92);
  opacity: 0.55;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 1.25rem;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.82) 28%,
    rgba(241, 248, 243, 0.94) 100%
  );
  backdrop-filter: blur(1.5px);
`;

const Card = styled.div`
  position: sticky;
  top: calc(var(--nav-h) + 1.5rem);
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 1.85rem 1.7rem 1.75rem;
  box-shadow: var(--shadow-lift);
  text-align: center;
`;

const Icon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-green-soft);
  color: var(--color-green-deep);
  font-size: 1.1rem;
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin: 0 0 0.5rem;
`;

const Text = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-ink-muted);
  margin: 0 0 1.25rem;
`;

const Btn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  background: var(--color-green-deep);
  color: #fff;
  font-weight: 700;
  font-size: 0.98rem;
  transition: background 0.15s ease;
  &:hover { color: #fff; background: var(--color-green-forest); }
`;

const Secondary = styled(Link)`
  display: inline-block;
  margin-top: 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  &:hover { color: var(--color-ink); }
`;

export default function SignInGate({
  children,
  action = 'continue',
  title = 'Sign in to continue',
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return children;
  if (user) return children;

  const returnPath = `${location.pathname}${location.search || ''}`;
  const authTo = {
    pathname: '/auth',
    state: { from: { pathname: location.pathname, search: location.search || '' } },
  };

  const onClickAuth = () => {
    try {
      sessionStorage.setItem('auth_return_path', returnPath);
    } catch { /* ignore */ }
  };

  return (
    <Wrap>
      <Dimmed aria-hidden>{children}</Dimmed>
      <Overlay>
        <Card>
          <Icon><FaLock /></Icon>
          <Title>{title}</Title>
          <Text>
            You can browse this page freely. Sign in to {action}.
          </Text>
          <Btn to={authTo} onClick={onClickAuth}>
            Sign in <FaArrowRight size={12} />
          </Btn>
          <Secondary to={{ pathname: '/auth', search: '?mode=signup', state: authTo.state }} onClick={onClickAuth}>
            Create a free account
          </Secondary>
        </Card>
      </Overlay>
    </Wrap>
  );
}
