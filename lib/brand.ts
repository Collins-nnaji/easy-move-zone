export const BRAND = {
  name: "EasyMoveZone",
  shortName: "EasyMoveZone",
  tagline: "Move Nigerian food. Across states. Across borders.",
  description:
    "EasyMoveZone books trucks for Nigerian farm produce between states, lists bulk lots by the tonne, and carries export-grade lots to port.",
  logo: "/emz.svg",
  logoAlt: "EasyMoveZone",
  /** Intrinsic aspect ratio of emz.svg (1440×515) — keeps the mark undistorted. */
  logoAspect: 1440 / 515,
  themeColor: "#2f5d50",
  backgroundColor: "#f6f3ec",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com",
} as const;
