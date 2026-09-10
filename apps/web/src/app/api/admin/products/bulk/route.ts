import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import {
  deleteProducts,
  unpublishProducts,
} from "@/server/products/repository";

const bulkSchema = z.object({
  action: z.enum(["unpublish", "delete"]),
  slugs: z
    .array(z.string().trim().min(1))
    .min(1, { message: "Select at least one product" })
    .max(50, { message: "At most 50 products at a time" })
    .transform((slugs) => [...new Set(slugs)]),
});

/**
 * POST /api/admin/products/bulk — unpublish or hard-delete many products by
 * slug. Unknown slugs are skipped; response `affected` is the row count that
 * changed.
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

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid bulk request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { action, slugs } = parsed.data;

  try {
    const affected =
      action === "unpublish"
        ? await unpublishProducts(slugs)
        : await deleteProducts(slugs);
    return NextResponse.json({ affected });
  } catch (error) {
    console.error("[api/admin/products/bulk] Failed:", error);
    return NextResponse.json(
      { error: "Could not update the selected products." },
      { status: 500 },
    );
  }
}
