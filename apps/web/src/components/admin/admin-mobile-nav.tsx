"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND, ROUTES } from "@lamiefoods/config";
import { CloseIcon, ICONS, MenuIcon } from "@/components/ui/icons";
import { AdminNav } from "./admin-nav";
import { SignOutButton } from "./sign-out-button";

/**
 * Off-canvas admin navigation, below `lg`.
 *
 * The sidebar used to stay in the document on small screens as a horizontal
 * scroller, which put six nav items, a logo, a status pill, a store link, a
 * bell, "Signed in" and a sign-out button into 375px of width — they wrapped
 * and collided. A drawer gives the nav a full-width column to itself.
 *
 * Everything crowded out of the mobile top bar lives in here rather than being
 * dropped: the store link and the signed-in/sign-out controls sit under the
 * nav, so nothing is unreachable on a phone.
 *
 * The panel behaves like a dialog: Escape closes it, an outside tap closes it,
 * navigating closes it, background scroll is locked while it is open, and focus
 * returns to the toggle afterwards.
 */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Closing on navigation is done here rather than in an effect on `pathname`
  // so it is a direct consequence of the click, not a re-render side effect.
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-cacao transition-colors hover:bg-surface-container"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {/* Scrim. Sits under the panel and above the page, so a tap anywhere
          outside reads as "close" without needing a listener on every child. */}
      {open && (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-cacao/40 lg:hidden" />
      )}

      <div
        id="admin-mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-rule/70 bg-surface lg:hidden"
      >
        <div className="flex shrink-0 items-center justify-between gap-gutter-xs border-b border-rule/70 p-gutter-sm">
          <Link
            href={ROUTES.home}
            onClick={close}
            className="flex items-center gap-gutter-xs"
          >
            <Image
              src="/Lamie Foods - Logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-display text-headline-sm leading-none text-cacao">
              {BRAND.displayName}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              toggleRef.current?.focus();
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-cacao transition-colors hover:bg-surface-container"
          >
            <span className="sr-only">Close menu</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* `key` remounts the nav on navigation so the drawer never shows a
            stale active item if it is reopened before a re-render. */}
        <nav
          aria-label="Admin sections"
          className="min-h-0 flex-1 overflow-y-auto p-gutter-xs"
          onClick={close}
        >
          <AdminNav key={pathname} />
        </nav>

        <div className="shrink-0 space-y-2 border-t border-rule/70 p-gutter-xs">
          <Link
            href={ROUTES.home}
            onClick={close}
            className="flex min-h-11 items-center gap-gutter-xs rounded-md px-gutter-sm text-body-sm text-on-surface-variant transition-colors hover:text-terracotta"
          >
            <ICONS.box className="h-4 w-4 shrink-0" />
            View live store
          </Link>

          <div className="flex items-center gap-gutter-sm rounded-md border border-rule/70 bg-surface-container-low p-gutter-sm">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-linen"
            >
              <ICONS.people className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-body-sm leading-tight font-semibold text-cacao">
              Signed in
            </span>
            <SignOutButton
              iconOnly
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-nutmeg transition-colors hover:text-error"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
