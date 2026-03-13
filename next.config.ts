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
    return [
      { source: "/services", destination: "/listings", permanent: true },
      { source: "/markets", destination: "/cities", permanent: true },
      { source: "/suite", destination: "/", permanent: true },
      { source: "/help", destination: "/contact", permanent: true },
      { source: "/support", destination: "/contact", permanent: true },
      { source: "/fees", destination: "/listings", permanent: true },
      { source: "/rsa", destination: "/listings", permanent: true },
      { source: "/destinations", destination: "/cities", permanent: true },
      { source: "/properties", destination: "/listings", permanent: true },
      { source: "/how-it-works", destination: "/", permanent: true },
      { source: "/qualify", destination: "/contact", permanent: true },
      { source: "/products", destination: "/listings", permanent: true },
      { source: "/nhf", destination: "/listings", permanent: true },
      { source: "/document-support", destination: "/contact", permanent: true },
      { source: "/calculator", destination: "/contact", permanent: true },
      { source: "/relocate", destination: "/hub", permanent: true },
      { source: "/relocate/hub", destination: "/hub", permanent: true },
      { source: "/mortgage", destination: "/hub", permanent: true },
      { source: "/marketplace", destination: "/hub", permanent: true },
    ]
  },
};

export default nextConfig;
