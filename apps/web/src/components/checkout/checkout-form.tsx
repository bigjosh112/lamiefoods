"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { CHECKOUT } from "@/content/checkout";
import {
  checkoutSchema,
  toCustomerDetails,
  type CheckoutInput,
} from "@/lib/checkout/schema";
import { useCheckoutDelivery } from "@/lib/checkout/delivery-context";
import { useCart, useCartActions } from "@/lib/cart/use-cart";
import { createOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api";
import { formatKobo } from "@/lib/money";
import { ROUTES } from "@lamiefoods/config";
import { CartUnavailableNotice } from "@/components/cart/cart-unavailable-notice";

type SubmitStatus = "idle" | "submitting" | "error" | "success";

function messageForCheckoutFailure(error: unknown): string {
  const chargedNote = "Nothing has been charged — please try again.";

  if (!(error instanceof ApiError)) {
    return `Something went wrong. ${chargedNote}`;
  }

  const serverMessage =
    error.body &&
    typeof error.body === "object" &&
    "error" in error.body &&
    typeof error.body.error === "string"
      ? error.body.error.trim()
      : null;

  if (error.status === 409) {
    const base =
      serverMessage ?? "One or more items in your bag are no longer available.";
    return `${base} Clear your bag and add products from the shop again. ${chargedNote}`;
  }

  if (serverMessage) {
    return `${serverMessage} ${chargedNote}`;
  }

  if (error.status === 429) {
    return `Too many orders from this connection. Please wait a moment, then try again. ${chargedNote}`;
  }

  if (error.status === 503) {
    return `Ordering is not connected yet. ${chargedNote}`;
  }

  return `We could not save your order. ${chargedNote}`;
}

/**
 * Guest checkout form: react-hook-form driving the zod schema, then a real
 * order submission — no account is created or required (Q12/Q13).
 *
 * The resolver keeps one definition of what "valid" means, shared with
 * `toCustomerDetails`, so the form can never accept something the domain type
 * would reject. Validation runs on blur and then on every change once a field
 * has failed — correcting a mistake gives immediate feedback, but you are not
 * scolded while first typing.
 *
 * Payment itself happens on `/order-success`. This form's only job is
 * "create the order, redirect." All four required UI states are here —
 * loading, error with retry, empty, success — per
 * `docs/ai-memory/api-integration.md`.
 */
export function CheckoutForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isEmpty, items } = useCart();
  const { clearCart } = useCartActions();
  const { areas, setSelectedAreaId } = useCheckoutDelivery();
  const router = useRouter();
  const formId = useId();

  const lagosAreas = areas.filter((area) => area.region === "lagos");
  const interstateAreas = areas.filter((area) => area.region === "interstate");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: standardSchemaResolver(checkoutSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      fullName: "",
      addressLine: "",
      landmark: "",
      state: "",
      city: "",
      deliveryAreaId: "",
    },
  });

  const onValid = async (values: CheckoutInput) => {
    if (isEmpty) return;

    const parsed = checkoutSchema.parse(values);
    const customer = toCustomerDetails(parsed);
    setStatus("submitting");
    setErrorMessage(null);

    try {
      // Only catalogue-valid lines — never raw localStorage entries for
      // deleted/unpublished products (those caused opaque 409s at Place Order).
      const orderLines = items.map(({ line }) => line);
      const { token } = await createOrder(
        customer,
        orderLines,
        parsed.deliveryAreaId,
      );
      // Cleared only on confirmed success — a failed submit must leave the bag
      // intact so the customer is not asked to rebuild it.
      clearCart();
      setStatus("success");
      router.push(`${ROUTES.orderSuccess}?token=${encodeURIComponent(token)}`);
    } catch (error) {
      setStatus("error");
      setErrorMessage(messageForCheckoutFailure(error));
    }
  };

  const fieldId = (name: keyof CheckoutInput) => `${formId}-${name}`;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-gutter-md">
      <CartUnavailableNotice />
      <Fieldset index={1} step={CHECKOUT.contact.step} title={CHECKOUT.contact.title}>
        <Field
          id={fieldId("email")}
          label={CHECKOUT.contact.emailLabel}
          help={CHECKOUT.contact.emailHelp}
          error={errors.email?.message}
          placeholder={CHECKOUT.contact.emailPlaceholder}
          type="email"
          autoComplete="email"
          {...register("email")}
        />

        <Field
          id={fieldId("phone")}
          label={CHECKOUT.contact.phoneLabel}
          help={CHECKOUT.contact.phoneHelp}
          error={errors.phone?.message}
          placeholder={CHECKOUT.contact.phonePlaceholder}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+234"
          {...register("phone")}
        />
      </Fieldset>

      <Fieldset index={2} step={CHECKOUT.delivery.step} title={CHECKOUT.delivery.title}>
        <Field
          id={fieldId("fullName")}
          label={CHECKOUT.delivery.nameLabel}
          error={errors.fullName?.message}
          placeholder={CHECKOUT.delivery.namePlaceholder}
          autoComplete="name"
          {...register("fullName")}
        />

        <Field
          id={fieldId("addressLine")}
          label={CHECKOUT.delivery.addressLabel}
          error={errors.addressLine?.message}
          placeholder={CHECKOUT.delivery.addressPlaceholder}
          autoComplete="street-address"
          {...register("addressLine")}
        />

        <Field
          id={fieldId("landmark")}
          label={CHECKOUT.delivery.landmarkLabel}
          help={CHECKOUT.delivery.landmarkHelp}
          error={errors.landmark?.message}
          placeholder={CHECKOUT.delivery.landmarkPlaceholder}
          {...register("landmark")}
        />

        <div>
          <FieldLabel htmlFor={fieldId("deliveryAreaId")}>
            {CHECKOUT.delivery.areaLabel}
          </FieldLabel>
          <select
            id={fieldId("deliveryAreaId")}
            aria-invalid={Boolean(errors.deliveryAreaId)}
            aria-describedby={
              errors.deliveryAreaId
                ? `${fieldId("deliveryAreaId")}-error`
                : `${fieldId("deliveryAreaId")}-help`
            }
            className={inputClasses(Boolean(errors.deliveryAreaId))}
            {...register("deliveryAreaId", {
              onChange: (event) => {
                const id = event.target.value as string;
                setSelectedAreaId(id);
                const area = areas.find((entry) => entry.id === id);
                setValue("city", area?.name ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue("state", area?.state ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              },
            })}
          >
            <option value="">{CHECKOUT.delivery.areaPlaceholder}</option>
            {lagosAreas.length > 0 && (
              <optgroup label="Lagos">
                {lagosAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} — {formatKobo(area.feeKobo)}
                  </option>
                ))}
              </optgroup>
            )}
            {interstateAreas.length > 0 && (
              <optgroup label="Interstate">
                {interstateAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} — {formatKobo(area.feeKobo)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p
            id={`${fieldId("deliveryAreaId")}-help`}
            className="mt-1 text-body-sm text-on-surface-variant"
          >
            {CHECKOUT.delivery.areaHelp}
          </p>
          <FieldError id={`${fieldId("deliveryAreaId")}-error`}>
            {errors.deliveryAreaId?.message}
          </FieldError>
          {/* Hidden snapshots — filled from the selected area. */}
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("state")} />
        </div>

        <div className="mt-gutter-sm flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container p-gutter-sm">
          <ICONS.truck className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <div>
            <p className="font-label text-label-sm text-cacao uppercase">
              {CHECKOUT.delivery.notice.title}
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {CHECKOUT.delivery.notice.body}
            </p>
          </div>
        </div>
      </Fieldset>

      <Fieldset
        index={3}
        step={CHECKOUT.paymentMethod.step}
        title={CHECKOUT.paymentMethod.title}
      >
        <div className="rounded border border-terracotta bg-secondary-container/40 p-gutter-sm">
          <p className="font-label text-label-md text-cacao">
            {CHECKOUT.paymentMethod.paystack.label}
          </p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {CHECKOUT.paymentMethod.paystack.note}
          </p>
        </div>
      </Fieldset>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isEmpty || status === "submitting"}
        >
          {status === "submitting" ? "Placing your order…" : CHECKOUT.summary.cta}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>

        {/* Announced, not merely shown — submitting does not move focus. */}
        <div
          aria-live="polite"
          className="mt-gutter-xs text-body-sm text-on-surface-variant"
        >
          {isEmpty && <p>Your bag is empty — add something before checking out.</p>}
          {status === "error" && !isEmpty && (
            <p className="rounded border border-error/40 bg-error/10 p-gutter-sm text-error">
              <strong>{errorMessage}</strong>
            </p>
          )}
          {(status === "submitting" || status === "success") && !isEmpty && (
            <p className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
              {status === "submitting"
                ? "Saving your order…"
                : "Order saved — taking you to your confirmation."}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );

function Fieldset({
  index,
  step,
  title,
  children,
}: {
  index: number;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded border border-rule/70 bg-surface-container-low p-inset-card">
      <legend className="sr-only">{title}</legend>
      <div className="mb-gutter-md flex items-center justify-between gap-gutter-sm">
        <div className="flex items-center gap-gutter-xs">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-label text-label-sm text-linen"
          >
            {index}
          </span>
          <h2 className="text-headline-sm text-cacao">{title}</h2>
        </div>
        <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
          {step}
        </span>
      </div>
      <div className="grid gap-gutter-sm">{children}</div>
    </fieldset>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-label text-label-caps text-nutmeg uppercase"
    >
      {children}
    </label>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-body-sm text-error">
      {children}
    </p>
  );
}

/**
 * Text field. Spreads react-hook-form's `register` result, so `ref`, `name`,
 * `onChange` and `onBlur` all come from the form rather than being re-wired.
 */
function Field({
  id,
  label,
  help,
  error,
  prefix,
  ref,
  ...input
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  prefix?: string;
} & React.ComponentPropsWithRef<"input">) {
  const describedBy =
    [error ? `${id}-error` : null, help ? `${id}-help` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-0 left-0 inline-flex items-center border-r border-rule px-3 font-label text-label-md text-nutmeg"
          >
            {prefix}
          </span>
        )}
        <input
          {...input}
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(inputClasses(Boolean(error)), prefix && "pl-18")}
        />
      </div>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-body-sm text-nutmeg">
          {help}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
