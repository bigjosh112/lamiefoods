import { NextResponse, type NextRequest } from "next/server";
import { isDatabaseConfigured } from "@/config/server-env";
import { findOrderByToken } from "@/server/orders/repository";
import { buildOrderReceiptPdf } from "@/server/orders/receipt-pdf";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * GET /api/orders/:token/receipt — PDF receipt for one order.
 *
 * Auth is the access token itself (same trust boundary as viewing the order
 * on `/order-success`). Unpaid orders still download; the PDF labels payment
 * status honestly so it is not a false paid receipt.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`order-receipt:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 30,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many receipt downloads. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) },
      },
    );
  }

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

  let order;
  try {
    order = await findOrderByToken(token);
  } catch (error) {
    console.error("[api/orders/:token/receipt] Lookup failed:", error);
    return NextResponse.json({ error: "Could not load the order." }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    const pdf = await buildOrderReceiptPdf(order);
    const safeRef = order.reference.replace(/[^a-zA-Z0-9_-]+/g, "-");

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="lamie-foods-order-${safeRef}.pdf"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[api/orders/:token/receipt] PDF build failed:", error);
    return NextResponse.json(
      { error: "Could not generate the receipt." },
      { status: 500 },
    );
  }
}
