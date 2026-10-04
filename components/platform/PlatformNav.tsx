"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  UserRound,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { useToast } from "@/components/ui/Toast";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants";
import { SiteLogo } from "@/components/brand/SiteLogo";

const NAV = [
  {
    href: "/book",
    label: "Book a move",
    match: (path: string) => path === "/book",
    featured: true,
  },
  {
    href: "/services",
    label: "Services",
    match: (path: string) => path === "/services",
    featured: false,
  },
  {
    href: "/hub",
    label: "Crew hub",
    match: (path: string) => path === "/hub",
    featured: false,
  },
  {
    href: "/partners",
    label: "Partners",
    match: (path: string) => path === "/partners",
    featured: false,
  },
  {
    href: "/coverage",
    label: "Coverage",
    match: (path: string) => path === "/coverage",
    featured: false,
  },
  {
    href: "/track",
    label: "Track my move",
    match: (path: string) => path === "/track",
    featured: false,
  },
] as const;

export function PlatformNav() {
  const pathname = usePathname();
  const toast = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const {
    data: sessionData,
    isPending: sessionPending,
    refetch: refetchSession,
  } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      void refetchSession();
    }, 120);
    return () => clearTimeout(timeout);
  }, [pathname, refetchSession]);

  useEffect(() => {
    const onFocus = () => {
      void refetchSession();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetchSession]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutAndRedirect();
    } catch {
      setSigningOut(false);
      toast.error("We couldn’t sign you out. Please try again.");
    }
  }

  function getInitials(name?: string | null, email?: string | null) {
    if (name) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return email ? email[0].toUpperCase() : "U";
  }

  const user = sessionData?.user ?? null;
  const userId = user?.id ?? null;
  const initials = getInitials(user?.name, user?.email);
  const [adminFor, setAdminFor] = useState<string | null>(null);
  const isAdmin = Boolean(userId) && adminFor === userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { admin: false }))
      .then((data: { admin?: boolean }) => {
        if (!cancelled) setAdminFor(data.admin ? userId : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);
  const authHref = `/auth?redirect=${encodeURIComponent(pathname === "/" ? "/book" : pathname)}`;

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#e4dfd5] bg-[#faf8f2]/95 backdrop-blur-xl"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <SiteLogo href="/" height={28} priority />
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV.map((item) => {
              const active = item.match(pathname);
              if (item.featured) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition ${
                      active
                        ? "bg-[#2f5d50] text-white shadow-sm ring-2 ring-[#2f5d50]/20"
                        : "border border-[#ded7cb] bg-white text-[#1b231e] hover:border-[#2f5d50]/50 hover:text-[#2f5d50]"
                    }`}
                  >
                    <Truck
                      className={`h-3.5 w-3.5 ${active ? "text-white" : "text-[#2f5d50]"}`}
                    />
                    Book a move
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                    active
                      ? "bg-[#1b231e] text-white"
                      : "text-[#4a5047] hover:bg-black/5 hover:text-[#1b231e]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className="relative flex items-center gap-1.5 sm:gap-2"
          ref={menuRef}
        >
          {sessionPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-black/5" />
          ) : user ? (
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2f5d50] to-[#426f62] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-105"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {initials}
            </button>
          ) : (
            <Link
              href={authHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d2c6] bg-white px-3 py-2 text-[12px] font-semibold text-[#4a5047] transition hover:border-[#e0511f]/40 hover:text-[#1b231e] sm:px-4 sm:text-[13px]"
            >
              <UserRound className="h-3.5 w-3.5 opacity-80" />
              <span className="hidden xs:inline sm:inline">Sign in</span>
              <span className="sm:hidden">Sign in</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6e746b] transition hover:bg-black/5 hover:text-[#1b231e] lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 max-h-[min(80vh,520px)] w-[min(100vw-2rem,280px)] overflow-y-auto overscroll-contain rounded-2xl border border-[#e4dfd5] bg-white py-2 shadow-2xl shadow-black/10">
              {user && (
                <div className="border-b border-[#efe9dd] px-4 pb-2.5 pt-1">
                  <p className="truncate text-[13px] font-semibold text-[#1b231e]">
                    {user.name ?? "Account"}
                  </p>
                  <p className="truncate text-[11px] text-[#9aa097]">
                    {user.email}
                  </p>
                </div>
              )}

              <div className="lg:hidden">
                {NAV.map((item) => {
                  const active = item.match(pathname);
                  if (item.featured) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`mx-2 mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
                          active
                            ? "bg-[#2f5d50] text-white"
                            : "border border-[#ded7cb] bg-[#faf8f3] text-[#1b231e]"
                        }`}
                      >
                        <Truck
                          className={`h-3.5 w-3.5 ${active ? "text-white" : "text-[#2f5d50]"}`}
                        />
                        Book a move
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition ${
                        active
                          ? "bg-[#fbeae0] text-[#e0511f]"
                          : "text-[#4a5047] hover:bg-[#faf8f3] hover:text-[#1b231e]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="my-1 border-t border-[#efe9dd]" />
              </div>

              {user ? (
                <>
                  <Link
                    href="/hub"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                  >
                    <Truck className="h-4 w-4 text-[#9aa097]" />
                    Crew hub
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                  >
                    <User className="h-4 w-4 text-[#9aa097]" />
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#2f5d50] transition hover:bg-[#faf8f3]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#c0492a] transition hover:bg-[#fbeae0]"
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </>
              ) : (
                <Link
                  href={`${authHref}&mode=signup`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                >
                  <UserRound className="h-4 w-4 text-[#9aa097]" />
                  Create account
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
