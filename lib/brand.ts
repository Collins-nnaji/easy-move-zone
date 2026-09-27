export const BRAND = {
  name: "EasyMoveZone",
  shortName: "EasyMoveZone",
  tagline: "Move careers. Move countries.",
  description:
    "EasyMoveZone helps you find the career you can transition into, and the employers that can sponsor you to get there.",
  logo: "/emz.svg",
  logoAlt: "EasyMoveZone",
  /** Intrinsic aspect ratio of emz.svg (1440×515) — keeps the mark undistorted. */
  logoAspect: 1440 / 515,
  themeColor: "#2f5d50",
  backgroundColor: "#f6f3ec",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com",
} as const;
