import "server-only";

import { randomBytes } from "node:crypto";
import type {
  CustomerDetails,
  Money,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@lamiefoods/types";
import { canTransitionOrderStatus } from "@lamiefoods/types";
import { db } from "@/server/db/client";
import { decrementStockInTx } from "@/server/products/repository";
import { subtotalOf } from "./pricing";

const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

/**
 * Human reference, e.g. "LF-7K2QX4". Crockford-style alphabet with I, L, O and
 * U removed so a customer reading one over the phone cannot confuse it with 1,
 * 0 or an unfortunate word.
 *
 * This is an identifier, NOT a credential: ~1 billion combinations is fine for
 * telling two orders apart and nowhere near enough to resist guessing. Reading
 * an order requires `access_token` instead.
 */
const REFERENCE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function newReference(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `LF-${out}`;
}

/** 32 random bytes. This one *is* the credential — it grants read access to a
 *  record holding a name, phone number and home address. */
function newAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface CreatedOrder {
  id: string;
  reference: string;
  token: string;
}

/**
 * Shape of one row from the `orders` table, as postgres.js returns it —
 * snake_case columns, `null` for unset money/timestamps. Kept private to this
 * file; every caller gets an `Order` from `@lamiefoods/types` instead.
 */
interface OrderRow {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  landmark: string;
  city: string;
  state: string;
  subtotal_kobo: number;
  delivery_fee_kobo: number | null;
  total_kobo: number | null;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow {
  product_slug: string;
  product_name: string;
  pack_name: string;
  unit_price_kobo: number;
  quantity: number;
  line_total_kobo: number;
}

/** The one place a DB row becomes a domain `Order` — every reader goes through this. */
function rowToOrder(row: OrderRow, itemRows: OrderItemRow[]): Order {
  return {
    id: row.id,
    reference: row.reference,
    items: itemRows.map((item): OrderItem => ({
      productId: item.product_slug,
      name: item.product_name,
      slug: item.product_slug,
      pack: item.pack_name,
      unitPrice: ngn(item.unit_price_kobo),
      quantity: item.quantity,
      lineTotal: ngn(item.line_total_kobo),
    })),
    customer: {
      fullName: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      deliveryAddress: {
        addressLine: row.address_line,
        landmark: row.landmark,
        city: row.city,
        state: row.state,
      },
    } satisfies CustomerDetails,
    subtotal: ngn(row.subtotal_kobo),
    deliveryFee: row.delivery_fee_kobo === null ? null : ngn(row.delivery_fee_kobo),
    total: row.total_kobo === null ? null : ngn(row.total_kobo),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function itemRowsFor(orderId: string): Promise<OrderItemRow[]> {
  const sql = db();
  const rows = await sql`
    select product_slug, product_name, pack_name,
           unit_price_kobo, quantity, line_total_kobo
    from order_items
    where order_id = ${orderId}
    order by product_name asc
  `;
  return rows as unknown as OrderItemRow[];
}

/**
 * Writes the order and its lines in a single transaction.
 *
 * Both halves must land together: an order with no items is an unfulfillable
 * record, and items with no order are orphans. `sql.begin` rolls the whole thing
 * back if any statement fails.
 */
export async function createOrder(
  customer: CustomerDetails,
  items: OrderItem[],
  paymentMethod: PaymentMethod,
): Promise<CreatedOrder> {
  const sql = db();
  const subtotal = subtotalOf(items);
  const reference = newReference();
  const token = newAccessToken();

  const orderId = await sql.begin(async (tx) => {
    const [order] = await tx`
      insert into orders (
        reference, access_token,
        customer_name, customer_email, customer_phone,
        address_line, landmark, city, state,
        subtotal_kobo, delivery_fee_kobo, total_kobo,
        status, payment_status, payment_method
      ) values (
        ${reference}, ${token},
        ${customer.fullName}, ${customer.email}, ${customer.phone},
        ${customer.deliveryAddress.addressLine}, ${customer.deliveryAddress.landmark},
        ${customer.deliveryAddress.city}, ${customer.deliveryAddress.state},
        ${subtotal.amount}, ${null}, ${null},
        'pending', 'unpaid', ${paymentMethod}
      )
      returning id
    `;

    // `INSERT ... RETURNING` failing to return a row would mean the insert
    // didn't happen at all — postgres.js's return type can't rule that out
    // statically, so this is the guard, not paranoia about the query above.
    if (!order) throw new Error("Order insert returned no row.");

    // delivery_fee_kobo and total_kobo stay NULL: no delivery price has been
    // set, and writing 0 would record a free-delivery quote nobody authorised.

    await tx`
      insert into order_items ${tx(
        items.map((item) => ({
          order_id: order.id as string,
          product_slug: item.slug,
          product_name: item.name,
          pack_name: item.pack,
          unit_price_kobo: item.unitPrice.amount,
          quantity: item.quantity,
          line_total_kobo: item.lineTotal.amount,
        })),
      )}
    `;

    return order.id as string;
  });

  return { id: orderId, reference, token };
}

/**
 * Look an order up by its access token, and only by its access token.
 *
 * There is deliberately no lookup-by-reference here for the CUSTOMER-facing
 * path. A reference is short and printed on emails; if it were sufficient to
 * fetch an order, anyone could walk the keyspace and harvest customer
 * addresses. (Admin lookups, below, are a different trust boundary — those
 * already require a signed-in session, so a reference is fine there.)
 */
export async function findOrderByToken(token: string): Promise<Order | null> {
  const sql = db();

  const rows = await sql`
    select id, reference,
           customer_name, customer_email, customer_phone,
           address_line, landmark, city, state,
           subtotal_kobo, delivery_fee_kobo, total_kobo,
           status, payment_status, payment_method, created_at, updated_at
    from orders
    where access_token = ${token}
    limit 1
  `;

  const row = rows[0] as unknown as OrderRow | undefined;
  if (!row) return null;

  return rowToOrder(row, await itemRowsFor(row.id));
}

/**
 * Registers a fresh Paystack reference for this order's NEXT payment attempt,
 * overwriting whatever reference (if any) the previous attempt used.
 *
 * The reference is generated HERE, server-side — never accepted from the
 * client — precisely so that `confirmPaystackPayment` can later require an
 * exact match against what THIS order currently has on file. Without that,
 * a customer could take a real, successful reference from a stranger's
 * legitimate transaction and submit it to their own order's verify call.
 */
export async function setPaymentReference(
  orderId: string,
  reference: string,
): Promise<void> {
  const sql = db();
  await sql`
    update orders set payment_reference = ${reference}, updated_at = now()
    where id = ${orderId}
  `;
}

/**
 * Resolves a Paystack reference back to the order that currently owns it.
 * The one caller is the webhook route: Paystack's payload carries only the
 * reference, never our order id, so this is where that context comes from.
 */
export async function findOrderIdByPaymentReference(
  reference: string,
): Promise<{ id: string; subtotalKobo: number } | null> {
  const sql = db();
  const rows = await sql`
    select id, subtotal_kobo from orders where payment_reference = ${reference}
  `;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id as string, subtotalKobo: row.subtotal_kobo as number };
}

export interface ConfirmPaymentResult {
  order: Order;
  /** So the caller can build the customer's own "view your order" link —
   *  never logged, never shown to anyone but that customer. */
  accessToken: string;
  /** False when this call was a no-op because the order was already paid. */
  newlyConfirmed: boolean;
}

export class PaymentReferenceMismatchError extends Error {
  constructor() {
    super("This payment reference does not match the order's current attempt.");
    this.name = "PaymentReferenceMismatchError";
  }
}

export class PaymentReferenceReusedError extends Error {
  constructor() {
    super("This payment reference has already been used to pay for a different order.");
    this.name = "PaymentReferenceReusedError";
  }
}

/**
 * Marks an order paid, but only if `reference` matches what `setPaymentReference`
 * most recently stored for it — see that function's comment for why the match
 * matters. Idempotent: a second call with the same (now-matching, now-paid)
 * reference is a safe no-op, not an error, so both the client-triggered verify
 * and the Paystack webhook can call this without coordinating who goes first.
 *
 * Payment moves a `pending` order to `paid` automatically (a distinct
 * `OrderStatus` stage from `pending`, separate from `paymentStatus`) — the
 * admin still moves it to `processing` manually once the kitchen actually
 * starts, so that transition keeps meaning something.
 *
 * @throws {PaymentReferenceMismatchError} the order's current reference differs
 * @throws {PaymentReferenceReusedError} another order already claimed this
 *   reference (the DB's partial unique index enforces this; this is that
 *   violation surfaced as a typed error instead of a raw Postgres error)
 */
export async function confirmPayment(
  orderId: string,
  reference: string,
): Promise<ConfirmPaymentResult> {
  const sql = db();

  let confirmed: ConfirmPaymentResult | null;
  try {
    confirmed = await sql.begin(async (tx) => {
      const rows = await tx`
        update orders set
          payment_status = 'paid',
          paid_at = now(),
          status = case when status = 'pending' then 'paid' else status end,
          updated_at = now()
        where id = ${orderId}
          and payment_reference = ${reference}
          and payment_status != 'paid'
        returning id, reference, access_token,
          customer_name, customer_email, customer_phone,
          address_line, landmark, city, state,
          subtotal_kobo, delivery_fee_kobo, total_kobo,
          status, payment_status, payment_method, created_at, updated_at
      `;
      const updated = rows[0] as unknown as
        (OrderRow & { access_token: string }) | undefined;
      if (!updated) return null;

      const items = await itemRowsFor(updated.id);
      // Stock only ever moves once payment is real — decrementing at order
      // creation would deduct stock for orders that never get paid.
      await decrementStockInTx(
        tx,
        items.map((item) => ({ slug: item.product_slug, quantity: item.quantity })),
      );

      return {
        order: rowToOrder(updated, items),
        accessToken: updated.access_token,
        newlyConfirmed: true,
      };
    });
  } catch (error) {
    // Postgres unique_violation on the partial index — see migration 0002.
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      throw new PaymentReferenceReusedError();
    }
    throw error;
  }

  if (confirmed) return confirmed;

  // No row updated: either already paid with this exact reference (idempotent
  // replay — fine), or the reference doesn't match this order at all (reject).
  const rows = await sql`
    select id, reference, access_token, payment_reference,
      customer_name, customer_email, customer_phone,
      address_line, landmark, city, state,
      subtotal_kobo, delivery_fee_kobo, total_kobo,
      status, payment_status, payment_method, created_at, updated_at
    from orders where id = ${orderId}
  `;
  const current = rows[0] as unknown as
    (OrderRow & { access_token: string; payment_reference: string | null }) | undefined;
  if (!current) throw new Error("Order not found.");

  const alreadyPaidWithThisReference =
    current.payment_status === "paid" && current.payment_reference === reference;

  if (!alreadyPaidWithThisReference) throw new PaymentReferenceMismatchError();

  return {
    order: rowToOrder(current, await itemRowsFor(current.id)),
    accessToken: current.access_token,
    newlyConfirmed: false,
  };
}

/** Lightweight row for the admin orders table — no full item list per row. */
export interface AdminOrderSummary {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  landmark: string;
  itemCount: number;
  itemSummary: string;
  subtotal: Money;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

/** Latest 50 orders, optionally filtered by status. No pagination UI wires to
 *  this yet — see docs/ai-memory/gaps.md for the follow-up if that's ever short. */
export async function listOrdersForAdmin(filter?: {
  status?: OrderStatus;
}): Promise<AdminOrderSummary[]> {
  const sql = db();
  const status = filter?.status ?? null;

  const rows = await sql`
    select
      o.id, o.reference, o.customer_name, o.customer_email, o.customer_phone,
      o.city, o.landmark,
      o.subtotal_kobo, o.status, o.payment_status, o.payment_method, o.created_at,
      coalesce(sum(oi.quantity), 0)::int as item_count,
      coalesce(
        string_agg(oi.product_name || ' × ' || oi.quantity, ', ' order by oi.product_name),
        ''
      ) as item_summary
    from orders o
    left join order_items oi on oi.order_id = o.id
    where ${status}::text is null or o.status = ${status}
    group by o.id
    order by o.created_at desc
    limit 50
  `;

  return rows.map((row): AdminOrderSummary => ({
    id: row.id as string,
    reference: row.reference as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    phone: row.customer_phone as string,
    city: row.city as string,
    landmark: row.landmark as string,
    itemCount: row.item_count as number,
    itemSummary: row.item_summary as string,
    subtotal: ngn(row.subtotal_kobo as number),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    createdAt: (row.created_at as Date).toISOString(),
  }));
}

/** Purpose-specific shape for the authenticated dispatch CSV. Credentials and
 * payment-provider references are deliberately not selected. */
export interface AdminOrderExportRow {
  reference: string;
  orderedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string;
  landmark: string;
  city: string;
  state: string;
  itemSummary: string;
  subtotalKobo: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
}

/** Complete order ledger for the admin's dispatch export, newest first.
 * Unlike the on-screen query, this intentionally has no 50-row UI limit. */
export async function listOrdersForDispatchExport(): Promise<AdminOrderExportRow[]> {
  const sql = db();
  const rows = await sql`
    select
      o.reference, o.created_at,
      o.customer_name, o.customer_email, o.customer_phone,
      o.address_line, o.landmark, o.city, o.state,
      o.subtotal_kobo, o.payment_method, o.payment_status, o.status,
      coalesce(
        string_agg(
          oi.product_name || ' (' || oi.pack_name || ') × ' || oi.quantity,
          ', ' order by oi.product_name, oi.pack_name
        ),
        ''
      ) as item_summary
    from orders o
    left join order_items oi on oi.order_id = o.id
    group by o.id
    order by o.created_at desc
  `;

  return rows.map((row): AdminOrderExportRow => ({
    reference: row.reference as string,
    orderedAt: (row.created_at as Date).toISOString(),
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    addressLine: row.address_line as string,
    landmark: row.landmark as string,
    city: row.city as string,
    state: row.state as string,
    itemSummary: row.item_summary as string,
    subtotalKobo: row.subtotal_kobo as number,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    status: row.status as OrderStatus,
  }));
}

/** One row per status, `0` for statuses with no orders yet — drives the tab counts. */
export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  const sql = db();
  const rows = await sql`select status, count(*)::int as n from orders group by status`;

  const counts: Record<OrderStatus, number> = {
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const row of rows) counts[row.status as OrderStatus] = row.n as number;
  return counts;
}

/**
 * Admin-only lookup by the human reference. Safe here in a way it is NOT for
 * the customer-facing path: this function is only ever called after
 * `getAdminSession()` has already verified a signed-in session, so a short,
 * guessable reference isn't the thing standing between a stranger and this
 * data — the session cookie is.
 */
export interface AdminOrderDetail {
  order: Order;
  /** So an admin-triggered email (shipped/delivered/marked paid) can still
   *  link the customer to their own order page. */
  accessToken: string;
}

export async function getOrderByReferenceForAdmin(
  reference: string,
): Promise<AdminOrderDetail | null> {
  const sql = db();
  const rows = await sql`
    select id, reference, access_token,
      customer_name, customer_email, customer_phone,
      address_line, landmark, city, state,
      subtotal_kobo, delivery_fee_kobo, total_kobo,
      status, payment_status, payment_method, created_at, updated_at
    from orders where reference = ${reference}
  `;
  const row = rows[0] as unknown as (OrderRow & { access_token: string }) | undefined;
  if (!row) return null;
  return {
    order: rowToOrder(row, await itemRowsFor(row.id)),
    accessToken: row.access_token,
  };
}

export interface UpdateOrderStatusInput {
  status?: OrderStatus;
  paymentStatus?: "paid";
}

export interface UpdateOrderStatusResult {
  order: Order;
  accessToken: string;
  justShipped: boolean;
  justDelivered: boolean;
  justPaid: boolean;
}

export class OrderStatusConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderStatusConflictError";
  }
}

