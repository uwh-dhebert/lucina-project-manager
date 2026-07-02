import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicit root to avoid lockfile detection issues when sibling bun.lock exists
    root: __dirname,
  },
};

export default nextConfig;
