import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { baseConfig } from "./base.js";

/**
 * Flat config for the Next.js app: shared base rules plus Next's
 * core-web-vitals and TypeScript presets.
 * @type {import("eslint").Linter.Config[]}
 */
export const nextConfig = [
  ...baseConfig,
  ...coreWebVitals,
  ...nextTypescript,
  {
    // .next-verify is the isolated build output (NEXT_DIST_DIR) — generated
    // code, same as .next, and must not be linted.
    ignores: [".next/**", ".next-verify/**", "next-env.d.ts"],
  },
];

export default nextConfig;
