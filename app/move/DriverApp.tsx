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
import { MoveAppShell } from "./MoveAppShell";
import {
  ACTIVE_SHIFT,
  CLAIMED_SHIFTS,
  COMPLIANCE_DOCS,
  INITIAL_SHIFTS,
  LEDGER,
  VEHICLE_OPTIONS,
  VEHICLE_TAGS,
  WALLET,
  WAYPOINTS,
  ZONE_OPTIONS,
  type ComplianceDoc,
  type Shift,
} from "./driver-data";
import { loadDriverFlowState, saveDriverFlowState } from "./storage";
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
    default: return { dot: "#c0492a", bg: "#fbeae0", text: "#c0492a" };
  }
}

function docStatusLabel(status: ComplianceDoc["status"]) {
  switch (status) {
    case "verified": return "Verified";
    case "expiring": return "Expiring soon";
    case "pending": return "Under review";
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
  const [openShifts, setOpenShifts] = useState(INITIAL_SHIFTS);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [myShifts, setMyShifts] = useState(CLAIMED_SHIFTS);
  const [clockedIn, setClockedIn] = useState(false);
  const [cashoutOpen, setCashoutOpen] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);
  const [filterZone, setFilterZone] = useState<string | null>(null);

  const zone = ZONE_OPTIONS[zoneIdx];
  const vehicle = VEHICLE_OPTIONS[vehicleIdx];
  const weekEarnings = 720;
  const verifiedDocs = COMPLIANCE_DOCS.filter((d) => d.status === "verified").length;
  const compliancePct = Math.round((verifiedDocs / COMPLIANCE_DOCS.length) * 100);

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
    setScreen(screenFromPath(pathname));
  }, [pathname]);

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    router.push(buildPath(next));
  }, [router]);

  const completeOnboarding = () => {
    saveDriverFlowState({ zone: zone.label, vehicle: vehicle.label, completed: true });
    setFilterZone(zone.label);
    goTo("shifts");
  };

  const handleClaim = (shift: Shift) => {
    setClaimedIds((prev) => new Set(prev).add(shift.id));
    setMyShifts((prev) => [{ ...shift, status: "claimed" }, ...prev]);
    setOpenShifts((prev) => prev.filter((s) => s.id !== shift.id));
    setTimeout(() => goTo("schedule"), 600);
  };

  const filteredShifts = filterZone
    ? openShifts.filter((s) => s.zone === filterZone || filterZone === "All zones")
    : openShifts.filter((s) => s.zone === zone.label);

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
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: PRIMARY, fontWeight: 500 }}>
            EasyMoveZone
          </div>
          <div style={{ marginTop: 56 }}>
            <h1 style={{ fontSize: 40, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textWrap: "balance" } as CSSProperties}>
              Claim shifts.<br />
              <span style={{ color: PRIMARY }}>Get paid today.</span>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 320 }}>
              Browse commercial driving routes in your zone, run them with live GPS tracking, and cash out instantly — no weekly payroll wait.
            </p>
          </div>
          <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 13, height: 13, borderRadius: 999, background: INK }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: ".1em" }}>YOU</span>
            </div>
            <div style={{ flex: 1, borderTop: "2px dashed #c3bdb0", marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 13, height: 13, borderRadius: 999, background: PRIMARY, boxShadow: "0 0 0 5px #fbe0d2" }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: PRIMARY, letterSpacing: ".1em" }}>PAID</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => goTo("setup")}
            style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
          >
            Get started
          </button>
          <button
            onClick={() => { saveDriverFlowState({ zone: zone.label, vehicle: vehicle.label, completed: true }); goTo("shifts"); }}
            style={{ width: "100%", padding: 15, marginTop: 10, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Skip — browse all shifts →
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: MUTE, margin: "14px 0 0" }}>Takes about a minute · no account needed</p>
        </div>
        <FlowAside
          title="Shifts. Schedule. Wallet."
          text="Three problems, one app. Find open routes, run them with live tracking, and cash out the same day."
          steps={[
            { n: 1, text: "Shifts — commercial routes with clear daily or hourly pay" },
            { n: 2, text: "Schedule — GPS clock-in, waypoints, and digital sign-off" },
            { n: 3, text: "Wallet — instant cashout to your card after every run" },
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
              {openShifts.filter((s) => s.zone === zone.label).length} open routes right now — sprinter, box truck, and client fleet.
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
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
        <div style={{ padding: "18px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
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
            <span style={{ background: "#f0ede4", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#4a5047", fontWeight: 600, fontFamily: MONO }}>{shift.stops} stops</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5f655c", margin: "13px 0 0" }}>{shift.pickup}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Clock size={14} color={MUTE} />
            <span style={{ fontSize: 13, color: "#6e746b" }}>{shift.startTime} – {shift.endTime} · {shift.dropoff}</span>
          </div>
          {onClaim && (
            <div style={{ marginTop: 16 }}>
              <SlideToClaim onClaim={onClaim} claimed={claimed} />
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
          <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Available routes near you</h2>

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
                <ShiftCard key={shift.id} shift={shift} onClaim={() => handleClaim(shift)} claimed={claimedIds.has(shift.id)} />
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

          <div style={{ marginTop: 22, background: clockedIn ? "#eef6ec" : "#fff", border: `2px solid ${clockedIn ? "#2f7d4f" : PRIMARY}`, borderRadius: 22, padding: 20, boxShadow: clockedIn ? "0 0 0 4px rgba(47,125,79,.1)" : "0 4px 18px rgba(224,81,31,.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: clockedIn ? "#2f7d4f" : PRIMARY }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: clockedIn ? "#2f7d4f" : PRIMARY, fontWeight: 600 }}>
                {clockedIn ? "Live shift" : "Today's shift"}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{formatPayout(ACTIVE_SHIFT)}</div>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "6px 0 0" }}>{ACTIVE_SHIFT.pickup} · {ACTIVE_SHIFT.startTime} – {ACTIVE_SHIFT.endTime}</p>

            {!clockedIn ? (
              <button onClick={() => setClockedIn(true)} style={{ width: "100%", marginTop: 16, padding: 17, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MapPin size={16} /> Clock in at warehouse
              </button>
            ) : (
              <>
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: MUTE, marginBottom: 12 }}>Route waypoints</div>
                  {WAYPOINTS.map((wp, i) => (
                    <div key={wp.id} style={{ display: "flex", gap: 12, marginBottom: i < WAYPOINTS.length - 1 ? 0 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: wp.done ? "#2f7d4f" : "#e4dfd5" }} />
                        {i < WAYPOINTS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: wp.done ? "#cfe6cf" : "#e4dfd5" }} />}
                      </div>
                      <div style={{ paddingBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: wp.done ? MUTE : INK, textDecoration: wp.done ? "line-through" : "none" }}>{wp.label}</div>
                        <div style={{ fontSize: 12, color: MUTE }}>{wp.address}</div>
                        {!wp.done && i === WAYPOINTS.findIndex((w) => !w.done) && (
                          <button type="button" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #e4dfd5", background: "#fff", fontSize: 12, fontWeight: 600, color: PRIMARY, cursor: "pointer" }}>
                            <Navigation size={12} /> Navigate
                          </button>
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
                </div>
              </>
            )}
          </div>

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
              { label: "Available", value: WALLET.available, dark: true },
              { label: "Pending", value: WALLET.pending, dark: false },
              { label: "Lifetime", value: WALLET.lifetime, dark: false },
            ].map((b) => (
              <div key={b.label} style={{ padding: "18px 18px", borderRadius: 18, background: b.dark ? INK : "#fff", border: b.dark ? "none" : "1px solid #e4dfd5", color: b.dark ? "#fff" : INK, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: b.dark ? "#f3aa79" : MUTE }}>{b.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: "-.02em" }}>${b.value.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setCashoutOpen(true)} style={{ width: "100%", marginTop: 20, padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Zap size={16} /> Instant cashout — ${WALLET.available} available
          </button>

          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE, margin: "28px 0 12px" }}>Transaction history</div>
          <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, overflow: "hidden" }}>
            {LEDGER.map((entry, i) => (
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

          <div style={{ marginTop: 18, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 18, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Shield size={16} style={{ color: "#bf6a3c", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5a4636", margin: 0 }}>Tax documents and 1099 summaries generate automatically. Platform fees show transparently on every payout.</p>
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
          <p style={{ fontSize: 15, color: "#5f655c", margin: "10px 0 0", lineHeight: 1.5 }}>Logistics companies hire from verified rosters. Keep everything current to unlock premium shifts.</p>

          <div className="move-metric-grid" style={{ marginTop: 22 }}>
            <div style={{ padding: "18px 18px", borderRadius: 18, background: "#eef6ec", border: "1px solid #cfe6cf" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2f7d4f" }}>{verifiedDocs}</div>
              <div style={{ fontSize: 13, color: "#5f655c", marginTop: 2 }}>Verified</div>
            </div>
            <div style={{ padding: "18px 18px", borderRadius: 18, background: "#fdf6e8", border: "1px solid #f3e0c4" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#b9781f" }}>{COMPLIANCE_DOCS.length - verifiedDocs}</div>
              <div style={{ fontSize: 13, color: "#5f655c", marginTop: 2 }}>Action needed</div>
            </div>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPLIANCE_DOCS.map((doc) => {
              const colors = docStatusColor(doc.status);
              return (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18, background: "#fff", border: "1px solid #e4dfd5", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: colors.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 12.5, color: MUTE, marginTop: 2 }}>{doc.detail}</div>
                    {doc.expiresAt && <div style={{ fontSize: 11.5, color: colors.text, marginTop: 4, fontWeight: 600 }}>Expires {doc.expiresAt}</div>}
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: colors.bg, color: colors.text, fontFamily: MONO, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{docStatusLabel(doc.status)}</span>
                </div>
              );
            })}
          </div>

          <button type="button" style={{ marginTop: 20, width: "100%", padding: 17, borderRadius: 18, border: `2px dashed ${PRIMARY}`, background: "#fbeae0", color: "#9c3f15", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Camera size={16} /> Upload document
          </button>

          <div style={{ marginTop: 22, background: INK, borderRadius: 20, padding: 22, color: "#fff" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#f3aa79" }}>Fleet managers</div>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.7)", margin: "10px 0 0", lineHeight: 1.5 }}>Post shifts with vehicle type, hours, and pay. Verified drivers see the payout instantly.</p>
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

  const modals = cashoutOpen ? (
    <div className="move-overlay move-overlay--sheet" onClick={() => setCashoutOpen(false)}>
      <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="move-sheet-handle" />
        {cashoutDone ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, margin: "0 auto", boxShadow: "0 8px 22px rgba(224,81,31,.34)" }}>✓</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "16px 0 0" }}>${WALLET.available} on the way</h3>
            <p style={{ fontSize: 14, color: "#6e746b", margin: "8px 0 0", lineHeight: 1.55 }}>Arrives in your bank within minutes.</p>
            <button onClick={() => { setCashoutOpen(false); setCashoutDone(false); }} style={{ width: "100%", marginTop: 20, padding: 15, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Instant cashout</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", margin: "8px 0 0" }}>Transfer ${WALLET.available} to your card</h3>
            <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>Micro-fee of ${WALLET.cashoutFee} — arrives in minutes.</p>
            <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "#fbeae0", border: "1px solid #f3d6c4", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>You receive</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: PRIMARY }}>${(WALLET.available - WALLET.cashoutFee).toFixed(2)}</span>
            </div>
            <button onClick={() => setCashoutDone(true)} style={{ width: "100%", marginTop: 16, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Zap size={16} /> Cash out now
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

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
      moveTotal={COMPLIANCE_DOCS.length}
      meterLabel="Vault status"
      meterSub={`${verifiedDocs} of ${COMPLIANCE_DOCS.length} docs verified`}
      isFlowScreen={isFlowScreen}
      modals={modals}
    >
      {screenBody()}
    </MoveAppShell>
  );
}