/**
 * The one write path admin order actions use — changing delivery status,
 * and/or manually confirming a bank-transfer payment. Reports which
 * milestones were freshly reached (rather than already true) so the caller
 * sends each notification email exactly once, the same idempotency shape as
 * `confirmPayment` above but for admin-driven changes instead of Paystack's.
 */
export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<UpdateOrderStatusResult | null> {
  const sql = db();

  return sql.begin(async (tx) => {
    const [before] = await tx`
      select status, payment_status, payment_method,
             paid_at, shipped_at, delivered_at
      from orders where id = ${orderId} for update
    `;
    if (!before) return null;

    if (input.status !== undefined && input.paymentStatus !== undefined) {
      throw new OrderStatusConflictError("Change one order state at a time.");
    }

    const currentStatus = before.status as OrderStatus;
    const currentPaymentStatus = before.payment_status as PaymentStatus;
    const confirmingPayment = input.paymentStatus === "paid";

    if (confirmingPayment) {
      if (before.payment_method !== "whatsapp_transfer") {
        throw new OrderStatusConflictError(
          "Only bank-transfer orders can be marked paid manually.",
        );
      }
      if (currentPaymentStatus === "paid" || before.paid_at !== null) {
        throw new OrderStatusConflictError("This order is already marked paid.");
      }
    }

    let nextStatus = currentStatus;
    if (input.status !== undefined) {
      if (!canTransitionOrderStatus(currentStatus, input.status)) {
        throw new OrderStatusConflictError(
          `Order cannot move from ${currentStatus} to ${input.status}.`,
        );
      }
      if (input.status !== "cancelled" && currentPaymentStatus !== "paid") {
        throw new OrderStatusConflictError(
          "Payment must be confirmed before fulfilment can advance.",
        );
      }
      nextStatus = input.status;
    } else if (confirmingPayment && currentStatus === "pending") {
      nextStatus = "paid";
    }

    const nextPaymentStatus = confirmingPayment ? "paid" : currentPaymentStatus;
    const justShipped = nextStatus === "shipped" && before.shipped_at === null;
    const justDelivered = nextStatus === "delivered" && before.delivered_at === null;
    const justPaid = confirmingPayment && before.paid_at === null;

    const [row] = await tx`
      update orders set
        status = ${nextStatus},
        payment_status = ${nextPaymentStatus},
        shipped_at = case when ${justShipped} then now() else shipped_at end,
        delivered_at = case when ${justDelivered} then now() else delivered_at end,
        paid_at = case when ${justPaid} then now() else paid_at end,
        updated_at = now()
      where id = ${orderId}
      returning id, reference, access_token,
        customer_name, customer_email, customer_phone,
        address_line, landmark, city, state,
        subtotal_kobo, delivery_fee_kobo, total_kobo,
        status, payment_status, payment_method, created_at, updated_at
    `;

    const orderRow = row as unknown as OrderRow & { access_token: string };
    const items = await tx`
      select product_slug, product_name, pack_name,
             unit_price_kobo, quantity, line_total_kobo
      from order_items where order_id = ${orderId} order by product_name asc
    `;
    const itemRows = items as unknown as OrderItemRow[];

    // Same rule as the Paystack path: stock moves only the moment payment
    // actually becomes real, which for a manually-confirmed bank transfer is
    // this admin action, not order creation.
    if (justPaid) {
      await decrementStockInTx(
        tx,
        itemRows.map((item) => ({ slug: item.product_slug, quantity: item.quantity })),
      );
    }

    return {
      order: rowToOrder(orderRow, itemRows),
      accessToken: orderRow.access_token,
      justShipped,
      justDelivered,
      justPaid,
    };
  });
}

