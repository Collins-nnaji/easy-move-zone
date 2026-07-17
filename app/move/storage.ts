// Remembers where a returning, signed-in user left off in /move so reopening
// the app drops them back at their destination instead of the welcome screen.

import type { Destination } from "./data";

const KEY = "emz:flow";
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
