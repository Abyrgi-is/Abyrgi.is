import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds for prototype deployment
    // Re-enable before production by removing this option
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds for prototype deployment
    // Re-enable before production by removing this option
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
