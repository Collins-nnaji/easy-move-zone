import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DrawPath, FadeIn, Stagger, useStartInView } from './motion';
import { useIsCompact } from '../utils/useMediaQuery';

/**
 * The header of the Property pages (Buy, Rent, Sell, Saved): the Buy / Rent /
 * Sell switch, a heading and one line — on a compact grey band with a drawn
 * street of homes on the right instead of a photo. It costs nothing to load
 * and keeps the grid close to the top of the page.
 *
 * `kind` picks the street's one accent: a price tag (buy), a key (rent), a
 * "sold" sign (sell) or a heart (saved). Phones and tablets get the plain
 * band — the art is not mounted there at all.
 */

export const PropertyBand = styled.section`
  position: relative;
  overflow: hidden;
  background:
    var(--color-bg);
  border-bottom: 1px solid var(--color-line);
`;

const Inner = styled(Stagger)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 1.4rem 2.5rem 1.3rem;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 440px);
  gap: 2rem;
  align-items: center;
  color: var(--color-ink);

  h1 { color: var(--color-ink); max-width: 640px; margin: 0; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 550; letter-spacing: -.03em; line-height: 1.08; }
  .intro, p { max-width: 560px; color: var(--color-ink-muted); font-size: .96rem; line-height: 1.55; margin: .6rem 0 0; }
  .aside { margin-top: .75rem; font-size: .9rem; color: var(--color-ink-muted); }
  .aside a { display: inline-flex; align-items: center; gap: .35rem; color: var(--color-green-deep); font-weight: 700; }
  .aside a:hover { color: var(--color-green-forest); }
  .spot { display: none; }

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); min-height: 0; }

  @media (max-width: 720px) {
    padding: 1.2rem 1rem 1.3rem;
    h1 { font-size: 1.5rem; line-height: 1.1; }
    .intro { display: none; }
    p { font-size: .88rem; line-height: 1.45; }
    .spot { display: block; position: absolute; right: .75rem; top: 4.4rem; width: 80px; }
    ${(p) => p.$spot && 'h1, > div > p { padding-right: 92px; }'}
  }
`;

const ArtWrap = styled.div`
  justify-self: end;
  width: 100%;
  svg { width: 100%; height: auto; display: block; overflow: visible; }
