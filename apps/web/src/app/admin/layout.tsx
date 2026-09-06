import type { Metadata } from "next";

/**
 * Admin shell.
 *
 * Deliberately bare — no site header, footer or announcement bar. The admin
 * area is an operator tool, not part of the shop, and sharing the storefront
 * chrome would blur that line.
 *
 * `noindex, nofollow` applies to every page beneath this layout, on top of the
 * `Disallow: /admin` already in robots.txt. Two layers because robots.txt is a
 * request, not a control: it stops well-behaved crawlers from fetching, while
 * the meta tag stops a page that leaks out some other way from being indexed.
 *
 * There is NO auth guard here, because there is no auth. Nothing behind this
 * layout may assume a signed-in user until the backend provides sessions —
 * adding a client-side "guard" would only be theatre, since anything the
 * browser can check, the browser can skip.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-surface">{children}</div>;
}
