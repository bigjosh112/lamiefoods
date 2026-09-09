import { NextResponse } from "next/server";
import { productSchema, toProductInput } from "@/lib/admin/product-schema";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import { DuplicateSlugError, updateProduct } from "@/server/products/repository";

/**
 * PATCH /api/admin/products/:slug — full replace of one product's fields,
 * packs and images. `:slug` is the product's CURRENT slug; the request body
 * may rename it (`toProductInput`'s own `slug` field), same distinction the
 * admin orders route makes between the URL identifier and what's inside the
 * body.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
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

  const { slug: currentSlug } = await params;

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
    const product = await updateProduct(currentSlug, toProductInput(parsed.data));
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[api/admin/products/:slug] Failed to update product:", error);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
