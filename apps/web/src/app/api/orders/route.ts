import { NextResponse, type NextRequest } from "next/server";
import { createOrderSchema, type CreateOrderResponse } from "@/lib/orders/order-request";
import { isDatabaseConfigured } from "@/config/server-env";
import { priceLines, subtotalOf, UnknownLineError } from "@/server/orders/pricing";
import { createOrder } from "@/server/orders/repository";
import {
  DeliveryAreaInactiveError,
  DeliveryAreaNotFoundError,
  getActiveDeliveryAreaById,
} from "@/server/delivery/repository";
import { customerEmail, ownerEmail } from "@/server/email/order-emails";
import { sendMail } from "@/server/email/send";
import { serverEnv } from "@/config/server-env";
import { checkRateLimit, clientIp } from "@/server/security/rate-limit";

/**
 * POST /api/orders — creates a guest order. No account, no session, no auth:
 * this is the whole point of guest checkout (the owner's answer to Q12/Q13).
 *
 * Recorded in docs/ai-memory/api-integration.md — that file is the contract of
 * record; keep both in sync.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rateLimit = checkRateLimit(`orders:${ip}`, { windowMs: 10 * 60 * 1000, max: 8 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) },
      },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not connected yet. No order has been recorded." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let deliveryArea;
  try {
    deliveryArea = await getActiveDeliveryAreaById(parsed.data.deliveryAreaId);
  } catch (error) {
    if (
      error instanceof DeliveryAreaNotFoundError ||
      error instanceof DeliveryAreaInactiveError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  let items;
  try {
    items = await priceLines(parsed.data.lines);
  } catch (error) {
    if (error instanceof UnknownLineError) {
      return NextResponse.json(
        { error: "One or more items are no longer available.", detail: error.message },
        { status: 409 },
      );
    }
    throw error;
  }

  const subtotal = subtotalOf(items);
  const totalKobo = subtotal.amount + deliveryArea.fee.amount;
  const { customer, paymentMethod } = parsed.data;

  // Snapshot the area name into city for riders when the form only picked an area.
  const customerWithCity = {
    ...customer,
    deliveryAddress: {
      ...customer.deliveryAddress,
      city: customer.deliveryAddress.city || deliveryArea.name,
    },
  };

  let created;
  try {
    created = await createOrder(customerWithCity, items, paymentMethod, {
      areaId: deliveryArea.id,
      areaName: deliveryArea.name,
      feeKobo: deliveryArea.fee.amount,
    });
  } catch (error) {
    console.error("[api/orders] Failed to write order:", error);
    return NextResponse.json(
      {
        error: "Could not save the order. Nothing has been recorded — please try again.",
      },
      { status: 500 },
    );
  }

  const { ORDER_EMAIL_TO } = serverEnv();
  const emailInput = {
    reference: created.reference,
    token: created.token,
    customer: customerWithCity,
    items,
    subtotal,
    paymentMethod,
    deliveryFee: deliveryArea.fee,
    deliveryAreaName: deliveryArea.name,
    total: { amount: totalKobo, currency: "NGN" as const },
  };

  await sendMail(customerEmail(emailInput));
  if (ORDER_EMAIL_TO) {
    await sendMail(ownerEmail({ ...emailInput, to: ORDER_EMAIL_TO }));
  }

  const response: CreateOrderResponse = {
    reference: created.reference,
    token: created.token,
    amountKobo: totalKobo,
  };
  return NextResponse.json(response, { status: 201 });
}
