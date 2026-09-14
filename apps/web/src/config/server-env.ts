import "server-only";

import { z } from "zod";

/**
 * Server-only environment. Deliberately separate from `config/env.ts`.
 *
 * `config/env.ts` holds `NEXT_PUBLIC_*` values, every one of which is inlined
 * into the JavaScript bundle and readable by any visitor. The values here are
 * the opposite: a database connection string and a mail API key. If either ever
 * reached the client bundle it would be a credential leak, not a bug.
 *
 * The `server-only` import above is the enforcement, not a comment — importing
 * this module from a Client Component fails the build. Never re-export anything
 * from here through a file that a component imports.
 *
 * Unlike the client schema, this is validated lazily rather than at module load.
 * The site must still build and render without a database configured: the
 * storefront is public and mostly static, and a missing key should disable
 * ordering, not take down the whole site.
 */
const serverEnvSchema = z.object({
  /**
   * Postgres connection string. Supabase today, Railway later — so this is a
   * plain Postgres URL and nothing in the codebase may depend on a
   * Supabase-specific feature. Moving hosts must be a change to this value only.
   *
   * On Supabase use the TRANSACTION POOLER string (port 6543), not the direct
   * connection: serverless functions open a connection per invocation and will
   * exhaust the direct-connection limit.
   */
  DATABASE_URL: z.string().min(1).optional(),
  /** Resend API key. Absent means "do not send"; orders still save. */
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  /** Verified sender, e.g. "Lamie Foods <orders@lamiefoods.com>". */
  ORDER_EMAIL_FROM: z.string().min(1).optional(),
  /** Where the shop's own new-order notification goes. */
  ORDER_EMAIL_TO: z.email().optional(),

  /**
   * Paystack SECRET key (`sk_...`). Server-only, by construction — the public
   * key (`pk_...`) is the one that belongs in `config/env.ts`. Used to
   * initialise/verify transactions and to check the webhook signature.
   */
  PAYSTACK_SECRET_KEY: z.string().startsWith("sk_").optional(),

  /**
   * Admin sign-in. One shared credential for a single-owner business —
   * see `server/admin/auth.ts` for how the hash is generated and checked.
   * Absent means the admin panel cannot be signed into; it stays 404'd.
   */
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  /** Signs the admin session cookie. Absent means no session can be issued. */
  ADMIN_SESSION_SECRET: z.string().min(16).optional(),

  /**
   * Vercel Blob's long-lived read-write token — required by `handleUpload`
   * to issue short-lived client upload tokens (@vercel/blob's own doc: "not
   * needed by handleUploadPresigned, which works with OIDC" — this app uses
   * the plain `handleUpload` client-upload flow, so this IS needed). Set
   * automatically once Blob storage is enabled on the Vercel project;
   * `vercel env pull` for local dev.
   */
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  // An env var that's merely present-but-blank (`KEY=` in a .env file) must be
  // treated the same as unset, not parsed as a value in its own right.
  const emptyToUndefined = (value: string | undefined) =>
    value === "" ? undefined : value;

  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: emptyToUndefined(process.env.DATABASE_URL),
    RESEND_API_KEY: emptyToUndefined(process.env.RESEND_API_KEY),
    ORDER_EMAIL_FROM: emptyToUndefined(process.env.ORDER_EMAIL_FROM),
    ORDER_EMAIL_TO: emptyToUndefined(process.env.ORDER_EMAIL_TO),
    PAYSTACK_SECRET_KEY: emptyToUndefined(process.env.PAYSTACK_SECRET_KEY),
    ADMIN_EMAIL: emptyToUndefined(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD_HASH: emptyToUndefined(process.env.ADMIN_PASSWORD_HASH),
    ADMIN_SESSION_SECRET: emptyToUndefined(process.env.ADMIN_SESSION_SECRET),
    BLOB_READ_WRITE_TOKEN: emptyToUndefined(process.env.BLOB_READ_WRITE_TOKEN),
  });

  if (!parsed.success) {
    // The message names keys only. Printing the parsed values here would write
    // a connection string into the server log.
    throw new Error(
      `Invalid server environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }

  cached = parsed.data;
  return cached;
}

/** Ordering needs somewhere to store the order; without it, checkout must not pretend. */
export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv().DATABASE_URL);
}

/** Mail is optional by design — an email outage must never lose an order. */
export function isEmailConfigured(): boolean {
  const env = serverEnv();
  return Boolean(env.RESEND_API_KEY && env.ORDER_EMAIL_FROM);
}

/** Without this, Paystack payment cannot be verified — checkout must not offer it. */
export function isPaystackConfigured(): boolean {
  return Boolean(serverEnv().PAYSTACK_SECRET_KEY);
}

/** Without email + session secret + database, nobody can sign in.
 *  Password hash lives in `admin_auth` (bootstrapped from ADMIN_PASSWORD_HASH). */
export function isAdminAuthConfigured(): boolean {
  const env = serverEnv();
  return Boolean(env.ADMIN_EMAIL && env.ADMIN_SESSION_SECRET && env.DATABASE_URL);
}

/** Without this, the admin image-upload control stays honestly disabled. */
export function isBlobStorageConfigured(): boolean {
  return Boolean(serverEnv().BLOB_READ_WRITE_TOKEN);
}
