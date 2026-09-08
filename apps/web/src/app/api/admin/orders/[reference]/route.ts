import { NextResponse } from "next/server";
import { z } from "zod";
import { ORDER_STATUSES } from "@lamiefoods/types";
import { getAdminSession } from "@/server/admin/session";
import { isDatabaseConfigured } from "@/config/server-env";
import {
  getOrderByReferenceForAdmin,
  OrderStatusConflictError,
  updateOrderStatus,
} from "@/server/orders/repository";
import {
  orderShippedEmail,
  orderDeliveredEmail,
  paymentConfirmedEmail,
} from "@/server/email/order-emails";
import { sendMail } from "@/server/email/send";

const bodySchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.literal("paid").optional(),
  })
  .refine((value) => (value.status === undefined) !== (value.paymentStatus === undefined), {
    message: "Provide exactly one of status or paymentStatus.",
  });

/**
 * PATCH /api/admin/orders/:reference — the one write path the admin order
 * screens use: the delivery-status control, and the "Mark as paid" button
 * for a manually-confirmed bank transfer.
 *
 * Session-guarded, not token-guarded — this is the admin trust boundary
 * (`getAdminSession()`), completely separate from the customer's per-order
 * access token. Looking the order up by its human reference is safe here
 * specifically because the caller already had to clear that gate; see
 * `getOrderByReferenceForAdmin`'s own comment.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
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

  const { reference } = await params;

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

  const found = await getOrderByReferenceForAdmin(reference);
  if (!found) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let result;
  try {
    result = await updateOrderStatus(found.order.id, parsed.data);
  } catch (error) {
    if (error instanceof OrderStatusConflictError) {
      return NextResponse.json(
        { error: error.message, code: "ORDER_STATUS_CONFLICT" },
        { status: 409 },
      );
    }
    throw error;
  }
  if (!result) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Each email fires only on the transition that first reaches it — see
  // `updateOrderStatus`'s doc comment. A Paystack-paid order never reaches
  // `justPaid` here, since confirmPaystackPayment already sent its own.
  if (result.justPaid) {
    await sendMail(paymentConfirmedEmail(result.order, result.accessToken));
  }
  if (result.justShipped) {
    await sendMail(orderShippedEmail(result.order, result.accessToken));
  }
  if (result.justDelivered) {
    await sendMail(orderDeliveredEmail(result.order, result.accessToken));
  }

  return NextResponse.json({ order: result.order });
}
