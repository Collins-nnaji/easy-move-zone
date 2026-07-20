"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sheetOverlay, sheetPanel, softSpring } from "@/lib/motion/presets";

type AnimatedSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/** Bottom sheet with fade overlay + spring panel (desktop centers via CSS). */
export function AnimatedSheet({ open, onClose, children }: AnimatedSheetProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="move-overlay move-overlay--sheet"
          variants={reduceMotion ? undefined : sheetOverlay}
          initial={reduceMotion ? false : "initial"}
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="move-sheet"
            variants={reduceMotion ? undefined : sheetPanel}
            initial={reduceMotion ? false : "initial"}
            animate="animate"
            exit="exit"
            transition={softSpring}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="move-sheet-handle" />
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
