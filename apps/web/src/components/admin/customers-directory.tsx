"use client";

import Link from "next/link";
import { useState } from "react";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import type { Patron, PatronSegment } from "@/content/admin-customers";
import { formatKobo } from "@/lib/money";

/**
 * Customer directory with a patron dossier.
 *
 * Segment tabs and selecting a patron are genuine client state: filtering and
 * inspecting an already-loaded list works perfectly well before a backend
 * exists, and it is what makes the dossier reviewable at all.
 *
 * Everything that would send, export or change something is disabled — search,
 * CSV export, adding a patron, WhatsApp, and creating an order. On a screen
 * holding customer PII, a control that silently does nothing is worse than one
 * plainly not ready.
 *
 * Patrons arrive as PROPS, never imported here. A client component's imports
 * are bundled into client JavaScript, so importing the data module would ship
 * every name, phone number and address into a downloadable chunk — straight
 * past the server-side gate. That has already happened once on this project
 * (see GAP-009); it does not happen again.
 */
const COLUMNS = ["Patron", "Contact", "Delivery locale", "Orders"];

export function CustomersDirectory({
  patrons,
  segments,
  searchPlaceholder,
  showing,
}: {
  patrons: Patron[];
  segments: { label: string; segment: PatronSegment; count: number }[];
  searchPlaceholder: string;
  showing: string;
}) {
  const [segment, setSegment] = useState<PatronSegment>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = patrons.filter((patron) => {
    if (segment === "all") return true;
    if (segment === "repeat") return patron.repeat;
    if (segment === "lagos") return patron.city === "Lagos";
    return patron.city !== "Lagos";
  });

  // A patron filtered out of view must not stay open in the dossier.
  const selected = visible.find((patron) => patron.id === selectedId) ?? null;

  return (
    <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <section className="flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md">
          <div
            role="tablist"
            aria-label="Filter patrons"
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
                  "inline-flex min-h-11 items-center gap-gutter-xs rounded border px-3 font-label text-label-sm transition-colors",
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

          {/* Disabled: searching needs a customer service behind it. */}
          <span className="flex min-h-11 items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low px-gutter-sm text-body-sm text-nutmeg/70">
            <ICONS.seal className="h-4 w-4 shrink-0" />
            {searchPlaceholder}
          </span>
        </section>

        <div className="mt-gutter-sm overflow-x-auto rounded border border-rule/70 bg-surface">
          <table className="w-full min-w-3xl border-collapse text-left">
            <caption className="sr-only">
              Sample patrons. Select one to open their dossier.
            </caption>
            <thead>
              <tr className="border-b border-rule/70">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-gutter-sm py-3 font-label text-label-sm text-nutmeg uppercase"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((patron) => {
                const open = selected?.id === patron.id;
                return (
                  <tr
                    key={patron.id}
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
                        onClick={() => setSelectedId(open ? null : patron.id)}
                        aria-expanded={open}
                        className="flex items-center gap-gutter-sm text-left"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label text-label-sm text-on-secondary-fixed"
                        >
                          {patron.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-body-md font-semibold text-cacao">
                            {patron.name}
                          </span>
                          <span className="block text-body-sm text-nutmeg">
                            {patron.tier} · since {patron.since}
                          </span>
                        </span>
                      </button>
                    </th>

                    <td className="px-gutter-sm py-3 text-body-sm text-on-surface-variant">
                      <span className="block">{patron.email}</span>
                      <span className="block text-nutmeg">{patron.phone}</span>
                    </td>

                    <td className="px-gutter-sm py-3 text-body-sm">
                      <span className="block text-cacao">{patron.area}</span>
                      <span className="block text-nutmeg">{patron.city}</span>
                    </td>

                    <td className="px-gutter-sm py-3 text-body-sm">
                      <span className="block font-label text-label-md text-cacao">
                        {patron.orders}
                      </span>
                      <span className="block text-nutmeg">
                        {formatKobo(patron.spend)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <p className="p-gutter-xl text-center text-body-sm text-nutmeg">
              No patrons in this segment.
            </p>
          )}
        </div>

        {/* No pager: there is no second page to go to. */}
        <p className="mt-gutter-xs text-body-sm text-nutmeg">{showing}</p>
      </div>

      {selected ? (
        <Dossier
          key={selected.id}
          patron={selected}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <aside className="h-fit rounded border border-rule/70 bg-surface p-gutter-md">
          <h2 className="font-label text-label-caps text-nutmeg uppercase">
            Patron dossier
          </h2>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            Select a patron to see their contact details, delivery landmark and order
            history.
          </p>
        </aside>
      )}
    </div>
  );
}

function Dossier({ patron, onClose }: { patron: Patron; onClose: () => void }) {
  return (
    <aside className="h-fit rounded border border-rule/70 bg-surface p-gutter-md xl:sticky xl:top-0">
      <div className="flex items-start justify-between gap-gutter-sm">
        <h2 className="font-label text-label-caps text-nutmeg uppercase">
          Patron dossier
        </h2>
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
          {patron.initials}
        </span>
        <div className="min-w-0">
          <p className="text-headline-sm text-cacao">{patron.name}</p>
          <p className="font-label text-label-sm text-terracotta uppercase">
            {patron.tier}
          </p>
          <p className="text-body-sm text-nutmeg">Patron since {patron.since}</p>
        </div>
      </div>

      <dl className="mt-gutter-sm grid grid-cols-2 gap-gutter-xs">
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
          <dt className="font-label text-label-sm text-nutmeg uppercase">Spend</dt>
          <dd className="mt-1 font-label text-label-md text-terracotta">
            {formatKobo(patron.spend)}
          </dd>
        </div>
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
          <dt className="font-label text-label-sm text-nutmeg uppercase">Orders</dt>
          <dd className="mt-1 font-label text-label-md text-cacao">{patron.orders}</dd>
        </div>
      </dl>

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">Contact</h3>
        <dl className="mt-gutter-xs space-y-2 text-body-sm">
          <div className="flex items-start gap-gutter-xs">
            <ICONS.mail className="mt-0.5 h-4 w-4 shrink-0 text-nutmeg" />
            <div className="min-w-0">
              <dt className="sr-only">Email</dt>
              <dd className="break-words text-cacao">{patron.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-gutter-xs">
            <ICONS.chat className="mt-0.5 h-4 w-4 shrink-0 text-nutmeg" />
            <div className="min-w-0">
              <dt className="sr-only">Mobile</dt>
              <dd className="text-cacao">{patron.phone}</dd>
            </div>
          </div>
        </dl>
        {/* Disabled: there is no WhatsApp integration, and these numbers are
            deliberately unroutable sample numbers. */}
        <span
          aria-disabled="true"
          title="No messaging provider is connected"
          className="mt-gutter-xs flex min-h-11 cursor-not-allowed items-center justify-center gap-gutter-xs rounded border border-rule bg-surface-container-low font-label text-label-sm text-nutmeg/70"
        >
          <ICONS.chat className="h-4 w-4" />
          Message on WhatsApp
        </span>
      </section>

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">
          Delivery landmark
        </h3>
        <p className="mt-gutter-xs text-body-sm text-cacao">{patron.area}</p>
        <p className="text-body-sm text-nutmeg">{patron.landmark}</p>
      </section>

      <section className="mt-gutter-md">
        <h3 className="font-label text-label-caps text-nutmeg uppercase">
          Order history
        </h3>
        <ul className="mt-gutter-xs space-y-2">
          {patron.history.map((order) => {
            const body = (
              <>
                <span className="flex flex-wrap items-center justify-between gap-gutter-xs">
                  <span className="font-label text-label-sm text-cacao">#{order.id}</span>
                  <span
                    className={cn(
                      "rounded-sm px-2 py-0.5 font-label text-label-sm",
                      order.status === "Dispatched"
                        ? "bg-tertiary-container text-on-tertiary-container"
                        : "bg-secondary-container text-on-secondary-fixed",
                    )}
                  >
                    {order.status}
                  </span>
                </span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  {order.summary}
                </span>
                <span className="mt-1 flex flex-wrap justify-between text-body-sm text-nutmeg">
                  <span>{order.when}</span>
                  <span className="text-cacao">{formatKobo(order.total)}</span>
                </span>
              </>
            );

            return (
              <li key={order.id}>
                {/* Only orders that exist on the ledger open a dossier. */}
                {order.onLedger ? (
                  <Link
                    href={ADMIN_ROUTES.order(order.id)}
                    className="block rounded border border-rule/70 bg-surface-container-low p-gutter-sm transition-colors hover:border-cacao"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Disabled: placing an order on someone's behalf needs an orders API. */}
      <Button className="mt-gutter-md w-full" disabled>
        <ICONS.gift className="h-4 w-4" />
        Create an order
      </Button>
    </aside>
  );
}
