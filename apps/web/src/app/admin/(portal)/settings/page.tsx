import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Settings route.
 *
 * Gated like the rest of the portal (GAP-009), and this one matters more than
 * the sample screens: the values it renders are REAL. It reports which
 * environment variables are set and what the site is configured with, which is
 * reconnaissance if it were public — even though it prints no secret.
 *
 * The check runs before the dynamic import, so the module and its environment
 * readout are never evaluated in production.
 */
export default async function AdminSettingsPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { SettingsView } = await import("@/components/admin/settings-view");
  return <SettingsView />;
}
