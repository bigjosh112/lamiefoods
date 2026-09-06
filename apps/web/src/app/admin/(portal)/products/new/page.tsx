import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Create-product route.
 *
 * Gated like the rest of the portal (GAP-009 — there is no authentication yet).
 * The check runs before the dynamic import so the form and its copy are never
 * evaluated, and therefore never reach the flight payload, when the gate is
 * closed.
 */
export default async function AdminNewProductPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { NewProductView } = await import("@/components/admin/new-product-view");
  return <NewProductView />;
}
