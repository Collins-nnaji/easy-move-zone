export const BRAND = {
  name: "EasyMoveZone",
  shortName: "EasyMoveZone",
  tagline: "Your move, made easy.",
  description:
    "Book trusted movers for your home, office and heavy items in Nigeria. Trucks, loading crews and packing help with clear pricing, starting in Lagos.",
  logo: "/emz.svg",
  logoAlt: "EasyMoveZone",
  /** Intrinsic aspect ratio of emz.svg (1440×515) — keeps the mark undistorted. */
  logoAspect: 1440 / 515,
  themeColor: "#2f5d50",
  backgroundColor: "#f6f3ec",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com",
} as const;