`;

const INK = { stroke: 'var(--color-ink)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

/** One building of the street: a body, a roof line and lit windows. */
function Building({ x, w, h, roof = 'flat', tone = '#fff', windows = [], play, delay = 0 }) {
  const top = 150 - h;
  const roofPath = roof === 'pitched'
    ? `M${x - 4} ${top + 2} L${x + w / 2} ${top - 22} L${x + w + 4} ${top + 2}`
    : `M${x} ${top} H${x + w}`;
  return (
    <g>
      <FadeIn play={play} delay={delay} y={8}>
        <rect x={x} y={top} width={w} height={h} rx="2" fill={tone} />
        {windows.map(([wx, wy, lit]) => (
          <rect
            key={`${wx}-${wy}`}
            x={x + wx}
            y={top + wy}
            width="9"
            height="9"
            rx="1.5"
            fill={lit ? 'var(--color-green)' : 'var(--color-green-soft)'}
            opacity={lit ? 0.9 : 1}
          />
        ))}
      </FadeIn>
      <DrawPath play={play} d={roofPath} delay={delay + 0.15} {...INK} />
      <DrawPath play={play} d={`M${x} ${top + (roof === 'pitched' ? 2 : 0)} V150 M${x + w} ${top + (roof === 'pitched' ? 2 : 0)} V150`} delay={delay + 0.25} {...INK} />
    </g>
  );
}

function Accent({ kind, play }) {
  const float = play ? { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.4 } } : undefined;
  switch (kind) {
    case 'rent':
      return (
        <FadeIn play={play} delay={1.1}>
          <motion.g animate={float}>
            <circle cx="330" cy="40" r="20" fill="var(--color-green-deep)" />
            <circle cx="324" cy="40" r="6" fill="none" stroke="#fff" strokeWidth="2.4" />
            <path d="M330 40 H342 M338 40 V45" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </motion.g>
        </FadeIn>
      );
    case 'sell':
      return (
        <FadeIn play={play} delay={1.1}>
          <path d="M318 150 V92" {...INK} />
          <motion.g animate={float}>
            <rect x="290" y="62" width="58" height="30" rx="4" fill="var(--color-green-deep)" />
            <text x="319" y="82" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="#fff">SOLD</text>
          </motion.g>
        </FadeIn>
      );
    case 'saved':
      return (
        <FadeIn play={play} delay={1.1}>
          <motion.g animate={float}>
            <circle cx="330" cy="40" r="20" fill="var(--color-green-deep)" />
            <path d="M330 50 C318 42 320 32 326 32 C329 32 330 35 330 35 C330 35 331 32 334 32 C340 32 342 42 330 50 Z" fill="#fff" />
          </motion.g>
        </FadeIn>
      );
    default:
      return (
        <FadeIn play={play} delay={1.1}>
          <motion.g animate={float}>
            <path d="M306 28 H346 A4 4 0 0 1 350 32 V48 A4 4 0 0 1 346 52 H306 L296 40 Z" fill="var(--color-green-deep)" />
            <circle cx="306" cy="40" r="3" fill="#fff" />
            <text x="328" y="45" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="#fff">₦</text>
          </motion.g>
        </FadeIn>
      );
  }
}

export function StreetArt({ kind = 'buy' }) {
  const [ref, play] = useStartInView();
  return (
    <ArtWrap ref={ref} aria-hidden="true">
      <svg viewBox="0 0 440 170">
        <FadeIn play={play} y={0} duration={0.6}>
          <circle cx="98" cy="56" r="34" fill="var(--color-green-soft)" />
          <rect x="140" y="20" width="300" height="130" rx="65" fill="var(--color-green-wash)" opacity="0.7" />
        </FadeIn>
        <Building x={18} w={64} h={78} roof="pitched" play={play} delay={0.1} windows={[[12, 18, true], [42, 18, false], [12, 44, false], [42, 44, true]]} />
        <Building x={96} w={70} h={118} tone="var(--color-bg-panel)" play={play} delay={0.25} windows={[[12, 14, true], [30, 14, false], [48, 14, true], [12, 38, false], [30, 38, true], [48, 38, false], [12, 62, true], [30, 62, false], [48, 62, true], [12, 86, false], [48, 86, true]]} />
        <Building x={180} w={88} h={92} roof="pitched" play={play} delay={0.4} windows={[[14, 22, true], [64, 22, true], [14, 52, false], [64, 52, true]]} />
        <Building x={282} w={60} h={64} play={play} delay={0.55} windows={[[10, 14, false], [40, 14, true], [10, 38, true]]} />
        <Building x={356} w={66} h={100} roof="pitched" tone="var(--color-bg-panel)" play={play} delay={0.7} windows={[[12, 18, true], [44, 18, false], [12, 46, false], [44, 46, true], [12, 74, true]]} />
        {/* Front doors. */}
        <FadeIn play={play} delay={0.9} y={0}>
          <rect x="44" y="128" width="12" height="22" rx="2" fill="var(--color-green-deep)" />
          <rect x="216" y="126" width="16" height="24" rx="2" fill="var(--color-green-deep)" />
          <rect x="382" y="128" width="13" height="22" rx="2" fill="var(--color-green-deep)" />
        </FadeIn>
        <DrawPath play={play} d="M0 150 H440" delay={0} {...INK} stroke="var(--color-line-strong)" />
        <Accent kind={kind} play={play} />
      </svg>
    </ArtWrap>
  );
}

/**
 * The band itself. Children are the left column (switch, h1, one line);
 * `spot` is an optional phone picture (a <SpotArt className="spot">).
 */
export default function PropertyHeader({ kind = 'buy', spot = null, children }) {
  const compact = useIsCompact();
  return (
    <PropertyBand>
      <Inner $spot={Boolean(spot)}>
        {spot}
        <div>{children}</div>
        {!compact && <StreetArt kind={kind} />}
      </Inner>
    </PropertyBand>
  );
}
