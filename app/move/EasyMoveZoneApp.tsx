"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ComponentType } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  GraduationCap,
  Info,
  ListChecks,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import {
  MODE_LABEL,
  MOOD_CHIPS,
  PLAN,
  QUESTIONS,
  SPECTRUM,
  type Mode,
} from "./data";
import {
  buildTravelExecutionCore,
  type IntegrationAction,
  type PersonaMatch,
} from "./core-features";
import { useMoveCatalog } from "./useMoveCatalog";
import { DestinationImage } from "./ImageSlot";
import { MoveAppShell } from "./MoveAppShell";
import { SettleCardsGrid } from "@/components/settle/SettleCardsGrid";
import "./move.css";
import { loadFlowState, saveFlowState } from "./storage";
import { authClient } from "@/lib/auth/client";
import { savePlan, addTask, fetchWorkspace, updateTaskStatus, fetchGuideByCitySlug } from "@/lib/relocate/client";
import { moveTaskNote, parseMoveTaskNote } from "@/lib/move/plan-sync";
import { settleCardsForCity } from "@/lib/settle/cards";
import { MatchesSkeleton } from "@/components/ui/PageSkeletons";
import { createBooking, fetchBookings } from "@/lib/bookings/client";
import type { BookingType, MoveBooking } from "@/lib/bookings/types";
import type { SettleCard, TaskCategory, WorkMode } from "@/lib/relocate/types";

// A booking the user is about to confirm in the slide-up sheet.
interface PendingBooking {
  type: BookingType;
  title: string;
  provider: string;
  price: string;
  needsDates: boolean;
  needsRange: boolean;
  needsGuests: boolean;
}

// Map a /move work answer to a relocation work mode.
function workModeFromAnswer(answer: string | undefined): WorkMode {
  switch (answer) {
    case "On a work assignment": return "onsite";
    case "Studying": return "student";
    case "Taking a break": return "hybrid";
    case "Remote, my own hours":
    default: return "remote";
  }
}

// Best-effort category for a checklist item so saved tasks group sensibly.
function categoryForItem(title: string): TaskCategory {
  const t = title.toLowerCase();
  if (/(visa|entry|passport|residen|permit)/.test(t)) return "visa";
  if (/(apostille|translat|document|notar|lease|legal)/.test(t)) return "legal";
  if (/(bank|budget|cost|tax|insurance|money)/.test(t)) return "finance";
  if (/(employer|client|work|notice|career|coworking)/.test(t)) return "career";
  if (/(school|family|pet|partner|childcare)/.test(t)) return "family";
  if (/(sim|utility|utilities|community|neighbo|register|healthcare|local)/.test(t)) return "settling";
  return "logistics";
}

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";

// Supplied via next/font CSS variables from the page wrapper.
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

/* ── Eligibility (AI visa assessment) types & options ─── */
interface EligProfile {
  nationality: string;
  age: string;
  education: string;
  experience: string;
  profession: string;
  english: string;
  budget: string;
  family: string;
  goals: string[];
  destination: string;
  timeline: string;
}
interface EligMatch {
  destinationId: string | null;
  country: string;
  city: string;
  visa: string;
  score: number;
  timeline: string;
  costRange: string;
}
interface EligResult {
  matches: EligMatch[];
  summary: string;
  nextSteps: string[];
}
interface ChecklistItem {
  label: string;
  why: string;
  urgent: boolean;
}
interface VisaOption {
  name: string;
  who: string;
  timeline: string;
  cost: string;
  difficulty: number;
  notes: string;
}
interface AppointmentsGuide {
  portalName: string;
  portalUrl: string;
  typicalWait: string;
  waitLevel: number;
  bookAhead: string;
  bestTimes: string;
  prep: string[];
  notes: string;
  source?: string;
}

const DEFAULT_ELIG_PROFILE: EligProfile = {
  nationality: "", age: "", education: "bachelors", experience: "3", profession: "",
  english: "fluent", budget: "comfortable", family: "just-me", goals: ["work"],
  destination: "no-preference", timeline: "3-6 months",
};

const ELIG_GOALS = [
  { id: "work", label: "Work" },
  { id: "study", label: "Study" },
  { id: "business", label: "Start a business" },
  { id: "family", label: "Join family" },
  { id: "remote", label: "Remote / nomad" },
];
const ELIG_EDU = [
  { id: "secondary", label: "Secondary" },
  { id: "diploma", label: "Diploma" },
  { id: "bachelors", label: "Bachelor's" },
  { id: "masters", label: "Master's" },
  { id: "phd", label: "PhD" },
];
const ELIG_ENGLISH = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "fluent", label: "Fluent" },
  { id: "ielts-6.5", label: "IELTS 6.5+" },
  { id: "ielts-7.5", label: "IELTS 7.5+" },
];
const ELIG_BUDGET = [
  { id: "lean", label: "Lean" },
  { id: "comfortable", label: "Comfortable" },
  { id: "generous", label: "Generous" },
  { id: "high", label: "High" },
];
const ELIG_FAMILY = [
  { id: "just-me", label: "Just me" },
  { id: "partner", label: "With partner" },
  { id: "family", label: "With family" },
];
const ELIG_TIMELINE = [
  { id: "asap", label: "ASAP" },
  { id: "3-6 months", label: "3–6 months" },
  { id: "6-12 months", label: "6–12 months" },
  { id: "1 year+", label: "1 year+" },
];
// Number of form steps before the results view (results render at eligStep === ELIG_STEPS).
const ELIG_STEPS = 3;

function goalToMode(goals: string[]): Mode {
  if (goals.some((g) => ["study", "work", "family", "business"].includes(g))) return "move";
  if (goals.some((g) => ["remote", "nomad"].includes(g))) return "nomad";
  return "trip";
}

// Each "core" screen (Intelligence / Awareness / Execution) gets its own accent
// so the three feel visually distinct instead of every section reusing the
// same orange-on-white card, which is what made the app read as one long list.
interface CoreTheme {
  icon: ComponentType<{ size?: number; strokeWidth?: number; style?: CSSProperties }>;
  color: string;
  soft: string;
  softBorder: string;
}
const CORE_THEME: Record<"intelligence" | "awareness" | "execution", CoreTheme> = {
  intelligence: { icon: Compass, color: "#b6541c", soft: "#fdf1e6", softBorder: "#f3d6c4" },
  awareness: { icon: Eye, color: "#1f6f78", soft: "#e9f5f4", softBorder: "#c9e6e3" },
  execution: { icon: Rocket, color: "#3d6b3f", soft: "#eef6ec", softBorder: "#cfe6cf" },
};

type TabDef = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; style?: CSSProperties }>;
  content: React.ReactNode;
};

