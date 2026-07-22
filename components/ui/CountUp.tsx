"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type CountUpProps = {
  value: number;
  /** Formats the interpolated number for display. Defaults to a rounded integer. */
  format?: (n: number) => string;
  /** Animation duration in ms. Default 800. */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
};

function cubicEaseOut(t: number): number {
  // Approximates easeOutExpo (0.16, 1, 0.3, 1) closely enough for a number tween.
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a number from its previous value to the new one whenever `value`
 * changes. Respects prefers-reduced-motion (renders the value directly).
 */
export function CountUp({ value, format, duration = 800, className, style }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion && duration > 0;
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const fmt = format ?? ((n: number) => String(Math.round(n)));

  useEffect(() => {
    if (!animate) {
      // No animation: keep the ref in sync so a later enable starts from here.
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // setState here runs inside requestAnimationFrame (async), not synchronously.
      setDisplay(from + (to - from) * cubicEaseOut(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration, animate]);

  return (
    <span className={className} style={style}>
      {fmt(animate ? display : value)}
    </span>
  );
}
