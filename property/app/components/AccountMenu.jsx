import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  FaSignOutAlt, FaRegHeart, FaRegEnvelope, FaRegQuestionCircle, FaRegComments, FaShieldAlt, FaWhatsapp,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useIsMobile } from '../utils/useMediaQuery';
import { useSaved } from '../utils/shortlist';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './shadcn/drawer';
import {
  SAVED_URL, CONTACT_URL, HELP_URL, BOOK_SESSION_URL, RENTAL_CHECK_URL, whatsappLink,
} from '../config/platform';

/* ── Avatar dropdown ─────────────────────────────────────────────── */
const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(145deg, #b85a30 0%, #FBB03B 100%);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(16, 18, 24, 0.08);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(184, 90, 48, 0.7);
    box-shadow: 0 0 0 3px rgba(184, 90, 48, 0.12);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.09);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
  min-width: 210px;
  padding: 0.5rem;
  z-index: 2000;
  opacity: ${p => p.$open ? 1 : 0};
  pointer-events: ${p => p.$open ? 'all' : 'none'};
  transform: ${p => p.$open ? 'translateY(0)' : 'translateY(-6px)'};
  transition: opacity 0.18s ease, transform 0.18s ease;
`;

const DropdownProfile = styled.div`
  padding: 0.65rem 0.85rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.4rem;
`;

const DropdownName = styled.div`
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: -0.011em;
  color: var(--color-ink);
  margin-bottom: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownEmail = styled.div`
  font-size: 0.72rem;
  color: var(--color-ink-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Count = styled.span`
  margin-left: auto;
  min-width: 20px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.05rem 0.4rem;
  background: var(--color-green-soft);
  color: var(--color-green-deep);
`;

const Legal = styled.div`
  display: flex;
  gap: 0.9rem;
  padding: 0.5rem 0.85rem 0.35rem;
  margin-top: 0.25rem;
  border-top: 1px solid #f1f5f9;
  a { font-size: 0.74rem; color: var(--color-ink-faint); }
  a:hover { color: var(--color-green-deep); }
`;

const DropdownLink = styled(RouterLink)`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  background: transparent;
  color: var(--color-ink);
  font-size: 0.83rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  margin-bottom: 0.25rem;

  &:hover {
    background: rgba(184, 90, 48, 0.08);
    color: var(--color-green-deep);
  }

  svg { font-size: 0.8rem; }

  @media (max-width: 720px) { min-height: 44px; padding: 0.75rem 0.85rem; }
`;

const DropdownSignOut = styled.button`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--color-ink-soft);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(239, 68, 68, 0.07);
    color: #dc2626;
  }

  svg { font-size: 0.8rem; }

  @media (max-width: 720px) { min-height: 44px; padding: 0.75rem 0.85rem; }
`;

const SignInLink = styled(RouterLink)`
  padding: 0.55rem 1.05rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-weight: 650;
  font-size: 0.86rem;
  letter-spacing: -0.011em;
  color: #fff;
  border: 0;
  background: var(--gradient-brand);
  text-decoration: none;
  transition: background 0.2s ease;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;

  &:hover {
    color: #fff;
    background: #111111;
  }

  @media (max-width: 420px) {
    padding: 0.48rem 0.72rem;
    font-size: 0.78rem;
  }
`;

/* ── Inline variant (mobile drawers) ─────────────────────────────── */
const InlineLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(15, 23, 42, 0.35);
  padding: 0 0.5rem;
  margin-bottom: 0.35rem;
`;

const InlineName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink);
  padding: 0 0.5rem 0.75rem;
  word-break: break-word;

  span {
    display: block;
    font-size: 0.72rem;
    color: var(--color-ink-faint);
    font-weight: 500;
    margin-top: 0.1rem;
  }
`;

const InlineProfileLink = styled(RouterLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: white;
  color: var(--color-ink);
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 0.5rem;
  &:hover { border-color: rgba(184, 90, 48, 0.45); color: var(--color-green-deep); }
`;

const InlineSignOut = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: white;
  color: var(--color-ink-soft);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 0.5rem;

  &:hover { border-color: rgba(185, 28, 28, 0.3); color: #b91c1c; }
`;

const InlineAuthBtn = styled(RouterLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.85rem;
  background: var(--color-green-deep);
  color: white;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.011em;
  text-decoration: none;
  border-radius: 999px;
  margin-bottom: 0.65rem;
  transition: all 0.25s;

  &:hover { background: var(--color-green-forest); color: #fff; }
`;

export function useAccountIdentity() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || '';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return { user, displayName, initials };
}

