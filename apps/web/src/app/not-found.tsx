import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-(--spacing-gutter) py-(--spacing-fluid-lg)">
      <h1 className="text-fluid-3xl font-semibold">Page not found</h1>
      <p className="mt-(--spacing-fluid-sm) text-fluid-base text-ink-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-(--spacing-fluid-md) inline-flex min-h-11 items-center text-fluid-base font-medium text-accent underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
