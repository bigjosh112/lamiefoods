import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/config/server-env";
import { getAdminSession } from "@/server/admin/session";
import { ordersToCsv } from "@/server/orders/csv";
import { listOrdersForDispatchExport } from "@/server/orders/repository";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  try {
    const csv = ordersToCsv(await listOrdersForDispatchExport());
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="lamie-foods-orders-${date}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[api/admin/orders/export] Failed to export orders:", error);
    return NextResponse.json(
      { error: "Could not export orders." },
      { status: 500 },
    );
  }
}
