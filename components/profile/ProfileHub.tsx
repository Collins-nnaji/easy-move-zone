"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Briefcase, CheckCircle2, Loader2, Truck, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { fetchDriverWorkspace } from "@/lib/driver/client";
import { fetchFleetWorkspace } from "@/lib/fleet/client";
import type { DriverProfile, FleetProfile } from "@/lib/driver/types";
import { formatRating } from "@/lib/marketplace/taxonomy";

interface ProfileHubProps {
  authName: string;
  authEmail: string;
}

export function ProfileHub({ authName, authEmail }: ProfileHubProps) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [fleet, setFleet] = useState<FleetProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [d, f] = await Promise.all([
          fetchDriverWorkspace({ zone: "All zones" }),
          fetchFleetWorkspace(),
        ]);
        if (!mounted) return;
        setDriver(d.profile);
        setFleet(f.profile);
      } catch (err) {
        if (mounted) setErrorMsg(err instanceof Error ? err.message : "Unable to load profiles.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function signOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[#6e746b]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your profiles…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-[#e4dfd5] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0511f] text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1b231e]">Your account</h1>
            <p className="text-sm text-[#6e746b]">{authEmail || authName}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#5f655c]">
          One login, two separate profiles. Use your <strong>Driver</strong> profile to find and run jobs.
          Use your <strong>Company</strong> profile to post work and manage fleet ops — routes stay separate.
        </p>

        {errorMsg && <p className="mt-4 text-sm font-semibold text-[#c0492a]">{errorMsg}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-5">
            <div className="flex items-center gap-2 text-[#e0511f]">
              <Truck className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Driver profile</span>
            </div>
            <div className="mt-3 text-lg font-extrabold text-[#1b231e]">
              {driver?.displayName || authName}
            </div>
            <p className="mt-1 text-sm text-[#6e746b]">
              {driver?.zone ?? "No zone yet"}
              {driver?.onboardingCompleted ? " · Ready" : " · Setup needed"}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#b9781f]">
              {formatRating(driver?.ratingAvg ?? 0, driver?.ratingCount ?? 0)}
              {driver?.verified ? " · Verified" : ""}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/profile/driver"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b231e] py-2.5 text-sm font-bold text-white"
              >
                Edit driver profile
              </Link>
              <Link
                href="/move/shifts"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4dfd5] bg-white py-2.5 text-sm font-bold text-[#1b231e]"
              >
                Open driver app <ArrowUpRight className="h-3.5 w-3.5 text-[#9aa097]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-5">
            <div className="flex items-center gap-2 text-[#e0511f]">
              <Briefcase className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Company profile</span>
            </div>
            <div className="mt-3 text-lg font-extrabold text-[#1b231e]">
              {fleet?.companyName || "Your company"}
            </div>
            <p className="mt-1 text-sm text-[#6e746b]">
              {fleet?.contactName || "No contact yet"} · {fleet?.zone ?? "No zone yet"}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#b9781f]">
              {formatRating(fleet?.ratingAvg ?? 0, fleet?.ratingCount ?? 0)}
              {fleet?.onboardingCompleted ? "" : " · Setup needed"}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/profile/company"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b231e] py-2.5 text-sm font-bold text-white"
              >
                Edit company profile
              </Link>
              <Link
                href="/fleet/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4dfd5] bg-white py-2.5 text-sm font-bold text-[#1b231e]"
              >
                Open company console <ArrowUpRight className="h-3.5 w-3.5 text-[#9aa097]" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 flex items-start gap-2 text-sm text-[#5f655c]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7d4f]" />
          Switching apps never mixes your driver earnings with company escrow — each profile keeps its own data.
        </p>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-6 w-full rounded-2xl border border-[#f3d6c4] py-3 text-sm font-bold text-[#c0492a]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
