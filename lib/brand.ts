export const BRAND = {
  name: "EasyMoveZone",
  shortName: "EasyMoveZone",
  tagline: "The modern way to rent, verify and manage a home.",
  description:
    "Verified homes to rent across Nigeria. Check the landlord before you pay, read the neighbourhood clearly, and hand the letting to us when you own.",
  logo: "/emz.svg",
  logoAlt: "EasyMoveZone",
  /** Intrinsic aspect ratio of emz.svg (1440×515) — keeps the mark undistorted. */
  logoAspect: 1440 / 515,
  themeColor: "#b85a30",
  backgroundColor: "#f4f3ef",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com",
} as const;
