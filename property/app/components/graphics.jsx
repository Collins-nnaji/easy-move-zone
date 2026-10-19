import React from 'react';
import styled from 'styled-components';
import { motion, useReducedMotion } from 'framer-motion';
import { PLAN_RECOMMENDATIONS, PORTFOLIO_RECOMMENDATION } from '../config/landlord';
import { DrawPath, FadeIn, Pulse, useStartInView } from './motion';
import { useCountUp } from './ui';

/**
 * Inline SVG graphics used in place of explanatory paragraphs.
 *
 * All of them draw from the same design tokens as the rest of the app and
 * carry no external assets, so they inherit the light/grey/green look and
 * cost nothing to load. Each one is decorative-with-meaning: it encodes real
 * numbers (rent, fees, steps) rather than filling space.
 */

/* ── Involvement ladder ───────────────────────────────── */

const SpectrumWrap = styled.div`
  width: 100%;
  svg { width: 100%; height: auto; display: block; }
`;

/** The four plans as one ladder from "I run it" to "I never think about it". */
const LADDER = [...PLAN_RECOMMENDATIONS, PORTFOLIO_RECOMMENDATION];

/**
 * How much of the job each plan takes off the owner, as one continuous
 * spectrum with a marker on the recommended plan. Replaces a paragraph
 * explaining what the plans are.
 */
export function InvolvementSpectrum({ activePlan = null }) {
  const w = 900;
  const gap = 8;
  const segW = (w - gap * (LADDER.length - 1)) / LADDER.length;
  const activeIndex = LADDER.findIndex((p) => p.key === activePlan);
  /* Light-to-deep green ramp: the more we take on, the deeper the block. */
  const RAMP = ['#86efac', '#4ade80', '#426f62', '#2f5d50'];
  const HANDS_OFF = ['You run it', 'We collect', 'We run it', 'We run all of it'];

  return (
    <SpectrumWrap>
      <svg viewBox={`0 0 ${w} 96`} role="img" aria-label="Management plans from tenant find to full portfolio management">
        {LADDER.map((p, i) => {
          const x = i * (segW + gap);
          const active = i === activeIndex;
          return (
            <g key={p.key}>
              <rect
                x={x}
                y={active ? 26 : 32}
                width={segW}
                height={active ? 26 : 14}
                rx={active ? 13 : 7}
                fill={RAMP[i]}
                opacity={activeIndex === -1 ? 0.85 : active ? 1 : 0.28}
              />
              <text
                x={x + segW / 2}
                y={72}
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontSize="17"
                fontWeight={active ? 800 : 600}
                fill={active || activeIndex === -1 ? 'var(--color-ink)' : 'var(--color-ink-faint)'}
              >
                {p.label}
              </text>
              <text
                x={x + segW / 2}
                y={90}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="13"
                fill={active ? 'var(--color-green-deep)' : 'var(--color-ink-faint)'}
                opacity={active ? 1 : 0.85}
              >
                {HANDS_OFF[i]}
              </text>
              {active && (
                <polygon
                  points={`${x + segW / 2 - 7},18 ${x + segW / 2 + 7},18 ${x + segW / 2},4`}
                  transform={`rotate(180 ${x + segW / 2} 11)`}
                  fill="var(--color-ink)"
                />
              )}
            </g>
          );
        })}
      </svg>
    </SpectrumWrap>
  );
}

/* ── Rent flow ─────────────────────────────────────────── */

const FlowWrap = styled.div`
  svg { width: 100%; height: auto; display: block; }
`;

/**
 * Where the rent goes. One arrow from the tenant through us to the owner, and
 * a crossed-out arrow from the contractors — the whole "nobody else pays us"
 * argument without the paragraph.
 */
export function RentFlow() {
  return (
    <FlowWrap>
      <svg viewBox="0 0 320 168" role="img" aria-label="Rent flows from the tenant through us to you. Contractors pay us nothing.">
        {/* Tenant */}
        <rect x="4" y="16" width="96" height="46" rx="12" fill="var(--color-green-soft)" stroke="rgba(47, 93, 80,0.35)" />
        <text x="52" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-ink)">Tenant</text>
        <text x="52" y="53" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-green-deep)">pays rent</text>

        {/* Contractors */}
        <rect x="4" y="104" width="96" height="46" rx="12" fill="var(--color-bg-panel)" stroke="var(--color-line-strong)" />
        <text x="52" y="126" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-ink-faint)">Contractors</text>
        <text x="52" y="141" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">No upfront fee</text>

        {/* Us */}
        <rect x="212" y="58" width="104" height="52" rx="14" fill="var(--color-green-deep)" />
        <text x="264" y="80" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">EasyMoveZone</text>
        <text x="264" y="96" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#b9d3c9">your manager</text>

        {/* Rent arrow */}
        <path d="M104 40 C 150 40, 168 70, 206 78" fill="none" stroke="var(--color-green)" strokeWidth="2.5" />
        <polygon points="206,78 196,72 197,82" fill="var(--color-green)" />

        {/* Blocked kickback arrow */}
        <path d="M104 128 C 150 128, 168 100, 200 92" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
        <g stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round">
          <line x1="146" y1="106" x2="164" y2="124" />
          <line x1="164" y1="106" x2="146" y2="124" />
        </g>
      </svg>
    </FlowWrap>
  );
}

/* ── Process track ─────────────────────────────────────────────────── */

