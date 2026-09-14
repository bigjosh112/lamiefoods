import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { getAdminSession } from "@/server/admin/session";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Settings route.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). The
 * values this page renders are real — what the site is actually configured
 * with — so it stays behind the session even though it prints no secret.
 *
 * The check runs before the dynamic import, so nothing below is evaluated
 * without a session.
 *
 * No product fetch any more: `listProductsForAdmin()` existed solely for the
 * storefront panel, which the owner removed on 2026-09-10. `getSettings()`
 * falls back to the constants in `packages/config/src/payment.ts` when no
 * database is configured, so it needs no `isDatabaseConfigured()` branch of its
 * own — that branch only existed to skip the product query.
 */
export default async function AdminSettingsPage() {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);

  const { SettingsView } = await import("@/components/admin/settings-view");
  const { getSettings } = await import("@/server/settings/repository");
  const { serverEnv } = await import("@/config/server-env");

  // notFound(), not redirect(): an unset ADMIN_EMAIL is a misconfiguration,
  // not an expired session. Bouncing to the login screen would loop, since
  // sign-in cannot work without it either.
  const email = serverEnv().ADMIN_EMAIL;
  if (!email) notFound();

  return <SettingsView paymentSettings={await getSettings()} adminEmail={email} />;
}
