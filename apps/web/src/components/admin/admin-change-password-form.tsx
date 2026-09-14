"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { SETTINGS_ACCESS } from "@/content/admin-settings";
import {
  adminChangePasswordSchema,
  type AdminChangePasswordValues,
} from "@/lib/admin/password-reset-schema";
import { adminChangePassword } from "@/lib/api/admin";
import { ApiError } from "@/lib/api";

export function AdminChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminChangePasswordValues>({
    resolver: standardSchemaResolver(adminChangePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onValid = async (values: AdminChangePasswordValues) => {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccess(false);
    try {
      await adminChangePassword(values);
      setSuccess(true);
      reset();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const serverMessage =
          error.body &&
          typeof error.body === "object" &&
          "error" in error.body &&
          typeof error.body.error === "string"
            ? error.body.error
            : null;
        setErrorMessage(
          serverMessage === "Not signed in."
            ? serverMessage
            : SETTINGS_ACCESS.wrongCurrent,
        );
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorMessage("Too many attempts. Please try again later.");
      } else if (error instanceof ApiError && error.status === 503) {
        setErrorMessage("Password change is not connected yet.");
      } else {
        setErrorMessage(SETTINGS_ACCESS.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentId = `${formId}-current`;
  const newId = `${formId}-new`;
  const confirmId = `${formId}-confirm`;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="mt-gutter-sm grid max-w-md gap-gutter-sm">
      <div>
        <label
          htmlFor={currentId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {SETTINGS_ACCESS.currentPasswordLabel}
        </label>
        <input
          id={currentId}
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          className={inputClasses(Boolean(errors.currentPassword))}
          {...register("currentPassword")}
        />
        {errors.currentPassword?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={newId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {SETTINGS_ACCESS.newPasswordLabel}
        </label>
        <input
          id={newId}
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          className={inputClasses(Boolean(errors.password))}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.password.message}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={confirmId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {SETTINGS_ACCESS.confirmPasswordLabel}
        </label>
        <input
          id={confirmId}
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClasses(Boolean(errors.confirmPassword))}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" variant="secondary" disabled={submitting} className="w-fit normal-case">
        {submitting ? "Updating…" : SETTINGS_ACCESS.submitLabel}
      </Button>

      <p aria-live="polite" className="text-body-sm">
        {errorMessage ? (
          <span className="block rounded border border-error/40 bg-error/10 p-gutter-sm text-error">
            {errorMessage}
          </span>
        ) : null}
        {success ? (
          <span className="block rounded border border-rule/70 bg-surface-container-low p-gutter-sm text-cacao">
            {SETTINGS_ACCESS.success}
          </span>
        ) : null}
      </p>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );
