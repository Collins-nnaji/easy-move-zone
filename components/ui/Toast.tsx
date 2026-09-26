"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { toastItem } from "@/lib/motion/presets";

type ToastKind = "success" | "error" | "info";

type ToastAction = { label: string; onClick: () => void };

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
  action?: ToastAction;
};

type ShowToastInput = {
  message: string;
  kind?: ToastKind;
  /** ms before auto-dismiss. Pass 0 to keep until dismissed. Default 4000. */
  duration?: number;
  action?: ToastAction;
};

type ToastApi = {
  toast: (input: ShowToastInput) => number;
  success: (message: string, opts?: Omit<ShowToastInput, "message" | "kind">) => number;
  error: (message: string, opts?: Omit<ShowToastInput, "message" | "kind">) => number;
  info: (message: string, opts?: Omit<ShowToastInput, "message" | "kind">) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const KIND_STYLE: Record<
  ToastKind,
  { icon: typeof Info; bg: string; border: string; fg: string; accent: string }
> = {
  success: { icon: CheckCircle2, bg: "#eef6ec", border: "#cfe6cf", fg: "#256b41", accent: "#2f7d4f" },
  error: { icon: AlertCircle, bg: "#fbeae0", border: "#f3d6c4", fg: "#9c3f15", accent: "#c0492a" },
  info: { icon: Info, bg: "#eaf2f4", border: "#cfe2e6", fg: "#1f5f6b", accent: "#1f6f78" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ message, kind = "info", duration = 4000, action }: ShowToastInput) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, kind, message, action }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (message, opts) => toast({ message, kind: "success", ...opts }),
      error: (message, opts) => toast({ message, kind: "error", ...opts }),
      info: (message, opts) => toast({ message, kind: "info", ...opts }),
      dismiss,
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">{children}</div>
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "max(16px, env(safe-area-inset-bottom))",
        zIndex: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const style = KIND_STYLE[t.kind];
          const Icon = style.icon;
          return (
            <motion.div
              key={t.id}
              layout={!reduceMotion}
              variants={reduceMotion ? undefined : toastItem}
              initial={reduceMotion ? { opacity: 0 } : "initial"}
              animate={reduceMotion ? { opacity: 1 } : "animate"}
              exit={reduceMotion ? { opacity: 0 } : "exit"}
              role={t.kind === "error" ? "alert" : "status"}
              style={{
                pointerEvents: "auto",
                width: "100%",
                maxWidth: 420,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 14,
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: style.fg,
                boxShadow: "0 10px 30px rgba(0,0,0,.14)",
                fontFamily: "var(--font-hanken), system-ui, sans-serif",
                fontSize: 13.5,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              <Icon size={18} style={{ color: style.accent, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>{t.message}</span>
              {t.action ? (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    onDismiss(t.id);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: "6px 10px",
                    borderRadius: 9,
                    border: "none",
                    background: style.accent,
                    color: "#fff",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t.action.label}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => onDismiss(t.id)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  padding: 4,
                  border: "none",
                  background: "transparent",
                  color: style.fg,
                  opacity: 0.6,
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Access the toast API. Returns a no-op fallback if used outside a ToastProvider
 * so components stay resilient (e.g. in isolated tests or storybook).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  const noop = () => 0;
  return {
    toast: noop,
    success: noop,
    error: noop,
    info: noop,
    dismiss: () => undefined,
  };
}