const TrackWrap = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  counter-reset: step;
`;

const Step = styled.li`
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.85rem;
  padding-bottom: 1.05rem;
  position: relative;

  &:last-child { padding-bottom: 0; }

  /* Connector line between the numbered nodes. */
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 30px;
    bottom: 4px;
    width: 2px;
    background: linear-gradient(180deg, var(--color-green) 0%, rgba(47, 93, 80, 0.18) 100%);
  }

  .node {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => (p.$done ? 'var(--color-green)' : '#fff')};
    color: ${(p) => (p.$done ? '#fff' : 'var(--color-ink)')};
    border: 1.5px solid ${(p) => (p.$done ? 'var(--color-green)' : 'var(--color-line-strong)')};
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: 700;
    z-index: 1;
  }
  .label { display: block; font-weight: 700; font-size: 1rem; padding-top: 0.35rem; }
  .meta {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
    margin-top: 0.2rem;
  }
`;

/** @param {{label: string, meta?: string}[]} steps */
export function ProcessTrack({ steps = [], activeIndex = -1 }) {
  return (
    <TrackWrap>
      {steps.map((s, i) => (
        <Step key={s.label} $done={i <= activeIndex}>
          <span className="node">{i + 1}</span>
          <span>
            <span className="label">{s.label}</span>
            {s.meta && <span className="meta">{s.meta}</span>}
          </span>
        </Step>
      ))}
    </TrackWrap>
  );
}

/* ── Empty-portfolio art ──────────────────────────────── */

const ArtWrap = styled.div`
  svg { width: 100%; max-width: 300px; height: auto; margin: 0 auto; display: block; }
`;

/** Stand-in illustration for an owner with no property under management yet. */
export function EmptyPropertiesArt() {
  /* Rooflines of five buildings of varying height — a street with nobody in it. */
  const BUILDINGS = [
    { h: 46, w: 38 },
    { h: 62, w: 38 },
    { h: 34, w: 38 },
    { h: 54, w: 38 },
    { h: 42, w: 38 },
  ];

  return (
    <ArtWrap>
      <svg viewBox="0 0 300 132" role="img" aria-label="A street of properties with none under management yet">
        {BUILDINGS.map((b, i) => {
          const x = 18 + i * 56;
          const y = 112 - b.h;
          return (
            <g key={x}>
              <rect x={x} y={y} width={b.w} height={b.h} rx="4" fill="var(--color-green)" opacity="0.14" />
              {/* Roof */}
              <path d={`M${x - 4} ${y} L${x + b.w / 2} ${y - 11} L${x + b.w + 4} ${y}`} fill="var(--color-green)" opacity="0.3" />
              {/* Two windows and a door — all dark, nobody home */}
              <rect x={x + 7} y={y + 10} width="9" height="9" rx="2" fill="var(--color-green-deep)" opacity="0.22" />
              <rect x={x + 22} y={y + 10} width="9" height="9" rx="2" fill="var(--color-green-deep)" opacity="0.22" />
              <rect x={x + 14} y={112 - 16} width="10" height="16" rx="2" fill="var(--color-green-deep)" opacity="0.28" />
            </g>
          );
        })}
        <line x1="10" y1="112" x2="290" y2="112" stroke="var(--color-line-strong)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </ArtWrap>
  );
}

/* ── Hero: a home, and the money around it ───────────── */

const HomeArtWrap = styled.div`
  width: 100%;
  max-width: 520px;
  margin-left: auto;

  svg { width: 100%; height: auto; display: block; }

  @media (max-width: 960px) { margin: 0 auto; }

  /*
   * The coins drift on a slow loop so the illustration reads as money moving
   * rather than as a static clipart house.
   *
   * A CSS transform beats an SVG transform attribute on the same element, so
   * anything positioned by attribute gets a static outer <g> and an inner <g>
   * that carries the animation. Put both on one element and the keyframe
   * silently resets it to the origin.
   */
  .float { animation: bvFloat 5s ease-in-out infinite; }
  .float-b { animation: bvFloat 6.5s ease-in-out infinite; animation-delay: -1.6s; }
  .float-c { animation: bvFloat 5.8s ease-in-out infinite; animation-delay: -3.1s; }

  @keyframes bvFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .float, .float-b, .float-c { animation: none; }
  }
`;

/**
 * The naira sign, drawn rather than typed. A <text> glyph depends on the loaded
 * font actually carrying ₦ — miss it and every coin renders a tofu box — so the
 * mark is strokes: an N with the two crossbars.
 */
function NairaMark({ x, y, size, color = '#0a2e1c' }) {
  const u = size / 18;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${u})`}
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      fill="none"
    >
      <path d="M-5 -9 V9 M5 -9 V9 M-5 -9 L5 9" />
      <path d="M-8 -3 H8 M-8 3 H8" strokeWidth="2.2" />
    </g>
  );
}

/** One coin: a green disc, a struck highlight and a drawn naira. */
function Coin({ x, y, r, cls, delay = 0 }) {
  return (
    <g className={cls} style={{ animationDelay: `${delay}s` }}>
      <circle cx={x} cy={y} r={r} fill="#2f5d50" />
      <circle cx={x} cy={y} r={r - 3} fill="#34d97a" />
      <circle cx={x} cy={y} r={r - 3} fill="url(#coinShine)" />
      <NairaMark x={x} y={y} size={r * 0.95} />
    </g>
  );
}

/**
 * The hero illustration: one house with naira around it — the whole business in
 * a picture. It replaces the mocked-up "Property Passport" card that used to
 * sit here, which promised a specific artefact before the visitor knew what the
 * company did. (The passport now sits in the selling section, where it lands
 * after the pitch rather than before it.)
 *
 * Drawn entirely from the brand tokens, so it costs nothing to load and stays
 * on-palette if those change.
 */
export function HomeAndMoneyArt() {
  return (
    <HomeArtWrap>
      <svg viewBox="0 0 520 356" role="img" aria-label="A home with naira coins and a rising value chart around it">
        <defs>
          <linearGradient id="bvSkyWash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcf0e4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bvRoof" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f5d50" />
            <stop offset="100%" stopColor="#234b40" />
          </linearGradient>
          <linearGradient id="bvWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef7f1" />
          </linearGradient>
          <linearGradient id="coinShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bvChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fb5a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8fb5a8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Backdrop, and the arcs of money moving — behind the house, so they
            read as depth rather than as scratches across the roof. */}
        <circle cx="252" cy="176" r="158" fill="url(#bvSkyWash)" />
        <g fill="none" stroke="#426f62" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 11" opacity="0.45">
          <path d="M96 118 Q170 54 252 62" />
          <path d="M410 128 Q346 66 276 62" />
        </g>
        <ellipse cx="252" cy="322" rx="164" ry="18" fill="#2f5d50" opacity="0.07" />

        {/* ── The house ── */}
        <g>
          <path d="M124 168 L252 74 L380 168 L360 168 L252 89 L144 168 Z" fill="url(#bvRoof)" />
          <rect x="316" y="100" width="24" height="42" rx="4" fill="#234b40" />

          <rect x="152" y="164" width="200" height="148" rx="10" fill="url(#bvWall)" stroke="rgba(27, 35, 30,0.16)" strokeWidth="2" />

          {/* Door, centred on the house */}
          <rect x="232" y="238" width="42" height="74" rx="6" fill="#2f5d50" />
          <circle cx="264" cy="278" r="3.5" fill="#b9d3c9" />

          {/* Windows, symmetrical either side */}
          <g stroke="rgba(27, 35, 30,0.18)" strokeWidth="2">
            <rect x="176" y="190" width="48" height="44" rx="6" fill="#e5efeb" />
            <rect x="282" y="190" width="48" height="44" rx="6" fill="#e5efeb" />
            <rect x="176" y="252" width="48" height="44" rx="6" fill="#e5efeb" />
            <rect x="282" y="252" width="48" height="44" rx="6" fill="#e5efeb" />
          </g>
          <g stroke="rgba(27, 35, 30,0.16)" strokeWidth="2">
            <path d="M200 190 V234 M176 212 H224" />
            <path d="M306 190 V234 M282 212 H330" />
            <path d="M200 252 V296 M176 274 H224" />
            <path d="M306 252 V296 M282 274 H330" />
          </g>
        </g>

        {/* ── What it is worth, rising — clear of the house ── */}
        <g transform="translate(356 210)">
          <g className="float-c">
            <rect x="0" y="0" width="128" height="88" rx="12" fill="#1b231e" />
            <text x="14" y="24" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" letterSpacing="0.1em" fill="rgba(244,247,245,0.55)">
              VALUE
            </text>
            <path d="M14 70 L42 56 L64 62 L108 34 L108 76 L14 76 Z" fill="url(#bvChartFill)" />
            <path d="M14 70 L42 56 L64 62 L108 34" fill="none" stroke="#b9d3c9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="108" cy="34" r="5" fill="#8fb5a8" stroke="#1b231e" strokeWidth="2" />
          </g>
        </g>

        {/* ── Money around it ── */}
        <Coin x="74" y="146" r="29" cls="float" />
        <Coin x="444" y="120" r="22" cls="float-b" />
        <Coin x="62" y="216" r="17" cls="float-c" />

        {/* A note of cash, mid-flight, on the opposite side to the chart */}
        <g transform="rotate(-12 106 296)">
          <g className="float-b">
            <rect x="72" y="276" width="68" height="40" rx="7" fill="#2f5d50" />
            <rect x="78" y="282" width="56" height="28" rx="5" fill="#34d97a" />
            <NairaMark x={106} y={296} size={18} color="#2f5d50" />
          </g>
        </g>
      </svg>
    </HomeArtWrap>
  );
}

/* ── Property Passport, animated ─────────────────────── */

const PassportArtWrap = styled.div`
  width: 100%;
  svg { width: 100%; height: auto; display: block; }
`;

const PASSPORT_CHECKS = [
  'Seller & ownership',
  'Title documents',
  'Survey & location',
  'Price position',
  'Physical inspection',
];

/**
 * The Property Passport as a living card: five checks tick in one after
 * another and the ring counts them up. It stands in for the hero video on
 * phones and for the static proof card beside the video on desktop.
 * `dark` draws it for a black/photo background; `inView` waits for scroll.
 */
export function PassportChecksArt({ dark = true, inView = false, total = 8, done = 5, caseId = 'BV-1042' }) {
  const reduce = useReducedMotion();
  const count = useCountUp(done, { duration: 1400 });
  const w = 360;
  const rowH = 40;
  const top = 92;
  const h = top + PASSPORT_CHECKS.length * rowH + 24;

  const card = dark ? 'rgba(7, 25, 17, 0.78)' : '#ffffff';
  const line = dark ? 'rgba(255,255,255,0.14)' : 'var(--color-line)';
  const ink = dark ? '#f5faf7' : 'var(--color-ink)';
  const faint = dark ? 'rgba(255,255,255,0.55)' : 'var(--color-ink-faint)';
  const green = dark ? '#c2d8cf' : 'var(--color-green)';
  const deep = dark ? '#b9d3c9' : 'var(--color-green-deep)';

  const [wrapRef, play] = useStartInView(inView);
  const anim = (a) => ({ animate: play ? a : undefined });
  const ringR = 26;
  const ringC = 2 * Math.PI * ringR;
  const ringTarget = done / total;

  return (
    <PassportArtWrap ref={wrapRef}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Property Passport: ${done} of ${total} checks complete`}>
        <defs>
          <linearGradient id="pp-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={dark ? 0.08 : 0} />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width={w - 2} height={h - 2} rx="20" fill={card} stroke={line} />
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="20" fill="url(#pp-sheen)" />

        {/* header */}
        <text x="24" y="34" fontFamily="var(--font-sans)" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={green}>PROPERTY PASSPORT</text>
        <text x="24" y="58" fontFamily="var(--font-display)" fontSize="17" fontWeight="700" fill={ink}>4-bed home · Case {caseId}</text>
        <text x="24" y="76" fontFamily="var(--font-sans)" fontSize="11" fill={faint}>Evidence recorded for every check</text>

        {/* ring */}
        <g transform={`translate(${w - 56}, 52)`}>
          <circle r={ringR} fill="none" stroke={dark ? 'rgba(255,255,255,0.12)' : 'var(--color-bg-sunken)'} strokeWidth="5" />
          {reduce ? (
            <circle r={ringR} fill="none" stroke={green} strokeWidth="5" strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringC * (1 - ringTarget)} transform="rotate(-90)" />
          ) : (
            <motion.circle
              r={ringR}
              fill="none"
              stroke={green}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ringC}
              transform="rotate(-90)"
              initial={{ strokeDashoffset: ringC }}
              {...anim({ strokeDashoffset: ringC * (1 - ringTarget), transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 } })}
            />
          )}
          <text y="-1" textAnchor="middle" fontFamily="var(--font-display)" fontSize="16" fontWeight="700" fill={ink}>{reduce ? done : Math.round(count)}/{total}</text>
          <text y="13" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8" fontWeight="700" letterSpacing="1" fill={faint}>CHECKS</text>
        </g>

        {/* rows */}
        {PASSPORT_CHECKS.map((label, i) => {
          const y = top + i * rowH;
          const delay = 0.35 + i * 0.32;
          return (
            <g key={label}>
              <line x1="24" x2={w - 24} y1={y - 10} y2={y - 10} stroke={line} />
              <FadeIn delay={delay} play={play} y={4}>
                <text x="60" y={y + 15} fontFamily="var(--font-sans)" fontSize="13.5" fontWeight="600" fill={ink}>{label}</text>
                <text x={w - 24} y={y + 15} textAnchor="end" fontFamily="var(--font-sans)" fontSize="11" fontWeight="700" fill={deep}>Verified</text>
              </FadeIn>
              {reduce ? (
                <>
                  <circle cx="36" cy={y + 10} r="10" fill="none" stroke={green} strokeWidth="2" />
                  <path d={`M31 ${y + 10} l3.5 3.5 l6.5 -7`} fill="none" stroke={green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <motion.circle
                    cx="36" cy={y + 10} r="10" fill="none" stroke={green} strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    {...anim({ pathLength: 1, opacity: 1, transition: { duration: 0.5, delay, ease: 'easeOut' } })}
                  />
                  <DrawPath d={`M31 ${y + 10} l3.5 3.5 l6.5 -7`} delay={delay + 0.3} duration={0.35} play={play} fill="none" stroke={green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </g>
          );
        })}

        {/* live dot */}
        <g transform={`translate(30, ${h - 14})`}>
          <Pulse><circle r="4" fill={green} /></Pulse>
        </g>
        <text x="42" y={h - 10} fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill={faint}>Live Property Timeline</text>
      </svg>
    </PassportArtWrap>
  );
}

/* ── How verification flows ───────────────────────────── */

const FLOW_STEPS = [
  { title: 'You send it', sub: 'Any listing, any source' },
  { title: 'We check it', sub: 'Seller · title · price · site' },
  { title: 'Passport issued', sub: 'One report, with proof' },
];

/**
 * Three nodes joined by a path that draws in as it scrolls into view.
 * Replaces a paragraph explaining the process. Stacks vertically on phones.
 */
export function VerifyFlowArt({ vertical = false, steps = FLOW_STEPS, label = 'How verification works: you send a property, we check it, a Property Passport is issued' }) {
  const w = vertical ? 320 : 900;
  const h = vertical ? 300 : 150;
  const n = steps.length;
  const pts = steps.map((_, i) => (vertical
    ? { x: 40, y: 40 + i * ((h - 80) / (n - 1)) }
    : { x: 140 + i * ((w - 280) / (n - 1)), y: 46 }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const [wrapRef, play] = useStartInView();

  return (
    <PassportArtWrap ref={wrapRef}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
        <path d={line} fill="none" stroke="var(--color-line-strong)" strokeWidth="2" strokeDasharray="4 6" />
        <DrawPath d={line} play={play} duration={1.4} fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" />
        {pts.map((p, i) => {
          const delay = 0.15 + i * 0.5;
          const last = i === n - 1;
          return (
            <g key={steps[i].title}>
              <FadeIn delay={delay} play={play} y={0}>
                <circle cx={p.x} cy={p.y} r="22" fill={last ? 'var(--color-green-deep)' : '#fff'} stroke={last ? 'var(--color-green-deep)' : 'var(--color-green)'} strokeWidth="2.5" />
                {last ? (
                  <path d={`M${p.x - 8} ${p.y} l5.5 5.5 l10.5 -11`} fill="none" stroke="#c2d8cf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <text x={p.x} y={p.y + 6} textAnchor="middle" fontFamily="var(--font-display)" fontSize="17" fontWeight="700" fill="var(--color-green-deep)">{i + 1}</text>
                )}
              </FadeIn>
              <FadeIn delay={delay + 0.15} play={play}>
                <text
                  x={vertical ? p.x + 40 : p.x}
                  y={vertical ? p.y - 2 : p.y + 50}
                  textAnchor={vertical ? 'start' : 'middle'}
                  fontFamily="var(--font-display)" fontSize={vertical ? 17 : 18} fontWeight="700" fill="var(--color-ink)"
                >
                  {steps[i].title}
                </text>
                <text
                  x={vertical ? p.x + 40 : p.x}
                  y={vertical ? p.y + 18 : p.y + 72}
                  textAnchor={vertical ? 'start' : 'middle'}
                  fontFamily="var(--font-sans)" fontSize={vertical ? 13 : 14} fill="var(--color-ink-muted)"
                >
                  {steps[i].sub}
                </text>
              </FadeIn>
            </g>
          );
        })}
      </svg>
    </PassportArtWrap>
  );
}

/* ── Money follows milestones ─────────────────────────── */

const MILESTONES = ['Budget agreed', 'Stage inspected', 'Payment released'];

/**
 * Three milestone chips on a timeline with a coin that travels only once a
 * stage is ticked — the Manage promise (money follows proof) as a picture.
 * Drawn for the dark hero on the Manage landing page.
 */
export function MilestoneFlowArt() {
  const reduce = useReducedMotion();
  const w = 360;
  const h = 150;
  const xs = [62, 180, 296];
  const y = 60;
  const green = '#c2d8cf';

  return (
    <PassportArtWrap>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Money follows milestones: budget agreed, stage inspected, payment released">
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="20" fill="rgba(7,25,17,0.72)" stroke="rgba(255,255,255,0.16)" />
        <line x1={xs[0]} x2={xs[2]} y1={y} y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
        <DrawPath d={`M${xs[0]} ${y} L${xs[2]} ${y}`} duration={2} delay={0.4} fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" />
        {xs.map((x, i) => (
          <g key={MILESTONES[i]}>
            <FadeIn delay={0.4 + i * 0.7} y={0}>
              <circle cx={x} cy={y} r="14" fill="#2f5d50" stroke={green} strokeWidth="2.5" />
              <path d={`M${x - 6} ${y} l4 4 l8 -8`} fill="none" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </FadeIn>
            <FadeIn delay={0.55 + i * 0.7}>
              <text x={x} y={y + 38} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="#f5faf7">{MILESTONES[i]}</text>
            </FadeIn>
          </g>
        ))}
        {/* the coin */}
        {reduce ? (
          <circle cx={xs[2]} cy={y - 30} r="9" fill="#8fb5a8" stroke="#b9d3c9" strokeWidth="2" />
        ) : (
          <motion.g initial={{ x: xs[0], opacity: 0 }} animate={{ x: [xs[0], xs[0], xs[1], xs[1], xs[2]], opacity: 1 }} transition={{ duration: 2.4, delay: 0.5, times: [0, 0.2, 0.5, 0.7, 1], ease: 'easeInOut' }}>
            <circle cy={y - 30} r="9" fill="#8fb5a8" stroke="#b9d3c9" strokeWidth="2" />
            <text y={y - 26} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fontWeight="800" fill="#1b231e">₦</text>
          </motion.g>
        )}
        <text x="24" y={h - 16} fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.6)">Nothing is paid before it is checked</text>
      </svg>
    </PassportArtWrap>
  );
}


/* ── The property timeline ────────────────────────────── */

const TIMELINE = [
  { title: 'Tenant moved in', sub: 'Referenced · tenancy signed', chip: 'Let' },
  { title: 'Rent collected', sub: 'Paid out on the 1st', chip: 'Statement ready' },
  { title: 'Repair approved', sub: 'Quote accepted · fixed', chip: 'Evidence filed' },
  { title: 'Renovation done', sub: 'Before & after recorded', chip: 'Rent reviewed' },
];

/**
 * One property, one timeline: the four things Manage does drawn as a single
 * vertical line that fills in stage by stage, each with its evidence chip.
 * The Manage landing hero, in place of a video.
 */
export function JourneyTimelineArt() {
  const reduce = useReducedMotion();
  const w = 420;
  const rowH = 74;
  const top = 58;
  const h = top + TIMELINE.length * rowH + 20;
  const x = 40;
  const green = 'var(--color-green)';
  const yAt = (i) => top + i * rowH;

  return (
    <PassportArtWrap>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="One managed property: tenant moved in, rent collected, repair approved, renovation done">
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="22" fill="#ffffff" stroke="var(--color-line)" />
        <text x="28" y="34" fontFamily="var(--font-sans)" fontSize="11" fontWeight="700" letterSpacing="1.4" fill="var(--color-green-deep)">PROPERTY TIMELINE</text>
        <text x={w - 28} y="34" textAnchor="end" fontFamily="var(--font-sans)" fontSize="11" fill="var(--color-ink-faint)">12 Marina Close</text>
        <line x1={x} x2={x} y1={yAt(0)} y2={yAt(TIMELINE.length - 1)} stroke="var(--color-line)" strokeWidth="3" strokeLinecap="round" />
        <DrawPath d={`M${x} ${yAt(0)} L${x} ${yAt(TIMELINE.length - 1)}`} duration={2.4} delay={0.3} fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" />
        {TIMELINE.map((t, i) => {
          const y = yAt(i);
          const delay = 0.35 + i * 0.6;
          return (
            <g key={t.title}>
              <FadeIn delay={delay} y={0}>
                <circle cx={x} cy={y} r="13" fill="var(--color-green-deep)" stroke={green} strokeWidth="2.5" />
                <path d={`M${x - 5.5} ${y} l3.5 3.5 l7.5 -7.5`} fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </FadeIn>
              <FadeIn delay={delay + 0.12}>
                <text x={x + 28} y={y - 4} fontFamily="var(--font-display)" fontSize="15.5" fontWeight="700" fill="var(--color-ink)">{t.title}</text>
                <text x={x + 28} y={y + 15} fontFamily="var(--font-sans)" fontSize="11.5" fill="var(--color-ink-muted)">{t.sub}</text>
              </FadeIn>
              <FadeIn delay={delay + 0.25} y={0}>
                <g transform={`translate(${w - 28}, ${y})`}>
                  <rect x={-(t.chip.length * 6.2 + 18)} y="-11" width={t.chip.length * 6.2 + 18} height="22" rx="11" fill="var(--color-green-soft)" stroke="rgba(47, 93, 80,0.25)" />
                  <text x={-9} y="4" textAnchor="end" fontFamily="var(--font-sans)" fontSize="10.5" fontWeight="700" fill="var(--color-green-deep)">{t.chip}</text>
                </g>
              </FadeIn>
            </g>
          );
        })}
        <g transform={`translate(${x}, ${h - 16})`}>
          {reduce ? <circle r="4" fill={green} /> : <Pulse><circle r="4" fill={green} /></Pulse>}
        </g>
        <text x={x + 12} y={h - 12} fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill="var(--color-ink-faint)">Live · every stage keeps its evidence</text>
      </svg>
    </PassportArtWrap>
  );
}

/* ── Spot illustrations ───────────────────────────────── */

const SpotWrap = styled.div`
  width: 100%;
  svg { width: 100%; height: auto; display: block; overflow: visible; }
`;

/* A small house every spot shares; the accent beside it says what the page is for. */
const HOUSE = [
  'M8 86 H112',
  'M20 54 L54 26 L88 54',
  'M27 49 V86 M81 49 V86',
  'M47 86 V68 H61 V86',
];

const FLOAT = { y: [0, -3, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } };

function SpotAccent({ kind, play }) {
  const stroke = { stroke: 'var(--color-green-deep)', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const fill = 'var(--color-green)';
  switch (kind) {
    case 'sell':
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? FLOAT : undefined}>
            <path d="M93 34 H115 V52 H93 L86 43 Z" fill={fill} />
            <circle cx="92" cy="43" r="2" fill="#fff" />
            <text x="104" y="47" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font-sans)">₦</text>
          </motion.g>
        </FadeIn>
      );
    case 'renovate':
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? { rotate: [0, -6, 0], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } } : undefined}>
            <rect x="88" y="26" width="24" height="10" rx="3" fill={fill} />
            <path d="M112 31 H116 V42 H102 V52" {...stroke} />
            <rect x="99" y="52" width="6" height="12" rx="2" fill="var(--color-green-deep)" />
          </motion.g>
        </FadeIn>
      );
    case 'manage':
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? FLOAT : undefined}>
            <circle cx="98" cy="40" r="7" {...stroke} />
            <path d="M105 40 H117 M113 40 V46 M109 40 V45" {...stroke} />
            <circle cx="102" cy="64" r="8" fill={fill} />
            <text x="102" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="var(--font-sans)">₦</text>
          </motion.g>
        </FadeIn>
      );
    case 'verify':
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? FLOAT : undefined}>
            <path d="M101 24 L115 29 V40 C115 49 109 55 101 58 C93 55 87 49 87 40 V29 Z" fill={fill} />
            <DrawPath play={play} delay={1.3} d="M95 41 L99.5 45.5 L107 37" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </motion.g>
        </FadeIn>
      );
    case 'scan':
      return (
        <>
          <DrawPath play={play} delay={0.8} d="M10 22 V12 H22 M98 12 H110 V22 M110 76 V86 M10 76 V86" {...stroke} />
          {play && (
            <motion.rect
              x="14" width="92" height="2.4" rx="1.2" fill={fill}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: [16, 82, 16], opacity: [0.9, 0.9, 0.9] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          )}
        </>
      );
    case 'move':
      // A small removal truck arriving at the house.
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? { x: [6, 0, 0], transition: { duration: 1.1, ease: 'easeOut' } } : undefined}>
            <rect x="86" y="58" width="22" height="16" rx="2" fill={fill} />
            <path d="M108 63 H114 L118 68 V74 H108 Z" fill="var(--color-green-deep)" />
            <circle cx="92" cy="77" r="3.4" fill="#fff" stroke="var(--color-ink)" strokeWidth="2" />
            <circle cx="112" cy="77" r="3.4" fill="#fff" stroke="var(--color-ink)" strokeWidth="2" />
            <path d="M78 62 H83 M76 67 H83" {...stroke} />
          </motion.g>
        </FadeIn>
      );
    case 'consult':
      return (
        <FadeIn play={play} delay={0.9}>
          <motion.g animate={play ? FLOAT : undefined}>
            <path d="M86 14 H114 A4 4 0 0 1 118 18 V32 A4 4 0 0 1 114 36 H98 L91 42 V36 H86 A4 4 0 0 1 82 32 V18 A4 4 0 0 1 86 14 Z" fill={fill} />
            <circle cx="92" cy="25" r="1.8" fill="#fff" />
            <circle cx="100" cy="25" r="1.8" fill="#fff" />
            <circle cx="108" cy="25" r="1.8" fill="#fff" />
          </motion.g>
        </FadeIn>
      );
    default:
      return null;
  }
}

/**
 * A small, self-drawing house with one accent that names the page: a price
 * tag (sell), a roller (renovate), a key and a coin (manage), a shield
 * (verify), a scan frame (photo scan), a speech bubble (adviser) or a
 * removal truck (move). Gives a
 * text-only phone header a picture without downloading one.
 */
export function SpotArt({ kind = 'manage', className, label }) {
  const [ref, play] = useStartInView();
  const line = { stroke: 'var(--color-ink)', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <SpotWrap ref={ref} className={className}>
      <svg viewBox="0 0 120 96" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        <FadeIn play={play} y={0} duration={0.6}>
          <circle cx="56" cy="54" r="38" fill="var(--color-green-soft)" />
        </FadeIn>
        <FadeIn play={play} delay={0.5} y={0}>
          <rect x="33" y="56" width="9" height="8" rx="1.5" fill="var(--color-green)" opacity="0.85" />
          <rect x="66" y="56" width="9" height="8" rx="1.5" fill="var(--color-green)" opacity="0.85" />
        </FadeIn>
        {HOUSE.map((d, i) => <DrawPath key={d} d={d} play={play} delay={0.1 + i * 0.15} {...line} />)}
        <SpotAccent kind={kind} play={play} />
      </svg>
    </SpotWrap>
  );
}

/* ── Manage service illustrations ─────────────────────── */

const ServiceArtWrap = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, var(--color-green-wash), var(--color-band));
  svg { width: 100%; height: 100%; display: block; }
`;

const INK = { stroke: 'var(--color-ink)', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
const DEEP = { ...INK, stroke: 'var(--color-green-deep)' };
const LOOP = (anim, duration = 2.6, delay = 1.2) => ({ ...anim, transition: { duration, repeat: Infinity, ease: 'easeInOut', delay } });

/** A small house the four scenes share, drawn at (x, y). */
function SceneHouse({ x = 0, y = 0, play }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <FadeIn play={play} y={0} duration={0.5}>
        <rect x="8" y="34" width="56" height="44" rx="2" fill="#fff" />
        <rect x="18" y="46" width="11" height="10" rx="1.5" fill="var(--color-green)" opacity="0.85" />
        <rect x="43" y="46" width="11" height="10" rx="1.5" fill="var(--color-green)" opacity="0.85" />
      </FadeIn>
      <DrawPath play={play} d="M2 38 L36 12 L70 38" delay={0.1} {...INK} />
      <DrawPath play={play} d="M8 34 V78 H64 V34" delay={0.3} {...INK} />
      <DrawPath play={play} d="M30 78 V64 H42 V78" delay={0.5} {...INK} />
    </g>
  );
}

function TenantsScene({ play }) {
  return (
    <>
      <SceneHouse x={24} y={30} play={play} />
      {/* Two new tenants walk up to the door. */}
      <motion.g initial={{ x: 26, opacity: 0 }} animate={play ? { x: 0, opacity: 1 } : undefined} transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <circle cx="122" cy="72" r="7" fill="var(--color-green-deep)" />
        <path d="M110 108 C110 92 134 92 134 108 Z" fill="var(--color-green-deep)" />
        <circle cx="146" cy="76" r="6" fill="var(--color-green)" />
        <path d="M136 108 C136 95 156 95 156 108 Z" fill="var(--color-green)" />
      </motion.g>
      {/* Referenced and signed. */}
      <FadeIn play={play} delay={1.5} y={0}>
        <motion.g animate={play ? LOOP({ y: [0, -3, 0] }, 3) : undefined}>
          <rect x="146" y="26" width="34" height="40" rx="4" fill="#fff" stroke="var(--color-line-strong)" />
          <path d="M152 36 H174 M152 43 H170 M152 50 H166" stroke="var(--color-ink-faint)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="176" cy="62" r="9" fill="var(--color-green-deep)" />
          <DrawPath play={play} delay={1.9} d="M172 62 L175 65 L180 59" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.g>
      </FadeIn>
      <DrawPath play={play} d="M14 108 H186" delay={0} {...INK} stroke="var(--color-line-strong)" />
    </>
  );
}

function RentScene({ play }) {
  return (
    <>
      {/* A statement card... */}
      <FadeIn play={play} y={8}>
        <rect x="22" y="28" width="70" height="86" rx="8" fill="#fff" stroke="var(--color-line-strong)" />
        <text x="32" y="48" fontFamily="var(--font-sans)" fontSize="8" fontWeight="700" letterSpacing="1" fill="var(--color-green-deep)">STATEMENT</text>
        <path d="M32 60 H80 M32 70 H72 M32 80 H76" stroke="var(--color-line-strong)" strokeWidth="3" strokeLinecap="round" />
        <rect x="32" y="92" width="48" height="12" rx="6" fill="var(--color-green-soft)" />
        <text x="56" y="101" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8" fontWeight="700" fill="var(--color-green-deep)">PAID OUT</text>
      </FadeIn>
      {/* ...and the rent falling into the owner's wallet. */}
      {[0, 1, 2].map((i) => (
        <motion.g
          key={i}
          initial={{ y: -10, opacity: 0 }}
          animate={play ? { y: [-10, 34, 34], opacity: [0, 1, 0] } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 + i * 0.7, ease: 'easeIn' }}
        >
          <circle cx={128 + i * 14} cy="40" r="9" fill="var(--color-green)" />
          <text x={128 + i * 14} y="44" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="#fff">₦</text>
        </motion.g>
      ))}
      <FadeIn play={play} delay={0.4} y={0}>
        <rect x="110" y="74" width="68" height="42" rx="8" fill="var(--color-green-deep)" />
        <path d="M110 86 H178" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <rect x="156" y="92" width="22" height="14" rx="5" fill="var(--color-green)" />
        <circle cx="164" cy="99" r="2.5" fill="#fff" />
      </FadeIn>
    </>
  );
}

function RepairsScene({ play }) {
  return (
    <>
      <SceneHouse x={14} y={30} play={play} />
      {/* The wrench at work... */}
      <FadeIn play={play} delay={0.7} y={0}>
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: '15% 85%' }}
          animate={play ? LOOP({ rotate: [0, -14, 0] }, 1.6, 1) : undefined}
        >
          <path d="M98 94 L120 62" stroke="var(--color-green-deep)" strokeWidth="7" strokeLinecap="round" />
          <circle cx="123" cy="57" r="10" fill="var(--color-green-deep)" />
          <path d="M120 44 L126 56 L134 50 Z" fill="#eef4f0" />
          <circle cx="98" cy="94" r="2.5" fill="#eef4f0" />
        </motion.g>
      </FadeIn>
      {/* ...and the job card it ticks off. */}
      <FadeIn play={play} delay={1.1}>
        <rect x="140" y="30" width="44" height="58" rx="6" fill="#fff" stroke="var(--color-line-strong)" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="147" y={40 + i * 15} width="9" height="9" rx="2" fill={i < 2 ? 'var(--color-green)' : 'var(--color-band-strong)'} />
            {i < 2 && <DrawPath play={play} delay={1.4 + i * 0.35} d={`M149 ${44.5 + i * 15} L151 ${46.5 + i * 15} L154.5 ${42 + i * 15}`} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
            <path d={`M161 ${44.5 + i * 15} H178`} stroke="var(--color-line-strong)" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        ))}
      </FadeIn>
      <DrawPath play={play} d="M10 108 H190" {...INK} stroke="var(--color-line-strong)" />
    </>
  );
}

