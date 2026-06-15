"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  DESTINATIONS,
  MODE_LABEL,
  PLAN,
  QUESTIONS,
  SETTLE,
  SPECTRUM,
  type Mode,
} from "./data";
import { ImageSlot } from "./ImageSlot";
import { IOSDeviceFrame } from "./IOSDeviceFrame";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#9aa097";

// Supplied via next/font CSS variables from the page wrapper.
const HANKEN = "var(--font-hanken), system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";

type Screen =
  | "welcome"
  | "spectrum"
  | "explore"
  | "matches"
  | "detail"
  | "visa"
  | "settle"
  | "plan";

export function EasyMoveZoneApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [stayIdx, setStayIdx] = useState(2);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [destId, setDestId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  // Responsive: framed device on desktop ("web"), full-bleed on mobile.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 760px) and (min-height: 880px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const mode: Mode = SPECTRUM[stayIdx].mode;
  const cur = SPECTRUM[stayIdx];
  const modeInfo = MODE_LABEL[mode];

  const ranked = useMemo(
    () => [...DESTINATIONS].sort((a, b) => b.match[mode] - a.match[mode]),
    [mode],
  );
  const dest = useMemo(
    () => DESTINATIONS.find((d) => d.id === destId) ?? ranked[0],
    [destId, ranked],
  );

  function answer(opt: string) {
    const q = QUESTIONS[qIndex];
    const next = { ...answers, [q.id]: opt };
    if (qIndex >= QUESTIONS.length - 1) {
      setAnswers(next);
      setDestId(ranked[0].id);
      setScreen("matches");
    } else {
      setAnswers(next);
      setQIndex(qIndex + 1);
    }
  }

  function toggleItem(key: string) {
    setDone((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key];
      else n[key] = true;
      return n;
    });
  }

  // ── Move Meter math (driven by ticked plan items) ─────────────────────
  const plan = PLAN[mode];
  const allKeys: string[] = [];
  plan.phases.forEach((ph, pi) => ph.items.forEach((_, ii) => allKeys.push(`${mode}:${pi}:${ii}`)));
  const doneCount = allKeys.filter((k) => done[k]).length;
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;
  const meterMsg = pct === 0 ? "Let's get you started." : pct < 100 ? "You're on your way." : "All set — you're ready to go!";

  const showNav = ["matches", "detail", "plan", "visa", "settle"].includes(screen);

  // ───────────────────────────────── Screens ──────────────────────────────
  function Welcome() {
    return (
      <div style={{ height: "100%", minHeight: 760, display: "flex", flexDirection: "column", padding: "92px 28px 40px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: PRIMARY, fontWeight: 500 }}>
          EasyMoveZone
        </div>
        <div style={{ marginTop: 56 }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textWrap: "balance" } as CSSProperties}>
            Two weeks or<br />forever — we get<br />you there, sorted.
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#5f655c", margin: "22px 0 0", maxWidth: 300 }}>
            One app for every kind of move. Tell us how long you&apos;re staying, and everything adapts around you.
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
    );
  }

  function Spectrum() {
    const fillPct = `${(stayIdx / (SPECTRUM.length - 1)) * 100}%`;
    return (
      <div style={{ height: "100%", minHeight: 760, display: "flex", flexDirection: "column", padding: "70px 28px 36px" }}>
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
        <button onClick={() => { setScreen("explore"); setQIndex(0); setAnswers({}); }} style={{ width: "100%", padding: 19, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>Continue</button>
      </div>
    );
  }

  function Explore() {
    const q = QUESTIONS[qIndex];
    return (
      <div style={{ height: "100%", minHeight: 760, display: "flex", flexDirection: "column", padding: "70px 28px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".12em", color: PRIMARY, fontWeight: 500 }}>0{qIndex + 1} / 0{QUESTIONS.length}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: MUTE }}>Explore</span>
        </div>
        <div style={{ marginTop: 12, height: 4, background: "#ddd8cd", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", background: PRIMARY, borderRadius: 999, width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`, transition: "width .35s ease" }} />
        </div>

        <h2 style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "40px 0 0", textWrap: "balance" } as CSSProperties}>{q.q}</h2>
        <p style={{ fontSize: 15, color: "#6e746b", margin: "12px 0 0" }}>{q.hint}</p>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
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

  function Matches() {
    const C22 = 2 * Math.PI * 22;
    const top3 = ranked.slice(0, 3);
    return (
      <div style={{ minHeight: "100%", padding: "70px 22px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Your matches</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>3 places that fit how you want to move</h2>

        <div onClick={() => setScreen("spectrum")} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "8px 14px", background: "#fff", border: "1px solid #e4dfd5", borderRadius: 999, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: PRIMARY, letterSpacing: ".08em" }}>{cur.label} · {modeInfo.name}</span>
          <span style={{ fontSize: 12, color: MUTE }}>change ↻</span>
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          {top3.map((d, i) => {
            const ringOffset = (C22 * (1 - d.match[mode] / 100)).toFixed(1);
            const chips = [d.stats[mode][0][1], d.visa[mode].tag];
            return (
              <div key={d.id} onClick={() => { setDestId(d.id); setScreen("detail"); }} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 22, overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
                <div style={{ height: 152, position: "relative", background: "#ece6da" }}>
                  <ImageSlot src={photos[d.id]} placeholder={`Drop a ${d.city} photo`} onPick={(u) => setPhotos((p) => ({ ...p, [d.id]: u }))} />
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
    );
  }

  function Detail() {
    const visa = dest.visa[mode];
    const planCta = mode === "move" ? "Build your Move Plan" : mode === "nomad" ? "Open Nomad Mode" : "Get your Trip Pack";
    return (
      <div style={{ minHeight: "100%", paddingBottom: 28 }}>
        <div style={{ height: 300, position: "relative", background: "#e2dccd", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22 }}>
          <ImageSlot src={photos[dest.id]} placeholder={`Drop a ${dest.city} photo`} onPick={(u) => setPhotos((p) => ({ ...p, [dest.id]: u }))} />
          <div onClick={() => setScreen("matches")} style={{ position: "absolute", top: 64, left: 18, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,.86)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 19, boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 2 }}>←</div>
          <div style={{ position: "absolute", top: 66, right: 18, background: "rgba(27,35,30,.82)", color: "#fff", padding: "7px 13px", borderRadius: 999, fontFamily: MONO, fontSize: 12, backdropFilter: "blur(4px)", zIndex: 2 }}>{dest.match[mode]}% match</div>
        </div>

        <div style={{ padding: "20px 22px 0" }}>
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

          <button onClick={() => setScreen("plan")} style={{ width: "100%", marginTop: 22, padding: 18, border: "none", borderRadius: 18, background: PRIMARY, color: "#fff", fontFamily: HANKEN, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(224,81,31,.3)" }}>{planCta} →</button>
          <button onClick={() => setScreen("settle")} style={{ width: "100%", marginTop: 10, padding: 16, border: "1px solid #d8d2c6", borderRadius: 18, background: "transparent", color: "#4a5047", fontFamily: HANKEN, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Explore living in {dest.city}</button>
        </div>
      </div>
    );
  }

  function Plan() {
    const CIRC = 2 * Math.PI * 40;
    const ringOffset = (CIRC * (1 - pct / 100)).toFixed(1);
    const planHeadline = mode === "move" ? "Your move, in clear phases" : "Everything to sort, in order";
    return (
      <div style={{ minHeight: "100%", padding: "70px 22px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Your {plan.name}</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{planHeadline}</h2>
        <p style={{ fontSize: 14, color: "#6e746b", margin: "10px 0 0", lineHeight: 1.5 }}>{plan.intro}</p>

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

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
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

        <div onClick={() => setShareOpen(true)} style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, border: "1px dashed #cbc5b8", borderRadius: 16, color: "#6e746b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <span style={{ fontSize: 15 }}>↗</span> Share my Move Meter
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
      <div style={{ minHeight: "100%", padding: "70px 22px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Visa Snapshot</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>{dest.city}, the right visa for you</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Based on a <b style={{ color: "#4a5047" }}>{cur.label}</b> stay. Change your timeframe and this updates instantly.</p>

        <div style={{ marginTop: 22, background: INK, borderRadius: 22, padding: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#f3aa79" }}>{modeInfo.name}</div>
            <div style={{ background: "rgba(243,170,121,.2)", color: "#f8caa6", padding: "5px 11px", borderRadius: 999, fontFamily: MONO, fontSize: 11 }}>{visa.tag}</div>
          </div>
          <h3 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.01em", margin: "18px 0 0" }}>{visa.headline}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "#c9cdc7", margin: "12px 0 0" }}>{visa.body}</p>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
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
    );
  }

  function Settle() {
    const cards = SETTLE[dest.id] || [];
    return (
      <div style={{ minHeight: "100%", padding: "70px 22px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTE }}>Settle · {dest.city}</div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: "10px 0 0" }}>Land like you&apos;ve been before</h2>
        <p style={{ fontSize: 14.5, color: "#6e746b", margin: "12px 0 0", lineHeight: 1.5 }}>Expat- and nomad-written essentials, filtered for your <b style={{ color: "#4a5047" }}>{cur.label}</b> stay.</p>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {cards.map((g) => (
            <div key={g.title} style={{ background: "#fff", border: "1px solid #e4dfd5", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: PRIMARY }}>{g.tag}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", margin: "10px 0 0" }}>{g.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5f655c", margin: "8px 0 0" }}>{g.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, background: "#fbeae0", border: "1px solid #f3d6c4", borderRadius: 20, padding: 20, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: PRIMARY, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>+</div>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#9c3f15" }}>Join the {dest.city} community</div>
            <div style={{ fontSize: 13, color: "#b05a2c", marginTop: 3 }}>Meetups, housing tips and a friendly welcome thread.</div>
          </div>
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
      case "explore": return Explore();
      case "matches": return Matches();
      case "detail": return Detail();
      case "plan": return Plan();
      case "visa": return Visa();
      case "settle": return Settle();
    }
  }

  const tabs: { label: string; screens: Screen[]; go: Screen }[] = [
    { label: "Explore", screens: ["matches", "detail"], go: "matches" },
    { label: "Plan", screens: ["plan"], go: "plan" },
    { label: "Visa", screens: ["visa"], go: "visa" },
    { label: "Settle", screens: ["settle"], go: "settle" },
  ];

  // The phone UI: scroll area + bottom nav + share overlay.
  const phone = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#efece4", color: INK, fontFamily: HANKEN, position: "relative" }}>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {screenBody()}
      </div>

      {showNav && (
        <div style={{ display: "flex", borderTop: "1px solid #e0dacd", background: "rgba(247,245,239,.92)", backdropFilter: "blur(12px)", padding: "12px 16px 30px" }}>
          {tabs.map((t) => {
            const active = t.screens.includes(screen);
            return (
              <div key={t.label} onClick={() => setScreen(t.go)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: PRIMARY, opacity: active ? 1 : 0, transition: "opacity .2s" }} />
                <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? INK : "#a3a89f", fontFamily: HANKEN, transition: "color .2s" }}>{t.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {shareOpen && (
        <div onClick={() => setShareOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(20,26,21,.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 26, padding: "30px 24px 24px", width: "100%", maxWidth: 318, boxShadow: "0 24px 64px rgba(0,0,0,.34)", textAlign: "center" }}>
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
    </div>
  );

  // Desktop ("web"): framed device on a radial-gradient backdrop.
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(120% 120% at 50% 0%, #ded8cb 0%, #cfc9bc 100%)", padding: 28, fontFamily: HANKEN }}>
        <IOSDeviceFrame>{phone}</IOSDeviceFrame>
      </div>
    );
  }

  // Mobile: full-bleed native layout.
  return <div style={{ height: "100dvh", background: "#efece4" }}>{phone}</div>;
}
