"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND, ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import { ButtonLink } from "@/components/ui/button";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/content/landing";
import { useCart } from "@/lib/cart/use-cart";

/**
 * Site header with a mobile menu that actually works: it opens, closes on
 * navigation, closes on Escape, closes on outside click, locks background
 * scroll, and returns focus to the toggle when it closes.
 *
 * Note: the design's logo lockup sets "ENTERPRISE" under the wordmark. The
 * customer-facing brand name is "Lamie Foods", so it is omitted here.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    // Stop the page scrolling behind the open panel.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-rule/60 bg-surface/90 backdrop-blur-md">
      <div className="px-margin">
        <div className="mx-auto flex h-16 w-full max-w-(--container-page) items-center justify-between gap-gutter-md">
          <Link
            href={ROUTES.home}
            className="flex items-center gap-gutter-xs"
            aria-label={`${BRAND.displayName} — home`}
          >
            <Image
              src="/Lamie Foods - Logo.svg"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9"
            />
            <span className="font-display text-headline-sm leading-none text-cacao">
              {BRAND.displayName}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-gutter-lg">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center font-label text-label-caps uppercase transition-colors hover:text-terracotta",
                        active ? "text-terracotta" : "text-on-surface-variant",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-gutter-xs">
            {/* Real bag count. useSyncExternalStore renders 0 on the server and
                swaps in the persisted count after hydration, so no mismatch. */}
            <Link
              href={ROUTES.cart}
              aria-label={count > 0 ? `Your bag, ${count} items` : "Your bag, empty"}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded text-cacao transition-colors hover:bg-surface-container hover:text-terracotta"
            >
              <BagIcon className="h-5 w-5" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 font-label text-[10px] text-linen"
                >
                  {count}
                </span>
              )}
            </Link>

            <ButtonLink href={ROUTES.shop} className="hidden sm:inline-flex">
              Shop Chinchin
            </ButtonLink>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded text-cacao transition-colors hover:bg-surface-container lg:hidden"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              {open ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-rule/60 bg-surface px-margin pb-gutter-lg lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="border-b border-rule/40 last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center font-label text-label-md text-cacao uppercase transition-colors hover:text-terracotta"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonLink
          href={ROUTES.shop}
          onClick={() => setOpen(false)}
          className="mt-gutter-md w-full sm:hidden"
        >
          Shop Chinchin
        </ButtonLink>
      </div>
    </header>
  );
}
