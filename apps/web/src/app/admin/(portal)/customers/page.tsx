import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Customer directory route.
 *
 * This is the most sensitive screen in the admin: it is nothing but customer
 * PII. The gate runs before the dynamic import, so the module is never
 * evaluated in production and nothing reaches the flight payload of the 404.
 *
 * Do not remove this gate until the backend can reject an unauthenticated
 * request server-side (GAP-009). A 404 is not authentication — it is the only
 * thing standing in for it.
 */
export default async function AdminCustomersPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const { CustomersView } = await import("@/components/admin/customers-view");
  return <CustomersView />;
}
