// Remembers where a returning user left off in /move so reopening
// the app drops them back at their shifts feed instead of the welcome screen.

import type { Destination } from "./data";

const KEY = "emz:flow";
const DRIVER_KEY = "emz:driver-flow";
const CUSTOM_DESTS_KEY = "emz:custom-dests";
const CUSTOM_DESTS_MAX = 20;

export interface SavedFlowState {
  stayIdx: number;
  destId: string;
  completed: boolean;
}

export function loadFlowState(): SavedFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedFlowState>;
    if (typeof parsed.destId !== "string" || typeof parsed.stayIdx !== "number") return null;
    return { stayIdx: parsed.stayIdx, destId: parsed.destId, completed: !!parsed.completed };
  } catch {
    return null;
  }
}

export function saveFlowState(state: SavedFlowState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable (private mode, quota) — safe to skip */
  }
}

export interface DriverFlowState {
  zone: string;
  vehicle: string;
  completed: boolean;
}

export function loadDriverFlowState(): DriverFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRIVER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DriverFlowState>;
    if (typeof parsed.zone !== "string" || typeof parsed.vehicle !== "string") return null;
    return { zone: parsed.zone, vehicle: parsed.vehicle, completed: !!parsed.completed };
  } catch {
    return null;
  }
}

export function saveDriverFlowState(state: DriverFlowState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRIVER_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable — safe to skip */
  }
}

// AI-generated destinations the user has searched for. Persisted so a custom
// city survives reloads and its /move/explore/<id> deep link keeps working.

export function loadCustomDestinations(): Destination[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_DESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is Destination =>
        !!d && typeof d === "object" &&
        typeof (d as Destination).id === "string" &&
        typeof (d as Destination).city === "string" &&
        !!(d as Destination).match && !!(d as Destination).honest &&
        !!(d as Destination).stats && !!(d as Destination).visa,
    );
  } catch {
    return [];
  }
}

export function saveCustomDestination(dest: Destination): Destination[] {
  const existing = loadCustomDestinations().filter((d) => d.id !== dest.id);
  // Most recent first; capped so localStorage can't grow unbounded.
  const next = [dest, ...existing].slice(0, CUSTOM_DESTS_MAX);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CUSTOM_DESTS_KEY, JSON.stringify(next));
    } catch {
      /* safe to skip */
    }
  }
  return next;
}

// AI-regenerated profiles for CATALOG cities. Every destination the user
// views gets its seeded copy replaced by fresh AI content; the cache keeps
// that to one generation per city per week instead of one per page view.

const AI_PROFILES_KEY = "emz:ai-profiles";
const AI_PROFILE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AI_PROFILES_MAX = 40;

interface CachedProfile {
  at: number;
  dest: Destination;
}

export function loadAiProfiles(): Record<string, Destination> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AI_PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CachedProfile>;
    const now = Date.now();
    const out: Record<string, Destination> = {};
    for (const [id, entry] of Object.entries(parsed)) {
      if (
        entry && typeof entry === "object" &&
        typeof entry.at === "number" && now - entry.at < AI_PROFILE_TTL_MS &&
        entry.dest && typeof entry.dest === "object" &&
        typeof entry.dest.id === "string" && !!entry.dest.visa
      ) {
        out[id] = entry.dest;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveAiProfile(dest: Destination) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(AI_PROFILES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, CachedProfile>) : {};
    parsed[dest.id] = { at: Date.now(), dest };
    const entries = Object.entries(parsed)
      .sort((a, b) => (b[1]?.at ?? 0) - (a[1]?.at ?? 0))
      .slice(0, AI_PROFILES_MAX);
    window.localStorage.setItem(AI_PROFILES_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* safe to skip */
  }
}
