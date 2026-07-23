"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  Check,
  ChevronRight,
  MapPin,
  Navigation,
  PenLine,
  Shield,
  Zap,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MoveAppShell } from "./MoveAppShell";
import { AnimatedSheet } from "@/components/move/AnimatedSheet";
import {
  CARGO_OPTIONS,
  CARGO_TAGS,
  VEHICLE_OPTIONS,
  WAYPOINTS,
  ZONE_OPTIONS,
} from "./driver-data";
import {
  acceptOfferApi,
  claimShift,
  clockInSession,
  completeDriverShift,
  declineOfferApi,
  fetchDriverWorkspace,
  fetchTax1099,
  rateOperator,
  updateActiveSession,
  updateDriverProfile,
  uploadComplianceDoc,
} from "@/lib/driver/client";
import {
  cashOutPayment,
  fetchPaymentStatus,
  startConnectOnboarding,
} from "@/lib/payments/client";
import type { BookingOfferSummary, ComplianceDoc, PendingRating, Shift, ShiftSession, WalletEntry } from "@/lib/driver/types";
import { loadDriverFlowState, saveDriverFlowState } from "./storage";
import { RouteMap, mapsNavigateUrl } from "@/components/driver/RouteMap";
import { PushOptInButton } from "@/components/driver/PushOptInButton";
import { ClaimSuccess } from "@/components/move/ClaimSuccess";
import { CountUp } from "@/components/ui/CountUp";
import { useToast } from "@/components/ui/Toast";
import { formatMoney, formatMoneyFromCents, formatPayoutRate } from "@/lib/money";
import "./move.css";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

type Screen = "welcome" | "setup" | "vehicle" | "shifts" | "schedule" | "wallet" | "vault";

const FLOW_SCREENS: Screen[] = ["welcome", "setup", "vehicle"];
const VALID_PATHS = new Set(["/move", "/move/setup", "/move/vehicle", "/move/shifts", "/move/schedule", "/move/wallet", "/move/vault"]);

function buildPath(screen: Screen): string {
  switch (screen) {
    case "welcome": return "/move";
    case "setup": return "/move/setup";
    case "vehicle": return "/move/vehicle";
    case "shifts": return "/move/shifts";
    case "schedule": return "/move/schedule";
    case "wallet": return "/move/wallet";
    case "vault": return "/move/vault";
  }
}

function screenFromPath(pathname: string): Screen {
  const rest = pathname.replace(/^\/move\/?/, "");
  if (rest === "") return "welcome";
  if (rest === "setup") return "setup";
  if (rest === "vehicle") return "vehicle";
  if (rest === "shifts") return "shifts";
  if (rest === "schedule") return "schedule";
  if (rest === "wallet") return "wallet";
  if (rest === "vault") return "vault";
  return "welcome";
}

function formatPayout(shift: Shift) {
  return formatPayoutRate(shift.payout, shift.payoutType);
}

function docStatusColor(status: ComplianceDoc["status"]) {
  switch (status) {
    case "verified": return { dot: "#2f7d4f", bg: "#eef6ec", text: "#2f7d4f" };
    case "expiring": return { dot: "#b9781f", bg: "#fdf6e8", text: "#9a6318" };
    case "pending": return { dot: "#1f6f78", bg: "#e9f5f4", text: "#1f6f78" };
    case "rejected": return { dot: "#c0492a", bg: "#fbeae0", text: "#c0492a" };
    default: return { dot: "#9aa097", bg: "#f0ede4", text: "#6e746b" };
  }
}

function docStatusLabel(status: ComplianceDoc["status"]) {
  switch (status) {
    case "verified": return "Verified";
    case "expiring": return "Expiring soon";
    case "pending": return "Under review";
    case "rejected": return "Rejected";
    default: return "Required";
  }
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

function SlideToClaim({ onClaim, claimed }: { onClaim: () => void; claimed?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [maxDrag, setMaxDrag] = useState(200);
  const claimedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setMaxDrag(Math.max(120, el.clientWidth - 52));
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [claimed]);

  const finishClaim = () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    setDragX(maxDrag);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([12, 18, 26]);
    onClaim();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (claimed) return;
    setDragging(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const progress = maxDrag > 0 ? dragX / maxDrag : 0;
  const past = progress > 0.68;

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current || claimed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 28, maxDrag));
    setDragX(x);
    if (x >= maxDrag - 8) {
      setDragging(false);
      finishClaim();
    }
  };

  const handlePointerUp = () => {
    if (!claimed && !claimedRef.current) setDragX(0);
    setDragging(false);
  };

  if (claimed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 16, background: "#eef6ec", border: "1px solid #cfe6cf", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, color: "#2f7d4f" }}>
        <Check size={16} /> Job claimed
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={maxDrag}
        aria-valuenow={dragX}
        aria-label="Slide to claim job"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ position: "relative", height: 48, borderRadius: 16, overflow: "hidden", background: past ? "linear-gradient(90deg, #d9efdc 0%, #eaf6ea 100%)" : "linear-gradient(90deg, #fbeae0 0%, #fdf1e6 100%)", border: `1px solid ${past ? "#bfe0c2" : "#f3d6c4"}`, cursor: "grab", userSelect: "none", transition: "background .2s ease, border-color .2s ease" }}
      >
        {/* Progress fill trailing the thumb */}
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: dragX + 24, background: past ? "rgba(47,125,79,.14)" : "rgba(224,81,31,.10)", transition: dragging ? "none" : "width .25s cubic-bezier(0.16,1,0.3,1)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: past ? "#2f7d4f" : "#bf5223", opacity: dragX > 40 ? 0.3 : 1, transition: "color .2s ease" }}>
          {past ? "Release to claim" : "Slide to claim →"}
        </div>
        <div
          onPointerDown={handlePointerDown}
          style={{
            position: "absolute", left: dragX + 4, top: 4, width: 40, height: 40, borderRadius: 12,
            background: past ? "#2f7d4f" : PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            boxShadow: past ? "0 4px 12px rgba(47,125,79,.42)" : "0 4px 12px rgba(224,81,31,.4)", transition: dragging ? "background .15s ease" : "left 0.25s cubic-bezier(0.16,1,0.3,1), background .15s ease",
            touchAction: "none",
          }}
        >
          {past ? <Check size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      <button
        type="button"
        onClick={finishClaim}
        style={{ width: "100%", minHeight: 44, padding: 12, borderRadius: 14, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, color: INK, cursor: "pointer" }}
      >
        Or tap to claim
      </button>
    </div>
  );
}

