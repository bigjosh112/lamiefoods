import { BRAND, DELIVERY, ROUTES } from "@lamiefoods/config";
import type { Order, OrderStatus, Product } from "@lamiefoods/types";
import { cn } from "@lamiefoods/ui";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { ORDER_SUCCESS } from "@/content/order-success";
import { formatKobo } from "@/lib/money";

/**
 * Order confirmation, rendered from an `Order`.
 *
 * Presentational and server-rendered: it takes the order as a prop rather than
 * fetching, so it works unchanged whether the order comes from the sample or,
 * later, from the API.
 *
 * Departures from the mock, all because the claim would be false:
 *   - No payment authorisation token. There is no transaction to reference.
 *   - No "download receipt (PDF)" — nothing generates a receipt, so the control
 *     is disabled rather than dangling.
 *   - No "SMS & WhatsApp alerts synced" or "photo updates" — no notification
 *     system exists to make those promises on behalf of.
 *   - No "10% off next batch" — that is a discount the owner has never offered.
 */

/** The four customer-visible stages, mapped from the domain status. */
const STAGES: { label: string; statuses: OrderStatus[] }[] = [
  { label: "Placed", statuses: ["paid", "processing", "shipped", "delivered"] },
  { label: "Kitchen fired", statuses: ["processing", "shipped", "delivered"] },
  { label: "Dispatched", statuses: ["shipped", "delivered"] },
  { label: "Delivered", statuses: ["delivered"] },
];

