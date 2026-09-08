import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/server/admin/session";
import { isBlobStorageConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false, nocache: true },
};

// Security-critical: never let this bake as a static build artifact. See
// server/admin/session.ts for why relying on cookies() usage alone is
// too fragile for a gate this important.
export const dynamic = "force-dynamic";

/**
 * Create-product route.
 *
 * `getAdminSession()` SUPERSEDES the earlier `NODE_ENV` check (GAP-009). The
 * check runs before the dynamic import so the form and its copy are never
 * evaluated, and therefore never reach the flight payload, when the gate is
 * closed.
 */
export default async function AdminNewProductPage() {
  if (!(await getAdminSession())) notFound();

  const { NewProductView } = await import("@/components/admin/new-product-view");
  return <NewProductView blobConfigured={isBlobStorageConfigured()} />;
}
