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
      { source: "/individual", destination: "/explore", permanent: false },
      { source: "/individual/:path*", destination: "/explore", permanent: false },
      { source: "/services", destination: "/explore", permanent: false },
      { source: "/index", destination: "/explore", permanent: false },
      { source: "/cities", destination: "/explore", permanent: false },
      { source: "/cities/:path*", destination: "/explore", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/pricing", destination: "/", permanent: false },
      { source: "/app/dashboard", destination: "/dashboard", permanent: false },
      { source: "/app/:path*", destination: "/dashboard", permanent: false },
      { source: "/plan", destination: "/explore", permanent: false },
      { source: "/connect", destination: "/", permanent: false },
      { source: "/portal", destination: "/", permanent: false },
      { source: "/portal/:path*", destination: "/", permanent: false },
      { source: "/corporate", destination: "/", permanent: false },
      { source: "/corp/:path*", destination: "/", permanent: false },
      { source: "/relocate/:path*", destination: "/explore", permanent: false },
      { source: "/signup", destination: "/auth?mode=signup", permanent: false },
    ]
  },
};

export default nextConfig;
