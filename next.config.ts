import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["@prisma/client", "prisma"],
  transpilePackages: ["react-markdown", "remark-gfm"],
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "next-themes"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/terminals/**",
          "**/mcps/**",
          "**/ProjectDocs/**",
          "**/.git/**",
          "**/.idea/**",
        ],
      };
      // Reuse cached webpack output between restarts to reduce compile + memory churn.
      config.cache = {
        type: "filesystem",
        cacheDirectory: path.join(projectRoot, ".next", "cache", "webpack"),
        buildDependencies: {
          config: [path.join(projectRoot, "next.config.ts")],
        },
      };
    }
    return config;
  },
};

export default nextConfig;