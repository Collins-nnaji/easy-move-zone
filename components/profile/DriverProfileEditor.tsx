"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Truck } from "lucide-react";
import { fetchDriverWorkspace, updateDriverProfile } from "@/lib/driver/client";
import { ZONE_OPTIONS } from "@/lib/marketplace/taxonomy";

interface DriverProfileEditorProps {
  authName: string;
}

export function DriverProfileEditor({ authName }: DriverProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [displayName, setDisplayName] = useState(authName);
  const [zone, setZone] = useState("Lagos Mainland");
  const [ratingLine, setRatingLine] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const d = await fetchDriverWorkspace({ zone: "All zones" });
        if (!mounted) return;
        setDisplayName(d.profile.displayName || authName);
        setZone(d.profile.zone || "Lagos Mainland");
        setRatingLine(
          `${d.profile.ratingAvg.toFixed(1)} ★ (${d.profile.ratingCount} reviews)${d.profile.verified ? " · Verified" : ""}`,
        );
      } catch (err) {
        if (mounted) setErrorMsg(err instanceof Error ? err.message : "Unable to load driver profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [authName]);

  async function save() {
    setSaving(true);
    setStatusMsg("");
    setErrorMsg("");
    try {
      await updateDriverProfile({
        displayName,
        zone,
        onboardingCompleted: true,
      });
      setStatusMsg("Driver profile saved.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[#6e746b]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading driver profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-[#e0511f]">
        <ArrowLeft className="h-4 w-4" /> All profiles
      </Link>
      <div className="mt-4 rounded-3xl border border-[#e4dfd5] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbeae0] text-[#e0511f]">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e0511f]">Driver profile</p>
            <h1 className="text-xl font-extrabold text-[#1b231e]">How drivers see you</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#5f655c]">
          This profile is only for finding work and running jobs. Company posting lives under your company profile.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aa097]">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dfd5] px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aa097]">Primary corridor</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dfd5] px-4 py-3 text-sm"
            >
              {ZONE_OPTIONS.map((z) => (
                <option key={z.key} value={z.label}>
                  {z.label} — {z.sub}
                </option>
              ))}
            </select>
          </label>
        </div>

        {ratingLine && (
          <div className="mt-5 rounded-2xl bg-[#faf8f3] px-4 py-3 text-sm text-[#5f655c]">{ratingLine}</div>
        )}
        {statusMsg && (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2f7d4f]">
            <CheckCircle2 className="h-4 w-4" /> {statusMsg}
          </p>
        )}
        {errorMsg && <p className="mt-4 text-sm font-semibold text-[#c0492a]">{errorMsg}</p>}

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="mt-6 w-full rounded-2xl bg-[#e0511f] py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save driver profile"}
        </button>
        <Link
          href="/move/shifts"
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#e4dfd5] py-3 text-sm font-bold text-[#1b231e]"
        >
          Open driver app
        </Link>
      </div>
    </div>
  );
}
