import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Shell for the signed-in admin area — and, for now, its only protection.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS 404s IN PRODUCTION.
 *
 * These pages show revenue, order values, customer names and delivery
 * addresses. There is no authentication yet (GAP-009), so on a deployed site
 * they would sit on a public URL that anyone could open by typing `/admin`.
 * `robots.txt` and `noindex` keep pages out of search results; they do not stop
 * a person visiting the URL.
 *
 * So the whole area is compiled out of production builds. `NODE_ENV` is a
 * build-time constant in Next, which makes this a real boundary rather than a
 * runtime flag someone could flip — the pages simply are not in the deployed
 * bundle.
 *
 * REMOVE THIS ONLY in the same change that adds server-side session checking.
 * Deleting it first would publish customer data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();

  return <AdminShell>{children}</AdminShell>;
}
