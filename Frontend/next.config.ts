import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Keep Turbopack scoped to Frontend instead of inferring the root from
  // the repository and parent-directory lockfiles.
  turbopack: {
    root: process.cwd(),
  },

  experimental: {
    // Work around Next.js 16.4.x checking stale .next/dev/types route
    // validators through the TypeScript CLI when routes have changed.
    // Revisit this once the upstream stale-dev-types issue is fixed.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
