"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, EyeIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_RESET_PASSWORD } from "@/content/admin";
import {
  adminResetPasswordSchema,
  type AdminResetPasswordValues,
} from "@/lib/admin/password-reset-schema";
import { adminResetPassword } from "@/lib/api/admin";
import { ApiError } from "@/lib/api";

export function AdminResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formId = useId();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminResetPasswordValues>({
    resolver: standardSchemaResolver(adminResetPasswordSchema),
    mode: "onTouched",
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onValid = async (values: AdminResetPasswordValues) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await adminResetPassword(values);
      setSuccess(true);
      setTimeout(() => router.push(ADMIN_ROUTES.login), 1200);
    } catch (error) {
      if (error instanceof ApiError && error.status === 503) {
        setErrorMessage(ADMIN_RESET_PASSWORD.notConfiguredError);
      } else if (error instanceof ApiError && error.status === 400) {
        const serverMessage =
          error.body &&
          typeof error.body === "object" &&
          "error" in error.body &&
          typeof error.body.error === "string"
            ? error.body.error
            : null;
        setErrorMessage(serverMessage ?? ADMIN_RESET_PASSWORD.genericError);
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorMessage("Too many attempts. Please try again later.");
      } else {
        setErrorMessage(ADMIN_RESET_PASSWORD.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  if (success) {
    return (
      <p className="rounded border border-rule/70 bg-surface p-gutter-sm text-body-sm text-cacao">
        {ADMIN_RESET_PASSWORD.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-gutter-md">
      <input type="hidden" {...register("token")} />

      <div>
        <label
          htmlFor={passwordId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {ADMIN_RESET_PASSWORD.passwordLabel}
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 mt-1 flex items-center pl-3 text-nutmeg"
          >
            <ICONS.shield className="h-4 w-4" />
          </span>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            className={cn(inputClasses(Boolean(errors.password)), "px-10")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 mt-1 flex items-center px-3 text-nutmeg transition-colors hover:text-cacao"
          >
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
        {errors.password?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.password.message}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={confirmId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {ADMIN_RESET_PASSWORD.confirmLabel}
        </label>
        <input
          id={confirmId}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClasses(Boolean(errors.confirmPassword))}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message ? (
          <p className="mt-1 text-body-sm text-error">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Updating…" : ADMIN_RESET_PASSWORD.submitLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Button>

      <p aria-live="polite" className="text-body-sm text-on-surface-variant">
        {errorMessage && (
          <span className="block rounded border border-error/40 bg-error/10 p-gutter-sm text-error">
            {errorMessage}
          </span>
        )}
      </p>

      <p className="text-center text-body-sm">
        <Link
          href={ADMIN_ROUTES.login}
          className="text-terracotta underline underline-offset-4 hover:text-cacao"
        >
          {ADMIN_RESET_PASSWORD.backLabel}
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
