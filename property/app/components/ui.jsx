import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Small UI kit in the shadcn/ui spirit — composable primitives with quiet
 * motion — implemented in styled-components so it inherits this app's design
 * tokens. (Literal shadcn/ui needs Tailwind and Radix, which this project
 * does not use.)
 *
 * Everything here is presentational: no data fetching, no business rules.
 */

/* ── Motion presets ────────────────────────────────────────────────── */

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

/*
 * Gotcha when using `stagger`: if the same styled(motion.*) container is
 * rendered in both a loading branch and a loaded branch at the same position,
 * React reuses the instance. Its entrance has already run, so variant children
 * swapped in afterwards stay stuck at `hidden`. Give the two branches distinct
 * `key`s to force a clean remount.
 */

export const springy = { type: 'spring', stiffness: 380, damping: 30 };

/* ── Card ──────────────────────────────────────────────────────────── */

export const Card = styled(motion.section)`
  position: relative;
  background: ${(p) => (p.$dark ? 'linear-gradient(160deg, #b85a30 0%, #111111 100%)' : '#fff')};
  color: ${(p) => (p.$dark ? '#fff' : 'var(--color-ink)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.14)' : 'var(--color-line)')};
  border-radius: 20px;
  padding: ${(p) => (p.$tight ? '1.15rem 1.2rem 1.25rem' : '1.6rem 1.65rem 1.75rem')};
  box-shadow: ${(p) => (p.$dark ? '0 22px 44px -24px rgba(17, 17, 17, 0.5)' : 'var(--shadow-card)')};
  overflow: hidden;

  @media (max-width: 560px) { padding: ${(p) => (p.$tight ? '0.9rem 0.95rem 1rem' : '1rem 0.95rem 1.1rem')}; border-radius: 14px; }

  ${(p) => p.$hover && css`
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lift);
      border-color: rgba(184, 90, 48, 0.4);
    }
  `}
`;

export const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: ${(p) => (p.$flush ? '0' : '1.15rem')};
`;

export const CardTitle = styled.h2`
  font-family: var(--font-display);
  font-size: ${(p) => (p.$sm ? '1.2rem' : '1.55rem')};
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0;
  color: inherit;
`;

export const CardDesc = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.93rem;
  line-height: 1.5;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.72)' : 'var(--color-ink-muted)')};
  max-width: 62ch;
`;

export const Mono = styled.span`
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
`;

/* ── Badge ─────────────────────────────────────────────────────────── */

const BADGE_TONES = {
  default: { bg: 'var(--color-bg-panel)', fg: 'var(--color-ink-muted)', bd: 'var(--color-line-strong)' },
  success: { bg: 'var(--color-green-chip)', fg: 'var(--color-green-deep)', bd: 'rgba(184, 90, 48,0.3)' },
  warn: { bg: '#fef3c7', fg: '#92400e', bd: 'rgba(180,83,9,0.28)' },
  danger: { bg: '#fee2e2', fg: '#b91c1c', bd: 'rgba(185,28,28,0.25)' },
  info: { bg: '#e0f2fe', fg: '#075985', bd: 'rgba(3,105,161,0.25)' },
  dark: { bg: 'var(--color-green-deep)', fg: '#fff', bd: 'var(--color-green-deep)' },
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
  background: ${(p) => (BADGE_TONES[p.$tone] || BADGE_TONES.default).bg};
  color: ${(p) => (BADGE_TONES[p.$tone] || BADGE_TONES.default).fg};
  border: 1px solid ${(p) => (BADGE_TONES[p.$tone] || BADGE_TONES.default).bd};
`;

/* ── Tabs ──────────────────────────────────────────────────────────── */

const TabBar = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.3rem;
  background: var(--color-bg-panel);
  border: 1px solid var(--color-line);
  border-radius: 999px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabBtn = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.15rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: ${(p) => (p.$active ? 'var(--color-ink)' : 'var(--color-ink-muted)')};
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  white-space: nowrap;
  cursor: pointer;
  z-index: 1;
  transition: color 0.18s ease;
  &:hover { color: var(--color-ink); }

  svg { font-size: 0.9rem; }
`;

const TabPill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(16, 18, 24, 0.12);
  z-index: -1;
`;

/**
 * Animated tab strip. The active pill slides between tabs via a shared
 * layoutId rather than a CSS transition, so it tracks any tab width.
 * @param {{id: string, label: string, icon?: React.ComponentType, count?: number}[]} tabs
 */
export function Tabs({ tabs, active, onChange, idPrefix = 'tab' }) {
  return (
    <TabBar role="tablist">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <TabBtn
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            $active={isActive}
            onClick={() => onChange(t.id)}
          >
            {isActive && <TabPill layoutId={`${idPrefix}-pill`} transition={springy} />}
            {t.icon ? <t.icon /> : null}
            {t.label}
            {typeof t.count === 'number' && t.count > 0 && (
              <Badge $tone={isActive ? 'success' : 'default'}>{t.count}</Badge>
            )}
          </TabBtn>
        );
      })}
    </TabBar>
  );
}

/* ── Segmented control (single-select slicer) ──────────────────────── */

const SegWrap = styled.div`
  display: inline-flex;
  padding: 0.22rem;
  border-radius: 999px;
  background: var(--color-bg-panel);
  border: 1px solid var(--color-line);
`;

const SegBtn = styled.button`
  position: relative;
  border: none;
  background: transparent;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  color: ${(p) => (p.$active ? 'var(--color-ink)' : 'var(--color-ink-muted)')};
  cursor: pointer;
  text-transform: capitalize;
  z-index: 1;
  &:hover { color: var(--color-ink); }
`;

const SegPill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(16, 18, 24, 0.14);
  z-index: -1;
`;

export function Segmented({ options, value, onChange, name }) {
  return (
    <SegWrap role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <SegBtn
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            $active={active}
            onClick={() => onChange(v)}
          >
            {active && <SegPill layoutId={`seg-${name}`} transition={springy} />}
            {label}
          </SegBtn>
        );
      })}
    </SegWrap>
  );
}