export function OrderConfirmation({
  order,
  products = [],
}: {
  order: Order;
  /** For the per-item photo lookup below — a live product's current image,
   *  not part of the frozen `OrderItem` itself. Optional: an order still
   *  renders correctly (just without photos) if the caller has none handy. */
  products?: Product[];
}) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const { deliveryAddress } = order.customer;

  return (
    <div className="grid gap-gutter-lg md:grid-cols-12">
      <section className="rounded border border-rule/70 bg-surface-container-low p-inset-card md:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-gutter-sm">
          <div>
            <p className="font-label text-label-sm text-nutmeg uppercase">
              {ORDER_SUCCESS.referenceLabel}
            </p>
            <p className="mt-1 font-display text-headline-md text-terracotta">
              #{order.reference}
            </p>
            <p className="mt-1 text-body-sm text-nutmeg">
              <time dateTime={order.createdAt}>
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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
            {order.paymentStatus === "paid"
              ? order.paymentMethod === "paystack"
                ? "Paid via Paystack"
                : "Payment confirmed"
              : order.paymentMethod === "paystack"
                ? "Awaiting payment"
                : "Awaiting bank transfer"}
          </span>
        </div>

        <div className="mt-gutter-md border-t border-rule/70 pt-gutter-sm">
          <p className="font-label text-label-sm text-nutmeg uppercase">
            {ORDER_SUCCESS.itemsLabel} ({itemCount})
          </p>

          <ul className="mt-gutter-sm space-y-3">
            {order.items.map((item) => {
              const product = products.find((candidate) => candidate.slug === item.slug);
              const hero =
                product?.images.find((image) => image.role === "hero") ??
                product?.images[0];
              return (
                <li
                  key={`${item.slug}-${item.unitPrice.amount}`}
                  className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-xs"
                >
                  {hero && (
                    <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                      <ImageSlot
                        slot={{ src: hero.url, alt: hero.alt || item.name, note: "" }}
                        sizes="56px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-gutter-xs">
                      <p className="text-body-md font-semibold text-cacao">{item.name}</p>
                      <p className="shrink-0 font-label text-label-md text-terracotta">
                        {formatKobo(item.lineTotal.amount)}
                      </p>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatKobo(item.unitPrice.amount)} × {item.quantity}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <dl className="mt-gutter-md space-y-3 border-t border-rule/70 pt-gutter-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-body-sm text-on-surface-variant">
              Subtotal ({itemCount})
            </dt>
            <dd className="font-label text-label-md text-cacao">
              {formatKobo(order.subtotal.amount)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-gutter-sm">
            <dt className="text-body-sm text-on-surface-variant">Delivery</dt>
            <dd className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
              {order.deliveryFee !== null
                ? formatKobo(order.deliveryFee.amount)
                : ORDER_SUCCESS.deliveryPending}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-body-sm text-on-surface-variant">Packaging &amp; seal</dt>
            <dd className="font-label text-label-md text-cacao">{formatKobo(0)}</dd>
          </div>
        </dl>

        <div className="mt-gutter-md flex items-baseline justify-between border-t border-rule/70 pt-gutter-sm">
          <span className="text-headline-sm text-cacao">{ORDER_SUCCESS.totalLabel}</span>
          <span className="font-display text-headline-md text-terracotta">
            {/* Total is only known once delivery is quoted — see @lamiefoods/types
                Order.total. Showing the subtotal as if it were final would
                understate what the customer will actually be asked to pay. */}
            {order.total !== null
              ? formatKobo(order.total.amount)
              : `${formatKobo(order.subtotal.amount)} + delivery`}
          </span>
        </div>

        <div className="mt-gutter-md flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm">
          <ICONS.seal className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <div>
            <p className="font-label text-label-sm text-cacao uppercase">
              {ORDER_SUCCESS.guarantee.title}
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {ORDER_SUCCESS.guarantee.body}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-gutter-md md:col-span-5">
        <section className="rounded border border-rule/70 bg-surface-container-low p-inset-card">
          <p className="flex items-center gap-gutter-xs font-label text-label-sm text-nutmeg uppercase">
            <ICONS.truck className="h-4 w-4 text-terracotta" />
            {ORDER_SUCCESS.dispatchLabel}
          </p>

          <address className="mt-gutter-sm not-italic">
            <p className="text-headline-sm text-cacao">{order.customer.fullName}</p>
            <p className="text-body-sm text-on-surface-variant">{order.customer.phone}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {deliveryAddress.addressLine}
              <br />
              {deliveryAddress.city}, {deliveryAddress.state}
            </p>
            <p className="text-body-sm text-nutmeg">
              Landmark: {deliveryAddress.landmark}
            </p>
          </address>

          <div className="mt-gutter-md flex items-baseline justify-between gap-gutter-sm border-t border-rule/70 pt-gutter-sm">
            <span className="font-label text-label-sm text-nutmeg uppercase">
              {ORDER_SUCCESS.etaLabel}
            </span>
            <span className="shrink-0 font-label text-label-md text-cacao">
              {DELIVERY.minDays}–{DELIVERY.maxDays} business days
            </span>
          </div>

          {/*
            Progress is derived from the order's own status, never hardcoded.

            Two-up on phones: four columns left roughly 68px per stage, which
            is not enough for a label like "Out for delivery" at any legible
            size.
          */}
          <ol className="mt-gutter-md grid grid-cols-2 gap-gutter-xs sm:grid-cols-4">
            {STAGES.map((stage) => {
              const done = stage.statuses.includes(order.status);
              return (
                <li key={stage.label}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-1 rounded-sm",
                      done ? "bg-terracotta" : "bg-rule/50",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1 block font-label text-label-caps uppercase",
                      done ? "text-cacao" : "text-nutmeg/70",
                    )}
                  >
                    {stage.label}
                    <span className="sr-only">{done ? " — complete" : " — pending"}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded bg-cacao p-inset-card text-linen">
          <p className="flex items-center gap-gutter-xs font-label text-label-sm text-tertiary-fixed-dim uppercase">
            <ICONS.mail className="h-4 w-4" />
            {ORDER_SUCCESS.tracking.title}
          </p>
          <p className="mt-gutter-sm text-body-sm text-linen/75">
            {ORDER_SUCCESS.tracking.body}
          </p>

          <div className="mt-gutter-md border-t border-linen/15 pt-gutter-sm">
            <p className="font-label text-label-sm text-linen/60 uppercase">
              {ORDER_SUCCESS.tracking.helpTitle}
            </p>
            <p className="mt-1 text-body-sm text-linen/75">
              Reach us on Instagram at{" "}
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tertiary-fixed-dim underline underline-offset-4"
              >
                {BRAND.instagramHandle}
              </a>
              .
            </p>
          </div>

          <div className="mt-gutter-md grid gap-gutter-xs">
            <ButtonLink href={ROUTES.shop}>
              {ORDER_SUCCESS.continueCta}
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            {/* Nothing generates a receipt yet, so this is honestly unavailable
                rather than a button that downloads nothing. */}
            <Button variant="inverted" disabled aria-describedby="receipt-note">
              {ORDER_SUCCESS.receiptCta}
            </Button>
            <p id="receipt-note" className="text-body-sm text-linen/60">
              {ORDER_SUCCESS.receiptNote}
            </p>
          </div>
        </section>

        <section className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container p-gutter-sm">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <p className="text-body-sm text-on-surface-variant">
            <span className="font-semibold text-cacao">
              {ORDER_SUCCESS.community.title}
            </span>{" "}
            {ORDER_SUCCESS.community.body}
          </p>
        </section>
      </div>
    </div>
  );
}
