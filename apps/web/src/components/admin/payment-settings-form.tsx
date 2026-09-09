"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import type { PaymentSettings } from "@lamiefoods/config";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import {
  fromSettings,
  settingsSchema,
  toSettingsInput,
  type SettingsFormValues,
} from "@/lib/admin/settings-schema";
import { updateSettings } from "@/lib/api/admin-settings";
import { ApiError } from "@/lib/api";

/**
 * The WhatsApp number and bank-transfer details, editable — the first
 * genuinely admin-writable setting in this app. Everything else on
 * `/admin/settings` stays read-only, so this form is self-contained with its
 * own Save button rather than the page's disabled global one.
 *
 * Same shape as `product-form.tsx`: `react-hook-form` +
 * `standardSchemaResolver`, re-validated server-side by the exact same
 * `settingsSchema` (the browser check is a convenience, not a control).
 */
export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: standardSchemaResolver(settingsSchema),
    mode: "onTouched",
    defaultValues: fromSettings(settings),
  });

  const onValid = async (values: SettingsFormValues) => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const parsed = settingsSchema.parse(values);
      await updateSettings(toSettingsInput(parsed));
      setSaved(true);
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? "Could not save settings — please try again."
          : "Something went wrong — please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="mt-gutter-sm">
      <div className="grid gap-gutter-sm sm:grid-cols-2">
        <Field
          id={`${formId}-whatsapp`}
          label="WhatsApp number"
          error={errors.whatsappNumber?.message}
          placeholder="2347059721857"
          inputMode="numeric"
          {...register("whatsappNumber")}
        />
        <p className="-mt-gutter-xs text-body-sm text-nutmeg sm:col-span-2">
          Digits only, with country code — no <code>+</code> or spaces (e.g.
          2347059721857, not +234 705 972 1857).
        </p>

        <Field
          id={`${formId}-bank-name`}
          label="Bank name"
          error={errors.bankName?.message}
          placeholder="e.g. GTBank"
          {...register("bankName")}
        />
        <Field
          id={`${formId}-bank-account-number`}
          label="Account number"
          error={errors.bankAccountNumber?.message}
          placeholder="0123456789"
          inputMode="numeric"
          {...register("bankAccountNumber")}
        />
        <Field
          id={`${formId}-bank-account-name`}
          label="Account name"
          error={errors.bankAccountName?.message}
          placeholder="e.g. Lamie Foods"
          {...register("bankAccountName")}
        />
      </div>

      <div aria-live="polite" className="mt-gutter-sm">
        {saveError && (
          <p className="rounded border border-error/40 bg-error/10 p-gutter-sm text-body-sm text-error">
            {saveError}
          </p>
        )}
        {!saveError && saved && (
          <p className="rounded border border-rule/70 bg-secondary-container/30 p-gutter-sm text-body-sm text-cacao">
            Saved.
          </p>
        )}
      </div>

      <Button type="submit" disabled={saving} className="mt-gutter-sm">
        <ICONS.seal className="h-4 w-4" />
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 py-2 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-body-sm text-error">{children}</p>;
}

function Field({
  id,
  label,
  error,
  ref,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
} & React.ComponentPropsWithRef<"input">) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-label text-label-caps text-nutmeg uppercase"
      >
        {label}
      </label>
      <input
        {...input}
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={inputClasses(Boolean(error))}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}
