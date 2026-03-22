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
    return [
      { source: "/individual", destination: "/search", permanent: false },
      { source: "/individual/:path*", destination: "/search", permanent: false },
      { source: "/services", destination: "/search", permanent: false },
      { source: "/contact", destination: "/about", permanent: false },
      { source: "/index", destination: "/search", permanent: false },
      { source: "/cities", destination: "/search", permanent: false },
      { source: "/cities/:path*", destination: "/search", permanent: false },
      { source: "/pricing", destination: "/about", permanent: false },
      { source: "/app/dashboard", destination: "/dashboard", permanent: false },
      { source: "/app/:path*", destination: "/dashboard", permanent: false },
      { source: "/plan", destination: "/search", permanent: false },
      { source: "/connect", destination: "/about", permanent: false },
      { source: "/community", destination: "/about", permanent: false },
      { source: "/onboarding", destination: "/auth", permanent: false },
      { source: "/corporate", destination: "/portal", permanent: false },
      { source: "/corp/:path*", destination: "/portal", permanent: false },
      { source: "/relocate/:path*", destination: "/search", permanent: false },
      { source: "/signup", destination: "/auth?mode=signup", permanent: false },
    ]
  },
};

export default nextConfig;
