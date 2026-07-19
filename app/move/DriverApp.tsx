"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  Navigation,
  PenLine,
  Shield,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { DriverAppShell } from "./DriverAppShell";
import {
  ACTIVE_SHIFT,
  CLAIMED_SHIFTS,
  COMPLIANCE_DOCS,
  INITIAL_SHIFTS,
  LEDGER,
  VEHICLE_TAGS,
  WALLET,
  WAYPOINTS,
  ZONES,
  type ComplianceDoc,
  type Shift,
} from "./driver-data";
import "./move.css";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

const VALID_PATHS = new Set(["/move", "/move/schedule", "/move/wallet", "/move/vault"]);

const TABS = [
  { label: "Shifts", go: "shifts", screens: ["shifts"] },
  { label: "Schedule", go: "schedule", screens: ["schedule"] },
  { label: "Wallet", go: "wallet", screens: ["wallet"] },
  { label: "Vault", go: "vault", screens: ["vault"] },
] as const;

type Screen = (typeof TABS)[number]["go"];

function screenFromPath(pathname: string): Screen {
  if (pathname.startsWith("/move/schedule")) return "schedule";
  if (pathname.startsWith("/move/wallet")) return "wallet";
  if (pathname.startsWith("/move/vault")) return "vault";
  return "shifts";
}

function pathForScreen(screen: Screen): string {
  switch (screen) {
    case "schedule": return "/move/schedule";
    case "wallet": return "/move/wallet";
    case "vault": return "/move/vault";
    default: return "/move";
  }
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

/* ── Slide to claim ── */
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
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 48, borderRadius: 14, background: "#eef6ec", border: "1px solid #cfe6cf",
        fontFamily: HANKEN, fontSize: 14, fontWeight: 700, color: "#2f7d4f",
      }}>
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
      style={{
        position: "relative", height: 48, borderRadius: 14, overflow: "hidden",
        background: "linear-gradient(90deg, #fbeae0 0%, #fdf1e6 100%)",
        border: "1px solid #f3d6c4", cursor: "grab", userSelect: "none",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: "#bf5223",
        opacity: dragX > 40 ? 0.3 : 1, transition: "opacity 0.15s",
      }}>
        Slide to claim shift →
      </div>
      <div
        onPointerDown={handlePointerDown}
        style={{
          position: "absolute", left: dragX + 4, top: 4, width: 40, height: 40,
          borderRadius: 12, background: PRIMARY, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(224,81,31,.4)",
          transition: dragging ? "none" : "left 0.25s cubic-bezier(0.16,1,0.3,1)",
          touchAction: "none",
        }}
      >
        <ChevronRight size={20} />
      </div>
    </div>
  );
}

/* ── Signature pad ── */
function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onUp = () => { drawing.current = false; };

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{
        width: "100%", height: 120, borderRadius: 12, background: "#fff",
        border: "1px dashed #d8d2c6", touchAction: "none", cursor: "crosshair",
      }}
    />
  );
}

/* ── Shift card ── */
function ShiftCard({
  shift,
  onClaim,
  claimed,
}: {
  shift: Shift;
  onClaim?: () => void;
  claimed?: boolean;
}) {
  const tag = VEHICLE_TAGS[shift.vehicle];
  return (
    <article style={{
      background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20,
      padding: "18px 18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontFamily: HANKEN, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: INK }}>
            {formatPayout(shift)}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTE, marginTop: 2 }}>
            {shift.date} · {shift.hours}h · {shift.distanceMi} mi
          </div>
        </div>
        {shift.demand === "high" && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
            borderRadius: 999, background: "#fbeae0", color: "#9c3f15",
            fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
          }}>
            <Flame size={11} /> HOT
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <span style={{
          padding: "5px 10px", borderRadius: 8, background: tag.bg, color: tag.color,
          fontFamily: HANKEN, fontSize: 12, fontWeight: 600,
        }}>
          <Truck size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />
          {tag.label}
        </span>
        <span style={{
          padding: "5px 10px", borderRadius: 8, background: "#f6f3ec", color: "#5f655c",
          fontFamily: HANKEN, fontSize: 12, fontWeight: 500,
        }}>
          {shift.stops} stops
        </span>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <MapPin size={14} color={PRIMARY} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: INK }}>{shift.pickup}</div>
            <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE }}>{shift.dropoff}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color={MUTE} />
          <span style={{ fontFamily: HANKEN, fontSize: 13, color: "#5f655c" }}>
            {shift.startTime} – {shift.endTime}
          </span>
        </div>
      </div>

      {onClaim && (
        <div style={{ marginTop: 16 }}>
          <SlideToClaim onClaim={onClaim} claimed={claimed} />
        </div>
      )}
    </article>
  );
}

