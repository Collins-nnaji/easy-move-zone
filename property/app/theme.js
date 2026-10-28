/**
 * Styled-components theme — mirrors the CSS custom properties in
 * GlobalStyles.jsx. CSS variables stay the source of truth.
 */
const theme = {
  colors: {
    primary: '#b85a30',
    secondary: '#f0b04a',
    accent: '#f0b04a',
    forest: '#111111',
    text: '#5c6370',
    ink: '#101218',
    white: '#FFFFFF',
    background: '#f4f3ef',
    tint: '#f7f6f3',
    cardBg: '#FFFFFF',
    border: 'rgba(16, 18, 24, 0.08)',
    black: '#101218',
    blackSoft: '#1c2030',
    onBlack: '#f4f3ef',
  },
  fonts: {
    sans: "'Manrope', system-ui, -apple-system, sans-serif",
    display: "'Newsreader', 'Manrope', Georgia, serif",
  },
  shadows: {
    sm: '0 16px 36px -28px rgba(16, 18, 24, 0.28)',
    md: '0 22px 44px -24px rgba(16, 18, 24, 0.22)',
    lg: '0 32px 64px -28px rgba(16, 18, 24, 0.32)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '22px',
    pill: '999px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  spacing: {
    section: '4.5rem 0',
  },
};

export default theme;
