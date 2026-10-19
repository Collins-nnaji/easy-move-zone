import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Shared motion wrappers. Every entrance on the marketing pages goes through
 * these so the timing reads as one system, and so `prefers-reduced-motion`
 * is honoured in one place rather than per component.
 */

const EASE = [0.22, 1, 0.36, 1];

/** Fades and lifts its children in the first time they scroll into view. */
/*
 * `amount` defaults to 'some' (any pixel on screen) rather than a fraction:
 * a fraction can never be met by a block taller than the phone screen
 * divided by it, and that block would stay invisible for good.
 */
export function Reveal({ children, delay = 0, y = 26, once = true, amount = 'some', className, style, as = 'div', ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) return <Comp className={className} style={style} {...rest}>{children}</Comp>;
  // Rise, settle and scale in from 97% — enough to feel like the page is
  // assembling as you scroll, without the jitter of a bounce.
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** A container whose direct `StaggerItem` children enter one after another. */
export function Stagger({ children, gap = 0.07, delay = 0.05, once = true, amount = 'some', className, style, as = 'div', ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export function StaggerItem({ children, className, style, as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return <Comp className={className} style={style} variants={staggerItem} {...rest}>{children}</Comp>;
}

/*
 * SVG pieces never watch the viewport themselves: iOS Safari does not
 * reliably report intersections for elements inside an <svg>, which left
 * illustrations blank on iPhones. The illustration observes its HTML wrapper
 * (see `useStartInView`) and passes `play`; omit `play` to start on mount.
 */

/** Observe an HTML wrapper and report, once, that it has been on screen. */
export function useStartInView(enabled = true) {
  const ref = React.useRef(null);
  const seen = useInView(ref, { once: true, amount: 'some' });
  return [ref, enabled ? seen : true];
}

/** An SVG path that draws itself. Used by the illustrations in graphics.jsx. */
export function DrawPath({ d, delay = 0, duration = 0.9, play = true, ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) return <path d={d} {...rest} />;
  const anim = { pathLength: 1, opacity: 1, transition: { pathLength: { duration, delay, ease: EASE }, opacity: { duration: 0.2, delay } } };
  return (
    <motion.path
      d={d}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={play ? anim : undefined}
      {...rest}
    />
  );
}

/** Fades an SVG group (or any motion element) in with a small rise. */
export function FadeIn({ delay = 0, duration = 0.45, play = true, y = 6, as = 'g', children, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.g;
  if (reduce) return <Comp {...rest}>{children}</Comp>;
  const anim = { opacity: 1, y: 0, transition: { duration, delay, ease: EASE } };
  return (
    <Comp
      initial={{ opacity: 0, y }}
      animate={play ? anim : undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** A soft, looping pulse — for "live" markers. */
export function Pulse({ children, as = 'g', scale = 1.08, duration = 1.9, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.g;
  if (reduce) return <Comp {...rest}>{children}</Comp>;
  return (
    <Comp animate={{ scale: [1, scale, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration, repeat: Infinity, ease: 'easeInOut' }} {...rest}>
      {children}
    </Comp>
  );
}
