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
    // The property marketplace and general Move/travel platform have both been
    // retired in favor of the visa-only product. Old URLs funnel into /visa;
    // informational pages go home.
    const toVisa = [
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
      "/move",
      "/relocate",
      "/relocate/hub",
      "/settle",
    ]
    const visaRedirects = toVisa.flatMap((source) => [
      { source, destination: "/visa", permanent: false },
      { source: `${source}/:path*`, destination: "/visa", permanent: false },
    ])

    return [
      ...visaRedirects,
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
