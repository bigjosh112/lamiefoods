import "server-only";

import { timingSafeEqual } from "node:crypto";
import { serverEnv, isDatabaseConfigured } from "@/config/server-env";
import {
  getOrBootstrapPasswordHash,
  verifyPassword,
} from "@/server/admin/password";

/**
 * Single shared admin credential — one owner, no team accounts today (Q21
 * named no roles). Password hashing uses Node's built-in `scrypt`, so this
 * needs zero new dependency (house rule 11: audit every new one — the
 * cheapest audit is not adding it).
 *
 * Live hash is stored in `admin_auth` (see `server/admin/password.ts`). Env
 * `ADMIN_PASSWORD_HASH` is only a one-time bootstrap when that table is empty.
 *
 * Historical generate recipe (still valid for seeding env / bootstrap):
 *
 *   node -e "
 *     const { scryptSync, randomBytes } = require('crypto');
 *     const password = 'your-chosen-password';
 *     const salt = randomBytes(16).toString('hex');
 *     const hash = scryptSync(password, salt, 64).toString('hex');
 *     console.log(salt + ':' + hash);
 *   "
 */

export { hashPassword } from "@/server/admin/password";

/**
 * Deliberately non-specific about which part was wrong — the login form
 * already renders one generic message either way, so a wrong email and a
 * wrong password must be indistinguishable here too, or the constant-time
 * comparison below is pointless (see `login-schema.ts`'s existing comment on
 * why staff-email enumeration matters).
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const { ADMIN_EMAIL } = serverEnv();
  if (!ADMIN_EMAIL || !isDatabaseConfigured()) return false;

  const storedHash = await getOrBootstrapPasswordHash();
  if (!storedHash) return false;

  // Constant-time email compare too — a fast-reject on a mismatched email
  // would let a timing attack narrow down the configured address.
  const emailMatches = timingSafeEqualStrings(
    email.trim().toLowerCase(),
    ADMIN_EMAIL.toLowerCase(),
  );
  const passwordMatches = verifyPassword(password, storedHash);

  return emailMatches && passwordMatches;
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
