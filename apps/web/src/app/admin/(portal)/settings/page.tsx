import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

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
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009), and
 * this one matters more than the sample screens: the values it renders are
 * REAL. It reports which environment variables are set and what the site is
 * configured with, which is reconnaissance if it were public — even though it
 * prints no secret.
 *
 * The check runs before the dynamic import, so the module and its environment
 * readout are never evaluated without a session.
 */
export default async function AdminSettingsPage() {
  if (!(await getAdminSession())) notFound();

  const { SettingsView } = await import("@/components/admin/settings-view");
  const { getSettings } = await import("@/server/settings/repository");

  if (!isDatabaseConfigured()) {
    const paymentSettings = await getSettings();
    return <SettingsView products={[]} paymentSettings={paymentSettings} />;
  }

  const { listProductsForAdmin } = await import("@/server/products/repository");
  const [products, paymentSettings] = await Promise.all([
    listProductsForAdmin(),
    getSettings(),
  ]);
  return <SettingsView products={products} paymentSettings={paymentSettings} />;
}
