"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { CHECKOUT, NIGERIAN_STATES } from "@/content/checkout";
import {
  checkoutSchema,
  toCustomerDetails,
  type CheckoutInput,
} from "@/lib/checkout/schema";
import { useCart } from "@/lib/cart/use-cart";

/**
 * Guest checkout form: react-hook-form driving the zod schema.
 *
 * The resolver keeps one definition of what "valid" means, shared with
 * `toCustomerDetails`, so the form can never accept something the domain type
 * would reject. Validation runs on blur and then on every change once a field
 * has failed — correcting a mistake gives immediate feedback, but you are not
 * scolded while first typing.
 *
 * Submission is deliberately NOT implemented. There is no API contract for
 * placing an order and no Paystack integration, so a valid submit says exactly
 * that rather than faking a redirect to a payment page. Inventing that flow
 * would mean guessing request shapes the backend has not defined and — far
 * worse — implying to a customer that money had moved.
 */
export function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const { isEmpty } = useCart();
  const formId = useId();

  const {
    register,
    handleSubmit,
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
    },
  });

  const onValid = (values: CheckoutInput) => {
    // Where the order would be created. The details are already shaped as
    // `CustomerDetails` from @lamiefoods/types, so nothing needs reshaping when
    // the endpoint lands — see docs/ai-memory/api-integration.md.
    void toCustomerDetails(checkoutSchema.parse(values));
    setSubmitted(true);
  };

  const fieldId = (name: keyof CheckoutInput) => `${formId}-${name}`;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-gutter-md">
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

        <div className="grid gap-gutter-sm sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor={fieldId("state")}>
              {CHECKOUT.delivery.stateLabel}
            </FieldLabel>
            <select
              id={fieldId("state")}
              autoComplete="address-level1"
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? `${fieldId("state")}-error` : undefined}
              className={inputClasses(Boolean(errors.state))}
              {...register("state")}
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <FieldError id={`${fieldId("state")}-error`}>
              {errors.state?.message}
            </FieldError>
          </div>

          <Field
            id={fieldId("city")}
            label={CHECKOUT.delivery.cityLabel}
            error={errors.city?.message}
            placeholder={CHECKOUT.delivery.cityPlaceholder}
            autoComplete="address-level2"
            {...register("city")}
          />
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

      <div>
        <Button type="submit" className="w-full" disabled={isEmpty}>
          {CHECKOUT.summary.cta}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>

        {/* Announced, not merely shown — submitting does not move focus. */}
        <div
          aria-live="polite"
          className="mt-gutter-xs text-body-sm text-on-surface-variant"
        >
          {isEmpty && <p>Your bag is empty — add something before checking out.</p>}
          {submitted && !isEmpty && (
            <p className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
              <strong className="text-cacao">Your details are valid.</strong> Payment is
              not connected yet, so no order has been placed and nothing has been charged.
              Once the ordering API and Paystack keys are in place, this button will take
              you to the payment page.
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
