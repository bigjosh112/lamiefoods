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

  // `next build` and `next dev` share `.next` by default, so running a build
  // while a dev server is live corrupts that server's state — it carries on
  // serving, but with a stale, effectively empty stylesheet. Setting
  // NEXT_DIST_DIR lets a verification build write somewhere else and leave a
  // running dev server alone.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  poweredByHeader: false,
};

export default nextConfig;
