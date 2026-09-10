"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatKobo } from "@/lib/money";
import type { AdminOrderSummary } from "@/server/orders/repository";

/**
 * Real orders table. Rows arrive as PROPS, never imported directly here — a
 * Client Component's imports are bundled into client JavaScript, so pulling
 * customer data in via an import (rather than a prop from the server) would
 * ship it into a downloadable chunk, past the server-side session gate
 * entirely. See GAP-009 in docs/ai-memory/gaps.md, where that happened once.
 *
 * No bulk selection or batch actions this pass — the single-order status
 * control on the detail page is the one real write path this ships with;
 * batch actions are a reasonable follow-up once there's real volume to act
 * on in bulk.
 */
export function OrdersTable({ rows }: { rows: AdminOrderSummary[] }) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
        <p className="text-body-md text-on-surface-variant">
          No orders in this view yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-rule/70">
      <table className="w-full min-w-[800px] text-left text-body-sm">
        <thead className="bg-surface-container-low text-label-sm text-nutmeg">
          <tr>
            <th className="px-gutter-sm py-2 font-label">Order</th>
            <th className="px-gutter-sm py-2 font-label">Customer</th>
            <th className="px-gutter-sm py-2 font-label">Items</th>
            <th className="px-gutter-sm py-2 font-label">Subtotal</th>
            <th className="px-gutter-sm py-2 font-label">Payment</th>
            <th className="px-gutter-sm py-2 font-label">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={(event) => {
                const target = event.target;
                if (
                  target instanceof Element &&
                  target.closest("a, button, select, input, textarea")
                ) {
                  return;
                }
                router.push(ADMIN_ROUTES.order(row.reference));
              }}
              className="cursor-pointer border-t border-rule/50 transition-colors hover:bg-surface-container-low"
            >
              <td className="px-gutter-sm py-2">
                <Link
                  href={ADMIN_ROUTES.order(row.reference)}
                  className="font-label text-label-md text-terracotta hover:underline"
                >
                  #{row.reference}
                </Link>
                <p className="text-body-sm text-nutmeg">
                  {new Date(row.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <Link
                  href={ADMIN_ROUTES.order(row.reference)}
                  className="mt-1 inline-flex min-h-11 items-center gap-gutter-xs font-label text-label-sm text-terracotta hover:text-cacao"
                  aria-label={`View customer and dispatch details for order ${row.reference}`}
                >
                  View details
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </td>
              <td className="px-gutter-sm py-2">
                <p className="text-cacao">{row.customerName}</p>
                <p className="text-body-sm text-nutmeg">
                  {row.phone} · {row.city}
                </p>
              </td>
              <td className="max-w-[220px] px-gutter-sm py-2 text-on-surface-variant">
                {row.itemSummary || "—"}
              </td>
              <td className="px-gutter-sm py-2 font-label text-label-md text-cacao">
                {formatKobo(row.subtotal.amount)}
              </td>
              <td className="px-gutter-sm py-2">
                <Badge
                  tone={row.paymentStatus === "paid" ? "positive" : "neutral"}
                  label={row.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                />
                <p className="mt-1 text-body-sm text-nutmeg">
                  {row.paymentMethod === "paystack" ? "Paystack" : "Bank transfer"}
                </p>
              </td>
              <td className="px-gutter-sm py-2">
                <OrderStatusControl
                  key={`${row.status}-${row.paymentStatus}`}
                  order={row}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "negative" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-2 py-0.5 font-label text-label-sm",
        tone === "positive" && "bg-cacao text-tertiary-fixed-dim",
        tone === "negative" && "bg-error-container text-on-error-container",
        tone === "neutral" && "bg-secondary-container text-on-secondary-fixed",
      )}
    >
      {label}
    </span>
  );
}
