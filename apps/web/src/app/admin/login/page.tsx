import type { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ICONS } from "@/components/ui/icons";
import { ADMIN_LOGIN } from "@/content/admin";
import { isAdminAuthConfigured } from "@/config/server-env";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin sign-in.
 *
 * The page is a Server Component; only the form is client-side. Sign-in is
 * real now (`POST /api/admin/login` — see the form), so this page also
 * checks `isAdminAuthConfigured()` to render an honest notice if the owner's
 * credential env vars aren't set yet, rather than the form failing silently.
 */
export default async function AdminLoginPage() {
  const configured = isAdminAuthConfigured();

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
          <p className="mt-gutter-sm font-label text-label-sm text-terracotta">
            {ADMIN_LOGIN.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-md text-cacao">{ADMIN_LOGIN.title}</h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {ADMIN_LOGIN.body}
          </p>
        </div>

        {/* Replaces the mock's fabricated "node terminal / handshake / enforced"
            telemetry with something true. See the note in content/admin.ts. */}
        <div className="mt-gutter-md flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm">
          <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <div>
            <p className="font-label text-label-sm text-cacao">
              {ADMIN_LOGIN.notice.title}
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {configured
                ? ADMIN_LOGIN.notice.body
                : ADMIN_LOGIN.notice.bodyNotConfigured}
            </p>
          </div>
        </div>

        <div className="mt-gutter-md">
          <AdminLoginForm />
        </div>

        <p className="mt-gutter-md border-t border-rule/70 pt-gutter-sm text-center text-body-sm text-nutmeg">
          {ADMIN_LOGIN.footerNote}
        </p>
      </div>
    </main>
  );
}
