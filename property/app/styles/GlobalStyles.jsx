import { createGlobalStyle } from 'styled-components';

/**
 * One type system, one palette.
 *
 * Type: Newsreader for headings and Manrope for UI, loaded in app/layout.tsx
 * on --font-bricolage and --font-jakarta. Headings sit at medium weight with
 * a little negative tracking so the serif stays open.
 *
 * Colour: warm stone pages, black ink, and the logo gradient
 * (#b85a30 to #FBB03B) for actions and marks. Token names stay
 * `--color-green-*` so existing components keep resolving.
 */
const GlobalStyles = createGlobalStyle`
  :root {
    --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    --font-display: var(--font-bricolage), var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
    /* Alias, not a monospace: labels render as tracked-out sans. */
    --font-mono: var(--font-sans);

    /* Canvas — warm stone, cards in pure white */
    --color-bg: #f4f3ef;
    --color-bg-slate: #ebe9e3;
    --color-bg-panel: #f7f6f3;
    --color-bg-elevated: #ffffff;
    --color-bg-sunken: #eceae4;
    --color-bg-tint: #f7f6f3;
    --hero-bg: #f4f3ef;

    /* Ink */
    --color-ink: #101218;
    --color-ink-muted: #5c6370;
    --color-ink-soft: #6b7280;
    --color-ink-faint: #8b93a1;
    --color-line: #e3e0d8;
    --color-line-strong: #cfcabf;

    /* Logo gradient, with black as the second brand colour.
       Names stay --color-green-* so every screen follows. */
    /* Quieter than the logo's deep red: the faint gold end, with just enough
       warmth left that white type on a button still reads. */
    --gradient-brand: linear-gradient(102deg, #b85a30 0%, #d4923a 70%, #FBB03B 100%);
    --color-green: #c9842f;
    --color-green-ink: #8f4e22;
    --color-green-deep: #b85a30;
    --color-green-forest: #111111;
    --color-green-bright: #f0b04a;
    --color-green-mint: #f6e2c4;
    --color-green-soft: #fbf3e6;
    --color-green-chip: #f6e6cc;
    --color-green-wash: #fdf8f1;

    --color-accent: #f0b04a;
    --color-accent-ink: #8f4e22;
    --color-eyebrow: #a86a22;

    /* Near-black is for text and the dark button. Page bands stay stone
       so copy written for a light surface keeps its contrast. */
    --color-black: #111111;
    --color-black-soft: #2a2a2a;
    --color-band: #eceae4;
    --color-band-strong: #e0ddd4;
    --color-black-raised: #ffffff;
    --color-on-black: var(--color-ink);
    --color-on-black-muted: var(--color-ink-muted);
    --color-on-black-faint: var(--color-ink-faint);
    --color-black-line: var(--color-line);
    --color-black-line-strong: var(--color-line-strong);

    --color-cta: var(--color-green-deep);
    --color-cta-text: #ffffff;
    --color-warn: #b45309;

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 22px;
    --radius-pill: 999px;
    --radius-button: 12px;

    --shadow-soft: 0 16px 36px -28px rgba(16, 18, 24, 0.28);
    --shadow-card: 0 22px 44px -24px rgba(16, 18, 24, 0.22);
    --shadow-lift: 0 32px 64px -28px rgba(16, 18, 24, 0.32);

    --nav-h: 72px;
    --container: 1240px;
    --mobile-tabbar-h: 76px;
    --console-rail-w: 260px;
  }

  @media (max-width: 720px) {
    :root { --nav-h: 64px; }
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
      letter-spacing: -0.03em;
      line-height: 1.08;
      color: var(--color-ink);
      font-optical-sizing: auto;
    }

    h1 { font-size: clamp(2.35rem, 4.4vw, 3.75rem); line-height: 1.02; font-weight: 500; letter-spacing: -0.034em; }
    h2 { font-size: clamp(1.85rem, 3.2vw, 2.85rem); line-height: 1.08; letter-spacing: -0.03em; }
    h3 { font-size: clamp(1.2rem, 1.7vw, 1.5rem); letter-spacing: -0.022em; font-weight: 560; }
    h4 { font-size: 1.12rem; }

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

  ::selection { background: #f8dcc8; color: #111111; }

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
    padding: 0.85rem 1.35rem;
    border-radius: var(--radius-button);
    font-family: var(--font-sans);
    font-weight: 650;
    font-size: 0.9rem;
    letter-spacing: -0.01em;
    border: none;
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }

  .btn-green {
    background: var(--gradient-brand);
    color: #fff;
  }
  .btn-green:hover {
    background: #111111;
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
