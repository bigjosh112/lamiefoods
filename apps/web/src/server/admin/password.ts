import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { serverEnv, isDatabaseConfigured } from "@/config/server-env";
import { db } from "@/server/db/client";

/**
 * Admin credential storage.
 *
 * Password hash lives in `admin_auth` so forgot/reset can update it. Env
 * `ADMIN_PASSWORD_HASH` is only a bootstrap seed when the table has no row.
 */

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}

function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Active password hash: DB row first; otherwise seed from env once.
 * Returns null when neither exists (auth cannot succeed).
 */
export async function getOrBootstrapPasswordHash(): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;

  const sql = db();
  const existing = await sql`
    select password_hash from admin_auth where id = true limit 1
  `;
  if (existing[0]?.password_hash) {
    return existing[0].password_hash as string;
  }

  const { ADMIN_PASSWORD_HASH } = serverEnv();
  if (!ADMIN_PASSWORD_HASH) return null;

  await sql`
    insert into admin_auth (id, password_hash, updated_at)
    values (true, ${ADMIN_PASSWORD_HASH}, now())
    on conflict (id) do nothing
  `;

  const after = await sql`
    select password_hash from admin_auth where id = true limit 1
  `;
  return (after[0]?.password_hash as string | undefined) ?? null;
}

export async function setPasswordHash(passwordHash: string): Promise<void> {
  const sql = db();
  await sql`
    insert into admin_auth (id, password_hash, reset_token_hash, reset_expires_at, updated_at)
    values (true, ${passwordHash}, null, null, now())
    on conflict (id) do update set
      password_hash = excluded.password_hash,
      reset_token_hash = null,
      reset_expires_at = null,
      updated_at = now()
  `;
}

/**
 * Creates a one-time reset token. Returns the raw token for the email link,
 * or null if there is no password row to attach it to (bootstrap first).
 */
export async function createResetToken(): Promise<string | null> {
  const hash = await getOrBootstrapPasswordHash();
  if (!hash) return null;

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  const sql = db();
  await sql`
    update admin_auth set
      reset_token_hash = ${tokenHash},
      reset_expires_at = ${expiresAt},
      updated_at = now()
    where id = true
  `;

  return rawToken;
}

/**
 * Validates the raw token, sets a new password hash, clears the reset fields.
 * Returns false for unknown/expired tokens.
 */
export async function consumeResetToken(
  rawToken: string,
  newPassword: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  const tokenHash = hashResetToken(rawToken);
  const sql = db();
  const rows = await sql`
    select reset_token_hash, reset_expires_at
    from admin_auth
    where id = true
    limit 1
  `;
  const row = rows[0];
  if (!row?.reset_token_hash || !row.reset_expires_at) return false;

  const storedHash = row.reset_token_hash as string;
  const expiresAt = new Date(row.reset_expires_at as string | Date);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    return false;
  }

  const a = Buffer.from(storedHash);
  const b = Buffer.from(tokenHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const passwordHash = hashPassword(newPassword);
  await sql`
    update admin_auth set
      password_hash = ${passwordHash},
      reset_token_hash = null,
      reset_expires_at = null,
      updated_at = now()
    where id = true
  `;
  return true;
}
