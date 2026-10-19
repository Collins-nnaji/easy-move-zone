import { createGlobalStyle } from 'styled-components';

/**
 * One type system, one palette — EasyMoveZone's.
 *
 * Type: Bricolage Grotesque for headings and Plus Jakarta Sans for everything
 * else, loaded once by next/font in app/layout.tsx (--font-bricolage,
 * --font-jakarta). Headings are set the EasyMoveZone way: medium weights,
 * tight negative tracking.
 *
 * Colour: warm cream paper (#faf8f2) with sage bands, deep green (#2f5d50)
 * for CTAs, active states and figures, and a terracotta accent (#c85a34) for
 * eyebrow dots and hovers. The `--color-green-*` names are kept so every
 * component keeps working; they now resolve to the EasyMoveZone greens.
 */
const GlobalStyles = createGlobalStyle`
  :root {
    --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    --font-display: var(--font-bricolage), var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
    /* Alias, not a monospace: labels render as tracked-out sans. */
    --font-mono: var(--font-sans);

    /* Canvas — warm cream paper with sage tints */
    --color-bg: #faf8f2;
    --color-bg-slate: #eeefe5;
    --color-bg-panel: #f3f0e7;
    --color-bg-elevated: #ffffff;
    --color-bg-sunken: #efece4;
    --color-bg-tint: #f3f0e7;
    --hero-bg: radial-gradient(ellipse at 85% 30%, #e8eddf 0%, transparent 55%), #f3f0e7;

    /* Ink */
    --color-ink: #202b25;
    --color-ink-muted: #626b60;
    --color-ink-soft: #68715f;
    --color-ink-faint: #8a927f;
    --color-line: #e0e1d5;
    --color-line-strong: #ccd3c3;

    /* Brand green (EasyMoveZone) */
    --color-green: #426f62;
    --color-green-ink: #2f5d50;
    --color-green-deep: #2f5d50;
    --color-green-forest: #234b40;
    --color-green-bright: #8fb5a8;
    --color-green-mint: #b9d3c9;
    --color-green-soft: #e5efeb;
    --color-green-chip: #d7e6df;
    --color-green-wash: #f3f0e7;

    /* Accent — the eyebrow dot and link hovers */
    --color-accent: #c85a34;
    --color-accent-ink: #b94721;
    --color-eyebrow: #486454;

    /* Ink-dark is for text and the "dark" button only — never a page band.
       Full-bleed bands, callouts and figure panels sit on --color-band, a
       soft sage, with ordinary ink on top. */
    --color-black: #1b231e;
    --color-black-soft: #26382d;
    --color-band: #eeefe5;
    --color-band-strong: #e4e6da;
    --color-black-raised: #ffffff;
    --color-on-black: var(--color-ink);
    --color-on-black-muted: var(--color-ink-muted);
    --color-on-black-faint: var(--color-ink-faint);
    --color-black-line: var(--color-line);
    --color-black-line-strong: var(--color-line-strong);

    /* CTA — deep green */
    --color-cta: var(--color-green-deep);
    --color-cta-text: #ffffff;
    --color-warn: #b45309;

    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --radius-pill: 999px;
    --radius-button: 6px;

    --shadow-soft: 0 18px 40px -28px rgba(27, 35, 30, 0.22);
    --shadow-card: 0 18px 38px -18px rgba(27, 35, 30, 0.14);
    --shadow-lift: 0 28px 56px -22px rgba(27, 35, 30, 0.2);

    --nav-h: 80px;
    --container: 1200px;
    --mobile-tabbar-h: 62px;
    --console-rail-w: 244px;
  }

  @media (max-width: 720px) {
    :root { --nav-h: 60px; }
  }

  /* In the base layer so Tailwind spacing utilities (mt-4, px-6…) still apply. */
  @layer base { * { box-sizing: border-box; margin: 0; padding: 0; } }

  html {
    /* Scales every rem-based font-size down on very narrow phones. */
    font-size: 100%;
    @media (max-width: 400px) { font-size: 93.75%; }
    @media (max-width: 340px) { font-size: 87.5%; }
  }

  html, body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-ink);
    background: var(--color-bg);
    font-size: 1rem;
    line-height: 1.6;
    scroll-behavior: smooth;
  }

  /*
   * Only <body> clips sideways overflow. With <html> left visible, the browser
   * hands body's overflow to the viewport, so the page itself scrolls. Setting
   * it on <html> too made <body> its own (unscrollable) scroll box, and with
   * EasyMoveZone's overscroll-behavior: none the mouse wheel and trackpad
   * stopped there — only the keyboard could scroll the page.
   */
  body { overflow-x: hidden; }

  /* A long unbroken word (an address, an email, a big number) would otherwise
     force the line wider than the viewport. */
  h1, h2, h3, h4, h5, h6, p {
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /*
   * Element defaults sit in the base cascade layer, under Tailwind's utility
   * layer: a class such as text-white on a link-styled button must win over
   * the default link colour (otherwise the label vanished, green on green).
   * Styled-components rules stay unlayered, so they still win over both.
   */
  @layer base {
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-display);
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.15;
      color: var(--color-ink);
    }

    h1 { font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.06; font-weight: 600; letter-spacing: -0.05em; }
    h2 { font-size: clamp(1.6rem, 3vw, 2.5rem); line-height: 1.12; letter-spacing: -0.045em; }
    h3 { font-size: clamp(1.1rem, 1.6vw, 1.35rem); letter-spacing: -0.025em; }
    h4 { font-size: 1.05rem; }

    p { color: var(--color-ink-muted); }

    a {
      color: var(--color-green-deep);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    a:hover { color: var(--color-accent-ink); }
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  @layer base { img { max-width: 100%; height: auto; display: block; } }

  ::selection { background: var(--color-green-chip); color: var(--color-green-forest); }

  .container {
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (max-width: 720px) {
    .container { padding: 0 1.125rem; }
  }

  /* Small tracked-out label — the old ".mono" eyebrow, now in the sans. */
  .mono {
    font-family: var(--font-sans);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    border-radius: var(--radius-button);
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }

  .btn-green {
    background: var(--color-green-deep);
    color: #fff;
  }
  .btn-green:hover {
    background: var(--color-green-forest);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: var(--shadow-card);
  }

  .btn-dark {
    background: var(--color-black);
    color: #fff;
  }
  .btn-dark:hover {
    background: var(--color-black-soft);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: var(--shadow-card);
  }

  .btn-ghost {
    background: #fff;
    color: var(--color-ink);
    border: 1.5px solid var(--color-line-strong);
  }
  .btn-ghost:hover {
    border-color: var(--color-green-deep);
    color: var(--color-green-deep);
    transform: translateY(-1px);
  }
`;

export default GlobalStyles;