/** Real, DB-backed replacement for the old `ADMIN_STATS` sample content. */
export interface DashboardStats {
  settledRevenue: Money;
  orderCount: number;
  customerCount: number;
}

/**
 * Settled revenue is `sum(subtotal_kobo)` over paid orders, not `total_kobo`
 * — matches how Paystack actually charges today (`server/orders/paystack.ts`:
 * delivery is still unpriced, so `total_kobo` stays null on every order).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const sql = db();
  const [row] = await sql`
    select
      coalesce(sum(subtotal_kobo) filter (where payment_status = 'paid'), 0)::int
        as settled_revenue_kobo,
      count(*)::int as order_count,
      count(distinct customer_email)::int as customer_count
    from orders
  `;

  return {
    settledRevenue: ngn((row?.settled_revenue_kobo as number) ?? 0),
    orderCount: (row?.order_count as number) ?? 0,
    customerCount: (row?.customer_count as number) ?? 0,
  };
}

export interface RevenueTrendPoint {
  /** ISO date, e.g. "2026-09-08" — one point per calendar day in the window. */
  day: string;
  slug: string;
  productName: string;
  revenue: Money;
}

/**
 * Daily paid revenue per product over the last `days` days, oldest first.
 * Empty/all-zero with no paid orders yet — that's the honest state, not an
 * error case: `RevenueChart` renders flat lines rather than special-casing it.
 */
