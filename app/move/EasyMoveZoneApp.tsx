"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  MODE_LABEL,
  MOOD_CHIPS,
  PLAN,
  QUESTIONS,
  SPECTRUM,
  type Mode,
} from "./data";
import { useMoveCatalog } from "./useMoveCatalog";
import { ImageSlot } from "./ImageSlot";
import { MoveAppShell } from "./MoveAppShell";
import { SettleCardsGrid } from "@/components/settle/SettleCardsGrid";
import "./move.css";
import { loadFlowState, saveFlowState } from "./storage";
import { authClient } from "@/lib/auth/client";
import { savePlan, addTask, fetchWorkspace, updateTaskStatus, fetchGuideByCitySlug } from "@/lib/relocate/client";
import { moveTaskNote, parseMoveTaskNote } from "@/lib/move/plan-sync";
import { settleCardsForCity } from "@/lib/settle/cards";
import { MatchesSkeleton } from "@/components/ui/PageSkeletons";
import { createBooking } from "@/lib/bookings/client";
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

type Screen =
  | "welcome"
  | "spectrum"
  | "search"
  | "matches"
  | "detail"
  | "visa"
  | "settle"
  | "plan"
  | "book"
  | "trips"
  | "stays"
  | "visaBook"
  | "booked";

export function EasyMoveZoneApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [stayIdx, setStayIdx] = useState(2);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [destId, setDestId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [taskIdByKey, setTaskIdByKey] = useState<Record<string, string>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
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

  // Booking flow state.
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");
  const [bookGuests, setBookGuests] = useState(1);
  const [bookState, setBookState] = useState<"idle" | "saving">("idle");
  const [lastBooking, setLastBooking] = useState<MoveBooking | null>(null);
  const [settleCards, setSettleCards] = useState<SettleCard[]>([]);
  const [settleCommunity, setSettleCommunity] = useState("");

  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const signedIn = !!sessionData?.user;
  const { destinations, trips, stays, visaServices, loaded: catalogLoaded } = useMoveCatalog();

  // Returning, signed-in users who've completed the flow before land straight
  // on Explore (the matches screen) with their last destination & stay length,
  // instead of the welcome screen.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready || sessionPending || !catalogLoaded) return;
    if (signedIn) {
      const saved = loadFlowState();
      const validDest = saved && destinations.some((d) => d.id === saved.destId);
      const validStay = saved && saved.stayIdx >= 0 && saved.stayIdx < SPECTRUM.length;
      if (saved?.completed && validDest && validStay) {
        setStayIdx(saved.stayIdx);
        setDestId(saved.destId);
        setScreen("matches");
      }
    }
    setReady(true);
  }, [ready, sessionPending, signedIn, catalogLoaded, destinations]);

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

  // The mood search, when used, overrides the static match-score ordering.
  const moodList = useMemo(() => {
    if (!moodRanking) return null;
    const found = moodRanking.map((id) => destinations.find((d) => d.id === id)).filter((d): d is typeof destinations[number] => !!d);
    return found.length ? found : null;
  }, [moodRanking, destinations]);
  const browseList = moodList ?? ranked;

  function answer(opt: string) {
    const q = QUESTIONS[qIndex];
    const next = { ...answers, [q.id]: opt };
    if (qIndex >= QUESTIONS.length - 1) {
      setAnswers(next);
      setDestId(ranked[0].id);
      setMoodRanking(null);
      setMoodNote(null);
      setScreen("matches");
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

  async function runMoodSearch() {
    const text = moodText.trim();
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
      if (ids.length) {
        setMoodRanking(ids);
        setDestId(ids[0]);
      } else {
        setMoodRanking(null);
        setDestId(ranked[0].id);
      }
      setMoodNote(typeof data.note === "string" ? data.note : null);
    } catch {
      setMoodError("Couldn't reach the matcher — showing standard matches instead.");
      setMoodRanking(null);
      setMoodNote(null);
      setDestId(ranked[0].id);
    } finally {
      setMoodLoading(false);
      setScreen("matches");
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
      setScreen("plan");
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
      setScreen("booked");
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
  };

  // ── Move Meter math (driven by ticked plan items) ─────────────────────
  const plan = PLAN[mode];
  const allKeys: string[] = [];
  plan.phases.forEach((ph, pi) => ph.items.forEach((_, ii) => allKeys.push(`${mode}:${pi}:${ii}`)));
  const doneCount = allKeys.filter((k) => done[k]).length;
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;
  const meterMsg = pct === 0 ? "Let's get you started." : pct < 100 ? "You're on your way." : "All set — you're ready to go!";

  const showNav = ["matches", "detail", "plan", "visa", "settle", "book", "trips", "stays", "visaBook", "booked"].includes(screen);
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
            Get there.<br />Stay there.<br />
            <span style={{ color: PRIMARY }}>Visa sorted.</span>
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 300 }}>
            Movement, accommodation, and visa — the three things every move needs, in one app that adapts to how long you&apos;re staying.
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
          onClick={() => setScreen("spectrum")}
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
        <button onClick={() => { setExploreReturnScreen("spectrum"); setScreen("search"); setQIndex(0); setAnswers({}); setExploreMode("mood"); }} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>Continue</button>
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
    setScreen(exploreReturnScreen);
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
          onClick={runMoodSearch}
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

  function Matches() {
    const C22 = 2 * Math.PI * 22;
    const top3 = browseList.slice(0, 3);
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Explore · your matches</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{moodList ? "Matched to your mood" : "3 places that fit how you want to move"}</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <div onClick={() => setScreen("spectrum")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{cur.label} · {modeInfo.name}</span>
            <span style={{ fontSize: 12, color: MUTE }}>change ↻</span>
          </div>
          <div onClick={() => { setExploreReturnScreen("matches"); setExploreMode("mood"); setScreen("search"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{moodList ? "Refine your mood search" : "Try a mood search"}</span>
            <span style={{ fontSize: 12, color: MUTE }}>{moodList ? "↻" : "→"}</span>
          </div>
        </div>

        {moodNote && (
          <div style={{ marginTop: 16, background: "#f6e9df", border: "1px solid #f3d6c4", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#bf6a3c" }}>Because you said “{moodText}”</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5a4636", margin: "8px 0 0" }}>{moodNote}</p>
          </div>
        )}

        <div className="move-card-grid" style={{ marginTop: 22 }}>
          {top3.map((d, i) => {
            const ringOffset = (C22 * (1 - d.match[mode] / 100)).toFixed(1);
            const chips = [d.stats[mode][0][1], d.visa[mode].tag];
            return (
              <div key={d.id} onClick={() => { setDestId(d.id); setScreen("detail"); }} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 22, overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
                <div style={{ height: 152, position: "relative", background: "#ece6da" }}>
                  <ImageSlot src={photos[d.id] ?? d.imageUrl} placeholder={`Drop a ${d.city} photo`} onPick={(u) => setPhotos((p) => ({ ...p, [d.id]: u }))} />
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
    const planCta = mode === "move" ? "Build your Move Plan" : mode === "nomad" ? "Open Nomad Mode" : "Get your Trip Pack";
    const actionButtons = (
      <>
        <button onClick={() => setScreen("book")} style={{ width: "100%", padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>Book your trip, stay &amp; visa →</button>
        <button onClick={() => setScreen("plan")} style={{ width: "100%", marginTop: 10, padding: 16, border: "1px solid #d8d2c6", borderRadius: 18, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{planCta}</button>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={() => setScreen("trips")} style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Book a trip</button>
          <button onClick={() => setScreen("stays")} style={{ flex: 1, padding: 14, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Find a stay</button>
        </div>
        <button onClick={() => setScreen("settle")} style={{ width: "100%", marginTop: 10, padding: 14, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Explore living in {dest.city}</button>
      </>
    );
    return (
      <div className="move-page-inner">
      <div className="move-page-screen" style={{ paddingBottom: 28 }}>
        <div className="move-detail-layout">
        <div>
        <div className="move-detail-hero" style={{ position: "relative", background: "#e2dccd", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22 }}>
          <ImageSlot src={photos[dest.id] ?? dest.imageUrl} placeholder={`Drop a ${dest.city} photo`} onPick={(u) => setPhotos((p) => ({ ...p, [dest.id]: u }))} />
          <div onClick={() => setScreen("matches")} style={{ position: "absolute", top: 64, left: 18, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,.86)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 19, boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 2 }}>←</div>
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

  function Visa() {
    const visa = dest.visa[mode];
    const others = (["trip", "nomad", "move"] as Mode[]).filter((m) => m !== mode).map((m) => ({
      mode: MODE_LABEL[m].name,
      headline: dest.visa[m].headline,
      tag: dest.visa[m].tag,
    }));
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Visa Snapshot</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{dest.city}, the right visa for you</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Based on a <b style={{ color: "#4a5047" }}>{cur.label}</b> stay. Change your timeframe and this updates instantly.</p>
        <DestSwitcher />

        <div style={{ marginTop: 22, background: INK, borderRadius: 22, padding: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#f3aa79" }}>{modeInfo.name}</div>
            <div style={{ background: "rgba(243,170,121,.2)", color: "#f8caa6", padding: "5px 11px", borderRadius: 999, fontFamily: MONO, fontSize: 11 }}>{visa.tag}</div>
          </div>
          <h3 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.01em", margin: "18px 0 0" }}>{visa.headline}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "#c9cdc7", margin: "12px 0 0" }}>{visa.body}</p>
        </div>

        <div className="move-visa-others" style={{ marginTop: 18 }}>
          {others.map((o) => (
            <div key={o.mode} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>{o.mode}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY }}>{o.tag}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>{o.headline}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#a8a395", margin: "20px 0 0", lineHeight: 1.5 }}>Illustrative guidance for a prototype.<br />Always confirm with an official source before you travel.</p>
      </div>
      </div>
    );
  }

  function Settle() {
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Settle · {dest.city}</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Land like you&apos;ve been before</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Expat- and nomad-written essentials, filtered for your <b style={{ color: "#4a5047" }}>{cur.label}</b> stay.</p>
        <DestSwitcher />

        <SettleCardsGrid cards={settleCards} variant="move" />

        <div style={{ marginTop: 18, background: "#fbeae0", border: "1px solid #f3d6c4", borderRadius: 20, padding: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: PRIMARY, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>+</div>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#9c3f15" }}>Join the {dest.city} community</div>
            <div style={{ fontSize: 13, color: "#b05a2c", marginTop: 3 }}>
              {settleCommunity || "Meetups, housing tips and a friendly welcome thread."}
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  function BookHub() {
    const cards: { type: BookingType; go: Screen; title: string; sub: string; icon: string }[] = [
      { type: "trip", go: "trips", title: "Book your trip", sub: "Flights & overland routes to get you there", icon: "✈" },
      { type: "stay", go: "stays", title: "Find a stay", sub: mode === "trip" ? "Hotels for your visit" : "Furnished flats & coliving", icon: "⌂" },
      { type: "visa", go: "visaBook", title: "Sort your visa", sub: "From a free checklist to full handling", icon: "✓" },
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
            <div key={c.type} onClick={() => setScreen(c.go)} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fbeae0", color: PRIMARY, fontSize: 22 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#6e746b", marginTop: 3 }}>{c.sub}</div>
              </div>
              <span style={{ color: PRIMARY, fontSize: 18 }}>→</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    );
  }

  function BookListShell({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children: React.ReactNode }) {
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div onClick={() => setScreen("book")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: PRIMARY, cursor: "pointer" }}>← Book</div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE, marginTop: 14 }}>{eyebrow}</div>
        <h2 style={{ fontSize: 25, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{sub}</p>
        <DestSwitcher />
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
      </div>
      </div>
    );
  }

  function PriceRow({ left, sub, price, onClick }: { left: string; sub: string; price: string; onClick: () => void }) {
    return (
      <div onClick={onClick} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 18, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: "-.01em" }}>{left}</div>
          <div style={{ fontSize: 12.5, color: "#6e746b", marginTop: 3 }}>{sub}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: PRIMARY }}>{price}</div>
          <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>Reserve →</div>
        </div>
      </div>
    );
  }

  function Trips() {
    const options = trips[dest.id] ?? [];
    return (
      <BookListShell eyebrow={`Trips · ${dest.city}`} title="Get yourself there" sub="Sample routes and fares — reserve to hold your plan.">
        {options.map((t) => (
          <PriceRow key={t.id} left={`${t.provider} · ${t.route}`} sub={t.duration} price={t.price}
            onClick={() => openBooking({ type: "trip", title: `${t.provider} · ${t.route}`, provider: t.provider, price: t.price, needsDates: true, needsRange: false, needsGuests: false })} />
        ))}
      </BookListShell>
    );
  }

  function Stays() {
    const options = (stays[dest.id] ?? []).filter((s) => s.forModes.includes(mode));
    return (
      <BookListShell eyebrow={`Stays · ${dest.city}`} title={mode === "trip" ? "Where to stay" : "A base for your stay"} sub={mode === "trip" ? "Hotels matched to a short visit." : "Furnished flats and coliving for a longer stay."}>
        {options.map((s) => (
          <PriceRow key={s.id} left={s.name} sub={`${s.area} · ★ ${s.rating}`} price={s.price}
            onClick={() => openBooking({ type: "stay", title: s.name, provider: s.area, price: s.price, needsDates: true, needsRange: true, needsGuests: true })} />
        ))}
      </BookListShell>
    );
  }

  function VisaBook() {
    const options = visaServices[mode] ?? [];
    return (
      <BookListShell eyebrow={`Visa · ${modeInfo.name}`} title="Sort your visa" sub={`Support tiers matched to a ${cur.label} stay in ${dest.country}.`}>
        {options.map((v) => (
          <PriceRow key={v.id} left={v.title} sub={v.detail} price={v.price}
            onClick={() => openBooking({ type: "visa", title: v.title, provider: "EasyMoveZone", price: v.price, needsDates: false, needsRange: false, needsGuests: false })} />
        ))}
      </BookListShell>
    );
  }

  function Booked() {
    const b = lastBooking;
    return (
      <div className="move-page-inner">
      <div className="move-page-screen">
        <div style={{ width: 64, height: 64, borderRadius: 999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 800, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>✓</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "20px 0 0" }}>Reserved — you&apos;re sorted</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>We&apos;ve held this for you and saved it to your account. No payment taken yet.</p>

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

        <button onClick={() => setScreen("plan")} style={{ width: "100%", marginTop: 22, padding: 16, border: "none", borderRadius: 16, background: INK, color: "#fff", fontFamily: HANKEN, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>View my plan →</button>
        <button onClick={() => setScreen("book")} style={{ width: "100%", marginTop: 10, padding: 16, border: "1px solid #d8d2c6", borderRadius: 16, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Book something else</button>
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
      case "plan": return Plan();
      case "visa": return Visa();
      case "settle": return Settle();
      case "book": return BookHub();
      case "trips": return Trips();
      case "stays": return Stays();
      case "visaBook": return VisaBook();
      case "booked": return Booked();
    }
  }

  const tabs: { label: string; screens: Screen[]; go: Screen }[] = [
    { label: "Explore", screens: ["matches", "detail"], go: "matches" },
    { label: "Plan", screens: ["plan"], go: "plan" },
    { label: "Book", screens: ["book", "trips", "stays", "visaBook", "booked"], go: "book" },
    { label: "Visa", screens: ["visa"], go: "visa" },
    { label: "Settle", screens: ["settle"], go: "settle" },
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
              {bookState === "saving" ? "Reserving…" : signedIn ? "Confirm reservation" : "Sign in to reserve"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#a8a395", margin: "12px 0 0", lineHeight: 1.5 }}>No payment taken — this holds your choice in your workspace.</p>
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
                  <div key={d.id} onClick={() => { setDestId(d.id); setDestSwitchOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 16, cursor: "pointer", background: active ? PRIMARY : "#fff", color: active ? "#fff" : INK, border: `1px solid ${active ? PRIMARY : "#e4dfd5"}` }}>
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
      onNavigate={(s) => setScreen(s as Screen)}
      destCity={showNav ? dest.city : undefined}
      destCountry={showNav ? dest.country : undefined}
      stayLabel={showNav ? cur.label : undefined}
      modeName={showNav ? modeInfo.name : undefined}
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
