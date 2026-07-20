"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Check,
  ChevronRight,
  Search,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MoveAppShell } from "@/app/move/MoveAppShell";
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
  updateFleetProfile,
} from "@/lib/fleet/client";
import { fundLoad } from "@/lib/payments/client";
import type { BookingOfferSummary, FleetWorkspace, MarketplaceDriver, Shift } from "@/lib/driver/types";
import type { CargoCategory, VehicleType } from "@/lib/marketplace/taxonomy";
import "@/app/move/move.css";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

type Screen = "welcome" | "setup" | "dashboard" | "post" | "drivers" | "loads";

const FLOW_SCREENS: Screen[] = ["welcome", "setup"];
const VALID_PATHS = new Set([
  "/fleet", "/fleet/setup", "/fleet/dashboard", "/fleet/post", "/fleet/drivers", "/fleet/loads",
]);

function buildPath(screen: Screen): string {
  switch (screen) {
    case "welcome": return "/fleet";
    case "setup": return "/fleet/setup";
    case "dashboard": return "/fleet/dashboard";
    case "post": return "/fleet/post";
    case "drivers": return "/fleet/drivers";
    case "loads": return "/fleet/loads";
  }
}

function screenFromPath(pathname: string): Screen {
  const rest = pathname.replace(/^\/fleet\/?/, "");
  if (rest === "") return "welcome";
  if (rest === "setup") return "setup";
  if (rest === "dashboard") return "dashboard";
  if (rest === "post") return "post";
  if (rest === "drivers") return "drivers";
  if (rest === "loads") return "loads";
  return "welcome";
}

