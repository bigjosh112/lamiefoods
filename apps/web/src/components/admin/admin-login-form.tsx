"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, EyeIcon, ICONS } from "@/components/ui/icons";
import { ADMIN_LOGIN } from "@/content/admin";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/admin/login-schema";

/**
 * Admin sign-in form.
 *
 * Validation is real. Authentication is not, and the form says so: there is no
 * auth backend, so a valid submit reports that plainly instead of pretending a
 * session was created. Faking a signed-in state would be the worst possible
 * outcome here — an operator could believe the admin area is protected when
 * nothing guards it.
 *
 * Credential handling, for whoever wires this up:
 *   - The password lives in form state for the lifetime of the component and
 *     nowhere else. It is never logged, never put in a store, never persisted.
 *   - When this is connected, the session belongs in an **httpOnly cookie set
 *     by the backend**, not in localStorage — a token in localStorage is
 *     readable by any script that reaches the page. If the backend forces a
 *     token into JS-readable storage, record it as a gap rather than hiding it.
 *   - `autoComplete` is set so password managers work; blocking them pushes
 *     staff toward weaker, memorable passwords.
 */
export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: standardSchemaResolver(adminLoginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: false },
  });

  const onValid = () => {
    // Where the credential check would go. Nothing is sent, nothing is stored,
    // and no session exists — see docs/ai-memory/api-integration.md.
    setBlocked(true);
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {ADMIN_LOGIN.submitLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Button>

      {/* Announced — submitting does not move focus. */}
      <p aria-live="polite" className="text-body-sm text-on-surface-variant">
        {blocked && (
          <span className="block rounded border border-rule/70 bg-surface-container p-gutter-sm">
            {ADMIN_LOGIN.blocked}
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
