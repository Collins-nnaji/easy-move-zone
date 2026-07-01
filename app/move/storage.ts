// Remembers where a returning, signed-in user left off in /move so reopening
// the app drops them back at their destination instead of the welcome screen.

const KEY = "emz:flow";

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
