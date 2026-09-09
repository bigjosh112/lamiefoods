"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { allowedOrderStatusTransitions } from "@lamiefoods/types";
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import {
  updateOrderStatus,
  type AdminOrderUpdate,
} from "@/lib/api/admin-orders";
import { ApiError } from "@/lib/api";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing (kitchen)",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/**
 * The one real write control on the order detail page: a delivery-status
 * select, and — only for a still-unpaid bank-transfer order — a "Mark as
 * paid" button for the owner's manual confirmation after checking their bank
 * alert or WhatsApp screenshot.
 *
 * The server owns the transition rules; this control mirrors them so an admin
 * only sees the next valid fulfilment action (or cancellation before dispatch).
 */
export interface OrderStatusSubject {
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}

export function OrderStatusControl({
  order,
  compact = false,
}: {
  order: OrderStatusSubject;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const save = async (patch: AdminOrderUpdate) => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateOrderStatus(order.reference, patch);
      setStatus(updated.status);
      setPaymentStatus(updated.paymentStatus);
      setMessage("Saved.");
      router.refresh();
    } catch (error) {
      const apiMessage =
        error instanceof ApiError &&
        error.body !== null &&
        typeof error.body === "object" &&
        "error" in error.body &&
        typeof error.body.error === "string"
          ? error.body.error
          : null;
      setMessage(apiMessage ?? "Something went wrong — please try again.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const canMarkPaidManually =
    order.paymentMethod === "whatsapp_transfer" && paymentStatus !== "paid";
  const nextStatuses = allowedOrderStatusTransitions(status).filter(
    (nextStatus) => nextStatus === "cancelled" || paymentStatus === "paid",
  );
  const selectId = compact ? `order-status-${order.reference}` : "order-status";

  return (
    <div
      className={cn(
        compact
          ? "min-w-40"
          : "rounded border border-rule/70 bg-surface p-gutter-sm",
      )}
      aria-busy={saving}
    >
      <label
        className={cn(
          "font-label text-label-sm text-nutmeg uppercase",
          compact ? "sr-only" : "block",
        )}
        htmlFor={selectId}
      >
        Status for order {order.reference}
      </label>
      <select
        id={selectId}
        value={status}
        disabled={saving || nextStatuses.length === 0}
        onChange={(event) => {
          const nextStatus = event.target.value as OrderStatus;
          if (nextStatus === status) return;
          if (
            nextStatus === "cancelled" &&
            !window.confirm(`Cancel order ${order.reference}? This cannot be undone.`)
          ) {
            event.currentTarget.value = status;
            return;
          }
          void save({ status: nextStatus });
        }}
        className={cn(
          "min-h-11 w-full rounded border border-rule bg-surface-container-low text-cacao focus:border-terracotta focus:outline-none",
          compact ? "px-2 text-body-sm" : "mt-1 px-3 text-body-md",
        )}
      >
        {[status, ...nextStatuses].map((value) => (
          <option key={value} value={value}>
            {STATUS_LABEL[value]}
          </option>
        ))}
      </select>

      {!compact && paymentStatus !== "paid" && status !== "cancelled" && (
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Confirm payment before advancing fulfilment.
        </p>
      )}

      {!compact && nextStatuses.length === 0 && (
        <p className="mt-1 text-body-sm text-on-surface-variant">
          This order has reached a final status.
        </p>
      )}

      {canMarkPaidManually && !compact && (
        <Button
          onClick={() => void save({ paymentStatus: "paid" })}
          disabled={saving}
          variant="secondary"
          className="mt-gutter-sm w-full"
        >
          Mark as paid (bank transfer confirmed)
        </Button>
      )}

      <p
        aria-live="polite"
        className={cn(
          "mt-1 text-body-sm text-on-surface-variant",
          compact && !message && !saving && "sr-only",
        )}
      >
        {saving ? "Saving…" : message}
      </p>
    </div>
  );
}
