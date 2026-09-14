"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_FORGOT_PASSWORD } from "@/content/admin";
import {
  adminForgotPasswordSchema,
  type AdminForgotPasswordValues,
} from "@/lib/admin/password-reset-schema";
import { adminForgotPassword } from "@/lib/api/admin";
import { ApiError } from "@/lib/api";

export function AdminForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminForgotPasswordValues>({
    resolver: standardSchemaResolver(adminForgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onValid = async (values: AdminForgotPasswordValues) => {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await adminForgotPassword(values);
      setSuccessMessage(result.message || ADMIN_FORGOT_PASSWORD.successDefault);
    } catch (error) {
      if (error instanceof ApiError && error.status === 503) {
        setErrorMessage(ADMIN_FORGOT_PASSWORD.notConfiguredError);
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorMessage("Too many attempts. Please try again later.");
      } else {
        setErrorMessage(ADMIN_FORGOT_PASSWORD.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const emailId = `${formId}-email`;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-gutter-md">
      <div>
        <label
          htmlFor={emailId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {ADMIN_FORGOT_PASSWORD.emailLabel}
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 mt-1 flex items-center pl-3 text-nutmeg"
          >
            <ICONS.mail className="h-4 w-4" />
          </span>
          <input
            id={emailId}
            type="email"
            autoComplete="username"
            placeholder={ADMIN_FORGOT_PASSWORD.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            className={cn(inputClasses(Boolean(errors.email)), "pl-10")}
            {...register("email")}
          />
        </div>
        {errors.email?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.email.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Sending…" : ADMIN_FORGOT_PASSWORD.submitLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Button>

      <p aria-live="polite" className="text-body-sm text-on-surface-variant">
        {errorMessage && (
          <span className="block rounded border border-error/40 bg-error/10 p-gutter-sm text-error">
            {errorMessage}
          </span>
        )}
        {successMessage && (
          <span className="block rounded border border-rule/70 bg-surface p-gutter-sm text-cacao">
            {successMessage}
          </span>
        )}
      </p>

      <p className="text-center text-body-sm">
        <Link
          href={ADMIN_ROUTES.login}
          className="text-terracotta underline underline-offset-4 hover:text-cacao"
        >
          {ADMIN_FORGOT_PASSWORD.backLabel}
        </Link>
      </p>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );
