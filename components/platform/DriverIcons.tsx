/**
 * Driver-themed line icons drawn as inline SVG (no external icon lib). They use
 * `currentColor`, so callers set the tint via `style={{ color }}` and the size
 * via className — matching the FreightArt glyph API used elsewhere.
 */

type GlyphProps = { className?: string; style?: React.CSSProperties };

const base = {
  viewBox: "0 0 32 32",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Steering wheel — the driver mark. */
export function SteeringWheelGlyph({ className, style }: GlyphProps) {
  return (
    <svg {...base} className={className} style={style}>
      <circle cx="16" cy="16" r="12.5" />
      <circle cx="16" cy="16" r="3" />
      <path d="M16 13V4" />
      <path d="M13.4 17.6 6.2 23" />
      <path d="M18.6 17.6 25.8 23" />
    </svg>
  );
}

/** Shield with a naira mark — funded / money-safe. */
export function ShieldNairaGlyph({ className, style }: GlyphProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M16 3.5 26 7v7c0 6.4-4.3 11.3-10 13.5C10.3 25.3 6 20.4 6 14V7z" />
      <path d="M12.6 20v-8l6.8 8v-8" />
      <path d="M11 14.6h10M11 17.4h10" />
    </svg>
  );
}

/** Route with stops and a destination pin — paid at each step of the run. */
export function RouteStopsGlyph({ className, style }: GlyphProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M8 28c0-8 16-8 16-16" />
      <circle cx="8" cy="28" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="20" r="1.9" fill="currentColor" stroke="none" />
      <path d="M24 4a4 4 0 0 0-4 4c0 2.7 4 6 4 6s4-3.3 4-6a4 4 0 0 0-4-4z" />
      <circle cx="24" cy="8" r="1.3" />
    </svg>
  );
}

/** Wallet — cash out in naira. */
export function WalletGlyph({ className, style }: GlyphProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="4" y="8" width="24" height="16.5" rx="3" />
      <path d="M28 14h-4.5a2.4 2.4 0 0 0 0 5H28" />
      <circle cx="23.4" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <path d="M8 8V6.5A1.5 1.5 0 0 1 9.5 5H23" opacity="0.7" />
    </svg>
  );
}

/** Driver's licence card — the compliance vault. */
export function LicenseGlyph({ className, style }: GlyphProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="3" y="7" width="26" height="18" rx="2.5" />
      <circle cx="10" cy="14" r="3" />
      <path d="M5.6 21c0-2.6 8.8-2.6 8.8 0" />
      <path d="M18 12h7M18 16h7M18 20h4.5" />
    </svg>
  );
}
