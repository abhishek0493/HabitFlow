import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // `motion` exports a large barrel; only pull in the parts we use.
    // (lucide-react and date-fns are optimized by Next automatically.)
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