/* ── Toggle chips (multi-select slicer) ────────────────────────────── */

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

export const Chip = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-soft)' : '#fff')};
  color: ${(p) => (p.$active ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  font-size: 0.85rem;
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  &:hover { border-color: var(--color-green); color: var(--color-green-deep); }

  i {
    width: 8px;
    height: 8px;
    border-radius: 3px;
    background: ${(p) => p.$dot || 'currentColor'};
  }
`;

/* ── Slider ────────────────────────────────────────────────────────── */

const SliderWrap = styled.div`
  width: 100%;

  .top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .label {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
  }
  .value {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--color-ink);
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 999px;
    outline: none;
    cursor: grab;
    /* Filled track to the left of the thumb, plain track to the right. */
    background: linear-gradient(
      90deg,
      var(--color-green) 0%,
      var(--color-green) ${(p) => p.$pct}%,
      var(--color-bg-slate) ${(p) => p.$pct}%,
      var(--color-bg-slate) 100%
    );
  }
  input[type='range']:active { cursor: grabbing; }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--color-green);
    box-shadow: 0 2px 8px rgba(13, 17, 23, 0.18);
    transition: transform 0.12s ease;
  }
  input[type='range']:hover::-webkit-slider-thumb { transform: scale(1.12); }
  input[type='range']::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--color-green);
  }

  .ticks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.35rem;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.65rem;
    color: var(--color-ink-faint);
  }
`;

export function Slider({ label, min, max, step = 1, value, onChange, format = (v) => v }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <SliderWrap $pct={pct}>
      <div className="top">
        <span className="label">{label}</span>
        <span className="value">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="ticks">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </SliderWrap>
  );
}

/* ── Progress ──────────────────────────────────────────────────────── */

const ProgressTrack = styled.div`
  height: ${(p) => p.$h || 8}px;
  border-radius: 999px;
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-slate)')};
  overflow: hidden;
`;

export function Progress({ value = 0, tone = 'var(--color-green)', height, dark }) {
  return (
    <ProgressTrack $h={height} $dark={dark}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '100%', borderRadius: 999, background: tone }}
      />
    </ProgressTrack>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
`;

export const Skeleton = styled.div`
  height: ${(p) => p.$h || '16px'};
  width: ${(p) => p.$w || '100%'};
  border-radius: ${(p) => p.$r || '8px'};
  background: linear-gradient(90deg, #e7ece8 25%, #f5f8f6 37%, #e7ece8 63%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

/* ── Spinner ───────────────────────────────────────────────────────── */

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Spinner = styled.span`
  display: inline-block;
  width: ${(p) => p.$size || 14}px;
  height: ${(p) => p.$size || 14}px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: ${spin} 0.7s linear infinite;
`;

/* ── Buttons ───────────────────────────────────────────────────────── */

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  padding: ${(p) => (p.$sm ? '0.55rem 1.1rem' : '0.85rem 1.6rem')};
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  @media (max-width: 560px) {
    font-size: ${(p) => (p.$sm ? '0.83rem' : '0.88rem')};
    padding: ${(p) => (p.$sm ? '0.48rem 0.95rem' : '0.7rem 1.3rem')};
    border-radius: 999px;
  }
`;

