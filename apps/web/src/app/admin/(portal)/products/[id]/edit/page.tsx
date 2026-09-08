import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isBlobStorageConfigured, isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is too
// fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Edit-product route — the page `ADMIN_ROUTES.editProduct(id)` pointed at
 * with no file behind it until now.
 *
 * The `[id]` segment holds the product's slug, same convention as orders'
 * `[id]` holding the human reference — safe to look up directly here because
 * the session gate below already ran.
 */
export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getAdminSession())) notFound();
  if (!isDatabaseConfigured()) notFound();

  const { id } = await params;
  const { getProductForAdmin } = await import("@/server/products/repository");

  const product = await getProductForAdmin(id);
  if (!product) notFound();

  const { EditProductView } = await import("@/components/admin/edit-product-view");
  return <EditProductView product={product} blobConfigured={isBlobStorageConfigured()} />;
}