/**
 * What the account menu offers. Not Manage — that is already in the navbar
 * and the phone tab bar — but the useful things the nav does not carry:
 * saved properties, help, a way to reach us, and sign out.
 */
function AccountLinks({ onPick }) {
  const saved = useSaved();
  const wa = whatsappLink('Hello EasyMoveZone, ');
  return (
    <>
      <DropdownLink to={SAVED_URL} onClick={onPick}>
        <FaRegHeart /> Saved properties {saved.length > 0 && <Count>{saved.length}</Count>}
      </DropdownLink>
      <DropdownLink to={CONTACT_URL} onClick={onPick}><FaRegEnvelope /> Contact us</DropdownLink>
      {wa && (
        <DropdownLink as="a" href={wa} target="_blank" rel="noopener noreferrer" onClick={onPick}>
          <FaWhatsapp /> Chat on WhatsApp
        </DropdownLink>
      )}
      <DropdownLink to={HELP_URL} onClick={onPick}><FaRegQuestionCircle /> Help and FAQs</DropdownLink>
      <DropdownLink to={BOOK_SESSION_URL} onClick={onPick}><FaRegComments /> Talk to an adviser</DropdownLink>
      <DropdownLink to={RENTAL_CHECK_URL} onClick={onPick}><FaShieldAlt /> Check a rental</DropdownLink>
    </>
  );
}

/**
 * Shared account UI.
 *  - default variant: avatar button — a dropdown on desktop, a bottom sheet
 *    on phones (a 210px dropdown is a poor touch target)
 *  - inline variant: "signed in as" block + sign out (mobile drawers)
 * onAction fires after a navigation/sign-out so callers can close drawers.
 */
const AccountMenu = ({ variant = 'default', onAction }) => {
  const { user, signOut } = useAuth();
  const { displayName, initials } = useAccountIdentity();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef(null);
  const mobile = useIsMobile();

  useEffect(() => {
    if (variant !== 'default' || mobile) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [variant, mobile]);

  const doSignOut = async () => {
    setSigningOut(true);
    setOpen(false);
    onAction?.();
    await signOut();
  };

  const pick = () => { setOpen(false); onAction?.(); };

  if (variant === 'inline') {
    if (user) {
      return (
        <>
          <InlineLabel>Signed in as</InlineLabel>
          <InlineName>
            {displayName}
            {user.email && displayName !== user.email && <span>{user.email}</span>}
          </InlineName>
          <InlineProfileLink to={SAVED_URL} onClick={() => onAction?.()}>
            <FaRegHeart /> Saved properties
          </InlineProfileLink>
          <InlineSignOut type="button" onClick={doSignOut} disabled={signingOut}>
            <FaSignOutAlt /> {signingOut ? 'Signing out…' : 'Sign out'}
          </InlineSignOut>
        </>
      );
    }
    return (
      <InlineAuthBtn to="/auth" onClick={() => onAction?.()}>
        Sign in
      </InlineAuthBtn>
    );
  }

  if (!user) {
    return <SignInLink to="/auth">Sign in</SignInLink>;
  }

  const signOutBtn = (
    <DropdownSignOut type="button" onClick={doSignOut} disabled={signingOut}>
      <FaSignOutAlt /> {signingOut ? 'Signing out…' : 'Sign out'}
    </DropdownSignOut>
  );
  const legal = (
    <Legal>
      <RouterLink to="/privacy" onClick={pick}>Privacy</RouterLink>
      <RouterLink to="/terms" onClick={pick}>Terms</RouterLink>
    </Legal>
  );

  if (mobile) {
    return (
      <>
        <AvatarBtn type="button" onClick={() => setOpen(true)} aria-label="Open account menu" aria-haspopup="dialog">
          {initials}
        </AvatarBtn>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{displayName}</DrawerTitle>
              {user.email && <DrawerDescription>{user.email}</DrawerDescription>}
            </DrawerHeader>
            <div className="px-3" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
              <AccountLinks onPick={pick} />
              {signOutBtn}
              {legal}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <AvatarWrap ref={ref}>
      <AvatarBtn type="button" onClick={() => setOpen(o => !o)} aria-label="Open account menu" aria-expanded={open}>
        {initials}
      </AvatarBtn>
      <DropdownMenu $open={open}>
        <DropdownProfile>
          <DropdownName>{displayName}</DropdownName>
          {user.email && <DropdownEmail>{user.email}</DropdownEmail>}
        </DropdownProfile>
        <AccountLinks onPick={pick} />
        {signOutBtn}
        {legal}
      </DropdownMenu>
    </AvatarWrap>
  );
};

export default AccountMenu;
