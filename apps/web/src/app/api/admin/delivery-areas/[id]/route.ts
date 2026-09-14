import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import { deliveryAreaPatchSchema } from "@/lib/admin/delivery-area-schema";
import {
  deleteDeliveryArea,
  DeliveryAreaStateError,
  updateDeliveryArea,
} from "@/server/delivery/repository";

/**
 * PATCH/DELETE /api/admin/delivery-areas/:id — session-guarded update + delete.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = deliveryAreaPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const area = await updateDeliveryArea(id, {
      name: parsed.data.name,
      feeKobo:
        parsed.data.feeNaira === undefined
          ? undefined
          : parsed.data.feeNaira * 100,
      region: parsed.data.region,
      state: parsed.data.state,
      sortOrder: parsed.data.sortOrder,
      active: parsed.data.active,
    });
    if (!area) {
      return NextResponse.json({ error: "Area not found." }, { status: 404 });
    }
    return NextResponse.json({ area });
  } catch (error) {
    if (error instanceof DeliveryAreaStateError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const deleted = await deleteDeliveryArea(id);
  if (!deleted) {
    return NextResponse.json({ error: "Area not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