function RenovateScene({ play }) {
  const sweep = { duration: 5, times: [0, 0.55, 0.85, 1], repeat: Infinity, delay: 0.6, ease: 'easeInOut' };
  return (
    <>
      <FadeIn play={play} delay={1.2} y={0}>
        <rect x="132" y="6" width="48" height="16" rx="8" fill="var(--color-green-deep)" />
        <text x="156" y="17" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8.5" fontWeight="700" fill="#fff">STAGE 2/3</text>
      </FadeIn>
      {/* A wall, being freshly painted. */}
      <FadeIn play={play} y={0}>
        <rect x="28" y="30" width="144" height="70" rx="6" fill="#fff" stroke="var(--color-line-strong)" />
        <path d="M28 53 H172 M28 77 H172 M64 30 V53 M112 30 V53 M148 30 V53 M44 53 V77 M88 53 V77 M136 53 V77 M64 77 V100 M112 77 V100 M156 77 V100" stroke="var(--color-band-strong)" strokeWidth="2" />
      </FadeIn>
      {play && (
        <motion.rect x="28" y="30" height="70" rx="6" fill="var(--color-green)" opacity="0.22" initial={{ width: 0 }} animate={{ width: [0, 120, 120, 0] }} transition={sweep} />
      )}
      {/* The roller sweeping across. */}
      {play && (
        <motion.g initial={{ x: 0 }} animate={{ x: [0, 120, 120, 0] }} transition={sweep}>
          <rect x="20" y="44" width="16" height="42" rx="5" fill="var(--color-green-deep)" />
          <path d="M36 65 H44 V126" {...INK} />
        </motion.g>
      )}
      <DrawPath play={play} d="M12 126 H188" {...INK} stroke="var(--color-line-strong)" />
    </>
  );
}

const SCENES = { tenants: TenantsScene, rent: RentScene, repairs: RepairsScene, renovate: RenovateScene };

/**
 * One illustration per Manage service (tenants, rent, repairs, renovate) —
 * drawn, not photographed, so the "What we take care of" cards do not repeat
 * photos used elsewhere and weigh nothing on a phone.
 */
export function ServiceArt({ kind, label }) {
  const [ref, play] = useStartInView();
  const Scene = SCENES[kind] || TenantsScene;
  return (
    <ServiceArtWrap ref={ref}>
      <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        <Scene play={play} />
      </svg>
    </ServiceArtWrap>
  );
}
