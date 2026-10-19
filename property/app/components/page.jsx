import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Page-level layout primitives shared by every screen.
 *
 * The app used to hand-roll a hero, a section header and a card grid on each
 * page, which is why the product read as a dozen different designs. Everything
 * here is presentational and token-driven: pages compose these instead.
 *
 * House style (EasyMoveZone): warm cream surfaces, Bricolage Grotesque for
 * headings, Plus Jakarta Sans for everything else, squared 6px CTAs in deep
 * green, small tracked-out eyebrows with an accent dot, and soft sage bands
 * (`Section $dark`, `Callout`, `StatBand`) between sections.
 */

/* ── Motion presets ────────────────────────────────────────────────── */

export const enterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const enterItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Page + section shells ─────────────────────────────────────────── */

export const PageShell = styled.div`
  background: var(--color-bg);
`;

/**
 * A band of page. `$tint` washes it in the soft brand green, `$panel` in the
 * neutral grey, `$dark` drops it to near-black and inverts its typography.
 */
export const Section = styled.section`
  position: relative;
  background: ${(p) => {
    if (p.$dark) return 'var(--color-band)';
    if (p.$tint) return 'var(--color-green-wash)';
    if (p.$panel) return 'var(--color-bg-panel)';
    return 'var(--color-bg)';
  }};
  border-top: ${(p) => {
    if (!p.$divide) return 'none';
    return p.$dark ? '1px solid var(--color-black-line)' : '1px solid var(--color-line)';
  }};
  padding: ${(p) => (p.$sm ? '2.75rem 0' : '4rem 0')};

  /* On black, headings, body copy and eyebrows all invert together so a page
     can drop a dark band in without every child needing an override. */
  ${(p) => p.$dark && `
    h1, h2, h3, h4, h5, h6 { color: var(--color-on-black); }
    p { color: var(--color-on-black-muted); }
  `}

  @media (max-width: 720px) {
    padding: ${(p) => (p.$sm ? '2rem 0' : '2.75rem 0')};
  }
`;

export const Inner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;

  @media (max-width: 720px) { padding: 0 1.25rem; }
`;

/* ── Section headings ──────────────────────────────────────────────── */

export const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-eyebrow);
  margin-bottom: 0.9rem;
`;

/** A green pill used to flag one word inside a heading or a stat strip. */
export const AccentChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-pill);
  background: var(--color-green-chip);
  color: var(--color-green-forest);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

export const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 3.2vw, 2.75rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.12;
  margin: 0;
`;

/*
 * Supporting copy under a section title. Phones show the title alone — a
 * website read on a phone should scan as headings, figures and pictures, not
 * paragraphs. Pass `$keep` where the sentence is the content itself.
 */
export const SectionSub = styled.p`
  margin: 0.7rem 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  max-width: 62ch;

  @media (max-width: 720px) { ${(p) => (p.$keep ? 'font-size: 0.95rem;' : 'display: none;')} }
`;

export const SectionHead = styled.div`
  margin-bottom: 2.25rem;
  text-align: ${(p) => (p.$center ? 'center' : 'left')};
  ${(p) => p.$center && 'display: flex; flex-direction: column; align-items: center;'}
  ${(p) => p.$center && `${SectionSub} { margin-left: auto; margin-right: auto; }`}

  @media (max-width: 720px) { margin-bottom: 1.75rem; }
`;

/* ── Buttons (links) ───────────────────────────────────────────────── */

const actionBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  min-height: 52px;
  padding: 0.95rem 1.45rem;
  border-radius: var(--radius-button);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, color 0.16s ease;

  @media (max-width: 720px) {
    padding: 0.85rem 1.35rem;
    font-size: 0.92rem;
  }
`;

export const PrimaryAction = styled(Link)`
  ${actionBase};
  background: var(--color-green-deep);
  color: #fff;
  border: 1.5px solid var(--color-green-deep);

  &:hover {
    color: #fff;
    background: var(--color-green-forest);
    border-color: var(--color-green-forest);
    transform: translateY(-2px);
  }
`;

export const SecondaryAction = styled(Link)`
  ${actionBase};
  background: #fff;
  color: var(--color-ink);
  border: 1.5px solid var(--color-line-strong);

  &:hover {
    color: var(--color-accent-ink);
    border-color: var(--color-green-deep);
    transform: translateY(-2px);
  }
`;

export const ActionRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  /* On a phone the CTAs read as app buttons: one per row, full width. */
  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
    a { width: 100%; }
  }
`;

/* ── Hero ──────────────────────────────────────────────────────────── */

export const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: var(--hero-bg);
  padding: ${(p) => (p.$sm ? '2.25rem 0 2.25rem' : '3rem 0 3.25rem')};

  @media (max-width: 720px) {
    padding: ${(p) => (p.$sm ? '1.1rem 0 1.25rem' : '1.35rem 0 1.5rem')};
  }
`;

export const HeroGrid = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: ${(p) => (p.$single ? 'minmax(0, 1fr)' : 'minmax(0, 1.05fr) minmax(0, 0.95fr)')};
  gap: 3rem;
  align-items: center;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 2rem;
  }
  @media (max-width: 720px) { padding: 0 1.25rem; }
`;

export const HeroCopy = styled(motion.div)`
  max-width: ${(p) => (p.$wide ? '46rem' : '38rem')};
`;

/* EasyMoveZone eyebrow: tracked-out caps with a small accent dot, no pill. */
export const Eyebrow = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-eyebrow);
  margin-bottom: 1.4rem;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-accent);
    flex-shrink: 0;
  }
  > svg { display: none; }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.2rem, 4.6vw, 3.9rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.055em;
  margin: 0 0 1.4rem;

  @media (max-width: 720px) { font-size: clamp(2rem, 9vw, 2.5rem); line-height: 1.05; }
`;

