import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Product catalogue route — real data now.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). The
 * check runs before the dynamic import AND before the DB read, so nothing is
 * evaluated when the gate is closed.
 */
export default async function AdminProductsPage() {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);

  const { ProductsView } = await import("@/components/admin/products-view");

  if (!isDatabaseConfigured()) {
    return <ProductsView products={[]} />;
  }

  const { listProductsForAdmin } = await import("@/server/products/repository");
  const products = await listProductsForAdmin();

  return <ProductsView products={products} />;
}