export async function getRevenueTrend(days = 7): Promise<RevenueTrendPoint[]> {
  const sql = db();
  const rows = await sql`
    select
      to_char(date_trunc('day', o.paid_at), 'YYYY-MM-DD') as day,
      oi.product_slug, oi.product_name,
      sum(oi.line_total_kobo)::int as revenue_kobo
    from orders o
    join order_items oi on oi.order_id = o.id
    where o.payment_status = 'paid'
      and o.paid_at >= now() - make_interval(days => ${days})
    group by day, oi.product_slug, oi.product_name
    order by day asc
  `;

  return rows.map((row): RevenueTrendPoint => ({
    day: row.day as string,
    slug: row.product_slug as string,
    productName: row.product_name as string,
    revenue: ngn(row.revenue_kobo as number),
  }));
}

export interface BestSeller {
  slug: string;
  productName: string;
  unitsSold: number;
  revenue: Money;
}

/** Top sellers by units, across paid orders only. */
export async function getBestSellers(limit = 3): Promise<BestSeller[]> {
  const sql = db();
  const rows = await sql`
    select oi.product_slug, oi.product_name,
      sum(oi.quantity)::int as units_sold,
      sum(oi.line_total_kobo)::int as revenue_kobo
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.payment_status = 'paid'
    group by oi.product_slug, oi.product_name
    order by units_sold desc
    limit ${limit}
  `;

  return rows.map((row): BestSeller => ({
    slug: row.product_slug as string,
    productName: row.product_name as string,
    unitsSold: row.units_sold as number,
    revenue: ngn(row.revenue_kobo as number),
  }));
}

