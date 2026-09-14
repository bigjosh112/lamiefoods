import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/server/admin/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Shell for the signed-in admin area — and, for now, its only protection.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS REDIRECTS TO LOGIN WITHOUT A SESSION.
 *
 * These pages show revenue, order values, customer names and delivery
 * addresses. `robots.txt` and `noindex` keep pages out of search results; they
 * do not stop a person visiting the URL directly.
 *
 * SUPERSEDES the earlier `NODE_ENV !== "development"` gate (see
 * docs/ai-memory/architecture.md's 2026-09-07 decision log and GAP-009 in
 * gaps.md): that compiled the whole area out of every deployment, which was
 * correct while no authentication existed, but also meant nobody — including
 * the owner — could ever use it. `getAdminSession()` verifies a signed,
 * unexpired session cookie (`server/admin/session.ts`) instead.
 *
 * It USED to answer 404, to avoid disclosing that a portal exists. That bought
 * nothing real — `/admin/login` is a public, prerendered page, so the portal's
 * existence was already discoverable — while making an ordinary 12-hour
 * expiry look to the owner like a broken site. It now redirects to the login
 * screen. The gate itself is unchanged: no session still means no page and no
 * data, only the response differs.
 *
 * This layout-level gate is defense in depth for `AdminShell`, NOT the whole
 * story: each page repeats its own gate before its own dynamic import — see
 * that page's comment for why the layout alone was proven insufficient
 * (GAP-009's RSC-payload leak).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);

  return <AdminShell>{children}</AdminShell>;
}
