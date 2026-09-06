import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Products & SKUs",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Product catalogue route.
 *
 * Gated like the rest of the portal. This screen carries less personal data
 * than orders — product names and prices are public — but stock levels and
 * pipeline products are internal, and the whole area stays closed until there
 * is real authentication (GAP-009).
 *
 * The check runs before the dynamic import, so nothing is evaluated when the
 * gate is closed.
 */
export default async function AdminProductsPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { ProductsView } = await import("@/components/admin/products-view");
  return <ProductsView />;
}
