import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The property site (property/app) is styled with styled-components.
  compiler: { styledComponents: true },
  // The property API (property/server) is an Express app run by
  // app/api/property/[...path]/route.ts; keep its Node packages unbundled.
  serverExternalPackages: ["express", "pg", "serverless-http"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "easymovezone.s3.eu-west-3.idrivee2.com" },
      { protocol: "https", hostname: "s3.eu-west-3.idrivee2.com" },
      { protocol: "https", hostname: "*.blob.core.windows.net" },
      {
        protocol: "https",
        hostname:
          "br-crimson-silence-ai1l8fhm.storage.c-4.us-east-1.aws.neon.tech",
      },
    ],
  },
  async redirects() {
    const toHome = [
      "/purchase",
      "/own",
      "/mortgage",
      "/build",
      "/search",
      "/vendor",
      "/landlord",
      "/individual",
      "/cities",
      "/onboarding",
      "/relocate",
      "/marketplace",
      "/employers",
      "/driver",
      "/company",
      "/start",
      "/move",
      "/fleet",
      "/explore",
      "/settle",
      "/arrived",
      "/passport",
      "/fund",
      "/community",
      "/adviser",
      "/paths",
      "/destinations",
      "/connect",
      "/corporate",
      "/dashboard",
      "/index",
    ];

    const homeRedirects = toHome.flatMap((source) => [
      { source, destination: "/", permanent: true },
      { source: `${source}/:path*`, destination: "/", permanent: true },
    ]);

    return [
      ...homeRedirects,
      { source: "/profile/driver", destination: "/moving#my-moves", permanent: true },
      { source: "/profile/company", destination: "/moving#my-moves", permanent: true },
      {
        source: "/legal/independent-contractor",
        destination: "/moving/terms",
        permanent: true,
      },
      { source: "/cookies", destination: "/moving/cookies", permanent: true },
      // News is paused; temporary so it can come back without stale permanent redirects.
      { source: "/news", destination: "/", permanent: false },
      { source: "/news/:path*", destination: "/", permanent: false },
      { source: "/admin/news", destination: "/admin?section=accounts", permanent: false },
      // Property pages moved to /listings (Oct 2026); keep old links working.
      { source: "/property", destination: "/listings", permanent: true },
      { source: "/property/:path*", destination: "/listings/:path*", permanent: true },
      // The moving admin is part of /admin now.
      { source: "/admin/moving", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/moving/workers", destination: "/admin?section=crews", permanent: true },
      { source: "/admin/moving/enquiries", destination: "/admin?section=moving-enquiries", permanent: true },
      { source: "/admin/moving/operations", destination: "/admin?section=moving-ops", permanent: true },
      { source: "/admin/moving/users", destination: "/admin?section=accounts", permanent: true },
      { source: "/admin/workers", destination: "/admin?section=crews", permanent: true },
      { source: "/admin/enquiries", destination: "/admin?section=moving-enquiries", permanent: true },
      { source: "/admin/operations", destination: "/admin?section=moving-ops", permanent: true },
      { source: "/admin/users", destination: "/admin?section=accounts", permanent: true },
      { source: "/admin/jobs", destination: "/admin?section=accounts", permanent: true },
      {
        source: "/admin/jobs/:path*",
        destination: "/admin?section=accounts",
        permanent: true,
      },
      {
        source: "/admin/education",
        destination: "/admin?section=accounts",
        permanent: true,
      },
      {
        source: "/admin/education/:path*",
        destination: "/admin?section=accounts",
        permanent: true,
      },
      { source: "/app/:path*", destination: "/", permanent: true },
      { source: "/corp/:path*", destination: "/", permanent: true },
      { source: "/signup", destination: "/auth?mode=signup", permanent: false },
      { source: "/admin/kyc", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/cashouts", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/disputes", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/bookings", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/catalog", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/guides", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/services", destination: "/admin?section=moves", permanent: true },
      { source: "/admin/requests", destination: "/admin?section=moves", permanent: true },
      ...[
        "/jobs",
        "/sponsors",
        "/workspace",
        "/education",
        "/work-simulation",
        "/easymovescore",
        "/cv-builder",
        "/ats-friendly-cv",
        "/cover-letter-generator",
        "/career-change",
        "/ai-job-search",
        "/visa-sponsor-checker",
        "/jobs-in-uk",
        "/jobs-abroad",
        "/application-pack",
        "/specialist-support",
        "/alternatives/indeed",
        "/can-i-move",
        "/career-lab",
        "/assessments",
        "/path",
        "/practice",
      ].flatMap((source) => [
        { source, destination: "/", permanent: true },
        { source: `${source}/:path*`, destination: "/", permanent: true },
      ]),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // Any page URL that isn't a Next.js route (/, /listings/…, /verify/…,
      // /manage/…, /admin, /contact…) is the property site, routed in the
      // browser. Kept on one fixed route so navigation never remounts it.
      fallback: [{ source: "/:path((?!api(?:/|$)|_next/).*)", destination: "/property-app" }],
    };
  },
};

export default nextConfig;
