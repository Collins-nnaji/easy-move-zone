import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { isConsolePath, PORTAL_URL } from '../config/platform';

/**
 * Signed in, the portal (/portal, /manage/…, /tenant/…) replaces the site's
 * navbar with its own, so stepping into it is a change of place. A click on
 * any in-app link into the portal from a public page asks first: "Yes, open
 * my portal" goes on, "No, stay here" leaves you where you were.
 *
 * It listens in the capture phase, before react-router's <Link> handles the
 * click, so every way in (navbar, tab bar, menus, page buttons) is covered
 * without each one opting in. New-tab and modified clicks pass straight
 * through, and so does code that navigates on purpose (after a form submits).
 */

/** True for a portal URL. A tenant invite link (/tenant/join/…) is how you get in, so it never asks. */
export function isPortalPath(pathname) {
  if (pathname.startsWith('/tenant/join/')) return false;
  return pathname === PORTAL_URL || isConsolePath(pathname);
}

const Overlay = styled(Dialog.Overlay)`
  position: fixed; inset: 0; z-index: 1000; background: rgba(19, 27, 22, 0.45);
`;
const Content = styled(Dialog.Content)`
  position: fixed; z-index: 1001; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: min(420px, calc(100vw - 32px)); padding: 1.5rem; border-radius: 20px;
  background: #fff; box-shadow: 0 28px 56px -22px rgba(27, 35, 30, 0.35);
  .ic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 0.9rem; background: var(--color-green-soft); color: var(--color-green-deep); }
  &:focus { outline: none; }
`;
const Title = styled(Dialog.Title)`margin: 0 0 0.4rem; font-size: 1.2rem;`;
const Desc = styled(Dialog.Description)`margin: 0 0 1.25rem; font-size: 0.92rem; line-height: 1.55; color: var(--color-ink-muted);`;
const Actions = styled.div`
  display: flex; gap: 0.6rem; flex-wrap: wrap-reverse; justify-content: flex-end;
  button { min-height: 46px; padding: 0 1.15rem; border-radius: 12px; font: inherit; font-weight: 700; font-size: 0.92rem; cursor: pointer; flex: 1 1 140px; }
  .stay { border: 1px solid var(--color-line-strong); background: #fff; color: var(--color-ink); }
  .stay:hover { border-color: var(--color-ink); }
  .go { border: 0; background: var(--color-green-deep); color: #fff; }
  .go:hover { background: var(--color-green-forest); }
`;

export default function PortalEntryPrompt() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const active = Boolean(user) && !isPortalPath(pathname);

  useEffect(() => {
    if (!active) return undefined;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isPortalPath(url.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      setPending(`${url.pathname}${url.search}${url.hash}`);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [active]);

  const go = () => {
    const to = pending;
    setPending(null);
    navigate(to);
  };

  return (
    <Dialog.Root open={Boolean(pending)} onOpenChange={(open) => { if (!open) setPending(null); }}>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <span className="ic" aria-hidden="true"><KeyRound size={20} /></span>
          <Title>Open your portal?</Title>
          <Desc>
            You are leaving the property pages for your portal, where you manage your properties, tenancy, rent and repairs.
            You can come back any time with &ldquo;Back to Property hub&rdquo;.
          </Desc>
          <Actions>
            <Dialog.Close asChild><button type="button" className="stay">No, stay here</button></Dialog.Close>
            <button type="button" className="go" onClick={go} autoFocus>Yes, open my portal</button>
          </Actions>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
