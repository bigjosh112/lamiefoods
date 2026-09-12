import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import { deliveryAreaWriteSchema } from "@/lib/admin/delivery-area-schema";
import {
  createDeliveryArea,
  listAllDeliveryAreas,
} from "@/server/delivery/repository";

/**
 * GET/POST /api/admin/delivery-areas — session-guarded list + create.
 */
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

  const areas = await listAllDeliveryAreas();
  return NextResponse.json({ areas });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = deliveryAreaWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const area = await createDeliveryArea({
      name: parsed.data.name,
      feeKobo: parsed.data.feeNaira * 100,
      region: parsed.data.region,
      sortOrder: parsed.data.sortOrder,
    });
    return NextResponse.json({ area }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "An area with that name already exists." },
        { status: 409 },
      );
    }
    throw error;
  }
}
