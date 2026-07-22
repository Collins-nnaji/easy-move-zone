"use client"

/**
 * Inline freight illustrations for the landing page.
 *
 * Hand-drawn SVG rather than an icon font or raster art: these scale cleanly,
 * inherit the brand palette through props, and add nothing to the bundle beyond
 * their own markup.
 */

const PRIMARY = "#e0511f"
const INK = "#1b231e"

/**
 * Hero illustration: a truck on a route between two pins, with the escrow
 * milestones the platform actually runs on marked along the way.
 */
export function HeroFreightArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="16 92 496 262"
      className={className}
      fill="none"
      role="img"
      aria-label="A delivery truck running a route from pickup to drop-off"
    >
      <defs>
        <linearGradient id="emz-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f4efe6" />
        </linearGradient>
        <linearGradient id="emz-cab" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PRIMARY} />
          <stop offset="100%" stopColor="#c4441a" />
        </linearGradient>
      </defs>

      {/* Route: rises from the pickup pin, runs flat under the truck, then
          climbs away to the drop-off pin. The flat span is the road surface
          the wheels actually sit on. */}
      <path
        d="M40 330 C 110 330, 120 318, 176 318 L 356 318 C 420 318, 424 150, 476 150"
        stroke="#d8d2c6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10 12"
      />

      {/* Pickup pin */}
      <g>
        <circle cx="40" cy="330" r="13" fill="#ffffff" stroke="#d8d2c6" strokeWidth="2.5" />
        <circle cx="40" cy="330" r="5" fill={PRIMARY} />
      </g>

      {/* Drop-off pin */}
      <g>
        <path
          d="M476 106 c 11.6 0 21 9.1 21 20.4 0 14.2 -21 33.6 -21 33.6 s -21 -19.4 -21 -33.6 C 455 115.1 464.4 106 476 106 z"
          fill={PRIMARY}
        />
        <circle cx="476" cy="126" r="7" fill="#ffffff" />
      </g>

      {/* Truck — wheels rest on y=300, the flat span of the route above */}
      <g transform="translate(168 186)">
        {/* Trailer box */}
        <rect x="0" y="0" width="132" height="82" rx="10" fill="url(#emz-body)" stroke={INK} strokeWidth="3" />
        {/* Trailer ribs */}
        <path d="M28 16 v50 M58 16 v50 M88 16 v50" stroke="#ded7cb" strokeWidth="3" strokeLinecap="round" />

        {/* Cab — shares the trailer's baseline so the two read as one vehicle.
            Drawn as a bonnet block plus a sloped nose, outlined like the box. */}
        <path
          d="M130 22 h32 c5 0 9.6 2.6 12.1 6.9 l15.2 26.1 c1.7 2.9 2.6 6.1 2.6 9.4 V74 c0 4.4 -3.6 8 -8 8 H130 z"
          fill="url(#emz-cab)"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Windscreen — inset from the cab outline so the ink edge stays visible */}
        <path
          d="M141 31 h19 c2.4 0 4.6 1.2 5.8 3.2 L176 52 h-35 z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Headlamp */}
        <rect x="176" y="62" width="10" height="7" rx="3" fill="#ffe2b8" stroke={INK} strokeWidth="2" />

        {/* Wheels — centres at y=114 → 300 in page space */}
        <g>
          <circle cx="40" cy="114" r="18" fill={INK} />
          <circle cx="40" cy="114" r="7" fill="#f4efe6" />
          <circle cx="160" cy="114" r="18" fill={INK} />
          <circle cx="160" cy="114" r="7" fill="#f4efe6" />
        </g>

        {/* Motion lines */}
        <path
          d="M-30 26 h22 M-42 48 h32 M-26 70 h18"
          stroke={PRIMARY}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Milestone tick on the trailer flank */}
        <circle cx="110" cy="41" r="13" fill="#ffffff" stroke={PRIMARY} strokeWidth="3" />
        <path
          d="M104 41 l4.4 4.4 l8.4 -9"
          stroke={PRIMARY}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

/** Small inline glyphs used beside the value props. */
type GlyphProps = { className?: string; style?: React.CSSProperties }

export function BoxGlyph({ className , style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" aria-hidden>
      <path d="M16 4 L28 10 v12 L16 28 L4 22 V10 z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M4 10 l12 6 12 -6 M16 16 v12" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  )
}

export function RouteGlyph({ className , style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3.4" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="3.4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M8 11.5 v5 c0 4 3.5 7.5 7.5 7.5 h5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="3 3.5"
      />
    </svg>
  )
}

export function ShieldGlyph({ className , style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" aria-hidden>
      <path d="M16 3 l11 4.5 v8.5 c0 7 -4.6 11.6 -11 13.5 C9.6 27.6 5 23 5 16 V7.5 z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M11.5 16 l3.2 3.2 L21 12.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NairaGlyph({ className , style }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} fill="none" aria-hidden>
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M11 22 V10 l10 12 V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 14.5 h15 M8.5 17.8 h15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}
