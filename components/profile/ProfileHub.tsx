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
  // Which profiles this account actually holds. A card is only "active" if its
  // role is in here — otherwise it renders as an invitation to add it.
  const [roles, setRoles] = useState<string[]>([]);
  const [adding, setAdding] = useState<"driver" | "company" | null>(null);

  const hasDriver = roles.includes("driver");
  const hasCompany = roles.includes("company");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const rolesRes = await fetch("/api/auth/roles");
        const rolesData = (await rolesRes.json().catch(() => ({}))) as { roles?: string[] };
        const held = rolesData.roles ?? [];
        if (!mounted) return;
        setRoles(held);

        // Only load a workspace for a role the account holds — fetching the
        // other one would create its profile as a side effect.
        const [d, f] = await Promise.all([
          held.includes("driver") ? fetchDriverWorkspace({ zone: "All zones" }) : Promise.resolve(null),
          held.includes("company") ? fetchFleetWorkspace() : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setDriver(d?.profile ?? null);
        setFleet(f?.profile ?? null);
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

  /** Add the missing profile to this same login, then open its app. */
  async function addRole(role: "driver" | "company") {
    setAdding(role);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = (await res.json().catch(() => ({}))) as { home?: string; error?: string };
      if (!res.ok) throw new Error(payload.error || "Could not add that profile.");
      window.location.href = payload.home ?? (role === "driver" ? "/move/shifts" : "/fleet/dashboard");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not add that profile.");
      setAdding(null);
    }
  }

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
          {hasDriver && hasCompany ? (
            <>
              One login, two separate profiles. Open your <strong>Driver</strong> profile to find and run jobs,
              or your <strong>Company</strong> profile to post work and manage fleet ops — this is where you
              switch between them.
            </>
          ) : (
            <>
              One login can hold both profiles. Use <strong>Driver</strong> to find and run jobs, and{" "}
              <strong>Company</strong> to post work and hire drivers — add the other side anytime, right here.
            </>
          )}
        </p>

        {errorMsg && <p className="mt-4 text-sm font-semibold text-[#c0492a]">{errorMsg}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-5">
            <div className="flex items-center gap-2 text-[#e0511f]">
              <Truck className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Driver profile</span>
            </div>
            {hasDriver ? (
              <>
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
              </>
            ) : (
              <>
                <div className="mt-3 text-lg font-extrabold text-[#1b231e]">Not set up</div>
                <p className="mt-1 text-sm text-[#6e746b]">
                  Add a driver profile to claim funded jobs and cash out — same login.
                </p>
                <button
                  type="button"
                  onClick={() => void addRole("driver")}
                  disabled={adding !== null}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b231e] py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {adding === "driver" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                    </>
                  ) : (
                    "Become a driver"
                  )}
                </button>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-5">
            <div className="flex items-center gap-2 text-[#e0511f]">
              <Briefcase className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Company profile</span>
            </div>
            {hasCompany ? (
              <>
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
              </>
            ) : (
              <>
                <div className="mt-3 text-lg font-extrabold text-[#1b231e]">Not set up</div>
                <p className="mt-1 text-sm text-[#6e746b]">
                  Add a company profile to post funded jobs and hire drivers — same login.
                </p>
                <button
                  type="button"
                  onClick={() => void addRole("company")}
                  disabled={adding !== null}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b231e] py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {adding === "company" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                    </>
                  ) : (
                    "Register a company"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-5 flex items-start gap-2 text-sm text-[#5f655c]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7d4f]" />
          Switching apps never mixes your driver earnings with company funds — each profile keeps its own data.
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
