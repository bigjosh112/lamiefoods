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
    <main className="py-3xl mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-margin">
      <h1 className="text-headline-lg text-primary">Something went wrong</h1>
      <p className="mt-md text-body-md text-on-surface-variant">
        Please try again. If the problem continues, refresh the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-xl px-lg text-label-lg inline-flex min-h-11 w-fit items-center rounded bg-primary-container text-on-primary transition-colors hover:bg-primary"
      >
        Try again
      </button>
    </main>
  );
}
