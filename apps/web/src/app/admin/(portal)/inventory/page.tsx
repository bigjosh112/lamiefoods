import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Inventory & kettles",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Inventory route.
 *
 * Gated like the rest of the portal (GAP-009). Stock levels and thresholds are
 * internal operational data, so the check runs before the dynamic import and
 * the module is never evaluated in production.
 */
export default async function AdminInventoryPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { InventoryView } = await import("@/components/admin/inventory-view");
  return <InventoryView />;
}
