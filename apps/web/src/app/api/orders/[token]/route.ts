import { NextResponse } from "next/server";
import type { Order } from "@lamiefoods/types";
import { isDatabaseConfigured } from "@/config/server-env";
import { findOrderByToken } from "@/server/orders/repository";

/**
 * GET /api/orders/:token — fetch one order by its access token.
 *
 * Deliberately keyed on the token, never the human-readable reference: the
 * reference is short (printed on emails, read aloud on the phone) and this
 * page renders a name, phone number and home address. Looking up by reference
 * would let anyone walk the keyspace and harvest customer PII.
 *
 * Next 16: `params` is a Promise — see node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/route.md.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet." },
      { status: 503 },
    );
  }

  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let order: Order | null;
  try {
    order = await findOrderByToken(token);
  } catch (error) {
    console.error("[api/orders/:token] Lookup failed:", error);
    return NextResponse.json({ error: "Could not load the order." }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(order);
}
