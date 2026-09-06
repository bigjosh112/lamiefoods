import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { findProduct } from "@/content/products";
import type { buildOrderDetail } from "@/content/admin-order-detail";
import { formatKobo } from "@/lib/money";

type OrderDetail = ReturnType<typeof buildOrderDetail>;

/**
 * One order, in full.
 *
 * Server-rendered throughout. Everything that would change or send something —
 * the status select, kitchen slip, invoice, messaging the client, calling the
 * courier, saving a note — is disabled: there is no backend to act on, and on
 * an operations screen a control that silently does nothing is worse than one
 * plainly not ready.
 *
 * Chrome comes from `AdminShell` in the portal layout, so this screen cannot
 * drift from the dashboard or the orders list.
 */
export function OrderDetailView({ detail }: { detail: OrderDetail }) {
  const { header, items, totals, patron, timeline, delivery, notes } = detail;

  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">Sample order — nothing here is real.</strong>{" "}
          No order exists. The customer, courier, addresses, payment references and
          timeline below are invented for layout review.
        </p>
      </div>

      <nav aria-label="Breadcrumb" className="mb-gutter-sm">
        <ol className="flex flex-wrap items-center gap-gutter-xs text-body-sm text-nutmeg">
          <li>
            <Link
              href={ADMIN_ROUTES.orders}
              className="inline-flex items-center gap-gutter-xs transition-colors hover:text-terracotta"
            >
              ← {detail.breadcrumb[0]}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{detail.breadcrumb[1]}</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-cacao">
            {detail.breadcrumb[2]}
          </li>
        </ol>
      </nav>

      <section className="flex flex-wrap items-start justify-between gap-gutter-md rounded border border-rule/70 bg-surface-container-low p-gutter-md">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-gutter-sm">
            <h1 className="text-headline-lg text-cacao">{header.title}</h1>
            <span className="inline-flex items-center gap-gutter-xs rounded-sm bg-cacao px-2 py-1 font-label text-label-sm text-tertiary-fixed-dim uppercase">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed-dim"
              />
              {header.paymentChip}
            </span>
          </div>

          <p className="mt-gutter-xs inline-flex items-center gap-gutter-xs rounded-sm border border-rule/70 bg-surface px-2 py-1 font-label text-label-sm text-nutmeg">
            <ICONS.seal className="h-4 w-4 text-terracotta" />
            Ref: {header.reference}
          </p>

          <p className="mt-gutter-xs flex flex-wrap items-center gap-gutter-sm text-body-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-gutter-xs">
              <ICONS.timer className="h-4 w-4" />
              {header.placed}
            </span>
            <span className="inline-flex items-center gap-gutter-xs">
              <ICONS.truck className="h-4 w-4" />
              {header.route}
            </span>
          </p>
          <p className="mt-gutter-xs font-label text-label-sm text-terracotta">
            {header.batchRun}
          </p>
        </div>

        <div className="flex flex-col items-end gap-gutter-sm">
          <label className="flex items-center gap-gutter-xs">
            <span className="font-label text-label-sm text-nutmeg uppercase">
              {header.statusLabel}
            </span>
            {/* Disabled: changing status needs somewhere to write it. */}
            <select
              disabled
              defaultValue={header.status}
              className="min-h-11 rounded border border-rule bg-surface px-3 text-body-sm text-cacao disabled:cursor-not-allowed disabled:opacity-70"
            >
              {header.statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap justify-end gap-gutter-xs">
            {header.actions.map((action) => {
              const Icon = ICONS[action.icon];
              return (
                <Button
                  key={action.label}
                  variant={action.primary ? "primary" : "secondary"}
                  disabled
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-gutter-sm grid gap-gutter-sm xl:grid-cols-3">
        <div className="flex flex-col gap-gutter-sm xl:col-span-2">
          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
              <div>
                <h2 className="text-headline-sm text-cacao">{items.title}</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">{items.body}</p>
              </div>
              <span className="rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed uppercase">
                {items.chip}
              </span>
            </div>

            <ul className="mt-gutter-md space-y-3">
              {items.lines.map((line) => {
                const product = findProduct(line.slug);
                return (
                  <li
                    key={line.batch}
                    className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                  >
                    {product && (
                      <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                        <ImageSlot slot={product.image} sizes="64px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-gutter-xs">
                        <h3 className="text-headline-sm text-cacao">{line.name}</h3>
                        <span className="rounded-sm bg-secondary-container px-2 py-0.5 font-label text-label-sm text-on-secondary-fixed">
                          {line.batch}
                        </span>
                      </div>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        {line.format}
                      </p>
                      <p className="text-body-sm text-nutmeg">{line.note}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-body-sm text-nutmeg">Qty {line.qty}</p>
                      <p className="font-display text-headline-sm text-terracotta">
                        {formatKobo(line.total)}
                      </p>
                      <p className="text-body-sm text-nutmeg">
                        {formatKobo(line.unit)} ea
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-gutter-md space-y-3 border-t border-rule/70 pt-gutter-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-body-sm text-on-surface-variant">
                  {totals.subtotalLabel}
                </dt>
                <dd className="font-label text-label-md text-cacao">
                  {formatKobo(totals.subtotal)}
                </dd>
              </div>
              {[totals.packaging, totals.dispatch].map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-baseline justify-between gap-gutter-sm"
                >
                  <dt className="text-body-sm text-on-surface-variant">{entry.label}</dt>
                  <dd className="shrink-0 font-label text-label-sm text-tertiary uppercase">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-gutter-md border-t border-rule/70 pt-gutter-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
                <div>
                  <p className="text-headline-sm text-cacao">{totals.totalLabel}</p>
                  <p className="text-body-sm text-nutmeg">{totals.settlement}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-headline-lg text-terracotta">
                    {formatKobo(totals.total)}
                  </p>
                  <p className="font-label text-label-sm text-nutmeg uppercase">
                    {totals.currencyNote}
                  </p>
                </div>
              </div>

              <ul className="mt-gutter-sm flex flex-wrap gap-gutter-sm border-t border-rule/70 pt-gutter-sm">
                {totals.refs.map((ref) => (
                  <li
                    key={ref.label}
                    className="flex items-center gap-gutter-xs text-body-sm text-nutmeg"
                  >
                    <ICONS.board className="h-4 w-4" />
                    {ref.label}: <span className="text-cacao">{ref.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
              <div>
                <h2 className="flex items-center gap-gutter-xs text-headline-sm text-cacao">
                  <ICONS.timer className="h-5 w-5 text-terracotta" />
                  {timeline.title}
                </h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {timeline.body}
                </p>
              </div>
              <span className="inline-flex items-center gap-gutter-xs rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed uppercase">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-terracotta"
                />
                {timeline.chip}
              </span>
            </div>

            <ol className="mt-gutter-md">
              {timeline.entries.map((entry, index) => (
                <li key={entry.title} className="flex gap-gutter-sm">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-terracotta bg-surface"
                    />
                    {index < timeline.entries.length - 1 && (
                      <span aria-hidden="true" className="w-px flex-1 bg-rule/60" />
                    )}
                  </div>

                  <div className="mb-gutter-sm min-w-0 flex-1 rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
                      <h3 className="flex flex-wrap items-center gap-gutter-xs text-headline-sm text-cacao">
                        {entry.title}
                        {entry.chip && (
                          <span className="rounded-sm bg-primary-container px-2 py-0.5 font-label text-label-sm text-linen uppercase">
                            {entry.chip}
                          </span>
                        )}
                      </h3>
                      <span className="shrink-0 font-label text-label-sm text-terracotta">
                        {entry.time}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {entry.body}
                    </p>
                    <p className="mt-1 text-body-sm text-nutmeg">{entry.meta}</p>

                    {index === timeline.entries.length - 1 && (
                      <div className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm">
                        <span className="flex items-center gap-gutter-sm">
                          <ICONS.truck className="h-5 w-5 shrink-0 text-terracotta" />
                          <span>
                            <span className="block text-body-sm text-cacao">
                              {timeline.courier.name}
                            </span>
                            <span className="block text-body-sm text-nutmeg">
                              {timeline.courier.note}
                            </span>
                          </span>
                        </span>
                        <Button variant="secondary" disabled>
                          {timeline.courier.cta}
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="flex flex-col gap-gutter-sm">
          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
              <h2 className="flex items-center gap-gutter-xs text-headline-sm text-cacao">
                <ICONS.people className="h-5 w-5 text-terracotta" />
                {patron.title}
              </h2>
              <span className="rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed uppercase">
                {patron.chip}
              </span>
            </div>

            <div className="mt-gutter-md flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container font-label text-label-md text-linen"
              >
                {patron.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="text-headline-sm text-cacao">{patron.name}</p>
                <p className="text-body-sm break-all text-on-surface-variant">
                  {patron.email}
                </p>
                <p className="mt-1 text-body-sm text-terracotta">{patron.lifetime}</p>
              </div>
            </div>

            <dl className="mt-gutter-sm grid gap-gutter-sm sm:grid-cols-2">
              <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  {patron.phoneLabel}
                </dt>
                <dd className="mt-1 text-body-sm text-cacao">{patron.phone}</dd>
                <dd className="text-body-sm text-nutmeg">{patron.phoneNote}</dd>
              </div>
              <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
                <dt className="font-label text-label-sm text-nutmeg uppercase">
                  {patron.whatsappLabel}
                </dt>
                <dd className="mt-1 flex items-center gap-gutter-xs text-body-sm text-cacao">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-terracotta"
                  />
                  {patron.whatsapp}
                </dd>
                <dd className="text-body-sm text-nutmeg">{patron.whatsappNote}</dd>
              </div>
            </dl>

            <Button variant="secondary" disabled className="mt-gutter-sm w-full">
              {patron.cta}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </section>

          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
              <h2 className="flex items-center gap-gutter-xs text-headline-sm text-cacao">
                <ICONS.truck className="h-5 w-5 text-terracotta" />
                {delivery.title}
              </h2>
              <span className="font-label text-label-sm text-nutmeg uppercase">
                {delivery.chip}
              </span>
            </div>

            {/* No mapping provider is wired — a labelled placeholder, not a
                screenshot pretending to be live. */}
            <div className="mt-gutter-md flex aspect-16/9 flex-col justify-end rounded border border-rule/70 bg-surface-container p-gutter-md">
              <p className="font-label text-label-sm text-nutmeg/70 uppercase">
                {delivery.mapPlaceholder}
              </p>
              <p className="text-headline-sm text-cacao">{delivery.area}</p>
              <p className="text-body-sm text-nutmeg">{delivery.zone}</p>
            </div>

            <div className="mt-gutter-sm">
              <p className="font-label text-label-sm text-nutmeg uppercase">
                {delivery.addressLabel}
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {delivery.address}
              </p>
            </div>

            <div className="mt-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
              <p className="flex items-center gap-gutter-xs font-label text-label-sm text-cacao uppercase">
                <ICONS.seal className="h-4 w-4 text-terracotta" />
                {delivery.instructionsLabel}
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant italic">
                “{delivery.instructions}”
              </p>
            </div>
          </section>

          <section className="rounded border border-rule/70 bg-surface p-gutter-md">
            <h2 className="flex items-center gap-gutter-xs text-headline-sm text-cacao">
              <ICONS.board className="h-5 w-5 text-terracotta" />
              {notes.title}
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">{notes.body}</p>

            {/* Read-only: there is nowhere to save a note to. */}
            <p className="mt-gutter-md rounded border border-rule/70 bg-surface-container-low p-gutter-sm text-body-sm text-cacao">
              {notes.existing}
            </p>

            <div className="mt-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm">
              <p className="text-body-sm text-nutmeg">{notes.saved}</p>
              <Button variant="secondary" disabled>
                {notes.cta}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
