import { NextResponse } from "next/server";
import { productSchema, toProductInput } from "@/lib/admin/product-schema";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import { createProduct, DuplicateSkuError, DuplicateSlugError } from "@/server/products/repository";

/**
 * POST /api/admin/products — create a product.
 *
 * Re-validates against the exact same `productSchema` the form already
 * checked client-side — the browser's check is a convenience, not a
 * control; this is the real one. Session-guarded like every other admin
 * write in this app.
 */
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const product = await createProduct(toProductInput(parsed.data));
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateSlugError || error instanceof DuplicateSkuError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[api/admin/products] Failed to create product:", error);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