export const Button = styled.button`
  ${buttonBase};
  border: none;
  background: var(--color-green-deep);
  color: #fff;
  &:hover:not(:disabled) {
    background: var(--color-green-forest);
    transform: translateY(-1px);
    box-shadow: 0 12px 24px -12px rgba(17, 17, 17, 0.6);
  }
`;

export const GreenButton = styled.button`
  ${buttonBase};
  border: none;
  background: var(--color-green-deep);
  color: #fff;
  &:hover:not(:disabled) { background: var(--color-green-deep); transform: translateY(-1px); }
`;

export const GhostButton = styled.button`
  ${buttonBase};
  background: #fff;
  color: var(--color-ink);
  border: 1.5px solid var(--color-line-strong);
  &:hover:not(:disabled) { color: var(--color-green-deep); border-color: var(--color-green-deep); }
`;

/* ── Stat tile with count-up ───────────────────────────────────────── */

const TileWrap = styled(motion.div)`
  position: relative;
  padding: 1.3rem 1.35rem;
  border-radius: 18px;
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'var(--color-bg-panel)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.16)' : 'var(--color-line)')};
  overflow: hidden;

  @media (max-width: 560px) { padding: 1rem 1.05rem; border-radius: 14px; }

  .k {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-sans);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.65)' : 'var(--color-ink-faint)')};
  }
  .v {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 2vw, 1.7rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-top: 0.4rem;
    color: ${(p) => {
    if (p.$tone === 'down') return '#b91c1c';
    if (p.$tone === 'up') return 'var(--color-green-deep)';
    return p.$dark ? '#fff' : 'var(--color-ink)';
  }};
  }
  .m {
    font-size: 0.83rem;
    margin-top: 0.3rem;
    color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.7)' : 'var(--color-ink-muted)')};
  }
  .spark { margin-top: 0.7rem; }
`;

/** Eases a number up on mount, and again whenever the target changes. */
export function useCountUp(target, { duration = 900 } = {}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const to = Number(target) || 0;
    const from = fromRef.current;
    if (from === to) { setDisplay(to); return undefined; }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

export function StatTile({ label, value, meta, format = (v) => v, tone, dark, icon: Icon, children }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const shown = typeof value === 'number' ? format(animated) : value;
  return (
    <TileWrap variants={fadeUp} $tone={tone} $dark={dark}>
      <div className="k">{Icon ? <Icon /> : null}{label}</div>
      <div className="v">{shown}</div>
      {meta && <div className="m">{meta}</div>}
      {children && <div className="spark">{children}</div>}
    </TileWrap>
  );
}

/* ── Sheet (slide-over detail panel) ──────────────────────────────── */

const SheetScrim = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(16, 18, 24, 0.32);
  backdrop-filter: blur(2px);
`;

const SheetPanel = styled(motion.aside)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1400;
  width: min(460px, 100vw);
  background: #fff;
  border-left: 1px solid var(--color-line);
  box-shadow: -20px 0 60px rgba(16, 18, 24, 0.16);
  display: flex;
  flex-direction: column;
`;

const SheetHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.25rem;
  border-bottom: 1px solid var(--color-line);
  flex-shrink: 0;
`;

const SheetBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
`;

const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: var(--color-bg-panel);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: var(--color-green-soft); color: var(--color-green-deep); }
`;

export function Sheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <SheetScrim
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <SheetPanel
            role="dialog"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <SheetHead>
              <div>
                <CardTitle $sm>{title}</CardTitle>
                {subtitle && <CardDesc>{subtitle}</CardDesc>}
              </div>
              <CloseBtn type="button" onClick={onClose} aria-label="Close panel">✕</CloseBtn>
            </SheetHead>
            <SheetBody>{children}</SheetBody>
          </SheetPanel>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Empty state ───────────────────────────────────────────────────── */

export const EmptyState = styled.div`
  padding: 2.25rem 1.25rem;
  text-align: center;
  color: var(--color-ink-muted);
  font-size: 0.98rem;
  line-height: 1.6;

  p { margin: 0.9rem auto 0; max-width: 46ch; }
`;

/* ── Live dot ──────────────────────────────────────────────────────── */

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
`;

export const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => p.$color || 'var(--color-green)'};
  animation: ${pulse} 1.9s ease-in-out infinite;
`;
