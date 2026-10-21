import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { SITE_URL } from '../../config/seo';

/** Pieces shared by the neighbourhood pages (pages/AreasPage.jsx). */

export const Panel = styled.section`
  background: #fff; border: 1px solid var(--color-line); border-radius: 18px; padding: 1.25rem; box-shadow: var(--shadow-soft);
  h2 { margin: 0 0 0.25rem; font-size: 1.05rem; }
  .sub { margin: 0 0 1rem; font-size: 0.84rem; color: var(--color-ink-muted); line-height: 1.5; }
  @media (max-width: 560px) { padding: 1.05rem 0.95rem; border-radius: 16px; }
`;

export const Pill = styled.button`
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink)')};
  border-radius: 999px; padding: 0.45rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; white-space: nowrap;
`;

export const PrimaryBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; min-height: 44px; padding: 0 1.15rem;
  border: 0; border-radius: 11px; background: var(--color-green-deep); color: #fff; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  &:hover { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: default; }
`;

export const ErrorText = styled.p`color: #b91c1c; font-size: 0.85rem; margin: 0.6rem 0 0;`;

const ScoreChip = styled.span`
  display: inline-flex; align-items: center; gap: 0.25rem; flex-shrink: 0; padding: 0.3rem 0.6rem; border-radius: 999px;
  background: ${(p) => (p.$empty ? 'var(--color-bg-sunken)' : 'var(--color-green-soft)')};
  color: ${(p) => (p.$empty ? 'var(--color-ink-muted)' : 'var(--color-green-deep)')};
  font-weight: 700; font-size: 0.85rem;
  svg { color: #d4a017; font-size: 0.75rem; }
`;

/** An area's overall score out of 5, or "New" before anyone has rated it. */
export function Score({ value }) {
  if (value == null) return <ScoreChip $empty>New</ScoreChip>;
  return <ScoreChip aria-label={`${value.toFixed(1)} out of 5`}><FaStar />{value.toFixed(1)}</ScoreChip>;
}

/** A state as people say it: "FCT - Abuja" reads "Abuja (FCT)". */
export function stateLabel(state) {
  return state === 'FCT - Abuja' ? 'Abuja (FCT)' : state;
}

/** A WhatsApp link that shares `text` and a page of this site, the way most Nigerians pass a link on. */
export function whatsappShare(text, path) {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${SITE_URL}${path}`)}`;
}

/** "3h ago", "2d ago", else a date. */
export function timeAgo(value) {
  const then = new Date(value);
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  if (mins < 60 * 24 * 14) return `${Math.round(mins / 1440)}d ago`;
  return then.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const SignIn = styled(Link)`
  display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; color: var(--color-green-deep);
  &:hover { text-decoration: underline; }
`;

/** A link to sign in that brings the person back to this page afterwards (as SignInGate does). */
export function SignInLink({ children = 'Sign in' }) {
  const location = useLocation();
  const remember = () => {
    try { sessionStorage.setItem('auth_return_path', `${location.pathname}${location.search || ''}`); } catch { /* ignore */ }
  };
  return (
    <SignIn to={{ pathname: '/auth' }} state={{ from: { pathname: location.pathname, search: location.search || '' } }} onClick={remember}>
      {children}
    </SignIn>
  );
}
