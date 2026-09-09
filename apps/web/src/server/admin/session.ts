import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/server-env";

/**
 * A stateless, signed admin session — no session table.
 *
 * The cookie value is `${expiresAtEpochSeconds}.${hmac}`, where the HMAC is
 * computed over the expiry using `ADMIN_SESSION_SECRET`. Anyone holding a
 * valid cookie can prove it was issued by this server and hasn't expired,
 * without the server needing to remember having issued it — appropriate for
 * a single-owner business where "log out everywhere" isn't a real need yet.
 * If that changes, this is the file to add a revocation list to.
 *
 * The cookie's path is `/` (site-wide), not `/admin` — an earlier version
 * scoped it to `/admin` intending to keep it off customer-facing routes, but
 * that was a real bug, not a security improvement: `/admin` is not a path
 * prefix of `/api/admin/...` (a sibling path, not a child), so the browser
 * silently withheld the cookie from every admin write call — login still
 * "worked" and every admin PAGE still gated correctly (both hit `/admin/...`
 * directly), but "mark as paid", status updates, product create/edit and
 * sign-out all failed with a confusing 401 the moment they were exercised
 * end-to-end, not just typechecked. `httpOnly` + `sameSite: "lax"` are what
 * actually protect this cookie; scoping by path added no real security here
 * since the customer-facing order flow (see `lib/orders`) never uses a
 * cookie at all — it's a bearer token in a URL, so there is nothing for this
 * cookie to collide with regardless of its path.
 */
const COOKIE_NAME = "lamie_admin_session";
const SESSION_SECONDS = 60 * 60 * 12; // 12h
const REMEMBER_SECONDS = 60 * 60 * 24 * 30; // 30d

function sign(expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

/** True in any deployed environment, not just Vercel's NODE_ENV=production —
 *  matches the same check already used for the admin portal gate. */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Sets the session cookie. Must be called from a Route Handler or Server
 * Function — Next only allows writing cookies there, never during Server
 * Component rendering (`node_modules/next/dist/docs/01-app/03-api-reference/
 * 04-functions/cookies.md`).
 *
 * @throws if ADMIN_SESSION_SECRET is unset — callers should check
 *   `isAdminAuthConfigured()` first and fail honestly, not call this blind.
 */
export async function setAdminSessionCookie(rememberMe: boolean): Promise<void> {
  const { ADMIN_SESSION_SECRET } = serverEnv();
  if (!ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is not set.");

  const maxAge = rememberMe ? REMEMBER_SECONDS : SESSION_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  const value = `${expiresAt}.${sign(expiresAt, ADMIN_SESSION_SECRET)}`;

  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Explicit path/maxAge=0 rather than `.delete(name)` — deletion must match
 *  the exact path the cookie was set with, or the browser won't clear it. */
export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * True if the incoming request carries a validly-signed, unexpired session.
 * Read-only — safe to call from a Server Component page (the gate) or a
 * Route Handler (guarding a write). Returns `false`, never throws, so a page
 * can gate on it with a plain `if (!(await getAdminSession()))`.
 *
 * `cookies()` is called FIRST, unconditionally — even when
 * `ADMIN_SESSION_SECRET` turns out to be unset. `cookies()` is what tells
 * Next this route needs per-request rendering; calling it only after an
 * early return meant that, in a build with the secret unset, Next never saw
 * a dynamic API on this code path and baked the page as a permanently
 * cached static 404 — fail-safe, but wrong, and it would silently keep
 * serving that stale response even after the secret was later set, until
 * the next deploy. Every admin page ALSO sets `export const dynamic =
 * "force-dynamic"` directly, as defense in depth — this function should not
 * be the only thing standing between a security-critical route and an
 * accidental static build.
 */
export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();

  const { ADMIN_SESSION_SECRET } = serverEnv();
  if (!ADMIN_SESSION_SECRET) return false;

  const cookie = store.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const [expiresAtRaw, signature] = cookie.value.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000))
    return false;

  const expected = Buffer.from(sign(expiresAt, ADMIN_SESSION_SECRET), "hex");
  const provided = Buffer.from(signature, "hex");
  if (expected.length !== provided.length) return false;

  return timingSafeEqual(expected, provided);
}
