import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/server-env";

/**
 * Single shared admin credential — one owner, no team accounts today (Q21
 * named no roles). Password hashing uses Node's built-in `scrypt`, so this
 * needs zero new dependency (house rule 11: audit every new one — the
 * cheapest audit is not adding it).
 *
 * `ADMIN_PASSWORD_HASH` format is `salt:hash`, both hex, both from `scrypt`.
 * To generate one for a chosen password, run:
 *
 *   node -e "
 *     const { scryptSync, randomBytes } = require('crypto');
 *     const password = 'your-chosen-password';
 *     const salt = randomBytes(16).toString('hex');
 *     const hash = scryptSync(password, salt, 64).toString('hex');
 *     console.log(salt + ':' + hash);
 *   "
 *
 * Set the printed value as `ADMIN_PASSWORD_HASH`, and the matching address
 * as `ADMIN_EMAIL`. Never commit either — both are secrets.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}

/**
 * Deliberately non-specific about which part was wrong — the login form
 * already renders one generic message either way, so a wrong email and a
 * wrong password must be indistinguishable here too, or the constant-time
 * comparison below is pointless (see `login-schema.ts`'s existing comment on
 * why staff-email enumeration matters).
 */
export function verifyCredentials(email: string, password: string): boolean {
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = serverEnv();
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) return false;

  // Constant-time email compare too — a fast-reject on a mismatched email
  // would let a timing attack narrow down the configured address.
  const emailMatches = timingSafeEqualStrings(
    email.trim().toLowerCase(),
    ADMIN_EMAIL.toLowerCase(),
  );
  const passwordMatches = verifyPassword(password, ADMIN_PASSWORD_HASH);

  return emailMatches && passwordMatches;
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