/* ── Page wrapper ── */
function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="move-page-screen">
      <div className="move-page-inner">
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: HANKEN, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: INK, margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontFamily: HANKEN, fontSize: 14, color: "#5f655c", marginTop: 6, lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

export function DriverApp() {
  const pathname = usePathname();
  const router = useRouter();
  const screen = screenFromPath(pathname);

  const [zone, setZone] = useState("DFW North");
  const [openShifts, setOpenShifts] = useState(INITIAL_SHIFTS);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [myShifts, setMyShifts] = useState(CLAIMED_SHIFTS);
  const [clockedIn, setClockedIn] = useState(false);
  const [cashoutOpen, setCashoutOpen] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);

  const weekEarnings = useMemo(() => 720, []);

  useEffect(() => {
    if (!VALID_PATHS.has(pathname)) {
      router.replace("/move");
    }
  }, [pathname, router]);

  const navigate = useCallback((go: string) => {
    router.push(pathForScreen(go as Screen));
  }, [router]);

  const handleClaim = (shift: Shift) => {
    setClaimedIds((prev) => new Set(prev).add(shift.id));
    setMyShifts((prev) => [{ ...shift, status: "claimed" }, ...prev]);
    setOpenShifts((prev) => prev.filter((s) => s.id !== shift.id));
    setTimeout(() => router.push("/move/schedule"), 600);
  };

  const filteredShifts = zone === "All zones" ? openShifts : openShifts.filter((s) => s.zone === zone);

  const modals = cashoutOpen ? (
    <div className="move-overlay move-overlay--sheet" onClick={() => setCashoutOpen(false)}>
      <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="move-sheet-handle" />
        {cashoutDone ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999, background: "#eef6ec",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
            }}>
              <Check size={28} color="#2f7d4f" />
            </div>
            <h3 style={{ fontFamily: HANKEN, fontSize: 20, fontWeight: 800, marginTop: 16, color: INK }}>
              ${WALLET.available} on the way
            </h3>
            <p style={{ fontFamily: HANKEN, fontSize: 14, color: "#5f655c", marginTop: 8 }}>
              Arrives in your bank within minutes.
            </p>
            <button
              type="button"
              onClick={() => { setCashoutOpen(false); setCashoutDone(false); }}
              style={{
                marginTop: 24, width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: HANKEN, fontSize: 20, fontWeight: 800, color: INK, margin: 0 }}>
              Instant cashout
            </h3>
            <p style={{ fontFamily: HANKEN, fontSize: 14, color: "#5f655c", marginTop: 8 }}>
              Transfer ${WALLET.available} to your debit card now.
            </p>
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 16, background: "#faf8f3",
              border: "1px solid #e4dfd5", display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: HANKEN, fontSize: 14, color: "#5f655c" }}>Micro-fee</span>
              <span style={{ fontFamily: HANKEN, fontSize: 14, fontWeight: 600, color: INK }}>${WALLET.cashoutFee}</span>
            </div>
            <div style={{
              marginTop: 8, padding: 16, borderRadius: 16, background: "#fbeae0",
              border: "1px solid #f3d6c4", display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: HANKEN, fontSize: 14, fontWeight: 600, color: INK }}>You receive</span>
              <span style={{ fontFamily: HANKEN, fontSize: 18, fontWeight: 800, color: PRIMARY }}>
                ${(WALLET.available - WALLET.cashoutFee).toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCashoutDone(true)}
              style={{
                marginTop: 24, width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Zap size={16} /> Cash out now
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <DriverAppShell
      tabs={[...TABS]}
      screen={screen}
      onNavigate={navigate}
      zoneName={zone}
      weekEarnings={weekEarnings}
      modals={modals}
    >
      {screen === "shifts" && (
        <Page title="Available shifts" subtitle="Commercial routes in your zone — claim instantly.">
          {/* Earnings header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 18px", borderRadius: 18, background: INK, color: "#fff", marginBottom: 20,
          }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f3aa79" }}>
                Earned this week
              </div>
              <div style={{ fontFamily: HANKEN, fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>
                ${weekEarnings}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("wallet")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 14px",
                borderRadius: 12, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)",
                color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Wallet size={14} /> Cash out
            </button>
          </div>

          {/* Zone filter */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
            {["All zones", ...ZONES].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: "1px solid",
                  borderColor: zone === z ? PRIMARY : "#e4dfd5",
                  background: zone === z ? "#fbeae0" : "#fff",
                  color: zone === z ? "#9c3f15" : "#5f655c",
                  fontFamily: HANKEN, fontSize: 13, fontWeight: zone === z ? 700 : 500, cursor: "pointer",
                }}
              >
                {z}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredShifts.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px", borderRadius: 18,
                border: "1px dashed #d8d2c6", color: MUTE, fontFamily: HANKEN, fontSize: 14,
              }}>
                No open shifts in this zone right now. Try another zone or check back soon.
              </div>
            ) : (
              filteredShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onClaim={() => handleClaim(shift)}
                  claimed={claimedIds.has(shift.id)}
                />
              ))
            )}
          </div>
        </Page>
      )}

      {screen === "schedule" && (
        <Page title="My schedule" subtitle="Your committed shifts and today's live workspace.">
          {/* Active shift workspace */}
          <div style={{
            borderRadius: 20, border: `2px solid ${clockedIn ? "#2f7d4f" : PRIMARY}`,
            background: clockedIn ? "#eef6ec" : "#fff", padding: 18, marginBottom: 24,
            boxShadow: clockedIn ? "0 0 0 4px rgba(47,125,79,.12)" : "0 2px 12px rgba(224,81,31,.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: clockedIn ? "#2f7d4f" : PRIMARY,
                animation: clockedIn ? "none" : "pulse 2s infinite",
              }} />
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: clockedIn ? "#2f7d4f" : PRIMARY, fontWeight: 600 }}>
                {clockedIn ? "Live shift" : "Today's shift"}
              </span>
            </div>

            <div style={{ fontFamily: HANKEN, fontSize: 22, fontWeight: 800, color: INK }}>
              {formatPayout(ACTIVE_SHIFT)}
            </div>
            <div style={{ fontFamily: HANKEN, fontSize: 13, color: "#5f655c", marginTop: 4 }}>
              {ACTIVE_SHIFT.pickup} · {ACTIVE_SHIFT.startTime} – {ACTIVE_SHIFT.endTime}
            </div>

            {!clockedIn ? (
              <button
                type="button"
                onClick={() => setClockedIn(true)}
                style={{
                  marginTop: 16, width: "100%", padding: 14, borderRadius: 14, border: "none",
                  background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <MapPin size={16} /> Clock in at warehouse
              </button>
            ) : (
              <>
                {/* Waypoints */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTE, marginBottom: 10 }}>
                    Route waypoints
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {WAYPOINTS.map((wp, i) => (
                      <div key={wp.id} style={{ display: "flex", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: 999, flexShrink: 0,
                            background: wp.done ? "#2f7d4f" : "#e4dfd5",
                            border: wp.done ? "none" : `2px solid ${MUTE}`,
                          }} />
                          {i < WAYPOINTS.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 24, background: wp.done ? "#cfe6cf" : "#e4dfd5" }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: 16, flex: 1 }}>
                          <div style={{ fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: wp.done ? MUTE : INK, textDecoration: wp.done ? "line-through" : "none" }}>
                            {wp.label}
                          </div>
                          <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE }}>{wp.address}</div>
                          {!wp.done && i === WAYPOINTS.findIndex((w) => !w.done) && (
                            <button
                              type="button"
                              style={{
                                marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "6px 12px", borderRadius: 8, border: "1px solid #e4dfd5",
                                background: "#fff", fontFamily: HANKEN, fontSize: 12, fontWeight: 600,
                                color: PRIMARY, cursor: "pointer",
                              }}
                            >
                              <Navigation size={12} /> Navigate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign-off pad */}
                <div style={{ marginTop: 8, padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #e4dfd5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <PenLine size={14} color={MUTE} />
                    <span style={{ fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: INK }}>
                      Manager sign-off
                    </span>
                  </div>
                  <SignaturePad />
                  <p style={{ fontFamily: HANKEN, fontSize: 11, color: MUTE, marginTop: 8 }}>
                    Warehouse manager signs here to verify shift completion.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Upcoming queue */}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTE, marginBottom: 12 }}>
            Upcoming this week
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderRadius: 16, background: "#fff", border: "1px solid #e4dfd5",
                }}
              >
                <div>
                  <div style={{ fontFamily: HANKEN, fontSize: 15, fontWeight: 700, color: INK }}>
                    {formatPayout(shift)}
                  </div>
                  <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE, marginTop: 2 }}>
                    {shift.date} · {shift.startTime} · {shift.zone}
                  </div>
                </div>
                <ChevronRight size={16} color={MUTE} />
              </div>
            ))}
          </div>
        </Page>
      )}

      {screen === "wallet" && (
        <Page title="Sovereign wallet" subtitle="See your balance, cash out instantly, and track every shift payout.">
          {/* Balance dashboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Available", value: WALLET.available, highlight: true },
              { label: "Pending", value: WALLET.pending, highlight: false },
              { label: "Lifetime", value: WALLET.lifetime, highlight: false },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  padding: "18px 16px", borderRadius: 18,
                  background: b.highlight ? INK : "#fff",
                  border: b.highlight ? "none" : "1px solid #e4dfd5",
                  color: b.highlight ? "#fff" : INK,
                }}
              >
                <div style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: b.highlight ? "#f3aa79" : MUTE,
                }}>
                  {b.label}
                </div>
                <div style={{ fontFamily: HANKEN, fontSize: 26, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>
                  ${b.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCashoutOpen(true)}
            style={{
              width: "100%", padding: 16, borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #bf6a3c 100%)`,
              color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 24px rgba(224,81,31,.3)", marginBottom: 28,
            }}
          >
            <Zap size={18} /> Instant cashout — ${WALLET.available} available
          </button>

          {/* Ledger */}
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTE, marginBottom: 12 }}>
            Transaction history
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 16, overflow: "hidden", border: "1px solid #e4dfd5" }}>
            {LEDGER.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", background: "#fff",
                  borderTop: i > 0 ? "1px solid #f0ebe1" : "none",
                }}
              >
                <div>
                  <div style={{ fontFamily: HANKEN, fontSize: 14, fontWeight: 600, color: INK }}>{entry.label}</div>
                  <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE }}>{entry.date}</div>
                </div>
                <span style={{
                  fontFamily: HANKEN, fontSize: 15, fontWeight: 700,
                  color: entry.amount > 0 ? "#2f7d4f" : INK,
                }}>
                  {entry.amount > 0 ? "+" : ""}${Math.abs(entry.amount).toFixed(entry.amount % 1 ? 2 : 0)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: 16, borderRadius: 16, background: "#faf8f3",
            border: "1px solid #e4dfd5", display: "flex", alignItems: "center", gap: 12,
          }}>
            <Shield size={18} color={MUTE} />
            <p style={{ fontFamily: HANKEN, fontSize: 13, color: "#5f655c", margin: 0, lineHeight: 1.5 }}>
              Tax documents and 1099 summaries are generated automatically at year-end. Platform fees are shown transparently on every payout.
            </p>
          </div>
        </Page>
      )}

      {screen === "vault" && (
        <Page title="Compliance vault" subtitle="Keep your credentials verified so logistics companies can hire you with confidence.">
          {/* Status summary */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap",
          }}>
            {[
              { label: "Verified", count: COMPLIANCE_DOCS.filter((d) => d.status === "verified").length, color: "#2f7d4f" },
              { label: "Action needed", count: COMPLIANCE_DOCS.filter((d) => d.status === "expiring" || d.status === "missing").length, color: "#b9781f" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "1 1 120px", padding: "14px 16px", borderRadius: 14,
                background: "#fff", border: "1px solid #e4dfd5",
              }}>
                <div style={{ fontFamily: HANKEN, fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Document grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPLIANCE_DOCS.map((doc) => {
              const colors = docStatusColor(doc.status);
              return (
                <div
                  key={doc.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                    borderRadius: 16, background: "#fff", border: "1px solid #e4dfd5",
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: 999, background: colors.dot, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: HANKEN, fontSize: 14, fontWeight: 600, color: INK }}>{doc.name}</div>
                    <div style={{ fontFamily: HANKEN, fontSize: 12, color: MUTE, marginTop: 2 }}>{doc.detail}</div>
                    {doc.expiresAt && (
                      <div style={{ fontFamily: HANKEN, fontSize: 11, color: colors.text, marginTop: 4, fontWeight: 600 }}>
                        Expires {doc.expiresAt}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 8, background: colors.bg, color: colors.text,
                    fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}>
                    {docStatusLabel(doc.status)}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            style={{
              marginTop: 20, width: "100%", padding: 16, borderRadius: 16,
              border: `2px dashed ${PRIMARY}`, background: "#fbeae0",
              color: "#9c3f15", fontFamily: HANKEN, fontSize: 15, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Camera size={18} /> Upload document
          </button>

          <div style={{
            marginTop: 24, padding: 18, borderRadius: 16, background: INK, color: "#fff",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f3aa79" }}>
              Fleet managers
            </div>
            <p style={{ fontFamily: HANKEN, fontSize: 14, color: "rgba(255,255,255,.75)", marginTop: 8, lineHeight: 1.5 }}>
              Logistics companies hire from verified rosters only. A complete vault unlocks premium shifts and higher daily rates.
            </p>
            <a
              href="/contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                fontFamily: HANKEN, fontSize: 13, fontWeight: 600, color: "#f3aa79", textDecoration: "none",
              }}
            >
              Post shifts as a fleet manager <ArrowRight size={14} />
            </a>
          </div>
        </Page>
      )}
    </DriverAppShell>
  );
}
