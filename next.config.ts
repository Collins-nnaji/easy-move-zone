import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'easymovezone.s3.eu-west-3.idrivee2.com',
      },
      {
        protocol: 'https',
        hostname: 's3.eu-west-3.idrivee2.com',
      },
    ],
  },
  async redirects() {
    return []
  },
};

export default nextConfig;
