import Link from "next/link";
import { ROUTES } from "@lamiefoods/config";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-margin py-3xl">
      <h1 className="text-headline-lg text-primary">Page not found</h1>
      <p className="mt-md text-body-md text-on-surface-variant">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-xl inline-flex min-h-11 items-center text-label-lg text-secondary underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
