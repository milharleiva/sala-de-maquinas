import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  allowedDevOrigins: ["26.225.5.164", "192.168.1.100", "localhost"],
  experimental: {
    // serverComponentsExternalPackages moved to serverExternalPackages
  },
};

export default nextConfig;
