/**
 * Styled-components theme — mirrors the CSS custom properties defined in
 * src/styles/GlobalStyles.jsx so components can reach the same tokens from JS.
 * The CSS variables stay the source of truth for anything written in CSS.
 */
const theme = {
  colors: {
    primary: '#2f5d50',      // Deep brand green (CTAs, headings on tint)
    secondary: '#426f62',    // Brand green
    accent: '#8fb5a8',       // Bright green
    forest: '#234b40',
    text: '#626b60',         // Muted ink
    ink: '#1b231e',          // Deep green-black
    white: '#FFFFFF',
    background: '#ffffff',
    tint: '#f3f0e7',
    cardBg: '#FFFFFF',
    border: 'rgba(27, 35, 30, 0.08)',
    black: '#1b231e',
    blackSoft: '#131b16',
    onBlack: '#f4f7f5',
  },
  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Inter Tight', 'Inter', system-ui, sans-serif",
  },
  shadows: {
    sm: '0 18px 40px -28px rgba(27, 35, 30, 0.28)',
    md: '0 18px 38px -18px rgba(27, 35, 30, 0.16)',
    lg: '0 28px 56px -22px rgba(27, 35, 30, 0.22)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
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
