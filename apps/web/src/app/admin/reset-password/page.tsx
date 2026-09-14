import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";
import { ADMIN_RESET_PASSWORD } from "@/content/admin";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const hasToken = Boolean(token && token.trim().length >= 16);

  return (
    <main
      id="main"
      className="flex min-h-dvh items-center justify-center px-margin py-section"
    >
      <div className="w-full max-w-md rounded border border-rule/70 bg-surface-container-low p-inset-card sm:p-gutter-xl">
        <div className="text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded border border-rule/70 bg-surface">
            <Image
              src="/Lamie Foods - Logo.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </span>
          <p className="mt-gutter-sm font-label text-label-caps text-terracotta uppercase">
            {ADMIN_RESET_PASSWORD.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-md text-cacao">
            {ADMIN_RESET_PASSWORD.title}
          </h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {ADMIN_RESET_PASSWORD.body}
          </p>
        </div>

        <div className="mt-gutter-md">
          {hasToken && token ? (
            <AdminResetPasswordForm token={token} />
          ) : (
            <div className="grid gap-gutter-sm">
              <p className="rounded border border-error/40 bg-error/10 p-gutter-sm text-body-sm text-error">
                {ADMIN_RESET_PASSWORD.missingToken}
              </p>
              <p className="text-center text-body-sm">
                <Link
                  href={ADMIN_ROUTES.forgotPassword}
                  className="text-terracotta underline underline-offset-4 hover:text-cacao"
                >
                  Request a new link
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
