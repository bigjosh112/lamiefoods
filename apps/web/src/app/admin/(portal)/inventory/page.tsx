import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Inventory route.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). Stock
 * Stock levels and thresholds are real operational data as of 2026-09-10
 * (`product_packs.stock_quantity`/`restock_threshold`), so the check runs
 * before the dynamic import and the module is never evaluated without a session.
 */
export default async function AdminInventoryPage() {
  if (!(await getAdminSession())) notFound();

  const { InventoryView } = await import("@/components/admin/inventory-view");

  if (!isDatabaseConfigured()) {
    return <InventoryView products={[]} />;
  }

  const { listProductsForAdmin } = await import("@/server/products/repository");
  const products = await listProductsForAdmin();
  return <InventoryView products={products} />;
}
