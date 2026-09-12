import { NextResponse } from "next/server";
import { isDatabaseConfigured, isPaystackConfigured } from "@/config/server-env";
import { verifyWebhookSignature, confirmPaystackPayment } from "@/server/orders/paystack";
import { findOrderIdByPaymentReference } from "@/server/orders/repository";

/**
 * POST /api/webhooks/paystack — the durable backup confirmation path.
 *
 * The client-triggered `POST /api/orders/:token/verify-payment` handles the
 * common case, but a browser closing right after the Paystack popup reports
 * success (before that call completes) would otherwise leave a genuinely
 * paid order stuck `unpaid` forever. This endpoint exists so payment gets
 * confirmed either way — whichever of the two calls `confirmPaystackPayment`
 * first "wins" (see `repository.confirmPayment`'s idempotent `WHERE
 * payment_status != 'paid'` guard); the second is a safe no-op.
 *
 * Register this URL in the Paystack dashboard once a production domain
 * exists: <your-domain>/api/webhooks/paystack.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured() || !isPaystackConfigured()) {
    // Still 200: Paystack retries on non-2xx, and there is nothing useful to
    // retry into while unconfigured. Logged so it's visible in server logs.
    console.warn("[webhooks/paystack] Received but not configured — ignoring.");
    return NextResponse.json({ received: true });
  }

  // MUST read the raw body before any parsing — the signature is computed
  // over the exact bytes Paystack sent, and re-serialising a parsed object
  // is not guaranteed to reproduce them byte-for-byte.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[webhooks/paystack] Invalid signature — rejected.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (
    !event ||
    typeof event !== "object" ||
    !("event" in event) ||
    !("data" in event) ||
    typeof (event as { data: unknown }).data !== "object" ||
    (event as { data: unknown }).data === null
  ) {
    return NextResponse.json({ error: "Malformed event." }, { status: 400 });
  }

  const eventType = (event as { event: unknown }).event;
  const data = (event as { data: Record<string, unknown> }).data;

  // Every other event type (transfer events, disputes, etc.) is a 200 no-op —
  // this app only acts on a successful charge.
  if (eventType !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = typeof data.reference === "string" ? data.reference : null;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const match = await findOrderIdByPaymentReference(reference);
  if (!match) {
    // Not necessarily an error on our end — could be a reference from a test
    // transaction, or an order whose reference was since superseded by a
    // retry. Acknowledge so Paystack doesn't keep retrying.
    console.warn(`[webhooks/paystack] No order for reference ${reference}.`);
    return NextResponse.json({ received: true });
  }

  try {
    await confirmPaystackPayment(match.id, match.amountOwedKobo, reference);
  } catch (error) {
    // Genuine verification failures (amount mismatch, wrong currency, a
    // reference reused across orders) are logged, not retried — retrying
    // Paystack's own already-recorded transaction won't change the outcome.
    console.error("[webhooks/paystack] confirmPaystackPayment failed:", error);
  }

  return NextResponse.json({ received: true });
}
