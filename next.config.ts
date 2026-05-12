import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL ?? '',
    DATABASE_URL: process.env.DATABASE_URL ?? '',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
