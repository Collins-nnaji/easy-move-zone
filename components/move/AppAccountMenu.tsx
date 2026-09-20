"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { menuPanel, softSpring } from "@/lib/motion/presets";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, LogOut, MoreHorizontal, ShieldCheck, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type AppRole = "driver" | "fleet";

type AppAccountMenuProps = {
  role: AppRole;
  compact?: boolean;
};

export function AppAccountMenu({ role, compact = false }: AppAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Reveal the Admin console entry only for users on the admin allowlist.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : { admin: false }))
      .then((data: { admin?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(data.admin));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const profileHref = role === "driver" ? "/profile/driver" : "/profile/company";
  const profileLabel = role === "driver" ? "Carrier profile" : "Shipper profile";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setOpen(false);
    try {
      await authClient.signOut();
    } catch {
      // Even if the request errors, fall through to a hard navigation so the
      // user is never left stuck on a signed-in-looking screen.
    }
    // Hard navigation (not router.push) guarantees the in-memory session cache
    // is dropped and every server component re-reads the cleared cookie.
    window.location.href = "/start";
  }

  return (
    <div className={`move-account${compact ? " move-account--compact" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="move-account__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        {compact ? <MoreHorizontal size={18} /> : (
          <>
            <UserRound size={16} />
            <span>Account</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="move-account__menu"
            role="menu"
            variants={reduceMotion ? undefined : menuPanel}
            initial={reduceMotion ? false : "initial"}
            animate="animate"
            exit="exit"
            transition={softSpring}
          >
            <Link
              href={profileHref}
              role="menuitem"
              className="move-account__item"
              onClick={() => setOpen(false)}
            >
              <UserRound size={15} />
              {profileLabel}
            </Link>
            {/* Switching between the driver app and company console happens in
                the account section (/profile), not from a toggle inside the
                app — the same place Uber puts it. */}
            <Link
              href="/profile"
              role="menuitem"
              className="move-account__item"
              onClick={() => setOpen(false)}
            >
              <ArrowRightLeft size={15} />
              Switch account type
            </Link>
            {isAdmin && (
              <Link
                href="/admin/kyc"
                role="menuitem"
                className="move-account__item"
                onClick={() => setOpen(false)}
              >
                <ShieldCheck size={15} />
                Admin · KYC review
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              className="move-account__item move-account__item--danger"
              onClick={() => void signOut()}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
