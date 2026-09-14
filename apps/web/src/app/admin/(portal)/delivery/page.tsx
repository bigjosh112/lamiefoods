import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Delivery areas",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminDeliveryAreasPage() {
  if (!(await getAdminSession())) redirect(ADMIN_ROUTES.login);
  if (!isDatabaseConfigured()) notFound();

  const { DeliveryAreasView } = await import("@/components/admin/delivery-areas-view");
  const { listAllDeliveryAreas } = await import("@/server/delivery/repository");

  return <DeliveryAreasView areas={await listAllDeliveryAreas()} />;
}
