"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. The raw error is logged rather than rendered —
 * messages can carry internal detail that should not reach customers.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-(--spacing-gutter) py-(--spacing-fluid-lg)">
      <h1 className="text-fluid-3xl font-semibold">Something went wrong</h1>
      <p className="mt-(--spacing-fluid-sm) text-fluid-base text-ink-muted">
        Please try again. If the problem continues, refresh the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-(--spacing-fluid-md) inline-flex min-h-11 w-fit items-center rounded-(--radius-card) bg-cocoa-900 px-6 font-medium text-cream-50"
      >
        Try again
      </button>
    </main>
  );
}
