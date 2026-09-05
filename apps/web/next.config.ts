import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Workspace packages ship raw TypeScript, so Next must compile them itself.
  transpilePackages: ["@lamiefoods/ui", "@lamiefoods/types", "@lamiefoods/config"],

  images: {
    // Modern formats first; Next falls back automatically for older browsers.
    formats: ["image/avif", "image/webp"],
    // Remote product photography hosts get added here once assets are supplied.
    remotePatterns: [],
  },

  // Fail the production build on type errors rather than shipping them.
  // Next 16 dropped build-time linting, so `turbo run lint` covers that
  // separately and must stay part of CI.
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,
};

export default nextConfig;
