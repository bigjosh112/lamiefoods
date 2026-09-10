import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import type { Order } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { formatKobo } from "@/lib/money";

/**
 * Real order detail. Replaces the sample-data screen that used to live at
 * this route — see `docs/ai-memory/architecture.md`'s 2026-09-07 decision
 * log for what was deliberately dropped rather than wired to fake data: a
 * Kitchen & Dispatch Timeline, a Delivery & Geolocation map, Internal Atelier
 * Notes, and the Patron Dossier link — none of these have a real data source
 * (there is no notes table, no courier-location feed, no customer directory
 * beyond order history), and inventing one would be the exact mistake this
 * codebase has already refused to make elsewhere (see gaps.md).
 *
 * Receives the order as a PROP from the server page, never imported here —
 * the same rule that closed the client-bundle PII leak in GAP-009.
 */
export function OrderDetailView({ order }: { order: Order }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="p-gutter-lg">
      <Link
        href={ADMIN_ROUTES.orders}
        className="text-body-sm text-terracotta hover:underline"
      >
        ← All orders
      </Link>

      <div className="mt-gutter-sm grid gap-gutter-lg lg:grid-cols-12">
        <section className="rounded border border-rule/70 bg-surface-container-low p-inset-card lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
            <div>
              <p className="font-label text-label-sm text-nutmeg uppercase">Order</p>
              <p className="mt-1 font-display text-headline-md text-terracotta">
                #{order.reference}
              </p>
              <p className="mt-1 text-body-sm text-nutmeg">
                <time dateTime={order.createdAt}>
                  {new Date(order.createdAt).toLocaleString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </p>
            </div>
            <span
              className={cn(
                "rounded-sm px-2 py-1 font-label text-label-sm uppercase",
                order.paymentStatus === "paid"
                  ? "bg-cacao text-tertiary-fixed-dim"
                  : "bg-secondary-container text-on-secondary-fixed",
              )}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"} ·{" "}
              {order.paymentMethod === "paystack" ? "Paystack" : "Bank transfer"}
            </span>
          </div>

          <div className="mt-gutter-md border-t border-rule/70 pt-gutter-sm">
            <p className="font-label text-label-sm text-nutmeg uppercase">
              Items ({itemCount})
            </p>
            <ul className="mt-gutter-sm space-y-2">
              {order.items.map((item) => (
                <li
                  key={`${item.slug}-${item.pack}`}
                  className="flex items-baseline justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-xs"
                >
                  <div>
                    <p className="text-body-md font-semibold text-cacao">{item.name}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {item.pack} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-numeral text-label-md text-terracotta">
                    {formatKobo(item.lineTotal.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-gutter-md space-y-2 border-t border-rule/70 pt-gutter-sm text-body-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="font-numeral text-label-md text-cacao">
                {formatKobo(order.subtotal.amount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-on-surface-variant">Delivery</dt>
              <dd className="font-label text-label-sm text-nutmeg uppercase">
                {order.deliveryFee !== null
                  ? formatKobo(order.deliveryFee.amount)
                  : "Not yet quoted"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-rule/70 pt-2">
              <dt className="text-headline-sm text-cacao">Total</dt>
              <dd className="font-display text-headline-sm text-terracotta">
                {order.total !== null
                  ? formatKobo(order.total.amount)
                  : `${formatKobo(order.subtotal.amount)} + delivery`}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-col gap-gutter-md lg:col-span-5">
          <OrderStatusControl
            key={`${order.status}-${order.paymentStatus}`}
            order={order}
          />

          <section className="rounded border border-rule/70 bg-surface-container-low p-inset-card">
            <p className="font-label text-label-caps text-terracotta uppercase">
              Dispatch handoff
            </p>
            <h2 className="mt-1 text-headline-sm text-cacao">
              Customer &amp; delivery details
            </h2>

            <dl className="mt-gutter-md space-y-3 text-body-sm">
              <div>
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  Customer
                </dt>
                <dd className="mt-1 text-body-md font-semibold text-cacao">
                  {order.customer.fullName}
                </dd>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <dt className="font-label text-label-sm text-nutmeg uppercase">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${order.customer.phone.replaceAll(" ", "")}`}
                      className="inline-flex min-h-11 items-center text-terracotta underline underline-offset-4 hover:text-cacao"
                    >
                      {order.customer.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-label-sm text-nutmeg uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 break-all">
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="inline-flex min-h-11 items-center text-terracotta underline underline-offset-4 hover:text-cacao"
                    >
                      {order.customer.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  Delivery address
                </dt>
                <dd className="mt-1">
                  <address className="text-on-surface-variant not-italic">
                    {order.customer.deliveryAddress.addressLine}
                    <br />
                    {order.customer.deliveryAddress.city},{" "}
                    {order.customer.deliveryAddress.state}
                  </address>
                  <p className="mt-1 text-nutmeg">
                    Landmark: {order.customer.deliveryAddress.landmark}
                  </p>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
