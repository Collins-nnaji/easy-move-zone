"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Search, Star, MapPin } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MoveAppShell } from "@/app/move/MoveAppShell";
import { AnimatedSheet } from "@/components/move/AnimatedSheet";
import { StaggerItem, StaggerList } from "@/components/move/StaggerList";
import {
  CARGO_OPTIONS,
  CARGO_TAGS,
  VEHICLE_OPTIONS,
  VEHICLE_TAGS,
  ZONE_OPTIONS,
  formatRating,
} from "@/app/move/driver-data";
import {
  bookDriver,
  cancelFleetShift,
  completeFleetShift,
  fetchFleetWorkspace,
  postFleetShift,
  rateFromFleet,
  updateFleetProfile,
} from "@/lib/fleet/client";
import { fundLoad } from "@/lib/payments/client";
import type { BookingOfferSummary, FleetWorkspace, MarketplaceDriver, PendingRating, Shift } from "@/lib/driver/types";
import type { CargoCategory, VehicleType } from "@/lib/marketplace/taxonomy";
import { formatMoney, formatPayoutRate, parseMoneyInput } from "@/lib/money";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { RouteMap, mapsSearchUrl } from "@/components/driver/RouteMap";
import { CountUp } from "@/components/ui/CountUp";
import { useToast } from "@/components/ui/Toast";
import "@/app/move/move.css";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";
const LINE = "#e9e3d8";
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

// Section heading (mono eyebrow) reused across screens — keeps a flat, list-led
// hierarchy instead of wrapping every group in a card.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE }}>
      {children}
    </div>
  );
}

// A slim, single-line notice with an accent left rule — replaces filled banner
// cards for offers / ratings / hints.
function Notice({ tone, children }: { tone: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const c =
    tone === "warn"
      ? { bar: "#e0851f", fg: "#8a5312" }
      : tone === "ok"
        ? { bar: "#2f7d4f", fg: "#2f7d4f" }
        : { bar: PRIMARY, fg: "#9c3f15" };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "10px 0 10px 12px", borderLeft: `2px solid ${c.bar}`, fontSize: 13.5, color: c.fg, fontWeight: 600, lineHeight: 1.45 }}>
      {children}
    </div>
  );
}

