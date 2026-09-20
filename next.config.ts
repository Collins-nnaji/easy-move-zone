import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'easymovezone.s3.eu-west-3.idrivee2.com' },
      { protocol: 'https', hostname: 's3.eu-west-3.idrivee2.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
      { protocol: 'https', hostname: 'br-crimson-silence-ai1l8fhm.storage.c-4.us-east-1.aws.neon.tech' },
      { protocol: 'https', hostname: '*.storage.c-4.us-east-1.aws.neon.tech' },
    ],
  },
  async redirects() {
    // Legacy property / relocation URLs → logistics marketing home.
    const toHome = [
      "/purchase",
      "/properties",
      "/own",
      "/mortgage",
      "/build",
      "/vendor",
      "/landlord",
      "/individual",
      "/cities",
      "/plan",
      "/onboarding",
    ]
    const homeRedirects = toHome.flatMap((source) => [
      { source, destination: "/", permanent: false },
      { source: `${source}/:path*`, destination: "/", permanent: false },
    ])

    return [
      ...homeRedirects,
      { source: "/relocate/hub", destination: "/cars", permanent: false },
      { source: "/relocate/hub/:path*", destination: "/cars", permanent: false },
      { source: "/relocate", destination: "/cars", permanent: false },
      { source: "/settle", destination: "/", permanent: false },
      { source: "/settle/:path*", destination: "/", permanent: false },
      { source: "/index", destination: "/", permanent: false },
      { source: "/pricing", destination: "/cars#finance", permanent: false },
      { source: "/search", destination: "/cars", permanent: false },
      { source: "/search/:path*", destination: "/cars", permanent: false },
      { source: "/quote", destination: "/cars#finance", permanent: false },
      { source: "/finance", destination: "/cars#finance", permanent: false },
      { source: "/finance/:path*", destination: "/cars#finance", permanent: false },
      { source: "/saved", destination: "/account#saved", permanent: false },
      { source: "/saved/:path*", destination: "/account#saved", permanent: false },
      { source: "/services", destination: "/how-it-works", permanent: false },
      { source: "/connect", destination: "/contact", permanent: false },
      { source: "/community", destination: "/", permanent: false },
      { source: "/portal", destination: "/app", permanent: false },
      { source: "/portal/:path*", destination: "/app", permanent: false },
      { source: "/corporate", destination: "/", permanent: false },
      { source: "/corp/:path*", destination: "/", permanent: false },
      { source: "/signup", destination: "/auth?mode=signup", permanent: false },
      // Unified portal — legacy move/fleet apps
      { source: "/move", destination: "/app", permanent: false },
      { source: "/move/shifts", destination: "/app/legs", permanent: false },
      { source: "/move/schedule", destination: "/app/legs", permanent: false },
      { source: "/move/wallet", destination: "/app/pay", permanent: false },
      { source: "/move/vault", destination: "/app/docs", permanent: false },
      { source: "/move/:path*", destination: "/app", permanent: false },
      { source: "/fleet", destination: "/app", permanent: false },
      { source: "/fleet/:path*", destination: "/app", permanent: false },
      { source: "/dashboard", destination: "/app", permanent: false },
      { source: "/dashboard/:path*", destination: "/app", permanent: false },
      { source: "/app/dashboard", destination: "/app", permanent: false },
    ]
  },
};

export default nextConfig;