function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      onPointerDown={(e) => {
        drawing.current = true;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
      }}
      onPointerUp={() => { drawing.current = false; }}
      onPointerLeave={() => { drawing.current = false; }}
      style={{ width: "100%", height: 120, borderRadius: 12, background: "#fff", border: "1px dashed #d8d2c6", touchAction: "none", cursor: "crosshair" }}
    />
  );
}

export function DriverApp() {
  const pathname = usePathname();
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(pathname));
  const [ready, setReady] = useState(false);
  const [zoneIdx, setZoneIdx] = useState(0);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [openShifts, setOpenShifts] = useState<Shift[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [activeSession, setActiveSession] = useState<ShiftSession | null>(null);
  const [wallet, setWallet] = useState({ available: 0, pending: 0, lifetime: 0, cashoutFee: 500, weekEarnings: 0 });
  const [ledger, setLedger] = useState<WalletEntry[]>([]);
  const [compliance, setCompliance] = useState<ComplianceDoc[]>([]);
  const [offers, setOffers] = useState<BookingOfferSummary[]>([]);
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [rateTarget, setRateTarget] = useState<PendingRating | null>(null);
  const [rateStars, setRateStars] = useState(5);
  const [rateComment, setRateComment] = useState("");
  const [profileVerified, setProfileVerified] = useState(false);
  const [vaultBusyKey, setVaultBusyKey] = useState<string | null>(null);
  const [cashoutOpen, setCashoutOpen] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);
  const [filterZone, setFilterZone] = useState("All zones");
  const [filterCargo, setFilterCargo] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [claimCelebration, setClaimCelebration] = useState(false);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const toast = useToast();
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [cashoutMessage, setCashoutMessage] = useState<string | null>(null);
  const [taxYear] = useState(() => new Date().getFullYear());
  const [taxSummary, setTaxSummary] = useState<{
    form1099NecEstimateCents: number;
    platformFeesCents: number;
    loadCount: number;
  } | null>(null);

  const zone = ZONE_OPTIONS[zoneIdx];
  const vehicle = VEHICLE_OPTIONS[vehicleIdx];
  const verifiedDocs = compliance.filter((d) => d.status === "verified").length;
  const compliancePct = compliance.length ? Math.round((verifiedDocs / compliance.length) * 100) : 0;
  const clockedIn = activeSession?.status === "active";
  const todayShift = activeSession?.shift ?? myShifts[0] ?? null;
  const waypoints = activeSession?.waypoints ?? WAYPOINTS;
  const lastGpsPing = useRef(0);

  const reportLiveLocation = useCallback((coords: { lat: number; lng: number }) => {
    if (!activeSession || activeSession.status !== "active") return;
    const now = Date.now();
    if (now - lastGpsPing.current < 20000) return;
    lastGpsPing.current = now;
    void updateActiveSession(activeSession.id, coords).catch(() => undefined);
  }, [activeSession]);

  const loadWorkspace = useCallback(async () => {
    try {
      setLoadError(null);
      // Always load the full open board; zone/cargo chips filter client-side for snappy UX.
      const data = await fetchDriverWorkspace({
        zone: "All zones",
        cargo: "all",
      });
      setOpenShifts(data.openShifts);
      setMyShifts(data.myShifts);
      setActiveSession(data.activeSession);
      setWallet(data.wallet);
      setLedger(data.ledger);
      setCompliance(data.compliance);
      setOffers(data.offers ?? []);
      setPendingRatings(data.pendingRatings ?? []);
      setProfileVerified(Boolean(data.profile.verified));
      const pending = data.pendingRatings ?? [];
      if (pending.length > 0) {
        setRateTarget((current) => {
          if (current) return current;
          setRateStars(5);
          setRateComment("");
          return pending[0];
        });
      }
      const zIdx = ZONE_OPTIONS.findIndex((z) => z.label === data.profile.zone);
      const vIdx = VEHICLE_OPTIONS.findIndex((v) => v.key === data.profile.vehicleType);
      if (zIdx >= 0) setZoneIdx(zIdx);
      if (vIdx >= 0) setVehicleIdx(vIdx);
      if (data.profile.onboardingCompleted) {
        saveDriverFlowState({
          zone: data.profile.zone,
          vehicle: VEHICLE_OPTIONS[vIdx >= 0 ? vIdx : 0]?.label ?? "Sprinter Van",
          completed: true,
        });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load shifts.");
    } finally {
      setWorkspaceLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (ready) return;
    const saved = loadDriverFlowState();
    if (saved) {
      const zIdx = ZONE_OPTIONS.findIndex((z) => z.label === saved.zone);
      const vIdx = VEHICLE_OPTIONS.findIndex((v) => v.label === saved.vehicle);
      if (zIdx >= 0) setZoneIdx(zIdx);
      if (vIdx >= 0) setVehicleIdx(vIdx);
      if (saved.completed && (pathname === "/move" || pathname === "/move/setup" || pathname === "/move/vehicle")) {
        router.replace("/move/shifts");
        return;
      }
    }
    if (!VALID_PATHS.has(pathname)) {
      router.replace("/move");
      return;
    }
    setReady(true);
  }, [ready, pathname, router]);

  useEffect(() => {
    if (!ready) return;
    void loadWorkspace();
  }, [ready, loadWorkspace]);

  useEffect(() => {
    if (!ready || screen !== "wallet") return;
    void fetchTax1099(taxYear)
      .then((data) => setTaxSummary(data.summary))
      .catch(() => setTaxSummary(null));
  }, [ready, screen, taxYear]);

  useEffect(() => {
    setScreen(screenFromPath(pathname));
  }, [pathname]);

  // Surface transient action errors as toasts (with retry) rather than a persistent banner.
  useEffect(() => {
    if (!actionError) return;
    toast.error(actionError, { action: { label: "Retry", onClick: () => void loadWorkspace() } });
    setActionError(null);
  }, [actionError, toast, loadWorkspace]);

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    router.push(buildPath(next));
  }, [router]);

  const completeOnboarding = () => {
    saveDriverFlowState({ zone: zone.label, vehicle: vehicle.label, completed: true });
    setFilterZone("All zones");
    void updateDriverProfile({
      zone: zone.label,
      vehicleType: vehicle.key,
      onboardingCompleted: true,
    }).catch(() => undefined);
    goTo("shifts");
  };

  const handleClaim = async (shift: Shift) => {
    try {
      setActionError(null);
      await claimShift(shift.id);
      setClaimedIds((prev) => new Set(prev).add(shift.id));
      setClaimCelebration(true);
      window.setTimeout(() => setClaimCelebration(false), 1100);
      toast.success(`Claimed ${formatPayout(shift)} — it's on your schedule`);
      await loadWorkspace();
      setTimeout(() => goTo("schedule"), 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in to claim loads.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/move/shifts")}`;
        return;
      }
      setActionError(msg);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setActionError(null);
      await acceptOfferApi(offerId);
      await loadWorkspace();
      goTo("schedule");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to accept booking.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/move/shifts")}`;
        return;
      }
      setActionError(msg);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      setActionError(null);
      await declineOfferApi(offerId);
      await loadWorkspace();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to decline offer.");
    }
  };

  const handleClockIn = async () => {
    if (!activeSession) return;
    try {
      setActionError(null);
                    let location: { lat: number; lng: number } | undefined;
      if (navigator.geolocation) {
        location = await new Promise<{ lat: number; lng: number } | undefined>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(undefined),
            { enableHighAccuracy: true, timeout: 8000 },
          );
        });
      }
      await clockInSession(activeSession.id, location);
      await loadWorkspace();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to clock in.");
    }
  };

  const handleWaypointDone = async (waypointId: string) => {
    if (!activeSession) return;
    try {
      setActionError(null);
      await updateActiveSession(activeSession.id, { waypointId });
      await loadWorkspace();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update waypoint.");
    }
  };

  const handleCompleteShift = async () => {
    if (!activeSession) return;
    try {
      setActionError(null);
      await completeDriverShift(activeSession.shiftId);
      await loadWorkspace();
      toast.success("Load completed — earnings added to your wallet");
      goTo("wallet");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to complete load.");
    }
  };

  const handleRateSubmit = async () => {
    if (!rateTarget) return;
    try {
      setActionError(null);
      const ratedId = rateTarget.shiftId;
      await rateOperator(ratedId, rateStars, rateComment || undefined);
      setRateTarget(null);
      setRateStars(5);
      setRateComment("");
      await loadWorkspace();
      toast.success("Thanks — your rating was submitted");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to submit rating.");
    }
  };

  const handleVaultUpload = async (docKey: string, file: File | null) => {
    try {
      setActionError(null);
      setVaultBusyKey(docKey);
      if (!file) {
        await uploadComplianceDoc(docKey);
      } else {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const fileBase64 = btoa(binary);
        await uploadComplianceDoc(docKey, {
          fileName: file.name,
          fileMime: file.type || "application/octet-stream",
          fileBase64,
        });
      }
      await loadWorkspace();
      toast.success(file ? "Document uploaded — under review" : "Marked as provided");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to upload document.");
    } finally {
      setVaultBusyKey(null);
    }
  };

  const handleCashout = async () => {
    try {
      setActionError(null);
      const result = await cashOutPayment();
      setCashoutMessage(result.message);
      setCashoutDone(true);
      await loadWorkspace();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to cash out.");
      setCashoutOpen(false);
    }
  };

  const handleConnectPayouts = async () => {
    try {
      setActionError(null);
      const { url } = await startConnectOnboarding();
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to start payout setup.");
    }
  };

  useEffect(() => {
    if (screen !== "wallet") return;
    void fetchPaymentStatus()
      .then((s) => {
        setPayoutsEnabled(s.payoutsEnabled);
        setStripeConfigured(s.configured);
      })
      .catch(() => undefined);
  }, [screen]);

  const isFlowScreen = FLOW_SCREENS.includes(screen);
  const showNav = !isFlowScreen;

  const tabs = [
    { label: "Jobs", shortLabel: "Jobs", screens: ["shifts"], go: "shifts" as Screen },
    { label: "My runs", shortLabel: "Runs", screens: ["schedule"], go: "schedule" as Screen },
    { label: "Pay", shortLabel: "Pay", screens: ["wallet"], go: "wallet" as Screen },
    { label: "Docs", shortLabel: "Docs", screens: ["vault"], go: "vault" as Screen },
  ];

  function Welcome() {
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--welcome">
          <div style={{ marginTop: 0 }}>
            <SiteLogo href="/" height={36} />
          </div>
          <div style={{ marginTop: 48 }}>
            <h1 style={{ fontSize: 36, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textWrap: "balance" } as CSSProperties}>
              Drive for work.<br />
              <span style={{ color: PRIMARY }}>Get paid in naira.</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: "#5f655c", margin: "18px 0 0", maxWidth: 340 }}>
              Claim funded jobs from companies across Lagos, Abuja, Port Harcourt, and more. Run the route, then cash out — platform fee only when the job completes.
            </p>
          </div>
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => {
                saveDriverFlowState({ zone: zone.label, vehicle: vehicle.label, completed: true });
                goTo("shifts");
              }}
              style={{ width: "100%", padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)", textAlign: "left" }}
            >
              Find jobs near me →
            </button>
            <button
              onClick={() => goTo("setup")}
              style={{ width: "100%", padding: 16, border: "1px solid #e4dfd5", borderRadius: 18, background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Set my corridor &amp; vehicle first
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: MUTE, margin: "14px 0 0" }}>
            Claiming, cashout, and posting require an account · <a href="/auth?role=driver&redirect=/move/shifts" style={{ color: PRIMARY, fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
        <FlowAside
          title="Your driver workspace"
          text="Separate from any company profile on the same login. Find work, run jobs, and cash out under your driver name."
          steps={[
            { n: 1, text: "Browse funded jobs by corridor and cargo" },
            { n: 2, text: "Clock in with GPS, hit stops, complete" },
            { n: 3, text: "Cash out earnings to your bank" },
          ]}
        />
      </div>
    );
  }

  function Setup() {
    const fillPct = `${(zoneIdx / (ZONE_OPTIONS.length - 1)) * 100}%`;
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--step">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Step 1 · Your zone</div>
          <h2 style={{ fontSize: 27, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "14px 0 0" }}>Where do you drive?</h2>
          <p style={{ fontSize: 15, color: "#5f655c", margin: "12px 0 0" }}>Your shift feed adapts to this — change it any time from the Shifts tab.</p>

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-.02em", color: INK }}>{zone.label}</div>
            <div style={{ fontSize: 15, color: "#6e746b", marginTop: 4 }}>{zone.sub}</div>
          </div>

          <div style={{ marginTop: 44, position: "relative", padding: "0 6px" }}>
            <div style={{ position: "absolute", left: 6, right: 6, top: 9, height: 3, background: "#d8d8d0", borderRadius: 999 }} />
            <div style={{ position: "absolute", left: 6, top: 9, height: 3, background: PRIMARY, borderRadius: 999, width: fillPct, transition: "width .3s ease" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {ZONE_OPTIONS.map((z, i) => {
                const active = i === zoneIdx;
                return (
                  <div key={z.key} onClick={() => setZoneIdx(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", width: 40 }}>
                    <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: active ? 20 : 12, height: active ? 20 : 12, borderRadius: 999, background: active ? PRIMARY : "#cfd4cc", border: active ? "4px solid #fbe0d2" : "none", boxShadow: active ? "0 2px 8px rgba(224,81,31,.42)" : "none", transition: "all .25s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 52, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: PRIMARY }} />
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Shifts in {zone.label}</div>
            </div>
            <p style={{ fontSize: 16, color: "#4a5047", margin: "12px 0 0", lineHeight: 1.45 }}>
              {openShifts.length} open loads right now across zones — slide to claim in one tap.
            </p>
          </div>

          <div style={{ flex: 1 }} />
          <button onClick={() => goTo("vehicle")} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>Continue</button>
          <button onClick={() => completeOnboarding()} style={{ width: "100%", padding: 14, marginTop: 10, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>Skip — show all shifts</button>
        </div>
        <FlowAside
          title="Your driving zone"
          text="Everything downstream — your shift feed, schedule, and payouts — adapts to where you work in Nigeria."
          steps={[
            { n: 1, text: "Lagos — Island, Mainland, and Ikeja corridors" },
            { n: 2, text: "Abuja — capital city and satellite routes" },
            { n: 3, text: "Port Harcourt & Ibadan — port and inland freight" },
          ]}
        />
      </div>
    );
  }

  function VehicleSetup() {
    const cur = vehicle;
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--step">
          <div onClick={() => goTo("setup")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>← Back</div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE, marginTop: 14 }}>Step 2 · Your vehicle</div>
          <h2 style={{ fontSize: 27, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "14px 0 0" }}>What do you drive?</h2>
          <p style={{ fontSize: 15, color: "#5f655c", margin: "12px 0 0" }}>We&apos;ll prioritise shifts that match your vehicle type.</p>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            {VEHICLE_OPTIONS.map((v, i) => {
              const sel = i === vehicleIdx;
              return (
                <div key={v.key} onClick={() => setVehicleIdx(i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 19px", borderRadius: 16, cursor: "pointer", background: sel ? PRIMARY : "#fff", color: sel ? "#fff" : INK, border: `1px solid ${sel ? PRIMARY : "#e4dfd5"}`, boxShadow: sel ? "0 6px 18px rgba(224,81,31,.27)" : "0 1px 2px rgba(0,0,0,.03)", transition: "all .15s" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{v.label}</div>
                    <div style={{ fontSize: 13, opacity: sel ? 0.85 : 0.65, marginTop: 2 }}>{v.sub}</div>
                  </div>
                  <span style={{ color: sel ? "#fff" : "#cdd1c9", fontSize: 16 }}>→</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 22, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>You&apos;ll see {cur.label} shifts</div>
            <p style={{ fontSize: 15, color: "#4a5047", margin: "12px 0 0", lineHeight: 1.45 }}>{cur.blurb}</p>
          </div>

          <div style={{ flex: 1 }} />
          <button onClick={() => completeOnboarding()} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>Show my shifts →</button>
        </div>
        <FlowAside
          title="Match your vehicle"
          text="Sprinter vans, box trucks, client fleet, and flatbed — each route type pays differently and needs different credentials."
          steps={[
            { n: 1, text: "Sprinter — high stop count, daily rate" },
            { n: 2, text: "Box truck — hourly with fewer drops" },
            { n: 3, text: "Client fleet — no vehicle needed" },
          ]}
        />
      </div>
    );
  }

  function ShiftCardSkeleton() {
    const bar = (w: number | string, h: number, mt = 0) => (
      <div className="move-shimmer" style={{ width: w, height: h, borderRadius: 8, marginTop: mt }} />
    );
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
        <div style={{ padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {bar(120, 24)}
              {bar("80%", 14, 12)}
            </div>
            {bar(64, 22)}
          </div>
          {bar("60%", 12, 16)}
          {bar("100%", 48, 16)}
        </div>
      </div>
    );
  }

  function ShiftCard({ shift, onClaim, claimed }: { shift: Shift; onClaim?: () => void; claimed?: boolean }) {
    const cargoTag = CARGO_TAGS[shift.cargo];
    const claimable = shift.funded;
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.04)", opacity: claimable ? 1 : 0.9 }}>
        <div style={{ padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: INK }}>{formatPayout(shift)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#5f655c", marginTop: 6, lineHeight: 1.35 }}>
                {shift.pickup} → {shift.dropoff}
              </div>
            </div>
            <span style={{
              flexShrink: 0, padding: "6px 10px", borderRadius: 999, fontFamily: MONO, fontSize: 11, fontWeight: 700,
              background: claimable ? "#eef6ec" : "#fdf6e8", color: claimable ? "#2f7d4f" : "#9a6318",
            }}>
              {shift.demand === "high" ? "Hot · " : ""}{claimable ? "Funded" : "Unfunded"}
            </span>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: MUTE }}>
            {cargoTag.label} · {shift.startTime}–{shift.endTime} · {shift.zone}
            {shift.operator ? ` · ${shift.operator.name}` : ""}
          </div>
          {onClaim && claimable && (
            <div style={{ marginTop: 16 }}>
              <SlideToClaim onClaim={onClaim} claimed={claimed} />
            </div>
          )}
          {onClaim && !claimable && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13, color: "#9a6318", fontWeight: 600, textAlign: "center" }}>
              Waiting for company escrow
            </div>
          )}
        </div>
      </div>
    );
  }

  function ShiftsFeed() {
    const activeFilter = filterZone || "All zones";
    const list = openShifts.filter((s) => {
      const zoneOk = activeFilter === "All zones" || s.zone === activeFilter;
      const cargoOk = filterCargo === "all" || s.cargo === filterCargo;
      return zoneOk && cargoOk;
    });

    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: 0 }}>Jobs near you</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>{list.length} open {list.length === 1 ? "job" : "jobs"} · {activeFilter}</p>

          {offers.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Direct offers</div>
              {offers.map((offer) => (
                <div key={offer.id} style={{ background: "#fff", border: `2px solid ${PRIMARY}`, borderRadius: 20, padding: "16px 18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{offer.companyName ?? "Company"} offered you work</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{formatPayout(offer.shift)}</div>
                  <p style={{ fontSize: 13.5, color: "#5f655c", margin: "8px 0 0" }}>{offer.shift.pickup} → {offer.shift.dropoff}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button type="button" onClick={() => void handleAcceptOffer(offer.id)} style={{ flex: 1, minHeight: 44, padding: 12, border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Accept</button>
                    <button type="button" onClick={() => void handleDeclineOffer(offer.id)} style={{ flex: 1, minHeight: 44, padding: 12, borderRadius: 12, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="move-filter-bar">
            <div className="move-filter-row" role="tablist" aria-label="Zone filters">
              {["All zones", ...ZONE_OPTIONS.map((z) => z.label)].map((z) => (
                <button
                  key={z}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === z}
                  className={`move-filter-chip${activeFilter === z ? " move-filter-chip--primary" : ""}`}
                  onClick={() => setFilterZone(z)}
                >
                  {z}
                </button>
              ))}
            </div>
            <label style={{ display: "block", marginTop: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>Goods</span>
              <select
                value={filterCargo}
                onChange={(e) => setFilterCargo(e.target.value)}
                style={{ width: "100%", marginTop: 8, minHeight: 44, padding: "12px 14px", borderRadius: 14, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 600 }}
              >
                <option value="all">All cargo types</option>
                {CARGO_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>

          {!workspaceLoaded ? (
            <div className="move-card-grid" style={{ marginTop: 18 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ShiftCardSkeleton key={i} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div style={{ marginTop: 22, textAlign: "center", padding: "36px 20px", borderRadius: 18, border: "1px solid #e4dfd5", background: "#fff" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>No jobs for this filter</div>
              <p style={{ fontSize: 14, color: MUTE, margin: "8px 0 0" }}>Widen the corridor or cargo type to see more work.</p>
              <button
                type="button"
                onClick={() => { setFilterZone("All zones"); setFilterCargo("all"); }}
                style={{ marginTop: 16, minHeight: 44, padding: "12px 18px", border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Show all jobs
              </button>
            </div>
          ) : (
            <div className="move-card-grid" style={{ marginTop: 18 }}>
              {list.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} onClaim={() => void handleClaim(shift)} claimed={claimedIds.has(shift.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function ScheduleScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>My runs · live tracking</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Jobs you accepted</h2>

          {todayShift ? (
          <div style={{ marginTop: 22, background: clockedIn ? "#eef6ec" : "#fff", border: `2px solid ${clockedIn ? "#2f7d4f" : PRIMARY}`, borderRadius: 22, padding: 20, boxShadow: clockedIn ? "0 0 0 4px rgba(47,125,79,.1)" : "0 4px 18px rgba(224,81,31,.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: clockedIn ? "#2f7d4f" : PRIMARY }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: clockedIn ? "#2f7d4f" : PRIMARY, fontWeight: 600 }}>
                {clockedIn ? "Live shift" : "Today's shift"}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{formatPayout(todayShift)}</div>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "6px 0 0" }}>{todayShift.pickup} · {todayShift.startTime} – {todayShift.endTime}</p>

            {!clockedIn ? (
              <button onClick={() => void handleClockIn()} style={{ width: "100%", marginTop: 16, padding: 17, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MapPin size={16} /> Clock in with GPS
              </button>
            ) : (
              <>
                <div style={{ marginTop: 16 }}>
                  <RouteMap
                    waypoints={waypoints}
                    clockIn={
                      typeof activeSession?.clockInLat === "number" && typeof activeSession?.clockInLng === "number"
                        ? { lat: activeSession.clockInLat, lng: activeSession.clockInLng }
                        : null
                    }
                    onLocation={reportLiveLocation}
                  />
                </div>
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: MUTE, marginBottom: 12 }}>Route waypoints</div>
                  {waypoints.map((wp, i) => (
                    <div key={wp.id} style={{ display: "flex", gap: 12, marginBottom: i < waypoints.length - 1 ? 0 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: wp.done ? "#2f7d4f" : "#e4dfd5" }} />
                        {i < waypoints.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: wp.done ? "#cfe6cf" : "#e4dfd5" }} />}
                      </div>
                      <div style={{ paddingBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: wp.done ? MUTE : INK, textDecoration: wp.done ? "line-through" : "none" }}>{wp.label}</div>
                        <div style={{ fontSize: 12, color: MUTE }}>{wp.address}</div>
                        {!wp.done && i === waypoints.findIndex((w) => !w.done) && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <a
                              href={mapsNavigateUrl(wp.address, wp.lat, wp.lng)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #e4dfd5", background: "#fff", fontSize: 12, fontWeight: 600, color: PRIMARY, textDecoration: "none" }}
                            >
                              <Navigation size={12} /> Navigate
                            </a>
                            <button
                              type="button"
                              onClick={() => void handleWaypointDone(wp.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "none", background: "#eef6ec", fontSize: 12, fontWeight: 700, color: "#2f7d4f", cursor: "pointer" }}
                            >
                              <Check size={12} /> Arrived
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, padding: 16, borderRadius: 18, background: "#fff", border: "1px solid #e4dfd5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <PenLine size={14} color={MUTE} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Manager sign-off</span>
                  </div>
                  <SignaturePad />
                  <button onClick={() => void handleCompleteShift()} style={{ width: "100%", marginTop: 14, padding: 15, border: "none", borderRadius: 14, background: "#2f7d4f", color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    Complete load &amp; get paid
                  </button>
                </div>
              </>
            )}
          </div>
          ) : (
            <div style={{ marginTop: 22, padding: "24px 20px", borderRadius: 18, border: "1px dashed #d8d2c6", textAlign: "center", color: MUTE, fontSize: 14 }}>
              <div style={{ marginTop: 28, textAlign: "center", padding: "36px 20px", borderRadius: 18, border: "1px solid #e4dfd5", background: "#fff" }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>No active run</div>
                <p style={{ fontSize: 14, color: MUTE, margin: "8px 0 0" }}>Claim a funded job to start tracking here.</p>
                <button type="button" onClick={() => goTo("shifts")} style={{ marginTop: 16, minHeight: 44, padding: "12px 18px", border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Browse jobs
                </button>
              </div>
            </div>
          )}

          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE, margin: "28px 0 12px" }}>Upcoming this week</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myShifts.map((shift) => (
              <div key={shift.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 18, background: "#fff", border: "1px solid #e4dfd5", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatPayout(shift)}</div>
                  <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{shift.date} · {shift.startTime} · {shift.zone}</div>
                </div>
                <ChevronRight size={16} color={MUTE} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function WalletScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Pay · instant cashout</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Your earnings</h2>

          <div className="move-metric-grid" style={{ marginTop: 22 }}>
            {[
              { label: "Available", value: wallet.available, dark: true },
              { label: "Pending", value: wallet.pending, dark: false },
              { label: "Lifetime", value: wallet.lifetime, dark: false },
            ].map((b) => (
              <div key={b.label} style={{ padding: "18px 18px", borderRadius: 18, background: b.dark ? INK : "#fff", border: b.dark ? "none" : "1px solid #e4dfd5", color: b.dark ? "#fff" : INK, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: b.dark ? "#f3aa79" : MUTE }}>{b.label}</div>
                <CountUp value={b.value} format={(n) => formatMoney(n)} style={{ display: "block", fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: "-.02em" }} />
              </div>
            ))}
          </div>

          <button onClick={() => setCashoutOpen(true)} style={{ width: "100%", marginTop: 20, padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Zap size={16} /> Instant cashout — {formatMoney(wallet.available)} available
          </button>

          {stripeConfigured && !payoutsEnabled && (
            <button onClick={() => void handleConnectPayouts()} style={{ width: "100%", marginTop: 10, padding: 16, borderRadius: 18, border: "1px solid #e4dfd5", background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Connect bank account for payouts →
            </button>
          )}
          {!stripeConfigured && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 14, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13, color: "#9a6318", lineHeight: 1.45 }}>
              Stripe payouts are not connected yet — cashouts stay on your in-app balance until bank payouts are enabled.
            </div>
          )}
          {payoutsEnabled && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 14, background: "#eef6ec", border: "1px solid #cfe6cf", fontSize: 13, color: "#2f7d4f", fontWeight: 600 }}>
              Payout account connected — cashouts go to your bank.
            </div>
          )}

          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE, margin: "28px 0 12px" }}>Transaction history</div>
          <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, overflow: "hidden" }}>
            {ledger.map((entry, i) => (
              <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", borderTop: i > 0 ? "1px solid #efe9dd" : "none" }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{entry.label}</div>
                  <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{entry.date}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: entry.amount > 0 ? "#2f7d4f" : INK }}>
                  {entry.amount > 0 ? "+" : ""}{formatMoney(Math.abs(entry.amount), { exact: Math.abs(entry.amount % 1) > 0 })}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Shield size={16} style={{ color: "#bf6a3c", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5a4636", margin: 0, fontWeight: 700 }}>
                  {taxYear} earnings summary
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "#5a4636", margin: "6px 0 0" }}>
                  {taxSummary
                    ? `${formatMoneyFromCents(taxSummary.form1099NecEstimateCents, { exact: true })} net job pay · ${formatMoneyFromCents(taxSummary.platformFeesCents, { exact: true })} platform fees · ${taxSummary.loadCount} jobs`
                    : "Open this tab while signed in to load your year-to-date earnings export."}
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      void fetchTax1099(taxYear)
                        .then((data) => setTaxSummary(data.summary))
                        .catch(() => setTaxSummary(null));
                    }}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e4c4b0", background: "#fff", fontSize: 12, fontWeight: 700, color: "#9c3f15", cursor: "pointer" }}
                  >
                    Refresh summary
                  </button>
                  <a
                    href={`/api/driver/tax/1099?year=${taxYear}&format=csv`}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: PRIMARY, fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none" }}
                  >
                    Download CSV
                  </a>
                </div>
              </div>
            </div>
            <PushOptInButton />
          </div>
        </div>
      </div>
    );
  }

  function VaultScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Docs · compliance</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Your documents</h2>
          <p style={{ fontSize: 15, color: "#5f655c", margin: "10px 0 0", lineHeight: 1.5 }}>
            Upload your driver&apos;s licence, background check, medical certificate, and insurance to earn your Verified badge.
          </p>

          {profileVerified ? (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "#eef6ec", border: "1px solid #cfe6cf", display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={18} color="#2f7d4f" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2f7d4f" }}>Verified driver</div>
                <div style={{ fontSize: 12.5, color: "#5f655c", marginTop: 2 }}>Required docs on file — preferred in fleet search</div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13.5, color: "#9a6318", fontWeight: 600 }}>
              Upload required docs to get verified. Verified drivers rank higher in Find Drivers.
            </div>
          )}

          <div className="move-metric-grid" style={{ marginTop: 22 }}>
            <div style={{ padding: "18px 18px", borderRadius: 18, background: "#eef6ec", border: "1px solid #cfe6cf" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2f7d4f" }}>{verifiedDocs}</div>
              <div style={{ fontSize: 13, color: "#5f655c", marginTop: 2 }}>Verified</div>
            </div>
            <div style={{ padding: "18px 18px", borderRadius: 18, background: "#fdf6e8", border: "1px solid #f3e0c4" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#b9781f" }}>{compliance.length - verifiedDocs}</div>
              <div style={{ fontSize: 13, color: "#5f655c", marginTop: 2 }}>Action needed</div>
            </div>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {compliance.map((doc) => {
              const colors = docStatusColor(doc.status);
              const busy = vaultBusyKey === doc.docKey;
              return (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18, background: "#fff", border: "1px solid #e4dfd5", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: colors.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>
                      {doc.hasFile
                        ? `On file${doc.fileName ? ` · ${doc.fileName}` : ""}`
                        : doc.detail || "Not uploaded"}
                    </div>
                    {doc.expiresAt && <div style={{ fontSize: 11.5, color: colors.text, marginTop: 4, fontWeight: 600 }}>Expires {doc.expiresAt}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 999, background: colors.bg, color: colors.text, fontFamily: MONO, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{docStatusLabel(doc.status)}</span>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, color: PRIMARY, fontSize: 12, fontWeight: 700, cursor: vaultBusyKey ? "default" : "pointer", opacity: vaultBusyKey && !busy ? 0.5 : 1 }}>
                      <Camera size={12} />
                      {busy ? "Uploading…" : doc.hasFile ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        style={{ display: "none" }}
                        disabled={vaultBusyKey !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          e.target.value = "";
                          if (!file) return;
                          void handleVaultUpload(doc.docKey, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function screenBody() {
    switch (screen) {
      case "welcome": return Welcome();
      case "setup": return Setup();
      case "vehicle": return VehicleSetup();
      case "shifts": return ShiftsFeed();
      case "schedule": return ScheduleScreen();
      case "wallet": return WalletScreen();
      case "vault": return VaultScreen();
    }
  }

  const rateModal = (
    <AnimatedSheet open={Boolean(rateTarget)} onClose={() => setRateTarget(null)}>
      {rateTarget ? (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Rate fleet</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 0" }}>How was {rateTarget.counterpartyName}?</h3>
          <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>
            {rateTarget.title} · {formatMoney(rateTarget.payout)} — your rating helps other drivers.
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

  const cashoutModal = (
    <AnimatedSheet open={cashoutOpen} onClose={() => setCashoutOpen(false)}>
      {cashoutDone ? (
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, margin: "0 auto", boxShadow: "0 8px 22px rgba(224,81,31,.34)" }}>✓</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "16px 0 0" }}>Cashout started</h3>
          <p style={{ fontSize: 14, color: "#6e746b", margin: "8px 0 0", lineHeight: 1.55 }}>{cashoutMessage ?? "Arrives in your bank within minutes."}</p>
          <button onClick={() => { setCashoutOpen(false); setCashoutDone(false); setCashoutMessage(null); }} style={{ width: "100%", marginTop: 20, padding: 15, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Done</button>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Instant cashout</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", margin: "8px 0 0" }}>Transfer {formatMoney(wallet.available)} to your bank</h3>
          <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>Service fee of {formatMoney(wallet.cashoutFee, { exact: true })} — arrives in minutes.</p>
          <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "#fbeae0", border: "1px solid #f3d6c4", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>You receive</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: PRIMARY }}>{formatMoney(wallet.available - wallet.cashoutFee, { exact: true })}</span>
          </div>
          <button onClick={() => void handleCashout()} style={{ width: "100%", marginTop: 16, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Zap size={16} /> Cash out now
          </button>
        </>
      )}
    </AnimatedSheet>
  );

  const modals = (
    <>
      {rateModal}
      {cashoutModal}
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
      appRole="driver"
      appLabel="Driver"
      appHomeHref="/move/shifts"
      destCity={showNav ? (filterZone === "All zones" ? "Nigeria" : filterZone) : undefined}
      destCountry={showNav ? vehicle.label : undefined}
      stayLabel={showNav ? "Nigeria" : undefined}
      modeName={showNav ? "Driver profile" : undefined}
      movePct={compliancePct}
      moveDone={verifiedDocs}
      moveTotal={compliance.length || 6}
      meterLabel="Vault status"
      meterSub={`${verifiedDocs} of ${compliance.length || 6} docs verified`}
      isFlowScreen={isFlowScreen}
      screenOrder={["welcome", "setup", "vehicle", "shifts", "schedule", "wallet", "vault"]}
      switchApp={{ label: "Switch to Company app", href: "/fleet/dashboard" }}
      modals={modals}
    >
      {screenBody()}
      {loadError && !isFlowScreen && (
        <div style={{ position: "fixed", bottom: 24, left: 16, right: 16, zIndex: 40, padding: "12px 16px", borderRadius: 14, background: "#fbeae0", border: "1px solid #f3d6c4", color: "#9c3f15", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
          {loadError}
        </div>
      )}
      <ClaimSuccess open={claimCelebration} />
    </MoveAppShell>
  );
}
