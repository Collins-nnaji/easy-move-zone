"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Truck } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";

/**
 * Audience-scoped landing navbar. Each landing page (driver or company) gets
 * its own nav so the two experiences stay fully separate — every link points
 * at that audience's app, with just one small link across to the other side.
 */
export function LandingNav({ audience }: { audience: "driver" | "company" }) {
  const isDriver = audience === "driver";

  const home = isDriver ? "/driver" : "/company";
  const appHref = isDriver ? "/move/shifts" : "/fleet/jobs?post=1";
  const appCta = isDriver ? "Find work" : "Post a job";
  const AppIcon = isDriver ? Truck : Briefcase;
  const otherHref = isDriver ? "/company" : "/driver";
  const otherLabel = isDriver ? "For companies" : "For drivers";
  const signInHref = isDriver ? "/auth?role=driver" : "/auth?role=company";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4dfd5] bg-[#f6f3ec]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <SiteLogo href={home} height={32} priority />
          <span className="hidden rounded-full bg-[#fbeae0] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#c0492a] sm:inline-block">
            {isDriver ? "Driver" : "Company"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#how-it-works"
            className="hidden rounded-full px-3 py-2 text-[13px] font-semibold text-[#4a5047] transition hover:text-[#1b231e] sm:inline-flex"
          >
            How it works
          </a>
          <Link
            href={otherHref}
            className="hidden items-center gap-1.5 rounded-full border border-[#d8d2c6] bg-white px-4 py-2 text-[13px] font-semibold text-[#4a5047] transition hover:border-[#e0511f]/40 sm:inline-flex"
          >
            {otherLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={signInHref}
            className="inline-flex items-center rounded-full px-3 py-2 text-[13px] font-semibold text-[#4a5047] transition hover:text-[#1b231e]"
          >
            Sign in
          </Link>
          <Link
            href={appHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e0511f] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:opacity-90"
          >
            <AppIcon className="h-3.5 w-3.5" />
            {appCta}
          </Link>
        </div>
      </div>
    </header>
  );
}
