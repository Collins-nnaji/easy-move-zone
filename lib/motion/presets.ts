import type { Transition, Variants } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const softSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const screenTransition: Transition = {
  duration: 0.14,
  ease: easeOutExpo,
};

export const screenVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: easeOutExpo },
  },
};

export const sheetOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const sheetPanel: Variants = {
  initial: { y: "100%", opacity: 0.85 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "40%", opacity: 0 },
};

export const menuPanel: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};

/** Toasts slide up from the bottom and fade out. */
export const toastItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: softSpring },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.18, ease: easeOutExpo } },
};

/** Success checkmark that pops into place. */
export const successBurst: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, mass: 0.7 },
  },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.2, ease: easeOutExpo } },
};

/**
 * Directional slide for forward/back navigation within a flow.
 * dir = 1 → moving forward (enter from right), dir = -1 → back (enter from left).
 */
export function directionalScreen(dir: 1 | -1): Variants {
  return {
    initial: { opacity: 0, x: 24 * dir },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 * dir },
  };
}
