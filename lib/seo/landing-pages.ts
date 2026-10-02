/** Public moving pages. Drives the sitemap and footer. */
export const LANDING_PAGES = [
  { href: "/services", label: "Moving services", priority: 0.9 },
  { href: "/book", label: "Book a move", priority: 0.9 },
  { href: "/coverage", label: "Lagos coverage", priority: 0.8 },
  { href: "/track", label: "Track my move", priority: 0.7 },
  { href: "/partners", label: "Become a partner", priority: 0.6 },
] as const;
export type LandingHref = (typeof LANDING_PAGES)[number]["href"];
export const LANDING_HREFS: readonly string[] = LANDING_PAGES.map(
  (page) => page.href,
);
