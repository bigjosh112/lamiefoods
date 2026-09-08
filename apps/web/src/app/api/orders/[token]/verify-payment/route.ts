import { NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, isPaystackConfigured } from "@/config/server-env";
import { findOrderByToken } from "@/server/orders/repository";
import {
  confirmPaystackPayment,
  PaystackNotConfiguredError,
  PaystackVerificationFailedError,
} from "@/server/orders/paystack";
import {
  PaymentReferenceMismatchError,
  PaymentReferenceReusedError,
} from "@/server/orders/repository";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

const bodySchema = z.object({ paystackReference: z.string().trim().min(1).max(200) });

/**
 * POST /api/orders/:token/verify-payment — the client-triggered confirmation,
 * called immediately after the Paystack popup's `onSuccess` callback fires.
 *
 * Token-guarded exactly like `GET /api/orders/:token`: possession of the
 * customer's own order token is what authorises this call, not a session.
 * The actual confirmation logic (re-verify with Paystack, match the stored
 * reference, idempotent update) all lives in
 * `server/orders/paystack.ts:confirmPaystackPayment` — this route is a thin
 * wrapper that resolves the token, translates errors to status codes, and
 * nothing more. The Paystack webhook calls the exact same function as the
 * durable backup if this call never happens (browser closed, network drop).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`verify-payment:${ip}`, {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await confirmPaystackPayment(
      order.id,
      order.subtotal.amount,
      parsed.data.paystackReference,
    );
    return NextResponse.json({ order: result.order });
  } catch (error) {
    if (error instanceof PaystackNotConfiguredError) {
      return NextResponse.json(
        { error: "Online payment is not connected yet." },
        { status: 503 },
      );
    }
    if (error instanceof PaystackVerificationFailedError) {
      return NextResponse.json(
        { error: "We could not verify this payment.", detail: error.message },
        { status: 402 },
      );
    }
    if (error instanceof PaymentReferenceMismatchError) {
      return NextResponse.json(
        { error: "This payment does not match this order's current attempt." },
        { status: 409 },
      );
    }
    if (error instanceof PaymentReferenceReusedError) {
      return NextResponse.json(
        { error: "This payment has already been used for a different order." },
        { status: 409 },
      );
    }
    console.error("[verify-payment] Unexpected error:", error);
    return NextResponse.json({ error: "Could not confirm payment." }, { status: 500 });
  }
}