function formatPayout(shift: Shift) {
  return shift.payoutType === "day" ? `$${shift.payout}/day` : `$${shift.payout}/hr`;
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
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(pathname));
  const [ready, setReady] = useState(false);
  const [workspace, setWorkspace] = useState<FleetWorkspace | null>(null);
  const [companyName, setCompanyName] = useState("My Fleet");
  const [contactName, setContactName] = useState("");
  const [zoneIdx, setZoneIdx] = useState(0);
  const [driverVehicleFilter, setDriverVehicleFilter] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [bookDriverId, setBookDriverId] = useState<string | null>(null);
  const [bookShiftId, setBookShiftId] = useState<string>("");
  const [bookMessage, setBookMessage] = useState("");
  const [bookBusy, setBookBusy] = useState(false);

  const [postForm, setPostForm] = useState({
    title: "",
    payout: "250",
    payoutType: "day" as "day" | "hour",
    vehicleType: "box-truck" as VehicleType,
    cargo: "general-freight" as CargoCategory,
    pickup: "",
    dropoff: "",
    startTime: "6:00 AM",
    endTime: "2:00 PM",
    hours: "8",
    distanceMi: "60",
    stops: "5",
    demand: "normal" as "high" | "normal",
    shiftDate: "Today",
  });

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
    setReady(true);
  }, [ready, pathname, router]);

  useEffect(() => {
    if (!ready || FLOW_SCREENS.includes(screen)) return;
    void loadWorkspace();
  }, [ready, screen, loadWorkspace]);

  useEffect(() => {
    setScreen(screenFromPath(pathname));
  }, [pathname]);

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    router.push(buildPath(next));
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
        title: postForm.title || `${vehicle?.label ?? "Load"} route`,
        payoutCents: Math.round(parseFloat(postForm.payout) * 100),
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
      // Escrow payout immediately so drivers can book
      if (id) {
        try {
          const fundResult = await fundLoad(id);
          if (fundResult.mode === "stripe" && fundResult.url) {
            window.location.href = fundResult.url;
            return;
          }
        } catch {
          // Load is posted; fleet can fund from My Loads if auto-fund fails
        }
      }
      await loadWorkspace();
      setTimeout(() => { setPostSuccess(false); goTo("loads"); }, 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in to post loads.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/fleet/post")}`;
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
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to complete load.");
    }
  };

  const handleCancel = async (shiftId: string) => {
    try {
      setActionError(null);
      await cancelFleetShift(shiftId);
      await loadWorkspace();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to cancel load.");
    }
  };

  const handleFund = async (shiftId: string) => {
    try {
      setActionError(null);
      const result = await fundLoad(shiftId);
      if (result.mode === "stripe" && result.url) {
        window.location.href = result.url;
        return;
      }
      await loadWorkspace();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to fund load.";
      if (/sign in|401|unauthorized/i.test(msg)) {
        window.location.href = `/auth?redirect=${encodeURIComponent("/fleet/loads")}`;
        return;
      }
      setActionError(msg);
    }
  };

  const handleBookDriver = async () => {
    if (!bookDriverId || !bookShiftId) {
      setActionError("Pick an open load to book this driver.");
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
      goTo("loads");
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
              Fill routes.<br />
              <span style={{ color: PRIMARY }}>Find great drivers.</span>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 340 }}>
              Post loads from parcel to tankers, discover rated independent drivers and truck owners, and manage your workload — commission-based, transparent pricing.
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => goTo("setup")} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>
            Set up fleet console
          </button>
          <button onClick={() => goTo("dashboard")} style={{ width: "100%", padding: 15, marginTop: 10, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Skip — open console →
          </button>
        </div>
        <FlowAside
          title="Marketplace for logistics"
          text="Post heavy goods, refrigerated, tanker, and last-mile loads. Drivers and owner-operators claim with one slide."
          steps={[
            { n: 1, text: "Post loads with cargo type, vehicle, and pay" },
            { n: 2, text: "Find rated drivers and truck owners in your zone" },
            { n: 3, text: "Track active workload and pay 8% commission on completion" },
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
          <p style={{ fontSize: 15, color: "#5f655c", margin: "12px 0 0" }}>Company details help drivers trust your loads on the marketplace.</p>

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
          text="You only pay when a load completes. 8% platform fee — drivers see net pay upfront."
          steps={[
            { n: 1, text: "Heavy goods, tankers, reefers, parcel — all cargo types" },
            { n: 2, text: "Bilateral ratings after every completed load" },
            { n: 3, text: "Independent drivers and truck owners compete on rates" },
          ]}
        />
      </div>
    );
  }

  function DriverCard({ driver }: { driver: MarketplaceDriver }) {
    const tag = VEHICLE_TAGS[driver.vehicleType];
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{driver.displayName}</div>
            <div style={{ fontSize: 13, color: MUTE, marginTop: 2 }}>
              {driver.ownerType === "owner" ? "Truck owner" : "Driver"} · {driver.zone}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#b9781f" }}>
            <Star size={14} fill="#b9781f" color="#b9781f" />
            {formatRating(driver.ratingAvg, driver.ratingCount)}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <span style={{ background: tag.bg, color: tag.color, borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>{tag.label}</span>
          {driver.rateHint && (
            <span style={{ background: "#f0ede4", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO, color: "#4a5047" }}>
              from ${driver.rateHint}/day
            </span>
          )}
        </div>
        {driver.bio && <p style={{ fontSize: 13.5, color: "#5f655c", margin: "12px 0 0", lineHeight: 1.45 }}>{driver.bio}</p>}
        <button
          type="button"
          onClick={() => {
            setBookDriverId(driver.id);
            setBookShiftId(bookableLoads[0]?.id ?? "");
          }}
          style={{ width: "100%", marginTop: 14, padding: 12, border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Book this driver
        </button>
      </div>
    );
  }

  function LoadCard({ shift, showActions }: { shift: Shift; showActions?: boolean }) {
    const vTag = VEHICLE_TAGS[shift.vehicle];
    const cTag = CARGO_TAGS[shift.cargo];
    return (
      <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{shift.title}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: PRIMARY }}>{formatPayout(shift)}</div>
          </div>
          <span style={{ padding: "6px 11px", borderRadius: 999, background: shift.status === "open" ? "#eef6ec" : shift.status === "completed" ? "#f0ede4" : "#fbeae0", color: shift.status === "open" ? "#2f7d4f" : shift.status === "completed" ? MUTE : "#9c3f15", fontFamily: MONO, fontSize: 10, fontWeight: 600, textTransform: "uppercase", height: "fit-content" }}>
            {shift.status}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <span style={{ background: vTag.bg, color: vTag.color, borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>{vTag.label}</span>
          <span style={{ background: cTag.bg, color: cTag.color, borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>{cTag.label}</span>
          {shift.funded ? (
            <span style={{ background: "#eef6ec", color: "#2f7d4f", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>Funded</span>
          ) : (
            <span style={{ background: "#fdf6e8", color: "#9a6318", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>Unfunded</span>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: "#5f655c", margin: "10px 0 0" }}>{shift.pickup} → {shift.dropoff}</p>
        {shift.claimedDriverName && (
          <p style={{ fontSize: 13, color: INK, margin: "8px 0 0", fontWeight: 600 }}>Claimed by {shift.claimedDriverName}</p>
        )}
        {showActions && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {shift.status === "open" && !shift.funded && (
              <button type="button" onClick={() => void handleFund(shift.id)} style={{ flex: 1, minWidth: 120, padding: 12, borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fund escrow</button>
            )}
            {shift.status === "open" && (
              <button type="button" onClick={() => void handleCancel(shift.id)} style={{ flex: 1, minWidth: 100, padding: 12, borderRadius: 12, border: "1px solid #e4dfd5", background: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            )}
            {(shift.status === "claimed" || shift.status === "active") && (
              <button type="button" onClick={() => void handleComplete(shift.id)} style={{ flex: 1, minWidth: 120, padding: 12, borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Mark complete</button>
            )}
          </div>
        )}
      </div>
    );
  }

  function Dashboard() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Fleet console · {companyName}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Workload overview</h2>

          {notifications[0] && (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "#eef6ec", border: "1px solid #cfe6cf" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2f7d4f" }}>{notifications[0].title}</div>
              <div style={{ fontSize: 13, color: "#5f655c", marginTop: 4 }}>{notifications[0].body}</div>
            </div>
          )}

          {pendingOffers.length > 0 && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "#fbeae0", border: "1px solid #f3d6c4", fontSize: 13, color: "#9c3f15", fontWeight: 600 }}>
              {pendingOffers.length} booking offer{pendingOffers.length === 1 ? "" : "s"} waiting for driver accept
            </div>
          )}

          <div className="move-metric-grid" style={{ marginTop: 22 }}>
            {[
              { label: "Open loads", value: stats.openLoads },
              { label: "Active", value: stats.activeLoads, accent: true },
              { label: "Completed", value: stats.completedLoads },
              { label: "Commission", value: `$${stats.commissionEarned}`, accent: true },
            ].map((m) => (
              <div key={m.label} style={{ padding: 18, borderRadius: 18, background: m.accent ? INK : "#fff", border: m.accent ? "none" : "1px solid #e4dfd5", color: m.accent ? "#fff" : INK }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: m.accent ? "#f3aa79" : MUTE }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE, margin: "28px 0 12px" }}>Active workload</div>
          {activeWorkload.length === 0 ? (
            <div style={{ padding: 24, borderRadius: 18, border: "1px dashed #d8d2c6", textAlign: "center", color: MUTE, fontSize: 14 }}>No active loads. Post a load to get started.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeWorkload.map((s) => <LoadCard key={s.id} shift={s} showActions />)}
            </div>
          )}

          <button type="button" onClick={() => goTo("post")} style={{ width: "100%", marginTop: 24, padding: 17, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Post new load
          </button>
        </div>
      </div>
    );
  }

  function PostLoad() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Post load · {zone.label}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>New marketplace load</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Drivers can claim only after you fund escrow. Stripe Checkout when keys are set; ledger escrow otherwise.</p>

          {postSuccess ? (
            <div style={{ marginTop: 32, textAlign: "center", padding: 32, borderRadius: 20, background: "#eef6ec", border: "1px solid #cfe6cf" }}>
              <Check size={32} color="#2f7d4f" style={{ margin: "0 auto" }} />
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12, color: "#2f7d4f" }}>Load posted!</div>
            </div>
          ) : (
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Load title" value={postForm.title} onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder="Payout ($)" value={postForm.payout} onChange={(e) => setPostForm((f) => ({ ...f, payout: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
                <select value={postForm.payoutType} onChange={(e) => setPostForm((f) => ({ ...f, payoutType: e.target.value as "day" | "hour" }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }}>
                  <option value="day">Per day</option>
                  <option value="hour">Per hour</option>
                </select>
              </div>
              <select value={postForm.vehicleType} onChange={(e) => setPostForm((f) => ({ ...f, vehicleType: e.target.value as VehicleType }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }}>
                {VEHICLE_OPTIONS.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
              <select value={postForm.cargo} onChange={(e) => setPostForm((f) => ({ ...f, cargo: e.target.value as CargoCategory }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }}>
                {CARGO_OPTIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input placeholder="Pickup location" value={postForm.pickup} onChange={(e) => setPostForm((f) => ({ ...f, pickup: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
              <input placeholder="Dropoff / route summary" value={postForm.dropoff} onChange={(e) => setPostForm((f) => ({ ...f, dropoff: e.target.value }))} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e4dfd5", fontFamily: HANKEN, fontSize: 15 }} />
              <button type="button" onClick={() => void handlePostLoad()} style={{ marginTop: 8, padding: 17, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                Post to marketplace
              </button>
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
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Book drivers · {zone.label}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Find &amp; book rated partners</h2>
          <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>
            Tap Book, pick an open load, and the driver gets a direct offer to accept.
          </p>

          {bookableLoads.length === 0 && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "#fdf6e8", border: "1px solid #f3e0c4", fontSize: 13, color: "#9a6318" }}>
              {openLoads.length === 0
                ? "Post and fund a load first, then book a driver onto it."
                : "Fund escrow on an open load before booking a driver."}{" "}
              <button type="button" onClick={() => goTo(openLoads.length ? "loads" : "post")} style={{ color: PRIMARY, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                {openLoads.length ? "My loads →" : "Post load →"}
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}>
            <button type="button" onClick={() => setDriverVehicleFilter("all")} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${driverVehicleFilter === "all" ? PRIMARY : "#e4dfd5"}`, background: driverVehicleFilter === "all" ? PRIMARY : "#fff", color: driverVehicleFilter === "all" ? "#fff" : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>All vehicles</button>
            {VEHICLE_OPTIONS.map((v) => (
              <button key={v.key} type="button" onClick={() => setDriverVehicleFilter(v.key)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${driverVehicleFilter === v.key ? PRIMARY : "#e4dfd5"}`, background: driverVehicleFilter === v.key ? PRIMARY : "#fff", color: driverVehicleFilter === v.key ? "#fff" : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v.label}</button>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {drivers.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, border: "1px dashed #d8d2c6", textAlign: "center", color: MUTE, fontSize: 14 }}>
                <Search size={20} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                No drivers match this filter yet.
              </div>
            ) : (
              drivers.map((d) => <DriverCard key={d.id} driver={d} />)
            )}
          </div>
        </div>
      </div>
    );
  }

  function LoadsScreen() {
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>My loads · {stats.totalPosted} posted</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 0" }}>Posted loads</h2>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {postedShifts.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, border: "1px dashed #d8d2c6", textAlign: "center", color: MUTE, fontSize: 14 }}>No loads posted yet. <button type="button" onClick={() => goTo("post")} style={{ color: PRIMARY, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Post your first load</button></div>
            ) : (
              postedShifts.map((s) => <LoadCard key={s.id} shift={s} showActions />)
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
      case "post": return PostLoad();
      case "drivers": return DriversScreen();
      case "loads": return LoadsScreen();
    }
  }

  const isFlowScreen = FLOW_SCREENS.includes(screen);
  const showNav = !isFlowScreen;

  const tabs = [
    { label: "Dashboard", screens: ["dashboard"], go: "dashboard" as Screen },
    { label: "Post Load", screens: ["post"], go: "post" as Screen },
    { label: "Book Drivers", screens: ["drivers"], go: "drivers" as Screen },
    { label: "My Loads", screens: ["loads"], go: "loads" as Screen },
  ];

  const bookModal = bookDriverId ? (
    <div className="move-overlay move-overlay--sheet" onClick={() => setBookDriverId(null)}>
      <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="move-sheet-handle" />
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Book driver</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 0" }}>{bookingDriver?.displayName ?? "Driver"}</h3>
        <p style={{ fontSize: 13.5, color: "#6e746b", margin: "6px 0 0" }}>Choose one of your open loads. They get a direct offer to accept.</p>

        {bookableLoads.length === 0 ? (
          <div style={{ marginTop: 18, padding: 16, borderRadius: 14, background: "#fdf6e8", color: "#9a6318", fontSize: 13 }}>
            No funded open loads. Fund escrow first, then book.
            <button type="button" onClick={() => { setBookDriverId(null); goTo(openLoads.length ? "loads" : "post"); }} style={{ display: "block", marginTop: 10, color: PRIMARY, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              {openLoads.length ? "Fund a load →" : "Post load →"}
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
      destCity={showNav ? companyName : undefined}
      destCountry={showNav ? zone.label : undefined}
      stayLabel={showNav ? "Fleet" : undefined}
      modeName={showNav ? "Operator" : undefined}
      movePct={stats.completedLoads > 0 ? Math.min(100, Math.round((stats.completedLoads / Math.max(stats.totalPosted, 1)) * 100)) : 0}
      moveDone={stats.completedLoads}
      moveTotal={Math.max(stats.totalPosted, 1)}
      meterLabel="Fill rate"
      meterSub={`${stats.completedLoads} of ${stats.totalPosted} loads completed`}
      isFlowScreen={isFlowScreen}
      modals={bookModal}
    >
      {screenBody()}
      {(actionError || loadError) && !isFlowScreen && (
        <div style={{ position: "fixed", bottom: 88, left: 16, right: 16, zIndex: 40, padding: "12px 16px", borderRadius: 14, background: "#fbeae0", border: "1px solid #f3d6c4", color: "#9c3f15", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          {actionError ?? loadError}
        </div>
      )}
    </MoveAppShell>
  );
}
