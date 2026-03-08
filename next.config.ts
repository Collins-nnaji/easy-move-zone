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
    ],
  },
  async redirects() {
    return [
      { source: "/suite", destination: "/", permanent: true },
      { source: "/fees", destination: "/services", permanent: true },
      { source: "/rsa", destination: "/services", permanent: true },
      { source: "/destinations", destination: "/markets", permanent: true },
      { source: "/properties", destination: "/", permanent: true },
      { source: "/how-it-works", destination: "/", permanent: true },
      { source: "/qualify", destination: "/contact", permanent: true },
      { source: "/products", destination: "/services", permanent: true },
      { source: "/nhf", destination: "/services", permanent: true },
      { source: "/document-support", destination: "/contact", permanent: true },
      { source: "/calculator", destination: "/contact", permanent: true },
    ]
  },
};

export default nextConfig;