/** One row per customer (grouped by email), for `/admin/customers`. */
export interface AdminCustomerSummary {
  email: string;
  name: string;
  phone: string;
  city: string;
  landmark: string;
  orderCount: number;
  totalSpend: Money;
  firstOrderAt: string;
  lastOrderAt: string;
  favouriteProductName: string | null;
}

/**
 * Derived entirely from `orders`/`order_items` — there is no `customers`
 * table (guest checkout is a hard product requirement, so there's nothing to
 * key one on but email). Name/phone/city/landmark come from the customer's
 * MOST RECENT order, since an address can legitimately change between orders.
 */
export async function listCustomersForAdmin(): Promise<AdminCustomerSummary[]> {
  const sql = db();

  const rows = await sql`
    with latest as (
      select distinct on (customer_email)
        customer_email, customer_name, customer_phone, city, landmark
      from orders
      order by customer_email, created_at desc
    ),
    aggregates as (
      select
        customer_email,
        count(*)::int as order_count,
        coalesce(sum(subtotal_kobo) filter (where payment_status = 'paid'), 0)::int
          as total_spend_kobo,
        min(created_at) as first_order_at,
        max(created_at) as last_order_at
      from orders
      group by customer_email
    ),
    favourites as (
      select distinct on (o.customer_email)
        o.customer_email, oi.product_name
      from orders o
      join order_items oi on oi.order_id = o.id
      group by o.customer_email, oi.product_name
      order by o.customer_email, sum(oi.quantity) desc
    )
    select
      l.customer_email, l.customer_name, l.customer_phone, l.city, l.landmark,
      a.order_count, a.total_spend_kobo, a.first_order_at, a.last_order_at,
      f.product_name as favourite_product_name
    from latest l
    join aggregates a on a.customer_email = l.customer_email
    left join favourites f on f.customer_email = l.customer_email
    order by a.last_order_at desc
  `;

  return rows.map((row): AdminCustomerSummary => ({
    email: row.customer_email as string,
    name: row.customer_name as string,
    phone: row.customer_phone as string,
    city: row.city as string,
    landmark: row.landmark as string,
    orderCount: row.order_count as number,
    totalSpend: ngn(row.total_spend_kobo as number),
    firstOrderAt: (row.first_order_at as Date).toISOString(),
    lastOrderAt: (row.last_order_at as Date).toISOString(),
    favouriteProductName: (row.favourite_product_name as string | null) ?? null,
  }));
}

