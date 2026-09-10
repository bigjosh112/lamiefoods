"use client";

import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, ICONS } from "@/components/ui/icons";
import { ImageSlot } from "@/components/ui/image-slot";
import { CART } from "@/content/cart";
import { formatKobo } from "@/lib/money";
import { MAX_QUANTITY, useCart, useCartActions } from "@/lib/cart/use-cart";
import { CartUnavailableNotice } from "@/components/cart/cart-unavailable-notice";

export function CartView() {
  const { items, count, subtotal, isEmpty } = useCart();
  const { removeLine, setQuantity } = useCartActions();

  if (isEmpty) {
    return (
      <>
        <CartUnavailableNotice />
        <EmptyBag />
      </>
    );
  }

  return (
    <>
      <CartUnavailableNotice />
      <div className="grid gap-gutter-lg lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="hidden border-b border-rule/70 pb-2 font-label text-label-sm text-nutmeg uppercase lg:grid lg:grid-cols-12">
            <span className="col-span-6">Artisanal selection</span>
            <span className="col-span-2">Unit price</span>
            <span className="col-span-2">Quantity</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          <ul>
            {items.map(({ line, product, listUnitPrice, unitPrice, lineTotal }) => {
              const hero =
                product.images.find((image) => image.role === "hero") ??
                product.images[0];
              const discounted = unitPrice !== listUnitPrice;
              return (
                <li
                  key={`${line.slug}-${line.pack}`}
                  className="mt-gutter-sm grid items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm lg:grid-cols-12"
                >
                  <div className="flex items-start gap-gutter-sm lg:col-span-6">
                    <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded border border-rule/70 bg-surface-container">
                      <ImageSlot
                        slot={{
                          src: hero?.url ?? null,
                          alt: hero?.alt ?? product.name,
                          note: "Product photography",
                        }}
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-headline-sm text-cacao">
                        <Link
                          href={ROUTES.product(product.slug)}
                          className="transition-colors hover:text-terracotta"
                        >
                          {product.name}
                        </Link>
                      </h2>
                      <p className="text-body-sm text-on-surface-variant">
                        Size: {line.pack}
                      </p>
                      {product.discountPercent ? (
                        <p className="mt-1 font-label text-label-sm text-terracotta uppercase">
                          {product.discountPercent}% off
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="font-numeral text-label-md text-on-surface-variant lg:col-span-2">
                    <span className="font-body text-nutmeg lg:hidden">Unit price: </span>
                    {discounted ? (
                      <>
                        <span className="mr-1 text-nutmeg line-through">
                          {formatKobo(listUnitPrice)}
                        </span>
                        <span className="text-terracotta">{formatKobo(unitPrice)}</span>
                      </>
                    ) : (
                      formatKobo(unitPrice)
                    )}
                  </p>

                  <div className="lg:col-span-2">
                    <QuantityStepper
                      label={`${product.name}, ${line.pack}`}
                      quantity={line.quantity}
                      onChange={(next) => setQuantity(line.slug, line.pack, next)}
                    />
                  </div>

                  <div className="lg:col-span-2 lg:text-right">
                    <p className="font-numeral text-label-md text-terracotta">
                      {formatKobo(lineTotal)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(line.slug, line.pack)}
                      className="mt-1 inline-flex min-h-9 items-center text-body-sm text-nutmeg transition-colors hover:text-error"
                    >
                      Remove
                      <span className="sr-only">
                        {" "}
                        {product.name}, {line.pack}, from bag
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <ul className="mt-gutter-md grid gap-gutter-xs sm:grid-cols-3">
            {CART.assurances.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-gutter-xs rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <div>
                    <p className="text-body-sm font-semibold text-cacao">{item.title}</p>
                    <p className="text-body-sm text-nutmeg">{item.note}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <OrderSummary count={count} subtotal={subtotal} />
      </div>
    </>
  );
}

function OrderSummary({ count, subtotal }: { count: number; subtotal: number }) {
  return (
    <aside className="lg:col-span-4">
      <div className="rounded border border-rule/70 bg-surface-container p-inset-card">
        <div className="flex items-center justify-between gap-gutter-sm">
          <h2 className="text-headline-sm text-cacao">Order Summary</h2>
          <span className="rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed uppercase">
            Pre-checkout
          </span>
        </div>

        <dl className="mt-gutter-md space-y-3">
          <Row label={`Subtotal (${count} ${count === 1 ? "item" : "items"})`}>
            {formatKobo(subtotal)}
          </Row>
          <Row label="Estimated delivery" note={CART.summary.deliveryNote}>
            <span className="font-label text-label-sm text-nutmeg uppercase">
              Calculated at checkout
            </span>
          </Row>
          <Row label="Packaging &amp; seal" note="Complimentary">
            {formatKobo(0)}
          </Row>
        </dl>

        <div className="mt-gutter-md border-t border-rule/70 pt-gutter-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-headline-sm text-cacao">Estimated total</span>
            <span className="font-display text-headline-md text-terracotta">
              {formatKobo(subtotal)}
            </span>
          </div>
          <p className="mt-1 text-right text-body-sm text-nutmeg">
            {CART.summary.totalNote}
          </p>
        </div>

        <ButtonLink href={ROUTES.checkout} className="mt-gutter-md w-full">
          Proceed to checkout
          <ArrowRightIcon className="h-4 w-4" />
        </ButtonLink>

        <Link
          href={ROUTES.shop}
          className="mt-gutter-xs flex min-h-11 items-center justify-center text-body-sm text-cacao transition-colors hover:text-terracotta"
        >
          Continue shopping
        </Link>

        <ul className="mt-gutter-sm flex flex-wrap justify-center gap-gutter-xs border-t border-rule/70 pt-gutter-sm">
          {CART.summary.badges.map((badge) => (
            <li
              key={badge}
              className="flex items-center gap-gutter-xs text-body-sm text-nutmeg"
            >
              <CheckIcon className="h-3.5 w-3.5 text-terracotta" />
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Row({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-gutter-sm">
      <dt className="text-body-sm text-on-surface-variant">
        {label}
        {note && <span className="block text-body-sm text-nutmeg">{note}</span>}
      </dt>
      <dd className="shrink-0 text-right font-numeral text-label-md text-cacao">
        {children}
      </dd>
    </div>
  );
}

function QuantityStepper({
  label,
  quantity,
  onChange,
}: {
  label: string;
  quantity: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded border border-rule">
      <StepButton
        label={`Decrease quantity of ${label}`}
        onClick={() => onChange(quantity - 1)}
      >
        &minus;
      </StepButton>
      <span
        aria-live="polite"
        aria-label={`Quantity of ${label}`}
        className="w-8 text-center font-label text-label-md text-cacao"
      >
        {quantity}
      </span>
      <StepButton
        label={`Increase quantity of ${label}`}
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </StepButton>
    </div>
  );
}

function StepButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center text-cacao transition-colors hover:bg-surface-container",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

/** Shown when the bag is empty — a real state, not a demo toggle. */
function EmptyBag() {
  return (
    <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
      <ICONS.gift className="mx-auto h-8 w-8 text-terracotta" />
      <h2 className="mt-gutter-sm text-headline-md text-cacao">{CART.empty.title}</h2>
      <p className="mx-auto mt-gutter-xs max-w-md text-body-md text-on-surface-variant">
        {CART.empty.body}
      </p>
      <ButtonLink href={ROUTES.shop} className="mt-gutter-md">
        {CART.empty.cta}
        <ArrowRightIcon className="h-4 w-4" />
      </ButtonLink>
    </div>
  );
}
