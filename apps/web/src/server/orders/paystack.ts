import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/server-env";
import {
  confirmPayment,
  setPaymentReference,
  type ConfirmPaymentResult,
} from "./repository";
import {
  ownerPaymentConfirmedEmail,
  paymentConfirmedEmail,
} from "@/server/email/order-emails";
import { sendMail } from "@/server/email/send";

const PAYSTACK_API = "https://api.paystack.co";

export class PaystackNotConfiguredError extends Error {
  constructor() {
    super("PAYSTACK_SECRET_KEY is not set.");
    this.name = "PaystackNotConfiguredError";
  }
}

export class PaystackVerificationFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaystackVerificationFailedError";
  }
}

function secretKey(): string {
  const { PAYSTACK_SECRET_KEY } = serverEnv();
  if (!PAYSTACK_SECRET_KEY) throw new PaystackNotConfiguredError();
  return PAYSTACK_SECRET_KEY;
}

/**
 * Generates the reference the customer's Paystack popup will use, and
 * registers it on the order BEFORE the popup opens.
 *
 * Called "prepare" rather than "initialize" because inline Paystack doesn't
 * need a server round trip to Paystack itself to start a charge — only our
 * own DB needs to know, in advance, which reference this attempt is allowed
 * to confirm. See `repository.setPaymentReference`'s comment for why the
 * order must already hold this value before verification will accept it.
 */
export async function preparePaystackAttempt(orderId: string, orderReference: string) {
  const attemptSuffix = randomBytes(4).toString("hex");
  const reference = `${orderReference}-${attemptSuffix}`;
  await setPaymentReference(orderId, reference);
  return { reference };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // "success" | "failed" | "abandoned" | ...
    amount: number; // kobo
    currency: string;
    reference: string;
  };
}

async function verifyWithPaystack(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } },
  );
  return (await response.json()) as PaystackVerifyResponse;
}

/**
 * The one place a payment is actually confirmed. Called from two triggers —
 * the client immediately after the popup reports success, and the Paystack
 * webhook as the durable backup if the browser closes first — and safe to
 * call from both, in either order, more than once: `repository.confirmPayment`
 * is the idempotency boundary.
 *
 * ALWAYS re-verifies against Paystack's own API here, even when called from
 * the webhook (whose signature already proves the request came from
 * Paystack). Paystack's own guidance is to treat verification, not the
 * webhook payload's claimed amount/status, as the source of truth — a
 * webhook proves origin, not correctness of a specific field.
 */
export async function confirmPaystackPayment(
  orderId: string,
  expectedAmountKobo: number,
  reference: string,
): Promise<ConfirmPaymentResult> {
  const verification = await verifyWithPaystack(reference);

  if (!verification.status || !verification.data) {
    throw new PaystackVerificationFailedError(
      verification.message || "Verification failed.",
    );
  }

  const { data } = verification;

  if (data.status !== "success") {
    throw new PaystackVerificationFailedError(
      `Paystack reports status "${data.status}".`,
    );
  }
  if (data.currency !== "NGN") {
    throw new PaystackVerificationFailedError(`Unexpected currency "${data.currency}".`);
  }
  if (data.amount !== expectedAmountKobo) {
    // Never trust a reference whose amount doesn't match what this order is
    // actually owed — this is the check that makes it safe to accept a
    // client-reported reference at all.
    throw new PaystackVerificationFailedError(
      `Paid amount (${data.amount}) does not match the order total (${expectedAmountKobo}).`,
    );
  }

  const result = await confirmPayment(orderId, reference);

  if (result.newlyConfirmed) {
    await sendMail(paymentConfirmedEmail(result.order, result.accessToken));
    const { ORDER_EMAIL_TO } = serverEnv();
    if (ORDER_EMAIL_TO) {
      await sendMail(ownerPaymentConfirmedEmail(result.order, ORDER_EMAIL_TO));
    }
  }

  return result;
}

/**
 * Verifies the `x-paystack-signature` header: HMAC-SHA512 of the RAW request
 * body, keyed with the secret key. Must run before the body is parsed as
 * JSON — the signature is over the exact bytes Paystack sent, and re-
 * serialising a parsed object is not guaranteed to reproduce them.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;

  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(signatureHeader, "hex");
  if (expectedBuffer.length !== providedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
