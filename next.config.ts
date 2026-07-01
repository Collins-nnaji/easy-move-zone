import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'easymovezone.s3.eu-west-3.idrivee2.com' },
      { protocol: 'https', hostname: 's3.eu-west-3.idrivee2.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
    ],
  },
  async redirects() {
    // The property marketplace has been retired. Old property/marketing URLs now
    // funnel into the Move app; informational pages go home.
    const toMove = [
      "/purchase",
      "/properties",
      "/own",
      "/mortgage",
      "/finance",
      "/build",
      "/sell",
      "/search",
      "/vendor",
      "/landlord",
      "/individual",
      "/services",
      "/cities",
      "/plan",
      "/onboarding",
    ]
    const moveRedirects = toMove.flatMap((source) => [
      { source, destination: "/move", permanent: false },
      { source: `${source}/:path*`, destination: "/move", permanent: false },
    ])

    return [
      ...moveRedirects,
      { source: "/relocate/hub", destination: "/move", permanent: false },
      { source: "/relocate/hub/:path*", destination: "/move", permanent: false },
      { source: "/relocate", destination: "/move", permanent: false },
      { source: "/settle", destination: "/move", permanent: false },
      { source: "/settle/:path*", destination: "/move", permanent: false },
      { source: "/index", destination: "/", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/pricing", destination: "/", permanent: false },
      { source: "/app/dashboard", destination: "/dashboard", permanent: false },
      { source: "/app/:path*", destination: "/dashboard", permanent: false },
      { source: "/connect", destination: "/", permanent: false },
      { source: "/community", destination: "/", permanent: false },
      { source: "/portal", destination: "/", permanent: false },
      { source: "/portal/:path*", destination: "/", permanent: false },
      { source: "/corporate", destination: "/", permanent: false },
      { source: "/corp/:path*", destination: "/", permanent: false },
      { source: "/signup", destination: "/auth?mode=signup", permanent: false },
    ]
  },
};

export default nextConfig;
