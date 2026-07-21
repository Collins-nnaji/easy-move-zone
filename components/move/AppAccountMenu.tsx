"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { menuPanel, softSpring } from "@/lib/motion/presets";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Briefcase, LogOut, MoreHorizontal, Truck, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type AppRole = "driver" | "fleet";

type AppAccountMenuProps = {
  role: AppRole;
  compact?: boolean;
};

export function AppAccountMenu({ role, compact = false }: AppAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const otherHref = role === "driver" ? "/fleet/dashboard" : "/move/shifts";
  const otherLabel = role === "driver" ? "Open company console" : "Open driver app";
  const OtherIcon = role === "driver" ? Briefcase : Truck;
  const profileHref = role === "driver" ? "/profile/driver" : "/profile/company";
  const profileLabel = role === "driver" ? "Driver profile" : "Company profile";

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
    await authClient.signOut();
    window.location.href = "/";
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
            <Link
              href="/profile"
              role="menuitem"
              className="move-account__item"
              onClick={() => setOpen(false)}
            >
              <UserRound size={15} />
              All profiles
            </Link>
            <Link
              href={otherHref}
              role="menuitem"
              className="move-account__item"
              onClick={() => setOpen(false)}
            >
              <OtherIcon size={15} />
              {otherLabel}
            </Link>
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
