export const BRAND = {
  name: "EasyMoveZone",
  shortName: "EasyMoveZone",
  tagline: "Find, finance, and buy your next car across the US, UK, and Nigeria",
  description:
    "EasyMoveZone is a car marketplace for the United States, the United Kingdom, and Nigeria. Browse local stock, follow imports in transit, and buy CFR vehicles moving between those markets.",
  logo: "/emz.svg",
  logoAlt: "EasyMoveZone",
  /** Intrinsic aspect ratio of emz.svg (1440×515) — keeps the mark undistorted. */
  logoAspect: 1440 / 515,
  themeColor: "#e0511f",
  backgroundColor: "#f6f3ec",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com",
} as const;