export const TitleAccent = styled.span`
  color: var(--color-green-deep);
`;

export const HeroSub = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.75;
  color: var(--color-ink-muted);
  margin: 0 0 1.6rem;
  max-width: 36rem;

  @media (max-width: 720px) { font-size: 0.92rem; line-height: 1.5; margin-bottom: 1.1rem; }
`;

/* Small row of proof points under the hero CTAs. */
export const TrustRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1.5rem;
  margin-top: 1.4rem;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--color-ink-muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  svg { color: var(--color-green); font-size: 0.95rem; flex-shrink: 0; }
`;

/* ── Stats band ────────────────────────────────────────────────────── */

/**
 * The stat strip runs on black. It is the one full-bleed dark band every page
 * gets for free, and it is what stops the marketing pages reading as a single
 * uninterrupted white scroll.
 */
export const StatBand = styled.div`
  background: var(--color-band);
  border-top: 1px solid var(--color-black-line);
  border-bottom: 1px solid var(--color-black-line);
`;

export const StatBandInner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 1.85rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  text-align: center;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 1.35rem 1.25rem;
    gap: 1.1rem;
  }
`;

export const StatNum = styled.div`
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 2.8vw, 2.3rem);
  font-weight: 600;
  letter-spacing: -0.045em;
  color: var(--color-green-deep);
  line-height: 1.15;
`;

export const StatLabel = styled.div`
  margin-top: 0.3rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-on-black-muted);
`;

/* ── Feature cards ─────────────────────────────────────────────────── */

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 3}, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

export const FeatureCard = styled(motion.div)`
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.65rem;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: rgba(47, 93, 80, 0.3);
  }

  h3 {
    font-size: 1.08rem;
    margin-bottom: 0.4rem;
  }
  p {
    font-size: 0.94rem;
    line-height: 1.6;
    color: var(--color-ink-muted);
  }

  @media (max-width: 720px) { padding: 1.35rem 1.25rem; }
`;

export const IconBubble = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--color-green-soft);
  color: var(--color-green-deep);
  font-size: 1rem;
  margin-bottom: 0.95rem;
`;

/* ── Checklist ─────────────────────────────────────────────────────── */

/* Lists animate themselves: the list watches the viewport, items tick in in turn. */
const listMotion = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, amount: 'some' },
  variants: { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } },
};
const itemMotion = {
  variants: {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  },
};

export const CheckGrid = styled(motion.ul).attrs(listMotion)`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 2}, minmax(0, 1fr));
  gap: 0.75rem 1.75rem;

  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); }
`;

export const CheckItem = styled(motion.li).attrs(itemMotion)`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.94rem;
  line-height: 1.55;
  color: var(--color-ink);

  svg {
    color: var(--color-green);
    flex-shrink: 0;
    margin-top: 0.25rem;
    font-size: 0.9rem;
  }
`;

/* ── Numbered steps ────────────────────────────────────────────────── */

export const StepGrid = styled.ol`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 4}, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }
`;

export const Step = styled.li`
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.4rem;

  h3 { font-size: 1.02rem; margin-bottom: 0.35rem; }
  p { font-size: 0.92rem; line-height: 1.6; color: var(--color-ink-muted); }
`;

export const StepNum = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-band);
  color: var(--color-green-deep);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
`;

/* ── Callout band ──────────────────────────────────────────────────── */

export const Callout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.75rem;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  background: var(--color-band);
  color: var(--color-on-black);
  border-radius: var(--radius-xl);
  padding: 2.25rem 2.5rem;

  /* A green wash in the corner keeps the black band on-brand rather than
     reading as a stray dark rectangle. */
  &::after {
    content: '';
    position: absolute;
    inset: auto -10% -60% auto;
    width: 460px;
    height: 460px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(47, 93, 80, 0.3), transparent 65%);
    pointer-events: none;
  }

  > * { position: relative; z-index: 1; }

  h2, h3 { color: var(--color-on-black); }
  p { color: var(--color-on-black-muted); max-width: 52ch; margin-top: 0.5rem; }

  @media (max-width: 720px) { padding: 1.6rem 1.35rem; border-radius: var(--radius-lg); }
`;

export const CalloutAction = styled(Link)`
  ${actionBase};
  background: var(--color-green-deep);
  color: #fff;
  border: 1.5px solid var(--color-green-deep);

  &:hover {
    color: #fff;
    background: var(--color-green-forest);
    border-color: var(--color-green-forest);
    transform: translateY(-2px);
  }
`;

/* ── Panels ────────────────────────────────────────────────────────── */

/** A plain white content panel — the workhorse container inside app pages. */
export const Panel = styled.div`
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: ${(p) => (p.$tight ? '1.1rem 1.2rem' : '1.5rem 1.6rem')};
  box-shadow: var(--shadow-soft);

  @media (max-width: 720px) { padding: ${(p) => (p.$tight ? '0.95rem 1rem' : '1.2rem 1.15rem')}; }
`;

/** A soft-tinted panel for figures, summaries and results. */
export const TintPanel = styled(Panel)`
  background: var(--color-green-wash);
  border-color: rgba(47, 93, 80, 0.18);
  box-shadow: none;
`;

/** A near-black panel — for figures and summaries that need to carry weight. */
export const DarkPanel = styled(Panel)`
  background: var(--color-band);
  border-color: var(--color-black-line);
  color: var(--color-on-black);
  box-shadow: none;

  h2, h3, h4 { color: var(--color-on-black); }
  p { color: var(--color-on-black-muted); }
`;
