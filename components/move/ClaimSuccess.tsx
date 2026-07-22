"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { successBurst } from "@/lib/motion/presets";

const CONFETTI_COLORS = ["#e0511f", "#f3aa79", "#2f7d4f", "#1f6f78", "#f0c419"];

type ClaimSuccessProps = {
  open: boolean;
  label?: string;
  onDone?: () => void;
};

/**
 * A one-shot celebration overlay for the "job claimed" moment.
 * Confetti + a springing checkmark. Falls back to a simple fade when the
 * user prefers reduced motion.
 */
export function ClaimSuccess({ open, label = "Job claimed", onDone }: ClaimSuccessProps) {
  const reduceMotion = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        angle: (i / 14) * Math.PI * 2,
        distance: 90 + (i % 4) * 26,
        rotate: (i % 2 === 0 ? 1 : -1) * (120 + i * 18),
        size: 7 + (i % 3) * 3,
      })),
    [],
  );

  return (
    <AnimatePresence onExitComplete={onDone}>
      {open ? (
        <motion.div
          key="claim-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            background: "rgba(27,35,30,0.18)",
            backdropFilter: "blur(1px)",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!reduceMotion &&
              pieces.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.distance,
                    y: Math.sin(p.angle) * p.distance,
                    opacity: 0,
                    rotate: p.rotate,
                    scale: 0.6,
                  }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.size,
                    borderRadius: 2,
                    background: p.color,
                  }}
                />
              ))}
            <motion.div
              variants={reduceMotion ? undefined : successBurst}
              initial={reduceMotion ? { opacity: 0 } : "initial"}
              animate={reduceMotion ? { opacity: 1 } : "animate"}
              exit={reduceMotion ? { opacity: 0 } : "exit"}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  background: "#2f7d4f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 12px 34px rgba(47,125,79,.4)",
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-hanken), system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  textShadow: "0 1px 6px rgba(0,0,0,.35)",
                }}
              >
                {label}
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
