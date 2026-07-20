"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  Check,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  Navigation,
  PenLine,
  Shield,
  Zap,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MoveAppShell } from "./MoveAppShell";
import {
  CARGO_OPTIONS,
  CARGO_TAGS,
  VEHICLE_OPTIONS,
  VEHICLE_TAGS,
  WAYPOINTS,
  ZONE_OPTIONS,
  formatRating,
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
  return shift.payoutType === "day" ? `$${shift.payout}/day` : `$${shift.payout}/hr`;
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
  const maxDrag = 200;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (claimed) return;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current || claimed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 28, maxDrag));
    setDragX(x);
    if (x >= maxDrag - 8) {
      setDragging(false);
      setDragX(maxDrag);
      onClaim();
    }
  };

  const handlePointerUp = () => {
    if (!claimed) setDragX(0);
    setDragging(false);
  };

  if (claimed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 16, background: "#eef6ec", border: "1px solid #cfe6cf", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, color: "#2f7d4f" }}>
        <Check size={16} /> Shift claimed
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ position: "relative", height: 48, borderRadius: 16, overflow: "hidden", background: "linear-gradient(90deg, #fbeae0 0%, #fdf1e6 100%)", border: "1px solid #f3d6c4", cursor: "grab", userSelect: "none" }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: "#bf5223", opacity: dragX > 40 ? 0.3 : 1 }}>
        Slide to claim shift →
      </div>
      <div
        onPointerDown={handlePointerDown}
        style={{
          position: "absolute", left: dragX + 4, top: 4, width: 40, height: 40, borderRadius: 12,
          background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          boxShadow: "0 4px 12px rgba(224,81,31,.4)", transition: dragging ? "none" : "left 0.25s cubic-bezier(0.16,1,0.3,1)",
          touchAction: "none",
        }}
      >
        <ChevronRight size={20} />
      </div>
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
  const [wallet, setWallet] = useState({ available: 0, pending: 0, lifetime: 0, cashoutFee: 1.99, weekEarnings: 0 });
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
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [filterCargo, setFilterCargo] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
  const weekEarnings = wallet.weekEarnings;
  const verifiedDocs = compliance.filter((d) => d.status === "verified").length;
  const compliancePct = compliance.length ? Math.round((verifiedDocs / compliance.length) * 100) : 0;
  const clockedIn = activeSession?.status === "active";
  const todayShift = activeSession?.shift ?? myShifts[0] ?? null;
  const waypoints = activeSession?.waypoints ?? WAYPOINTS;

  const loadWorkspace = useCallback(async (zoneFilter?: string | null) => {
    try {
      setLoadError(null);
      const data = await fetchDriverWorkspace({
        zone: zoneFilter ?? filterZone ?? zone.label,
        cargo: filterCargo,
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
      if (!rateTarget && (data.pendingRatings?.length ?? 0) > 0) {
        setRateTarget(data.pendingRatings![0]);
        setRateStars(5);
        setRateComment("");
      }
      const zIdx = ZONE_OPTIONS.findIndex((z) => z.label === data.profile.zone);
      const vIdx = VEHICLE_OPTIONS.findIndex((v) => v.key === data.profile.vehicleType);
      if (zIdx >= 0) setZoneIdx(zIdx);
      if (vIdx >= 0) setVehicleIdx(vIdx);
      if (!filterZone) setFilterZone(data.profile.zone);
      if (data.profile.onboardingCompleted) {
        saveDriverFlowState({
          zone: data.profile.zone,
          vehicle: VEHICLE_OPTIONS[vIdx >= 0 ? vIdx : 0]?.label ?? vehicle.label,
          completed: true,
        });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load shifts.");
    }
  }, [filterZone, filterCargo, zone.label]);

  useEffect(() => {
    if (ready) return;
    const saved = loadDriverFlowState();
    if (saved) {
      const zIdx = ZONE_OPTIONS.findIndex((z) => z.label === saved.zone);
      const vIdx = VEHICLE_OPTIONS.findIndex((v) => v.label === saved.vehicle);
      if (zIdx >= 0) setZoneIdx(zIdx);
      if (vIdx >= 0) setVehicleIdx(vIdx);
      setFilterZone(saved.zone);
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
  }, [ready, screen, filterZone, filterCargo, loadWorkspace]);

  useEffect(() => {
    if (!ready || screen !== "wallet") return;
    void fetchTax1099(taxYear)
      .then((data) => setTaxSummary(data.summary))
      .catch(() => setTaxSummary(null));
  }, [ready, screen, taxYear]);

  useEffect(() => {
    setScreen(screenFromPath(pathname));
  }, [pathname]);

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    router.push(buildPath(next));
  }, [router]);

  const completeOnboarding = () => {
    saveDriverFlowState({ zone: zone.label, vehicle: vehicle.label, completed: true });
    setFilterZone(zone.label);
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
      await loadWorkspace();
      setTimeout(() => goTo("schedule"), 600);
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
    { label: "Shifts", screens: ["shifts"], go: "shifts" as Screen },
    { label: "Schedule", screens: ["schedule"], go: "schedule" as Screen },
    { label: "Wallet", screens: ["wallet"], go: "wallet" as Screen },
    { label: "Vault", screens: ["vault"], go: "vault" as Screen },
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
              Logistics marketplace.<br />
              <span style={{ color: PRIMARY }}>Pick your side.</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: "#5f655c", margin: "18px 0 0", maxWidth: 340 }}>
              Drivers and truck owners claim loads. Fleet operators post routes and find rated partners. Commission only on completion.
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
              Book a load now →
            </button>
            <button
              onClick={() => goTo("setup")}
              style={{ width: "100%", padding: 16, border: "1px solid #e4dfd5", borderRadius: 18, background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Set my zone &amp; vehicle first
            </button>
            <a
              href="/fleet/drivers"
              style={{ width: "100%", padding: 16, border: "none", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "block", textAlign: "center" }}
            >
              I need to book a driver instead →
            </a>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: MUTE, margin: "14px 0 0" }}>
            Claiming, cashout, and posting require an account · <a href="/auth?redirect=/move/shifts" style={{ color: PRIMARY, fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
        <FlowAside
          title="One marketplace. Two apps."
          text="Drivers earn on loads. Fleet operators fill routes with rated independent drivers and owner-operators."
          steps={[
            { n: 1, text: "Browse loads by cargo — parcel to tankers" },
            { n: 2, text: "Claim, run, complete — ratings both ways" },
            { n: 3, text: "Cash out via Stripe Connect to your bank" },
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
          text="Everything downstream — your shift feed, schedule, and payouts — adapts to where you work."
          steps={[
            { n: 1, text: "DFW — north, central, and east corridors" },
            { n: 2, text: "Houston — inner city and port routes" },
            { n: 3, text: "San Antonio — grocery and restaurant drops" },
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

  function ShiftCard({ shift, onClaim, claimed }: { shift: Shift; onClaim?: () => void; claimed?: boolean }) {
    const tag = VEHICLE_TAGS[shift.vehicle];
    const cargoTag = CARGO_TAGS[shift.cargo];
    const claimable = shift.funded;
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,.05)", opacity: claimable ? 1 : 0.85 }}>
        <div style={{ padding: "18px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>{shift.title}</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", color: INK }}>{formatPayout(shift)}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: MUTE, marginTop: 4 }}>{shift.date} · {shift.hours}h · {shift.distanceMi} mi</div>
            </div>
            {shift.demand === "high" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 999, background: "#fbeae0", color: "#9c3f15", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>
                <Flame size={11} /> Hot
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            <span style={{ background: tag.bg, color: tag.color, borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 600, fontFamily: MONO }}>{tag.label}</span>
            <span style={{ background: cargoTag.bg, color: cargoTag.color, borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 600, fontFamily: MONO }}>{cargoTag.label}</span>
            <span style={{ background: "#f0ede4", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#4a5047", fontWeight: 600, fontFamily: MONO }}>{shift.stops} stops</span>
            <span style={{ background: claimable ? "#eef6ec" : "#fdf6e8", color: claimable ? "#2f7d4f" : "#9a6318", borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 600, fontFamily: MONO }}>
              {claimable ? "Funded" : "Awaiting escrow"}
            </span>
          </div>
          {shift.operator && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: "#5f655c", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: INK }}>{shift.operator.name}</span>
              <span style={{ color: "#b9781f", fontWeight: 700 }}>{formatRating(shift.operator.ratingAvg, shift.operator.ratingCount)}</span>
              {shift.operator.verified && (
                <span style={{ background: "#eef6ec", color: "#2f7d4f", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700, fontFamily: MONO }}>Verified</span>
              )}
            </div>
          )}
          <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5f655c", margin: "13px 0 0" }}>{shift.pickup}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Clock size={14} color={MUTE} />
            <span style={{ fontSize: 13, color: "#6e746b" }}>{shift.startTime} – {shift.endTime} · {shift.dropoff}</span>
          </div>
          {onClaim && claimable && (
            <div style={{ marginTop: 16 }}>
              <SlideToClaim onClaim={onClaim} claimed={claimed} />
            </div>
          )}
          {onClaim && !claimable && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 14, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13, color: "#9a6318", fontWeight: 600, textAlign: "center" }}>
              Awaiting fleet escrow — not bookable yet
            </div>
          )}
        </div>
      </div>
    );
  }

  function ShiftsFeed() {
    const activeFilter = filterZone ?? zone.label;
    const list = activeFilter === "All zones" ? openShifts : openShifts.filter((s) => s.zone === activeFilter);

    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Shifts · {activeFilter}</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Book a load near you</h2>

          {offers.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Direct bookings for you</div>
              {offers.map((offer) => (
                <div key={offer.id} style={{ background: "#fff", border: `2px solid ${PRIMARY}`, borderRadius: 20, padding: "16px 18px", boxShadow: "0 4px 18px rgba(224,81,31,.12)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{offer.companyName ?? "Fleet"} booked you</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{formatPayout(offer.shift)}</div>
                  <p style={{ fontSize: 13.5, color: "#5f655c", margin: "8px 0 0" }}>{offer.shift.pickup} → {offer.shift.dropoff}</p>
                  {offer.message && <p style={{ fontSize: 13, color: MUTE, margin: "6px 0 0" }}>{offer.message}</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button type="button" onClick={() => void handleAcceptOffer(offer.id)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Accept booking</button>
                    <button type="button" onClick={() => void handleDeclineOffer(offer.id)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <div onClick={() => goTo("setup")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{activeFilter} · {vehicle.label}</span>
              <span style={{ fontSize: 12, color: MUTE }}>change ↻</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: INK, borderRadius: 999, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#f3aa79", letterSpacing: ".08em" }}>Earned this week</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>${weekEarnings}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {["all", ...CARGO_OPTIONS.map((c) => c.key)].map((c) => (
              <div
                key={c}
                onClick={() => setFilterCargo(c)}
                style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: filterCargo === c ? INK : "#fff", color: filterCargo === c ? "#fff" : "#4a5047", border: `1px solid ${filterCargo === c ? INK : "#e4dfd5"}`, fontSize: 13, fontWeight: 600, transition: "all .15s" }}
              >
                {c === "all" ? "All cargo" : CARGO_TAGS[c as keyof typeof CARGO_TAGS].label}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {["All zones", ...ZONE_OPTIONS.map((z) => z.label)].map((z) => (
              <div
                key={z}
                onClick={() => setFilterZone(z)}
                style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: activeFilter === z ? PRIMARY : "#fff", color: activeFilter === z ? "#fff" : "#4a5047", border: `1px solid ${activeFilter === z ? PRIMARY : "#e4dfd5"}`, fontSize: 13, fontWeight: 600, transition: "all .15s" }}
              >
                {z}
              </div>
            ))}
          </div>

          <div className="move-card-grid" style={{ marginTop: 22 }}>
            {list.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", borderRadius: 18, border: "1px dashed #d8d2c6", color: MUTE, fontSize: 14 }}>No open shifts in this zone. Try another or check back soon.</div>
            ) : (
              list.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} onClaim={() => void handleClaim(shift)} claimed={claimedIds.has(shift.id)} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  function ScheduleScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Schedule · live workspace</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Your committed shifts</h2>

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
              No active shift. Claim one from the Shifts tab.
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
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Wallet · instant pay</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Your earnings</h2>

          <div className="move-metric-grid" style={{ marginTop: 22 }}>
            {[
              { label: "Available", value: wallet.available, dark: true },
              { label: "Pending", value: wallet.pending, dark: false },
              { label: "Lifetime", value: wallet.lifetime, dark: false },
            ].map((b) => (
              <div key={b.label} style={{ padding: "18px 18px", borderRadius: 18, background: b.dark ? INK : "#fff", border: b.dark ? "none" : "1px solid #e4dfd5", color: b.dark ? "#fff" : INK, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: b.dark ? "#f3aa79" : MUTE }}>{b.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: "-.02em" }}>${b.value.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setCashoutOpen(true)} style={{ width: "100%", marginTop: 20, padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Zap size={16} /> Instant cashout — ${wallet.available} available
          </button>

          {stripeConfigured && !payoutsEnabled && (
            <button onClick={() => void handleConnectPayouts()} style={{ width: "100%", marginTop: 10, padding: 16, borderRadius: 18, border: "1px solid #e4dfd5", background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Connect bank account for payouts →
            </button>
          )}
          {!stripeConfigured && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 14, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13, color: "#9a6318", lineHeight: 1.45 }}>
              Stripe is not configured yet — cashouts stay on the ledger until you add Stripe keys (see SETUP.md).
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
                  {entry.amount > 0 ? "+" : ""}${Math.abs(entry.amount).toFixed(entry.amount % 1 ? 2 : 0)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Shield size={16} style={{ color: "#bf6a3c", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5a4636", margin: 0, fontWeight: 700 }}>
                  {taxYear} tax summary (1099-NEC estimate)
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "#5a4636", margin: "6px 0 0" }}>
                  {taxSummary
                    ? `$${(taxSummary.form1099NecEstimateCents / 100).toFixed(2)} net load pay · $${(taxSummary.platformFeesCents / 100).toFixed(2)} platform fees · ${taxSummary.loadCount} loads`
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
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Vault · compliance</div>
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Your credentials</h2>
          <p style={{ fontSize: 15, color: "#5f655c", margin: "10px 0 0", lineHeight: 1.5 }}>
            Upload CDL, background check, medical card, and insurance to earn your Verified badge.
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

          <div style={{ marginTop: 22, background: INK, borderRadius: 20, padding: 22, color: "#fff" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#f3aa79" }}>Fleet operators</div>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.7)", margin: "10px 0 0", lineHeight: 1.5 }}>Post loads, find rated drivers, and manage workload from the fleet console.</p>
            <a href="/fleet" style={{ display: "inline-block", marginTop: 14, padding: "10px 16px", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Open fleet console →</a>
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

  const rateModal = rateTarget ? (
    <div className="move-overlay move-overlay--sheet" onClick={() => setRateTarget(null)}>
      <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="move-sheet-handle" />
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Rate fleet</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 0" }}>How was {rateTarget.counterpartyName}?</h3>
        <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>
          {rateTarget.title} · ${rateTarget.payout} — your rating helps other drivers.
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
      </div>
    </div>
  ) : null;

  const cashoutModal = cashoutOpen ? (
    <div className="move-overlay move-overlay--sheet" onClick={() => setCashoutOpen(false)}>
      <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="move-sheet-handle" />
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
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", margin: "8px 0 0" }}>Transfer ${wallet.available} to your card</h3>
            <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>Micro-fee of ${wallet.cashoutFee} — arrives in minutes.</p>
            <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "#fbeae0", border: "1px solid #f3d6c4", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>You receive</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: PRIMARY }}>${(wallet.available - wallet.cashoutFee).toFixed(2)}</span>
            </div>
            <button onClick={() => void handleCashout()} style={{ width: "100%", marginTop: 16, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Zap size={16} /> Cash out now
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  const modals = rateModal ?? cashoutModal;

  if (!ready) {
    return <div className="move-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div className="move-shimmer" style={{ width: 200, height: 24, borderRadius: 8 }} /></div>;
  }

  return (
    <MoveAppShell
      showNav={showNav}
      tabs={tabs}
      screen={screen}
      onNavigate={(s) => goTo(s as Screen)}
      destCity={showNav ? (filterZone ?? zone.label) : undefined}
      destCountry={showNav ? vehicle.label : undefined}
      stayLabel={showNav ? "Commercial" : undefined}
      modeName={showNav ? "Driver" : undefined}
      movePct={compliancePct}
      moveDone={verifiedDocs}
      moveTotal={compliance.length || 6}
      meterLabel="Vault status"
      meterSub={`${verifiedDocs} of ${compliance.length || 6} docs verified`}
      isFlowScreen={isFlowScreen}
      modals={modals}
    >
      {screenBody()}
      {(actionError || loadError) && !isFlowScreen && (
        <div style={{ position: "fixed", bottom: 88, left: 16, right: 16, zIndex: 40, padding: "12px 16px", borderRadius: 14, background: "#fbeae0", border: "1px solid #f3d6c4", color: "#9c3f15", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
          {actionError ?? loadError}
        </div>
      )}
    </MoveAppShell>
  );
}
