"use client";

import Link from "next/link";
import { useState } from "react";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { formatKobo } from "@/lib/money";
import type { AdminOrderSummary } from "@/server/orders/repository";

export interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  city: string;
  landmark: string;
  orderCount: number;
  totalSpendKobo: number;
  firstOrderAt: string;
  favouriteProductName: string | null;
  orders: AdminOrderSummary[];
}

export type CustomerSegment = "all" | "repeat";

/** Two-letter monogram for the avatar circle. */
const monogram = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const COLUMNS = ["Customer", "Contact", "Delivery area", "Orders"];

/**
 * Customer directory with a dossier.
 *
 * Segment tabs and selecting a customer are genuine client state: filtering
 * an already-loaded list works fine without a search backend.
 *
 * Customers arrive as PROPS, never imported here. A client component's
 * imports are bundled into client JavaScript, so importing the query result
 * directly would ship every name, phone number and address into a
 * downloadable chunk — past the server-side gate (see GAP-009).
 */
export function CustomersDirectory({ customers }: { customers: CustomerRow[] }) {
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const visible = customers.filter((customer) =>
    segment === "all" ? true : customer.orderCount >= 2,
  );

  // A customer filtered out of view must not stay open in the dossier.
  const selected = visible.find((customer) => customer.email === selectedEmail) ?? null;

  const segments: { label: string; segment: CustomerSegment; count: number }[] = [
    { label: "All customers", segment: "all", count: customers.length },
    {
      label: "Repeat customers",
      segment: "repeat",
      count: customers.filter((c) => c.orderCount >= 2).length,
    },
  ];

  return (
    <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <section className="flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md">
          <div
            role="tablist"
            aria-label="Filter customers"
            className="flex flex-wrap gap-gutter-xs"
          >
            {segments.map((tab) => (
              <button
                key={tab.segment}
                type="button"
                role="tab"
                aria-selected={segment === tab.segment}
                onClick={() => setSegment(tab.segment)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-gutter-xs rounded-md border px-3 font-label text-label-sm transition-colors",
                  segment === tab.segment
                    ? "border-primary-container bg-primary-container text-linen"
                    : "border-rule bg-surface-container-low text-cacao hover:border-cacao",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-sm px-1.5",
                    segment === tab.segment
                      ? "bg-linen/20"
                      : "bg-secondary-container text-on-secondary-fixed",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-gutter-sm overflow-x-auto rounded border border-rule/70 bg-surface">
          <table className="w-full min-w-3xl border-collapse text-left">
            <caption className="sr-only">
              Customers derived from real orders. Select one to open their dossier.
            </caption>
            <thead>
              <tr className="border-b border-rule/70">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-gutter-sm py-3 font-label text-label-sm text-nutmeg"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((customer) => {
                const open = selected?.email === customer.email;
                return (
                  <tr
                    key={customer.email}
                    className={cn(
                      "border-b border-rule/70 last:border-b-0",
                      open
                        ? "bg-secondary-container/50"
                        : "hover:bg-surface-container-low",
                    )}
                  >
                    <th scope="row" className="px-gutter-sm py-3 text-left font-normal">
                      <button
                        type="button"
                        onClick={() => setSelectedEmail(open ? null : customer.email)}
                        aria-expanded={open}
                        className="flex items-center gap-gutter-sm text-left"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label text-label-sm text-on-secondary-fixed"
                        >
                          {monogram(customer.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-body-md font-semibold text-cacao">
                            {customer.name}
                          </span>
                          <span className="block text-body-sm text-nutmeg">
                            Customer since {monthYear(customer.firstOrderAt)}
                          </span>
                        </span>
                      </button>
                    </th>

                    <td className="px-gutter-sm py-3 text-body-sm text-on-surface-variant">
                      <span className="block">{customer.email}</span>
                      <span className="block text-nutmeg">{customer.phone}</span>
                    </td>

                    <td className="px-gutter-sm py-3 text-body-sm">
                      <span className="block text-cacao">{customer.city}</span>
                      <span className="block text-nutmeg">{customer.landmark}</span>
                    </td>

                    <td className="px-gutter-sm py-3 text-body-sm">
                      <span className="block font-numeral text-label-md text-cacao">
                        {customer.orderCount}
                      </span>
                      <span className="block font-numeral text-nutmeg">
                        {formatKobo(customer.totalSpendKobo)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <p className="p-gutter-xl text-center text-body-sm text-nutmeg">
              No customers in this segment.
            </p>
          )}
        </div>

        <p className="mt-gutter-xs text-body-sm text-nutmeg">
          Showing all {visible.length} of {customers.length} customer
          {customers.length === 1 ? "" : "s"}
        </p>
      </div>

      {selected ? (
        <Dossier
          key={selected.email}
          customer={selected}
          onClose={() => setSelectedEmail(null)}
        />
      ) : (
        <aside className="h-fit rounded border border-rule/70 bg-surface p-gutter-md">
          <h2 className="font-label text-label-md text-nutmeg">Customer details</h2>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            Select a customer to see their contact details, delivery landmark and order
            history.
          </p>
        </aside>
      )}
    </div>
  );
}

function Dossier({ customer, onClose }: { customer: CustomerRow; onClose: () => void }) {
  return (
    <aside className="h-fit rounded border border-rule/70 bg-surface p-gutter-md xl:sticky xl:top-0">
      <div className="flex items-start justify-between gap-gutter-sm">
        <h2 className="font-label text-label-md text-nutmeg">Customer details</h2>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 inline-flex h-8 w-8 items-center justify-center text-nutmeg transition-colors hover:text-terracotta"
        >
          <span className="sr-only">Close the dossier</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="mt-gutter-sm flex items-center gap-gutter-sm">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label text-label-md text-on-secondary-fixed"
        >
          {monogram(customer.name)}
        </span>
        <div className="min-w-0">
          <p className="text-headline-sm text-cacao">{customer.name}</p>
          <p className="text-body-sm text-nutmeg">
            Customer since {monthYear(customer.firstOrderAt)}
          </p>
        </div>
      </div>

      <dl className="mt-gutter-sm grid grid-cols-2 gap-gutter-xs">
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
          <dt className="font-label text-label-sm text-nutmeg uppercase">Spend</dt>
          <dd className="mt-1 font-numeral text-label-md text-terracotta">
            {formatKobo(customer.totalSpendKobo)}
          </dd>
        </div>
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
          <dt className="font-label text-label-sm text-nutmeg uppercase">Orders</dt>
          <dd className="mt-1 font-label text-label-md text-cacao">
            {customer.orderCount}
          </dd>
        </div>
      </dl>

      {customer.favouriteProductName && (
        <p className="mt-gutter-sm text-body-sm text-nutmeg">
          Most ordered:{" "}
          <span className="text-cacao">{customer.favouriteProductName}</span>
        </p>
      )}

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">Contact</h3>
        <dl className="mt-gutter-xs space-y-2 text-body-sm">
          <div className="min-w-0">
            <dt className="sr-only">Email</dt>
            <dd className="break-words text-cacao">{customer.email}</dd>
          </div>
          <div className="min-w-0">
            <dt className="sr-only">Phone</dt>
            <dd className="text-cacao">{customer.phone}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">
          Delivery landmark
        </h3>
        <p className="mt-gutter-xs text-body-sm text-cacao">{customer.city}</p>
        <p className="text-body-sm text-nutmeg">{customer.landmark}</p>
      </section>

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">
          Order history
        </h3>
        <ul className="mt-gutter-xs space-y-2">
          {customer.orders.map((order) => (
            <li key={order.id}>
              <Link
                href={ADMIN_ROUTES.order(order.reference)}
                className="block rounded border border-rule/70 bg-surface-container-low p-gutter-sm transition-colors hover:border-cacao"
              >
                <span className="flex flex-wrap items-center justify-between gap-gutter-xs">
                  <span className="font-label text-label-sm text-cacao">
                    #{order.reference}
                  </span>
                  <span className="rounded-sm bg-secondary-container px-2 py-0.5 font-label text-label-sm text-on-secondary-fixed">
                    {order.status}
                  </span>
                </span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  {order.itemSummary || "—"}
                </span>
                <span className="mt-1 flex flex-wrap justify-between text-body-sm text-nutmeg">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-numeral text-cacao">
                    {formatKobo(order.subtotal.amount)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
