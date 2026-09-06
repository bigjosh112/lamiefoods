import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Operations dashboard route.
 *
 * The gate lives HERE, before anything else, and the dashboard is behind a
 * dynamic import — both deliberately.
 *
 * An earlier version gated in the layout instead. That returned a correct 404,
 * but Next still rendered the page component, and the dashboard tree — names,
 * addresses, revenue — came back inside the RSC flight payload of the 404
 * response. A 404 that ships the data anyway is not a gate.
 *
 * Returning before the `import()` means the module is never evaluated, so no
 * data is read and nothing reaches the payload. Verified by fetching /admin
 * from a production build and grepping the response.
 *
 * REMOVE ONLY in the same change that adds server-side session checking
 * (GAP-009). Until then this is the sole thing keeping customer data off a
 * public URL.
 */
export default async function AdminDashboardPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { AdminDashboard } = await import("@/components/admin/admin-dashboard");
  return <AdminDashboard />;
}