// Lightweight empty state — centered text + one action, no boxed border.
function EmptyState({ title, text, cta, onClick }: { title: string; text: string; cta: string; onClick: () => void }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{title}</div>
      <p style={{ fontSize: 14, color: MUTE, margin: "8px auto 0", maxWidth: 300, lineHeight: 1.5 }}>{text}</p>
      <button type="button" onClick={onClick} style={{ marginTop: 18, minHeight: 44, padding: "11px 20px", border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        {cta}
      </button>
    </div>
  );
}

function statusMeta(status: string): { label: string; fg: string; dot: string } {
  switch (status) {
    case "open": return { label: "Open", fg: "#2f7d4f", dot: "#2f7d4f" };
    case "claimed": return { label: "Claimed", fg: "#9a6318", dot: "#e0851f" };
    case "active": return { label: "On the road", fg: "#9c3f15", dot: PRIMARY };
    case "completed": return { label: "Completed", fg: MUTE, dot: "#c4beb2" };
    case "cancelled": return { label: "Cancelled", fg: MUTE, dot: "#c4beb2" };
    default: return { label: status, fg: MUTE, dot: "#c4beb2" };
  }
}

type Screen = "welcome" | "setup" | "dashboard" | "jobs" | "history" | "drivers";

const FLOW_SCREENS: Screen[] = ["welcome", "setup"];
const VALID_PATHS = new Set([
  "/fleet", "/fleet/setup", "/fleet/dashboard", "/fleet/jobs", "/fleet/history", "/fleet/drivers",
  // Legacy aliases → jobs
  "/fleet/post", "/fleet/loads",
]);

function buildPath(screen: Screen): string {
  switch (screen) {
    case "welcome": return "/fleet";
    case "setup": return "/fleet/setup";
    case "dashboard": return "/fleet/dashboard";
    case "jobs": return "/fleet/jobs";
    case "history": return "/fleet/history";
    case "drivers": return "/fleet/drivers";
  }
}

function screenFromPath(pathname: string): Screen {
  const rest = pathname.replace(/^\/fleet\/?/, "");
  if (rest === "") return "welcome";
  if (rest === "setup") return "setup";
  if (rest === "dashboard") return "dashboard";
  if (rest === "jobs" || rest === "post" || rest === "loads") return "jobs";
  if (rest === "history") return "history";
  if (rest === "drivers") return "drivers";
  return "welcome";
}

function formatPayout(shift: Shift) {
  return formatPayoutRate(shift.payout, shift.payoutType);
}

function FlowAside({ title, text, steps }: { title: string; text: string; steps: { n: number; text: string }[] }) {
  return (
    <div className="move-flow-aside">
      <h2 className="move-flow-aside__title">{title}</h2>
      <p className="move-flow-aside__text">{text}</p>
      <div className="move-flow-aside__steps">
        {steps.map((s) => (
          <div key={s.n} className="move-flow-aside__step">
            <div className="move-flow-aside__step-num">{s.n}</div>
            <div className="move-flow-aside__step-text">{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FleetApp() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(pathname));
  const [ready, setReady] = useState(false);
  const [workspace, setWorkspace] = useState<FleetWorkspace | null>(null);
  const [companyName, setCompanyName] = useState("My Fleet");
  const [contactName, setContactName] = useState("");
  const [zoneIdx, setZoneIdx] = useState(0);
  const [driverVehicleFilter, setDriverVehicleFilter] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const toast = useToast();
  const [postSuccess, setPostSuccess] = useState(false);
  const [posting, setPosting] = useState(false);
  const [bookDriverId, setBookDriverId] = useState<string | null>(null);
  const [bookShiftId, setBookShiftId] = useState<string>("");
  const [bookMessage, setBookMessage] = useState("");
  const [bookBusy, setBookBusy] = useState(false);
  const [rateTarget, setRateTarget] = useState<PendingRating | null>(null);
  const [rateStars, setRateStars] = useState(5);
  const [rateComment, setRateComment] = useState("");

  const [postForm, setPostForm] = useState({
    title: "",
    payout: "45000",
    payoutType: "day" as "day" | "hour",
    vehicleType: "box-truck" as VehicleType,
    cargo: "general-freight" as CargoCategory,
    pickup: "",
    dropoff: "",
    startTime: "6:00 AM",
    endTime: "2:00 PM",
    hours: "8",
    distanceMi: "35",
    stops: "4",
    demand: "normal" as "high" | "normal",
    shiftDate: "Today",
  });
  const [postStep, setPostStep] = useState(0);

  const zone = ZONE_OPTIONS[zoneIdx];

  const loadWorkspace = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await fetchFleetWorkspace({
        zone: zone.label,
        vehicleType: driverVehicleFilter,
      });
      setWorkspace(data);
      setCompanyName(data.profile.companyName);
      setContactName(data.profile.contactName ?? "");
      const zIdx = ZONE_OPTIONS.findIndex((z) => z.label === data.profile.zone);
      if (zIdx >= 0) setZoneIdx(zIdx);
      setRateTarget((current) => {
        if (current) return current;
        const pending = data.pendingRatings ?? [];
        if (pending.length > 0) {
          setRateStars(5);
          setRateComment("");
          return pending[0];
        }
        return null;
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load fleet console.");
    }
  }, [zone.label, driverVehicleFilter]);

  useEffect(() => {
    if (ready) return;
    if (!VALID_PATHS.has(pathname)) {
      router.replace("/fleet");
      return;
    }
    // Legacy /fleet/post opens the in-page post flow on Jobs
    if (pathname === "/fleet/post") {
      setPosting(true);
      router.replace("/fleet/jobs");
    } else if (pathname === "/fleet/loads") {
      router.replace("/fleet/jobs");
    }
    setReady(true);
  }, [ready, pathname, router]);

  useEffect(() => {
    if (!ready || FLOW_SCREENS.includes(screen)) return;
    void loadWorkspace();
  }, [ready, loadWorkspace]);

  useEffect(() => {
    const next = screenFromPath(pathname);
    setScreen(next);
    if (next !== "jobs") {
      setPosting(false);
      setPostStep(0);
      setPostSuccess(false);
    }
  }, [pathname]);

  // Route transient action errors to toasts (with retry) instead of a persistent banner.
  useEffect(() => {
    if (!actionError) return;
    toast.error(actionError, { action: { label: "Retry", onClick: () => void loadWorkspace() } });
    setActionError(null);
  }, [actionError, toast, loadWorkspace]);

  useEffect(() => {
    if (!ready) return;
    if (pathname === "/fleet/jobs" && searchParams.get("post") === "1") {
      setPostSuccess(false);
      setPostStep(0);
      setPosting(true);
      router.replace("/fleet/jobs");
    }
  }, [ready, pathname, searchParams, router]);

  const goTo = useCallback((next: Screen) => {
    if (next !== "jobs") {
      setPosting(false);
      setPostStep(0);
      setPostSuccess(false);
    }
    setScreen(next);
    router.push(buildPath(next));
  }, [router]);

  const openPostFlow = useCallback(() => {
    setPostSuccess(false);
    setPostStep(0);
    setPosting(true);
    setScreen("jobs");
    router.push("/fleet/jobs");
  }, [router]);

  const completeSetup = () => {
    void updateFleetProfile({
      companyName,
      contactName: contactName || null,
      zone: zone.label,
      onboardingCompleted: true,
    }).catch(() => undefined);
    goTo("dashboard");
  };

  const handlePostLoad = async () => {
    try {
      setActionError(null);
      const vehicle = VEHICLE_OPTIONS.find((v) => v.key === postForm.vehicleType);
      const { id } = await postFleetShift({
        title: postForm.title || `${vehicle?.label ?? "Job"} route`,
        payoutCents: Math.round(parseMoneyInput(postForm.payout) * 100),
        payoutType: postForm.payoutType,
        vehicleType: postForm.vehicleType,
        vehicleLabel: vehicle?.label ?? postForm.vehicleType,
        cargoCategory: postForm.cargo,
        pickup: postForm.pickup,
        dropoff: postForm.dropoff,
        startTime: postForm.startTime,
        endTime: postForm.endTime,
        hours: parseFloat(postForm.hours),
        zone: zone.label,
        distanceMi: parseInt(postForm.distanceMi, 10),
        stops: parseInt(postForm.stops, 10),
        demand: postForm.demand,
        shiftDate: postForm.shiftDate,
      });
      setPostSuccess(true);
      setPostStep(0);
      // Escrow payout immediately so drivers can book
      if (id) {
        try {
          const fundResult = await fundLoad(id);
          // Stripe Checkout or Paystack both return a hosted payment URL to redirect to.
          if (fundResult.url) {
            window.location.href = fundResult.url;
            return;
          }
        } catch {
          // Job is posted; company can fund it from Jobs if auto-fund fails
        }
      }
      await loadWorkspace();
      setTimeout(() => { setPostSuccess(false); setPosting(false); setPostStep(0); goTo("jobs"); }, 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in to post jobs.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/fleet/jobs?post=1")}`;
        return;
      }
      setActionError(msg);
    }
  };

  const handleComplete = async (shiftId: string) => {
    try {
      setActionError(null);
      await completeFleetShift(shiftId);
      await loadWorkspace();
      toast.success("Job marked complete — please rate your driver");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to complete job.");
    }
  };

  const handleRateSubmit = async () => {
    if (!rateTarget) return;
    try {
      setActionError(null);
      await rateFromFleet({
        shiftId: rateTarget.shiftId,
        stars: rateStars,
        comment: rateComment || undefined,
      });
      setRateTarget(null);
      setRateStars(5);
      setRateComment("");
      await loadWorkspace();
      toast.success("Rating submitted — thanks");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to submit rating.");
    }
  };

  const handleCancel = async (shiftId: string) => {
    try {
      setActionError(null);
      await cancelFleetShift(shiftId);
      await loadWorkspace();
      toast.info("Job cancelled");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to cancel job.");
    }
  };

  const handleFund = async (shiftId: string) => {
    try {
      setActionError(null);
      const result = await fundLoad(shiftId);
      // Stripe Checkout or Paystack both return a hosted payment URL to redirect to.
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      await loadWorkspace();
      toast.success("Job funded and escrowed — drivers can now claim it");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to fund job.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/fleet/jobs")}`;
        return;
      }
      setActionError(msg);
    }
  };

  const handleBookDriver = async () => {
    if (!bookDriverId || !bookShiftId) {
      setActionError("Pick an open job to book this driver.");
      return;
    }
    try {
      setBookBusy(true);
      setActionError(null);
      await bookDriver({
        driverUserId: bookDriverId,
        shiftId: bookShiftId,
        message: bookMessage || undefined,
      });
      setBookDriverId(null);
      setBookShiftId("");
      setBookMessage("");
      await loadWorkspace();
      toast.success("Driver booked — they've been notified");
      goTo("jobs");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to book driver.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/fleet/drivers")}`;
        return;
      }
      setActionError(msg);
    } finally {
      setBookBusy(false);
    }
  };

  const stats = workspace?.stats ?? { openLoads: 0, activeLoads: 0, completedLoads: 0, commissionEarned: 0, totalPosted: 0 };
  const drivers = workspace?.drivers ?? [];
  const postedShifts = workspace?.postedShifts ?? [];
  const activeWorkload = workspace?.activeWorkload ?? [];
  const pendingOffers = workspace?.pendingOffers ?? [];
  const notifications = workspace?.notifications ?? [];
  const pendingRatings = workspace?.pendingRatings ?? [];
  const openLoads = postedShifts.filter((s) => s.status === "open");
  const bookableLoads = openLoads.filter((s) => s.funded);
  const bookingDriver = drivers.find((d) => d.id === bookDriverId) ?? null;

  function Welcome() {
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--welcome">
          <SiteLogo href="/" height={36} />
          <div style={{ marginTop: 56 }}>
            <h1 style={{ fontSize: 40, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textWrap: "balance" } as CSSProperties}>
              Hire drivers.<br />
              <span style={{ color: PRIMARY }}>Move goods across Nigeria.</span>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 340 }}>
              Publish jobs for parcel, heavy goods, tankers, and more. Escrow pay in naira, track drivers live, and only pay the platform fee when a job finishes.
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => goTo("setup")} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>
            Set up company profile
          </button>
          <button onClick={() => goTo("dashboard")} style={{ width: "100%", padding: 15, marginTop: 10, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Skip — open console →
          </button>
          <a
            href="/move/shifts"
            style={{ width: "100%", padding: 16, marginTop: 4, border: "none", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "block", textAlign: "center" }}
          >
            I drive for work — find jobs →
          </a>
          <p style={{ textAlign: "center", fontSize: 13, color: MUTE, margin: "10px 0 0" }}>
            Publishing and escrow need an account · <a href="/auth?redirect=/fleet/dashboard" style={{ color: PRIMARY, fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
        <FlowAside
          title="Company workspace"
          text="Separate from your driver profile. Post jobs, fund escrow, and manage partners under your company name."
          steps={[
            { n: 1, text: "Describe the route, goods, and naira pay" },
            { n: 2, text: "Fund escrow so drivers can claim" },
            { n: 3, text: "Track GPS on active jobs and rate partners" },
          ]}
        />
      </div>
    );
  }

  function Setup() {
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--step">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Fleet setup</div>
          <h2 style={{ fontSize: 27, lineHeight: 1.15, fontWeight: 800, margin: "14px 0 0" }}>Your operation</h2>
          <p style={{ fontSize: 15, color: "#5f655c", margin: "12px 0 0" }}>Company details help drivers trust your jobs on the marketplace.</p>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: ".1em" }}>COMPANY NAME</span>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: ".1em" }}>CONTACT NAME</span>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Dispatch lead" style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
            </label>
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: ".1em", marginBottom: 12 }}>PRIMARY ZONE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ZONE_OPTIONS.map((z, i) => (
                <button key={z.key} type="button" onClick={() => setZoneIdx(i)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${zoneIdx === i ? PRIMARY : "#e4dfd5"}`, background: zoneIdx === i ? PRIMARY : "#fff", color: zoneIdx === i ? "#fff" : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />
          <button onClick={() => completeSetup()} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            Open fleet console →
          </button>
        </div>
        <FlowAside
          title="Commission-based marketplace"
          text="You only pay when a job completes. 8% platform fee — drivers see net pay upfront."
          steps={[
            { n: 1, text: "Heavy goods, tankers, reefers, parcel — all cargo types" },
            { n: 2, text: "Bilateral ratings after every completed job" },
            { n: 3, text: "Independent drivers and truck owners compete on rates" },
          ]}
        />
      </div>
    );
  }

  // Driver rendered as a clean list row (no boxed card). Rows sit inside a
  // divided list so the screen reads as a directory, not a wall of cards.
  function DriverCard({ driver }: { driver: MarketplaceDriver }) {
    const tag = VEHICLE_TAGS[driver.vehicleType];
    return (
      <div style={{ display: "flex", gap: 14, padding: "16px 0", borderTop: `1px solid ${LINE}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{driver.displayName}</div>
            {driver.verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#2f7d4f", fontSize: 11.5, fontWeight: 700 }}>
                <Check size={12} strokeWidth={3} /> Verified
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: MUTE, marginTop: 3 }}>
            {driver.ownerType === "owner" ? "Truck owner" : "Driver"} · {tag.label} · {driver.zone}
            {driver.rateHint ? ` · from ${formatMoney(driver.rateHint)}/day` : ""}
          </div>
          {driver.bio && <p style={{ fontSize: 13, color: "#5f655c", margin: "8px 0 0", lineHeight: 1.45 }}>{driver.bio}</p>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#b9781f" }}>
            <Star size={13} fill="#b9781f" color="#b9781f" />
            {formatRating(driver.ratingAvg, driver.ratingCount)}
          </div>
          <button
            type="button"
            onClick={() => {
              setBookDriverId(driver.id);
              setBookShiftId(bookableLoads[0]?.id ?? "");
            }}
            style={{ padding: "9px 14px", border: `1px solid ${PRIMARY}`, borderRadius: 999, background: "#fff", color: PRIMARY, fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Offer job
          </button>
        </div>
      </div>
    );
  }

  // Job rendered as a list row: title + pay on one line, a single muted meta
  // line, then only the extras that matter (assignee, live map, actions).
  function LoadCard({ shift, showActions }: { shift: Shift; showActions?: boolean }) {
    const vTag = VEHICLE_TAGS[shift.vehicle];
    const cTag = CARGO_TAGS[shift.cargo];
    const st = statusMeta(shift.status);
    const tracking = shift.status === "active" || shift.status === "claimed";
    return (
      <div style={{ padding: "16px 0", borderTop: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, minWidth: 0 }}>{shift.title}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: PRIMARY, whiteSpace: "nowrap" }}>{formatPayout(shift)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 6, fontSize: 12.5, color: MUTE }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: st.fg, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: st.dot }} /> {st.label}
          </span>
          <span>·</span><span>{vTag.label}</span>
          <span>·</span><span>{cTag.label}</span>
          <span>·</span>
          <span style={{ color: shift.funded ? "#2f7d4f" : "#9a6318", fontWeight: 600 }}>{shift.funded ? "Funded" : "Unfunded"}</span>
        </div>
        <p style={{ fontSize: 13.5, color: "#42463f", margin: "8px 0 0", fontWeight: 500 }}>{shift.pickup} → {shift.dropoff}</p>
        <p style={{ fontSize: 12.5, color: MUTE, margin: "3px 0 0" }}>{shift.stops} stops · {shift.distanceMi} km · {shift.startTime}–{shift.endTime}</p>
        {shift.claimedDriverName && (
          <p style={{ fontSize: 13, color: INK, margin: "6px 0 0", fontWeight: 600 }}>Assigned to {shift.claimedDriverName}</p>
        )}
        {tracking && (
          <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: `1px solid ${LINE}` }}>
            <RouteMap
              watchDevice={false}
              clockIn={
                typeof shift.tracking?.clockInLat === "number" && typeof shift.tracking?.clockInLng === "number"
                  ? { lat: shift.tracking.clockInLat, lng: shift.tracking.clockInLng }
                  : null
              }
              live={
                typeof shift.tracking?.lat === "number" && typeof shift.tracking?.lng === "number"
                  ? { lat: shift.tracking.lat, lng: shift.tracking.lng }
                  : null
              }
              emptyLabel={shift.status === "active" ? "Waiting for driver GPS…" : "Tracking starts when the driver clocks in"}
              height={170}
            />
          </div>
        )}
        {showActions && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {shift.status === "open" && !shift.funded && (
              <button type="button" onClick={() => void handleFund(shift.id)} style={{ padding: "9px 16px", borderRadius: 999, border: "none", background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fund escrow</button>
            )}
            {(shift.status === "claimed" || shift.status === "active") && (
              <button type="button" onClick={() => void handleComplete(shift.id)} style={{ padding: "9px 16px", borderRadius: 999, border: "none", background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Mark complete</button>
            )}
            {shift.status === "open" && (
              <button type="button" onClick={() => void handleCancel(shift.id)} style={{ padding: "9px 16px", borderRadius: 999, border: `1px solid ${LINE}`, background: "#fff", color: "#6e746b", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            )}
          </div>
        )}
      </div>
    );
  }

  function Dashboard() {
    const metrics = [
      { label: "Open", value: stats.openLoads, format: (n: number) => String(Math.round(n)) },
      { label: "On road", value: stats.activeLoads, format: (n: number) => String(Math.round(n)) },
      { label: "Done", value: stats.completedLoads, format: (n: number) => String(Math.round(n)) },
      { label: "Fees paid", value: stats.commissionEarned, format: (n: number) => formatMoney(n) },
    ];
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <Eyebrow>{companyName} · {zone.label}</Eyebrow>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 18px" }}>Today&apos;s operations</h2>

          {/* Flat stat strip — one hairline-framed row, no per-stat boxes */}
          <div style={{ display: "flex", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            {metrics.map((m, i) => (
              <div key={m.label} style={{ flex: 1, minWidth: 0, padding: "14px 6px 14px 0", borderLeft: i === 0 ? "none" : `1px solid ${LINE}`, paddingLeft: i === 0 ? 0 : 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: MUTE, whiteSpace: "nowrap" }}>{m.label}</div>
                <CountUp value={m.value} format={m.format} style={{ display: "block", fontSize: 18, fontWeight: 800, marginTop: 4, color: INK, letterSpacing: "-.01em" }} />
              </div>
            ))}
          </div>

          {(notifications[0] || pendingOffers.length > 0 || pendingRatings.length > 0) && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              {notifications[0] && (
                <Notice tone="ok"><span><strong style={{ fontWeight: 800 }}>{notifications[0].title}</strong> — {notifications[0].body}</span></Notice>
              )}
              {pendingOffers.length > 0 && (
                <Notice tone="info">{pendingOffers.length} booking offer{pendingOffers.length === 1 ? "" : "s"} waiting for driver accept</Notice>
              )}
              {pendingRatings.length > 0 && (
                <Notice tone="warn">{pendingRatings.length} completed job{pendingRatings.length === 1 ? "" : "s"} waiting for your rating</Notice>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 0" }}>
            <Eyebrow>Active workload</Eyebrow>
            {activeWorkload.length > 0 && (
              <button type="button" onClick={() => goTo("jobs")} style={{ display: "inline-flex", alignItems: "center", gap: 2, border: "none", background: "none", color: PRIMARY, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                All jobs <ChevronRight size={14} />
              </button>
            )}
          </div>
          {activeWorkload.length === 0 ? (
            <EmptyState
              title="No jobs in progress"
              text="Publish work so drivers can claim it and you can track them live."
              cta="Post a job"
              onClick={() => openPostFlow()}
            />
          ) : (
            <div style={{ marginTop: 8 }}>
              {activeWorkload.map((s) => <LoadCard key={s.id} shift={s} showActions />)}
            </div>
          )}

          <button type="button" onClick={() => openPostFlow()} style={{ width: "100%", marginTop: 28, padding: 16, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.28)" }}>
            Post a new job
          </button>
        </div>
      </div>
    );
  }

  function PostLoad() {
    const field: CSSProperties = { padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15, width: "100%", background: "#fff" };
    const labelStyle: CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE, marginBottom: 8 };
    const payoutPreview = formatPayoutRate(parseMoneyInput(postForm.payout) || 0, postForm.payoutType);
    const steps = ["Route", "Pay", "Details"];
    const canContinue =
      postStep === 0 ? Boolean(postForm.pickup.trim() && postForm.dropoff.trim()) :
      postStep === 1 ? parseMoneyInput(postForm.payout) > 0 :
      Boolean(postForm.cargo && postForm.vehicleType);

    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Post a job · {zone.label}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Publish work for drivers</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>
            Route and pay first. Drivers only see funded jobs.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {steps.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => { if (i < postStep || (i === 1 && canContinue) || i === 0) setPostStep(i); }}
                style={{
                  flex: 1, minHeight: 44, padding: "10px 8px", borderRadius: 12, border: `1px solid ${postStep === i ? PRIMARY : "#e4dfd5"}`,
                  background: postStep === i ? "#fbeae0" : "#fff", color: postStep === i ? "#9c3f15" : MUTE,
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer",
                }}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {postSuccess ? (
            <div style={{ marginTop: 32, textAlign: "center", padding: 32, borderRadius: 20, background: "#eef6ec", border: "1px solid #cfe6cf" }}>
              <Check size={32} color="#2f7d4f" style={{ margin: "0 auto" }} />
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12, color: "#2f7d4f" }}>Job published</div>
              <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Funding escrow so drivers can claim…</p>
            </div>
          ) : (
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              {postStep === 0 && (
                <>
                  <label>
                    <span style={labelStyle}>Job title</span>
                    <input placeholder="e.g. Apapa → Ikeja dry goods" value={postForm.title} onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))} style={field} />
                  </label>
                  <label>
                    <span style={labelStyle}>Pickup</span>
                    <input placeholder="Warehouse, port gate, or address" value={postForm.pickup} onChange={(e) => setPostForm((f) => ({ ...f, pickup: e.target.value }))} style={field} />
                  </label>
                  <label>
                    <span style={labelStyle}>Drop-off / route notes</span>
                    <input placeholder="Destination or stop summary" value={postForm.dropoff} onChange={(e) => setPostForm((f) => ({ ...f, dropoff: e.target.value }))} style={field} />
                  </label>
                  {(postForm.pickup || postForm.dropoff) && (
                    <a
                      href={mapsSearchUrl([postForm.pickup, postForm.dropoff].filter(Boolean).join(" to "))}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, color: PRIMARY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}
                    >
                      <MapPin size={14} /> Preview route on Maps
                    </a>
                  )}
                </>
              )}

              {postStep === 1 && (
                <>
                  <MoneyInput
                    label="Driver pay"
                    value={postForm.payout}
                    onChange={(v) => setPostForm((f) => ({ ...f, payout: v }))}
                    placeholder="45000"
                    hint={`Drivers will see ${payoutPreview} before your 8% platform fee.`}
                  />
                  <label>
                    <span style={labelStyle}>Pay type</span>
                    <select value={postForm.payoutType} onChange={(e) => setPostForm((f) => ({ ...f, payoutType: e.target.value as "day" | "hour" }))} style={field}>
                      <option value="day">Per day</option>
                      <option value="hour">Per hour</option>
                    </select>
                  </label>
                  <div style={{ padding: 16, borderRadius: 16, background: "#faf8f3", border: "1px solid #e4dfd5", fontSize: 13.5, color: "#5f655c", lineHeight: 1.5 }}>
                    <strong style={{ color: INK }}>{postForm.title || "Untitled job"}</strong>
                    <div style={{ marginTop: 6 }}>{postForm.pickup || "Pickup TBD"} → {postForm.dropoff || "Drop-off TBD"}</div>
                    <div style={{ marginTop: 8, fontWeight: 800, color: PRIMARY, fontSize: 18 }}>{payoutPreview}</div>
                  </div>
                </>
              )}

              {postStep === 2 && (
                <>
                  <div>
                    <span style={labelStyle}>Goods to carry</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {CARGO_OPTIONS.map((c) => {
                        const active = postForm.cargo === c.key;
                        const tag = CARGO_TAGS[c.key];
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setPostForm((f) => ({ ...f, cargo: c.key }))}
                            style={{
                              padding: "10px 14px", borderRadius: 14, cursor: "pointer", textAlign: "left", minHeight: 44,
                              border: `1px solid ${active ? PRIMARY : "#e4dfd5"}`,
                              background: active ? tag.bg : "#fff", color: active ? tag.color : INK,
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
                            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{c.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label>
                    <span style={labelStyle}>Vehicle needed</span>
                    <select value={postForm.vehicleType} onChange={(e) => setPostForm((f) => ({ ...f, vehicleType: e.target.value as VehicleType }))} style={field}>
                      {VEHICLE_OPTIONS.map((v) => <option key={v.key} value={v.key}>{v.label} — {v.sub}</option>)}
                    </select>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                      <span style={labelStyle}>Start</span>
                      <input value={postForm.startTime} onChange={(e) => setPostForm((f) => ({ ...f, startTime: e.target.value }))} style={field} />
                    </label>
                    <label>
                      <span style={labelStyle}>End</span>
                      <input value={postForm.endTime} onChange={(e) => setPostForm((f) => ({ ...f, endTime: e.target.value }))} style={field} />
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <label>
                      <span style={labelStyle}>Hours</span>
                      <input inputMode="decimal" value={postForm.hours} onChange={(e) => setPostForm((f) => ({ ...f, hours: e.target.value }))} style={field} />
                    </label>
                    <label>
                      <span style={labelStyle}>Km</span>
                      <input inputMode="numeric" value={postForm.distanceMi} onChange={(e) => setPostForm((f) => ({ ...f, distanceMi: e.target.value }))} style={field} />
                    </label>
                    <label>
                      <span style={labelStyle}>Stops</span>
                      <input inputMode="numeric" value={postForm.stops} onChange={(e) => setPostForm((f) => ({ ...f, stops: e.target.value }))} style={field} />
                    </label>
                  </div>
                  <label>
                    <span style={labelStyle}>When</span>
                    <select value={postForm.shiftDate} onChange={(e) => setPostForm((f) => ({ ...f, shiftDate: e.target.value }))} style={field}>
                      <option value="Today">Today</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This week">This week</option>
                    </select>
                  </label>
                  <label>
                    <span style={labelStyle}>Demand</span>
                    <select value={postForm.demand} onChange={(e) => setPostForm((f) => ({ ...f, demand: e.target.value as "high" | "normal" }))} style={field}>
                      <option value="normal">Normal</option>
                      <option value="high">Urgent / high demand</option>
                    </select>
                  </label>
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                {postStep > 0 && (
                  <button type="button" onClick={() => setPostStep((s) => s - 1)} style={{ flex: 1, minHeight: 48, padding: 16, borderRadius: 16, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    Back
                  </button>
                )}
                {postStep < 2 ? (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setPostStep((s) => s + 1)}
                    style={{ flex: 2, minHeight: 48, padding: 16, border: "none", borderRadius: 16, background: canContinue ? PRIMARY : "#d8d2c6", color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: canContinue ? "pointer" : "default" }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => void handlePostLoad()}
                    style={{ flex: 2, minHeight: 48, padding: 16, border: "none", borderRadius: 16, background: canContinue ? PRIMARY : "#d8d2c6", color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: canContinue ? "pointer" : "default" }}
                  >
                    Publish &amp; fund escrow
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function DriversScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <Eyebrow>Hire drivers · {zone.label}</Eyebrow>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Find rated partners</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>
            Send a direct job offer. The driver accepts into your funded job.
          </p>

          {bookableLoads.length === 0 && (
            <div style={{ marginTop: 14 }}>
              <Notice tone="warn">
                <span>
                  {openLoads.length === 0
                    ? "Post and fund a job first, then book a driver onto it. "
                    : "Fund escrow on an open job before booking a driver. "}
                  <button type="button" onClick={() => openLoads.length ? goTo("jobs") : openPostFlow()} style={{ color: PRIMARY, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {openLoads.length ? "My jobs →" : "Post a job →"}
                  </button>
                </span>
              </Notice>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}>
            <button type="button" onClick={() => setDriverVehicleFilter("all")} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${driverVehicleFilter === "all" ? PRIMARY : LINE}`, background: driverVehicleFilter === "all" ? PRIMARY : "#fff", color: driverVehicleFilter === "all" ? "#fff" : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>All vehicles</button>
            {VEHICLE_OPTIONS.map((v) => (
              <button key={v.key} type="button" onClick={() => setDriverVehicleFilter(v.key)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${driverVehicleFilter === v.key ? PRIMARY : LINE}`, background: driverVehicleFilter === v.key ? PRIMARY : "#fff", color: driverVehicleFilter === v.key ? "#fff" : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v.label}</button>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {drivers.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: MUTE, fontSize: 14 }}>
                <Search size={20} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                No drivers match this filter yet.
              </div>
            ) : (
              <StaggerList>
                {drivers.map((d) => (
                  <StaggerItem key={d.id}>
                    <DriverCard driver={d} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </div>
        </div>
      </div>
    );
  }

  function JobsScreen() {
    const openJobs = postedShifts.filter((s) => s.status === "open" || s.status === "claimed" || s.status === "active");

    if (posting) {
      return (
        <div className="move-page-inner">
          <div className="move-page-screen" style={{ paddingTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                setPosting(false);
                setPostStep(0);
                setPostSuccess(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "none",
                color: PRIMARY,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                marginBottom: 8,
              }}
            >
              ← Open jobs
            </button>
            <PostLoad />
          </div>
        </div>
      );
    }

    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div>
              <Eyebrow>Open jobs · {openJobs.length}</Eyebrow>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Your open jobs</h2>
            </div>
            <button
              type="button"
              onClick={() => openPostFlow()}
              style={{ flexShrink: 0, minHeight: 44, padding: "11px 18px", border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(224,81,31,.26)" }}
            >
              + Post job
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            {openJobs.length === 0 ? (
              <EmptyState
                title="No open jobs"
                text="Publish a job so drivers can claim it and start moving your goods."
                cta="Post your first job"
                onClick={() => openPostFlow()}
              />
            ) : (
              openJobs.map((s) => <LoadCard key={s.id} shift={s} showActions />)
            )}
          </div>
        </div>
      </div>
    );
  }

  function HistoryScreen() {
    const historyJobs = postedShifts.filter((s) => s.status === "completed" || s.status === "cancelled");

    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <Eyebrow>History · {historyJobs.length}</Eyebrow>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Past jobs</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>
            Completed and cancelled jobs for your company.
          </p>

          <div style={{ marginTop: 16 }}>
            {historyJobs.length === 0 ? (
              <EmptyState
                title="No history yet"
                text="Finished and cancelled jobs will show up here."
                cta="View open jobs"
                onClick={() => goTo("jobs")}
              />
            ) : (
              historyJobs.map((s) => <LoadCard key={s.id} shift={s} showActions={false} />)
            )}
          </div>
        </div>
      </div>
    );
  }

  function screenBody() {
    switch (screen) {
      case "welcome": return Welcome();
      case "setup": return Setup();
      case "dashboard": return Dashboard();
      case "jobs": return JobsScreen();
      case "history": return HistoryScreen();
      case "drivers": return DriversScreen();
    }
  }

  const isFlowScreen = FLOW_SCREENS.includes(screen);
  const showNav = !isFlowScreen;

  const tabs = [
    { label: "Home", shortLabel: "Home", screens: ["dashboard"], go: "dashboard" as Screen },
    { label: "Jobs", shortLabel: "Jobs", screens: ["jobs"], go: "jobs" as Screen },
    { label: "History", shortLabel: "History", screens: ["history"], go: "history" as Screen },
    { label: "Drivers", shortLabel: "Drivers", screens: ["drivers"], go: "drivers" as Screen },
  ];

  const rateModal = (
    <AnimatedSheet open={Boolean(rateTarget)} onClose={() => setRateTarget(null)}>
      {rateTarget ? (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Rate driver</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 0" }}>How was {rateTarget.counterpartyName}?</h3>
          <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>
            {rateTarget.title} · {formatMoney(rateTarget.payout)} — ratings keep the marketplace trustworthy.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRateStars(n)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: rateStars >= n ? PRIMARY : "#f0ede4",
                  color: rateStars >= n ? "#fff" : "#9aa097",
                  fontFamily: HANKEN,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "transform .15s ease, background .15s ease",
                  transform: rateStars >= n ? "scale(1.06)" : "scale(1)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            value={rateComment}
            onChange={(e) => setRateComment(e.target.value)}
            placeholder="Optional comment"
            rows={3}
            style={{ width: "100%", marginTop: 16, padding: "12px 14px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 14, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => {
                const rest = pendingRatings.filter((r) => r.shiftId !== rateTarget.shiftId);
                setRateTarget(rest[0] ?? null);
                setRateStars(5);
                setRateComment("");
              }}
              style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => void handleRateSubmit()}
              style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Submit rating
            </button>
          </div>
        </>
      ) : null}
    </AnimatedSheet>
  );

  const bookModal = (
    <AnimatedSheet open={Boolean(bookDriverId)} onClose={() => setBookDriverId(null)}>
      <>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Book driver</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 0" }}>{bookingDriver?.displayName ?? "Driver"}</h3>
        <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0" }}>Choose one of your open jobs. They get a direct offer to accept.</p>

        {bookableLoads.length === 0 ? (
          <div style={{ marginTop: 18, padding: 16, borderRadius: 14, background: "#fdf6e8", color: "#9a6318", fontSize: 13 }}>
            No funded open jobs. Fund escrow first, then book.
            <button type="button" onClick={() => { setBookDriverId(null); openLoads.length ? goTo("jobs") : openPostFlow(); }} style={{ display: "block", marginTop: 10, color: PRIMARY, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              {openLoads.length ? "Fund a job →" : "Post a job →"}
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {bookableLoads.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBookShiftId(s.id)}
                  style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, border: `1px solid ${bookShiftId === s.id ? PRIMARY : "#e4dfd5"}`, background: bookShiftId === s.id ? "#fbeae0" : "#fff", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{formatPayout(s)} · {s.zone}</div>
                </button>
              ))}
            </div>
            <input
              placeholder="Optional message to driver"
              value={bookMessage}
              onChange={(e) => setBookMessage(e.target.value)}
              style={{ width: "100%", marginTop: 12, padding: "12px 14px", borderRadius: 12, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 14 }}
            />
            <button
              type="button"
              disabled={bookBusy || !bookShiftId}
              onClick={() => void handleBookDriver()}
              style={{ width: "100%", marginTop: 14, padding: 15, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: bookBusy || !bookShiftId ? 0.6 : 1 }}
            >
              {bookBusy ? "Sending offer…" : "Send booking offer"}
            </button>
          </>
        )}
      </>
    </AnimatedSheet>
  );

  const modals = (
    <>
      {rateModal}
      {bookModal}
    </>
  );

  if (!ready) {
    return <div className="move-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div className="move-shimmer" style={{ width: 200, height: 24, borderRadius: 8 }} /></div>;
  }

  return (
    <MoveAppShell
      showNav={showNav}
      tabs={tabs}
      screen={screen}
      onNavigate={(s) => goTo(s as Screen)}
      appRole="fleet"
      appLabel="Company"
      appHomeHref="/fleet/dashboard"
      destCity={showNav ? companyName : undefined}
      destCountry={showNav ? zone.label : undefined}
      stayLabel={showNav ? "Company" : undefined}
      modeName={showNav ? "Company profile" : undefined}
      movePct={stats.completedLoads > 0 ? Math.min(100, Math.round((stats.completedLoads / Math.max(stats.totalPosted, 1)) * 100)) : 0}
      moveDone={stats.completedLoads}
      moveTotal={Math.max(stats.totalPosted, 1)}
      meterLabel="Jobs done"
      meterSub={`${stats.completedLoads} of ${stats.totalPosted} jobs completed`}
      isFlowScreen={isFlowScreen}
      screenOrder={["welcome", "setup", "dashboard", "jobs", "history", "drivers"]}
      modals={modals}
    >
      {screenBody()}
      {loadError && !isFlowScreen && (
        <div style={{ position: "fixed", bottom: 24, left: 16, right: 16, zIndex: 40, padding: "12px 16px", borderRadius: 14, background: "#fbeae0", border: "1px solid #f3d6c4", color: "#9c3f15", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          {loadError}
        </div>
      )}
    </MoveAppShell>
  );
}