// Module-level (not nested inside EasyMoveZoneApp) so its function identity
// stays stable across parent re-renders — otherwise React would remount it,
// and lose the selected tab, on every keystroke/state change elsewhere in
// the app. Splits a screen's sections into one-at-a-time panels instead of
// one long scroll, which is the whole point: less on screen per glance.
function TabGroup({ core, tabs }: { core: keyof typeof CORE_THEME; tabs: TabDef[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const theme = CORE_THEME[core];
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  if (!active) return null;
  return (
    <div style={{ marginTop: 26 }}>
      <div className="move-tab-bar" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {tabs.map((t) => {
          const isActive = t.id === active.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 18px",
                borderRadius: 999,
                border: `1.5px solid ${isActive ? theme.color : "#e4dfd5"}`,
                background: isActive ? theme.color : "#fff",
                color: isActive ? "#fff" : "#3f453c",
                fontFamily: HANKEN,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: isActive ? `0 6px 16px ${theme.color}4d` : "0 1px 3px rgba(0,0,0,.04)",
                transition: "background .15s ease, border-color .15s ease, box-shadow .15s ease",
              }}
            >
              <Icon size={16} strokeWidth={2.4} />
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 22 }}>{active.content}</div>
    </div>
  );
}

// Code-drawn difficulty meter — 5 segments, filled to `value` (1–5). No assets.
function DifficultyMeter({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value)));
  // green(easy) → amber → red(hard)
  const color = v <= 2 ? "#2f7d4f" : v === 3 ? "#b9781f" : "#c0492a";
  const labels = ["Very easy", "Easy", "Moderate", "Hard", "Very hard"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 3 }} aria-label={`Difficulty ${v} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ width: 16, height: 6, borderRadius: 999, background: i <= v ? color : "#e4dfd5" }} />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: 11, color, fontWeight: 600 }}>{labels[v - 1]}</span>
    </div>
  );
}

// Shimmer skeleton block for AI-backed sections while they load.
function Shimmer({ height = 64 }: { height?: number }) {
  return <div className="move-shimmer" style={{ height, borderRadius: 14 }} />;
}

// Small "AI generated for you" affordance.
function AiChip({ label = "Generated for your profile" }: { label?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "#f6e9df", border: "1px solid #f3d6c4" }}>
      <Sparkles size={12} strokeWidth={2.4} style={{ color: "#e0511f" }} />
      <span style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#bf5223", fontWeight: 600 }}>{label}</span>
    </span>
  );
}

type Screen =
  | "welcome"
  | "spectrum"
  | "search"
  | "matches"
  | "detail"
  | "intelligence"
  | "execution"
  | "visa"
  | "documents"
  | "settle"
  | "plan"
  | "book"
  | "trips"
  | "stays"
  | "visaBook"
  | "appointments"
  | "booked";

// Every screen now has a real URL under /move — this is what gives the app a
// working browser back/forward button, bookmarkable/shareable links, and a
// nav that can actually highlight where you are. `destId`-scoped screens
// live under /move/explore/[destId]/...; everything before a destination is
// chosen (welcome/spectrum/search/matches) doesn't need it in the path.
function buildMovePath(screen: Screen, destId: string): string {
  switch (screen) {
    case "welcome": return "/move";
    case "spectrum": return "/move/spectrum";
    case "search": return "/move/search";
    case "matches": return "/move/explore";
    case "detail": return `/move/explore/${destId}`;
    case "intelligence": return `/move/explore/${destId}/intelligence`;
    case "visa": return `/move/explore/${destId}/visa`;
    case "documents": return `/move/explore/${destId}/documents`;
    case "settle": return `/move/explore/${destId}/settle`;
    case "execution": return `/move/explore/${destId}/execution`;
    case "plan": return `/move/explore/${destId}/plan`;
    case "book": return `/move/explore/${destId}/book`;
    case "trips": return `/move/explore/${destId}/book/trips`;
    case "stays": return `/move/explore/${destId}/book/stays`;
    case "visaBook": return `/move/explore/${destId}/book/visa`;
    case "appointments": return `/move/explore/${destId}/book/appointments`;
    case "booked": return `/move/explore/${destId}/booked`;
  }
}

function screenFromPath(pathname: string): Screen {
  const rest = pathname.replace(/^\/move\/?/, "");
  if (rest === "") return "welcome";
  if (rest === "spectrum") return "spectrum";
  if (rest === "search") return "search";
  if (rest === "explore") return "matches";
  const m = rest.match(/^explore\/[^/]+(?:\/(.*))?$/);
  if (!m) return "welcome";
  const sub = m[1];
  if (!sub) return "detail";
  const subToScreen: Record<string, Screen> = {
    intelligence: "intelligence",
    visa: "visa",
    documents: "documents",
    settle: "settle",
    execution: "execution",
    plan: "plan",
    book: "book",
    "book/trips": "trips",
    "book/stays": "stays",
    "book/visa": "visaBook",
    "book/appointments": "appointments",
    booked: "booked",
  };
  return subToScreen[sub] ?? "detail";
}

export function EasyMoveZoneApp() {
  const pathname = usePathname();
  const params = useParams();
  const urlDestId = typeof params?.destId === "string" ? params.destId : null;
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(pathname));
  const [stayIdx, setStayIdx] = useState(2);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [destId, setDestId] = useState<string | null>(urlDestId);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [taskIdByKey, setTaskIdByKey] = useState<Record<string, string>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [destSwitchOpen, setDestSwitchOpen] = useState(false);

  // Mood search state — the AI-helper alternative to the structured quiz.
  const [exploreMode, setExploreMode] = useState<"mood" | "quiz">("mood");
  const [moodText, setMoodText] = useState("");
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodNote, setMoodNote] = useState<string | null>(null);
  const [moodRanking, setMoodRanking] = useState<string[] | null>(null);
  const [exploreReturnScreen, setExploreReturnScreen] = useState<Screen>("spectrum");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Clarify-with-AI state — a destination-grounded Q&A box on Visa & Settle.
  const [clarifyQuestion, setClarifyQuestion] = useState("");
  const [clarifyAnswer, setClarifyAnswer] = useState<string | null>(null);
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyError, setClarifyError] = useState<string | null>(null);

  // Eligibility state — the AI visa-eligibility + document-checklist wedge.
  const [eligProfile, setEligProfile] = useState<EligProfile>(DEFAULT_ELIG_PROFILE);
  const [eligStep, setEligStep] = useState(0);
  const [eligResult, setEligResult] = useState<EligResult | null>(null);
  const [eligLoading, setEligLoading] = useState(false);
  const [eligError, setEligError] = useState<string | null>(null);
  const [eligChecklist, setEligChecklist] = useState<ChecklistItem[] | null>(null);
  const [eligChecklistFor, setEligChecklistFor] = useState<string | null>(null);
  const [eligChecklistLoading, setEligChecklistLoading] = useState(false);

  // Visa options (AI-generated routes for the current destination).
  const [visaRoutes, setVisaRoutes] = useState<VisaOption[]>([]);
  const [visaRoutesFor, setVisaRoutesFor] = useState<string | null>(null);
  const [visaRoutesLoading, setVisaRoutesLoading] = useState(false);
  const [visaRoutesAi, setVisaRoutesAi] = useState(false);
  const [selectedVisaRoute, setSelectedVisaRoute] = useState<string | null>(null);

  // Documents — uploaded files (this session) + upload status.
  const [uploadedDocs, setUploadedDocs] = useState<{ label: string; url: string; key: string }[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Visa appointments guidance (AI wait-time + official portal).
  const [apptGuide, setApptGuide] = useState<AppointmentsGuide | null>(null);
  const [apptFor, setApptFor] = useState<string | null>(null);
  const [apptLoading, setApptLoading] = useState(false);

  // Booking flow state.
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");
  const [bookGuests, setBookGuests] = useState(1);
  const [bookState, setBookState] = useState<"idle" | "saving">("idle");
  const [lastBooking, setLastBooking] = useState<MoveBooking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<MoveBooking[]>([]);
  const [bookingHistoryLoading, setBookingHistoryLoading] = useState(false);
  const [settleCards, setSettleCards] = useState<SettleCard[]>([]);
  const [settleCommunity, setSettleCommunity] = useState("");

  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const signedIn = !!sessionData?.user;
  const { destinations, trips, stays, visaServices, schools, jobs, loaded: catalogLoaded } = useMoveCatalog();

  // Returning users who've completed the flow before land straight on
  // Explore (the matches screen) with their last destination & stay length,
  // instead of the welcome screen. The saved flow lives in localStorage, so
  // this works whether or not the user is signed in.
  // Only .move-scroll should scroll while inside the Move app — without this,
  // a few extra px of body height (from dvh rounding / safe-area insets) lets
  // the whole page rubber-band, revealing blank space under the bottom nav.
  useEffect(() => {
    document.body.classList.add("move-app-active");
    return () => document.body.classList.remove("move-app-active");
  }, []);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready || sessionPending || !catalogLoaded) return;
    // Only auto-resume on the bare welcome route — a deep link to a specific
    // screen/destination should always win over a saved flow.
    if (pathname === "/move") {
      const saved = loadFlowState();
      const validDest = saved && destinations.some((d) => d.id === saved.destId);
      const validStay = saved && saved.stayIdx >= 0 && saved.stayIdx < SPECTRUM.length;
      if (saved?.completed && validDest && validStay) {
        setStayIdx(saved.stayIdx);
        setDestId(saved.destId);
        setScreen("matches");
        router.replace(buildMovePath("matches", saved.destId));
        setReady(true);
        return;
      }
    }
    setReady(true);
  }, [ready, sessionPending, catalogLoaded, destinations, pathname, router]);

  // Keep local screen/destId state aligned with the URL on back/forward
  // navigation or any other change that doesn't go through goTo().
  useEffect(() => {
    setScreen(screenFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (urlDestId && urlDestId !== destId) setDestId(urlDestId);
  }, [urlDestId]);

  // Load AI visa routes when the Visa screen is active (re-runs if the
  // destination or stay mode changes). Keyed on dest+mode so switching either
  // refreshes the routes. (Placed after dest/mode are defined below.)

  // Updates local state immediately (instant UI) and pushes a real URL so
  // the browser back/forward button and bookmarking work.
  function goTo(next: Screen, opts?: { destId?: string }) {
    const nextDestId = opts?.destId ?? destId ?? "";
    if (opts?.destId) setDestId(opts.destId);
    setScreen(next);
    router.push(buildMovePath(next, nextDestId));
  }

  const mode: Mode = SPECTRUM[stayIdx].mode;
  const cur = SPECTRUM[stayIdx];
  const modeInfo = MODE_LABEL[mode];

  const ranked = useMemo(
    () => [...destinations].sort((a, b) => b.match[mode] - a.match[mode]),
    [destinations, mode],
  );
  const dest = useMemo(
    () => destinations.find((d) => d.id === destId) ?? ranked[0],
    [destId, ranked, destinations],
  );

  // Load AI visa routes when the Visa screen is active (re-runs if the
  // destination or stay mode changes).
  useEffect(() => {
    if (screen !== "visa" || !dest?.id) return;
    if (visaRoutesFor === `${dest.id}:${mode}` && !visaRoutesLoading) return;
    void runVisaOptions(dest.id, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, dest?.id, mode]);

  // Load appointment guidance when the Appointments screen is active.
  useEffect(() => {
    if (screen !== "appointments" || !dest?.id) return;
    if (apptFor === `${dest.id}:${mode}` && !apptLoading) return;
    void runAppointments(dest.id, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, dest?.id, mode]);

  // Load the signed-in user's booking history when the Bookings hub is active.
  useEffect(() => {
    if (screen !== "book" || !signedIn) return;
    let mounted = true;
    setBookingHistoryLoading(true);
    fetchBookings()
      .then((rows) => { if (mounted) setBookingHistory(rows); })
      .catch(() => { if (mounted) setBookingHistory([]); })
      .finally(() => { if (mounted) setBookingHistoryLoading(false); });
    return () => { mounted = false; };
  }, [screen, signedIn]);

  // The mood search, when used, overrides the static match-score ordering.
  const moodList = useMemo(() => {
    if (!moodRanking) return null;
    const found = moodRanking.map((id) => destinations.find((d) => d.id === id)).filter((d): d is typeof destinations[number] => !!d);
    return found.length ? found : null;
  }, [moodRanking, destinations]);
  const browseList = moodList ?? ranked;

  const tripOptions = useMemo(() => trips[dest.id] ?? [], [dest.id, trips]);
  const stayOptions = useMemo(
    () => (stays[dest.id] ?? []).filter((stay) => stay.forModes.includes(mode)),
    [dest.id, mode, stays],
  );
  const visaOptions = useMemo(() => visaServices[mode] ?? [], [mode, visaServices]);
  const schoolOptions = useMemo(() => schools[dest.id] ?? [], [dest.id, schools]);
  const jobOptions = useMemo(() => jobs[dest.id] ?? [], [dest.id, jobs]);

  function answer(opt: string) {
    const q = QUESTIONS[qIndex];
    const next = { ...answers, [q.id]: opt };
    if (qIndex >= QUESTIONS.length - 1) {
      setAnswers(next);
      setMoodRanking(null);
      setMoodNote(null);
      goTo("matches", { destId: ranked[0].id });
    } else {
      setAnswers(next);
      setQIndex(qIndex + 1);
    }
  }

  function toggleItem(key: string) {
    const wasDone = !!done[key];
    setDone((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key];
      else n[key] = true;
      return n;
    });
    if (!signedIn) return;
    const taskId = taskIdByKey[key];
    if (!taskId) return;
    void updateTaskStatus(taskId, wasDone ? "todo" : "done").catch(() => {
      setDone((prev) => {
        const n = { ...prev };
        if (wasDone) n[key] = true;
        else delete n[key];
        return n;
      });
    });
  }

  // ── Mood search ────────────────────────────────────────────────────────
  function toggleMoodChip(phrase: string) {
    setMoodText((prev) => {
      const parts = prev.split(",").map((p) => p.trim()).filter(Boolean);
      const idx = parts.findIndex((p) => p.toLowerCase() === phrase.toLowerCase());
      if (idx >= 0) {
        parts.splice(idx, 1);
      } else {
        parts.push(phrase);
      }
      return parts.join(", ");
    });
  }

  async function runMoodSearch(overrideText?: string) {
    const text = (overrideText ?? moodText).trim();
    if (!text || moodLoading) return;
    setMoodLoading(true);
    setMoodError(null);
    try {
      const res = await fetch("/api/move/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: text, mode }),
      });
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { ranking?: unknown; note?: unknown };
      const ids = Array.isArray(data.ranking)
        ? data.ranking.filter((id): id is string => typeof id === "string" && destinations.some((d) => d.id === id))
        : [];
      let resolvedId: string;
      if (ids.length) {
        setMoodRanking(ids);
        resolvedId = ids[0];
      } else {
        setMoodRanking(null);
        resolvedId = ranked[0].id;
      }
      setMoodNote(typeof data.note === "string" ? data.note : null);
      setMoodLoading(false);
      goTo("matches", { destId: resolvedId });
    } catch {
      setMoodError("Couldn't reach the matcher — showing standard matches instead.");
      setMoodRanking(null);
      setMoodNote(null);
      setMoodLoading(false);
      goTo("matches", { destId: ranked[0].id });
    }
  }

  function applyFilters() {
    const text = QUESTIONS.map((q) => answers[q.id]).filter(Boolean).join(", ");
    if (!text) return;
    setMoodText(text);
    void runMoodSearch(text);
  }

  function clearFilters() {
    setAnswers({});
    setMoodRanking(null);
    setMoodNote(null);
    setMoodText("");
    setDestId(ranked[0].id);
  }

  async function runClarify(overrideText?: string) {
    const text = (overrideText ?? clarifyQuestion).trim();
    if (!text || clarifyLoading) return;
    if (overrideText) setClarifyQuestion(overrideText);
    setClarifyLoading(true);
    setClarifyError(null);
    try {
      const res = await fetch("/api/move/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: dest.id, mode, question: text }),
      });
      if (!res.ok) throw new Error("clarify failed");
      const data = (await res.json()) as { answer?: unknown };
      setClarifyAnswer(typeof data.answer === "string" ? data.answer : null);
    } catch {
      setClarifyError("Couldn't reach the assistant — try again in a moment.");
    } finally {
      setClarifyLoading(false);
    }
  }

  async function runAssess() {
    if (eligLoading) return;
    setEligLoading(true);
    setEligError(null);
    setEligChecklist(null);
    setEligChecklistFor(null);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eligProfile,
          age: Number(eligProfile.age) || 28,
          experience: Number(eligProfile.experience) || 0,
        }),
      });
      if (!res.ok) throw new Error("assess failed");
      const data = (await res.json()) as EligResult;
      setEligResult({
        matches: Array.isArray(data.matches) ? data.matches : [],
        summary: typeof data.summary === "string" ? data.summary : "",
        nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
      });
      setEligStep(ELIG_STEPS);
    } catch {
      setEligError("Couldn't run your assessment — try again in a moment.");
    } finally {
      setEligLoading(false);
    }
  }

  async function runChecklist(match: EligMatch) {
    if (eligChecklistLoading) return;
    setEligChecklistLoading(true);
    setEligChecklistFor(match.destinationId ?? match.city);
    setEligChecklist(null);
    try {
      const res = await fetch("/api/visa/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: match.destinationId,
          mode: goalToMode(eligProfile.goals),
          profile: {
            goals: eligProfile.goals,
            education: eligProfile.education,
            english: eligProfile.english,
            nationality: eligProfile.nationality,
            family: eligProfile.family,
          },
        }),
      });
      if (!res.ok) throw new Error("checklist failed");
      const data = (await res.json()) as { items?: ChecklistItem[] };
      setEligChecklist(Array.isArray(data.items) ? data.items : []);
    } catch {
      setEligError("Couldn't build your checklist — try again in a moment.");
      setEligChecklistFor(null);
    } finally {
      setEligChecklistLoading(false);
    }
  }

  async function runVisaOptions(destinationId: string, forMode: Mode) {
    setVisaRoutesLoading(true);
    setVisaRoutesFor(`${destinationId}:${forMode}`);
    setVisaRoutes([]);
    setSelectedVisaRoute(null);
    try {
      const res = await fetch("/api/visa/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          mode: forMode,
          profile: {
            goals: eligProfile.goals,
            education: eligProfile.education,
            english: eligProfile.english,
            nationality: eligProfile.nationality,
            experience: Number(eligProfile.experience) || undefined,
          },
        }),
      });
      if (!res.ok) throw new Error("options failed");
      const data = (await res.json()) as { options?: VisaOption[]; source?: string };
      setVisaRoutes(Array.isArray(data.options) ? data.options : []);
      setVisaRoutesAi(data.source === "ai");
    } catch {
      setVisaRoutes([]);
    } finally {
      setVisaRoutesLoading(false);
    }
  }

  async function runAppointments(destinationId: string, forMode: Mode) {
    setApptLoading(true);
    setApptFor(`${destinationId}:${forMode}`);
    setApptGuide(null);
    try {
      const res = await fetch("/api/visa/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          mode: forMode,
          profile: { goals: eligProfile.goals, nationality: eligProfile.nationality },
        }),
      });
      if (!res.ok) throw new Error("appointments failed");
      const data = (await res.json()) as AppointmentsGuide;
      setApptGuide(data);
    } catch {
      setApptGuide(null);
    } finally {
      setApptLoading(false);
    }
  }

  async function uploadDocument(file: File, label: string) {
    if (!signedIn) {
      router.push("/auth?redirect=/move");
      return;
    }
    setUploadError(null);
    setUploadingDoc(label);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("destId", dest?.id ?? "general");
      fd.append("label", label);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; key?: string; label?: string; error?: string };
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed — try again.");
        return;
      }
      if (data.url && data.key) {
        setUploadedDocs((prev) => [{ label: data.label ?? label, url: data.url!, key: data.key! }, ...prev]);
      }
    } catch {
      setUploadError("Couldn't reach storage — try again in a moment.");
    } finally {
      setUploadingDoc(null);
    }
  }

  async function saveMyPlan() {
    if (!signedIn) {
      router.push("/auth?redirect=/move");
      return;
    }
    if (saveState === "saving") return;
    setSaveState("saving");
    try {
      await savePlan({
        planName: `${dest.city} move`,
        destinationCity: dest.city,
        destinationCountry: dest.country,
        moveReason: modeInfo.name,
        workMode: workModeFromAnswer(answers.work),
        status: "planning",
      });
      const { tasks: existingTasks } = await fetchWorkspace();
      const existingKeys = new Set(
        existingTasks
          .map((t) => parseMoveTaskNote(t.notes))
          .filter((k): k is string => !!k),
      );
      const idMap: Record<string, string> = { ...taskIdByKey };
      for (const t of existingTasks) {
        const key = parseMoveTaskNote(t.notes);
        if (key) idMap[key] = t.id;
      }
      for (let pi = 0; pi < plan.phases.length; pi++) {
        const ph = plan.phases[pi];
        for (let ii = 0; ii < ph.items.length; ii++) {
          const title = ph.items[ii];
          const key = `${mode}:${pi}:${ii}`;
          if (existingKeys.has(key)) continue;
          try {
            const task = await addTask({
              title,
              category: categoryForItem(title),
              notes: moveTaskNote(key),
            });
            idMap[key] = task.id;
          } catch {
            /* keep going — a failed task shouldn't abort the save */
          }
        }
      }
      setTaskIdByKey(idMap);
      setSaveState("saved");
      goTo("plan");
    } catch {
      setSaveState("idle");
    }
  }

  // ── Booking flow ──────────────────────────────────────────────────────
  function openBooking(p: PendingBooking) {
    setBookStart("");
    setBookEnd("");
    setBookGuests(1);
    setPending(p);
  }

  async function confirmBooking() {
    if (!pending) return;
    if (!signedIn) {
      router.push("/auth?redirect=/move");
      return;
    }
    if (bookState === "saving") return;
    setBookState("saving");
    try {
      const booking = await createBooking({
        bookingType: pending.type,
        destinationCity: dest.city,
        destinationCountry: dest.country,
        itemTitle: pending.title,
        provider: pending.provider,
        priceLabel: pending.price,
        startDate: pending.needsDates ? bookStart || null : null,
        endDate: pending.needsRange ? bookEnd || null : null,
        guests: pending.needsGuests ? bookGuests : 1,
      });
      setLastBooking(booking);
      setPending(null);
      goTo("booked");
    } catch {
      // Leave the sheet open so the user can retry.
    } finally {
      setBookState("idle");
    }
  }

  const bookTypeLabel: Record<BookingType, string> = {
    trip: "Trip",
    stay: "Stay",
    visa: "Visa service",
    school: "School admission",
    job: "Job application",
  };

  const isApplyType = (t: BookingType) => t === "school" || t === "job";

  // ── Move Meter math (driven by ticked plan items) ─────────────────────
  const plan = PLAN[mode];
  const executionCore = useMemo(
    () =>
      buildTravelExecutionCore({
        destination: dest,
        mode,
        answers,
        plan,
        trips: tripOptions,
        stays: stayOptions,
        visaServices: visaOptions,
        schools: schoolOptions,
        jobs: jobOptions,
      }),
    [answers, dest, jobOptions, mode, plan, schoolOptions, stayOptions, tripOptions, visaOptions],
  );
  const allKeys: string[] = [];
  plan.phases.forEach((ph, pi) => ph.items.forEach((_, ii) => allKeys.push(`${mode}:${pi}:${ii}`)));
  const doneCount = allKeys.filter((k) => done[k]).length;
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;
  const meterMsg = pct === 0 ? "Let's get you started." : pct < 100 ? "You're on your way." : "All set — you're ready to go!";

  // Nav (tab bar / sidebar) is always visible inside the move app — only the
  // destination-context block within it is suppressed during onboarding,
  // where there's no chosen destination yet (see isFlowScreen below).
  const showNav = true;
  const isFlowScreen = ["welcome", "spectrum", "search"].includes(screen);

  // As soon as the user has moved past the welcome screen once, remember
  // their stay length & destination so the next visit can skip straight
  // back to Explore instead of re-showing the welcome/spectrum forms —
  // even if they didn't make it all the way to a destination match.
  useEffect(() => {
    if (!ready || screen === "welcome") return;
    saveFlowState({ stayIdx, destId: dest.id, completed: true });
  }, [ready, screen, stayIdx, dest.id]);

  // Hydrate Move Meter checklist from relocation tasks when signed in.
  useEffect(() => {
    if (!signedIn || !catalogLoaded) return;
    let cancelled = false;
    fetchWorkspace()
      .then(({ tasks }) => {
        if (cancelled) return;
        const idMap: Record<string, string> = {};
        const doneMap: Record<string, boolean> = {};
        for (const t of tasks) {
          const key = parseMoveTaskNote(t.notes);
          if (!key || !key.startsWith(`${mode}:`)) continue;
          idMap[key] = t.id;
          if (t.status === "done") doneMap[key] = true;
        }
        setTaskIdByKey(idMap);
        setDone((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(next)) {
            if (k.startsWith(`${mode}:`)) delete next[k];
          }
          return { ...next, ...doneMap };
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn, mode, catalogLoaded]);

  // Settle tab content from DB (static data.ts fallback when unseeded).
  useEffect(() => {
    let cancelled = false;
    fetchGuideByCitySlug(dest.id)
      .then((guide) => {
        if (cancelled) return;
        setSettleCards(settleCardsForCity(dest.id, guide?.settleCards));
        setSettleCommunity(
          guide?.communityTip
            || guide?.settleCards?.find((c) => c.tag.toLowerCase() === "community")?.body
            || "",
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSettleCards(settleCardsForCity(dest.id, null));
          setSettleCommunity("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dest.id]);

  // Clear any previous Clarify-with-AI answer when the destination or
  // timeframe changes, since the answer is grounded in that specific pair.
  useEffect(() => {
    setClarifyQuestion("");
    setClarifyAnswer(null);
    setClarifyError(null);
  }, [dest.id, mode]);

  // ───────────────────────────────── Screens ──────────────────────────────
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

  function Welcome() {
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--welcome">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: PRIMARY, fontWeight: 500 }}>
          EasyMoveZone
        </div>
        <div style={{ marginTop: 56 }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textWrap: "balance" } as CSSProperties}>
            Your move,<br />
            <span style={{ color: PRIMARY }}>made easy.</span>
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 320 }}>
            See the visas you qualify for and your exact document checklist — in minutes, no consultant. Then sort movement and accommodation in one app.
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
            <span style={{ fontFamily: MONO, fontSize: 10, color: PRIMARY, letterSpacing: ".1em" }}>THERE</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => goTo("spectrum")}
          style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
        >
          Get started
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: MUTE, margin: "16px 0 0" }}>Takes about a minute · no account needed</p>
        </div>
        <FlowAside
          title="Movement. Accommodation. Visa."
          text="Three problems, one app. Book how you get there, where you sleep, and how you get in — from a two-week trip to a full relocation."
          steps={[
            { n: 1, text: "Movement — flights and routes to your destination" },
            { n: 2, text: "Accommodation — hotels, flats and coliving for your stay" },
            { n: 3, text: "Visa — the right entry route, matched to your timeline" },
          ]}
        />
      </div>
    );
  }

  function Spectrum() {
    const fillPct = `${(stayIdx / (SPECTRUM.length - 1)) * 100}%`;
    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--step">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Step 1 · The Move Spectrum</div>
        <h2 style={{ fontSize: 27, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "14px 0 0" }}>How long are you thinking of staying?</h2>
        <p style={{ fontSize: 15, color: "#5f655c", margin: "12px 0 0" }}>Everything downstream adapts to this — and you can change it any time.</p>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-.02em", color: INK }}>{cur.label}</div>
          <div style={{ fontSize: 15, color: "#6e746b", marginTop: 4 }}>{cur.sub}</div>
        </div>

        <div style={{ marginTop: 44, position: "relative", padding: "0 6px" }}>
          <div style={{ position: "absolute", left: 6, right: 6, top: 9, height: 3, background: "#d8d8d0", borderRadius: 999 }} />
          <div style={{ position: "absolute", left: 6, top: 9, height: 3, background: PRIMARY, borderRadius: 999, width: fillPct, transition: "width .3s ease" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {SPECTRUM.map((st, i) => {
              const active = i === stayIdx;
              return (
                <div key={st.key} onClick={() => setStayIdx(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", width: 56 }}>
                  <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: active ? 20 : 12, height: active ? 20 : 12, borderRadius: 999, background: active ? PRIMARY : "#cfd4cc", border: active ? "4px solid #fbe0d2" : "none", boxShadow: active ? "0 2px 8px rgba(224,81,31,.42)" : "none", transition: "all .25s" }} />
                  </div>
                  <div style={{ fontSize: 10.5, marginTop: 9, fontWeight: active ? 700 : 500, color: active ? INK : MUTE, transition: "all .2s", whiteSpace: "nowrap", fontFamily: HANKEN }}>{st.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 52, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: PRIMARY }} />
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>You&apos;ll get the {modeInfo.name}</div>
          </div>
          <p style={{ fontSize: 16, color: "#4a5047", margin: "12px 0 0", lineHeight: 1.45 }}>{modeInfo.blurb}</p>
        </div>

        <div style={{ flex: 1 }} />
        <button onClick={() => goTo("matches", { destId: ranked[0].id })} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>Continue</button>
        </div>
        <FlowAside
          title="The Move Spectrum"
          text="Everything downstream — your matches, visa guidance, plan checklist, bookings and settling-in tips — adapts to how long you're staying."
          steps={[
            { n: 1, text: "Trip — a short visit, light on logistics" },
            { n: 2, text: "Nomad — months at a time, remote-ready" },
            { n: 3, text: "Move — a full relocation with phases to follow" },
          ]}
        />
      </div>
    );
  }

  function goBackFromExplore() {
    setExploreMode("mood");
    goTo(exploreReturnScreen);
  }

  function Quiz() {
    const q = QUESTIONS[qIndex];
    return (
      <div className="move-flow-screen move-flow-screen--step">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div onClick={() => setExploreMode("mood")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>← Mood search</div>
          {exploreReturnScreen === "matches" ? (
            <div onClick={goBackFromExplore} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: MUTE, cursor: "pointer" }}>Back to matches</div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".12em", color: PRIMARY, fontWeight: 500 }}>0{qIndex + 1} / 0{QUESTIONS.length}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>Quick questions</span>
        </div>
        <div style={{ marginTop: 12, height: 4, background: "#ddd8cd", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", background: PRIMARY, borderRadius: 999, width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`, transition: "width .35s ease" }} />
        </div>

        <h2 style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "32px 0 0", textWrap: "balance" } as CSSProperties}>{q.q}</h2>
        <p style={{ fontSize: 15, color: "#6e746b", margin: "12px 0 0" }}>{q.hint}</p>

        <div className="move-quiz-options" style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt) => {
            const sel = answers[q.id] === opt;
            return (
              <div key={opt} onClick={() => answer(opt)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 19px", borderRadius: 16, cursor: "pointer", background: sel ? PRIMARY : "#fff", color: sel ? "#fff" : INK, border: `1px solid ${sel ? PRIMARY : "#e4dfd5"}`, boxShadow: sel ? "0 6px 18px rgba(224,81,31,.27)" : "0 1px 2px rgba(0,0,0,.03)", fontSize: 16, fontWeight: 600, transition: "all .15s" }}>
                <span>{opt}</span>
                <span style={{ color: sel ? "#fff" : "#cdd1c9", fontSize: 16, fontWeight: 400 }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // The AI helper: describe the vibe you want in your own words and let the
  // matcher rank destinations for you, instead of clicking through fixed options.
  function MoodSearch() {
    if (exploreMode === "quiz") {
      return (
        <div className="move-flow-inner">
          <Quiz />
          <FlowAside
            title="Quick questions"
            text="Answer a few structured questions and we'll rank destinations that fit how you want to move."
            steps={[
              { n: 1, text: "Tell us about work, budget and priorities" },
              { n: 2, text: "We score cities against your answers" },
              { n: 3, text: "Switch back to mood search any time" },
            ]}
          />
        </div>
      );
    }

    const selectedChips = new Set(moodText.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean));

    return (
      <div className="move-flow-inner">
        <div className="move-flow-screen move-flow-screen--step">
        <div onClick={goBackFromExplore} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>
          ← {exploreReturnScreen === "matches" ? "Back to matches" : "Back"}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY, fontWeight: 500 }}>AI mood search</span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>{cur.label}</span>
        </div>

        <h2 style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "20px 0 0", textWrap: "balance" } as CSSProperties}>What&apos;s the vibe you&apos;re after?</h2>
        <p style={{ fontSize: 15, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Tell us in your own words, like texting a friend who&apos;s already there — we&apos;ll match it to real cities for a <b style={{ color: "#4a5047" }}>{cur.label}</b> stay.</p>

        <textarea
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          placeholder="e.g. somewhere cheap, easy visa, good food, fast wifi, not too touristy…"
          rows={4}
          style={{ marginTop: 22, width: "100%", padding: "16px 17px", borderRadius: 18, border: "1px solid #d8d2c6", background: "#fff", fontFamily: HANKEN, fontSize: 15.5, color: INK, resize: "none", lineHeight: 1.5 }}
        />

        <div className="move-mood-chips" style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOOD_CHIPS.map((phrase) => {
            const sel = selectedChips.has(phrase.toLowerCase());
            return (
              <div key={phrase} onClick={() => toggleMoodChip(phrase)} style={{ padding: "9px 14px", borderRadius: 999, cursor: "pointer", background: sel ? PRIMARY : "#fff", color: sel ? "#fff" : "#4a5047", border: `1px solid ${sel ? PRIMARY : "#e4dfd5"}`, fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
                {phrase}
              </div>
            );
          })}
        </div>

        {moodError && <p style={{ fontSize: 13, color: PRIMARY, margin: "16px 0 0" }}>{moodError}</p>}

        <div style={{ flex: 1 }} />
        <button
          onClick={() => runMoodSearch()}
          disabled={!moodText.trim() || moodLoading}
          style={{ width: "100%", marginTop: 22, padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: !moodText.trim() || moodLoading ? "default" : "pointer", opacity: !moodText.trim() || moodLoading ? 0.6 : 1, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
        >
          {moodLoading ? "Finding your matches…" : "Find my matches →"}
        </button>
        <div onClick={() => { setExploreMode("quiz"); setQIndex(0); }} style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "#6e746b", fontWeight: 600, cursor: "pointer" }}>
          Prefer a few quick questions instead? →
        </div>
        </div>
        <FlowAside
          title="Describe your vibe"
          text="Tell us what you're after in plain language — cheap, good food, fast wifi, easy visa — and we'll rank real cities for your stay length."
          steps={[
            { n: 1, text: "Type freely or tap mood chips to build your brief" },
            { n: 2, text: "AI matches cities to your vibe and timeframe" },
            { n: 3, text: "Or switch to quick questions if you prefer structure" },
          ]}
        />
      </div>
    );
  }

  function FilterPanel() {
    const answeredCount = Object.keys(answers).length;
    return (
      <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, overflow: "hidden" }}>
        <div onClick={() => setFiltersOpen((p) => !p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: PRIMARY, fontWeight: 600 }}>Advanced filters</span>
            {answeredCount > 0 && (
              <span style={{ background: "#fbeae0", color: PRIMARY, borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700, fontFamily: MONO }}>{answeredCount}</span>
            )}
          </div>
          <span style={{ fontSize: 13, color: MUTE }}>{filtersOpen ? "Hide ▴" : "Show ▾"}</span>
        </div>
        {filtersOpen && (
          <div style={{ padding: "0 18px 20px", borderTop: "1px solid #efe9dd" }}>
            <p style={{ fontSize: 13, color: "#6e746b", margin: "16px 0 0", lineHeight: 1.5 }}>Answer a few quick questions and we’ll re-order every destination below to put your best fit first.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 16 }}>
              {QUESTIONS.map((q) => (
                <div key={q.id}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{q.q}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 9 }}>
                    {q.options.map((opt) => {
                      const sel = answers[q.id] === opt;
                      return (
                        <div key={opt} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))} style={{ padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: sel ? PRIMARY : "#f7f5ee", color: sel ? "#fff" : "#4a5047", border: `1px solid ${sel ? PRIMARY : "#e4dfd5"}`, fontSize: 12.5, fontWeight: 600, transition: "all .15s" }}>{opt}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={applyFilters} disabled={answeredCount === 0 || moodLoading} style={{ flex: 1, padding: 13, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: answeredCount === 0 || moodLoading ? "default" : "pointer", opacity: answeredCount === 0 || moodLoading ? 0.6 : 1 }}>
                {moodLoading ? "Matching…" : "Apply filters"}
              </button>
              {answeredCount > 0 && (
                <button onClick={clearFilters} style={{ padding: "13px 16px", border: "1px solid #d8d2c6", borderRadius: 14, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Clear</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function Matches() {
    const C22 = 2 * Math.PI * 22;
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Explore · your matches</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{moodList ? "Matched to your answers" : "Every place that fits how you want to move"}</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <div onClick={() => goTo("spectrum")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{cur.label} · {modeInfo.name}</span>
            <span style={{ fontSize: 12, color: MUTE }}>change ↻</span>
          </div>
          <div onClick={() => { setExploreReturnScreen("matches"); setExploreMode("mood"); goTo("search"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{moodList ? "Refine your mood search" : "Try a mood search"}</span>
            <span style={{ fontSize: 12, color: MUTE }}>{moodList ? "↻" : "→"}</span>
          </div>
        </div>

        <FilterPanel />

        {moodNote && (
          <div style={{ marginTop: 16, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#bf6a3c" }}>Because you said “{moodText}”</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5a4636", margin: "8px 0 0" }}>{moodNote}</p>
          </div>
        )}

        <div className="move-card-grid" style={{ marginTop: 22 }}>
          {browseList.map((d, i) => {
            const ringOffset = (C22 * (1 - d.match[mode] / 100)).toFixed(1);
            const chips = [d.stats[mode][0][1], d.visa[mode].tag];
            return (
              <div key={d.id} onClick={() => goTo("detail", { destId: d.id })} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 22, overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
                <div style={{ height: 152, position: "relative", background: "#ece6da" }}>
                  <DestinationImage src={d.imageUrl} city={d.city} country={d.country} region={d.region} />
                  {i === 0 && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "#bf6a3c", color: "#fff", padding: "6px 11px", borderRadius: 999, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", zIndex: 2 }}>Top match</div>
                  )}
                </div>
                <div style={{ padding: "16px 18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
                      <svg width="50" height="50" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="22" style={{ fill: "none", stroke: "#f7e4d9", strokeWidth: "5px" }} />
                        <circle cx="25" cy="25" r="22" transform="rotate(-90 25 25)" style={{ fill: "none", stroke: PRIMARY, strokeWidth: "5px", strokeLinecap: "round", strokeDasharray: "138.2px", strokeDashoffset: `${ringOffset}px`, transition: "stroke-dashoffset .5s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 800 }}>{d.match[mode]}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", margin: 0 }}>{d.city}</h3>
                      <span style={{ fontSize: 12.5, color: MUTE }}>{d.country} · {d.region}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5f655c", margin: "13px 0 0" }}>{d.honest[mode]}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
                    {chips.map((chip) => (
                      <span key={chip} style={{ background: "#f0ede4", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#4a5047", fontWeight: 600, fontFamily: MONO }}>{chip}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 15, color: PRIMARY, fontSize: 14, fontWeight: 700 }}>See the {modeInfo.name} <span>→</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: "center", fontSize: 12.5, color: "#a8a395", margin: "22px 0 0", lineHeight: 1.5 }}>
          Honest summaries — the good and the catch.<br />Tailored to a <b style={{ color: "#6e746b" }}>{cur.label}</b> stay.
        </p>
      </div>
      </div>
    );
  }

  function Detail() {
    const visa = dest.visa[mode];
    const actionButtons = (
      <>
        <button onClick={() => goTo("intelligence")} style={{ width: "100%", padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>Open Travel Intelligence Core →</button>
        <button onClick={() => goTo("execution")} style={{ width: "100%", marginTop: 10, padding: 16, border: "1px solid #d8d2c6", borderRadius: 18, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Open Travel Execution Core</button>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={() => goTo("visa")} style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Visa details</button>
          <button onClick={() => goTo("book")} style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Book now</button>
        </div>
      </>
    );
    return (
      <div className="move-page-inner">
      <div className="move-page-screen" style={{ paddingBottom: 28 }}>
        <div className="move-detail-layout">
        <div>
        <div className="move-detail-hero" style={{ position: "relative", background: "#e2dccd", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22 }}>
          <DestinationImage src={dest.imageUrl} city={dest.city} country={dest.country} region={dest.region} />
          <div onClick={() => goTo("matches")} style={{ position: "absolute", top: 64, left: 18, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,.86)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 19, boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 2 }}>←</div>
          <div style={{ position: "absolute", top: 66, right: 18, background: "rgba(27,35,30,.82)", color: "#fff", padding: "7px 13px", borderRadius: 999, fontFamily: MONO, fontSize: 12, backdropFilter: "blur(4px)", zIndex: 2 }}>{dest.match[mode]}% match</div>
        </div>

        <div className="move-detail-body">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>{dest.city}</h2>
            <span style={{ fontSize: 14, color: MUTE }}>{dest.country} · {dest.region}</span>
          </div>

          <div style={{ marginTop: 18, background: "#f6e9df", borderRadius: 18, padding: "18px 18px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#bf6a3c", fontWeight: 500 }}>The honest take</div>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: "#5a4636", margin: "10px 0 0" }}>{dest.honest[mode]}</p>
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {dest.stats[mode].map(([k, val]) => (
              <div key={k} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "14px 12px" }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 11, color: MUTE, marginTop: 6, lineHeight: 1.25 }}>{k}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: INK, borderRadius: 22, padding: 22, color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#f3aa79" }}>Visa Snapshot</div>
              <div style={{ background: "rgba(243,170,121,.2)", color: "#f8caa6", padding: "5px 11px", borderRadius: 999, fontFamily: MONO, fontSize: 11 }}>{visa.tag}</div>
            </div>
            <h3 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.01em", margin: "16px 0 0" }}>{visa.headline}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#c9cdc7", margin: "10px 0 0" }}>{visa.body}</p>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 12.5, color: "#8a918a" }}>
              Matched to your <b style={{ color: "#f8caa6" }}>{cur.label}</b> stay · {modeInfo.name}
            </div>
          </div>

          <div className="move-detail-actions-mobile" style={{ marginTop: 22 }}>
            {actionButtons}
          </div>
        </div>
        </div>

        <div className="move-detail-sidebar">
          {actionButtons}
        </div>
        </div>
      </div>
      </div>
    );
  }

  // Shown at the top of every destination-driven screen so it's obvious
  // which city is steering the Plan, Visa, Settle & Book content below —
  // and gives a one-tap way to change it from anywhere.
  function DestSwitcher() {
    return (
      <div onClick={() => setDestSwitchOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <span style={{ fontSize: 13 }}>📍</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".06em" }}>{dest.city}, {dest.country}</span>
        <span style={{ fontSize: 12, color: MUTE }}>switch ↻</span>
      </div>
    );
  }

  // A colored, iconed section label — replaces the old plain mono-uppercase-gray
  // line that made every section of every screen look identical.
  function SectionLabel({ title, core, icon: Icon }: { title: string; core?: keyof typeof CORE_THEME; icon?: ComponentType<{ size?: number; strokeWidth?: number; style?: CSSProperties }> }) {
    const theme = core ? CORE_THEME[core] : null;
    const color = theme?.color ?? PRIMARY;
    const IconComp = Icon ?? BadgeCheck;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 26, marginBottom: 4 }}>
        <IconComp size={17} strokeWidth={2.4} style={{ color }} />
        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color, fontWeight: 700 }}>{title}</div>
      </div>
    );
  }

  function ModuleHeader({ eyebrow, title, sub, core }: { eyebrow: string; title: string; sub: string; core?: keyof typeof CORE_THEME }) {
    const theme = core ? CORE_THEME[core] : null;
    const Icon = theme?.icon ?? Sparkles;
    const color = theme?.color ?? PRIMARY;
    return (
      <>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 999, background: theme?.soft ?? "#fbeae0", border: `1px solid ${theme?.softBorder ?? "#f3d6c4"}` }}>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={13} strokeWidth={2.4} style={{ color: "#fff" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color, fontWeight: 600 }}>{eyebrow}</span>
        </div>
        <h2 style={{ fontSize: 34, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.02em", margin: "18px 0 0" }}>{title}</h2>
        <div style={{ width: 50, height: 4, borderRadius: 999, background: color, margin: "14px 0 0" }} />
        <p style={{ fontSize: 17, color: "#4a5047", margin: "14px 0 0", lineHeight: 1.6, maxWidth: 580 }}>{sub}</p>
        <DestSwitcher />
      </>
    );
  }

  function PersonaSection({ matches }: { matches: PersonaMatch[] }) {
    const lead = matches[0];
    return (
      <div style={{ marginTop: 20, background: `linear-gradient(155deg, ${INK}, #26302a)`, borderRadius: 22, padding: 22, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={14} strokeWidth={2.4} style={{ color: "#f3aa79" }} />
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#f3aa79", fontWeight: 600 }}>Persona engine</div>
        </div>
        <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.01em", margin: "14px 0 0" }}>{lead.persona}</h3>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#c9cdc7", margin: "10px 0 0" }}>{lead.reason}</p>
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {matches.map((match) => (
            <div key={match.persona} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{match.persona}</div>
                <div style={{ fontSize: 13, color: "#9aa79f", marginTop: 2 }}>{match.reason}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: "#f8caa6" }}>{match.score}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function openIntegration(action: IntegrationAction) {
    switch (action.target) {
      case "trips":
        goTo("trips");
        return;
      case "stays":
        goTo("stays");
        return;
      case "visaBook":
        goTo("visaBook");
        return;
      case "plan":
        goTo("plan");
        return;
      case "school":
      case "job":
        goTo("visa");
        return;
    }
  }

  const INTELLIGENCE_STARTER_QUESTIONS = [
    "Can I travel there right now?",
    "Should I actually go, or are there trade-offs?",
    "What visa or compliance rules should I know?",
    "What should I prepare before I leave?",
    "Are there better-fitting alternatives?",
    "What's it like on the ground there today?",
  ];

  function Intelligence() {
    const tabs: TabDef[] = [
      { id: "eligibility", label: "Eligibility checker", icon: ClipboardCheck, content: <EligibilityPanel /> },
      { id: "ask-ai", label: "Ask AI", icon: Sparkles, content: <ClarifyPanel starterQuestions={INTELLIGENCE_STARTER_QUESTIONS} /> },
    ];
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <ModuleHeader
            core="intelligence"
            eyebrow="Travel Intelligence Core"
            title={`${dest.city}, decided properly`}
            sub="Check what visas you qualify for, then ask AI anything else that's still unclear."
          />

          <TabGroup core="intelligence" tabs={tabs} />

          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            <button onClick={() => goTo("visa")} style={{ flex: 1, minWidth: 160, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Open visa details</button>
            <button onClick={() => goTo("documents")} style={{ flex: 1, minWidth: 160, padding: 16, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15.5, fontWeight: 600, cursor: "pointer" }}>My documents</button>
            <button onClick={() => goTo("settle")} style={{ flex: 1, minWidth: 160, padding: 16, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15.5, fontWeight: 600, cursor: "pointer" }}>Settling in</button>
          </div>
        </div>
      </div>
    );
  }

  function Execution() {
    const tabs: TabDef[] = [
      { id: "persona", label: "Persona match", icon: Users, content: <PersonaSection matches={executionCore.personaMatches} /> },
      {
        id: "strategy",
        label: "Strategy",
        icon: ListChecks,
        content: (
          <div style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
            <SectionLabel title="Persona-based strategy" core="execution" icon={Users} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              {executionCore.strategy.map((line) => (
                <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <CheckCircle2 size={17} strokeWidth={2.2} style={{ color: CORE_THEME.execution.color, marginTop: 1, flexShrink: 0, opacity: 0.85 }} />
                  <div style={{ fontSize: 15.5, lineHeight: 1.6, color: "#3f453c" }}>{line}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        label: "Book & actions",
        icon: Rocket,
        content: (
          <div>
            <SectionLabel title="Booking and action integrations" core="execution" icon={Rocket} />
            <div className="move-point-grid" style={{ marginTop: 14 }}>
              {executionCore.actions.map((action) => (
                <div key={action.title} onClick={() => openIntegration(action)} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "17px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{action.title}</div>
                    <div style={{ fontSize: 13.5, color: "#6e746b", marginTop: 4 }}>{action.detail}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CORE_THEME.execution.color, whiteSpace: "nowrap" }}>{action.countLabel}</div>
                    <div style={{ fontSize: 12, color: MUTE, marginTop: 3 }}>Open →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ];
    return (
      <div className="move-page-inner">
        <div className="move-page-screen">
          <ModuleHeader
            core="execution"
            eyebrow="Travel Execution Core"
            title={`Get ${dest.city} ready-to-go`}
            sub="Your readiness checklist, persona-led strategy, and action routes into booking, planning, and applications."
          />

          <TabGroup core="execution" tabs={tabs} />

          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <button onClick={() => goTo("plan")} style={{ flex: 1, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Open my plan</button>
            <button onClick={() => goTo("book")} style={{ flex: 1, padding: 16, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15.5, fontWeight: 600, cursor: "pointer" }}>Open bookings</button>
          </div>
        </div>
      </div>
    );
  }

  function Plan() {
    const CIRC = 2 * Math.PI * 40;
    const ringOffset = (CIRC * (1 - pct / 100)).toFixed(1);
    const planHeadline = mode === "move" ? "Your move, in clear phases" : "Everything to sort, in order";
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Your {plan.name}</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{planHeadline}</h2>
        <p style={{ fontSize: 14, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{plan.intro}</p>
        <DestSwitcher />

        <div style={{ marginTop: 20, background: INK, borderRadius: 22, padding: 22, color: "#fff", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" style={{ fill: "none", stroke: "rgba(255,255,255,.14)", strokeWidth: "9px" }} />
              <circle cx="48" cy="48" r="40" transform="rotate(-90 48 48)" style={{ fill: "none", stroke: "#f3aa79", strokeWidth: "9px", strokeLinecap: "round", strokeDasharray: "251.3px", strokeDashoffset: `${ringOffset}px`, transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{pct}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#f3aa79" }}>Move Meter</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>{meterMsg}</div>
            <div style={{ fontSize: 13, color: "#9aa79f", marginTop: 4 }}>{doneCount} of {allKeys.length} done</div>
          </div>
        </div>

        <div className="move-plan-phases" style={{ marginTop: 22 }}>
          {plan.phases.map((ph, pi) => {
            let locked = false;
            if (plan.kind === "phased" && pi > 0) {
              locked = !plan.phases[pi - 1].items.every((_, ii) => done[`${mode}:${pi - 1}:${ii}`]);
            }
            const phaseDone = ph.items.every((_, ii) => done[`${mode}:${pi}:${ii}`]);
            return (
              <div key={pi} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)", opacity: locked ? 0.66 : 1, transition: "opacity .25s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, fontFamily: MONO, background: locked ? "#e8e3d8" : phaseDone ? PRIMARY : "#fbeae0", color: locked ? "#b0a89a" : phaseDone ? "#fff" : PRIMARY }}>
                    {plan.kind === "phased" ? String(pi + 1) : "✓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{ph.title}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE, marginTop: 2 }}>{ph.when || "Checklist"}</div>
                  </div>
                  {locked && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#b0a89a" }}>locked</span>}
                </div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                  {ph.items.map((label, ii) => {
                    const key = `${mode}:${pi}:${ii}`;
                    const isDone = !!done[key];
                    return (
                      <div key={ii} onClick={() => { if (!locked) toggleItem(key); }} style={{ display: "flex", alignItems: "center", gap: 12, cursor: locked ? "default" : "pointer" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: isDone ? PRIMARY : "#fff", border: `1.5px solid ${isDone ? PRIMARY : "#cfd4cc"}`, transition: "all .15s" }}>{isDone ? "✓" : ""}</div>
                        <span style={{ fontSize: 14.5, lineHeight: 1.35, color: isDone ? "#a3a89f" : "#3a4038", textDecoration: isDone ? "line-through" : "none" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                {locked && <div style={{ marginTop: 12, fontSize: 12.5, color: "#a8a395", lineHeight: 1.4 }}>Unlocks when you finish “{plan.phases[pi - 1].title}”.</div>}
              </div>
            );
          })}
        </div>

        <button onClick={saveMyPlan} disabled={saveState === "saving"} style={{ width: "100%", marginTop: 18, padding: 16, border: "none", borderRadius: 16, background: INK, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: saveState === "saving" ? "default" : "pointer", opacity: saveState === "saving" ? 0.7 : 1 }}>
          {saveState === "saving" ? "Saving…" : signedIn ? "Save my plan to my workspace →" : "Sign in to save my plan →"}
        </button>

        <div onClick={() => setShareOpen(true)} style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, border: "1px dashed #cbc5b8", borderRadius: 16, color: "#6e746b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <span style={{ fontSize: 15 }}>↗</span> Share my Move Meter
        </div>
      </div>
      </div>
    );
  }

  function ClarifyPanel({ starterQuestions }: { starterQuestions?: string[] }) {
    return (
      <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY, fontWeight: 500 }}>Ask AI about {dest.city}</div>
        <p style={{ fontSize: 13, color: "#6e746b", margin: "8px 0 0", lineHeight: 1.5 }}>Grounded in this destination&apos;s visa, settle and healthcare notes — ask whatever&apos;s still unclear.</p>
        {starterQuestions && starterQuestions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {starterQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => runClarify(q)}
                disabled={clarifyLoading}
                style={{ padding: "9px 13px", borderRadius: 999, border: "1px solid #e4dfd5", background: "#fdfcf9", color: "#4a5047", fontFamily: HANKEN, fontSize: 13, fontWeight: 600, cursor: clarifyLoading ? "default" : "pointer", opacity: clarifyLoading ? 0.6 : 1 }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            value={clarifyQuestion}
            onChange={(e) => setClarifyQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runClarify(); }}
            placeholder="e.g. can I bring my dog, what about health insurance…"
            style={{ flex: 1, minWidth: 0, padding: "12px 14px", borderRadius: 14, border: "1px solid #d8d2c6", background: "#fdfcf9", fontFamily: HANKEN, fontSize: 14, color: INK }}
          />
          <button
            onClick={() => runClarify()}
            disabled={!clarifyQuestion.trim() || clarifyLoading}
            style={{ padding: "12px 18px", border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: !clarifyQuestion.trim() || clarifyLoading ? "default" : "pointer", opacity: !clarifyQuestion.trim() || clarifyLoading ? 0.6 : 1, whiteSpace: "nowrap" }}
          >
            {clarifyLoading ? "Asking…" : "Ask →"}
          </button>
        </div>
        {clarifyError && <p style={{ fontSize: 13, color: PRIMARY, margin: "12px 0 0" }}>{clarifyError}</p>}
        {clarifyAnswer && (
          <div style={{ marginTop: 14, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "#5a4636", margin: 0 }}>{clarifyAnswer}</p>
          </div>
        )}
      </div>
    );
  }

  function EligChips({ options, value, onPick }: { options: { id: string; label: string }[]; value: string; onPick: (id: string) => void }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button key={o.id} onClick={() => onPick(o.id)}
              style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${active ? PRIMARY : "#d8d2c6"}`, background: active ? "#f6e9df" : "#fff", color: active ? PRIMARY : INK, fontFamily: HANKEN, fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer" }}>
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  function EligField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{label}</div>
        {children}
      </div>
    );
  }

  function DocUploadButton({ label }: { label: string }) {
    const busy = uploadingDoc === label;
    return (
      <label style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: `1px solid ${busy ? PRIMARY : "#d8d2c6"}`, background: busy ? "#fbeae0" : "#fff", color: busy ? PRIMARY : "#4a5047", fontFamily: HANKEN, fontSize: 12.5, fontWeight: 600, cursor: busy ? "default" : "pointer" }}>
        <Upload size={13} strokeWidth={2.4} />
        {busy ? "Uploading…" : "Upload"}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: "none" }} disabled={busy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadDocument(f, label); e.target.value = ""; }} />
      </label>
    );
  }

  function Documents() {
    const hasChecklist = !!eligChecklist && eligChecklist.length > 0;
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 999, background: "#fbeae0", border: "1px solid #f3d6c4" }}>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={13} strokeWidth={2.4} style={{ color: "#fff" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY, fontWeight: 600 }}>My documents</span>
        </div>
        <h2 style={{ fontSize: 30, lineHeight: 1.14, fontWeight: 800, letterSpacing: "-.02em", margin: "16px 0 0" }}>Your document checklist</h2>
        <p style={{ fontSize: 15.5, color: "#4a5047", margin: "12px 0 0", lineHeight: 1.6 }}>Everything you need for {dest.city}, in one place. Tick items off and upload files to keep them safe.</p>

        {!hasChecklist ? (
          <div style={{ marginTop: 22, background: "#fff", border: "1px dashed #d8d2c6", borderRadius: 20, padding: 24, textAlign: "center" }}>
            <ClipboardCheck size={28} strokeWidth={1.8} style={{ color: MUTE }} />
            <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.55 }}>No checklist yet. Run an eligibility check and pick a visa to generate your tailored document list.</p>
            <button onClick={() => goTo("intelligence")} style={{ marginTop: 16, padding: "13px 20px", border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>Check my eligibility →</button>
          </div>
        ) : (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {eligChecklist!.map((it, k) => {
              const uploaded = uploadedDocs.find((d) => d.label === it.label);
              return (
                <div key={k} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ flexShrink: 0, marginTop: 3, width: 8, height: 8, borderRadius: 999, background: it.urgent ? PRIMARY : "#c9a98f" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{it.label}{it.urgent && <span style={{ fontFamily: MONO, fontSize: 9.5, color: PRIMARY, marginLeft: 8, letterSpacing: ".1em" }}>PRIORITY</span>}</div>
                      <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 3, lineHeight: 1.45 }}>{it.why}</div>
                    </div>
                    {uploaded ? (
                      <a href={uploaded.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: "#e8f3ec", border: "1px solid #b8ddc6", color: "#2f7d4f", fontFamily: HANKEN, fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
                        <CheckCircle2 size={13} strokeWidth={2.6} /> Saved
                      </a>
                    ) : (
                      <DocUploadButton label={it.label} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {uploadError && <p style={{ fontSize: 13, color: PRIMARY, margin: "14px 0 0", lineHeight: 1.5 }}>{uploadError}</p>}

        {uploadedDocs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <SectionLabel title="Saved files" icon={FileText} />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {uploadedDocs.map((d) => (
                <a key={d.key} href={d.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 12, color: INK, textDecoration: "none" }}>
                  <FileText size={15} strokeWidth={2.2} style={{ color: PRIMARY }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>Open →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#a8a395", margin: "22px 0 0", lineHeight: 1.5 }}>Files are stored securely to your workspace.<br />Always keep your own copies of official documents.</p>
      </div>
      </div>
    );
  }

  function EligibilityPanel() {
    const inResults = eligStep >= ELIG_STEPS && !!eligResult;
    const inputStyle: CSSProperties = { marginTop: 8, width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d8d2c6", background: "#fdfcf9", fontFamily: HANKEN, fontSize: 15, color: INK };

    return (
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Eligibility</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>
          {inResults ? "Your visa matches" : "Know where you can go"}
        </h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>
          {inResults ? "Ranked by how well your profile fits. Grounded in real destination data." : "A few quick questions — we'll rank the visas you're most likely to qualify for and build your document checklist."}
        </p>

        {!inResults && (
          <div style={{ marginTop: 22, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20 }}>
            {eligStep === 0 && (
              <>
                <EligField label="What's your goal?">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {ELIG_GOALS.map((g) => {
                      const active = eligProfile.goals.includes(g.id);
                      return (
                        <button key={g.id}
                          onClick={() => setEligProfile((p) => ({ ...p, goals: active ? p.goals.filter((x) => x !== g.id) : [...p.goals, g.id] }))}
                          style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${active ? PRIMARY : "#d8d2c6"}`, background: active ? "#f6e9df" : "#fff", color: active ? PRIMARY : INK, fontFamily: HANKEN, fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer" }}>
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </EligField>
                <EligField label="Your nationality">
                  <input value={eligProfile.nationality} onChange={(e) => setEligProfile((p) => ({ ...p, nationality: e.target.value }))} placeholder="e.g. Nigerian, Indian, Brazilian…" style={inputStyle} />
                </EligField>
                <EligField label="Preferred destination (optional)">
                  <input value={eligProfile.destination === "no-preference" ? "" : eligProfile.destination} onChange={(e) => setEligProfile((p) => ({ ...p, destination: e.target.value || "no-preference" }))} placeholder="A country, city or region — or leave blank" style={inputStyle} />
                </EligField>
              </>
            )}

            {eligStep === 1 && (
              <>
                <EligField label="Highest education">
                  <EligChips options={ELIG_EDU} value={eligProfile.education} onPick={(id) => setEligProfile((p) => ({ ...p, education: id }))} />
                </EligField>
                <EligField label="Your profession / field">
                  <input value={eligProfile.profession} onChange={(e) => setEligProfile((p) => ({ ...p, profession: e.target.value }))} placeholder="e.g. Software engineer, nurse, teacher…" style={inputStyle} />
                </EligField>
                <div style={{ display: "flex", gap: 12 }}>
                  <EligField label="Age">
                    <input type="number" min={16} max={80} value={eligProfile.age} onChange={(e) => setEligProfile((p) => ({ ...p, age: e.target.value }))} placeholder="28" style={inputStyle} />
                  </EligField>
                  <EligField label="Years of experience">
                    <input type="number" min={0} max={50} value={eligProfile.experience} onChange={(e) => setEligProfile((p) => ({ ...p, experience: e.target.value }))} placeholder="3" style={inputStyle} />
                  </EligField>
                </div>
                <EligField label="English proficiency">
                  <EligChips options={ELIG_ENGLISH} value={eligProfile.english} onPick={(id) => setEligProfile((p) => ({ ...p, english: id }))} />
                </EligField>
              </>
            )}

            {eligStep === 2 && (
              <>
                <EligField label="Relocation budget">
                  <EligChips options={ELIG_BUDGET} value={eligProfile.budget} onPick={(id) => setEligProfile((p) => ({ ...p, budget: id }))} />
                </EligField>
                <EligField label="Who's coming?">
                  <EligChips options={ELIG_FAMILY} value={eligProfile.family} onPick={(id) => setEligProfile((p) => ({ ...p, family: id }))} />
                </EligField>
                <EligField label="Your timeline">
                  <EligChips options={ELIG_TIMELINE} value={eligProfile.timeline} onPick={(id) => setEligProfile((p) => ({ ...p, timeline: id }))} />
                </EligField>
              </>
            )}

            {eligError && <p style={{ fontSize: 13, color: PRIMARY, margin: "16px 0 0" }}>{eligError}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {eligStep > 0 && (
                <button onClick={() => setEligStep((s) => s - 1)}
                  style={{ padding: "14px 18px", border: "1px solid #d8d2c6", borderRadius: 14, background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                  Back
                </button>
              )}
              {eligStep < ELIG_STEPS - 1 ? (
                <button onClick={() => setEligStep((s) => s + 1)} disabled={eligStep === 0 && eligProfile.goals.length === 0}
                  style={{ flex: 1, padding: 15, border: "none", borderRadius: 14, background: INK, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: eligStep === 0 && eligProfile.goals.length === 0 ? 0.5 : 1 }}>
                  Continue →
                </button>
              ) : (
                <button onClick={runAssess} disabled={eligLoading}
                  style={{ flex: 1, padding: 15, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: eligLoading ? "default" : "pointer", opacity: eligLoading ? 0.7 : 1, boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>
                  {eligLoading ? "Assessing…" : "See my matches →"}
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
              {Array.from({ length: ELIG_STEPS }).map((_, i) => (
                <div key={i} style={{ width: i === eligStep ? 22 : 7, height: 7, borderRadius: 999, background: i === eligStep ? PRIMARY : "#ddd6ca" }} />
              ))}
            </div>
          </div>
        )}

        {inResults && eligResult && (
          <>
            {eligResult.summary && (
              <div style={{ marginTop: 20, background: INK, borderRadius: 22, padding: 22, color: "#fff" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#f3aa79" }}>Your read</div>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "#e6e3dd", margin: "12px 0 0" }}>{eligResult.summary}</p>
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {eligResult.matches.map((m, i) => (
                <div key={`${m.city}-${i}`} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>{m.visa}</div>
                      <div style={{ fontSize: 13, color: "#6e746b", marginTop: 3 }}>{m.city}, {m.country} · {m.timeline}</div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: PRIMARY, marginTop: 6 }}>{m.costRange}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: m.score >= 70 ? "#2f7d4f" : m.score >= 45 ? "#b9781f" : "#9aa097" }}>{m.score}%</div>
                      <div style={{ fontSize: 10.5, color: MUTE }}>match</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {m.destinationId && (
                      <button onClick={() => goTo("detail", { destId: m.destinationId! })}
                        style={{ padding: "10px 14px", border: "1px solid #d8d2c6", borderRadius: 12, background: "#fff", color: INK, fontFamily: HANKEN, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        View destination →
                      </button>
                    )}
                    <button onClick={async () => { await runChecklist(m); goTo("documents"); }} disabled={eligChecklistLoading && eligChecklistFor === (m.destinationId ?? m.city)}
                      style={{ flex: 1, padding: "10px 14px", border: "none", borderRadius: 12, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (eligChecklistLoading && eligChecklistFor === (m.destinationId ?? m.city)) ? 0.7 : 1 }}>
                      {eligChecklistLoading && eligChecklistFor === (m.destinationId ?? m.city) ? "Building…" : "Get document checklist →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {eligResult.nextSteps.length > 0 && (
              <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE }}>Your next steps</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                  {eligResult.nextSteps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12 }}>
                      <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: "#f6e9df", color: PRIMARY, fontFamily: MONO, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                      <p style={{ fontSize: 14, lineHeight: 1.5, color: INK, margin: 0 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setEligStep(0); setEligResult(null); setEligChecklist(null); setEligChecklistFor(null); }}
              style={{ width: "100%", marginTop: 16, padding: 14, border: "1px solid #d8d2c6", borderRadius: 14, background: "#fff", color: "#6e746b", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              ← Edit my profile
            </button>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#a8a395", margin: "20px 0 0", lineHeight: 1.5 }}>Illustrative guidance for a prototype.<br />Always confirm with an official source before you apply.</p>
      </div>
    );
  }

  function Visa() {
    const visa = dest.visa[mode];
    const others = (["trip", "nomad", "move"] as Mode[]).filter((m) => m !== mode).map((m) => ({
      mode: MODE_LABEL[m].name,
      headline: dest.visa[m].headline,
      tag: dest.visa[m].tag,
    }));
    const hasWorkStudy = schoolOptions.length > 0 || jobOptions.length > 0;
    const tabs: TabDef[] = [
      {
        id: "your-visa",
        label: "Your visa",
        icon: ShieldCheck,
        content: (
          <>
            <div style={{ background: INK, borderRadius: 22, padding: 24, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#f3aa79" }}>{modeInfo.name}</div>
                <div style={{ background: "rgba(243,170,121,.2)", color: "#f8caa6", padding: "6px 12px", borderRadius: 999, fontFamily: MONO, fontSize: 12 }}>{visa.tag}</div>
              </div>
              <h3 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.01em", margin: "18px 0 0" }}>{visa.headline}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "#c9cdc7", margin: "12px 0 0" }}>{visa.body}</p>
            </div>

            <SectionLabel title="Compare stay lengths" icon={Gauge} />
            <div className="move-visa-others" style={{ marginTop: 12 }}>
              {others.map((o) => (
                <div key={o.mode} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".09em", textTransform: "uppercase", color: MUTE }}>{o.mode}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: PRIMARY }}>{o.tag}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 11 }}>{o.headline}</div>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        id: "routes",
        label: "Visa routes",
        icon: BadgeCheck,
        content: (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <SectionLabel title={`Routes into ${dest.country}`} icon={BadgeCheck} />
              {visaRoutesAi && !visaRoutesLoading && visaRoutes.length > 0 && <AiChip />}
            </div>
            <p style={{ fontSize: 14, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.55 }}>The common ways in for a {modeInfo.name.toLowerCase()}. Pick the one that fits — it tailors your document checklist.</p>

            {visaRoutesLoading ? (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <Shimmer height={92} /><Shimmer height={92} /><Shimmer height={92} />
              </div>
            ) : visaRoutes.length === 0 ? (
              <p style={{ fontSize: 13.5, color: MUTE, margin: "16px 0 0" }}>No routes loaded yet.</p>
            ) : (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {visaRoutes.map((r) => {
                  const active = selectedVisaRoute === r.name;
                  return (
                    <button key={r.name} onClick={() => setSelectedVisaRoute(active ? null : r.name)}
                      style={{ textAlign: "left", background: active ? "#fbeae0" : "#fff", border: `1.5px solid ${active ? PRIMARY : "#e4dfd5"}`, borderRadius: 18, padding: 18, cursor: "pointer", boxShadow: active ? "0 4px 16px rgba(224,81,31,.14)" : "0 1px 3px rgba(0,0,0,.04)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: "-.01em", color: INK }}>{r.name}</div>
                          {r.who && <div style={{ fontSize: 13.5, color: "#6e746b", marginTop: 4 }}>{r.who}</div>}
                        </div>
                        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, border: `2px solid ${active ? PRIMARY : "#cbc5b8"}`, background: active ? PRIMARY : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {active && <CheckCircle2 size={14} strokeWidth={3} style={{ color: "#fff" }} />}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>Timeline</div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, marginTop: 2 }}>{r.timeline}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>Est. cost</div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, marginTop: 2 }}>{r.cost}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE, marginBottom: 4 }}>Difficulty</div>
                          <DifficultyMeter value={r.difficulty} />
                        </div>
                      </div>
                      {r.notes && <p style={{ fontSize: 13, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>{r.notes}</p>}
                    </button>
                  );
                })}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={() => goTo("documents")}
                    style={{ flex: 1, padding: 14, border: "none", borderRadius: 14, background: INK, color: "#fff", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                    {selectedVisaRoute ? "Get documents →" : "My documents →"}
                  </button>
                  <button onClick={() => goTo("appointments")}
                    style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 14, background: "#fff", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                    Book appointment →
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      },
      ...(hasWorkStudy
        ? [
            {
              id: "work-study",
              label: "Work & study",
              icon: GraduationCap,
              content: (
                <div>
                  <p style={{ fontSize: 15.5, color: "#5f655c", margin: 0, lineHeight: 1.6 }}>Apply directly to school programmes and visa-sponsoring roles that match your move.</p>

                  {schoolOptions.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 10 }}>School admissions</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {schoolOptions.map((s) => (
                          <PriceRow
                            key={s.id}
                            left={s.institution}
                            sub={`${s.program} · ${s.level} · ${s.tag}`}
                            price={s.price}
                            actionLabel="Apply →"
                            onClick={() => openBooking({ type: "school", title: `${s.institution} — ${s.program}`, provider: s.institution, price: s.price, needsDates: false, needsRange: false, needsGuests: false })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {jobOptions.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 10 }}>Visa-sponsoring jobs</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {jobOptions.map((j) => (
                          <PriceRow
                            key={j.id}
                            left={`${j.company} · ${j.role}`}
                            sub={`${j.industry} · ${j.tag}`}
                            price={j.price}
                            actionLabel="Apply →"
                            onClick={() => openBooking({ type: "job", title: `${j.role} @ ${j.company}`, provider: j.company, price: j.price, needsDates: false, needsRange: false, needsGuests: false })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]
        : []),
      {
        id: "ask-ai",
        label: "Ask AI",
        icon: Sparkles,
        content: (
          <div>
            <ClarifyPanel />
            <p style={{ textAlign: "center", fontSize: 13, color: "#a8a395", margin: "20px 0 0", lineHeight: 1.5 }}>Illustrative guidance for a prototype.<br />Always confirm with an official source before you travel.</p>
          </div>
        ),
      },
    ];
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 999, background: "#fbeae0", border: "1px solid #f3d6c4" }}>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={13} strokeWidth={2.4} style={{ color: "#fff" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY, fontWeight: 600 }}>Visa snapshot</span>
        </div>
        <h2 style={{ fontSize: 34, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.02em", margin: "18px 0 0" }}>{dest.city}, the right visa for you</h2>
        <div style={{ width: 50, height: 4, borderRadius: 999, background: PRIMARY, margin: "14px 0 0" }} />
        <p style={{ fontSize: 17, color: "#4a5047", margin: "14px 0 0", lineHeight: 1.6 }}>Based on a <b style={{ color: "#4a5047" }}>{cur.label}</b> stay. Change your timeframe and this updates instantly.</p>
        <DestSwitcher />

        <button onClick={() => goTo("intelligence")}
          style={{ width: "100%", marginTop: 18, padding: 16, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Check my eligibility →
        </button>

        <TabGroup core="intelligence" tabs={tabs} />
      </div>
      </div>
    );
  }

  function Settle() {
    const lifeStageTags = new Set(["Families & minors", "Students (18–25)", "Working age (26–54)", "Retirees (55+)"]);
    const essentialCards = settleCards.filter((c) => !lifeStageTags.has(c.tag));
    const lifeStageCards = settleCards.filter((c) => lifeStageTags.has(c.tag));
    const tabs: TabDef[] = [
      { id: "essentials", label: "Essentials", icon: Sparkles, content: <SettleCardsGrid cards={essentialCards} variant="move" /> },
      ...(lifeStageCards.length > 0
        ? [{ id: "life-stage", label: "By life stage", icon: Users, content: <SettleCardsGrid cards={lifeStageCards} variant="move" /> }]
        : []),
      {
        id: "ask-ai",
        label: "Ask AI",
        icon: Sparkles,
        content: (
          <div>
            <ClarifyPanel />
            <div style={{ marginTop: 18, background: "#fbeae0", border: "1px solid #f3d6c4", borderRadius: 20, padding: 20, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 999, background: PRIMARY, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 19 }}>+</div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: "#9c3f15" }}>Join the {dest.city} community</div>
                <div style={{ fontSize: 14, color: "#b05a2c", marginTop: 4 }}>
                  {settleCommunity || "Meetups, housing tips and a friendly welcome thread."}
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ];
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 999, background: "#fbeae0", border: "1px solid #f3d6c4" }}>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BadgeCheck size={13} strokeWidth={2.4} style={{ color: "#fff" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY, fontWeight: 600 }}>Settle · {dest.city}</span>
        </div>
        <h2 style={{ fontSize: 34, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.02em", margin: "18px 0 0" }}>Land like you&apos;ve been before</h2>
        <div style={{ width: 50, height: 4, borderRadius: 999, background: PRIMARY, margin: "14px 0 0" }} />
        <p style={{ fontSize: 17, color: "#4a5047", margin: "14px 0 0", lineHeight: 1.6 }}>Expat- and nomad-written essentials, filtered for your <b style={{ color: "#4a5047" }}>{cur.label}</b> stay.</p>
        <DestSwitcher />

        <TabGroup core="awareness" tabs={tabs} />
      </div>
      </div>
    );
  }

  function BookHub() {
    const cards: { type: BookingType; go: Screen; title: string; sub: string; icon: string }[] = [
      { type: "trip", go: "trips", title: "Book your trip", sub: "Flights & overland routes to get you there", icon: "✈" },
      { type: "stay", go: "stays", title: "Find a stay", sub: mode === "trip" ? "Hotels for your visit" : "Furnished flats & coliving", icon: "⌂" },
      { type: "visa", go: "visaBook", title: "Sort your visa", sub: "From a free checklist to full handling", icon: "✓" },
      { type: "visa", go: "appointments", title: "Visa appointments", sub: "Typical waits + jump to the official portal", icon: "◷" },
    ];
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Book · {dest.city}</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Trip, stay &amp; visa — all in one</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Everything you need to actually go, tailored to a <b style={{ color: "#4a5047" }}>{cur.label}</b> stay.</p>
        <DestSwitcher />

        <div className="move-book-grid" style={{ marginTop: 22 }}>
          {cards.map((c) => (
            <div key={c.go} onClick={() => goTo(c.go)} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fbeae0", color: PRIMARY, fontSize: 22 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#6e746b", marginTop: 3 }}>{c.sub}</div>
              </div>
              <span style={{ color: PRIMARY, fontSize: 18 }}>→</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel title="Before you book" icon={ClipboardCheck} />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div onClick={() => goTo("plan")} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "#fbeae0", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}><ClipboardCheck size={18} strokeWidth={2.2} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>My move plan &amp; readiness</div>
                <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 2 }}>Your checklist and readiness score before you commit</div>
              </div>
              <span style={{ color: PRIMARY, fontSize: 16 }}>→</span>
            </div>
            <div onClick={() => goTo("documents")} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "#fbeae0", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={18} strokeWidth={2.2} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>My documents</div>
                <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 2 }}>Your visa document checklist and saved files</div>
              </div>
              <span style={{ color: PRIMARY, fontSize: 16 }}>→</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel title="Your booking history" icon={ClipboardCheck} />
          {!signedIn ? (
            <p style={{ fontSize: 13.5, color: MUTE, margin: "12px 0 0" }}>Sign in to see trips, stays and visa services you&apos;ve booked.</p>
          ) : bookingHistoryLoading ? (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <Shimmer height={64} /><Shimmer height={64} />
            </div>
          ) : bookingHistory.length === 0 ? (
            <p style={{ fontSize: 13.5, color: MUTE, margin: "12px 0 0" }}>Nothing booked yet — reserve a trip, stay or visa service above to see it here.</p>
          ) : (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {bookingHistory.map((b) => {
                const statusAccent = b.status === "confirmed" ? { bg: "#edf7f0", text: "#216240" } : b.status === "cancelled" ? { bg: "#f0ede4", text: "#7a7566" } : { bg: "#fff4ec", text: "#9c3f15" };
                return (
                  <div key={b.id} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 16, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>{bookTypeLabel[b.bookingType]} · {b.destinationCity}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{b.itemTitle}</div>
                        {b.startDate && <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 3 }}>{b.startDate}{b.endDate ? ` → ${b.endDate}` : ""}</div>}
                      </div>
                      <span style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 999, background: statusAccent.bg, color: statusAccent.text, fontFamily: MONO, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    );
  }

  function Appointments() {
    const wait = apptGuide?.waitLevel ?? 3;
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div onClick={() => goTo("book")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>← Bookings</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Visa appointments · {dest.country}</div>
          {apptGuide?.source === "ai" && !apptLoading && <AiChip label="Tailored guidance" />}
        </div>
        <h2 style={{ fontSize: 27, lineHeight: 1.14, fontWeight: 800, letterSpacing: "-.02em", margin: "10px 0 0" }}>Get a consular appointment</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.55 }}>Typical waits and how to book for a {modeInfo.name.toLowerCase()} — then jump straight to the official portal where live dates actually live.</p>
        <DestSwitcher />

        {apptLoading ? (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <Shimmer height={120} /><Shimmer height={80} /><Shimmer height={140} />
          </div>
        ) : !apptGuide ? (
          <p style={{ fontSize: 13.5, color: MUTE, margin: "20px 0 0" }}>Couldn&apos;t load guidance — try switching destination.</p>
        ) : (
          <>
            {/* Wait-time hero */}
            <div style={{ marginTop: 20, background: INK, borderRadius: 22, padding: 22, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#f3aa79" }}>Typical wait</div>
                <div style={{ display: "flex", gap: 3 }} aria-label={`Backlog ${wait} of 5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} style={{ width: 16, height: 6, borderRadius: 999, background: i <= wait ? (wait <= 2 ? "#7fd6a0" : wait === 3 ? "#f3c07a" : "#f0a08c") : "rgba(255,255,255,.18)" }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 0" }}>{apptGuide.typicalWait}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#c9cdc7", margin: "10px 0 0" }}>{apptGuide.bookAhead}</p>
            </div>

            {/* Official portal — the source of truth */}
            <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: MUTE }}>Official booking portal</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8 }}>{apptGuide.portalName}</div>
              <p style={{ fontSize: 13, color: "#6e746b", margin: "6px 0 0", lineHeight: 1.5 }}>{apptGuide.bestTimes}</p>
              <a href={apptGuide.portalUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, padding: 15, borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>
                <ExternalLink size={16} strokeWidth={2.4} /> Check live availability →
              </a>
            </div>

            {/* Prep before booking */}
            {apptGuide.prep.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <SectionLabel title="Before you book" icon={ClipboardCheck} />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {apptGuide.prep.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 14, padding: "13px 15px" }}>
                      <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: "#f6e9df", color: PRIMARY, fontFamily: MONO, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: "#3f453c" }}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start", background: "#fbf6ee", border: "1px solid #ece0cd", borderRadius: 14, padding: "13px 15px" }}>
              <Info size={15} strokeWidth={2.2} style={{ color: "#b9781f", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: "#7a6a4a", margin: 0, lineHeight: 1.5 }}>{apptGuide.notes}</p>
            </div>
          </>
        )}
      </div>
      </div>
    );
  }

  function BookListShell({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children: React.ReactNode }) {
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div onClick={() => goTo("book")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>← Book</div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE, marginTop: 14 }}>{eyebrow}</div>
        <h2 style={{ fontSize: 25, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{sub}</p>
        <DestSwitcher />
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
      </div>
      </div>
    );
  }

  function PriceRow({ left, sub, price, onClick, actionLabel = "Reserve →" }: { left: string; sub: string; price: string; onClick: () => void; actionLabel?: string }) {
    return (
      <div onClick={onClick} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: "-.01em" }}>{left}</div>
          <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 3 }}>{sub}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{price}</div>
          <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{actionLabel}</div>
        </div>
      </div>
    );
  }

  function Trips() {
    return (
      <BookListShell eyebrow={`Trips · ${dest.city}`} title="Get yourself there" sub="Sample routes and fares — reserve to hold your plan.">
        {tripOptions.map((t) => (
          <PriceRow key={t.id} left={`${t.provider} · ${t.route}`} sub={t.duration} price={t.price}
            onClick={() => openBooking({ type: "trip", title: `${t.provider} · ${t.route}`, provider: t.provider, price: t.price, needsDates: true, needsRange: false, needsGuests: false })} />
        ))}
      </BookListShell>
    );
  }

  function Stays() {
    return (
      <BookListShell eyebrow={`Stays · ${dest.city}`} title={mode === "trip" ? "Where to stay" : "A base for your stay"} sub={mode === "trip" ? "Hotels matched to a short visit." : "Furnished flats and coliving for a longer stay."}>
        {stayOptions.map((s) => (
          <PriceRow key={s.id} left={s.name} sub={`${s.area} · ★ ${s.rating}`} price={s.price}
            onClick={() => openBooking({ type: "stay", title: s.name, provider: s.area, price: s.price, needsDates: true, needsRange: true, needsGuests: true })} />
        ))}
      </BookListShell>
    );
  }

  function VisaBook() {
    return (
      <BookListShell eyebrow={`Visa · ${modeInfo.name}`} title="Sort your visa" sub={`Support tiers matched to a ${cur.label} stay in ${dest.country}.`}>
        {visaOptions.map((v) => (
          <PriceRow key={v.id} left={v.title} sub={v.detail} price={v.price}
            onClick={() => openBooking({ type: "visa", title: v.title, provider: "EasyMoveZone", price: v.price, needsDates: false, needsRange: false, needsGuests: false })} />
        ))}
      </BookListShell>
    );
  }

  function Booked() {
    const b = lastBooking;
    const applied = !!b && isApplyType(b.bookingType);
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ width: 64, height: 64, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 800, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>✓</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "20px 0 0" }}>{applied ? "Application sent — you're in" : "Reserved — you're sorted"}</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{applied ? "We've saved this application to your account. No payment taken." : "We've held this for you and saved it to your account. No payment taken yet."}</p>

        {b && (
          <div style={{ marginTop: 22, background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>{bookTypeLabel[b.bookingType]} · {b.destinationCity}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", margin: "10px 0 0" }}>{b.itemTitle}</h3>
            {b.provider && <div style={{ fontSize: 13, color: "#6e746b", marginTop: 4 }}>{b.provider}</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {b.priceLabel && <span style={{ background: "#f0ede4", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#4a5047", fontWeight: 600, fontFamily: MONO }}>{b.priceLabel}</span>}
              {b.startDate && <span style={{ background: "#f0ede4", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#4a5047", fontWeight: 600, fontFamily: MONO }}>{b.startDate}{b.endDate ? ` → ${b.endDate}` : ""}</span>}
              <span style={{ background: "#fbeae0", borderRadius: 999, padding: "6px 11px", fontSize: 12, color: "#9c3f15", fontWeight: 600, fontFamily: MONO }}>Ref {b.id.slice(0, 8)}</span>
            </div>
          </div>
        )}

        <button onClick={() => goTo("plan")} style={{ width: "100%", marginTop: 22, padding: 16, border: "none", borderRadius: 16, background: INK, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>View my plan →</button>
        <button onClick={() => goTo("book")} style={{ width: "100%", marginTop: 10, padding: 16, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Book something else</button>
      </div>
      </div>
    );
  }

  // Invoked as plain functions (not <Component/>) so their JSX inlines into this
  // render and the screens keep sharing the single state tree above.
  function screenBody() {
    switch (screen) {
      case "welcome": return Welcome();
      case "spectrum": return Spectrum();
      case "search": return MoodSearch();
      case "matches": return catalogLoaded ? Matches() : <MatchesSkeleton />;
      case "detail": return Detail();
      case "intelligence": return Intelligence();
      case "execution": return Execution();
      case "plan": return Plan();
      case "visa": return Visa();
      case "documents": return Documents();
      case "settle": return Settle();
      case "book": return BookHub();
      case "trips": return Trips();
      case "stays": return Stays();
      case "visaBook": return VisaBook();
      case "appointments": return Appointments();
      case "booked": return Booked();
    }
  }

  const tabs: { label: string; screens: Screen[]; go: Screen }[] = [
    { label: "Explore", screens: ["welcome", "spectrum", "search", "matches", "detail"], go: "matches" },
    { label: "Intelligence", screens: ["intelligence", "visa", "settle"], go: "intelligence" },
    { label: "Documents", screens: ["documents"], go: "documents" },
    { label: "Bookings", screens: ["book", "trips", "stays", "visaBook", "appointments", "booked", "execution", "plan"], go: "book" },
  ];

  // Avoid a flash of "welcome" while the returning-user redirect above is
  // still deciding where to land.
  if (!ready) {
    return (
      <div className="move-root">
        <MatchesSkeleton />
      </div>
    );
  }

  const modals = (
    <>
      {pending && (
        <div className="move-overlay move-overlay--sheet" onClick={() => setPending(null)}>
          <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="move-sheet-handle" />
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>{bookTypeLabel[pending.type]} · {dest.city}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", margin: "10px 0 0" }}>{pending.title}</h3>
            {pending.provider && <div style={{ fontSize: 13.5, color: "#6e746b", marginTop: 4 }}>{pending.provider}</div>}
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: INK, marginTop: 10 }}>{pending.price}</div>

            {(pending.needsDates || pending.needsGuests) && (
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                {pending.needsDates && (
                  <label style={{ display: "block" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6e746b" }}>{pending.needsRange ? "Check-in" : "Date"}</span>
                    <input type="date" value={bookStart} onChange={(e) => setBookStart(e.target.value)} style={{ marginTop: 6, width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d8d2c6", background: "#fff", fontFamily: HANKEN, fontSize: 15, color: INK }} />
                  </label>
                )}
                {pending.needsRange && (
                  <label style={{ display: "block" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6e746b" }}>Check-out</span>
                    <input type="date" value={bookEnd} onChange={(e) => setBookEnd(e.target.value)} style={{ marginTop: 6, width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d8d2c6", background: "#fff", fontFamily: HANKEN, fontSize: 15, color: INK }} />
                  </label>
                )}
                {pending.needsGuests && (
                  <label style={{ display: "block" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6e746b" }}>Guests</span>
                    <input type="number" min={1} max={20} value={bookGuests} onChange={(e) => setBookGuests(Math.max(1, Number(e.target.value) || 1))} style={{ marginTop: 6, width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #d8d2c6", background: "#fff", fontFamily: HANKEN, fontSize: 15, color: INK }} />
                  </label>
                )}
              </div>
            )}

            <button onClick={confirmBooking} disabled={bookState === "saving"} style={{ width: "100%", marginTop: 20, padding: 17, border: "none", borderRadius: 16, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: bookState === "saving" ? "default" : "pointer", opacity: bookState === "saving" ? 0.7 : 1, boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>
              {isApplyType(pending.type)
                ? bookState === "saving" ? "Applying…" : signedIn ? "Confirm application" : "Sign in to apply"
                : bookState === "saving" ? "Reserving…" : signedIn ? "Confirm reservation" : "Sign in to reserve"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#a8a395", margin: "12px 0 0", lineHeight: 1.5 }}>
              {isApplyType(pending.type)
                ? "No payment taken — this saves your application to your workspace."
                : "No payment taken — this holds your choice in your workspace."}
            </p>
          </div>
        </div>
      )}

      {shareOpen && (
        <div className="move-overlay move-overlay--dialog" onClick={() => setShareOpen(false)}>
          <div className="move-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "relative", width: 116, height: 116, margin: "0 auto" }}>
              <svg width="116" height="116" viewBox="0 0 116 116">
                <circle cx="58" cy="58" r="48" style={{ fill: "none", stroke: "#f7e4d9", strokeWidth: "10px" }} />
                <circle cx="58" cy="58" r="48" transform="rotate(-90 58 58)" style={{ fill: "none", stroke: PRIMARY, strokeWidth: "10px", strokeLinecap: "round", strokeDasharray: "301.6px", strokeDashoffset: `${(2 * Math.PI * 48 * (1 - pct / 100)).toFixed(1)}px`, transition: "stroke-dashoffset .6s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }}>{pct}%</div>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.015em", margin: "18px 0 0" }}>I&apos;m {pct}% ready for {dest.city}</h3>
            <p style={{ fontSize: 14, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{doneCount} of {allKeys.length} steps done on my {plan.name}.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setShareOpen(false)} style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 14, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
              <button onClick={() => setShareOpen(false)} style={{ flex: 1, padding: 14, border: "none", borderRadius: 14, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Copy link</button>
            </div>
          </div>
        </div>
      )}

      {destSwitchOpen && (
        <div className="move-overlay move-overlay--sheet" onClick={() => setDestSwitchOpen(false)}>
          <div className="move-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="move-sheet-handle" />
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: PRIMARY }}>Switch destination</div>
            <p style={{ fontSize: 13.5, color: "#6e746b", margin: "8px 0 0", lineHeight: 1.5 }}>This is what drives everything below — your Plan, Visa, Settle and Book pages all update to match.</p>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {ranked.map((d) => {
                const active = d.id === dest.id;
                return (
                  <div key={d.id} onClick={() => { goTo(screen, { destId: d.id }); setDestSwitchOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 16, cursor: "pointer", background: active ? PRIMARY : "#fff", color: active ? "#fff" : INK, border: `1px solid ${active ? PRIMARY : "#e4dfd5"}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700 }}>{d.city}</div>
                      <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,.75)" : MUTE, marginTop: 2 }}>{d.country} · {d.match[mode]}% match</div>
                    </div>
                    {active && <span style={{ fontSize: 16 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MoveAppShell
      showNav={showNav}
      tabs={tabs}
      screen={screen}
      onNavigate={(s) => goTo(s as Screen)}
      destCity={isFlowScreen ? undefined : dest.city}
      destCountry={isFlowScreen ? undefined : dest.country}
      stayLabel={isFlowScreen ? undefined : cur.label}
      modeName={isFlowScreen ? undefined : modeInfo.name}
      movePct={pct}
      moveDone={doneCount}
      moveTotal={allKeys.length}
      isFlowScreen={isFlowScreen}
      modals={modals}
    >
      {screenBody()}
    </MoveAppShell>
  );
}
