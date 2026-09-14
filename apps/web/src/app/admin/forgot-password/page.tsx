import type { Metadata } from "next";
import Image from "next/image";
import { AdminForgotPasswordForm } from "@/components/admin/admin-forgot-password-form";
import { ADMIN_FORGOT_PASSWORD } from "@/content/admin";

export const metadata: Metadata = {
  title: "Forgot admin password",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminForgotPasswordPage() {
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
            {ADMIN_FORGOT_PASSWORD.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-md text-cacao">
            {ADMIN_FORGOT_PASSWORD.title}
          </h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {ADMIN_FORGOT_PASSWORD.body}
          </p>
        </div>

        <div className="mt-gutter-md">
          <AdminForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
