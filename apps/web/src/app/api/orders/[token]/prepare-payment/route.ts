import { NextResponse } from "next/server";
import { isDatabaseConfigured, isPaystackConfigured } from "@/config/server-env";
import { findOrderByToken } from "@/server/orders/repository";
import { preparePaystackAttempt } from "@/server/orders/paystack";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * POST /api/orders/:token/prepare-payment — issues a fresh Paystack reference
 * for this order and registers it server-side, BEFORE the customer's browser
 * opens the Paystack popup.
 *
 * The reference is generated here, not by the client, specifically so
 * `POST .../verify-payment` can later require an exact match against what
 * this order currently has on file — see
 * `server/orders/repository.ts:setPaymentReference` for the full reasoning
 * (without this, a real successful reference from an unrelated transaction
 * could be replayed against a different order).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`prepare-payment:${ip}`, {
    windowMs: 10 * 60 * 1000,
    max: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) },
      },
    );
  }

  if (!isDatabaseConfigured() || !isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Online payment is not connected yet." },
      { status: 503 },
    );
  }

  const { token } = await params;
  const order = await findOrderByToken(token);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
  }

  const { reference } = await preparePaystackAttempt(order.id, order.reference);

  return NextResponse.json({
    reference,
    amountKobo: order.subtotal.amount,
    email: order.customer.email,
  });
}
