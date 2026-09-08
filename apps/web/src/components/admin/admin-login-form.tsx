"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, EyeIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_LOGIN } from "@/content/admin";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/admin/login-schema";
import { adminLogin } from "@/lib/api/admin";
import { ApiError } from "@/lib/api";

/**
 * Admin sign-in form.
 *
 * `POST /api/admin/login` sets an httpOnly session cookie on success — this
 * component never touches the cookie itself, and never stores the password
 * anywhere but transient form state for the lifetime of the component.
 *
 * The error message is identical for a wrong email and a wrong password (see
 * `login-schema.ts` and `server/admin/auth.ts`) — this form must not narrow
 * that down client-side, or the whole point of the non-specific message on
 * the server is undone.
 *
 * `autoComplete` is set so password managers work; blocking them pushes
 * staff toward weaker, memorable passwords.
 */
export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formId = useId();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: standardSchemaResolver(adminLoginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: false },
  });

  const onValid = async (values: AdminLoginValues) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await adminLogin(values);
      router.push(ADMIN_ROUTES.dashboard);
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage(ADMIN_LOGIN.invalidCredentials);
      } else if (error instanceof ApiError && error.status === 503) {
        setErrorMessage(ADMIN_LOGIN.notConfiguredError);
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorMessage("Too many attempts. Please try again later.");
      } else {
        setErrorMessage(ADMIN_LOGIN.genericError);
      }
    }
  };

  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="grid gap-gutter-md">
      <div>
        <label
          htmlFor={emailId}
          className="block font-label text-label-caps text-nutmeg uppercase"
        >
          {ADMIN_LOGIN.emailLabel}
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
            placeholder={ADMIN_LOGIN.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            className={cn(inputClasses(Boolean(errors.email)), "pl-10")}
            {...register("email")}
          />
        </div>
        <FieldError id={`${emailId}-error`}>{errors.email?.message}</FieldError>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
          <label
            htmlFor={passwordId}
            className="font-label text-label-caps text-nutmeg uppercase"
          >
            {ADMIN_LOGIN.passwordLabel}
          </label>
          {/* No reset flow exists, so this is not a link to a dead page. */}
          <span className="text-body-sm text-nutmeg">{ADMIN_LOGIN.forgotLabel}</span>
        </div>

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
            autoComplete="current-password"
            placeholder={ADMIN_LOGIN.passwordPlaceholder}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? `${passwordId}-error` : undefined}
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
        <FieldError id={`${passwordId}-error`}>{errors.password?.message}</FieldError>
      </div>

      <label className="flex items-center gap-gutter-xs text-body-sm text-on-surface-variant">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-sm border border-rule accent-terracotta"
          {...register("remember")}
        />
        {ADMIN_LOGIN.rememberLabel}
      </label>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : ADMIN_LOGIN.submitLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Button>

      {/* Announced — submitting does not move focus. */}
      <p aria-live="polite" className="text-body-sm text-on-surface-variant">
        {errorMessage && (
          <span className="block rounded border border-error/40 bg-error/10 p-gutter-sm text-error">
            {errorMessage}
          </span>
        )}
      </p>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-body-sm text-error">
      {children}
    </p>
  );
}
