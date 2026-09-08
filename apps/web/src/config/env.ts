import { z } from "zod";

/**
 * Client-visible environment. Validated once at module load so a missing or
 * malformed value fails the build loudly instead of surfacing as `undefined`
 * somewhere deep in a component.
 *
 * Next inlines `process.env.NEXT_PUBLIC_*` at build time only for full literal
 * references, so each key must be written out rather than looked up dynamically.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL" })
    .default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.url().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z
    .string()
    .startsWith("pk_", "Only the Paystack PUBLIC key belongs in the frontend")
    .optional(),
});

/** An env var that's merely present-but-blank (`KEY=` in a .env file) must be
 *  treated the same as unset, not parsed as a value in its own right. */
const emptyToUndefined = (value: string | undefined) =>
  value === "" ? undefined : value;

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_API_URL: emptyToUndefined(process.env.NEXT_PUBLIC_API_URL),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: emptyToUndefined(
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  ),
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;

/** Strip any trailing slash so URL joins never produce a double slash. */
export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