/** Paid (either method) but not yet shipped/delivered/cancelled — oldest first. */
export async function listOrdersNeedingDispatch(): Promise<AdminOrderSummary[]> {
  const sql = db();

  const rows = await sql`
    select
      o.id, o.reference, o.customer_name, o.customer_email, o.customer_phone,
      o.city, o.landmark,
      o.subtotal_kobo, o.status, o.payment_status, o.payment_method, o.created_at,
      coalesce(sum(oi.quantity), 0)::int as item_count,
      coalesce(
        string_agg(oi.product_name || ' × ' || oi.quantity, ', ' order by oi.product_name),
        ''
      ) as item_summary
    from orders o
    left join order_items oi on oi.order_id = o.id
    where o.payment_status = 'paid'
      and o.status not in ('shipped', 'delivered', 'cancelled')
    group by o.id
    order by o.created_at asc
  `;

  return rows.map((row): AdminOrderSummary => ({
    id: row.id as string,
    reference: row.reference as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    phone: row.customer_phone as string,
    city: row.city as string,
    landmark: row.landmark as string,
    itemCount: row.item_count as number,
    itemSummary: row.item_summary as string,
    subtotal: ngn(row.subtotal_kobo as number),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    createdAt: (row.created_at as Date).toISOString(),
  }));
}
