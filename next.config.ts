import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In Next.js 16, serverExternalPackages replaces experimental.serverComponentsExternalPackages
  serverExternalPackages: ['better-sqlite3'],
  // Empty turbopack config to silence warning (we don't need custom config)
  turbopack: {}
};

export default nextConfig;
