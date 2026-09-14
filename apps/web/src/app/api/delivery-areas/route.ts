import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/config/server-env";
import { listActiveDeliveryAreas } from "@/server/delivery/repository";

/**
 * GET /api/delivery-areas — active zones for the checkout Area dropdown.
 * Public; no session. Fees are authoritative server values the client may
 * display but must not invent at order create.
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  const areas = await listActiveDeliveryAreas();
  return NextResponse.json({
    areas: areas.map((area) => ({
      id: area.id,
      name: area.name,
      feeKobo: area.fee.amount,
      region: area.region,
      state: area.state,
    })),
  });
}
